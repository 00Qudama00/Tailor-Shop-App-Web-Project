export const API_URL = import.meta.env.VITE_API_URL || '';

export function fileUrl(path) {
  if (!path) return '';
  return API_URL + path;
}

export function money(amount) {
  return 'Rs ' + Math.round(Number(amount) || 0).toLocaleString('en-PK');
}

export function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function toInputDate(date) {
  const d = date ? new Date(date) : new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export function daysLeft(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

export function dueText(date) {
  const days = daysLeft(date);
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days > 1) return `${days} days left`;
  return `${Math.abs(days)} days late`;
}

export function initials(name) {
  return (name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function errorMessage(err) {
  return err.response?.data?.message || 'Something went wrong. Please try again.';
}

export function whatsappLink(phone, message) {
  let number = (phone || '').replace(/[^0-9]/g, '');
  if (number.startsWith('0')) number = '92' + number.slice(1);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export const STAGES = [
  { key: 'Cutting', label: 'Cutting', urdu: 'کٹائی', tone: 'tone-gold' },
  { key: 'Stitching', label: 'Stitching', urdu: 'سلائی', tone: 'tone-accent' },
  { key: 'Ready', label: 'Ready', urdu: 'تیار', tone: 'tone-olive' },
  { key: 'Delivered', label: 'Delivered', urdu: 'وصول', tone: 'tone-slate' },
];

export const MEASUREMENTS = {
  qameez: [
    { key: 'qameezLambai', urdu: 'قمیض لمبائی', en: 'Qameez Length' },
    { key: 'chaati', urdu: 'چھاتی', en: 'Chest' },
    { key: 'kamar', urdu: 'کمر', en: 'Waist' },
    { key: 'teera', urdu: 'تیرا', en: 'Shoulder' },
    { key: 'baazu', urdu: 'بازو', en: 'Sleeve' },
    { key: 'collar', urdu: 'کالر', en: 'Collar' },
    { key: 'qameezGhera', urdu: 'قمیض گھیرا', en: 'Qameez Width' },
    { key: 'moda', urdu: 'موڈا', en: 'Armhole' },
    { key: 'kuff', urdu: 'کف', en: 'Cuff' },
  ],
  shalwar: [
    { key: 'shalwarLambai', urdu: 'شلوار لمبائی', en: 'Shalwar Length' },
    { key: 'pancha', urdu: 'پانچہ', en: 'Bottom' },
    { key: 'shalwarGhera', urdu: 'شلوار گھیرا', en: 'Shalwar Width' },
    { key: 'aasan', urdu: 'آسن', en: 'Seat' },
  ],
};

export const STYLE_OPTIONS = {
  collarType: {
    title: 'Collar',
    options: [
      { value: 'Ban', urdu: 'بین', en: 'Ban / Mandarin' },
      { value: 'Shirt Collar', urdu: 'شرٹ کالر', en: 'Shirt Collar' },
      { value: 'Round Neck', urdu: 'گول گلا', en: 'Round Neck' },
    ],
  },
  cuffType: {
    title: 'Sleeve / Cuff',
    options: [
      { value: 'Button Cuff', urdu: 'کف بٹن', en: 'Button Cuff' },
      { value: 'Open Sleeve', urdu: 'سادہ آستین', en: 'Open Sleeve' },
      { value: 'Double Cuff', urdu: 'ڈبل کف', en: 'Double Cuff' },
    ],
  },
  pocketType: {
    title: 'Pocket',
    options: [
      { value: 'Front & Side', urdu: 'سامنے اور سائیڈ', en: 'Front & Side' },
      { value: 'Front Only', urdu: 'صرف سامنے', en: 'Front Only' },
      { value: 'Side Only', urdu: 'صرف سائیڈ', en: 'Side Only' },
      { value: 'No Pocket', urdu: 'کوئی جیب نہیں', en: 'No Pocket' },
    ],
  },
  damanType: {
    title: 'Daman',
    options: [
      { value: 'Round', urdu: 'گول دامن', en: 'Round' },
      { value: 'Square', urdu: 'چورس دامن', en: 'Square' },
    ],
  },
};

export const EXPENSE_CATEGORIES = ['General', 'Rent', 'Electricity', 'Thread & Buttons', 'Machine Repair', 'Salary', 'Tea & Food', 'Other'];
