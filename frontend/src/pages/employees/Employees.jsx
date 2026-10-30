import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Scissors, Phone } from 'lucide-react';
import api from '../../api';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import Empty from '../../components/Empty';
import EmployeeModal from './EmployeeModal';
import { initials, money } from '../../utils/helpers';

export default function Employees() {
  const [employees, setEmployees] = useState(null);
  const [showModal, setShowModal] = useState(false);

  function load() {
    api.get('/employees').then((res) => setEmployees(res.data));
  }

  useEffect(load, []);

  if (!employees) return <Loader />;
  const totalPending = employees.reduce((sum, e) => sum + e.pendingAmount, 0);

  return (
    <>
      <PageHeader title="Kareegar" subtitle={`Salary to pay: ${money(totalPending)}`}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add kareegar
        </button>
      </PageHeader>

      {employees.length === 0 ? (
        <div className="card">
          <Empty icon={Scissors} title="No kareegar yet" text="Add the people who stitch your suits to track their pay">
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Add kareegar
            </button>
          </Empty>
        </div>
      ) : (
        <div className="grid grid-3">
          {employees.map((emp) => (
            <Link key={emp.id} to={`/employees/${emp.id}`} className="card card-pad stat">
              <div className="row">
                <div className="avatar">{initials(emp.name)}</div>
                <div className="grow">
                  <div className="cell-title">{emp.name}</div>
                  <div className="cell-sub">{emp.position}</div>
                </div>
                {emp.pendingAmount > 0 ? <span className="badge tone-gold">Unpaid</span> : <span className="badge tone-olive">Paid</span>}
              </div>
              <div className="info">
                <div className="info-row">
                  <span>Suits done (unpaid)</span>
                  <span>{emp.pendingSuits}</span>
                </div>
                <div className="info-row total-row">
                  <span>To pay</span>
                  <span>{money(emp.pendingAmount)}</span>
                </div>
              </div>
              {emp.phone && (
                <div className="cell-sub row">
                  <Phone size={14} /> {emp.phone}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <EmployeeModal
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            load();
          }}
        />
      )}
    </>
  );
}
