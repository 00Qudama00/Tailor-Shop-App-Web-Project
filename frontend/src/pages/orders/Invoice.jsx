import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';
import Loader from '../../components/Loader';
import PrintShell from '../../components/PrintShell';
import { formatDate, money } from '../../utils/helpers';

export default function Invoice() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data));
  }, [id]);

  if (!order) return <Loader />;

  return (
    <PrintShell title={`Invoice #${order.orderNo}`} right={`Date: ${formatDate(order.orderDate)}`}>
      <div className="row between" style={{ marginBottom: 18, alignItems: 'flex-start' }}>
        <div>
          <div className="small">Bill to</div>
          <strong>{order.customer?.name}</strong>
          <div className="small">
            Reg # {order.customer?.regNo} · {order.customer?.phone}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="small">Delivery date</div>
          <strong>{formatDate(order.dueDate)}</strong>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Suit type</th>
            <th>Qty</th>
            <th>Rate</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={item.id}>
              <td>{i + 1}</td>
              <td>{item.suitTypeName}</td>
              <td>{item.quantity}</td>
              <td>{money(item.price)}</td>
              <td style={{ textAlign: 'right' }}>{money(item.quantity * item.price)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={4} style={{ textAlign: 'right' }}>
              <strong>Total</strong>
            </td>
            <td style={{ textAlign: 'right' }}>
              <strong>{money(order.totalPrice)}</strong>
            </td>
          </tr>
          <tr>
            <td colSpan={4} style={{ textAlign: 'right' }}>
              Paid
            </td>
            <td style={{ textAlign: 'right' }}>{money(order.advancePaid)}</td>
          </tr>
          <tr>
            <td colSpan={4} style={{ textAlign: 'right' }}>
              <strong>Balance</strong>
            </td>
            <td style={{ textAlign: 'right' }}>
              <strong>{money(order.balance)}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      <p className="small" style={{ marginTop: 18 }}>
        Please bring this slip when collecting your order. Track online: {window.location.origin}/track/{order.id}
      </p>

      <div className="print-sign">
        <div>Customer signature</div>
        <div>Shop stamp</div>
      </div>
    </PrintShell>
  );
}
