import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, supabaseReady } from '../lib/supabase.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabaseReady) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/admin', { replace: true });
    });
  }, [navigate]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (err) {
      setError('Wrong email or password.');
      return;
    }
    navigate('/admin', { replace: true });
  }

  return (
    <main className="login-page">
      <form className="card narrow" onSubmit={submit}>
        <img className="logo big" src="/logo.jpg" alt="" width="64" height="64" />
        <h1 className="page-title">Admin login</h1>
        <p className="help">Lelay Store: Ink &amp; Crafts</p>

        {!supabaseReady ? (
          <p className="notice warn">Supabase is not connected yet. Add the keys from .env.example.</p>
        ) : null}

        <div className="field">
          <label htmlFor="admin-email">Email</label>
          <input id="admin-email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="admin-password">Password</label>
          <input id="admin-password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error ? <p className="notice error" role="alert">{error}</p> : null}

        <button className="btn primary" type="submit" disabled={busy || !supabaseReady}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <Link className="help" to="/">
          Back to site
        </Link>
      </form>
    </main>
  );
}
