import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

// Lets an existing admin approve people who signed up on /admin/login.
export default function AdminsPanel({ myEmail }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('admins').select('email').order('email');
    if (error) setMsg({ type: 'error', text: error.message });
    else setAdmins(data.map((r) => r.email));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function add(e) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!value) return;
    setBusy(true);
    setMsg({ type: '', text: '' });
    const { error } = await supabase.from('admins').insert({ email: value });
    setBusy(false);
    if (error) {
      setMsg({
        type: 'error',
        text: error.code === '23505' ? 'That email is already an admin.' : error.message,
      });
      return;
    }
    setEmail('');
    setMsg({ type: 'ok', text: `${value} can now open the dashboard.` });
    load();
  }

  async function remove(target) {
    setMsg({ type: '', text: '' });
    const { error } = await supabase.from('admins').delete().eq('email', target);
    if (error) setMsg({ type: 'error', text: error.message });
    else load();
  }

  return (
    <section>
      <div className="card">
        <h2 className="page-title" style={{ fontSize: '1.25rem' }}>Admins</h2>
        <p className="help">
          People sign up on the admin login page, then you approve them here by typing the same email.
        </p>

        <form className="field inline grow" onSubmit={add} style={{ marginTop: '1rem' }}>
          <label htmlFor="new-admin">Approve an email</label>
          <input
            id="new-admin"
            type="email"
            required
            placeholder="staff@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn sm primary" type="submit" disabled={busy}>
            {busy ? 'Adding…' : 'Add admin'}
          </button>
        </form>

        {msg.text ? <p className={`notice ${msg.type === 'error' ? 'error' : 'okmsg'}`}>{msg.text}</p> : null}

        {loading ? (
          <p className="help">Loading…</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0', display: 'grid', gap: '0.5rem' }}>
            {admins.map((a) => (
              <li key={a} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="wrapany">
                  {a}
                  {a === myEmail?.toLowerCase() ? <span className="help"> (you)</span> : null}
                </span>
                {a !== myEmail?.toLowerCase() ? (
                  <button className="btn sm ghost" type="button" onClick={() => remove(a)}>
                    Remove
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
