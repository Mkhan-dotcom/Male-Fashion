// ========================
// AUTH.JS - Authentication Functionality
// ========================

// Handle login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember').checked;
    
    // Basic validation
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email', 'error');
        return;
    }
    
    // Simulate login (in real app, this would call a backend API)
    const user = {
        email: email,
        loginTime: new Date().toISOString(),
        rememberMe: rememberMe
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');
    
    showNotification('Login successful! Redirecting...');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Handle signup
function handleSignup(event) {
    event.preventDefault();
    
    const fname = document.getElementById('signup-fname').value;
    const lname = document.getElementById('signup-lname').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const terms = document.getElementById('signup-terms').checked;
    
    // Basic validation
    if (!fname || !lname || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email', 'error');
        return;
    }
    
    // Validate password strength
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Check password match
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    // Check terms
    if (!terms) {
        showNotification('Please agree to the Terms and Conditions', 'error');
        return;
    }
    
    // Create new user (in real app, this would call a backend API)
    const user = {
        firstName: fname,
        lastName: lname,
        email: email,
        registrationDate: new Date().toISOString()
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');
    
    showNotification('Account created successfully! Redirecting...');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Login with Google (placeholder)
function loginWithGoogle() {
    showNotification('Google login integration required');
    // In a real application, you would use Google's OAuth library here
}

// Login with Facebook (placeholder)
function loginWithFacebook() {
    showNotification('Facebook login integration required');
    // In a real application, you would use Facebook's SDK here
}

// Signup with Google (placeholder)
function signupWithGoogle() {
    showNotification('Google signup integration required');
}

// Signup with Facebook (placeholder)
function signupWithFacebook() {
    showNotification('Facebook signup integration required');
}

// Check if user is logged in
function isUserLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Logout user
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    showNotification('Logged out successfully');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Helper: display modal popup
function showPopup(message) {
    let modal = document.getElementById('contact-modal');
    if (!modal) return;
    const msgElem = document.getElementById('contact-modal-message');
    if (msgElem) msgElem.textContent = message;
    modal.classList.add('active');
}

// initialize modal close handler
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('contact-modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('contact-modal').classList.remove('active');
        });
    }
});

// Handle contact form submission
function handleContactForm(event) {
    event.preventDefault();
    
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const phone = document.getElementById('contact-phone').value;
    const subject = document.getElementById('contact-subject').value;
    const message = document.getElementById('contact-message').value;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
        showPopup('Please fill in all required fields');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showPopup('Please enter a valid email');
        return;
    }
    
    // Prepare payload for Formspree
    const formData = {
        name,
        email,
        phone,
        subject,
        message
    };
    
    // use the form's configured action URL so we don't hardcode the ID here
    const endpoint = document.getElementById('contact-form').action;
    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (response.ok) {
            // custom success message
            const msg = "Thank you! We'll be in touch ASAP.";
            showPopup(msg);
            // hide form and display inline thank‑you text
            const form = document.getElementById('contact-form');
            form.reset();
            form.style.display = 'none';
            const thankMsg = document.createElement('p');
            thankMsg.textContent = msg;
            thankMsg.className = 'contact-success-message';
            form.parentNode.appendChild(thankMsg);
        } else {
            showPopup('Failed to send message. Please try again later.');
        }
    })
    .catch(error => {
        console.error('Contact form error:', error);
        showPopup('Error sending message. Please try again later.');
    });
}
