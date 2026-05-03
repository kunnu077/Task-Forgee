import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');
    if (!isLogin && !form.name) return toast.error('Name is required');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await signup(form.name, form.email, form.password, form.role);
        toast.success('Account created!');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink-900 border-r border-ink-800 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-3/4 bg-gradient-to-b from-transparent via-ink-700 to-transparent" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-ink-950 font-display font-bold text-base">T</span>
            </div>
            <span className="font-display font-bold text-ink-100 text-2xl tracking-tight">TaskForge</span>
          </div>

          <div className="animate-slide-up">
            <h1 className="font-display text-4xl font-bold text-ink-100 leading-tight mb-4">
              Ship work.<br />
              <span className="text-amber-400">Together.</span>
            </h1>
            <p className="text-ink-400 text-lg leading-relaxed">
              A clean, focused task manager built for teams who care about getting things done — without the noise.
            </p>
          </div>
        </div>

        <div className="relative space-y-4">
          {[
            { icon: '⬡', text: 'Kanban boards for every project' },
            { icon: '◫', text: 'Role-based access control' },
            { icon: '◈', text: 'Real-time progress tracking' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-ink-400" style={{ animationDelay: `${i * 100}ms` }}>
              <span className="text-amber-500 text-lg">{item.icon}</span>
              <span className="text-sm">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-ink-950 font-display font-bold text-sm">T</span>
            </div>
            <span className="font-display font-bold text-ink-100 text-xl">TaskForge</span>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-ink-100 mb-2">
              {isLogin ? 'Sign in' : 'Create account'}
            </h2>
            <p className="text-ink-400 text-sm">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Link
                to={isLogin ? '/signup' : '/login'}
                className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm text-ink-400 mb-1.5 font-medium">Full name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="input-field"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-ink-400 mb-1.5 font-medium">Email address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm text-ink-400 mb-1.5 font-medium">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="input-field"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm text-ink-400 mb-1.5 font-medium">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="member">Member — Can update task status</option>
                  <option value="admin">Admin — Can create & manage projects</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />
                  {isLogin ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (
                isLogin ? 'Sign in →' : 'Create account →'
              )}
            </button>
          </form>

          {isLogin && (
            <div className="mt-6 p-4 bg-ink-900 rounded-lg border border-ink-800 text-xs text-ink-500">
              <div className="font-mono font-medium text-ink-400 mb-1">Demo accounts</div>
              <div>Admin: admin@demo.com / demo123</div>
              <div>Member: member@demo.com / demo123</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
