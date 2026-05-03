import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

export default function ProjectsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Project title is required');
    setSubmitting(true);
    try {
      const res = await api.post('/projects', form);
      setProjects([res.data.project, ...projects]);
      setShowModal(false);
      setForm({ title: '', description: '' });
      toast.success('Project created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p._id !== id));
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-100 mb-1">Projects</h1>
          <p className="text-ink-500 text-sm">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <span>+</span> New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-ink-900 rounded-xl border border-ink-800 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-5xl mb-4 opacity-20">◫</div>
          <p className="text-ink-400 font-medium mb-1">No projects yet</p>
          <p className="text-ink-600 text-sm mb-4">
            {isAdmin ? 'Create your first project to get started' : 'You haven\'t been added to any projects'}
          </p>
          {isAdmin && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => (
            <div
              key={project._id}
              className="card hover:border-ink-700 group relative flex flex-col"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                  <span className="text-amber-400">◫</span>
                </div>
                {isAdmin && project.createdBy?._id === user?._id && (
                  <button
                    onClick={() => handleDelete(project._id)}
                    disabled={deletingId === project._id}
                    className="opacity-0 group-hover:opacity-100 text-ink-600 hover:text-rose-400 transition-all text-xs px-2 py-1 rounded-md hover:bg-rose-500/10"
                  >
                    {deletingId === project._id ? '…' : 'Delete'}
                  </button>
                )}
              </div>

              <Link to={`/projects/${project._id}`} className="flex-1">
                <h3 className="font-semibold text-ink-100 group-hover:text-amber-400 transition-colors mb-1.5 text-base">
                  {project.title}
                </h3>
                {project.description && (
                  <p className="text-ink-500 text-sm line-clamp-2 mb-3">{project.description}</p>
                )}
              </Link>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-ink-800">
                <div className="flex -space-x-1.5">
                  {project.members?.slice(0, 4).map((member, mi) => (
                    <div
                      key={member._id || mi}
                      className="w-6 h-6 rounded-full bg-ink-700 border border-ink-900 flex items-center justify-center text-xs font-medium text-ink-300"
                      title={member.name}
                    >
                      {member.name?.[0]?.toUpperCase()}
                    </div>
                  ))}
                  {project.members?.length > 4 && (
                    <div className="w-6 h-6 rounded-full bg-ink-800 border border-ink-900 flex items-center justify-center text-xs text-ink-500">
                      +{project.members.length - 4}
                    </div>
                  )}
                </div>
                <Link to={`/projects/${project._id}`} className="text-xs text-ink-500 hover:text-amber-400 transition-colors font-medium">
                  Open →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm text-ink-400 mb-1.5 font-medium">Project title *</label>
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="My Awesome Project"
              className="input-field"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm text-ink-400 mb-1.5 font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="What is this project about?"
              className="input-field resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
