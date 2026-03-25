/**
 * QR Code Scanner Module
 * Handles QR code scanning and decoding
 */

import jsQR from 'jsqr';

export class QRScanner {
  constructor(videoElementId, canvasElementId) {
    this.video = document.getElementById(videoElementId);
    this.canvas = document.getElementById(canvasElementId);
    this.canvasContext = this.canvas?.getContext('2d');
    this.scanning = false;
    this.stream = null;
    this.scannedCallback = null;
    this.errorCallback = null;
  }

  /**
   * Start QR code scanner
   */
  async start(onScanned, onError) {
    if (!this.video || !this.canvas) {
      console.error('Video or canvas element not found');
      return false;
    }

    this.scannedCallback = onScanned;
    this.errorCallback = onError;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      this.video.srcObject = this.stream;
      this.video.setAttribute('playsinline', true);
      this.video.play();

      this.scanning = true;
      this.scan();

      return true;
    } catch (error) {
      console.error('Camera access error:', error);
      if (this.errorCallback) {
        this.errorCallback('Unable to access camera. Please check permissions.');
      }
      return false;
    }
  }

  /**
   * Stop QR code scanner
   */
  stop() {
    this.scanning = false;

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.video) {
      this.video.srcObject = null;
    }
  }

  /**
   * Scan for QR codes
   */
  scan() {
    if (!this.scanning) {
      return;
    }

    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;

      const imageData = this.canvasContext.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );

      const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (qrCode) {
        console.log('QR Code detected:', qrCode.data);
        
        // Draw detection box
        this.drawDetectionBox(qrCode);

        // Call callback
        if (this.scannedCallback) {
          this.scannedCallback(qrCode.data);
        }

        // Stop scanning after successful scan
        this.stop();
        return;
      }
    }

    requestAnimationFrame(() => this.scan());
  }

  /**
   * Draw detection box on canvas
   */
  drawDetectionBox(qrCode) {
    const { location } = qrCode;

    // Draw colored box around QR code
    const lineWidth = 3;
    const cornerLength = 20;

    this.canvasContext.strokeStyle = '#00ff00';
    this.canvasContext.lineWidth = lineWidth;

    // Draw corners
    const corners = [
      { x: location.topLeftCorner.x, y: location.topLeftCorner.y },
      { x: location.topRightCorner.x, y: location.topRightCorner.y },
      { x: location.bottomRightCorner.x, y: location.bottomRightCorner.y },
      { x: location.bottomLeftCorner.x, y: location.bottomLeftCorner.y },
    ];

    corners.forEach((corner, i) => {
      const nextCorner = corners[(i + 1) % 4];
      this.canvasContext.beginPath();
      this.canvasContext.moveTo(corner.x, corner.y);
      this.canvasContext.lineTo(nextCorner.x, nextCorner.y);
      this.canvasContext.stroke();
    });

    // Draw corner indicators
    this.canvasContext.fillStyle = '#00ff00';
    corners.forEach(corner => {
      this.canvasContext.fillRect(
        corner.x - cornerLength / 2,
        corner.y - cornerLength / 2,
        cornerLength,
        cornerLength
      );
    });
  }

  /**
   * Scan from file upload
   */
  scanFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.canvas.width = img.width;
          this.canvas.height = img.height;
          this.canvasContext.drawImage(img, 0, 0);

          const imageData = this.canvasContext.getImageData(
            0,
            0,
            this.canvas.width,
            this.canvas.height
          );

          const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

          if (qrCode) {
            resolve(qrCode.data);
          } else {
            reject('No QR code found in image');
          }
        };
        img.onerror = () => reject('Failed to load image');
        img.src = e.target.result;
      };
      reader.onerror = () => reject('Failed to read file');
      reader.readAsDataURL(file);
    });
  }

  /**
   * Parse QR code data
   */
  parseQRData(data) {
    try {
      // Try to parse as JSON
      return JSON.parse(data);
    } catch {
      // If not JSON, check if it's a URL
      if (data.startsWith('http://') || data.startsWith('https://')) {
        const url = new URL(data);
        return {
          trailer: url.searchParams.get('trailer'),
          role: url.searchParams.get('role'),
          raw: data,
        };
      }
      // Otherwise return as is
      return { raw: data };
    }
  }
}

export default QRScanner;