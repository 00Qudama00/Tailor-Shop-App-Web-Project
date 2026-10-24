import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, ClipboardList } from 'lucide-react';
import api from '../../api';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import Empty from '../../components/Empty';
import StageBadge from '../../components/StageBadge';
import { daysLeft, dueText, formatDate, money } from '../../utils/helpers';

const TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'In progress' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'overdue', label: 'Late' },
  { key: 'ready', label: 'Ready' },
  { key: 'delivered', label: 'Delivered' },
];

export default function Orders() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      api.get('/orders', { params: { status, search } }).then((res) => {
        setOrders(res.data);
        setLoading(false);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [status, search]);

  return (
    <>
      <PageHeader title="Orders" subtitle="Track every suit from cutting to delivery">
        <Link to="/orders/new" className="btn btn-primary">
          <Plus size={16} /> New order
        </Link>
      </PageHeader>

      <div className="card">
        <div className="toolbar">
          <div className="tabs">
            {TABS.map((t) => (
              <button key={t.key} className={`tab ${status === t.key ? 'active' : ''}`} onClick={() => setParams(t.key ? { status: t.key } : {})}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="input-icon search">
            <Search size={17} />
            <input className="input" placeholder="Order # or customer..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : orders.length === 0 ? (
          <Empty icon={ClipboardList} title="No orders here" text="Orders you create will show up in this list" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Suits</th>
                  <th>Due date</th>
                  <th>Total</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const late = o.stage !== 'Ready' && o.stage !== 'Delivered' && daysLeft(o.dueDate) < 0;
                  return (
                    <tr key={o.id} className="clickable" onClick={() => navigate(`/orders/${o.id}`)}>
                      <td>
                        <span className="tag-no">#{o.orderNo}</span>
                      </td>
                      <td>
                        <div className="cell-title">{o.customer?.name}</div>
                        <div className="cell-sub">{o.customer?.phone}</div>
                      </td>
                      <td>{o.totalSuits}</td>
                      <td>
                        <div>{formatDate(o.dueDate)}</div>
                        {o.stage !== 'Delivered' && o.stage !== 'Ready' && (
                          <div className={`cell-sub ${late ? 'danger-text' : ''}`}>{dueText(o.dueDate)}</div>
                        )}
                      </td>
                      <td className="num">{money(o.totalPrice)}</td>
                      <td className={o.balance > 0 ? 'danger-text' : 'olive-text'}>{o.balance > 0 ? money(o.balance) : 'Paid'}</td>
                      <td>
                        <div className="row">
                          <StageBadge order={o} />
                          {o.isUrgent && o.stage !== 'Delivered' && <span className="badge tone-danger plain">Urgent</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
