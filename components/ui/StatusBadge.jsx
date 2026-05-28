import { STATUS } from '../../lib/data';

const CONFIG = {
  [STATUS.DONE]: {
    label: 'Done',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-700/50',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },
  [STATUS.IN_PROGRESS]: {
    label: 'In Progress',
    className: 'bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-900/50 dark:text-cyan-300 dark:border-cyan-700/50',
    dot: 'bg-cyan-500 dark:bg-cyan-400',
  },
  [STATUS.NEEDS_DECISION]: {
    label: 'Needs Decision',
    className: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700/50',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  [STATUS.DEFERRED]: {
    label: 'Deferred',
    className: 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-600/50',
    dot: 'bg-slate-500 dark:bg-slate-400',
  },
  [STATUS.LOCKED]: {
    label: 'Locked',
    className: 'bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-900/50 dark:text-violet-300 dark:border-violet-700/50',
    dot: 'bg-violet-500 dark:bg-violet-400',
  },
  [STATUS.PENDING]: {
    label: 'Pending',
    className: 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-700/50',
    dot: 'bg-sky-500 dark:bg-sky-400',
  },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const cfg = CONFIG[status] || CONFIG[STATUS.PENDING];
  const sizeClass = size === 'xs' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${sizeClass} ${cfg.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
      {cfg.label}
    </span>
  );
}
