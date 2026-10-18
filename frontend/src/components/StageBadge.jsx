import { STAGES } from '../utils/helpers';

export default function StageBadge({ order }) {
  const stage = STAGES.find((s) => s.key === order.stage) || STAGES[0];

  if (order.isOverdue) {
    return <span className="badge tone-danger">Late · {stage.label}</span>;
  }
  return <span className={`badge ${stage.tone}`}>{stage.label}</span>;
}
