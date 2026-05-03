const isOverdue = (deadline, status) => {
  if (!deadline || status === 'done') return false;
  return new Date(deadline) < new Date();
};

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export default function TaskCard({ task, isAdmin, currentStatus, onStatusChange, onDelete }) {
  const overdue = isOverdue(task.deadline, task.status);

  return (
    <div
      className={`bg-ink-950 rounded-lg p-3.5 border transition-all duration-200 hover:border-ink-600 group ${
        overdue ? 'border-rose-500/40 bg-rose-500/5' : 'border-ink-800'
      }`}
    >
      {/* Top: title + delete */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className={`text-sm font-medium leading-snug ${overdue ? 'text-rose-300' : 'text-ink-200'}`}>
          {task.title}
        </h4>
        {isAdmin && (
          <button
            onClick={() => onDelete(task._id)}
            className="opacity-0 group-hover:opacity-100 text-ink-700 hover:text-rose-400 transition-all text-xs shrink-0"
          >
            ✕
          </button>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-ink-600 text-xs leading-relaxed mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Overdue badge */}
      {overdue && (
        <div className="flex items-center gap-1 mb-2">
          <span className="badge-overdue">⚠ Overdue</span>
        </div>
      )}

      {/* Bottom: assignee + deadline + status change */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-ink-800/50">
        <div className="flex items-center gap-2 min-w-0">
          {task.assignedTo ? (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-ink-700 flex items-center justify-center text-xs text-ink-400 shrink-0">
                {task.assignedTo.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-xs text-ink-500 truncate">{task.assignedTo.name}</span>
            </div>
          ) : (
            <span className="text-xs text-ink-700">Unassigned</span>
          )}
        </div>

        {task.deadline && (
          <span className={`text-xs font-mono shrink-0 ${overdue ? 'text-rose-400' : 'text-ink-600'}`}>
            {formatDate(task.deadline)}
          </span>
        )}
      </div>

      {/* Status selector */}
      <div className="mt-2">
        <select
          value={task.status}
          onChange={e => onStatusChange(task._id, e.target.value)}
          className={`w-full text-xs rounded-md px-2 py-1.5 border transition-colors cursor-pointer font-mono focus:outline-none focus:ring-1 focus:ring-amber-500/30 ${
            task.status === 'todo'
              ? 'bg-ink-800 border-ink-700 text-ink-400'
              : task.status === 'in-progress'
              ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
              : 'bg-jade-500/10 border-jade-500/30 text-jade-400'
          }`}
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-ink-900 text-ink-200">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
