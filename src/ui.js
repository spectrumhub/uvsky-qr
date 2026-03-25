/**
 * UI Management Module
 * Handles UI state, visibility, and user interactions
 */

import { sanitizeInput } from './security.js';

export class UIManager {
  constructor() {
    this.state = {
      isLoggedIn: false,
      isScanning: false,
      selectedRole: null,
      currentTrailer: null,
      loadingMessage: '',
    };
  }

  /**
   * Show loading state
   */
  showLoading(message = 'Loading...') {
    const loader = document.getElementById('loader');
    const loaderMessage = document.getElementById('loader-message');

    if (loader) {
      loader.style.display = 'flex';
      this.state.loadingMessage = message;
      if (loaderMessage) {
        loaderMessage.textContent = message;
      }
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.style.display = 'none';
    }
  }

  /**
   * Show alert
   */
  showAlert(message, type = 'info') {
    const alertBox = document.getElementById('alert-box');
    const alertMessage = document.getElementById('alert-message');
    const alertClose = document.getElementById('alert-close');

    if (alertBox && alertMessage) {
      alertMessage.textContent = message;
      alertBox.className = `alert alert-${type}`;
      alertBox.style.display = 'block';

      // Auto-close after 5 seconds
      setTimeout(() => {
        this.hideAlert();
      }, 5000);
    }
  }

  /**
   * Hide alert
   */
  hideAlert() {
    const alertBox = document.getElementById('alert-box');
    if (alertBox) {
      alertBox.style.display = 'none';
    }
  }

  /**
   * Show login panel
   */
  showLoginPanel() {
    const loginPanel = document.getElementById('login-panel');
    const appPanel = document.getElementById('app-panel');

    if (loginPanel) loginPanel.style.display = 'block';
    if (appPanel) appPanel.style.display = 'none';

    this.state.isLoggedIn = false;
  }

  /**
   * Show app panel
   */
  showAppPanel() {
    const loginPanel = document.getElementById('login-panel');
    const appPanel = document.getElementById('app-panel');

    if (loginPanel) loginPanel.style.display = 'none';
    if (appPanel) appPanel.style.display = 'block';

    this.state.isLoggedIn = true;
  }

  /**
   * Show QR scanner
   */
  showQRScanner() {
    const scannerPanel = document.getElementById('scanner-panel');
    const rolesPanel = document.getElementById('roles-panel');

    if (scannerPanel) scannerPanel.style.display = 'block';
    if (rolesPanel) rolesPanel.style.display = 'none';

    this.state.isScanning = true;
  }

  /**
   * Hide QR scanner
   */
  hideQRScanner() {
    const scannerPanel = document.getElementById('scanner-panel');
    const rolesPanel = document.getElementById('roles-panel');

    if (scannerPanel) scannerPanel.style.display = 'none';
    if (rolesPanel) rolesPanel.style.display = 'block';

    this.state.isScanning = false;
  }

  /**
   * Show role selection
   */
  showRoleSelection() {
    const rolesPanel = document.getElementById('roles-panel');
    const driverPanel = document.getElementById('driver-panel');
    const controlsPanel = document.getElementById('controls-panel');

    if (rolesPanel) rolesPanel.style.display = 'block';
    if (driverPanel) driverPanel.style.display = 'none';
    if (controlsPanel) controlsPanel.style.display = 'none';

    this.state.selectedRole = null;
  }

  /**
   * Show driver panel
   */
  showDriverPanel() {
    const rolesPanel = document.getElementById('roles-panel');
    const driverPanel = document.getElementById('driver-panel');
    const controlsPanel = document.getElementById('controls-panel');

    if (rolesPanel) rolesPanel.style.display = 'none';
    if (driverPanel) driverPanel.style.display = 'block';
    if (controlsPanel) controlsPanel.style.display = 'block';
  }

  /**
   * Update trailer display
   */
  updateTrailerDisplay(trailerId) {
    const trailerDisplay = document.getElementById('trailer-display');
    if (trailerDisplay) {
      trailerDisplay.textContent = sanitizeInput(trailerId);
    }
    this.state.currentTrailer = trailerId;
  }

  /**
   * Enable/disable form inputs
   */
  setFormDisabled(disabled) {
    const inputs = document.querySelectorAll('input, button');
    inputs.forEach(input => {
      input.disabled = disabled;
    });
  }

  /**
   * Clear form inputs
   */
  clearForm() {
    const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
    inputs.forEach(input => {
      input.value = '';
    });
  }

  /**
   * Display error message
   */
  showError(message) {
    this.showAlert(sanitizeInput(message), 'error');
  }

  /**
   * Display success message
   */
  showSuccess(message) {
    this.showAlert(sanitizeInput(message), 'success');
  }

  /**
   * Display warning message
   */
  showWarning(message) {
    this.showAlert(sanitizeInput(message), 'warning');
  }

  /**
   * Update session timer display
   */
  updateSessionTimer(remainingTime) {
    const timerDisplay = document.getElementById('session-timer');
    if (timerDisplay) {
      const minutes = Math.floor(remainingTime / 60000);
      const seconds = Math.floor((remainingTime % 60000) / 1000);
      timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }
}

export default UIManager;