import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import AuthShell from '../../components/AuthShell';
import { errorMessage } from '../../utils/helpers';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      toast.success(`Signed in as ${res.data.user.name}`);
      navigate('/');
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        toast(err.response.data.message);
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
      } else {
        toast.error(errorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your shop register">
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Email</label>
          <div className="input-icon">
            <Mail size={17} />
            <input className="input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>
        </div>
        <div className="field">
          <label>Password</label>
          <div className="input-icon">
            <Lock size={17} />
            <input className="input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Your password" required />
          </div>
        </div>
        <div className="auth-links">
          <span />
          <Link to="/forgot-password" className="link">
            Forgot password?
          </Link>
        </div>
        <button className="btn btn-primary btn-lg btn-block" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="auth-foot">
        New here?{' '}
        <Link to="/register" className="link">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
