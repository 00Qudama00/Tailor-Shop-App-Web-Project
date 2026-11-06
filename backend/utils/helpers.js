function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toNumber(value) {
  const num = parseFloat(value);
  return isNaN(num) || num < 0 ? 0 : num;
}

// an order due today is not late until tomorrow
function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

// "2026-11-04" from a date input is saved as noon so time zones never move it to another day
function parseDate(value) {
  if (!value) return new Date();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(value + 'T12:00:00');
  return new Date(value);
}

module.exports = { escapeRegex, toNumber, startOfToday, parseDate };
