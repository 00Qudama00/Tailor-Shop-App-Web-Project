import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2, Banknote, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import Empty from '../../components/Empty';
import ConfirmModal from '../../components/ConfirmModal';
import EmployeeModal from './EmployeeModal';
import { errorMessage, formatDate, money } from '../../utils/helpers';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [modal, setModal] = useState('');
  const [rates, setRates] = useState({});

  function load() {
    api.get(`/employees/${id}`).then((res) => {
      setData(res.data);
      const values = {};
      res.data.rates.forEach((r) => (values[r.suitTypeId] = r.salary));
      setRates(values);
    });
  }

  useEffect(load, [id]);

  async function saveRate(rate) {
    if (Number(rates[rate.suitTypeId]) === rate.salary) return;
    try {
      await api.put(`/employees/${id}/rates/${rate.suitTypeId}`, { salary: rates[rate.suitTypeId] });
      toast.success(`Rate for ${rate.name} saved`);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function paySalary() {
    try {
      const res = await api.post(`/employees/${id}/pay`);
      toast.success(res.data.message);
      setModal('');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/employees/${id}`);
      toast.success('Kareegar removed');
      navigate('/employees');
    } catch (err) {
      setModal('');
      toast.error(errorMessage(err));
    }
  }

  if (!data) return <Loader />;
  const { employee, unpaidWork } = data;
  const total = unpaidWork.reduce((sum, w) => sum + w.amount, 0);

  return (
    <>
      <PageHeader title={employee.name} subtitle={`${employee.position}${employee.phone ? ' · ' + employee.phone : ''}`} back="/employees">
        <button className="btn btn-outline" onClick={() => setModal('edit')}>
          <Pencil size={16} /> Edit
        </button>
        <button className="btn btn-danger" onClick={() => setModal('delete')}>
          <Trash2 size={16} /> Remove
        </button>
      </PageHeader>

      <div className="split">
        <div className="card">
          <div className="card-head">
            <h2>Unpaid work</h2>
            <span className="muted small">Suits marked ready but not paid yet</span>
          </div>
          {unpaidWork.length === 0 ? (
            <Empty icon={CheckCircle2} title="Nothing to pay" text="All finished work has been paid" />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Suit</th>
                    <th>Qty</th>
                    <th>Ready on</th>
                    <th className="text-right">Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidWork.map((w, i) => (
                    <tr key={i}>
                      <td>
                        <Link to={`/orders/${w.orderId}`} className="tag-no">
                          #{w.orderNo}
                        </Link>
                      </td>
                      <td>{w.customerName}</td>
                      <td>{w.suitTypeName}</td>
                      <td>{w.quantity}</td>
                      <td>{formatDate(w.readyDate)}</td>
                      <td className="num text-right">{money(w.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="stack">
          <div className="card card-pad">
            <div className="info">
              <div className="info-row">
                <span>Suits to pay for</span>
                <span>{unpaidWork.reduce((sum, w) => sum + w.quantity, 0)}</span>
              </div>
              <div className="info-row total-row">
                <span>Total to pay</span>
                <span>{money(total)}</span>
              </div>
            </div>
            <button className="btn btn-green btn-block mt" disabled={total === 0} onClick={() => setModal('pay')}>
              <Banknote size={16} /> Mark salary as paid
            </button>
          </div>

          {data.payments.length > 0 && (
            <div className="card card-pad">
              <h2 style={{ fontSize: 18, marginBottom: 8 }}>Past payments</h2>
              <div className="info">
                {data.payments.map((p) => (
                  <div key={p.id} className="info-row">
                    <span>{formatDate(p.date)}</span>
                    <span>{money(p.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-head">
              <h2>Pay per suit</h2>
            </div>
            <div className="card-body stack" style={{ gap: 12 }}>
              <p className="muted small">Change a rate and click outside the box to save. It is used for new orders.</p>
              {data.rates.map((r) => (
                <div key={r.suitTypeId} className="row between">
                  <div>
                    <div className="cell-title">{r.name}</div>
                    <div className="cell-sub">Default {money(r.defaultSalary)}</div>
                  </div>
                  <input
                    className="input"
                    style={{ width: 110 }}
                    type="number"
                    min="0"
                    value={rates[r.suitTypeId] ?? ''}
                    onChange={(e) => setRates({ ...rates, [r.suitTypeId]: e.target.value })}
                    onBlur={() => saveRate(r)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modal === 'edit' && (
        <EmployeeModal
          employee={employee}
          onClose={() => setModal('')}
          onSaved={() => {
            setModal('');
            load();
          }}
        />
      )}
      {modal === 'pay' && (
        <ConfirmModal
          title="Pay salary?"
          message={`Mark ${money(total)} as paid to ${employee.name}? It will also be added to this month's expenses.`}
          confirmText="Yes, paid"
          onConfirm={paySalary}
          onClose={() => setModal('')}
        />
      )}
      {modal === 'delete' && (
        <ConfirmModal
          title="Remove kareegar?"
          message={`${employee.name} will be removed. Old orders keep their records.`}
          confirmText="Remove"
          onConfirm={handleDelete}
          onClose={() => setModal('')}
        />
      )}
    </>
  );
}
