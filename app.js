/**
 * OAuth Demo - Main Application JavaScript
 * Handles the Google and GitHub OAuth flow initiation
 */

require("dotenv").config();

// DOM Elements
const googleSignInBtn = document.getElementById("googleSignIn");
const githubSignInBtn = document.getElementById("githubSignIn");

// OAuth Configuration
// Replace these placeholders with actual values when connecting to real backend
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI; // or your callback URL

// GitHub OAuth Configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI; // Same callback for both providers

/**
 * Builds the Google OAuth2 authorization URL
 * @returns {string} The complete authorization URL
 */
function buildAuthUrl() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    // Include provider in state to detect callback source
    state: `google_${generateRandomState()}`,
    // Optional: Force re-consent
    prompt: "consent",
    // Optional: Access type for refresh token
    access_type: "offline",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Builds the GitHub OAuth2 authorization URL
 * @returns {string} The complete GitHub authorization URL
 */
function buildGitHubAuthUrl() {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: "user:email",
    // Include provider in state to detect callback source
    state: `github_${generateRandomState()}`,
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/**
 * Generates a random state parameter for CSRF protection
 * @returns {string} Random state string
 */
function generateRandomState() {
  const array = new Uint32Array(8);
  window.crypto.getRandomValues(array);
  return Array.from(array, (dec) => dec.toString(16).padStart(8, "0")).join("");
}

/**
 * Initiates the Google OAuth flow
 * Redirects user to Google's authorization page
 */
function initiateGoogleOAuth() {
  // Add a subtle loading state to button
  googleSignInBtn.style.opacity = "0.7";
  googleSignInBtn.style.pointerEvents = "none";

  // Build and redirect to Google OAuth URL
  const authUrl = buildAuthUrl();

  // Log for debugging (remove in production)
  console.log("Redirecting to Google OAuth:", authUrl);

  // Redirect to Google
  window.location.href = authUrl;
}

/**
 * Initiates the GitHub OAuth flow
 * Redirects user to GitHub's authorization page
 */
function initiateGitHubOAuth() {
  // Add a subtle loading state to button
  githubSignInBtn.style.opacity = "0.7";
  githubSignInBtn.style.pointerEvents = "none";

  // Build and redirect to GitHub OAuth URL
  const authUrl = buildGitHubAuthUrl();

  // Log for debugging (remove in production)
  console.log("Redirecting to GitHub OAuth:", authUrl);

  // Redirect to GitHub
  window.location.href = authUrl;
}

// Event Listeners
googleSignInBtn.addEventListener("click", initiateGoogleOAuth);
githubSignInBtn.addEventListener("click", initiateGitHubOAuth);
