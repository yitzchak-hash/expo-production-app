import { STATUS } from '../../lib/data';

const CONFIG = {
  [STATUS.DONE]: {
    label: 'Done',
    className: 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50',
    dot: 'bg-emerald-400',
  },
  [STATUS.IN_PROGRESS]: {
    label: 'In Progress',
    className: 'bg-cyan-900/50 text-cyan-300 border border-cyan-700/50',
    dot: 'bg-cyan-400',
  },
  [STATUS.NEEDS_DECISION]: {
    label: 'Needs Decision',
    className: 'bg-amber-900/50 text-amber-300 border border-amber-700/50',
    dot: 'bg-amber-400',
  },
  [STATUS.DEFERRED]: {
    label: 'Deferred',
    className: 'bg-slate-800/80 text-slate-400 border border-slate-600/50',
    dot: 'bg-slate-400',
  },
  [STATUS.LOCKED]: {
    label: 'Locked',
    className: 'bg-violet-900/50 text-violet-300 border border-violet-700/50',
    dot: 'bg-violet-400',
  },
  [STATUS.PENDING]: {
    label: 'Pending',
    className: 'bg-sky-900/50 text-sky-300 border border-sky-700/50',
    dot: 'bg-sky-400',
  },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const cfg = CONFIG[status] || CONFIG[STATUS.PENDING];
  const sizeClass = size === 'xs' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClass} ${cfg.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
      {cfg.label}
    </span>
  );
}
