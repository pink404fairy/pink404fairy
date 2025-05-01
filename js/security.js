/**
 * Maria Ruoro Website - Security Module
 * 
 * This file handles security features including:
 * - CSRF token generation and validation
 * - Form security
 * - Security headers validation
 */

// Security configuration
const securityConfig = {
    csrfTokenLength: 32,
    csrfTokenName: 'csrf_token',
    csrfCookieName: 'X-CSRF-TOKEN',
    csrfHeaderName: 'X-CSRF-TOKEN',
    tokenRefreshInterval: 30 * 60 * 1000, // 30 minutes
};

/**
 * Initialize security features when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Generate and set CSRF tokens
    initCSRFProtection();
    
    // Set up form security
    setupFormSecurity();
    
    // Set up periodic token refresh
    setInterval(refreshCSRFTokens, securityConfig.tokenRefreshInterval);
    
    // Check if we're on the secure backup page
    if (window.location.pathname.includes('secure-backup.html')) {
        initSecureBackupPage();
    }
});

/**
 * Generate a random CSRF token
 * @param {number} length - Length of the token
 * @returns {string} - Random token
 */
function generateCSRFToken(length = securityConfig.csrfTokenLength) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    
    // Use crypto API if available for better randomness
    if (window.crypto && window.crypto.getRandomValues) {
        const values = new Uint32Array(length);
        window.crypto.getRandomValues(values);
        for (let i = 0; i < length; i++) {
            token += charset[values[i] % charset.length];
        }
    } else {
        // Fallback to Math.random() if crypto API is not available
        for (let i = 0; i < length; i++) {
            token += charset[Math.floor(Math.random() * charset.length)];
        }
    }
    
    return token;
}

/**
 * Set a cookie with the given name, value, and expiration
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Days until expiration
 */
