import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Pencil, Ruler, Printer, Plus, Phone, MapPin, ClipboardList, MessageCircle } from 'lucide-react';
import api from '../../api';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import Empty from '../../components/Empty';
import StageBadge from '../../components/StageBadge';
import MeasurementView from '../../components/MeasurementView';
import { formatDate, money, whatsappLink } from '../../utils/helpers';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/customers/${id}`).then((res) => setData(res.data));
  }, [id]);

  if (!data) return <Loader />;
  const { customer, orders } = data;
  const totalSpent = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const balance = orders.reduce((sum, o) => sum + o.balance, 0);

  return (
    <>
      <PageHeader title={customer.name} subtitle={`Registration # ${customer.regNo}`} back="/customers">
        <Link to={`/customers/${id}/edit`} className="btn btn-outline">
          <Pencil size={16} /> Edit
        </Link>
        <Link to={`/orders/new?customer=${id}`} className="btn btn-primary">
          <Plus size={16} /> New order
        </Link>
      </PageHeader>

      <div className="split">
        <div className="stack">
          <div className="card">
            <div className="card-head">
              <h2>Measurements</h2>
              <div className="row">
                {customer.measurement && (
                  <Link to={`/customers/${id}/card`} className="btn btn-outline btn-sm">
                    <Printer size={15} /> Print card
                  </Link>
                )}
                <Link to={`/customers/${id}/measurement`} className="btn btn-dark btn-sm">
                  <Ruler size={15} /> {customer.measurement ? 'Update' : 'Add'}
                </Link>
              </div>
            </div>
            <div className="card-body">
              {customer.measurement ? (
                <MeasurementView measurement={customer.measurement} />
              ) : (
                <Empty icon={Ruler} title="No measurements yet" text="Take the measurements once and use them for every order">
                  <Link to={`/customers/${id}/measurement`} className="btn btn-primary">
                    <Ruler size={16} /> Add measurements
                  </Link>
                </Empty>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Order history</h2>
              <span className="muted small">{orders.length} orders</span>
            </div>
            {orders.length === 0 ? (
              <Empty icon={ClipboardList} title="No orders yet" />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Date</th>
                      <th>Due</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="clickable" onClick={() => navigate(`/orders/${o.id}`)}>
                        <td>
                          <span className="tag-no">#{o.orderNo}</span>
                        </td>
                        <td>{formatDate(o.orderDate)}</td>
                        <td>{formatDate(o.dueDate)}</td>
                        <td className="num">{money(o.totalPrice)}</td>
                        <td>
                          <StageBadge order={o} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="card card-pad">
          <div className="info">
            <div className="info-row">
              <span className="row">
                <Phone size={15} /> Phone
              </span>
              <span>{customer.phone}</span>
            </div>
            <div className="info-row">
              <span className="row">
                <MapPin size={15} /> Address
              </span>
              <span>{customer.address || '-'}</span>
            </div>
            <div className="info-row">
              <span>Customer since</span>
              <span>{formatDate(customer.createdAt)}</span>
            </div>
            <div className="info-row">
              <span>Total orders</span>
              <span>{orders.length}</span>
            </div>
            <div className="info-row">
              <span>Total business</span>
              <span>{money(totalSpent)}</span>
            </div>
            <div className="info-row total-row">
              <span>Balance due</span>
              <span>{money(balance)}</span>
            </div>
          </div>
          <a
            href={whatsappLink(customer.phone, `Assalam o Alaikum ${customer.name},`)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-whatsapp btn-block mt"
          >
            <MessageCircle size={16} /> Message on WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
