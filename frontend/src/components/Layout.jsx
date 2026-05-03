import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NavItem = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group ${
      active
        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
        : 'text-ink-400 hover:text-ink-100 hover:bg-ink-800'
    }`}
  >
    <span className={`text-lg ${active ? 'text-amber-400' : 'text-ink-500 group-hover:text-ink-300'}`}>
      {icon}
    </span>
    {label}
  </Link>
);

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const nav = (
    <nav className="flex flex-col gap-1">
      <NavItem to="/dashboard" icon="⬡" label="Dashboard" active={location.pathname === '/dashboard'} />
      <NavItem to="/projects" icon="◫" label="Projects" active={location.pathname.startsWith('/projects')} />
    </nav>
  );

  return (
    <div className="min-h-screen bg-ink-950 flex">
      {/* Sidebar – desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-ink-900 border-r border-ink-800 p-5 gap-6 fixed h-full z-20">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-1 mb-2">
          <div className="w-7 h-7 bg-amber-500 rounded-md flex items-center justify-center">
            <span className="text-ink-950 font-display font-bold text-sm">T</span>
          </div>
          <span className="font-display font-bold text-ink-100 text-lg tracking-tight">TaskForge</span>
        </div>

        {nav}

        <div className="mt-auto flex flex-col gap-3">
          <div className="px-3 py-3 bg-ink-800/50 rounded-lg border border-ink-700/50">
            <div className="text-xs text-ink-500 font-mono mb-0.5">Signed in as</div>
            <div className="text-sm font-medium text-ink-200 truncate">{user?.name}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${user?.role === 'admin' ? 'bg-amber-400' : 'bg-jade-400'}`} />
              <span className="text-xs text-ink-400 font-mono capitalize">{user?.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-ink-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg transition-all duration-200 border border-transparent hover:border-rose-500/20">
            ↪ Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-ink-900 border-b border-ink-800 z-30 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-500 rounded-md flex items-center justify-center">
            <span className="text-ink-950 font-display font-bold text-xs">T</span>
          </div>
          <span className="font-display font-bold text-ink-100 tracking-tight">TaskForge</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-ink-400 hover:text-ink-100 p-1"
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-20" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-ink-900 border-r border-ink-800 p-5 flex flex-col gap-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2.5 px-1 mt-12">
              <span className="font-display font-bold text-ink-100 text-lg">Menu</span>
            </div>
            {nav}
            <div className="mt-auto">
              <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/5 rounded-lg transition-all">
                ↪ Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-60 pt-14 md:pt-0 min-h-screen">
        <div className="max-w-6xl mx-auto p-6 md:p-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
