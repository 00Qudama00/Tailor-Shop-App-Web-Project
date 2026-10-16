import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, Scissors, Shirt, Wallet, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fileUrl, initials } from '../utils/helpers';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/employees', label: 'Kareegar', icon: Scissors },
  { to: '/suit-types', label: 'Suit Types', icon: Shirt },
  { to: '/expenses', label: 'Expenses', icon: Wallet },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const logo = user.logo ? fileUrl(user.logo) : '/default-logo.svg';

  return (
    <div className="app">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <NavLink to="/settings" className="brand" title="Edit shop details">
          <img src={logo} alt="logo" />
          <div>
            <div className="brand-name">{user.shopName}</div>
            <div className="brand-sub">Tailoring register</div>
          </div>
        </NavLink>

        <nav className="nav">
          <div className="nav-label">Menu</div>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          <div className="nav-label">Account</div>
          <NavLink to="/settings">
            <Settings size={18} />
            Settings
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-box">
            <div className="avatar">{initials(user.name)}</div>
            <div>
              <div className="name">{user.name}</div>
              <div className="email">{user.email}</div>
            </div>
            <button className="logout" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <div className={`overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />

      <div className="main">
        <header className="topbar">
          <div className="row">
            <img src={logo} alt="logo" width="30" height="30" />
            <span className="brand-name">{user.shopName}</span>
          </div>
          <button className="menu-btn" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
