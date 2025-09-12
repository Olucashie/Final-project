const https = require('https');
const http = require('http');
const { URL } = require('url');

// Validate URL format and accessibility
const validateUrl = (url) => {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        resolve({ valid: false, error: 'URL must use HTTP or HTTPS protocol' });
        return;
      }

      const options = {
        method: 'HEAD',
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; HostelFinder/1.0)'
        }
      };

      const client = urlObj.protocol === 'https:' ? https : http;
      const req = client.request(url, options, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({ valid: true, statusCode: res.statusCode });
        } else {
          resolve({ valid: false, error: `URL returned status code ${res.statusCode}` });
        }
      });

      req.on('error', (err) => {
        resolve({ valid: false, error: `URL validation failed: ${err.message}` });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ valid: false, error: 'URL validation timeout' });
      });

      req.setTimeout(5000);
      req.end();
    } catch (error) {
      resolve({ valid: false, error: 'Invalid URL format' });
    }
  });
};

// Validate CAC document URL
const validateCacUrl = async (cacUrl) => {
  if (!cacUrl) {
    return { valid: false, error: 'CAC URL is required' };
  }

  // Check if URL is a valid format
  const urlValidation = await validateUrl(cacUrl);
  if (!urlValidation.valid) {
    return urlValidation;
  }

  // Additional checks for CAC documents
  const url = new URL(cacUrl);
  const pathname = url.pathname.toLowerCase();
  
  // Check if it's likely a document (PDF, image, or document service)
  const documentExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
  const hasDocumentExtension = documentExtensions.some(ext => pathname.endsWith(ext));
  
  // Check if it's from a known document hosting service
  const knownServices = ['drive.google.com', 'dropbox.com', 'onedrive.live.com', 'docs.google.com'];
  const isKnownService = knownServices.some(service => url.hostname.includes(service));
  
  if (!hasDocumentExtension && !isKnownService) {
    return { 
      valid: false, 
      error: 'CAC URL must be a document (PDF/image) or from a known hosting service' 
    };
  }

  return { valid: true };
};

// Validate hostel document URL
const validateHostelDocUrl = async (hostelDocUrl) => {
  if (!hostelDocUrl) {
    return { valid: false, error: 'Hostel document URL is required' };
  }

  // Check if URL is a valid format
  const urlValidation = await validateUrl(hostelDocUrl);
  if (!urlValidation.valid) {
    return urlValidation;
  }

  // Additional checks for hostel documents
  const url = new URL(hostelDocUrl);
  const pathname = url.pathname.toLowerCase();
  
  // Check if it's likely a document (PDF, image, or document service)
  const documentExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
  const hasDocumentExtension = documentExtensions.some(ext => pathname.endsWith(ext));
  
  // Check if it's from a known document hosting service
  const knownServices = ['drive.google.com', 'dropbox.com', 'onedrive.live.com', 'docs.google.com'];
  const isKnownService = knownServices.some(service => url.hostname.includes(service));
  
  if (!hasDocumentExtension && !isKnownService) {
    return { 
      valid: false, 
      error: 'Hostel document URL must be a document (PDF/image) or from a known hosting service' 
    };
  }

  return { valid: true };
};

// Validate phone number format
const validatePhoneNumber = (phone) => {
  if (!phone) {
    return { valid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's a valid length (7-15 digits)
  if (cleanPhone.length < 7 || cleanPhone.length > 15) {
    return { valid: false, error: 'Phone number must be between 7 and 15 digits' };
  }

  return { valid: true };
};

// Validate WhatsApp number
const validateWhatsAppNumber = (whatsapp) => {
  if (!whatsapp) {
    return { valid: true }; // Optional field
  }

  return validatePhoneNumber(whatsapp);
};

// Validate Telegram username
const validateTelegramUsername = (telegram) => {
  if (!telegram) {
    return { valid: true }; // Optional field
  }

  // Remove @ if present
  const cleanUsername = telegram.replace('@', '');
  
  // Telegram username rules: 5-32 characters, alphanumeric and underscores only
  const telegramRegex = /^[a-zA-Z0-9_]{5,32}$/;
  
  if (!telegramRegex.test(cleanUsername)) {
    return { 
      valid: false, 
      error: 'Telegram username must be 5-32 characters, alphanumeric and underscores only' 
    };
  }

  return { valid: true };
};

module.exports = {
  validateUrl,
  validateCacUrl,
  validateHostelDocUrl,
  validatePhoneNumber,
  validateWhatsAppNumber,
  validateTelegramUsername
};
