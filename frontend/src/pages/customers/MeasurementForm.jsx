import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import { MEASUREMENTS, errorMessage } from '../../utils/helpers';

const ALL_FIELDS = [...MEASUREMENTS.qameez, ...MEASUREMENTS.shalwar];

export default function MeasurementForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const doneUrl = params.get('next') === 'order' ? `/orders/new?customer=${id}` : `/customers/${id}`;
  const [customer, setCustomer] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/customers/${id}`).then((res) => {
      const c = res.data.customer;
      const m = c.measurement || {};
      const values = { notes: m.notes || '' };
      ALL_FIELDS.forEach((f) => {
        values[f.key] = m[f.key] ?? '';
      });
      setForm(values);
      setCustomer(c);
    });
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/customers/${id}/measurement`, form);
      toast.success('Measurements saved');
      navigate(doneUrl);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (!customer) return <Loader />;

  function renderGroup(title, color, fields) {
    return (
      <div className="measure-group">
        <div className="measure-group-title">
          <span className="dot" style={{ background: color }} />
          {title}
        </div>
        <div className="measure-grid">
          {fields.map((f) => (
            <label key={f.key} className="measure-box">
              <div className="urdu">{f.urdu}</div>
              <div className="en">{f.en}</div>
              <input type="number" step="0.25" min="0" name={f.key} value={form[f.key]} onChange={handleChange} placeholder="0" />
            </label>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Measurements" subtitle={`${customer.name} · Reg # ${customer.regNo} · all values in inches`} back={`/customers/${id}`} />

      <form className="card card-pad" onSubmit={handleSubmit}>
        {renderGroup('Qameez', 'var(--accent)', MEASUREMENTS.qameez)}
        {renderGroup('Shalwar', 'var(--olive)', MEASUREMENTS.shalwar)}

        <div className="field">
          <label>Special notes</label>
          <textarea className="textarea" name="notes" value={form.notes} onChange={handleChange} placeholder="e.g. loose fitting, extra long sleeves..." />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate(doneUrl)}>
            {params.get('next') === 'order' ? 'Skip for now' : 'Cancel'}
          </button>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save measurements'}
          </button>
        </div>
      </form>
    </>
  );
}
