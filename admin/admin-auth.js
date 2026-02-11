// Admin Authentication System

// Initialize admin data on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is on login page
    if (window.location.pathname.includes('login.html')) {
        initLoginPage();
    } else {
        // Check if user is authenticated
        checkAdminAuth();
    }
});

function initLoginPage() {
    // Load saved admin credentials if they exist
    const adminCreds = JSON.parse(localStorage.getItem('adminCredentials')) || {
        username: 'admin',
        password: 'admin123'
    };
    localStorage.setItem('adminCredentials', JSON.stringify(adminCreds));
}

function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Get stored admin credentials
    const adminCreds = JSON.parse(localStorage.getItem('adminCredentials')) || {
        username: 'admin',
        password: 'admin123'
    };

    // Validate credentials
    if (username === adminCreds.username && password === adminCreds.password) {
        // Set admin session
        const adminSession = {
            username: username,
            loginTime: new Date().toISOString(),
            token: generateToken()
        };
        sessionStorage.setItem('adminSession', JSON.stringify(adminSession));
        localStorage.setItem('adminUsername', username);

        showNotification('Login successful!', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } else {
        showNotification('Invalid username or password!', 'error');
    }
}

function checkAdminAuth() {
    const adminSession = sessionStorage.getItem('adminSession');

    if (!adminSession) {
        window.location.href = 'login.html';
        return;
    }

    const session = JSON.parse(adminSession);
    const adminUsername = localStorage.getItem('adminUsername') || 'Admin User';
    
    // Update admin name in sidebar
    const adminNameEl = document.getElementById('admin-name');
    if (adminNameEl) {
        adminNameEl.textContent = adminUsername;
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('adminSession');
        localStorage.removeItem('adminUsername');
        window.location.href = 'login.html';
    }
}

function generateToken() {
    return Math.random().toString(36).substr(2) + Date.now().toString(36);
}

function showNotification(message, type = 'info') {
    const notif = document.getElementById('notification');
    if (!notif) return;

    notif.textContent = message;
    notif.className = `notification show ${type}`;

    setTimeout(() => {
        notif.classList.remove('show');
    }, 3000);
}
