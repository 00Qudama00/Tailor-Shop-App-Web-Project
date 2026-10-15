import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';
import AuthShell from '../../components/AuthShell';
import { errorMessage } from '../../utils/helpers';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function sendCode(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success(res.data.message);
      setStep(2);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e) {
    e.preventDefault();
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { email, otp, password });
      toast.success(res.data.message);
      navigate('/login');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (step === 1) {
    return (
      <AuthShell title="Forgot password?" subtitle="Enter your email and we will send you a reset code">
        <form onSubmit={sendCode}>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <button className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset code'}
          </button>
        </form>
        <p className="auth-foot">
          <Link to="/login" className="link">
            Back to login
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" subtitle={`Enter the code sent to ${email} and choose a new password.`}>
      <form onSubmit={resetPassword}>
        <div className="field">
          <label>Reset code</label>
          <input
            className="input otp-input"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="000000"
            inputMode="numeric"
            required
          />
        </div>
        <div className="field">
          <label>New password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn btn-primary btn-lg btn-block" disabled={loading || otp.length !== 6}>
          {loading ? 'Saving...' : 'Change password'}
        </button>
      </form>
      <p className="auth-foot">
        <button className="link" onClick={() => setStep(1)}>
          Use a different email
        </button>
      </p>
    </AuthShell>
  );
}
