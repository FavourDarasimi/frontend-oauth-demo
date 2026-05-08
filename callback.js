/**
 * OAuth Demo - Callback Handler
 * Processes authorization codes from Google and GitHub OAuth flows
 */

// Django Backend URLs for each provider
const BACKEND_URLS = {
    google: 'http://127.0.0.1:8000/api/auth/google/',
    github: 'http://127.0.0.1:8000/api/auth/github/'
};

/**
 * Extracts the authorization code from URL parameters
 * @returns {string|null} The authorization code or null if not found
 */
function getAuthorizationCode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code');
}

/**
 * Extracts error from URL if OAuth failed
 * @returns {string|null} Error description or null
 */
function getOAuthError() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
        return urlParams.get('error_description') || error;
    }
    return null;
}

/**
 * Determines the OAuth provider from the state parameter
 * @param {string} state - The state parameter from the URL
 * @returns {string} 'google' or 'github'
 */
function detectProvider(state) {
    if (state && state.startsWith('github_')) {
        return 'github';
    }
    // Default to Google if state indicates Google or is missing
    return 'google';
}

/**
 * Sends the authorization code to Django backend for token exchange
 * @param {string} code - The authorization code from the OAuth provider
 * @param {string} provider - The OAuth provider ('google' or 'github')
 */
async function exchangeCodeForToken(code, provider) {
    const backendUrl = BACKEND_URLS[provider];

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: code
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Token exchange failed:', error);
        throw error;
    }
}

/**
 * Displays an error message to the user
 * @param {string} message - The error message to display
 */
function showError(message) {
    const spinnerContainer = document.querySelector('.spinner-container');
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');

    // Hide spinner
    spinnerContainer.style.display = 'none';

    // Show error
    errorMessage.textContent = `Authentication failed: ${message}`;
    errorContainer.style.display = 'block';
}

/**
 * Redirects to success page after successful authentication
 */
function redirectToSuccess() {
    window.location.href = 'success.html';
}

/**
 * Main callback handler
 * Processes the OAuth callback from Google or GitHub
 */
async function handleCallback() {
    // Check for OAuth errors first
    const oauthError = getOAuthError();
    if (oauthError) {
        showError(oauthError);
        return;
    }

    // Get authorization code from URL
    const code = getAuthorizationCode();

    if (!code) {
        showError('No authorization code found in the URL. Please try signing in again.');
        return;
    }

    // Get state parameter to detect provider
    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get('state');
    const provider = detectProvider(state);

    console.log(`Authorization code received from ${provider}:`, code);

    // Update loading text to show which provider is being used
    const loadingText = document.querySelector('.loading-text');
    loadingText.textContent = `Signing you in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}...`;

    try {
        // Send code to appropriate Django backend endpoint
        const tokenData = await exchangeCodeForToken(code, provider);

        console.log('Authentication successful:', tokenData);

        // Wait a moment for UX (show the spinner briefly)
        setTimeout(() => {
            redirectToSuccess();
        }, 1000);

    } catch (error) {
        showError(error.message || 'Failed to authenticate with the server.');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', handleCallback);
