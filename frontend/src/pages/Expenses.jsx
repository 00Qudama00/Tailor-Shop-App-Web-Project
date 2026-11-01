import { useEffect, useState } from 'react';
import { Plus, Trash2, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import Empty from '../components/Empty';
import ConfirmModal from '../components/ConfirmModal';
import { EXPENSE_CATEGORIES, errorMessage, formatDate, money, toInputDate } from '../utils/helpers';

const emptyForm = { description: '', amount: '', category: 'General', date: toInputDate() };

export default function Expenses() {
  const [month, setMonth] = useState(toInputDate().slice(0, 7));
  const [data, setData] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  function load() {
    api.get('/expenses', { params: { month } }).then((res) => setData(res.data));
  }

  useEffect(load, [month]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/expenses', form);
      toast.success('Expense added');
      setForm({ ...emptyForm, date: form.date });
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/expenses/${toDelete.id}`);
      toast.success('Expense deleted');
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  const byCategory = {};
  (data?.expenses || []).forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  return (
    <>
      <PageHeader title="Expenses" subtitle="Daily shop spending (rozamcha)">
        <input className="input" type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={{ width: 180 }} />
      </PageHeader>

      <div className="split">
        <div className="card">
          <div className="card-head">
            <h2>This month</h2>
            <span className="num" style={{ fontSize: 20 }}>
              {money(data?.total)}
            </span>
          </div>
          {!data ? (
            <Loader />
          ) : data.expenses.length === 0 ? (
            <Empty icon={Wallet} title="No expenses" text="Nothing recorded for this month" />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th className="text-right">Amount</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.expenses.map((e) => (
                    <tr key={e.id}>
                      <td className="muted">{formatDate(e.date)}</td>
                      <td className="cell-title">{e.description}</td>
                      <td>
                        <span className="badge tone-slate plain">{e.category}</span>
                      </td>
                      <td className="num text-right">{money(e.amount)}</td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-btn danger" onClick={() => setToDelete(e)} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="stack">
          <form className="card card-pad stack" style={{ gap: 14 }} onSubmit={handleSubmit}>
            <h2 style={{ fontSize: 18 }}>Add expense</h2>
            <div className="field">
              <label>Description *</label>
              <input className="input" name="description" value={form.description} onChange={handleChange} placeholder="e.g. Thread box" required />
            </div>
            <div className="field">
              <label>Amount *</label>
              <input className="input" type="number" min="1" name="amount" value={form.amount} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Category</label>
              <select className="select" name="category" value={form.category} onChange={handleChange}>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Date</label>
              <input className="input" type="date" name="date" value={form.date} onChange={handleChange} />
            </div>
            <button className="btn btn-primary btn-block" disabled={saving}>
              <Plus size={16} /> {saving ? 'Adding...' : 'Add expense'}
            </button>
          </form>

          {Object.keys(byCategory).length > 0 && (
            <div className="card card-pad">
              <h2 style={{ fontSize: 18, marginBottom: 8 }}>By category</h2>
              <div className="info">
                {Object.entries(byCategory).map(([cat, amount]) => (
                  <div key={cat} className="info-row">
                    <span>{cat}</span>
                    <span>{money(amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {toDelete && (
        <ConfirmModal
          title="Delete expense?"
          message={`"${toDelete.description}" (${money(toDelete.amount)}) will be removed.`}
          onConfirm={handleDelete}
          onClose={() => setToDelete(null)}
        />
      )}
    </>
  );
}
