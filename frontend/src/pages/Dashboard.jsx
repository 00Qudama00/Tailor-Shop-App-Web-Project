import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, CalendarClock, Scissors } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api';
import Loader from '../components/Loader';
import Empty from '../components/Empty';
import StageBadge from '../components/StageBadge';
import { dueText, daysLeft, money } from '../utils/helpers';

const tick = { fill: '#7b7266', fontSize: 12, fontFamily: 'IBM Plex Mono, monospace' };

function Stat({ to, label, value, note, alert }) {
  return (
    <Link to={to} className="card stat">
      <span className="stat-label">{label}</span>
      <div className={`stat-value ${alert ? 'alert' : ''}`}>{value}</div>
      {note && <div className="stat-note">{note}</div>}
    </Link>
  );
}

function MonthCell({ to, label, value }) {
  const Tag = to ? Link : 'div';
  return (
    <Tag to={to} className="month-cell">
      <span className="k">{label}</span>
      <span className="v">{value}</span>
    </Tag>
  );
}

function shortMoney(v) {
  return v >= 1000 ? `${Math.round(v / 1000)}k` : v;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard').then((res) => setData(res.data));
  }, []);

  if (!data) return <Loader />;

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const monthName = new Date().toLocaleDateString('en-GB', { month: 'long' });
  const profit = data.monthSales - data.monthExpenses;
  const lastIndex = data.chart.length - 1;

  return (
    <>
      <div className="hero">
        <div>
          <h1>{today}</h1>
          <p>
            {data.pending} {data.pending === 1 ? 'order' : 'orders'} on the table, {data.ready} ready for pickup
          </p>
        </div>
        <Link to="/orders/new" className="btn btn-primary">
          <Plus size={16} /> New order
        </Link>
      </div>

      <div className="grid grid-4 mb">
        <Stat to="/orders?status=pending" label="In progress" value={data.pending} note={`${data.urgent} marked urgent`} />
        <Stat to="/orders?status=ready" label="Ready for pickup" value={data.ready} note="Waiting for the customer" />
        <Stat to="/orders?status=overdue" label="Late" value={data.overdue} note="Past the promised date" alert={data.overdue > 0} />
        <Stat to="/orders" label="Balance to collect" value={money(data.balanceDue)} note="On open orders" />
      </div>

      <div className="card month-strip">
        <MonthCell to="/orders" label={`Sales in ${monthName}`} value={money(data.monthSales)} />
        <MonthCell to="/expenses" label="Expenses" value={money(data.monthExpenses)} />
        <MonthCell label="Profit" value={money(profit)} />
        <MonthCell to="/orders" label="Orders taken" value={data.monthOrders} />
        <MonthCell to="/customers" label="Customers" value={data.customers} />
        <MonthCell to="/employees" label="Kareegar" value={data.employees} />
      </div>

      <div className="split">
        <div className="card">
          <div className="card-head">
            <h2>Sales and expenses, last 6 months</h2>
            <div className="legend">
              <span>
                <i style={{ background: '#b04e25' }} /> Sales
              </span>
              <span>
                <i style={{ background: '#d9d3ca' }} /> Expenses
              </span>
            </div>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chart} barGap={4} barCategoryGap="28%">
                <CartesianGrid stroke="rgba(31,27,22,0.06)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={tick} dy={8} />
                <YAxis tickLine={false} axisLine={false} tick={tick} width={48} tickFormatter={shortMoney} />
                <Tooltip
                  formatter={(v) => money(v)}
                  cursor={{ fill: 'rgba(31,27,22,0.04)' }}
                  contentStyle={{ borderRadius: 8, border: '1px solid rgba(31,27,22,0.12)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', fontSize: 13 }}
                />
                <Bar dataKey="sales" name="Sales" fill="#b04e25" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="expenses" name="Expenses" fill="#d9d3ca" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {lastIndex >= 0 && (
            <div className="card-body muted small" style={{ borderTop: '1px solid var(--line)', paddingTop: 12, paddingBottom: 12 }}>
              {data.chart[lastIndex].month}: {money(data.chart[lastIndex].sales)} in, {money(data.chart[lastIndex].expenses)} out
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Due soon</h2>
            <Link to="/orders?status=pending" className="link small">
              View all
            </Link>
          </div>
          {data.dueSoon.length === 0 ? (
            <Empty icon={CalendarClock} title="Nothing due" text="No orders in progress" />
          ) : (
            data.dueSoon.map((order) => (
              <Link key={order.id} to={`/orders/${order.id}`} className="list-row">
                <span className="tag-no">#{order.orderNo}</span>
                <div className="grow">
                  <div className="cell-title">{order.customer?.name}</div>
                  <div className={`cell-sub ${daysLeft(order.dueDate) < 0 ? 'danger-text' : ''}`}>{dueText(order.dueDate)}</div>
                </div>
                {order.isUrgent && <span className="badge tone-danger plain">Urgent</span>}
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="card mt">
        <div className="card-head">
          <h2>Recent orders</h2>
          <Link to="/orders" className="link small">
            All orders
          </Link>
        </div>
        {data.recentOrders.length === 0 ? (
          <Empty icon={Scissors} title="No orders yet" text="New orders will show up here">
            <Link to="/orders/new" className="btn btn-primary">
              <Plus size={16} /> New order
            </Link>
          </Empty>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th className="text-right">Suits</th>
                  <th className="text-right">Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="clickable" onClick={() => navigate(`/orders/${order.id}`)}>
                    <td>
                      <span className="tag-no">#{order.orderNo}</span>
                    </td>
                    <td className="cell-title">{order.customer?.name}</td>
                    <td className="text-right">{order.totalSuits}</td>
                    <td className="num text-right">{money(order.totalPrice)}</td>
                    <td>
                      <StageBadge order={order} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
