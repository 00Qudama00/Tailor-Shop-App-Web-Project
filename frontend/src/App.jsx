import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Loader from './components/Loader';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Customers from './pages/customers/Customers';
import CustomerForm from './pages/customers/CustomerForm';
import CustomerDetails from './pages/customers/CustomerDetails';
import MeasurementForm from './pages/customers/MeasurementForm';
import MeasurementCard from './pages/customers/MeasurementCard';
import Orders from './pages/orders/Orders';
import OrderForm from './pages/orders/OrderForm';
import OrderDetails from './pages/orders/OrderDetails';
import Invoice from './pages/orders/Invoice';
import WorkSlip from './pages/orders/WorkSlip';
import TrackOrder from './pages/orders/TrackOrder';
import Employees from './pages/employees/Employees';
import EmployeeDetails from './pages/employees/EmployeeDetails';
import SuitTypes from './pages/SuitTypes';
import Expenses from './pages/Expenses';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? children : <Navigate to="/login" replace />;
}

function Guest({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Guest><Login /></Guest>} />
      <Route path="/register" element={<Guest><Register /></Guest>} />
      <Route path="/verify-email" element={<Guest><VerifyEmail /></Guest>} />
      <Route path="/forgot-password" element={<Guest><ForgotPassword /></Guest>} />
      <Route path="/track/:id" element={<TrackOrder />} />

      <Route path="/orders/:id/invoice" element={<Private><Invoice /></Private>} />
      <Route path="/orders/:id/slip" element={<Private><WorkSlip /></Private>} />
      <Route path="/customers/:id/card" element={<Private><MeasurementCard /></Private>} />

      <Route element={<Private><Layout /></Private>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/new" element={<CustomerForm />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />
        <Route path="/customers/:id/edit" element={<CustomerForm />} />
        <Route path="/customers/:id/measurement" element={<MeasurementForm />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/new" element={<OrderForm />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/orders/:id/edit" element={<OrderForm />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/:id" element={<EmployeeDetails />} />
        <Route path="/suit-types" element={<SuitTypes />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
