import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';
import Loader from '../../components/Loader';
import PrintShell from '../../components/PrintShell';
import { MEASUREMENTS, STYLE_OPTIONS, formatDate } from '../../utils/helpers';

export default function WorkSlip() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data));
  }, [id]);

  if (!order) return <Loader />;
  const m = order.customer?.measurement || {};
  const fields = [...MEASUREMENTS.qameez, ...MEASUREMENTS.shalwar];

  return (
    <PrintShell title={`Kareegar Slip #${order.orderNo}`} right={`Due: ${formatDate(order.dueDate)}${order.isUrgent ? ' · URGENT' : ''}`}>
      <p style={{ marginBottom: 14 }}>
        <strong>{order.customer?.name}</strong> · Reg # {order.customer?.regNo}
      </p>

      <table style={{ marginBottom: 18 }}>
        <thead>
          <tr>
            <th>Suit type</th>
            <th>Qty</th>
            <th>Kareegar</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <td>{item.suitTypeName}</td>
              <td>{item.quantity}</td>
              <td>{item.employee?.name || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table style={{ marginBottom: 18 }}>
        <thead>
          <tr>
            <th colSpan={4}>Measurements (inches)</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f, i) =>
            i % 2 === 0 ? (
              <tr key={f.key}>
                <td className="urdu" style={{ textAlign: 'right' }}>
                  {f.urdu}
                </td>
                <td style={{ fontWeight: 700, fontSize: 18 }}>{m[f.key] ?? '-'}</td>
                {fields[i + 1] ? (
                  <>
                    <td className="urdu" style={{ textAlign: 'right' }}>
                      {fields[i + 1].urdu}
                    </td>
                    <td style={{ fontWeight: 700, fontSize: 18 }}>{m[fields[i + 1].key] ?? '-'}</td>
                  </>
                ) : (
                  <td colSpan={2} />
                )}
              </tr>
            ) : null
          )}
        </tbody>
      </table>

      <table>
        <tbody>
          {Object.entries(STYLE_OPTIONS).map(([field, group]) => {
            const selected = group.options.find((o) => o.value === order[field]);
            return (
              <tr key={field}>
                <td>{group.title}</td>
                <td className="urdu" style={{ textAlign: 'right', fontSize: 16 }}>
                  {selected ? selected.urdu : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {(order.notes || m.notes) && (
        <p style={{ marginTop: 16 }}>
          <strong>Notes:</strong> {order.notes} {m.notes}
        </p>
      )}
    </PrintShell>
  );
}
