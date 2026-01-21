// Offscreen recording handler - receives MediaStream directly from background

let mediaRecorder = null;
let recordedChunks = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'start-recording-offscreen') {
        startRecording(message.streamId, message.commandId, message.tabInfo);
        sendResponse({ success: true });
        return true;
    }
});

function startRecording(streamId, commandId, tabInfo) {
    try {
        console.log('🎥 [Offscreen] Starting recording...');
        
        // Get the stream using the stream ID
        navigator.mediaDevices.getUserMedia({
            audio: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    chromeMediaSourceId: streamId
                }
            },
            video: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    chromeMediaSourceId: streamId
                }
            }
        }).then(stream => {
            recordedChunks = [];

            mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp8,opus',
                videoBitsPerSecond: 1500000
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                console.log('🎥 [Offscreen] Recording stopped, processing...');
                
                stream.getTracks().forEach(track => track.stop());

                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                console.log(`🎥 [Offscreen] Size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);

                const reader = new FileReader();
                reader.onloadend = () => {
                    chrome.runtime.sendMessage({
                        type: 'recording-data',
                        commandId: commandId,
                        video: reader.result,
                        size: blob.size,
                        tabTitle: tabInfo.title,
                        tabUrl: tabInfo.url
                    });
                };
                reader.readAsDataURL(blob);
            };

            mediaRecorder.start();
            console.log('🎥 [Offscreen] Recording for 15s...');

            setTimeout(() => {
                if (mediaRecorder && mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            }, 15000);

        }).catch(error => {
            console.error('🎥 [Offscreen] Error:', error);
            chrome.runtime.sendMessage({
                type: 'recording-error',
                commandId: commandId,
                error: error.message
            });
        });

    } catch (error) {
        console.error('🎥 [Offscreen] Error:', error);
        chrome.runtime.sendMessage({
            type: 'recording-error',
            commandId: commandId,
            error: error.message
        });
    }
}
