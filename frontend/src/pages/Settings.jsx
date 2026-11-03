import { useEffect, useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import ConfirmModal from '../components/ConfirmModal';
import { errorMessage, fileUrl } from '../utils/helpers';

export default function Settings() {
  const { user, setUser } = useAuth();
  const [shop, setShop] = useState({
    name: user.name,
    phone: user.phone || '',
    shopName: user.shopName,
    shopPhone: user.shopPhone || '',
    shopAddress: user.shopAddress || '',
  });
  const [logo, setLogo] = useState(null);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [years, setYears] = useState(2);
  const [cleanup, setCleanup] = useState(null);
  const [confirmCleanup, setConfirmCleanup] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/orders/cleanup', { params: { years } }).then((res) => setCleanup(res.data));
  }, [years]);

  function handleShopChange(e) {
    setShop({ ...shop, [e.target.name]: e.target.value });
  }

  async function saveShop(e) {
    e.preventDefault();
    const data = new FormData();
    Object.entries(shop).forEach(([key, value]) => data.append(key, value));
    if (logo) data.append('logo', logo);

    setSaving(true);
    try {
      const res = await api.put('/auth/shop', data);
      setUser(res.data);
      setLogo(null);
      toast.success('Shop details saved');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    try {
      const res = await api.put('/auth/password', passwords);
      toast.success(res.data.message);
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function runCleanup() {
    try {
      const res = await api.post('/orders/cleanup', { years });
      toast.success(res.data.message);
      setConfirmCleanup(false);
      const stats = await api.get('/orders/cleanup', { params: { years } });
      setCleanup(stats.data);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  const logoSrc = logo ? URL.createObjectURL(logo) : user.logo ? fileUrl(user.logo) : '/default-logo.svg';

  return (
    <>
      <PageHeader title="Settings" subtitle="Your shop details appear on invoices and tracking pages" />

      <div className="split">
        <form className="card" onSubmit={saveShop}>
          <div className="card-head">
            <h2>Shop details</h2>
          </div>
          <div className="card-body">
            <div className="row mb" style={{ gap: 16 }}>
              <img src={logoSrc} alt="logo" className="logo-preview" />
              <label className="btn btn-outline">
                <Upload size={16} /> Change logo
                <input type="file" accept="image/*" hidden onChange={(e) => setLogo(e.target.files[0])} />
              </label>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>Shop name *</label>
                <input className="input" name="shopName" value={shop.shopName} onChange={handleShopChange} required />
              </div>
              <div className="field">
                <label>Shop phone</label>
                <input className="input" name="shopPhone" value={shop.shopPhone} onChange={handleShopChange} />
              </div>
              <div className="field full">
                <label>Shop address</label>
                <input className="input" name="shopAddress" value={shop.shopAddress} onChange={handleShopChange} />
              </div>
              <div className="field">
                <label>Your name *</label>
                <input className="input" name="name" value={shop.name} onChange={handleShopChange} required />
              </div>
              <div className="field">
                <label>Your phone</label>
                <input className="input" name="phone" value={shop.phone} onChange={handleShopChange} />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save details'}
              </button>
            </div>
          </div>
        </form>

        <div className="stack">
          <form className="card card-pad stack" style={{ gap: 14 }} onSubmit={changePassword}>
            <h2 style={{ fontSize: 18 }}>Change password</h2>
            <div className="field">
              <label>Current password</label>
              <input
                className="input"
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>New password</label>
              <input
                className="input"
                type="password"
                minLength={6}
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                required
              />
            </div>
            <button className="btn btn-dark btn-block">Update password</button>
          </form>

          <div className="card card-pad">
            <h2 style={{ fontSize: 18 }}>Clean old orders</h2>
            <p className="muted small" style={{ margin: '6px 0 14px' }}>
              Delete delivered orders older than the selected time to keep things fast.
            </p>
            <div className="field">
              <label>Delete delivered orders older than</label>
              <select className="select" value={years} onChange={(e) => setYears(Number(e.target.value))}>
                <option value={1}>1 year</option>
                <option value={2}>2 years</option>
                <option value={3}>3 years</option>
                <option value={5}>5 years</option>
              </select>
            </div>
            {cleanup && (
              <div className="info mt">
                <div className="info-row">
                  <span>Total orders</span>
                  <span>{cleanup.total}</span>
                </div>
                <div className="info-row">
                  <span>Delivered</span>
                  <span>{cleanup.delivered}</span>
                </div>
                <div className="info-row">
                  <span>Can be deleted</span>
                  <span className="danger-text">{cleanup.eligible}</span>
                </div>
              </div>
            )}
            <button className="btn btn-danger btn-block mt" disabled={!cleanup?.eligible} onClick={() => setConfirmCleanup(true)}>
              <Trash2 size={16} /> Delete old orders
            </button>
          </div>
        </div>
      </div>

      {confirmCleanup && (
        <ConfirmModal
          title="Delete old orders?"
          message={`${cleanup.eligible} delivered orders older than ${years} year(s) will be deleted permanently.`}
          onConfirm={runCleanup}
          onClose={() => setConfirmCleanup(false)}
        />
      )}
    </>
  );
}
