import { MEASUREMENTS } from '../utils/helpers';

function Group({ title, color, fields, measurement }) {
  return (
    <div className="measure-group">
      <div className="measure-group-title">
        <span className="dot" style={{ background: color }} />
        {title}
      </div>
      <div className="measure-grid">
        {fields.map((f) => (
          <div key={f.key} className="measure-box">
            <div className="urdu">{f.urdu}</div>
            <div className="en">{f.en}</div>
            <div className="value">
              {measurement[f.key] ?? '-'} {measurement[f.key] != null && <small>in</small>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MeasurementView({ measurement }) {
  return (
    <>
      <Group title="Qameez" color="var(--accent)" fields={MEASUREMENTS.qameez} measurement={measurement} />
      <Group title="Shalwar" color="var(--olive)" fields={MEASUREMENTS.shalwar} measurement={measurement} />
      {measurement.notes && (
        <div className="notice tone-gold">
          <strong>Note:</strong> {measurement.notes}
        </div>
      )}
    </>
  );
}
