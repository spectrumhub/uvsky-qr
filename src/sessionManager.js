/**
 * Session Manager Module
 * Handles user session, token refresh, and timeouts
 */

import { config } from './config.js';
import { secureCookie, generateToken } from './security.js';
import { refreshToken as refreshAuthToken } from './supabase.js';

export class SessionManager {
  constructor(uiManager) {
    this.uiManager = uiManager;
    this.sessionTimeout = null;
    this.tokenRefreshInterval = null;
    this.warningTimeout = null;
    this.lastActivityTime = Date.now();
  }

  /**
   * Start session
   */
  startSession() {
    this.resetSessionTimer();
    this.startTokenRefresh();
    this.addActivityListeners();
  }

  /**
   * End session
   */
  endSession() {
    this.clearSessionTimer();
    this.clearTokenRefresh();
    this.removeActivityListeners();
    secureCookie.clear();
  }

  /**
   * Reset session timer
   */
  resetSessionTimer() {
    this.clearSessionTimer();

    this.sessionTimeout = setTimeout(() => {
      this.handleSessionTimeout();
    }, config.app.sessionTimeout);

    // Show warning 5 minutes before timeout
    const warningTime = config.app.sessionTimeout - (5 * 60 * 1000);
    this.warningTimeout = setTimeout(() => {
      this.showSessionWarning();
    }, warningTime);

    this.lastActivityTime = Date.now();
  }

  /**
   * Clear session timer
   */
  clearSessionTimer() {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }
    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout);
      this.warningTimeout = null;
    }
  }

  /**
   * Start token refresh interval
   */
  startTokenRefresh() {
    this.tokenRefreshInterval = setInterval(async () => {
      const result = await refreshAuthToken();
      if (!result.success) {
        console.warn('Token refresh failed');
        this.handleSessionTimeout();
      }
    }, config.security.tokenRefreshInterval);
  }

  /**
   * Clear token refresh interval
   */
  clearTokenRefresh() {
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
      this.tokenRefreshInterval = null;
    }
  }

  /**
   * Add activity listeners
   */
  addActivityListeners() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, () => this.recordActivity(), true);
    });
  }

  /**
   * Remove activity listeners
   */
  removeActivityListeners() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.removeEventListener(event, () => this.recordActivity(), true);
    });
  }

  /**
   * Record user activity
   */
  recordActivity() {
    const now = Date.now();
    if (now - this.lastActivityTime > 60000) {
      // Reset only if 1+ minute has passed since last activity
      this.resetSessionTimer();
    }
  }

  /**
   * Show session timeout warning
   */
  showSessionWarning() {
    if (this.uiManager) {
      this.uiManager.showWarning(
        'Your session will expire in 5 minutes due to inactivity. Click OK to continue.'
      );
    }
  }

  /**
   * Handle session timeout
   */
  handleSessionTimeout() {
    this.endSession();
    if (this.uiManager) {
      this.uiManager.showError('Your session has expired. Please log in again.');
      this.uiManager.showLoginPanel();
    }
  }

  /**
   * Get remaining session time
   */
  getRemainingTime() {
    if (!this.sessionTimeout) {
      return 0;
    }
    const remaining = config.app.sessionTimeout - (Date.now() - this.lastActivityTime);
    return Math.max(0, remaining);
  }

  /**
   * Extend session
   */
  extendSession() {
    this.resetSessionTimer();
    if (this.uiManager) {
      this.uiManager.showSuccess('Session extended.');
    }
  }
}

export default SessionManager;