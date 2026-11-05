import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminGuard from './AdminGuard.jsx';
import OrdersPanel from './OrdersPanel.jsx';
import CoverPanel from './CoverPanel.jsx';

export default function Admin() {
  const [tab, setTab] = useState('orders');

  return (
    <AdminGuard>
      {({ email, signOut }) => (
        <>
          <header className="wrap admin-top">
            <div className="admin-brand">
              <img className="logo" src="/logo.jpg" alt="" width="44" height="44" />
              <div>
                <b>Admin</b>
                <span>{email}</span>
              </div>
            </div>
            <nav className="tabs" aria-label="Admin sections">
              <button type="button" className={tab === 'orders' ? 'on' : ''} onClick={() => setTab('orders')}>
                Orders
              </button>
              <button type="button" className={tab === 'cover' ? 'on' : ''} onClick={() => setTab('cover')}>
                Cover page
              </button>
            </nav>
            <div className="admin-actions">
              <Link className="btn sm" to="/">
                View site
              </Link>
              <button className="btn sm" type="button" onClick={signOut}>
                Sign out
              </button>
            </div>
          </header>
          <main className="wrap admin-main">{tab === 'orders' ? <OrdersPanel /> : <CoverPanel />}</main>
        </>
      )}
    </AdminGuard>
  );
}
