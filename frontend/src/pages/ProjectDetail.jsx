import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import TaskCard from '../components/TaskCard';

const COLUMNS = [
  { id: 'todo', label: 'To Do', icon: '○', color: 'text-ink-400', border: 'border-ink-700', bg: 'bg-ink-900' },
  { id: 'in-progress', label: 'In Progress', icon: '◐', color: 'text-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-500/5' },
  { id: 'done', label: 'Done', icon: '●', color: 'text-jade-400', border: 'border-jade-500/30', bg: 'bg-jade-500/5' },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', deadline: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/${id}`),
      ]);
      setProject(projRes.data.project);
      setTasks(taskRes.data.tasks);
    } catch (err) {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return toast.error('Task title is required');
    setSubmitting(true);
    try {
      const res = await api.post('/tasks', { ...taskForm, projectId: id });
      setTasks([res.data.task, ...tasks]);
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', assignedTo: '', deadline: '' });
      toast.success('Task created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return toast.error('Email is required');
    setSubmitting(true);
    try {
      const res = await api.put(`/projects/${id}/members`, { email: memberEmail });
      setProject(res.data.project);
      setShowMemberModal(false);
      setMemberEmail('');
      toast.success('Member added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? res.data.task : t));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const tasksByStatus = (status) => tasks.filter(t => t.status === status);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-64 bg-ink-800 rounded-lg" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-ink-900 rounded-xl border border-ink-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-400">Project not found</p>
        <Link to="/projects" className="text-amber-400 mt-3 inline-block">← Back to Projects</Link>
      </div>
    );
  }

  const isCreator = project.createdBy?._id === user?._id;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Link to="/projects" className="text-ink-500 hover:text-ink-300 text-sm transition-colors">
              Projects
            </Link>
            <span className="text-ink-700">/</span>
            <span className="text-ink-400 text-sm truncate">{project.title}</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-ink-100 truncate">{project.title}</h1>
          {project.description && (
            <p className="text-ink-500 text-sm mt-1">{project.description}</p>
          )}
        </div>

        {isAdmin && isCreator && (
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setShowMemberModal(true)} className="btn-secondary text-sm">
              + Member
            </button>
            <button onClick={() => setShowTaskModal(true)} className="btn-primary text-sm">
              + Task
            </button>
          </div>
        )}
      </div>

      {/* Members */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-ink-600 font-mono">TEAM</span>
        <div className="flex -space-x-2">
          {project.members?.map((member) => (
            <div
              key={member._id}
              className="w-7 h-7 rounded-full bg-ink-700 border-2 border-ink-950 flex items-center justify-center text-xs font-medium text-ink-300 cursor-default"
              title={`${member.name} (${member.role})`}
            >
              {member.name?.[0]?.toUpperCase()}
            </div>
          ))}
        </div>
        <span className="text-xs text-ink-600">{project.members?.length} member{project.members?.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Task count badges */}
      <div className="flex gap-2 flex-wrap">
        {COLUMNS.map(col => (
          <span key={col.id} className={`text-xs font-mono px-2 py-1 rounded-full border ${
            col.id === 'todo' ? 'badge-todo' :
            col.id === 'in-progress' ? 'badge-inprogress' : 'badge-done'
          }`}>
            {col.label}: {tasksByStatus(col.id).length}
          </span>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className={`rounded-xl border ${col.border} ${col.bg} p-4 flex flex-col min-h-[400px]`}>
            {/* Column header */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-lg ${col.color}`}>{col.icon}</span>
              <span className={`font-display font-semibold text-sm ${col.color}`}>{col.label}</span>
              <span className="ml-auto bg-ink-800 text-ink-400 text-xs font-mono w-5 h-5 rounded-full flex items-center justify-center">
                {tasksByStatus(col.id).length}
              </span>
            </div>

            {/* Tasks */}
            <div className="flex flex-col gap-3 flex-1">
              {tasksByStatus(col.id).length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-ink-700 text-xs text-center">No tasks here</p>
                </div>
              ) : (
                tasksByStatus(col.id).map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    isAdmin={isAdmin && isCreator}
                    currentStatus={col.id}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteTask}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm text-ink-400 mb-1.5 font-medium">Task title *</label>
            <input
              value={taskForm.title}
              onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="What needs to be done?"
              className="input-field"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm text-ink-400 mb-1.5 font-medium">Description</label>
            <textarea
              value={taskForm.description}
              onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="More details..."
              className="input-field resize-none"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm text-ink-400 mb-1.5 font-medium">Assign to</label>
            <select
              value={taskForm.assignedTo}
              onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
              className="input-field"
            >
              <option value="">Unassigned</option>
              {project.members?.map(m => (
                <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-ink-400 mb-1.5 font-medium">Deadline</label>
            <input
              type="date"
              value={taskForm.deadline}
              onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })}
              className="input-field"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Creating…' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Team Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm text-ink-400 mb-1.5 font-medium">Member email *</label>
            <input
              type="email"
              value={memberEmail}
              onChange={e => setMemberEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="input-field"
              autoFocus
            />
            <p className="text-xs text-ink-600 mt-1.5">The user must have an account on TaskForge</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowMemberModal(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Adding…' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