function setCookie(name, value, days = 1) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Strict; Secure`;
}

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
function getCookie(name) {
    const cookieName = `${name}=`;
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    
    return null;
}

/**
 * Initialize CSRF protection by generating and setting tokens
 */
function initCSRFProtection() {
    // Generate a new CSRF token
    const csrfToken = generateCSRFToken();
    
    // Set the token in a cookie
    setCookie(securityConfig.csrfCookieName, csrfToken);
    
    // Set the token in all CSRF token fields in forms
    const csrfFields = document.querySelectorAll(`input[name="${securityConfig.csrfTokenName}"]`);
    csrfFields.forEach(field => {
        field.value = csrfToken;
    });
}

/**
 * Refresh all CSRF tokens
 */
function refreshCSRFTokens() {
    // Only refresh if the user is active on the page
    if (document.visibilityState === 'visible') {
        initCSRFProtection();
    }
}

/**
 * Set up security for all forms
 */
function setupFormSecurity() {
    // Get all forms on the page
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Add CSRF validation before submission
        form.addEventListener('submit', validateFormSubmission);
    });
    
    // Special handling for the contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
    
    // Special handling for the newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterFormSubmit);
    }
}

/**
 * Validate form submission for CSRF protection
 * @param {Event} event - Form submission event
 */
function validateFormSubmission(event) {
    const form = event.target;
    const formToken = form.querySelector(`input[name="${securityConfig.csrfTokenName}"]`)?.value;
    const cookieToken = getCookie(securityConfig.csrfCookieName);
    
    // If tokens don't match or are missing, prevent submission
    if (!formToken || !cookieToken || formToken !== cookieToken) {
        event.preventDefault();
        console.error('Security validation failed: CSRF token mismatch');
        alert('Security validation failed. Please refresh the page and try again.');
    }
}

/**
 * Handle contact form submission with additional security
 * @param {Event} event - Form submission event
 */
function handleContactFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // In a real implementation, you would send this data to your server
    // For now, we'll just simulate a successful submission
    console.log('Contact form submitted with data:', Object.fromEntries(formData));
    
    // Show success message
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Message Sent!';
    submitBtn.style.backgroundColor = '#4CAF50';
    
    // Reset form
    form.reset();
    
    // Refresh CSRF token
    initCSRFProtection();
    
    // Reset button after 3 seconds
    setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.backgroundColor = '';
    }, 3000);
}

/**
 * Handle newsletter form submission with additional security
 * @param {Event} event - Form submission event
 */
function handleNewsletterFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // In a real implementation, you would send this data to your server
    // For now, we'll just simulate a successful submission
    console.log('Newsletter form submitted with data:', Object.fromEntries(formData));
    
    // Show success message
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Subscribed!';
    submitBtn.style.backgroundColor = '#4CAF50';
    
    // Reset form
    form.reset();
    
    // Refresh CSRF token
    initCSRFProtection();
    
    // Reset button after 3 seconds
    setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.backgroundColor = '';
    }, 3000);
}

/**
 * Initialize the secure backup page
 */
function initSecureBackupPage() {
    // Set up login form if it exists
    const loginForm = document.getElementById('secureLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleSecureLogin);
    }
    
    // Check if user is already authenticated
    checkAuthenticationStatus();
}

/**
 * Handle secure login form submission
 * @param {Event} event - Form submission event
 */
function handleSecureLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const username = form.querySelector('input[name="username"]').value;
    const password = form.querySelector('input[name="password"]').value;
    
    // In a real implementation, you would validate credentials against your server
    // For demo purposes, we'll use a simple check
    if (username && password) {
        // Simulate successful login
        setAuthenticationToken();
        showSecureBackupInterface();
    } else {
        // Show error message
        const errorMsg = document.getElementById('loginError');
        if (errorMsg) {
            errorMsg.textContent = 'Please enter both username and password.';
            errorMsg.style.display = 'block';
        }
    }
}

/**
 * Set authentication token in secure cookie
 */
function setAuthenticationToken() {
    // Generate a token
    const authToken = generateCSRFToken(64);
    
    // In a real implementation, this token would be validated by the server
    // For demo purposes, we'll just store it in a cookie
    setCookie('auth_token', authToken, 1);
    
    // Store login timestamp
    localStorage.setItem('auth_timestamp', Date.now().toString());
}

/**
 * Check if user is authenticated
 * @returns {boolean} - Whether user is authenticated
 */
function checkAuthenticationStatus() {
    const authToken = getCookie('auth_token');
    const authTimestamp = localStorage.getItem('auth_timestamp');
    
    // Check if token exists and is not expired (24 hours)
    if (authToken && authTimestamp) {
        const now = Date.now();
        const tokenAge = now - parseInt(authTimestamp);
        
        // Token is valid for 24 hours
        if (tokenAge < 24 * 60 * 60 * 1000) {
            showSecureBackupInterface();
            return true;
        }
    }
    
    // Not authenticated or token expired
    showLoginInterface();
    return false;
}

/**
 * Show the secure backup interface
 */
function showSecureBackupInterface() {
    // Hide login form
    const loginContainer = document.querySelector('.backup-login');
    if (loginContainer) {
        loginContainer.style.display = 'none';
    }
    
    // Show secure content
    const secureContent = document.querySelector('.secure-content');
    if (secureContent) {
        secureContent.style.display = 'block';
    }
}

/**
 * Show the login interface
 */
function showLoginInterface() {
    // Show login form
    const loginContainer = document.querySelector('.backup-login');
    if (loginContainer) {
        loginContainer.style.display = 'block';
    }
    
    // Hide secure content
    const secureContent = document.querySelector('.secure-content');
    if (secureContent) {
        secureContent.style.display = 'none';
    }
}

/**
 * Log out the user
 */
function logoutUser() {
    // Clear authentication
    document.cookie = `auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure`;
    localStorage.removeItem('auth_timestamp');
    
    // Redirect to login
    showLoginInterface();
} 