import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { errorMessage, money } from '../utils/helpers';

export default function SuitTypes() {
  const [suitTypes, setSuitTypes] = useState(null);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', employeeSalary: '' });

  function load() {
    api.get('/suit-types').then((res) => setSuitTypes(res.data));
  }

  useEffect(load, []);

  function openForm(item) {
    setForm(item ? { name: item.name, price: item.price, employeeSalary: item.employeeSalary } : { name: '', price: '', employeeSalary: '' });
    setEditing(item || 'new');
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      if (editing === 'new') {
        await api.post('/suit-types', form);
        toast.success('Suit type added');
      } else {
        await api.put(`/suit-types/${editing.id}`, form);
        toast.success('Suit type updated');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function toggleActive(item) {
    try {
      await api.put(`/suit-types/${item.id}`, { isActive: !item.isActive });
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/suit-types/${toDelete.id}`);
      toast.success('Suit type deleted');
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  if (!suitTypes) return <Loader />;

  return (
    <>
      <PageHeader title="Suit types & prices" subtitle="Set your stitching price and how much the kareegar earns">
        <button className="btn btn-primary" onClick={() => openForm(null)}>
          <Plus size={16} /> Add suit type
        </button>
      </PageHeader>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Suit type</th>
                <th>Customer price</th>
                <th>Kareegar pay</th>
                <th>Shop profit</th>
                <th>Available</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suitTypes.map((s) => (
                <tr key={s.id} style={{ opacity: s.isActive ? 1 : 0.55 }}>
                  <td>
                    <div className="cell-title">{s.name}</div>
                    {s.isDefault && <div className="cell-sub">Default</div>}
                  </td>
                  <td className="num">{money(s.price)}</td>
                  <td>{money(s.employeeSalary)}</td>
                  <td className="olive-text">{money(s.price - s.employeeSalary)}</td>
                  <td>
                    <label className="check">
                      <input type="checkbox" checked={s.isActive} onChange={() => toggleActive(s)} />
                      {s.isActive ? 'On' : 'Off'}
                    </label>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => openForm(s)} title="Edit">
                        <Pencil size={16} />
                      </button>
                      {!s.isDefault && (
                        <button className="icon-btn danger" onClick={() => setToDelete(s)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <Modal title={editing === 'new' ? 'Add suit type' : 'Edit suit type'} onClose={() => setEditing(null)}>
          <form onSubmit={handleSave} className="stack" style={{ gap: 16 }}>
            <div className="field">
              <label>Name *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sherwani" required autoFocus />
            </div>
            <div className="form-grid">
              <div className="field">
                <label>Customer price *</label>
                <input className="input" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div className="field">
                <label>Kareegar pay *</label>
                <input className="input" type="number" min="0" value={form.employeeSalary} onChange={(e) => setForm({ ...form, employeeSalary: e.target.value })} required />
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="btn btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      )}

      {toDelete && (
        <ConfirmModal
          title="Delete suit type?"
          message={`"${toDelete.name}" will be removed. Old orders are not affected.`}
          onConfirm={handleDelete}
          onClose={() => setToDelete(null)}
        />
      )}
    </>
  );
}
