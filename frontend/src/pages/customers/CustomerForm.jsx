import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import { errorMessage } from '../../utils/helpers';

export default function CustomerForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/customers/${id}`).then((res) => {
      const c = res.data.customer;
      setForm({ name: c.name, phone: c.phone, address: c.address || '' });
      setLoading(false);
    });
  }, [id, isEdit]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/customers/${id}`, form);
        toast.success('Customer updated');
        navigate(`/customers/${id}`);
      } else {
        const res = await api.post('/customers', form);
        toast.success('Customer added. Now take the measurements.');
        const next = params.get('next') === 'order' ? '?next=order' : '';
        navigate(`/customers/${res.data.id}/measurement${next}`);
      }
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader />;

  return (
    <>
      <PageHeader
        title={isEdit ? 'Edit customer' : 'Add customer'}
        subtitle={isEdit ? 'Update contact details.' : 'A registration number is given automatically.'}
        back={isEdit ? `/customers/${id}` : '/customers'}
      />

      <form className="card card-pad" style={{ maxWidth: 720 }} onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field">
            <label>Full name *</label>
            <input className="input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Muhammad Usman" required autoFocus />
          </div>
          <div className="field">
            <label>Phone number *</label>
            <input className="input" name="phone" value={form.phone} onChange={handleChange} placeholder="03xx xxxxxxx" required />
            <span className="hint">Used for WhatsApp messages.</span>
          </div>
          <div className="field full">
            <label>Address</label>
            <textarea className="textarea" name="address" value={form.address} onChange={handleChange} placeholder="Optional" />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Save & add measurements'}
          </button>
        </div>
      </form>
    </>
  );
}
