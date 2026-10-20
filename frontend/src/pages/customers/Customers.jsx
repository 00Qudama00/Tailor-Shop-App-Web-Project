import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Users, Pencil, Ruler, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import Empty from '../../components/Empty';
import ConfirmModal from '../../components/ConfirmModal';
import { errorMessage, formatDate, initials } from '../../utils/helpers';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      api.get('/customers', { params: { search } }).then((res) => {
        setCustomers(res.data);
        setLoading(false);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  async function handleDelete() {
    try {
      await api.delete(`/customers/${toDelete.id}`);
      setCustomers(customers.filter((c) => c.id !== toDelete.id));
      toast.success('Customer deleted');
      setToDelete(null);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <>
      <PageHeader title="Customers" subtitle="Everyone who has ordered from your shop">
        <Link to="/customers/new" className="btn btn-primary">
          <Plus size={16} /> Add customer
        </Link>
      </PageHeader>

      <div className="card">
        <div className="toolbar">
          <div className="input-icon search">
            <Search size={17} />
            <input className="input" placeholder="Search by name, phone or reg no..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span className="muted small">{customers.length} customers</span>
        </div>

        {loading ? (
          <Loader />
        ) : customers.length === 0 ? (
          <Empty icon={Users} title={search ? 'No match found' : 'No customers yet'} text={search ? 'Try a different name or number.' : 'Add your first customer to get started.'}>
            {!search && (
              <Link to="/customers/new" className="btn btn-primary">
                <Plus size={16} /> Add customer
              </Link>
            )}
          </Empty>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Reg #</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Measurements</th>
                  <th>Added</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="clickable" onClick={() => navigate(`/customers/${c.id}`)}>
                    <td>
                      <span className="tag-no">{c.regNo}</span>
                    </td>
                    <td>
                      <div className="row">
                        <div className="avatar">{initials(c.name)}</div>
                        <span className="cell-title">{c.name}</span>
                      </div>
                    </td>
                    <td>{c.phone}</td>
                    <td>
                      {c.measurement ? <span className="badge tone-olive">Saved</span> : <span className="badge tone-gold">Not taken</span>}
                    </td>
                    <td className="muted">{formatDate(c.createdAt)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="row-actions">
                        <Link to={`/customers/${c.id}/measurement`} className="icon-btn" title="Measurements">
                          <Ruler size={16} />
                        </Link>
                        <Link to={`/customers/${c.id}/edit`} className="icon-btn" title="Edit">
                          <Pencil size={16} />
                        </Link>
                        <button className="icon-btn danger" title="Delete" onClick={() => setToDelete(c)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toDelete && (
        <ConfirmModal
          title="Delete customer?"
          message={`${toDelete.name} and all of their orders will be removed. This cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setToDelete(null)}
        />
      )}
    </>
  );
}
