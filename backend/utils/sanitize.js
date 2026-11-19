const sanitizeHtml = require('sanitize-html');

const OPTIONS = { allowedTags: [], allowedAttributes: {}, disallowedTagsMode: 'discard' };
const SKIP = ['password', 'newPassword', 'currentPassword', 'confirmPassword'];

function cleanString(value) {
  return sanitizeHtml(value, OPTIONS)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}

function cleanValue(value) {
  if (typeof value === 'string') return cleanString(value);
  if (Array.isArray(value)) return value.map(cleanValue);
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (!SKIP.includes(key)) value[key] = cleanValue(value[key]);
    }
    return value;
  }
  return value;
}

function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') cleanValue(req.body);
  next();
}

module.exports = { sanitizeBody, cleanString };
