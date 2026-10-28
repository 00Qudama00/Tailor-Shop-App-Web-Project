import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, PackageSearch } from 'lucide-react';
import api from '../../api';
import Loader from '../../components/Loader';
import Empty from '../../components/Empty';
import { STAGES, fileUrl, formatDate, money } from '../../utils/helpers';

export default function TrackOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/orders/track/${id}`)
      .then((res) => setOrder(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load this order.'));
  }, [id]);

  if (error) {
    return (
      <div className="track-page">
        <div className="card track-card">
          <Empty icon={PackageSearch} title="Order not found" text={error} />
        </div>
      </div>
    );
  }

  if (!order) return <Loader />;
  const stageIndex = STAGES.findIndex((s) => s.key === order.stage);

  return (
    <div className="track-page">
      <div className="track-card">
        <div className="track-shop">
          <img src={order.shopLogo ? fileUrl(order.shopLogo) : '/default-logo.svg'} alt="" />
          <div>
            <h2>{order.shopName}</h2>
            {order.shopPhone && <div className="muted small">{order.shopPhone}</div>}
          </div>
        </div>

        <div className="card card-pad mb">
          <div className="row between mb">
            <div>
              <div className="muted small">Order</div>
              <h1 style={{ fontSize: 28 }}>#{order.orderNo}</h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="muted small">Hello</div>
              <div className="cell-title">{order.customerName}</div>
            </div>
          </div>
          <div className="stages">
            {STAGES.map((s, i) => (
              <div key={s.key} className={`stage ${i < stageIndex ? 'done' : ''} ${i === stageIndex ? 'current' : ''}`}>
                <span className="stage-dot">{i < stageIndex ? <Check size={18} /> : i + 1}</span>
                <span>{s.label}</span>
                <span className="urdu" style={{ fontSize: 12, fontWeight: 400 }}>
                  {s.urdu}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-pad">
          <div className="info">
            <div className="info-row">
              <span>Booked on</span>
              <span>{formatDate(order.orderDate)}</span>
            </div>
            <div className="info-row">
              <span>Delivery date</span>
              <span>{formatDate(order.dueDate)}</span>
            </div>
            <div className="info-row">
              <span>Suits</span>
              <span>{order.items.map((i) => `${i.quantity} × ${i.name}`).join(', ')}</span>
            </div>
            <div className="info-row">
              <span>Total</span>
              <span>{money(order.totalPrice)}</span>
            </div>
            <div className="info-row">
              <span>Paid</span>
              <span>{money(order.advancePaid)}</span>
            </div>
            <div className="info-row total-row">
              <span>Balance</span>
              <span>{money(order.balance)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
