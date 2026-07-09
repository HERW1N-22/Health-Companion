import { useState } from 'react';

export default function AuthPanel({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    const payload = mode === 'login' ? { email: form.email, password: form.password } : { name: form.name, email: form.email, password: form.password };
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || 'Authentication failed');
      return;
    }
    localStorage.setItem('token', data.token);
    onAuthenticated(data.token);
  };

  return (
    <div className="panel glass-card" style={{ marginTop: 16 }}>
      <h3>{mode === 'login' ? 'Login to your dashboard' : 'Create your account'}</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className="secondary-btn" onClick={() => setMode('login')}>Login</button>
        <button className="secondary-btn" onClick={() => setMode('signup')}>Sign up</button>
      </div>
      <form onSubmit={submit} className="form-grid">
        {mode === 'signup' && (
          <label style={{ gridColumn: '1 / -1' }}>
            Name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ava" />
          </label>
        )}
        <label style={{ gridColumn: '1 / -1' }}>
          Email
          <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" />
        </label>
        <label style={{ gridColumn: '1 / -1' }}>
          Password
          <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="••••••" />
        </label>
        {error && <div style={{ color: '#fda4af', gridColumn: '1 / -1' }}>{error}</div>}
        <button className="primary-btn" type="submit">{mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
    </div>
  );
}
