/**
 * Security Utilities
 * Handles encryption, validation, and security operations
 */

import CryptoJS from 'crypto-js';
import { config } from './config.js';

/**
 * Encrypts sensitive data
 */
export const encryptData = (data, key = config.security.encryptionKey) => {
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

/**
 * Decrypts sensitive data
 */
export const decryptData = (encryptedData, key = config.security.encryptionKey) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Validates email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * Requirements: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/\?]/.test(password);

  return {
    valid: minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
    requirements: {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
    },
  };
};

/**
 * Sanitizes user input to prevent XSS
 */
export const sanitizeInput = (input) => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Generates a secure random token
 */
export const generateToken = (length = 32) => {
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Secure cookie operations
 */
export const secureCookie = {
  set: (name, value, expiresIn = config.app.sessionTimeout) => {
    const date = new Date();
    date.setTime(date.getTime() + expiresIn);
    const expires = `expires=${date.toUTCString()}`;
    const secure = config.security.secureCookie ? 'Secure;' : '';
    const sameSite = 'SameSite=Strict';
    const httpOnly = 'HttpOnly'; // Note: Can only be set via HTTP headers in real implementation
    
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; Path=/; ${secure} ${sameSite}`;
  },

  get: (name) => {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    return null;
  },

  delete: (name) => {
    secureCookie.set(name, '', -1);
  },

  clear: () => {
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; Path=/;`;
    });
  },
};

export default {
  encryptData,
  decryptData,
  isValidEmail,
  validatePassword,
  sanitizeInput,
  generateToken,
  secureCookie,
};