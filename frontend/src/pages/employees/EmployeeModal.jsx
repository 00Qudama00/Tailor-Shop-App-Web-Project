import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api';
import Modal from '../../components/Modal';
import { errorMessage } from '../../utils/helpers';

export default function EmployeeModal({ employee, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: employee?.name || '',
    phone: employee?.phone || '',
    position: employee?.position || 'Tailor',
  });
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = employee ? await api.put(`/employees/${employee.id}`, form) : await api.post('/employees', form);
      toast.success(employee ? 'Kareegar updated' : 'Kareegar added');
      onSaved(res.data);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={employee ? 'Edit kareegar' : 'Add kareegar'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="stack" style={{ gap: 16 }}>
        <div className="field">
          <label>Name *</label>
          <input className="input" name="name" value={form.name} onChange={handleChange} required autoFocus />
        </div>
        <div className="field">
          <label>Phone</label>
          <input className="input" name="phone" value={form.phone} onChange={handleChange} placeholder="03xx xxxxxxx" />
        </div>
        <div className="field">
          <label>Work</label>
          <select className="select" name="position" value={form.position} onChange={handleChange}>
            <option>Tailor</option>
            <option>Cutter</option>
            <option>Karhai Worker</option>
            <option>Helper</option>
          </select>
        </div>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
