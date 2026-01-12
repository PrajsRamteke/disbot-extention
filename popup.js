document.addEventListener('DOMContentLoaded', () => {
    const registrationView = document.getElementById('registrationView');
    const userView = document.getElementById('userView');
    const userNameInput = document.getElementById('userName');
    const submitNameBtn = document.getElementById('submitName');
    const displayName = document.getElementById('displayName');

    // Check if user is already registered
    function checkUserRegistration() {
        chrome.storage.local.get(['userName'], (result) => {
            if (result.userName) {
                // User is registered, show their name
                showUserView(result.userName);
            } else {
                // First-time user, show registration form
                showRegistrationView();
            }
        });
    }

    // Show registration form
    function showRegistrationView() {
        registrationView.style.display = 'block';
        userView.style.display = 'none';
        userNameInput.focus();
    }

    // Show user view with name
    function showUserView(name) {
        registrationView.style.display = 'none';
        userView.style.display = 'block';
        displayName.textContent = name;
    }

    // Handle name submission
    submitNameBtn.addEventListener('click', () => {
        const name = userNameInput.value.trim();

        if (!name) {
            alert('Please enter your name');
            return;
        }

        // Store name in localStorage
        chrome.storage.local.set({ userName: name }, () => {
            console.log('User name saved:', name);
            
            // Send registration message to background script
            chrome.runtime.sendMessage({
                type: 'register_user',
                userName: name
            });

            // Show user view
            showUserView(name);
        });
    });

    // Allow Enter key to submit
    userNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitNameBtn.click();
        }
    });

    // Initial check
    checkUserRegistration();
});