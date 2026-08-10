import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import logo from '../assets/logo.png';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slowConnection, setSlowConnection] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading) { setSlowConnection(false); return undefined; }
    const timer = window.setTimeout(() => setSlowConnection(true), 3000);
    return () => window.clearTimeout(timer);
  }, [loading]);

  const handleSubmit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const response = await api.post('/users/login', formData, { timeout: 30000 });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/dashboard');
    } catch (requestError) {
      if (requestError.code === 'ECONNABORTED') {
        setError('Sign-in took too long. Check your internet connection and try again.');
      } else if (!requestError.response) {
        setError('The TrackIt server is not available. Start the backend and try again.');
      } else if (requestError.response.status === 401) {
        setError('The email or password is incorrect.');
      } else {
        setError(requestError.response.data?.message || 'Sign-in failed. Please try again.');
      }
    }
    finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <section className="login-visual" aria-label="TrackIt introduction">
        <div className="login-brand"><img src={logo} alt="TrackIt" /></div>
        <div className="login-message">
          <h1>Turn every internship into <span>measurable progress.</span></h1>
          <p>One focused workspace for assignments, daily updates, submissions and supervisor feedback.</p>
        </div>
        <div className="login-points"><span>Role-based access</span><span>Progress at a glance</span><span>Clear feedback loops</span></div>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <div className="login-brand mobile-brand"><img src={logo} alt="TrackIt" /></div>
          <h2>Welcome back</h2>
          <p>Sign in to continue to your workspace.</p>
          <form onSubmit={handleSubmit} noValidate>
            <div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" name="email" value={formData.email} onChange={(e) => setFormData({...formData,email:e.target.value})} placeholder="name@company.com" autoComplete="email" required /></div>
            <div className="field"><div className="password-row"><label htmlFor="password">Password</label><button type="button" className="text-action" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div><input id="password" type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={(e) => setFormData({...formData,password:e.target.value})} placeholder="Enter your password" autoComplete="current-password" required /></div>
            {error && <div className="login-error" role="alert">{error}</div>}
            <button className="login-button" disabled={loading}>{loading ? 'Signing in…' : 'Sign in to TrackIt'}</button>
            {slowConnection && <div className="login-connection-note" role="status"><span className="mini-spinner" />Connecting securely to TrackIt. The first sign-in may take a few seconds.</div>}
          </form>
          <p className="login-help">Need access? Contact your internship supervisor.</p>
        </div>
      </section>
    </div>
  );
}
