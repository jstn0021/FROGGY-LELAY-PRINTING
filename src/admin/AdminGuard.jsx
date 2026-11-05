import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { supabase, supabaseReady } from '../lib/supabase.js';

// Shows its children only to a logged-in user who is listed in the admins table.
// children is a function: ({ email, signOut }) => JSX
export default function AdminGuard({ children }) {
  const [state, setState] = useState('loading'); // loading | out | forbidden | ok
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!supabaseReady) return undefined;
    let alive = true;

    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (!session) {
        if (alive) setState('out');
        return;
      }
      const { data: ok, error } = await supabase.rpc('is_admin');
      if (!alive) return;
      setEmail(session.user.email ?? '');
      setState(!error && ok === true ? 'ok' : 'forbidden');
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && alive) setState('out');
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setState('out');
  }

  if (!supabaseReady) {
    return (
      <main className="wrap section">
        <div className="card narrow">
          <h1 className="page-title">Supabase is not connected</h1>
          <p>Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example), then restart.</p>
          <Link to="/">Back to site</Link>
        </div>
      </main>
    );
  }
  if (state === 'loading') {
    return (
      <main className="wrap section">
        <p className="help">Checking your login…</p>
      </main>
    );
  }
  if (state === 'out') return <Navigate to="/admin/login" replace />;
  if (state === 'forbidden') {
    return (
      <main className="wrap section">
        <div className="card narrow">
          <h1 className="page-title">Not an admin account</h1>
          <p>
            You are logged in as <b>{email}</b>, but this email is not in the admins table.
          </p>
          <div className="actions">
            <button className="btn" type="button" onClick={signOut}>
              Sign out
            </button>
            <Link className="btn" to="/">
              Back to site
            </Link>
          </div>
        </div>
      </main>
    );
  }
  return children({ email, signOut });
}
