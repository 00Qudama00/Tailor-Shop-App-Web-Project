import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';
import AuthShell from '../../components/AuthShell';
import { errorMessage } from '../../utils/helpers';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters.');
    }
    if (form.password !== form.confirm) {
      return toast.error('Passwords do not match.');
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      toast.success(res.data.message);
      navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Set up your shop in less than a minute">
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Your name</label>
          <input className="input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Ahmed Ali" required />
        </div>
        <div className="field">
          <label>Email</label>
          <input className="input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
        </div>
        <div className="field">
          <label>Phone (optional)</label>
          <input className="input" name="phone" value={form.phone} onChange={handleChange} placeholder="03xx xxxxxxx" />
        </div>
        <div className="form-grid">
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Confirm password</label>
            <input className="input" type="password" name="confirm" value={form.confirm} onChange={handleChange} required />
          </div>
        </div>
        <button className="btn btn-primary btn-lg btn-block" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="auth-foot">
        Already have an account?{' '}
        <Link to="/login" className="link">
          Login
        </Link>
      </p>
    </AuthShell>
  );
}
