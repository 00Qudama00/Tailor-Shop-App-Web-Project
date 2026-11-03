import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import Modal from './Modal';
import { formatDate, money, whatsappLink } from '../utils/helpers';

function buildMessage(type, lang, order, shopName) {
  const name = order.customer?.name || '';
  const no = order.orderNo;
  const trackUrl = `${window.location.origin}/track/${order.id}`;

  const english = {
    received: `Assalam o Alaikum ${name},\nYour order #${no} (${order.totalSuits} suit) has been received at ${shopName}.\nDelivery date: ${formatDate(order.dueDate)}\nTotal: ${money(order.totalPrice)} | Advance: ${money(order.advancePaid)} | Balance: ${money(order.balance)}\nTrack your order: ${trackUrl}`,
    ready: `Assalam o Alaikum ${name},\nGood news! Your order #${no} is ready. Please collect it from ${shopName}.\nRemaining balance: ${money(order.balance)}\nThank you!`,
    reminder: `Assalam o Alaikum ${name},\nThis is a reminder about your order #${no} at ${shopName}.\nDelivery date: ${formatDate(order.dueDate)}\nTrack your order: ${trackUrl}`,
    thanks: `Assalam o Alaikum ${name},\nThank you for collecting your order #${no} from ${shopName}. We hope to see you again!`,
  };

  const urdu = {
    received: `السلام علیکم ${name}،\nآپ کا آرڈر نمبر ${no} (${order.totalSuits} سوٹ) ${shopName} پر وصول ہو گیا ہے۔\nتاریخ: ${formatDate(order.dueDate)}\nکل رقم: ${money(order.totalPrice)} | ایڈوانس: ${money(order.advancePaid)} | بقایا: ${money(order.balance)}\nاپنا آرڈر دیکھیں: ${trackUrl}`,
    ready: `السلام علیکم ${name}،\nآپ کا آرڈر نمبر ${no} تیار ہے۔ براہ کرم ${shopName} سے وصول کر لیں۔\nبقایا رقم: ${money(order.balance)}\nشکریہ!`,
    reminder: `السلام علیکم ${name}،\nیاد دہانی: آپ کا آرڈر نمبر ${no} ${shopName} پر ہے۔\nتاریخ: ${formatDate(order.dueDate)}\nاپنا آرڈر دیکھیں: ${trackUrl}`,
    thanks: `السلام علیکم ${name}،\nآرڈر نمبر ${no} وصول کرنے کا شکریہ۔ ${shopName} پر دوبارہ تشریف لائیں!`,
  };

  return lang === 'ur' ? urdu[type] : english[type];
}

const TYPES = [
  { key: 'received', label: 'Order received' },
  { key: 'ready', label: 'Ready to collect' },
  { key: 'reminder', label: 'Reminder' },
  { key: 'thanks', label: 'Thank you' },
];

function defaultType(stage) {
  if (stage === 'Ready') return 'ready';
  if (stage === 'Delivered') return 'thanks';
  return 'received';
}

export default function WhatsAppModal({ order, shopName, onClose }) {
  const [type, setType] = useState(defaultType(order.stage));
  const [lang, setLang] = useState('en');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setMessage(buildMessage(type, lang, order, shopName));
  }, [type, lang, order, shopName]);

  function send() {
    window.open(whatsappLink(order.customer?.phone, message), '_blank');
    onClose();
  }

  return (
    <Modal
      title="Send WhatsApp message"
      onClose={onClose}
      wide
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-whatsapp" onClick={send}>
            <MessageCircle size={16} /> Open WhatsApp
          </button>
        </>
      }
    >
      <div className="field mb">
        <span className="label">Message type</span>
        <div className="tabs">
          {TYPES.map((t) => (
            <button key={t.key} className={`tab ${type === t.key ? 'active' : ''}`} onClick={() => setType(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="field mb">
        <span className="label">Language</span>
        <div className="tabs">
          <button className={`tab ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>
            English
          </button>
          <button className={`tab ${lang === 'ur' ? 'active' : ''}`} onClick={() => setLang('ur')}>
            اردو
          </button>
        </div>
      </div>
      <div className="field">
        <span className="label">Message (you can edit it)</span>
        <textarea
          className={`textarea ${lang === 'ur' ? 'urdu' : ''}`}
          rows={7}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <span className="hint">Sending to {order.customer?.phone}</span>
      </div>
    </Modal>
  );
}
