import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAppData } from '../lib/store';
import { STATUS, SECTION_IDS } from '../lib/data';
import StatusBadge from '../components/ui/StatusBadge';
import CopyButton from '../components/ui/CopyButton';
import EditableText from '../components/ui/EditableText';
import DecisionCard from '../components/ui/DecisionCard';
import { LogoImage } from './index';

const SESSION_KEY = 'tzviair_auth';

const SECTIONS = [
  { id: SECTION_IDS.OVERVIEW,        label: 'Project Overview',          icon: '🏗', group: 'Overview' },
  { id: SECTION_IDS.CURRENT_STATUS,  label: 'Current Status',            icon: '📊', group: 'Overview' },
  { id: SECTION_IDS.BOOTH_WALL,      label: 'Booth Text + Wall Plan',    icon: '🖼', group: 'Content & Copy' },
  { id: SECTION_IDS.BROCHURE,        label: 'Brochure Text',             icon: '📄', group: 'Content & Copy' },
  { id: SECTION_IDS.ENTRANCE_FLYER,  label: 'Entrance Bag A4 Flyer',     icon: '📋', group: 'Content & Copy' },
  { id: SECTION_IDS.EMPLOYEE_PREP,   label: 'Employee Prep Materials',   icon: '👥', group: 'Content & Copy' },
  { id: SECTION_IDS.BOOTH_CHECKLIST, label: 'Booth Item Checklist',      icon: '✅', group: 'Operations' },
  { id: SECTION_IDS.ARCHITECT_LIST,  label: 'Architect Invite List',     icon: '📬', group: 'Operations' },
  { id: SECTION_IDS.LEAD_FORM,       label: 'Lead Form + Follow-Up',     icon: '📝', group: 'Operations' },
  { id: SECTION_IDS.RAFFLE,          label: 'Raffle / Lead Flow',        icon: '🎯', group: 'Operations' },
  { id: SECTION_IDS.SCREEN,          label: 'Screen Content',            icon: '🖥', group: 'Operations' },
  { id: SECTION_IDS.SETUP_DAY,       label: 'Setup Day Plan',            icon: '📅', group: 'Operations' },
  { id: SECTION_IDS.GRAPHIC_TASKS,   label: 'Graphic Designer Tasks',    icon: '🎨', group: 'Design' },
  { id: SECTION_IDS.NOTES_DECISIONS, label: 'Notes / Decisions',         icon: '🗒', group: 'Planning' },
];

const DEFAULT_STATUSES = {
  [SECTION_IDS.OVERVIEW]:        STATUS.IN_PROGRESS,
  [SECTION_IDS.CURRENT_STATUS]:  STATUS.IN_PROGRESS,
  [SECTION_IDS.BOOTH_WALL]:      STATUS.LOCKED,
  [SECTION_IDS.BROCHURE]:        STATUS.LOCKED,
  [SECTION_IDS.ENTRANCE_FLYER]:  STATUS.IN_PROGRESS,
  [SECTION_IDS.EMPLOYEE_PREP]:   STATUS.DONE,
  [SECTION_IDS.BOOTH_CHECKLIST]: STATUS.IN_PROGRESS,
  [SECTION_IDS.ARCHITECT_LIST]:  STATUS.IN_PROGRESS,
  [SECTION_IDS.LEAD_FORM]:       STATUS.DONE,
  [SECTION_IDS.RAFFLE]:          STATUS.DONE,
  [SECTION_IDS.SCREEN]:          STATUS.DONE,
  [SECTION_IDS.GRAPHIC_TASKS]:   STATUS.IN_PROGRESS,
  [SECTION_IDS.SETUP_DAY]:       STATUS.DEFERRED,
  [SECTION_IDS.NOTES_DECISIONS]: STATUS.IN_PROGRESS,
};

const STATUS_DOT = {
  [STATUS.DONE]:          'bg-emerald-500',
  [STATUS.IN_PROGRESS]:   'bg-cyan-500',
  [STATUS.NEEDS_DECISION]:'bg-amber-500',
  [STATUS.DEFERRED]:      'bg-slate-400',
  [STATUS.LOCKED]:        'bg-violet-500',
  [STATUS.PENDING]:       'bg-sky-500',
};

// ── Shared UI atoms ─────────────────────────────────────────────

function SyncIndicator({ status }) {
  if (status === 'synced')  return <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"/>Synced</span>;
  if (status === 'syncing') return <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 animate-pulse"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"/>Syncing…</span>;
  if (status === 'local')   return <span className="text-xs text-slate-500 flex items-center gap-1" title="Database not connected"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"/>Local only</span>;
  return null;
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <button onClick={onToggle}
      className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-navy-700 transition-colors"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
      {theme === 'dark' ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
        </svg>
      )}
    </button>
  );
}

