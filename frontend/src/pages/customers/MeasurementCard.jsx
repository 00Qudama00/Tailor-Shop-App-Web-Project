import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';
import Loader from '../../components/Loader';
import PrintShell from '../../components/PrintShell';
import { MEASUREMENTS, formatDate } from '../../utils/helpers';

function MeasureTable({ title, fields, measurement }) {
  return (
    <table style={{ marginBottom: 18 }}>
      <thead>
        <tr>
          <th colSpan={3}>{title}</th>
        </tr>
      </thead>
      <tbody>
        {fields.map((f) => (
          <tr key={f.key}>
            <td>{f.en}</td>
            <td className="urdu" style={{ textAlign: 'right' }}>
              {f.urdu}
            </td>
            <td style={{ width: 100, fontWeight: 700, fontSize: 18 }}>{measurement[f.key] ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function MeasurementCard() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    api.get(`/customers/${id}`).then((res) => setCustomer(res.data.customer));
  }, [id]);

  if (!customer) return <Loader />;
  const m = customer.measurement || {};

  return (
    <PrintShell title="Measurement Card" right={`Printed ${formatDate(new Date())}`}>
      <p style={{ marginBottom: 16 }}>
        <strong>{customer.name}</strong> · Reg # {customer.regNo} · {customer.phone}
      </p>
      <div className="grid grid-2">
        <MeasureTable title="Qameez (inches)" fields={MEASUREMENTS.qameez} measurement={m} />
        <MeasureTable title="Shalwar (inches)" fields={MEASUREMENTS.shalwar} measurement={m} />
      </div>
      {m.notes && (
        <p>
          <strong>Notes:</strong> {m.notes}
        </p>
      )}
    </PrintShell>
  );
}
