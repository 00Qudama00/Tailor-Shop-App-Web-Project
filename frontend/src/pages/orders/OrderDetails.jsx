import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2, MessageCircle, FileText, Scissors, Check, Banknote, Copy, Ruler } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import WhatsAppModal from '../../components/WhatsAppModal';
import StageBadge from '../../components/StageBadge';
import MeasurementView from '../../components/MeasurementView';
import { STAGES, STYLE_OPTIONS, dueText, errorMessage, fileUrl, formatDate, money } from '../../utils/helpers';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [modal, setModal] = useState('');
  const [amount, setAmount] = useState('');
  const [receivedBy, setReceivedBy] = useState('Customer');
  const [backStage, setBackStage] = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data));
  }, [id]);

  async function changeStage(stage, extra = {}) {
    try {
      await api.post(`/orders/${id}/stage`, { stage, ...extra });
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
      setModal('');
      toast.success(`Order moved to ${stage}`);
      if (stage === 'Ready') setModal('whatsapp');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  function pickStage(stage) {
    const current = STAGES.findIndex((s) => s.key === order.stage);
    const picked = STAGES.findIndex((s) => s.key === stage);

    if (picked < current) {
      setBackStage(stage);
      setModal('back');
    } else if (stage === 'Delivered') {
      setModal('deliver');
    } else {
      changeStage(stage);
    }
  }

  async function addPayment() {
    try {
      await api.post(`/orders/${id}/payment`, { amount });
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
      setAmount('');
      setModal('');
      toast.success('Payment added');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function deleteOrder() {
    try {
      await api.delete(`/orders/${id}`);
      toast.success('Order deleted');
      navigate('/orders');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  function copyTrackLink() {
    navigator.clipboard.writeText(`${window.location.origin}/track/${id}`);
    toast.success('Tracking link copied');
  }

  if (!order) return <Loader />;

  const stageIndex = STAGES.findIndex((s) => s.key === order.stage);
  const nextStage = STAGES[stageIndex + 1];
  const customer = order.customer || {};

  return (
    <>
      <PageHeader title={`Order #${order.orderNo}`} subtitle={`Booked on ${formatDate(order.orderDate)}`} back="/orders">
        <Link to={`/orders/${id}/edit`} className="btn btn-outline">
          <Pencil size={16} /> Edit
        </Link>
        <button className="btn btn-whatsapp" onClick={() => setModal('whatsapp')}>
          <MessageCircle size={16} /> WhatsApp
        </button>
      </PageHeader>

      <div className="card card-pad mb">
        <div className="row between wrap mb">
          <div className="row">
            <StageBadge order={order} />
            {order.isUrgent && <span className="badge tone-danger plain">Urgent</span>}
          </div>
          {nextStage && (
            <button className="btn btn-green" onClick={() => pickStage(nextStage.key)}>
              <Check size={16} /> Mark as {nextStage.label}
            </button>
          )}
        </div>
        <div className="stages">
          {STAGES.map((s, i) => (
            <button
              key={s.key}
              className={`stage ${i < stageIndex ? 'done' : ''} ${i === stageIndex ? 'current' : ''}`}
              onClick={() => pickStage(s.key)}
              disabled={i === stageIndex}
              title={`Move to ${s.label}`}
            >
              <span className="stage-dot">{i < stageIndex ? <Check size={18} /> : i + 1}</span>
              <span>{s.label}</span>
              <span className="urdu" style={{ fontSize: 12, fontWeight: 400 }}>
                {s.urdu}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="split">
        <div className="stack">
          <div className="card">
            <div className="card-head">
              <h2>Suits</h2>
              <span className="muted small">{order.totalSuits} total</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Suit type</th>
                    <th>Kareegar</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="cell-title">{item.suitTypeName}</td>
                      <td>{item.employee ? item.employee.name : <span className="muted">Not assigned</span>}</td>
                      <td>{item.quantity}</td>
                      <td>{money(item.price)}</td>
                      <td className="num text-right">{money(item.quantity * item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Style & notes</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-2">
                {Object.entries(STYLE_OPTIONS).map(([field, group]) => {
                  const selected = group.options.find((o) => o.value === order[field]);
                  return (
                    <div key={field} className="measure-box">
                      <div className="en">{group.title}</div>
                      <div className="cell-title">{selected ? selected.en : 'Not selected'}</div>
                      {selected && <div className="urdu">{selected.urdu}</div>}
                    </div>
                  );
                })}
              </div>
              {order.notes && (
                <div className="notice tone-gold mt">
                  <strong>Note:</strong> {order.notes}
                </div>
              )}
              {(order.fabricPhoto || order.audioNote) && (
                <div className="grid grid-2 mt">
                  {order.fabricPhoto && (
                    <div className="field">
                      <span className="label">Fabric photo</span>
                      <a href={fileUrl(order.fabricPhoto)} target="_blank" rel="noreferrer">
                        <img src={fileUrl(order.fabricPhoto)} alt="fabric" className="photo" />
                      </a>
                    </div>
                  )}
                  {order.audioNote && (
                    <div className="field">
                      <span className="label">Voice note</span>
                      <audio src={fileUrl(order.audioNote)} controls style={{ width: '100%' }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Measurements</h2>
              <Link to={`/customers/${customer.id}/measurement`} className="btn btn-outline btn-sm">
                <Ruler size={15} /> Update
              </Link>
            </div>
            <div className="card-body">
              {customer.measurement ? <MeasurementView measurement={customer.measurement} /> : <p className="muted">No measurements saved for this customer.</p>}
            </div>
          </div>
        </div>

        <div className="stack">
          <div className="card card-pad">
            <Link to={`/customers/${customer.id}`} className="row mb">
              <div className="avatar">{(customer.name || '?')[0]}</div>
              <div>
                <div className="cell-title">{customer.name}</div>
                <div className="cell-sub">
                  Reg # {customer.regNo} · {customer.phone}
                </div>
              </div>
            </Link>
            <div className="info">
              <div className="info-row">
                <span>Delivery date</span>
                <span>{formatDate(order.dueDate)}</span>
              </div>
              {order.stage !== 'Delivered' && order.stage !== 'Ready' && (
                <div className="info-row">
                  <span>Time left</span>
                  <span className={order.isOverdue ? 'danger-text' : ''}>{dueText(order.dueDate)}</span>
                </div>
              )}
              {order.readyDate && (
                <div className="info-row">
                  <span>Ready on</span>
                  <span>{formatDate(order.readyDate)}</span>
                </div>
              )}
              {order.deliveredDate && (
                <div className="info-row">
                  <span>Delivered on</span>
                  <span>
                    {formatDate(order.deliveredDate)} ({order.receivedBy})
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="card card-pad">
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>Payment</h2>
            <div className="info">
              <div className="info-row">
                <span>Total</span>
                <span>{money(order.totalPrice)}</span>
              </div>
              <div className="info-row">
                <span>Paid</span>
                <span className="olive-text">{money(order.advancePaid)}</span>
              </div>
              <div className="info-row total-row">
                <span>Balance</span>
                <span>{money(order.balance)}</span>
              </div>
            </div>
            {order.balance > 0 && (
              <button className="btn btn-dark btn-block mt" onClick={() => setModal('payment')}>
                <Banknote size={16} /> Add payment
              </button>
            )}
          </div>

          <div className="card card-pad">
            <div className="stack" style={{ gap: 10 }}>
              <Link to={`/orders/${id}/invoice`} className="btn btn-outline btn-block">
                <FileText size={16} /> Print invoice
              </Link>
              <Link to={`/orders/${id}/slip`} className="btn btn-outline btn-block">
                <Scissors size={16} /> Print kareegar slip
              </Link>
              <button className="btn btn-outline btn-block" onClick={copyTrackLink}>
                <Copy size={16} /> Copy tracking link
              </button>
              <button className="btn btn-danger btn-block" onClick={() => setModal('delete')}>
                <Trash2 size={16} /> Delete order
              </button>
            </div>
          </div>
        </div>
      </div>

      {modal === 'whatsapp' && <WhatsAppModal order={order} shopName={user.shopName} onClose={() => setModal('')} />}

      {modal === 'payment' && (
        <Modal
          title="Add payment"
          onClose={() => setModal('')}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setModal('')}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={addPayment} disabled={!(Number(amount) > 0)}>
                Save payment
              </button>
            </>
          }
        >
          <div className="field">
            <label>Amount received</label>
            <input className="input" type="number" min="1" max={order.balance} value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
            <span className="hint">Remaining balance is {money(order.balance)}</span>
          </div>
        </Modal>
      )}

      {modal === 'deliver' && (
        <Modal
          title="Deliver order"
          onClose={() => setModal('')}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setModal('')}>
                Cancel
              </button>
              <button className="btn btn-green" onClick={() => changeStage('Delivered', { receivedBy })}>
                <Check size={16} /> Confirm delivery
              </button>
            </>
          }
        >
          {order.balance > 0 && (
            <div className="notice tone-gold mb">
              Collect the remaining {money(order.balance)} from the customer. It will be marked as paid.
            </div>
          )}
          <div className="field">
            <label>Received by</label>
            <input className="input" value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} />
          </div>
        </Modal>
      )}

      {modal === 'back' && (
        <ConfirmModal
          title={`Move back to ${backStage}?`}
          message={
            order.stage === 'Delivered'
              ? 'This order is already delivered. The delivery date will be cleared.'
              : 'Use this only if the order was marked by mistake.'
          }
          confirmText={`Move to ${backStage}`}
          onConfirm={() => changeStage(backStage)}
          onClose={() => setModal('')}
        />
      )}

      {modal === 'delete' && (
        <ConfirmModal
          title="Delete this order?"
          message={`Order #${order.orderNo} will be removed permanently.`}
          onConfirm={deleteOrder}
          onClose={() => setModal('')}
        />
      )}
    </>
  );
}
