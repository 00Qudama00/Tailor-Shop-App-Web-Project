import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PageHeader({ title, subtitle, back, children }) {
  return (
    <div className="page-head">
      <div>
        {back && (
          <Link to={back} className="back-link">
            <ArrowLeft size={16} /> Back
          </Link>
        )}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="head-actions">{children}</div>}
    </div>
  );
}
