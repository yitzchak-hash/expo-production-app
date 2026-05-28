import { useState } from 'react';
import StatusBadge from './StatusBadge';
import { STATUS } from '../../lib/data';

const ALL_STATUSES = [
  STATUS.DONE,
  STATUS.IN_PROGRESS,
  STATUS.NEEDS_DECISION,
  STATUS.DEFERRED,
  STATUS.LOCKED,
];

export default function SectionWrapper({
  id,
  icon,
  title,
  status,
  onStatusChange,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [changingStatus, setChangingStatus] = useState(false);

  return (
    <div
      id={`section-${id}`}
      className="bg-navy-800/80 border border-navy-600/80 rounded-2xl overflow-hidden scroll-mt-4"
    >
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-navy-700/40 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <span className="text-brand-cyan text-lg shrink-0">{icon}</span>
          )}
          <span className="font-semibold text-slate-100 text-base">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <div onClick={(e) => e.stopPropagation()}>
            {changingStatus ? (
              <div className="flex items-center gap-1.5">
                <select
                  value={status}
                  onChange={(e) => {
                    onStatusChange(e.target.value);
                    setChangingStatus(false);
                  }}
                  className="text-xs bg-navy-900 border border-navy-600 rounded-md px-2 py-1 text-slate-200 focus:outline-none focus:border-brand-cyan"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setChangingStatus(false)}
                  className="text-xs text-slate-500 hover:text-slate-300 px-1"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setChangingStatus(true)}
                className="hover:opacity-80 transition-opacity"
                title="Change status"
              >
                <StatusBadge status={status} />
              </button>
            )}
          </div>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="px-5 pb-5 pt-2 border-t border-navy-600/50 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
