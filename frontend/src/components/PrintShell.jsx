import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fileUrl } from '../utils/helpers';

export default function PrintShell({ title, right, children }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="print-page">
      <div className="print-bar no-print">
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        <button className="btn btn-primary" onClick={() => window.print()}>
          <Printer size={16} /> Print
        </button>
      </div>

      <div className="print-sheet">
        <div className="print-header">
          <div className="row" style={{ gap: 14 }}>
            <img src={user.logo ? fileUrl(user.logo) : '/default-logo.svg'} alt="" />
            <div>
              <h2>{user.shopName}</h2>
              <div className="small">
                {user.shopAddress} {user.shopPhone && `· ${user.shopPhone}`}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3>{title}</h3>
            <div className="small">{right}</div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