function SectionDivider({ children }) {
  return (
    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
      <span className="h-px flex-1 bg-slate-200 dark:bg-navy-600/50"/>
      {children}
      <span className="h-px flex-1 bg-slate-200 dark:bg-navy-600/50"/>
    </h3>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-navy-600/50 rounded-xl p-4 shadow-sm dark:shadow-none ${className}`}>
      {children}
    </div>
  );
}

function InfoCard({ label, value, status, link, lang = 'en' }) {
  const isRtl = lang === 'he';
  return (
    <Card className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{label}</span>
        {status && <StatusBadge status={status} size="xs"/>}
      </div>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer"
          className="text-sm text-brand-cyan hover:text-cyan-600 dark:hover:text-cyan-300 underline underline-offset-2 break-all">{value}</a>
      ) : (
        <div dir={isRtl ? 'rtl' : 'ltr'}
          className={`text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap ${isRtl ? 'text-right font-hebrew' : ''}`}>
          {value}
        </div>
      )}
      {value && !link && <CopyButton text={value}/>}
    </Card>
  );
}

function ChecklistStatusBadge({ status }) {
  const map = {
    pending:   'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600',
    purchased: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50',
    brought:   'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700/50',
    assigned:  'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700/50',
    confirmed: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700/50',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || map.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ── Status changer dropdown ─────────────────────────────────────
function StatusChanger({ status, onChange }) {
  const [open, setOpen] = useState(false);
  const statuses = [STATUS.DONE, STATUS.IN_PROGRESS, STATUS.NEEDS_DECISION, STATUS.DEFERRED, STATUS.LOCKED];
  if (!open) return (
    <button onClick={() => setOpen(true)} className="hover:opacity-80 transition-opacity shrink-0">
      <StatusBadge status={status} size="xs"/>
    </button>
  );
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <select value={status} onChange={e => { onChange(e.target.value); setOpen(false); }}
        className="text-xs bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-600 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-cyan">
        {statuses.map(s => <option key={s} value={s}>{s.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
      </select>
      <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1">✕</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════

export default function Dashboard() {
  const router = useRouter();
  const { data, loaded, save, update, syncStatus } = useAppData();
  const [activeSection, setActiveSection] = useState(SECTION_IDS.OVERVIEW);
  const [theme, setTheme] = useState('dark');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newNoteText, setNewNoteText] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem(SESSION_KEY)) {
      router.replace('/');
    }
  }, [router]);

  useEffect(() => {
    const saved = localStorage.getItem('tzviair_theme') || 'dark';
    setTheme(saved);
    document.documentElement.classList.toggle('dark', saved === 'dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('tzviair_theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const getSectionStatus = id => data?.sectionStatuses?.[id] || DEFAULT_STATUSES[id] || STATUS.PENDING;
  const updateSectionStatus = (id, s) => update(`sectionStatuses.${id}`, s);
  const handleLogout = () => { sessionStorage.removeItem(SESSION_KEY); router.push('/'); };

  if (!loaded || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950">
        <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  const currentSection = SECTIONS.find(s => s.id === activeSection);

  // Build sidebar groups
  const groups = ['Overview', 'Content & Copy', 'Operations', 'Design', 'Planning'];

  return (
    <>
      <Head>
        <title>TzviAir — Expo Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
      </Head>

      <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-navy-950">

        {/* ── SIDEBAR ─────────────────────────────────────────── */}
        {sidebarOpen && (
          <aside className="w-64 shrink-0 flex flex-col h-full bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-navy-700/80 overflow-hidden">

            <div className="px-4 pt-5 pb-3 border-b border-slate-100 dark:border-navy-700/50 shrink-0">
              <LogoImage className="h-10 w-auto"/>
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-2 font-semibold tracking-widest uppercase">Expo Production</div>
            </div>

            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
              {groups.map(group => {
                const groupSections = SECTIONS.filter(s => s.group === group);
                return (
                  <div key={group}>
                    <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-1">{group}</div>
                    {groupSections.map(section => {
                      const st = getSectionStatus(section.id);
                      const isActive = activeSection === section.id;
                      return (
                        <button key={section.id} onClick={() => setActiveSection(section.id)}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left mb-0.5 transition-all duration-150 ${
                            isActive
                              ? 'bg-brand-cyan/10 dark:bg-brand-cyan/15 text-brand-cyan'
                              : 'text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-navy-700/60 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}>
                          <span className="text-sm shrink-0">{section.icon}</span>
                          <span className="text-xs font-medium flex-1 leading-tight">{section.label}</span>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[st] || 'bg-slate-400'}`}/>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </nav>

            <div className="px-3 py-3 border-t border-slate-200 dark:border-navy-700/50 shrink-0 flex items-center justify-between">
              <SyncIndicator status={syncStatus}/>
              <div className="flex items-center gap-1">
                <ThemeToggle theme={theme} onToggle={toggleTheme}/>
                <button onClick={handleLogout}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors">
                  Sign out
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* ── MAIN AREA ─────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden">

          <header className="shrink-0 flex items-center gap-3 px-5 py-3 bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-navy-700/50">
            <button onClick={() => setSidebarOpen(o => !o)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-base font-semibold text-slate-800 dark:text-slate-100 truncate">
                {currentSection?.icon} {currentSection?.label}
              </span>
            </div>

            <StatusChanger status={getSectionStatus(activeSection)} onChange={s => updateSectionStatus(activeSection, s)}/>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-5 py-6">
              <ActiveSectionContent
                id={activeSection}
                data={data}
                save={save}
                update={update}
                newNoteText={newNoteText}
                setNewNoteText={setNewNoteText}
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

// ── Section router ──────────────────────────────────────────────
function ActiveSectionContent({ id, data, save, update, newNoteText, setNewNoteText }) {
  const props = { data, save, update };
  switch (id) {
    case SECTION_IDS.OVERVIEW:        return <ProjectOverviewSection {...props}/>;
    case SECTION_IDS.CURRENT_STATUS:  return <CurrentStatusSection {...props}/>;
    case SECTION_IDS.BOOTH_WALL:      return <BoothWallSection {...props}/>;
    case SECTION_IDS.BROCHURE:        return <BrochureSection {...props}/>;
    case SECTION_IDS.ENTRANCE_FLYER:  return <EntranceFlyerSection {...props}/>;
    case SECTION_IDS.EMPLOYEE_PREP:   return <EmployeePrepSection {...props}/>;
    case SECTION_IDS.BOOTH_CHECKLIST: return <BoothChecklistSection {...props}/>;
    case SECTION_IDS.ARCHITECT_LIST:  return <ArchitectListSection {...props}/>;
    case SECTION_IDS.LEAD_FORM:       return <LeadFormSection {...props}/>;
    case SECTION_IDS.RAFFLE:          return <RaffleSection/>;
    case SECTION_IDS.SCREEN:          return <ScreenSection/>;
    case SECTION_IDS.GRAPHIC_TASKS:   return <GraphicTasksSection {...props}/>;
    case SECTION_IDS.SETUP_DAY:       return <SetupDaySection {...props}/>;
    case SECTION_IDS.NOTES_DECISIONS: return <NotesDecisionsSection {...props} newNoteText={newNoteText} setNewNoteText={setNewNoteText}/>;
    default: return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════

// 1. Project Overview — with live metrics
function ProjectOverviewSection({ data }) {
  const checklist = data.checklist || [];
  const isDone = s => ['purchased','brought','confirmed'].includes(s);
  const doneItems = checklist.filter(i => isDone(i.status)).length;
  const graphics = data.graphicTasks || [];
  const donegraphics = graphics.filter(t => t.status === STATUS.DONE).length;
  const doneWorkstreams = (data.workstreams || []).filter(w => w.status === STATUS.DONE).length;

  const metrics = [
    { label: 'Checklist', value: `${doneItems}/${checklist.length}`, sub: 'items confirmed', color: 'emerald', pct: checklist.length ? Math.round(doneItems / checklist.length * 100) : 0 },
    { label: 'Graphics',  value: `${donegraphics}/${graphics.length}`, sub: 'tasks done', color: 'cyan', pct: graphics.length ? Math.round(donegraphics / graphics.length * 100) : 0 },
    { label: 'Workstreams', value: `${doneWorkstreams}/${(data.workstreams||[]).length}`, sub: 'complete', color: 'brand-blue', pct: (data.workstreams||[]).length ? Math.round(doneWorkstreams / (data.workstreams||[]).length * 100) : 0 },
    { label: 'Lead App', value: 'Live', sub: 'tzviairfinal.vercel.app', color: 'violet', pct: 100 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map(m => (
          <div key={m.label} className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-navy-600/50 rounded-xl p-4 shadow-sm dark:shadow-none">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{m.label}</div>
            <div className={`text-2xl font-bold text-${m.color}-600 dark:text-${m.color}-400`}>{m.value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{m.sub}</div>
            <div className="mt-2 h-1.5 bg-slate-100 dark:bg-navy-700 rounded-full overflow-hidden">
              <div className={`h-full bg-${m.color}-500 dark:bg-${m.color}-400 rounded-full transition-all`} style={{ width: `${m.pct}%` }}/>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard label="Company" value="TzviAir — Boutique Air Conditioning, Beit Shemesh" status={STATUS.LOCKED}/>
        <InfoCard label="Core Message" value="Working with TzviAir strengthens the architect's name." status={STATUS.LOCKED}/>
        <InfoCard label="Top Kapa Headline" value="מיזוג אוויר עם צבי אייר מחזקת את המוניטין שלך" status={STATUS.LOCKED} lang="he"/>
        <InfoCard label="Lead App" value="tzviairfinal.vercel.app" status={STATUS.DONE} link="https://tzviairfinal.vercel.app/"/>
      </div>

      <div>
        <SectionDivider>Strategic Pillars</SectionDivider>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            'Owner-led responsibility — Tzvi personally involved throughout',
            'Complete project under one roof (AC, drainage, electrical, drywall, lighting, service)',
            'Premium finish as part of the product',
            'Solving difficult apartments',
            'Long-term service — TzviAir stays involved after installation',
            'Full English and Hebrew client experience',
            'Anglo and overseas client niche',
            'Showroom in Beit Shemesh + Tel Aviv office',
          ].map((p, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-navy-900/40 border border-slate-200 dark:border-navy-600/30 rounded-lg px-3 py-2">
              <span className="text-brand-cyan font-bold text-xs mt-0.5 shrink-0">{i+1}.</span>{p}
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionDivider>Architect-Facing Psychology</SectionDivider>
        <Card className="space-y-3">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Working with TzviAir strengthens the architect's name.</p>
          <ul className="space-y-1.5">
            {[
              "Architect's recommendation reflects directly on their name",
              'TzviAir helps the architect look better',
              'TzviAir protects the client experience',
              'Reduces headaches on the architect side',
              'Premium final result',
              'Long-term aftercare — client not abandoned',
              'English/Hebrew service is a major advantage',
              'Showroom gives architects a real place to refer clients',
            ].map((p, i) => (
              <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <span className="text-brand-cyan shrink-0 mt-0.5">›</span>{p}
              </li>
            ))}
          </ul>
          <CopyButton text={"Working with TzviAir strengthens the architect's name.\n\n" +
            ["Architect's recommendation reflects directly on their name","TzviAir helps the architect look better","TzviAir protects the client experience","Reduces headaches on the architect side","Premium final result","Long-term aftercare — client not abandoned","English/Hebrew service is a major advantage","Showroom gives architects a real place to refer clients"].map(p=>`• ${p}`).join('\n')
          } label="Copy All"/>
        </Card>
      </div>
    </div>
  );
}

// 2. Current Status
function CurrentStatusSection({ data, save }) {
  const updateWS = (id, changes) => save(prev => ({ ...prev, workstreams: prev.workstreams.map(w => w.id === id ? { ...w, ...changes } : w) }));

  function WSRow({ ws }) {
    const [editNote, setEditNote] = useState(false);
    const [noteDraft, setNoteDraft] = useState(ws.notes || '');
    const [changeStatus, setChangeStatus] = useState(false);
    return (
      <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-navy-700/30 last:border-0">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{ws.label}</span>
            {changeStatus ? (
              <div className="flex items-center gap-1">
                <select value={ws.status} onChange={e => { updateWS(ws.id, { status: e.target.value }); setChangeStatus(false); }}
                  className="text-xs bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-600 rounded px-1.5 py-0.5 text-slate-700 dark:text-slate-200 focus:outline-none">
                  {[STATUS.DONE, STATUS.IN_PROGRESS, STATUS.NEEDS_DECISION, STATUS.DEFERRED].map(s => <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>)}
                </select>
                <button onClick={() => setChangeStatus(false)} className="text-xs text-slate-400 px-1">✕</button>
              </div>
            ) : (
              <button onClick={() => setChangeStatus(true)} className="hover:opacity-80"><StatusBadge status={ws.status} size="xs"/></button>
            )}
          </div>
          {editNote ? (
            <div className="mt-1.5 flex gap-2">
              <input type="text" value={noteDraft} onChange={e => setNoteDraft(e.target.value)}
                className="flex-1 text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-600 rounded px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-cyan"/>
              <button onClick={() => { updateWS(ws.id, { notes: noteDraft }); setEditNote(false); }} className="text-xs px-2 py-1 bg-brand-cyan/20 border border-brand-cyan/50 text-brand-cyan rounded">Save</button>
              <button onClick={() => setEditNote(false)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-0.5">
              {ws.notes && <span className="text-xs text-slate-500 dark:text-slate-500">{ws.notes}</span>}
              <button onClick={() => { setNoteDraft(ws.notes || ''); setEditNote(true); }} className="text-xs text-slate-400 hover:text-brand-cyan transition-colors">{ws.notes ? 'edit' : '+ note'}</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const active = data.workstreams.filter(w => w.status === STATUS.IN_PROGRESS);
  const done   = data.workstreams.filter(w => w.status === STATUS.DONE);
  const other  = data.workstreams.filter(w => ![STATUS.IN_PROGRESS, STATUS.DONE].includes(w.status));

  return (
    <div className="space-y-5 animate-fade-in">
      {active.length > 0 && (<><SectionDivider>Active / In Progress</SectionDivider><Card className="divide-y divide-slate-100 dark:divide-navy-700/30 py-0">{active.map(w => <WSRow key={w.id} ws={w}/>)}</Card></>)}
      {done.length > 0   && (<><SectionDivider>Done</SectionDivider><Card className="divide-y divide-slate-100 dark:divide-navy-700/30 py-0">{done.map(w => <WSRow key={w.id} ws={w}/>)}</Card></>)}
      {other.length > 0  && (<><SectionDivider>Other</SectionDivider><Card className="divide-y divide-slate-100 dark:divide-navy-700/30 py-0">{other.map(w => <WSRow key={w.id} ws={w}/>)}</Card></>)}
    </div>
  );
}

// 3. Booth Wall
function BoothWallSection({ data, save }) {
  const bw = data.boothWall;
  const updateField = (field, text) => save(prev => ({ ...prev, boothWall: { ...prev.boothWall, [field]: { ...prev.boothWall[field], text } } }));
  const fields = [
    { key: 'kapaHeadline', ...bw.kapaHeadline },
    { key: 'backWall', ...bw.backWall },
    { key: 'sideWallHeadline', ...bw.sideWallHeadline },
    { key: 'sideWallSubtext', ...bw.sideWallSubtext },
    { key: 'sideWallVisual', ...bw.sideWallVisual },
  ];
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-end">
        <CopyButton text={fields.map(f => `[${f.label}]\n${f.text}`).join('\n\n')} label="Copy All Wall Text"/>
      </div>
      <div className="bg-brand-cyan/10 border border-brand-cyan/30 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-brand-cyan uppercase tracking-wider">Top Kapa Headline — LOCKED</span>
          <StatusBadge status={STATUS.LOCKED} size="xs"/>
        </div>
        <div dir="rtl" className="text-2xl font-bold text-slate-900 dark:text-white text-right font-hebrew">{bw.kapaHeadline.text}</div>
        <CopyButton text={bw.kapaHeadline.text}/>
      </div>
      {fields.slice(1).map(f => (
        <Card key={f.key}>
          <EditableText value={f.text} onChange={v => updateField(f.key, v)} status={f.status} label={f.label} lang={f.lang} note={f.note}/>
        </Card>
      ))}
    </div>
  );
}

// 4. Brochure
function BrochureSection({ data, save }) {
  const [tab, setTab] = useState('english');
  const br = data.brochure;
  const updateEn = (id, field, val) => save(prev => ({ ...prev, brochure: { ...prev.brochure, english: prev.brochure.english.map(s => s.id === id ? { ...s, [field]: val } : s) } }));
  const updateHe = (id, field, val) => save(prev => ({ ...prev, brochure: { ...prev.brochure, hebrew: prev.brochure.hebrew.map(s => s.id === id ? { ...s, [field]: val } : s) } }));
  const updateSpec = (field, text) => save(prev => ({ ...prev, brochure: { ...prev.brochure, [field]: { ...prev.brochure[field], text } } }));
  const allEn = br.english.map((s, i) => `${i+1}. ${s.headline}\n${s.body}`).join('\n\n');
  const allHe = br.hebrew.map((s, i) => `${i+1}. ${s.headline}\n${s.body}`).join('\n\n');

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-navy-900/60 rounded-xl w-fit">
        {[['english', 'English'], ['hebrew', 'Hebrew'], ['highlights', 'Highlights']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === k ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}>{l}
          </button>
        ))}
      </div>

      {tab === 'english' && (
        <div className="space-y-3">
          <div className="flex justify-end"><CopyButton text={allEn} label="Copy All English"/></div>
          {br.english.map((s, i) => (
            <Card key={s.id} className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-brand-cyan font-bold text-sm shrink-0">{i+1}.</span>
                <div className="flex-1 space-y-2">
                  <EditableText value={s.headline} onChange={v => updateEn(s.id, 'headline', v)} status={s.status} label="Headline" lang="en" multiline={false}/>
                  <EditableText value={s.body} onChange={v => updateEn(s.id, 'body', v)} status={s.status} label="Body" lang="en"/>
                </div>
              </div>
              <CopyButton text={`${s.headline}\n\n${s.body}`} label={`Copy §${i+1}`}/>
            </Card>
          ))}
        </div>
      )}

      {tab === 'hebrew' && (
        <div className="space-y-3">
          <div className="flex justify-end"><CopyButton text={allHe} label="Copy All Hebrew"/></div>
          {br.hebrew.map((s, i) => (
            <Card key={s.id} className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-brand-cyan font-bold text-sm shrink-0">{i+1}.</span>
                <div className="flex-1 space-y-2">
                  <EditableText value={s.headline} onChange={v => updateHe(s.id, 'headline', v)} status={s.status} label="Headline" lang="he" multiline={false}/>
                  <EditableText value={s.body} onChange={v => updateHe(s.id, 'body', v)} status={s.status} label="Body" lang="he"/>
                </div>
              </div>
              <div className="flex justify-end"><CopyButton text={`${s.headline}\n\n${s.body}`} label={`Copy §${i+1}`}/></div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'highlights' && (
        <div className="space-y-4">
          <Card><EditableText value={br.blueHeadlineEn.text} onChange={v => updateSpec('blueHeadlineEn', v)} status={br.blueHeadlineEn.status} label={br.blueHeadlineEn.label} lang="en" note={br.blueHeadlineEn.note}/></Card>
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/30 rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Hebrew Blue Headline — Needs Decision</div>
            <EditableText value={br.blueHeadlineHe.text} onChange={v => updateSpec('blueHeadlineHe', v)} status={br.blueHeadlineHe.status} label={br.blueHeadlineHe.label} lang="he" note={br.blueHeadlineHe.note}/>
            <div className="text-xs text-slate-600 dark:text-slate-500 font-medium">Options under consideration:</div>
            {['עבודה עם TzviAir מעלה את הסטנדרט שלך', 'עבודה עם TzviAir מעלה את הרף שלך'].map((opt, i) => (
              <div key={i} className="flex items-center justify-between bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-600/50 rounded-lg px-3 py-2">
                <span dir="rtl" className="text-sm text-slate-700 dark:text-slate-300 font-hebrew">{opt}</span>
                <CopyButton text={opt}/>
              </div>
            ))}
          </div>
          <Card><EditableText value={br.existingHeBlueHeadline.text} onChange={v => updateSpec('existingHeBlueHeadline', v)} status={br.existingHeBlueHeadline.status} label={br.existingHeBlueHeadline.label} lang="he"/></Card>
          <Card><EditableText value={br.bottomQuoteHe.text} onChange={v => updateSpec('bottomQuoteHe', v)} status={br.bottomQuoteHe.status} label={br.bottomQuoteHe.label} lang="he"/></Card>
        </div>
      )}
    </div>
  );
}

// 5. Entrance Flyer
function EntranceFlyerSection({ data, save }) {
  const flyer = data.entranceBagFlyer;
  const updateItem = (id, field, val) => save(prev => ({ ...prev, entranceBagFlyer: { ...prev.entranceBagFlyer, side2: { ...prev.entranceBagFlyer.side2, items: prev.entranceBagFlyer.side2.items.map(item => item.id === id ? { ...item, [field]: val } : item) } } }));
  const allSide2 = `${flyer.side2.title}\n\n${flyer.side2.items.map((it, i) => `${i+1}. ${it.headline}\n${it.body}`).join('\n\n')}\n\n${flyer.side2.cta.text}`;

  return (
    <div className="space-y-5 animate-fade-in">
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Side 1 — Visual</span>
          <StatusBadge status={flyer.side1.status} size="xs"/>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300">{flyer.side1.description}</p>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Side 2 — Hebrew Text</span>
            <StatusBadge status={flyer.side2.status} size="xs"/>
          </div>
          <CopyButton text={allSide2} label="Copy Side 2"/>
        </div>
        <div className="bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl px-4 py-3 mb-3">
          <div className="text-xs text-brand-cyan font-semibold mb-1">Title</div>
          <div dir="rtl" className="text-lg font-bold text-slate-900 dark:text-white font-hebrew text-right">{flyer.side2.title}</div>
          <CopyButton text={flyer.side2.title} className="mt-2"/>
        </div>
        <div className="space-y-3">
          {flyer.side2.items.map((item, i) => (
            <Card key={item.id} className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-brand-cyan font-bold text-sm shrink-0">{i+1}.</span>
                <div className="flex-1 space-y-2">
                  <EditableText value={item.headline} onChange={v => updateItem(item.id, 'headline', v)} status={item.status} label="Headline" lang="he" multiline={false}/>
                  <EditableText value={item.body} onChange={v => updateItem(item.id, 'body', v)} status={item.status} label="Body" lang="he"/>
                  <CopyButton text={`${item.headline}\n${item.body}`} label={`Copy ${i+1}`}/>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Card className="mt-3 border-brand-orange/20 dark:border-brand-orange/20">
          <div className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-2">CTA</div>
          <EditableText value={flyer.side2.cta.text}
            onChange={v => save(prev => ({ ...prev, entranceBagFlyer: { ...prev.entranceBagFlyer, side2: { ...prev.entranceBagFlyer.side2, cta: { ...prev.entranceBagFlyer.side2.cta, text: v } } } }))}
            status={flyer.side2.cta.status} label="Call to Action" lang="he"/>
        </Card>
      </div>
    </div>
  );
}

// 6. Employee Prep
function EmployeePrepSection({ data }) {
  const ep = data.employeePrep;
  const files = data.files.filter(f => ['emp-en', 'emp-he', 'reminder'].includes(f.id));
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <SectionDivider>Files — All Done</SectionDivider>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {files.map(f => (
            <div key={f.id} className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/30 rounded-xl p-3 flex items-start gap-2">
              <span className="text-emerald-500 text-lg shrink-0">📄</span>
              <div><div className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{f.name}</div><StatusBadge status={f.status} size="xs"/></div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-brand-cyan/10 border border-brand-cyan/30 rounded-xl p-4 flex items-start justify-between gap-3">
        <p className="text-base font-semibold text-slate-800 dark:text-white">{ep.mainMessage}</p>
        <CopyButton text={ep.mainMessage}/>
      </div>
      <Card>
        <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Philosophy</div>
        <p className="text-sm text-slate-700 dark:text-slate-300">{ep.philosophy}</p>
      </Card>
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl p-4">
        <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-3">Do Not Say</div>
        <ul className="space-y-1.5">
          {ep.doNotSay.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300"><span className="text-red-400 shrink-0">✕</span>{item}</li>
          ))}
        </ul>
      </div>
      <Card className="border-brand-orange/20 dark:border-brand-orange/20">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-brand-orange uppercase tracking-wider">Referral / Commission Wording</div>
          <CopyButton text={ep.commissionWording}/>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300">{ep.commissionWording}</p>
      </Card>
    </div>
  );
}

// 7. Booth Checklist — with CSV export
function BoothChecklistSection({ data, save }) {
  const [newItem, setNewItem] = useState('');
  const [newCat, setNewCat] = useState('certain');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const checklist = data.checklist || [];
  const updateItem = (id, changes) => save(prev => ({ ...prev, checklist: prev.checklist.map(i => i.id === id ? { ...i, ...changes } : i) }));
  const deleteItem = id => save(prev => ({ ...prev, checklist: prev.checklist.filter(i => i.id !== id) }));
  const addItem = () => {
    if (!newItem.trim()) return;
    save(prev => ({ ...prev, checklist: [...prev.checklist, { id: `c${Date.now()}`, item: newItem.trim(), category: newCat, status: 'pending', assignee: '', notes: '' }] }));
    setNewItem('');
  };
  const STATUSES = ['pending', 'assigned', 'purchased', 'brought', 'confirmed'];
  const isDone = s => ['purchased', 'brought', 'confirmed'].includes(s);
  const filtered = filter === 'all' ? checklist : filter === 'done' ? checklist.filter(i => isDone(i.status)) : filter === 'pending' ? checklist.filter(i => i.status === 'pending') : checklist.filter(i => i.category === filter);

  const exportCSV = () => {
    const rows = [
      ['Item', 'Category', 'Status', 'Assignee', 'Notes'],
      ...checklist.map(i => [i.item, i.category === 'certain' ? 'Must Have' : 'Maybe', i.status, i.assignee || '', i.notes || '']),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booth-checklist.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-3 gap-3">
        {[
          [checklist.filter(i => i.category === 'certain').length, 'Must Have', 'text-brand-cyan'],
          [checklist.filter(i => i.category === 'maybe').length, 'Maybe', 'text-amber-500'],
          [checklist.filter(i => isDone(i.status)).length, 'Confirmed', 'text-emerald-600 dark:text-emerald-400'],
        ].map(([n, l, c]) => (
          <Card key={l} className="text-center py-3">
            <div className={`text-2xl font-bold ${c}`}>{n}</div>
            <div className="text-xs text-slate-500 dark:text-slate-500">{l}</div>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem()}
          placeholder="Add item…"
          className="flex-1 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-brand-cyan"/>
        <select value={newCat} onChange={e => setNewCat(e.target.value)}
          className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-600 rounded-lg px-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none">
          <option value="certain">Must Have</option><option value="maybe">Maybe</option>
        </select>
        <button onClick={addItem} className="px-3 py-2 bg-brand-cyan/20 border border-brand-cyan/50 text-brand-cyan rounded-lg text-sm hover:bg-brand-cyan/30 transition-colors">Add</button>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {[['all', 'All'], ['certain', 'Must Have'], ['maybe', 'Maybe'], ['pending', 'Pending'], ['done', 'Done']].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filter === k ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40' : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-navy-600 hover:text-slate-900 dark:hover:text-slate-200'}`}>{l}
            </button>
          ))}
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-navy-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-700/50 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export CSV
        </button>
      </div>

      <div className="space-y-1.5">
        {filtered.map(item => (
          <div key={item.id} className={`group flex items-start gap-3 px-3 py-2.5 rounded-xl border transition-colors ${isDone(item.status) ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30' : item.category === 'maybe' ? 'bg-slate-50 dark:bg-navy-900/40 border-slate-200 dark:border-navy-600/30' : 'bg-white dark:bg-navy-900/60 border-slate-200 dark:border-navy-600/40'}`}>
            <button onClick={() => { const idx = STATUSES.indexOf(item.status); updateItem(item.id, { status: STATUSES[(idx + 1) % STATUSES.length] }); }}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isDone(item.status) ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 dark:border-slate-600 hover:border-brand-cyan'}`}>
              {isDone(item.status) && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
            </button>
            <div className="flex-1 min-w-0 space-y-1">
              {editingId === item.id ? (
                <input type="text" defaultValue={item.item} autoFocus
                  onBlur={e => { updateItem(item.id, { item: e.target.value }); setEditingId(null); }}
                  onKeyDown={e => { if (e.key === 'Enter') { updateItem(item.id, { item: e.target.value }); setEditingId(null); } }}
                  className="w-full bg-slate-50 dark:bg-navy-900 border border-brand-cyan/50 rounded px-2 py-0.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none"/>
              ) : (
                <span className={`text-sm cursor-pointer ${isDone(item.status) ? 'text-emerald-600 dark:text-emerald-300 line-through opacity-70' : 'text-slate-800 dark:text-slate-200'}`} onDoubleClick={() => setEditingId(item.id)}>{item.item}</span>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${item.category === 'certain' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>{item.category === 'certain' ? 'Must Have' : 'Maybe'}</span>
                <ChecklistStatusBadge status={item.status}/>
                <select value={item.status} onChange={e => updateItem(item.id, { status: e.target.value })}
                  className="text-xs bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-600/50 rounded px-1 py-0.5 text-slate-600 dark:text-slate-400 focus:outline-none">
                  {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
                <input type="text" value={item.assignee} onChange={e => updateItem(item.id, { assignee: e.target.value })} placeholder="Assignee"
                  className="text-xs bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-600/50 rounded px-1.5 py-0.5 text-slate-600 dark:text-slate-400 focus:outline-none focus:border-brand-cyan/50 w-20"/>
                {item.notes && <span className="text-xs text-slate-500 dark:text-slate-500 italic">{item.notes}</span>}
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditingId(item.id)} className="p-1 text-slate-400 hover:text-brand-cyan transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button onClick={() => deleteItem(item.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 8. Architect List
function ArchitectListSection({ data }) {
  const file = data.files.find(f => f.id === 'invite-sheet');
  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="bg-brand-cyan/5 border-brand-cyan/20 dark:border-brand-cyan/20">
        <div className="text-xs font-bold text-brand-cyan uppercase tracking-wider mb-3">Google Sheet</div>
        <a href={file?.link} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-brand-cyan hover:text-cyan-600 dark:hover:text-cyan-300 underline underline-offset-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          Open Architect Invitation Sheet
        </a>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Currently being filled in.</p>
      </Card>
      <Card>
        <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">Columns</div>
        <div className="grid grid-cols-2 gap-2">
          {['Employee Name', 'Architect Name', 'Architect Phone Number', 'Why They Should Be Invited'].map(col => (
            <div key={col} className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600/50 rounded-lg px-2 py-2 text-center">{col}</div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// 9. Lead Form
function LeadFormSection({ data }) {
  const file = data.files.find(f => f.id === 'lead-app');
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3"><span className="text-lg">✅</span><span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Done — Lead Follow-Up System is live</span></div>
        <a href={file?.link} target="_blank" rel="noopener noreferrer"
          className="text-sm text-brand-cyan hover:text-cyan-600 dark:hover:text-cyan-300 underline underline-offset-2 break-all">{file?.link}</a>
        <div className="mt-3"><CopyButton text={file?.link || ''} label="Copy Link"/></div>
      </div>
    </div>
  );
}

// 10. Raffle
function RaffleSection() {
  return (
    <div className="animate-fade-in">
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2"><span className="text-lg">✅</span><span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Done — Raffle / Lead Flow complete</span></div>
        <p className="text-sm text-slate-700 dark:text-slate-300">Raffle wording done. Same flow as lead form, live at <a href="https://tzviairfinal.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-brand-cyan underline">tzviairfinal.vercel.app</a>.</p>
      </div>
    </div>
  );
}

// 11. Screen
function ScreenSection() {
  return (
    <div className="animate-fade-in">
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2"><span className="text-lg">✅</span><span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Done — Screen Content complete</span></div>
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <li className="flex items-start gap-2"><span className="text-emerald-500 shrink-0">›</span>GIF sent to graphic designer / team.</li>
          <li className="flex items-start gap-2"><span className="text-emerald-500 shrink-0">›</span>Screen ordered — standing vertically.</li>
        </ul>
      </div>
    </div>
  );
}

// 12. Graphic Tasks — with PDF upload per task
function GraphicTaskCard({ task, onUpdate, onDelete }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(task.notes || '');
  const fileRef = useRef(null);

  const handleFileUpload = async file => {
    setUploading(true);
    setUploadError('');
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(task.id + '-' + file.name)}`, {
        method: 'PUT',
        headers: { 'x-access-code': '2141', 'content-type': file.type },
        body: file,
      });
      if (res.status === 503) {
        setShowUrlInput(true);
        setUploadError('File storage not set up yet. Paste a link below instead:');
      } else if (res.ok) {
        const result = await res.json();
        onUpdate(task.id, { pdfUrl: result.url });
      } else {
        setUploadError('Upload failed. Try again or paste a link.');
      }
    } catch {
      setUploadError('Upload failed. Try again or paste a link.');
    }
    setUploading(false);
  };

  const pColors = {
    high: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800/50',
    medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800/50',
    low: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  };

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{task.task}</span>
            <StatusBadge status={task.status} size="xs"/>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium border ${pColors[task.priority] || pColors.medium}`}>{task.priority}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={task.status} onChange={e => onUpdate(task.id, { status: e.target.value })}
              className="text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-600 rounded-md px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-cyan">
              {[STATUS.IN_PROGRESS, STATUS.DONE, STATUS.NEEDS_DECISION, STATUS.PENDING, STATUS.DEFERRED].map(s => <option key={s} value={s}>{s.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
            </select>
            <select value={task.priority} onChange={e => onUpdate(task.id, { priority: e.target.value })}
              className="text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-600 rounded-md px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-cyan">
              <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
            </select>
          </div>
          {/* Notes row */}
          {editingNotes ? (
            <div className="flex gap-2">
              <input type="text" value={notesDraft} onChange={e => setNotesDraft(e.target.value)}
                className="flex-1 text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-600 rounded px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-cyan"
                placeholder="Add notes…"/>
              <button onClick={() => { onUpdate(task.id, { notes: notesDraft }); setEditingNotes(false); }}
                className="text-xs px-2 py-1 bg-brand-cyan/20 border border-brand-cyan/50 text-brand-cyan rounded">Save</button>
              <button onClick={() => setEditingNotes(false)} className="text-xs text-slate-400 px-1">✕</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {task.notes && <span className="text-xs text-slate-500 dark:text-slate-400">{task.notes}</span>}
              <button onClick={() => { setNotesDraft(task.notes || ''); setEditingNotes(true); }}
                className="text-xs text-slate-400 hover:text-brand-cyan transition-colors">{task.notes ? 'Edit note' : '+ Add note'}</button>
            </div>
          )}
        </div>
        <button onClick={() => onDelete(task.id)} className="text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors p-1 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      {/* PDF upload area */}
      <div className="border-t border-slate-100 dark:border-navy-700/30 pt-3">
        {task.pdfUrl ? (
          <div className="flex items-center gap-3 flex-wrap">
            <a href={task.pdfUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
              View Final PDF
            </a>
            <button onClick={() => onUpdate(task.id, { pdfUrl: '' })} className="text-xs text-slate-400 hover:text-red-500 transition-colors">Replace</button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <input ref={fileRef} type="file" accept=".pdf,application/pdf" className="hidden"
                onChange={e => e.target.files[0] && handleFileUpload(e.target.files[0])}/>
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 border border-dashed border-slate-300 dark:border-navy-600 rounded-lg text-slate-500 dark:text-slate-400 hover:border-brand-cyan hover:text-brand-cyan transition-colors disabled:opacity-50">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                {uploading ? 'Uploading…' : 'Upload Final PDF'}
              </button>
              <button onClick={() => setShowUrlInput(!showUrlInput)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">or paste URL</button>
            </div>
            {uploadError && <p className="text-xs text-red-500 dark:text-red-400">{uploadError}</p>}
            {showUrlInput && (
              <div className="flex gap-2">
                <input type="url" value={urlDraft} onChange={e => setUrlDraft(e.target.value)}
                  placeholder="https://drive.google.com/…"
                  className="flex-1 text-xs bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-600 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-cyan"/>
                <button onClick={() => { if (urlDraft) { onUpdate(task.id, { pdfUrl: urlDraft }); setShowUrlInput(false); setUrlDraft(''); } }}
                  className="text-xs px-2.5 py-1.5 bg-brand-cyan/20 border border-brand-cyan/50 text-brand-cyan rounded-lg hover:bg-brand-cyan/30">Save</button>
                <button onClick={() => setShowUrlInput(false)} className="text-xs text-slate-400 px-1">✕</button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function GraphicTasksSection({ data, save }) {
  const tasks = data.graphicTasks || [];
  const updateTask = (id, changes) => save(prev => ({ ...prev, graphicTasks: prev.graphicTasks.map(t => t.id === id ? { ...t, ...changes } : t) }));
  const deleteTask = id => save(prev => ({ ...prev, graphicTasks: prev.graphicTasks.filter(t => t.id !== id) }));
  const addTask = () => save(prev => ({ ...prev, graphicTasks: [...prev.graphicTasks, { id: `gt${Date.now()}`, task: 'New task', status: STATUS.IN_PROGRESS, priority: 'medium', notes: '', pdfUrl: '' }] }));

  const done = tasks.filter(t => t.status === STATUS.DONE).length;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{done}/{tasks.length} done</span>
          <div className="w-32 h-2 bg-slate-200 dark:bg-navy-700 rounded-full overflow-hidden">
            <div className="h-full bg-brand-cyan rounded-full transition-all" style={{ width: tasks.length ? `${Math.round(done / tasks.length * 100)}%` : '0%' }}/>
          </div>
        </div>
        <button onClick={addTask}
          className="text-xs px-3 py-1.5 bg-brand-cyan/20 border border-brand-cyan/50 text-brand-cyan rounded-lg hover:bg-brand-cyan/30 transition-colors">
          + Add Task
        </button>
      </div>
      {tasks.map(task => (
        <GraphicTaskCard key={task.id} task={task} onUpdate={updateTask} onDelete={deleteTask}/>
      ))}
      {tasks.length === 0 && (
        <div className="text-center py-10 text-slate-400 dark:text-slate-600 text-sm">No tasks yet. Add one above.</div>
      )}
    </div>
  );
}

// 13. Setup Day
function SetupDaySection({ data, update }) {
  const [notes, setNotes] = useState(data.setupDayNotes || '');
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2"><span className="text-lg">⏳</span><span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Deferred — planning next week</span></div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Add notes here as decisions are made.</p>
      </div>
      <textarea value={notes} onChange={e => setNotes(e.target.value)} onBlur={() => update('setupDayNotes', notes)} rows={6}
        placeholder="Add setup day notes…"
        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-600 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-brand-cyan"/>
    </div>
  );
}

// 14. Notes / Decisions
function NotesDecisionsSection({ data, save, newNoteText, setNewNoteText }) {
  const decisions = data.decisions || [];
  const notes = data.notes || [];
  const updateDecision = updated => save(prev => ({ ...prev, decisions: prev.decisions.map(d => d.id === updated.id ? updated : d) }));
  const addNote = () => {
    if (!newNoteText.trim()) return;
    const timestamp = new Date().toLocaleString('en-IL', { timeZone: 'Asia/Jerusalem' });
    save(prev => ({ ...prev, notes: [{ id: `note_${Date.now()}`, text: newNoteText.trim(), timestamp }, ...(prev.notes || [])] }));
    setNewNoteText('');
  };
  const deleteNote = id => save(prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== id) }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <SectionDivider>Open Decisions</SectionDivider>
        <div className="space-y-3">
          {decisions.map(d => <DecisionCard key={d.id} decision={d} onUpdate={updateDecision}/>)}
        </div>
      </div>
      <div>
        <SectionDivider>Notes</SectionDivider>
        <div className="space-y-3">
          <div className="flex gap-2">
            <textarea value={newNoteText} onChange={e => setNewNoteText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) addNote(); }}
              placeholder="Add a note… (⌘+Enter to save)" rows={3}
              className="flex-1 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-600 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-brand-cyan resize-none"/>
            <button onClick={addNote} className="self-end px-4 py-2 bg-brand-cyan/20 border border-brand-cyan/50 text-brand-cyan rounded-xl text-sm hover:bg-brand-cyan/30 transition-colors">Add</button>
          </div>
          {notes.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-600 italic text-center py-4">No notes yet.</p>}
          {notes.map(note => (
            <Card key={note.id} className="group">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap flex-1">{note.text}</p>
                <div className="flex gap-2 shrink-0">
                  <CopyButton text={note.text}/>
                  <button onClick={() => deleteNote(note.id)} className="text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-600 mt-2">{note.timestamp}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
