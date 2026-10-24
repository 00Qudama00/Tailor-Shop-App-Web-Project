import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, ImagePlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import AudioRecorder from '../../components/AudioRecorder';
import { STYLE_OPTIONS, errorMessage, fileUrl, money, toInputDate } from '../../utils/helpers';

const emptyItem = { suitType: '', employee: '', quantity: 1, price: '', employeeSalary: '' };

function defaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return toInputDate(d);
}

export default function OrderForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [suitTypes, setSuitTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  const [form, setForm] = useState({
    customer: params.get('customer') || '',
    dueDate: defaultDueDate(),
    advancePaid: '',
    isUrgent: false,
    collarType: '',
    cuffType: '',
    pocketType: '',
    damanType: '',
    fabricPhoto: '',
    audioNote: '',
    notes: '',
  });
  const [items, setItems] = useState([{ ...emptyItem }]);

  useEffect(() => {
    async function load() {
      const [c, s, e] = await Promise.all([api.get('/customers'), api.get('/suit-types'), api.get('/employees')]);
      setCustomers(c.data);
      setSuitTypes(s.data);
      setEmployees(e.data);

      if (isEdit) {
        const res = await api.get(`/orders/${id}`);
        const o = res.data;
        setForm({
          customer: o.customer?.id || '',
          dueDate: toInputDate(o.dueDate),
          advancePaid: o.advancePaid,
          isUrgent: o.isUrgent,
          collarType: o.collarType,
          cuffType: o.cuffType,
          pocketType: o.pocketType,
          damanType: o.damanType,
          fabricPhoto: o.fabricPhoto,
          audioNote: o.audioNote,
          notes: o.notes,
        });
        setItems(
          o.items.map((i) => ({
            id: i.id,
            suitType: i.suitType || '',
            employee: i.employee?.id || '',
            quantity: i.quantity,
            price: i.price,
            employeeSalary: i.employeeSalary,
          }))
        );
      }
      setLoading(false);
    }
    load();
  }, [id, isEdit]);

  function salaryFor(employeeId, suitTypeId) {
    const st = suitTypes.find((s) => s.id === suitTypeId);
    if (!st) return '';
    const emp = employees.find((e) => e.id === employeeId);
    const rate = emp?.rates.find((r) => r.suitType === suitTypeId);
    return rate ? rate.salary : st.employeeSalary;
  }

  function updateItem(index, field, value) {
    const next = [...items];
    const item = { ...next[index], [field]: value };

    if (field === 'suitType') {
      const st = suitTypes.find((s) => s.id === value);
      item.price = st ? st.price : '';
      item.employeeSalary = salaryFor(item.employee, value);
    }
    if (field === 'employee' && item.suitType) {
      item.employeeSalary = salaryFor(value, item.suitType);
    }

    next[index] = item;
    setItems(next);
  }

  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  async function uploadFile(field, file) {
    const data = new FormData();
    data.append(field, file, field === 'audioNote' ? 'voice.webm' : file.name);
    setUploading(true);
    try {
      const res = await api.post('/orders/upload', data);
      setForm((f) => ({ ...f, [field]: res.data[field] }));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  const totalSuits = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  const totalPrice = items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0);
  const advance = Number(form.advancePaid) || 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.customer) return toast.error('Please select a customer.');
    if (items.length === 0) return toast.error('Add at least one suit.');
    if (items.some((i) => !i.suitType)) return toast.error('Select a suit type for every item.');
    if (advance > totalPrice) return toast.error('Advance cannot be more than the total.');

    setSaving(true);
    try {
      const body = { ...form, items };
      const res = isEdit ? await api.put(`/orders/${id}`, body) : await api.post('/orders', body);
      toast.success(isEdit ? 'Order updated' : `Order #${res.data.orderNo} created`);
      navigate(`/orders/${res.data.id}`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader />;

  const query = customerSearch.trim().toLowerCase();
  const shownCustomers = customers.filter(
    (c) =>
      !query ||
      c.id === form.customer ||
      c.name.toLowerCase().includes(query) ||
      c.phone.includes(query) ||
      String(c.regNo) === query
  );

  const activeTypes =suitTypes.filter((s) => s.isActive || items.some((i) => i.suitType === s.id));

  return (
    <>
      <PageHeader title={isEdit ? 'Edit order' : 'New order'} subtitle="Fill in the suits, style and payment" back={isEdit ? `/orders/${id}` : '/orders'} />

      <form className="split" onSubmit={handleSubmit}>
        <div className="stack">
          <div className="card card-pad">
            <div className="form-grid">
              <div className="field">
                <label>Customer *</label>
                {customers.length > 8 && (
                  <input
                    className="input"
                    placeholder="Search name, phone or reg no..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                )}
                <select className="select" name="customer" value={form.customer} onChange={handleChange} required>
                  <option value="">Select customer</option>
                  {shownCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.regNo} - {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
                <Link to="/customers/new?next=order" className="link small">
                  + Add new customer
                </Link>
              </div>
              <div className="field">
                <label>Delivery date *</label>
                <input className="input" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} required />
              </div>
            </div>
            <label className="check mt">
              <input type="checkbox" name="isUrgent" checked={form.isUrgent} onChange={handleChange} />
              This is an urgent order
            </label>
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Suits</h2>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setItems([...items, { ...emptyItem }])}>
                <Plus size={15} /> Add suit
              </button>
            </div>
            <div className="card-body">
              {items.map((item, index) => (
                <div key={index} className="item-row">
                  <div className="field">
                    <label>Suit type</label>
                    <select className="select" value={item.suitType} onChange={(e) => updateItem(index, 'suitType', e.target.value)}>
                      <option value="">Select</option>
                      {activeTypes.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Kareegar</label>
                    <select className="select" value={item.employee} onChange={(e) => updateItem(index, 'employee', e.target.value)}>
                      <option value="">Not assigned</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Qty</label>
                    <input className="input" type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Price / suit</label>
                    <input className="input" type="number" min="0" value={item.price} onChange={(e) => updateItem(index, 'price', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Kareegar pay</label>
                    <input className="input" type="number" min="0" value={item.employeeSalary} onChange={(e) => updateItem(index, 'employeeSalary', e.target.value)} />
                  </div>
                  <button type="button" className="icon-btn danger" onClick={() => removeItem(index)} disabled={items.length === 1} title="Remove">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Style</h2>
              <span className="muted small">Tap to select</span>
            </div>
            <div className="card-body">
              {Object.entries(STYLE_OPTIONS).map(([field, group]) => (
                <div key={field} className="field mb">
                  <span className="label">{group.title}</span>
                  <div className="options">
                    {group.options.map((opt) => (
                      <button
                        type="button"
                        key={opt.value}
                        className={`option ${form[field] === opt.value ? 'selected' : ''}`}
                        onClick={() => setForm({ ...form, [field]: form[field] === opt.value ? '' : opt.value })}
                      >
                        <span className="urdu">{opt.urdu}</span>
                        <span className="en">{opt.en}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="grid grid-2">
                <div className="field">
                  <span className="label">Fabric photo</span>
                  {form.fabricPhoto ? (
                    <div style={{ position: 'relative' }}>
                      <img src={fileUrl(form.fabricPhoto)} alt="fabric" className="photo" />
                      <button type="button" className="icon-btn danger" style={{ position: 'absolute', top: 8, right: 8 }} onClick={() => setForm({ ...form, fabricPhoto: '' })}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="btn btn-outline" style={{ width: 'fit-content' }}>
                      <ImagePlus size={16} /> {uploading ? 'Uploading...' : 'Upload photo'}
                      <input type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && uploadFile('fabricPhoto', e.target.files[0])} />
                    </label>
                  )}
                </div>
                <div className="field">
                  <span className="label">Voice note for kareegar</span>
                  <AudioRecorder
                    value={form.audioNote ? fileUrl(form.audioNote) : ''}
                    onRecorded={(blob) => uploadFile('audioNote', blob)}
                    onClear={() => setForm({ ...form, audioNote: '' })}
                  />
                </div>
              </div>

              <div className="field mt">
                <label>Notes</label>
                <textarea className="textarea" name="notes" value={form.notes} onChange={handleChange} placeholder="Any special instructions..." />
              </div>
            </div>
          </div>
        </div>

        <div className="card card-pad" style={{ position: 'sticky', top: 20 }}>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>Payment</h2>
          <div className="info">
            <div className="info-row">
              <span>Total suits</span>
              <span>{totalSuits}</span>
            </div>
            <div className="info-row">
              <span>Total amount</span>
              <span>{money(totalPrice)}</span>
            </div>
          </div>
          <div className="field mt">
            <label>Advance received</label>
            <input className="input" type="number" min="0" name="advancePaid" value={form.advancePaid} onChange={handleChange} placeholder="0" />
          </div>
          <div className="info mt">
            <div className="info-row total-row">
              <span>Balance</span>
              <span>{money(Math.max(0, totalPrice - advance))}</span>
            </div>
          </div>
          <button className="btn btn-primary btn-lg btn-block mt" disabled={saving || uploading}>
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create order'}
          </button>
        </div>
      </form>
    </>
  );
}
