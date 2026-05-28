import { useState } from 'react';
import CopyButton from './CopyButton';
import StatusBadge from './StatusBadge';
import { STATUS } from '../../lib/data';

export default function DecisionCard({ decision, onUpdate }) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(decision.notes || '');
  const isRtl = decision.lang === 'he';

  const handleSelect = option => onUpdate({ ...decision, selected: option, status: STATUS.DONE });
  const handleReset = () => onUpdate({ ...decision, selected: null, status: STATUS.NEEDS_DECISION });
  const handleSaveNote = () => { onUpdate({ ...decision, notes: noteDraft }); setEditingNote(false); };

  const copyText = decision.selected
    ? `Q: ${decision.question}\nA: ${decision.selected}${decision.notes ? '\nNotes: ' + decision.notes : ''}`
    : `Q: ${decision.question}\n[No decision yet]`;

  return (
    <div className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-xl p-4 space-y-3 shadow-sm dark:shadow-none">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div dir={isRtl ? 'rtl' : 'ltr'}
          className={`font-medium text-slate-800 dark:text-slate-100 text-sm leading-snug ${isRtl ? 'text-right font-hebrew' : ''}`}>
          {decision.question}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={decision.status} size="xs" />
          <CopyButton text={copyText} label="Copy" />
          {decision.selected && (
            <button onClick={handleReset}
              className="text-xs text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors p-1 rounded hover:bg-slate-100 dark:hover:bg-navy-700"
              title="Reset decision">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2" dir={isRtl ? 'rtl' : 'ltr'}>
        {decision.options.map((option, i) => {
          const sel = decision.selected === option;
          return (
            <button key={i} onClick={() => handleSelect(option)}
              className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-all ${
                sel
                  ? 'bg-brand-cyan/10 dark:bg-brand-cyan/20 border-brand-cyan text-cyan-700 dark:text-cyan-200 font-medium'
                  : 'bg-slate-50 dark:bg-navy-900/60 border-slate-200 dark:border-navy-600 text-slate-700 dark:text-slate-300 hover:border-brand-cyan/50'
              } ${isRtl ? 'text-right font-hebrew' : 'text-left'}`}>
              <span className="flex items-center gap-2">
                <span className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                  sel ? 'border-brand-cyan bg-brand-cyan' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {sel && (
                    <svg className="w-2 h-2 text-white dark:text-navy-900" fill="currentColor" viewBox="0 0 8 8">
                      <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z" />
                    </svg>
                  )}
                </span>
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {decision.selected && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 rounded-lg px-3 py-2">
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">Selected</div>
          <div dir={isRtl ? 'rtl' : 'ltr'}
            className={`text-sm text-emerald-700 dark:text-emerald-200 font-medium ${isRtl ? 'text-right font-hebrew' : ''}`}>
            {decision.selected}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="border-t border-slate-100 dark:border-navy-600/50 pt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-500 font-medium">Notes</span>
          <button onClick={() => { setNoteDraft(decision.notes || ''); setEditingNote(!editingNote); }}
            className="text-xs text-slate-400 hover:text-brand-cyan transition-colors">
            {editingNote ? 'Cancel' : 'Edit'}
          </button>
        </div>
        {editingNote ? (
          <div className="space-y-2">
            <textarea value={noteDraft} onChange={e => setNoteDraft(e.target.value)}
              dir={isRtl ? 'rtl' : 'ltr'} rows={3}
              className={`w-full bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-600 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-cyan ${isRtl ? 'text-right' : ''}`}
              placeholder="Add notes..." />
            <button onClick={handleSaveNote}
              className="text-xs px-3 py-1 bg-brand-cyan/20 border border-brand-cyan/50 text-brand-cyan rounded hover:bg-brand-cyan/30">
              Save note
            </button>
          </div>
        ) : (
          <div dir={isRtl ? 'rtl' : 'ltr'}
            className={`text-xs text-slate-500 dark:text-slate-400 whitespace-pre-wrap ${isRtl ? 'text-right font-hebrew' : ''}`}>
            {decision.notes || <span className="italic text-slate-400 dark:text-slate-600">No notes</span>}
          </div>
        )}
      </div>
    </div>
  );
}
