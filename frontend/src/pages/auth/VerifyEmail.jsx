import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import AuthShell from '../../components/AuthShell';
import { errorMessage } from '../../utils/helpers';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-email', { email, otp });
      login(res.data.token, res.data.user);
      toast.success('Email verified');
      navigate('/');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    try {
      await api.post('/auth/resend-otp', { email, purpose: 'verify' });
      toast.success('A new code has been sent.');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <AuthShell title="Check your email" subtitle={`Enter the 6 digit code we sent to ${email || 'your email'}.`}>
      <form onSubmit={handleSubmit}>
        <input
          className="input otp-input"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
          placeholder="000000"
          inputMode="numeric"
          autoFocus
          required
        />
        <button className="btn btn-primary btn-lg btn-block" disabled={loading || otp.length !== 6}>
          {loading ? 'Verifying...' : 'Verify email'}
        </button>
      </form>
      <p className="auth-foot">
        Didn&apos;t get the code?{' '}
        <button className="link" onClick={resend}>
          Send again
        </button>
        <br />
        <Link to="/login" className="link">
          Back to login
        </Link>
      </p>
    </AuthShell>
  );
}
