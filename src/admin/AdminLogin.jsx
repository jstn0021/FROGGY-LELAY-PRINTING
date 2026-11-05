import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, supabaseReady } from '../lib/supabase.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (!supabaseReady) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/admin', { replace: true });
    });
  }, [navigate]);

  function switchMode(next) {
    setMode(next);
    setError('');
    setInfo('');
    setPassword('');
    setConfirm('');
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setInfo('');

    if (mode === 'signup') {
      if (password.length < 8) return setError('Password must be at least 8 characters.');
      if (password !== confirm) return setError('The two passwords do not match.');
    }

    setBusy(true);
    if (mode === 'signin') {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      setBusy(false);
      if (err) return setError('Wrong email or password.');
      navigate('/admin', { replace: true });
      return;
    }

    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/admin/login` },
    });
    setBusy(false);
    if (err) {
      return setError(
        /registered|already/i.test(err.message)
          ? 'That email already has an account. Try signing in.'
          : 'Could not create the account. Please try again.'
      );
    }
    // Supabase hides "already registered" for confirmed emails by returning no identities.
    if (data.user && data.user.identities?.length === 0) {
      return setError('That email already has an account. Try signing in.');
    }
    if (data.session) {
      navigate('/admin', { replace: true });
      return;
    }
    switchMode('signin');
    setInfo('Account created. Check your email to confirm it, then ask the store owner to approve you.');
  }

  const signup = mode === 'signup';

  return (
    <main className="login-page">
      <form className="card narrow" onSubmit={submit}>
        <img className="logo big" src="/logo.jpg" alt="" width="64" height="64" />
        <h1 className="page-title">{signup ? 'Create admin account' : 'Admin login'}</h1>
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
          <input
            id="admin-password"
            type="password"
            required
            minLength={signup ? 8 : undefined}
            autoComplete={signup ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {signup ? <span className="help">At least 8 characters.</span> : null}
        </div>
        {signup ? (
          <div className="field">
            <label htmlFor="admin-confirm">Confirm password</label>
            <input id="admin-confirm" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
        ) : null}

        {error ? <p className="notice error" role="alert">{error}</p> : null}
        {info ? <p className="notice okmsg" role="status">{info}</p> : null}

        <button className="btn primary" type="submit" disabled={busy || !supabaseReady}>
          {busy ? (signup ? 'Creating…' : 'Signing in…') : signup ? 'Sign up' : 'Sign in'}
        </button>

        <p className="help">
          {signup ? 'Already have an account? ' : 'No account yet? '}
          <button type="button" className="linklike" onClick={() => switchMode(signup ? 'signin' : 'signup')}>
            {signup ? 'Sign in' : 'Sign up'}
          </button>
        </p>
        {signup ? (
          <p className="help">A new account cannot see any orders until the store owner approves it.</p>
        ) : null}
        <Link className="help" to="/">
          Back to site
        </Link>
      </form>
    </main>
  );
}
