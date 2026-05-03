import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon, color, sublabel }) => (
  <div className={`card hover:border-ink-700 group`}>
    <div className="flex items-start justify-between mb-3">
      <div className={`text-2xl ${color}`}>{icon}</div>
      <span className={`font-display text-4xl font-bold ${color}`}>{value}</span>
    </div>
    <div className="text-ink-300 font-medium text-sm">{label}</div>
    {sublabel && <div className="text-ink-600 text-xs mt-0.5">{sublabel}</div>}
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, projRes] = await Promise.all([
        api.get('/tasks/dashboard/stats'),
        api.get('/projects'),
      ]);
      setStats(statsRes.data.stats);
      setProjects(projRes.data.projects.slice(0, 4));
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-ink-800 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-ink-900 rounded-xl border border-ink-800" />
          ))}
        </div>
      </div>
    );
  }

  const completionRate = stats?.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-100 mb-1">
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-ink-500 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-mono border ${
            user?.role === 'admin'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-jade-500/10 text-jade-400 border-jade-500/20'
          }`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tasks"
          value={stats?.total ?? 0}
          icon="◎"
          color="text-ink-300"
          sublabel="across all projects"
        />
        <StatCard
          label="Completed"
          value={stats?.completed ?? 0}
          icon="✓"
          color="text-jade-400"
          sublabel={`${completionRate}% completion rate`}
        />
        <StatCard
          label="In Progress"
          value={stats?.inProgress ?? 0}
          icon="◐"
          color="text-sky-400"
          sublabel="currently active"
        />
        <StatCard
          label="Overdue"
          value={stats?.overdue ?? 0}
          icon="⚠"
          color={stats?.overdue > 0 ? 'text-rose-400' : 'text-ink-500'}
          sublabel={stats?.overdue > 0 ? 'needs attention' : 'all on track'}
        />
      </div>

      {/* Progress bar */}
      {stats?.total > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-ink-300">Overall Progress</span>
            <span className="text-sm font-mono text-amber-400">{completionRate}%</span>
          </div>
          <div className="h-2 bg-ink-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-ink-600 font-mono">
            <span>{stats.completed} done</span>
            <span>{stats.total - stats.completed} remaining</span>
          </div>
        </div>
      )}

      {/* Recent projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-ink-200">
            {user?.role === 'admin' ? 'Your Projects' : 'Assigned Projects'}
          </h2>
          <Link to="/projects" className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium">
            View all →
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3 opacity-30">◫</div>
            <p className="text-ink-500 text-sm">No projects yet</p>
            {user?.role === 'admin' && (
              <Link to="/projects" className="inline-block mt-3 btn-primary text-sm py-1.5">
                Create a project
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="card hover:border-ink-700 hover:bg-ink-800/40 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-500/20">
                    <span className="text-amber-400 text-sm">◫</span>
                  </div>
                  <span className="text-xs text-ink-600 font-mono">
                    {project.members?.length} member{project.members?.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <h3 className="font-semibold text-ink-200 group-hover:text-amber-400 transition-colors mb-1">
                  {project.title}
                </h3>
                {project.description && (
                  <p className="text-ink-500 text-xs line-clamp-2">{project.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
