document.addEventListener('DOMContentLoaded', () => {
    // Color picker elements
    const colorPicker = document.getElementById('colorPicker');
    const colorWheel = document.getElementById('colorWheel');
    const hexValue = document.getElementById('hexValue');
    const rValue = document.getElementById('rValue');
    const gValue = document.getElementById('gValue');
    const bValue = document.getElementById('bValue');
    const opacitySlider = document.getElementById('opacitySlider');
    const sliderTrack = document.getElementById('sliderTrack');
    const copyButton = document.getElementById('copyButton');
    const eyedropperButton = document.getElementById('eyedropperButton');

    // Convert hex to RGB
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    // Update all color displays
    function updateColor(color) {
        colorPicker.value = color;
        const rgb = hexToRgb(color);
        
        // Update displays
        hexValue.textContent = color.substring(1).toUpperCase();
        rValue.textContent = rgb.r;
        gValue.textContent = rgb.g;
        bValue.textContent = rgb.b;
        
        // Update color wheel center
        const wheelBefore = colorWheel.querySelector('::before') || colorWheel;
        colorWheel.style.setProperty('--selected-color', color);
        
        // Update slider track gradient
        updateSliderGradient(color);
        
        // Save to storage
        chrome.storage.local.set({ 
            selectedColor: color,
            opacity: opacitySlider.value 
        });
    }

    // Update slider gradient based on current color
    function updateSliderGradient(color) {
        sliderTrack.style.background = `
            linear-gradient(to right, transparent 0%, ${color} 100%),
            repeating-conic-gradient(#e0e0e0 0% 25%, #f5f5f5 0% 50%)
        `;
        sliderTrack.style.backgroundSize = '100% 100%, 12px 12px';
    }

    // Load saved color and opacity from storage
    chrome.storage.local.get(['selectedColor', 'opacity'], (result) => {
        const color = result.selectedColor || '#667eea';
        updateColor(color);
        
        if (result.opacity !== undefined) {
            opacitySlider.value = result.opacity;
        }
    });

    // Handle color picker changes
    colorPicker.addEventListener('input', (e) => {
        updateColor(e.target.value);
    });

    // Click on color wheel to trigger color picker
    colorWheel.addEventListener('click', () => {
        colorPicker.click();
    });

    // Handle opacity slider changes
    opacitySlider.addEventListener('input', (e) => {
        chrome.storage.local.set({ opacity: e.target.value });
    });

    // Handle eyedropper button click
    eyedropperButton.addEventListener('click', async () => {
        if (!window.EyeDropper) {
            alert('⚠️ EyeDropper is not supported in this browser.\n\nPlease use Chrome 95+ or Edge 95+');
            return;
        }
        
        try {
            const eyeDropper = new EyeDropper();
            const result = await eyeDropper.open();
            
            // Update color with picked color
            updateColor(result.sRGBHex);
            
            // Visual feedback
            eyedropperButton.classList.add('active');
            setTimeout(() => {
                eyedropperButton.classList.remove('active');
            }, 500);
            
        } catch (err) {
            // User cancelled or error occurred
            if (err.name !== 'AbortError') {
                console.error('EyeDropper error:', err);
            }
        }
    });

    // Handle copy button click
    copyButton.addEventListener('click', () => {
        const color = '#' + hexValue.textContent;
        
        // Copy to clipboard
        navigator.clipboard.writeText(color).then(() => {
            // Show feedback
            const originalText = copyButton.textContent;
            copyButton.textContent = '✓ copied';
            copyButton.classList.add('copied');
            
            // Reset button after 1.5 seconds
            setTimeout(() => {
                copyButton.textContent = originalText;
                copyButton.classList.remove('copied');
            }, 1500);
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy color code');
        });
    });
});