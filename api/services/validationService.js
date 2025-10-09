// Basic validation utilities used by controllers
// Each function returns { valid: boolean, error?: string }

const isUrl = (s) => {
  try {
    // allow relative paths too; only treat absolute urls as urls
    const u = new URL(s);
    return !!u.protocol;
  } catch (e) {
    return false;
  }
};

const validateCacUrl = (val) => {
  if (!val) return { valid: false, error: 'CAC URL required' };
  if (typeof val !== 'string') return { valid: false, error: 'Invalid CAC URL' };
  if (!isUrl(val) && !val.startsWith('/uploads/')) return { valid: false, error: 'CAC URL must be a valid URL or upload path' };
  return { valid: true };
};

const validateHostelDocUrl = (val) => {
  if (!val) return { valid: false, error: 'Hostel document required' };
  if (typeof val !== 'string') return { valid: false, error: 'Invalid document URL' };
  // Accept URLs or local upload paths; optionally check extension
  if (!isUrl(val) && !val.startsWith('/uploads/')) return { valid: false, error: 'Document must be a valid URL or upload path' };
  const lower = val.toLowerCase();
  if (!lower.endsWith('.pdf') && !lower.endsWith('.doc') && !lower.endsWith('.docx') && !lower.includes('/uploads/')) {
    // If it's a remote URL allow it but prefer common document extensions
    return { valid: true };
  }
  return { valid: true };
};

const validatePhoneNumber = (val) => {
  if (!val) return { valid: false, error: 'Phone number required' };
  const s = String(val).trim();
  // Normalize: remove spaces, dashes, parentheses
  const cleaned = s.replace(/[^0-9+]/g, '');
  // Very basic checks: length between 7 and 15 (E.164 up to 15 digits)
  const digits = cleaned.replace(/[^0-9]/g, '');
  if (digits.length < 7 || digits.length > 15) return { valid: false, error: 'Invalid phone number' };
  return { valid: true };
};

const validateWhatsAppNumber = (val) => {
  // WhatsApp numbers are phone numbers; reuse phone validator
  return validatePhoneNumber(val);
};

const validateTelegramUsername = (val) => {
  if (!val) return { valid: false, error: 'Telegram username required' };
  if (typeof val !== 'string') return { valid: false, error: 'Invalid telegram username' };
  const s = val.trim();
  // Telegram username: 5-32 characters, letters, numbers, underscores; cannot start with number or underscore
  const re = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/;
  if (!re.test(s)) return { valid: false, error: 'Invalid telegram username' };
  return { valid: true };
};

module.exports = {
  validateCacUrl,
  validateHostelDocUrl,
  validatePhoneNumber,
  validateWhatsAppNumber,
  validateTelegramUsername,
};
