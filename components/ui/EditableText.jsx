import { useState, useRef, useEffect } from 'react';
import CopyButton from './CopyButton';
import StatusBadge from './StatusBadge';

export default function EditableText({
  value,
  onChange,
  status,
  label,
  lang = 'en',
  note,
  multiline = true,
  showStatus = true,
  showCopy = true,
  className = '',
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef(null);
  const isRtl = lang === 'he';

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      const len = ref.current.value.length;
      ref.current.setSelectionRange(len, len);
    }
  }, [editing]);

  const handleSave = () => { onChange(draft); setEditing(false); };
  const handleCancel = () => { setDraft(value); setEditing(false); };

  return (
    <div className={`space-y-2 ${className}`}>
      {(label || showStatus || showCopy) && (
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {label && <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{label}</span>}
            {showStatus && status && <StatusBadge status={status} size="xs" />}
          </div>
          <div className="flex items-center gap-2">
            {showCopy && !editing && <CopyButton text={value} />}
            {!editing && (
              <button onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-brand-cyan transition-colors px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-navy-700">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            )}
          </div>
        </div>
      )}

      {note && <p className="text-xs text-amber-600 dark:text-amber-400/80 italic">{note}</p>}

      {editing ? (
        <div className="space-y-2">
          {multiline ? (
            <textarea
              ref={ref}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              dir={isRtl ? 'rtl' : 'ltr'}
              rows={Math.max(4, (draft || '').split('\n').length + 1)}
              className={`w-full bg-slate-50 dark:bg-navy-900 border border-brand-cyan/50 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-cyan resize-y ${isRtl ? 'text-right font-hebrew' : ''}`}
            />
          ) : (
            <input
              ref={ref}
              type="text"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              dir={isRtl ? 'rtl' : 'ltr'}
              className={`w-full bg-slate-50 dark:bg-navy-900 border border-brand-cyan/50 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-cyan ${isRtl ? 'text-right' : ''}`}
            />
          )}
          <div className="flex gap-2">
            <button onClick={handleSave}
              className="text-xs px-3 py-1.5 bg-brand-cyan/20 border border-brand-cyan/50 text-brand-cyan rounded-md hover:bg-brand-cyan/30 transition-colors">
              Save
            </button>
            <button onClick={handleCancel}
              className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-navy-700 border border-slate-200 dark:border-navy-600 text-slate-600 dark:text-slate-400 rounded-md hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div dir={isRtl ? 'rtl' : 'ltr'}
          className={`text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed ${isRtl ? 'text-right font-hebrew' : ''}`}>
          {value || <span className="text-slate-400 dark:text-slate-500 italic">No content yet</span>}
        </div>
      )}
    </div>
  );
}
