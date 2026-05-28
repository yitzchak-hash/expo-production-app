import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAppData } from '../lib/store';
import { STATUS, SECTION_IDS } from '../lib/data';
import StatusBadge from '../components/ui/StatusBadge';
import CopyButton from '../components/ui/CopyButton';
import EditableText from '../components/ui/EditableText';
import DecisionCard from '../components/ui/DecisionCard';
import SectionWrapper from '../components/ui/SectionWrapper';

const SESSION_KEY = 'tzviair_auth';

// ── Helpers ─────────────────────────────────────────────────────

function ChecklistStatusBadge({ status }) {
  const map = {
    pending: 'bg-slate-800 text-slate-400 border border-slate-600',
    purchased: 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50',
    brought: 'bg-blue-900/60 text-blue-300 border border-blue-700/50',
    assigned: 'bg-violet-900/50 text-violet-300 border border-violet-700/50',
    confirmed: 'bg-cyan-900/50 text-cyan-300 border border-cyan-700/50',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || map.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function TzviAirLogo({ small = false }) {
  const scale = small ? 0.65 : 1;
  const w = Math.round(180 * scale);
  const h = Math.round(70 * scale);
  return (
    <svg width={w} height={h} viewBox="0 0 180 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 16 Q90 6 140 12" stroke="#f5a623" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9"/>
      <path d="M46 22 Q90 11 144 18" stroke="#1a4b8f" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85"/>
      <path d="M42 28 Q90 16 148 23" stroke="#00b8d4" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8"/>
      <text x="28" y="52" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="28" fill="#1a2e6e" fontStyle="italic">Tzvi</text>
      <text x="104" y="52" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="28" fill="#00b8d4" fontStyle="italic">Air</text>
      <path d="M28 58 Q90 66 152 56" stroke="#00b8d4" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
    </svg>
  );
}

const SECTIONS = [
  { id: SECTION_IDS.OVERVIEW, label: 'Project Overview', icon: '🏗' },
  { id: SECTION_IDS.CURRENT_STATUS, label: 'Current Status', icon: '📊' },
  { id: SECTION_IDS.BOOTH_WALL, label: 'Booth Text + Wall Plan', icon: '🖼' },
  { id: SECTION_IDS.BROCHURE, label: 'Brochure Text', icon: '📄' },
  { id: SECTION_IDS.ENTRANCE_FLYER, label: 'Entrance Bag A4 Flyer', icon: '📋' },
  { id: SECTION_IDS.EMPLOYEE_PREP, label: 'Employee Prep Materials', icon: '👥' },
  { id: SECTION_IDS.BOOTH_CHECKLIST, label: 'Booth Item Checklist', icon: '✅' },
  { id: SECTION_IDS.ARCHITECT_LIST, label: 'Architect Invitation List', icon: '📬' },
  { id: SECTION_IDS.LEAD_FORM, label: 'Lead Form + Follow-Up', icon: '📝' },
  { id: SECTION_IDS.RAFFLE, label: 'Raffle / Lead Flow', icon: '🎯' },
  { id: SECTION_IDS.SCREEN, label: 'Screen Content', icon: '🖥' },
  { id: SECTION_IDS.GRAPHIC_TASKS, label: 'Graphic Designer Tasks', icon: '🎨' },
  { id: SECTION_IDS.SETUP_DAY, label: 'Setup Day Plan', icon: '📅' },
  { id: SECTION_IDS.NOTES_DECISIONS, label: 'Notes / Decisions', icon: '🗒' },
];

export default function Dashboard() {
  const router = useRouter();
  const { data, loaded, save, update } = useAppData();
  const [activeSection, setActiveSection] = useState(null);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newNoteText, setNewNoteText] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem(SESSION_KEY);
      if (!auth) router.replace('/');
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    router.push('/');
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getSectionStatus = (id) => {
    if (!data) return STATUS.PENDING;
    const sectionStatusMap = {
      [SECTION_IDS.OVERVIEW]: STATUS.IN_PROGRESS,
      [SECTION_IDS.CURRENT_STATUS]: STATUS.IN_PROGRESS,
      [SECTION_IDS.BOOTH_WALL]: STATUS.LOCKED,
      [SECTION_IDS.BROCHURE]: STATUS.LOCKED,
      [SECTION_IDS.ENTRANCE_FLYER]: STATUS.IN_PROGRESS,
      [SECTION_IDS.EMPLOYEE_PREP]: STATUS.DONE,
      [SECTION_IDS.BOOTH_CHECKLIST]: STATUS.IN_PROGRESS,
      [SECTION_IDS.ARCHITECT_LIST]: STATUS.IN_PROGRESS,
      [SECTION_IDS.LEAD_FORM]: STATUS.DONE,
      [SECTION_IDS.RAFFLE]: STATUS.DONE,
      [SECTION_IDS.SCREEN]: STATUS.DONE,
      [SECTION_IDS.GRAPHIC_TASKS]: STATUS.IN_PROGRESS,
      [SECTION_IDS.SETUP_DAY]: STATUS.DEFERRED,
      [SECTION_IDS.NOTES_DECISIONS]: STATUS.IN_PROGRESS,
    };
    return data.sectionStatuses?.[id] || sectionStatusMap[id] || STATUS.PENDING;
  };

  const updateSectionStatus = (id, newStatus) => {
    update(`sectionStatuses.${id}`, newStatus);
  };

  if (!loaded || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusCounts = SECTIONS.reduce((acc, s) => {
    const st = getSectionStatus(s.id);
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  const filteredSections = search
    ? SECTIONS.filter((s) => s.label.toLowerCase().includes(search.toLowerCase()))
    : SECTIONS;

  return (
    <>
      <Head>
        <title>TzviAir — Expo Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="flex h-screen overflow-hidden bg-navy-950">
        {/* ── Sidebar ───────────────────────────────────────── */}
        <aside
          className={`${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} shrink-0 flex flex-col h-full transition-all duration-300`}
          style={{ background: 'rgba(8, 15, 36, 0.98)', borderRight: '1px solid rgba(30, 48, 96, 0.8)' }}
        >
          {/* Logo */}
          <div className="px-4 pt-5 pb-4 border-b border-navy-700/50 shrink-0">
            <TzviAirLogo small />
            <div className="text-xs text-slate-500 mt-2 font-medium tracking-wide">Expo Dashboard</div>
          </div>

          {/* Search */}
          <div className="px-3 py-3 shrink-0">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search sections..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-navy-800 border border-navy-600 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-cyan/50"
              />
            </div>
          </div>

          {/* Section nav */}
          <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
            {filteredSections.map((section) => {
              const st = getSectionStatus(section.id);
              const isActive = activeSection === section.id;
              const dotColors = {
                [STATUS.DONE]: 'bg-emerald-400',
                [STATUS.IN_PROGRESS]: 'bg-cyan-400',
                [STATUS.NEEDS_DECISION]: 'bg-amber-400',
                [STATUS.DEFERRED]: 'bg-slate-500',
                [STATUS.LOCKED]: 'bg-violet-400',
                [STATUS.PENDING]: 'bg-sky-400',
              };
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-cyan/15 text-cyan-200'
                      : 'text-slate-400 hover:bg-navy-700/60 hover:text-slate-200'
                  }`}
                >
                  <span className="text-sm shrink-0">{section.icon}</span>
                  <span className="text-xs font-medium flex-1 leading-tight">{section.label}</span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${dotColors[st] || 'bg-slate-500'}`} />
                </button>
              );
            })}
          </nav>

          {/* Status legend */}
          <div className="px-3 py-3 border-t border-navy-700/50 shrink-0 space-y-1.5">
            <div className="text-xs text-slate-600 font-medium mb-2">Status Summary</div>
            {[
              [STATUS.DONE, 'emerald', 'Done'],
              [STATUS.IN_PROGRESS, 'cyan', 'In Progress'],
              [STATUS.NEEDS_DECISION, 'amber', 'Needs Decision'],
              [STATUS.DEFERRED, 'slate', 'Deferred'],
              [STATUS.LOCKED, 'violet', 'Locked'],
            ].map(([st, color, label]) => (
              statusCounts[st] ? (
                <div key={st} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full bg-${color}-400 shrink-0`} />
                  <span className="text-xs text-slate-400">{label}</span>
                  <span className={`ml-auto text-xs font-bold text-${color}-400`}>{statusCounts[st]}</span>
                </div>
              ) : null
            ))}
          </div>

          {/* Logout */}
          <div className="px-3 pb-4 shrink-0">
            <button
              onClick={handleLogout}
              className="w-full text-xs text-slate-600 hover:text-slate-400 py-2 transition-colors"
            >
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Main Content ──────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header
            className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-navy-700/50"
            style={{ background: 'rgba(8, 15, 36, 0.9)' }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen((o) => !o)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-navy-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-sm font-bold text-slate-100">TzviAir Architects Expo</h1>
                <p className="text-xs text-slate-500">Production Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
                {statusCounts[STATUS.DONE] > 0 && (
                  <span className="text-emerald-400 font-medium">{statusCounts[STATUS.DONE]} Done</span>
                )}
                {statusCounts[STATUS.IN_PROGRESS] > 0 && (
                  <span className="text-cyan-400 font-medium">{statusCounts[STATUS.IN_PROGRESS]} In Progress</span>
                )}
                {statusCounts[STATUS.NEEDS_DECISION] > 0 && (
                  <span className="text-amber-400 font-medium">{statusCounts[STATUS.NEEDS_DECISION]} Need Decision</span>
                )}
              </div>
            </div>
          </header>

          {/* Scrollable sections */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">

            {/* ── 1. Project Overview ────────────────────────── */}
            <SectionWrapper
              id={SECTION_IDS.OVERVIEW}
              icon="🏗"
              title="Project Overview"
              status={getSectionStatus(SECTION_IDS.OVERVIEW)}
              onStatusChange={(s) => updateSectionStatus(SECTION_IDS.OVERVIEW, s)}
              defaultOpen={true}
            >
              <ProjectOverviewSection data={data} />
            </SectionWrapper>

            {/* ── 2. Current Status ──────────────────────────── */}
            <SectionWrapper
              id={SECTION_IDS.CURRENT_STATUS}
              icon="📊"
              title="Current Status"
              status={getSectionStatus(SECTION_IDS.CURRENT_STATUS)}
              onStatusChange={(s) => updateSectionStatus(SECTION_IDS.CURRENT_STATUS, s)}
              defaultOpen={true}
            >
              <CurrentStatusSection data={data} save={save} />
            </SectionWrapper>

            {/* ── 3. Booth Text + Wall Plan ──────────────────── */}
            <SectionWrapper
              id={SECTION_IDS.BOOTH_WALL}
              icon="🖼"
              title="Booth Text + Wall Plan"
              status={getSectionStatus(SECTION_IDS.BOOTH_WALL)}
              onStatusChange={(s) => updateSectionStatus(SECTION_IDS.BOOTH_WALL, s)}
            >
              <BoothWallSection data={data} save={save} update={update} />
            </SectionWrapper>

            {/* ── 4. Brochure Text ───────────────────────────── */}
            <SectionWrapper
              id={SECTION_IDS.BROCHURE}
              icon="📄"
              title="Brochure Text"
              status={getSectionStatus(SECTION_IDS.BROCHURE)}
              onStatusChange={(s) => updateSectionStatus(SECTION_IDS.BROCHURE, s)}
            >
              <BrochureSection data={data} save={save} update={update} />
            </SectionWrapper>

            {/* ── 5. Entrance Bag A4 Flyer ───────────────────── */}
            <SectionWrapper
              id={SECTION_IDS.ENTRANCE_FLYER}
              icon="📋"
              title="Entrance Bag A4 Flyer"
              status={getSectionStatus(SECTION_IDS.ENTRANCE_FLYER)}
              onStatusChange={(s) => updateSectionStatus(SECTION_IDS.ENTRANCE_FLYER, s)}
            >
              <EntranceFlyerSection data={data} save={save} update={update} />
            </SectionWrapper>

            {/* ── 6. Employee Prep ───────────────────────────── */}
            <SectionWrapper
              id={SECTION_IDS.EMPLOYEE_PREP}
              icon="👥"
              title="Employee Prep Materials"
              status={getSectionStatus(SECTION_IDS.EMPLOYEE_PREP)}
              onStatusChange={(s) => updateSectionStatus(SECTION_IDS.EMPLOYEE_PREP, s)}
            >
              <EmployeePrepSection data={data} />
            </SectionWrapper>

            {/* ── 7. Booth Item Checklist ────────────────────── */}
            <SectionWrapper
              id={SECTION_IDS.BOOTH_CHECKLIST}
              icon="✅"
              title="Booth Item Checklist"
              status={getSectionStatus(SECTION_IDS.BOOTH_CHECKLIST)}
              onStatusChange={(s) => updateSectionStatus(SECTION_IDS.BOOTH_CHECKLIST, s)}
            >
              <BoothChecklistSection data={data} save={save} />
            </SectionWrapper>

            {/* ── 8. Architect Invitation List ───────────────── */}
            <SectionWrapper
              id={SECTION_IDS.ARCHITECT_LIST}
              icon="📬"
              title="Architect Invitation List"
              status={getSectionStatus(SECTION_IDS.ARCHITECT_LIST)}
              onStatusChange={(s) => updateSectionStatus(SECTION_IDS.ARCHITECT_LIST, s)}
            >
              <ArchitectListSection data={data} />
            </SectionWrapper>

            {/* ── 9. Lead Form + Follow-Up ───────────────────── */}
            <SectionWrapper
              id={SECTION_IDS.LEAD_FORM}
              icon="📝"
              title="Lead Form + Follow-Up System"
              status={getSectionStatus(SECTION_IDS.LEAD_FORM)}
              onStatusChange={(s) => updateSectionStatus(SECTION_IDS.LEAD_FORM, s)}
            >
              <LeadFormSection data={data} />
            </SectionWrapper>

            {/* ── 10. Raffle / Lead Flow ─────────────────────── */}
            <SectionWrapper
              id={SECTION_IDS.RAFFLE}
              icon="🎯"
              title="Raffle / Lead Flow"
              status={getSectionStatus(SECTION_IDS.RAFFLE)}
              onStatusChange={(s) => updateSectionStatus(SECTION_IDS.RAFFLE, s)}
            >
              <RaffleSection />
            </SectionWrapper>

            {/* ── 11. Screen Content ─────────────────────────── */}
            <SectionWrapper
              id={SECTION_IDS.SCREEN}
              icon="🖥"
              title="Screen Content"
              status={getSectionStatus(SECTION_IDS.SCREEN)}
              onStatusChange={(s) => updateSectionStatus(SECTION_IDS.SCREEN, s)}
            >
              <ScreenSection />
            </SectionWrapper>

            {/* ── 12. Graphic Designer Tasks ─────────────────── */}
            <SectionWrapper
              id={SECTION_IDS.GRAPHIC_TASKS}
              icon="🎨"
              title="Graphic Designer Tasks"
              status={getSectionStatus(SECTION_IDS.GRAPHIC_TASKS)}
              onStatusChange={(s) => updateSectionStatus(SECTION_IDS.GRAPHIC_TASKS, s)}
            >
              <GraphicTasksSection data={data} save={save} />
            </SectionWrapper>

            {/* ── 13. Setup Day Plan ─────────────────────────── */}
            <SectionWrapper
              id={SECTION_IDS.SETUP_DAY}
              icon="📅"
              title="Setup Day Plan"
              status={getSectionStatus(SECTION_IDS.SETUP_DAY)}
              onStatusChange={(s) => updateSectionStatus(SECTION_IDS.SETUP_DAY, s)}
            >
              <SetupDaySection data={data} update={update} />
            </SectionWrapper>

            {/* ── 14. Notes / Decisions ──────────────────────── */}
            <SectionWrapper
              id={SECTION_IDS.NOTES_DECISIONS}
              icon="🗒"
              title="Notes / Decisions"
              status={getSectionStatus(SECTION_IDS.NOTES_DECISIONS)}
              onStatusChange={(s) => updateSectionStatus(SECTION_IDS.NOTES_DECISIONS, s)}
              defaultOpen={true}
            >
              <NotesDecisionsSection
                data={data}
                save={save}
                newNoteText={newNoteText}
                setNewNoteText={setNewNoteText}
              />
            </SectionWrapper>

            <div className="h-12" />
          </div>
        </main>
      </div>
    </>
  );
}

// ── Section Components ────────────────────────────────────────

function SectionHeader({ children }) {
  return (
    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
      <span className="h-px flex-1 bg-navy-600/50" />
      {children}
      <span className="h-px flex-1 bg-navy-600/50" />
    </h3>
  );
}

function InfoCard({ label, value, status, link, lang = 'en' }) {
  const isRtl = lang === 'he';
  return (
    <div className="bg-navy-900/60 border border-navy-600/50 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
        {status && <StatusBadge status={status} size="xs" />}
      </div>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-brand-cyan hover:text-cyan-300 underline underline-offset-2 break-all"
        >
          {value}
        </a>
      ) : (
        <div
          dir={isRtl ? 'rtl' : 'ltr'}
          className={`text-sm text-slate-200 whitespace-pre-wrap ${isRtl ? 'text-right font-hebrew' : ''}`}
        >
          {value}
        </div>
      )}
      {value && !link && <CopyButton text={value} />}
    </div>
  );
}

// 1. Project Overview
function ProjectOverviewSection({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard
          label="Company"
          value="TzviAir — Boutique Air Conditioning Company, Beit Shemesh"
          status={STATUS.LOCKED}
        />
        <InfoCard
          label="Event"
          value="Architects Expo"
          status={STATUS.IN_PROGRESS}
        />
        <InfoCard
          label="Core Message"
          value="Working with TzviAir strengthens the architect's name."
          status={STATUS.LOCKED}
        />
        <InfoCard
          label="Top Kapa Headline (Hebrew)"
          value="מיזוג אוויר עם צבי אייר מחזקת את המוניטין שלך"
          status={STATUS.LOCKED}
          lang="he"
        />
      </div>

      <div>
        <SectionHeader>Core Strategic Pillars</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            'Owner-led responsibility — Tzvi remains personally involved',
            'Complete project under one roof (AC, drainage, electrical, drywall, lighting, service)',
            'Premium finish as part of the product',
            'Solving difficult apartments',
            'Long-term service — TzviAir does not disappear after installation',
            'English and Hebrew client experience',
            'Anglo and overseas client niche',
            'Showroom as proof (Beit Shemesh + Tel Aviv office)',
          ].map((pillar, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-300 bg-navy-900/40 border border-navy-600/30 rounded-lg px-3 py-2">
              <span className="text-brand-cyan shrink-0 font-bold text-xs mt-0.5">{i + 1}.</span>
              {pillar}
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader>Marketing Psychology (Architect-Facing)</SectionHeader>
        <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl p-4 space-y-2">
          <p className="text-sm text-slate-200 font-medium">
            Working with TzviAir strengthens the architect&apos;s name.
          </p>
          <ul className="space-y-1">
            {[
              "The architect's recommendation reflects directly on the architect's name",
              'TzviAir helps the architect look better',
              'TzviAir protects the client experience',
              'TzviAir reduces headaches',
              'TzviAir gives a premium final result',
              'TzviAir provides long-term aftercare — client is not abandoned',
              "TzviAir's English/Hebrew service is a major advantage",
              "TzviAir's showroom gives architects a real place to bring or refer clients",
            ].map((point, i) => (
              <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                <span className="text-brand-cyan shrink-0 mt-0.5">›</span>
                {point}
              </li>
            ))}
          </ul>
          <CopyButton
            text={`Working with TzviAir strengthens the architect's name.\n\n` +
              [
                "The architect's recommendation reflects directly on the architect's name",
                'TzviAir helps the architect look better',
                'TzviAir protects the client experience',
                'TzviAir reduces headaches',
                'TzviAir gives a premium final result',
                'TzviAir provides long-term aftercare — client is not abandoned',
                "TzviAir's English/Hebrew service is a major advantage",
                "TzviAir's showroom gives architects a real place to bring or refer clients",
              ].map((p) => `• ${p}`).join('\n')
            }
            label="Copy All"
          />
        </div>
      </div>
    </div>
  );
}

// 2. Current Status
function CurrentStatusSection({ data, save }) {
  const updateWorkstreamStatus = (id, newStatus) => {
    save((prev) => ({
      ...prev,
      workstreams: prev.workstreams.map((w) =>
        w.id === id ? { ...w, status: newStatus } : w
      ),
    }));
  };

  const updateWorkstreamNotes = (id, notes) => {
    save((prev) => ({
      ...prev,
      workstreams: prev.workstreams.map((w) =>
        w.id === id ? { ...w, notes } : w
      ),
    }));
  };

  const done = data.workstreams.filter((w) => w.status === STATUS.DONE);
  const active = data.workstreams.filter((w) => w.status === STATUS.IN_PROGRESS);
  const other = data.workstreams.filter((w) => ![STATUS.DONE, STATUS.IN_PROGRESS].includes(w.status));

  const WorkstreamRow = ({ ws }) => {
    const [editingNotes, setEditingNotes] = useState(false);
    const [noteDraft, setNoteDraft] = useState(ws.notes || '');
    const [changingStatus, setChangingStatus] = useState(false);

    return (
      <div className="flex items-start gap-3 py-3 border-b border-navy-700/30 last:border-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-200">{ws.label}</span>
            {changingStatus ? (
              <div className="flex items-center gap-1">
                <select
                  value={ws.status}
                  onChange={(e) => { updateWorkstreamStatus(ws.id, e.target.value); setChangingStatus(false); }}
                  className="text-xs bg-navy-900 border border-navy-600 rounded px-1.5 py-0.5 text-slate-200 focus:outline-none"
                >
                  {[STATUS.DONE, STATUS.IN_PROGRESS, STATUS.NEEDS_DECISION, STATUS.DEFERRED, STATUS.LOCKED].map((s) => (
                    <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>
                  ))}
                </select>
                <button onClick={() => setChangingStatus(false)} className="text-xs text-slate-500 px-1">✕</button>
              </div>
            ) : (
              <button onClick={() => setChangingStatus(true)} className="hover:opacity-80">
                <StatusBadge status={ws.status} size="xs" />
              </button>
            )}
          </div>
          {editingNotes ? (
            <div className="mt-2 space-y-1.5">
              <input
                type="text"
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                className="w-full bg-navy-900 border border-navy-600 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-brand-cyan"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { updateWorkstreamNotes(ws.id, noteDraft); setEditingNotes(false); }}
                  className="text-xs px-2 py-0.5 bg-brand-cyan/20 border border-brand-cyan/50 text-brand-cyan rounded"
                >Save</button>
                <button onClick={() => setEditingNotes(false)} className="text-xs text-slate-500 hover:text-slate-300">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-0.5">
              {ws.notes && <span className="text-xs text-slate-500">{ws.notes}</span>}
              <button onClick={() => { setNoteDraft(ws.notes || ''); setEditingNotes(true); }} className="text-xs text-slate-600 hover:text-brand-cyan">
                {ws.notes ? 'edit note' : '+ note'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {active.length > 0 && (
        <div>
          <SectionHeader>Active / In Progress</SectionHeader>
          <div className="bg-navy-900/40 border border-navy-600/40 rounded-xl px-4 divide-y divide-navy-700/30">
            {active.map((ws) => <WorkstreamRow key={ws.id} ws={ws} />)}
          </div>
        </div>
      )}
      {done.length > 0 && (
        <div>
          <SectionHeader>Done</SectionHeader>
          <div className="bg-navy-900/40 border border-navy-600/40 rounded-xl px-4 divide-y divide-navy-700/30">
            {done.map((ws) => <WorkstreamRow key={ws.id} ws={ws} />)}
          </div>
        </div>
      )}
      {other.length > 0 && (
        <div>
          <SectionHeader>Other</SectionHeader>
          <div className="bg-navy-900/40 border border-navy-600/40 rounded-xl px-4 divide-y divide-navy-700/30">
            {other.map((ws) => <WorkstreamRow key={ws.id} ws={ws} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// 3. Booth Wall Text
function BoothWallSection({ data, save, update }) {
  const bw = data.boothWall;

  const updateField = (field, text) => {
    save((prev) => ({
      ...prev,
      boothWall: { ...prev.boothWall, [field]: { ...prev.boothWall[field], text } },
    }));
  };

  const fields = [
    { key: 'kapaHeadline', ...bw.kapaHeadline },
    { key: 'backWall', ...bw.backWall },
    { key: 'sideWallHeadline', ...bw.sideWallHeadline },
    { key: 'sideWallSubtext', ...bw.sideWallSubtext },
    { key: 'sideWallVisual', ...bw.sideWallVisual },
  ];

  const allLockedText = fields.map((f) => `[${f.label}]\n${f.text}`).join('\n\n');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Locked text has copy buttons. Visual direction can be updated.
        </p>
        <CopyButton text={allLockedText} label="Copy All Wall Text" />
      </div>

      {/* Kapa headline highlighted */}
      <div className="bg-brand-cyan/10 border border-brand-cyan/30 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-brand-cyan uppercase tracking-wider">Top Kapa Headline — LOCKED</span>
          <StatusBadge status={STATUS.LOCKED} size="xs" />
        </div>
        <div dir="rtl" className="text-xl font-bold text-white text-right font-hebrew leading-relaxed">
          {bw.kapaHeadline.text}
        </div>
        <CopyButton text={bw.kapaHeadline.text} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {fields.slice(1).map((f) => (
          <div key={f.key} className="bg-navy-900/60 border border-navy-600/50 rounded-xl p-4">
            <EditableText
              value={f.text}
              onChange={(v) => updateField(f.key, v)}
              status={f.status}
              label={f.label}
              lang={f.lang}
              note={f.note}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. Brochure Text
function BrochureSection({ data, save, update }) {
  const [tab, setTab] = useState('english');
  const br = data.brochure;

  const updateEnSection = (id, field, value) => {
    save((prev) => ({
      ...prev,
      brochure: {
        ...prev.brochure,
        english: prev.brochure.english.map((s) => s.id === id ? { ...s, [field]: value } : s),
      },
    }));
  };

  const updateHeSection = (id, field, value) => {
    save((prev) => ({
      ...prev,
      brochure: {
        ...prev.brochure,
        hebrew: prev.brochure.hebrew.map((s) => s.id === id ? { ...s, [field]: value } : s),
      },
    }));
  };

  const updateSpecialField = (field, text) => {
    save((prev) => ({
      ...prev,
      brochure: { ...prev.brochure, [field]: { ...prev.brochure[field], text } },
    }));
  };

  const allEnText = br.english.map((s, i) => `${i + 1}. ${s.headline}\n${s.body}`).join('\n\n');
  const allHeText = br.hebrew.map((s, i) => `${i + 1}. ${s.headline}\n${s.body}`).join('\n\n');

  return (
    <div className="space-y-4">
      {/* Tab selector */}
      <div className="flex gap-1 p-1 bg-navy-900/60 rounded-xl w-fit">
        {[['english', 'English'], ['hebrew', 'Hebrew'], ['highlights', 'Highlights']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'english' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <CopyButton text={allEnText} label="Copy All English" />
          </div>
          {br.english.map((section, i) => (
            <div key={section.id} className="bg-navy-900/60 border border-navy-600/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-brand-cyan font-bold text-sm shrink-0">{i + 1}.</span>
                <EditableText
                  value={section.headline}
                  onChange={(v) => updateEnSection(section.id, 'headline', v)}
                  status={section.status}
                  label="Headline"
                  lang="en"
                  multiline={false}
                />
              </div>
              <EditableText
                value={section.body}
                onChange={(v) => updateEnSection(section.id, 'body', v)}
                status={section.status}
                label="Body"
                lang="en"
              />
              <CopyButton text={`${section.headline}\n\n${section.body}`} label={`Copy Section ${i + 1}`} />
            </div>
          ))}
        </div>
      )}

      {tab === 'hebrew' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <CopyButton text={allHeText} label="Copy All Hebrew" />
          </div>
          {br.hebrew.map((section, i) => (
            <div key={section.id} className="bg-navy-900/60 border border-navy-600/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-brand-cyan font-bold text-sm shrink-0">{i + 1}.</span>
                <EditableText
                  value={section.headline}
                  onChange={(v) => updateHeSection(section.id, 'headline', v)}
                  status={section.status}
                  label="Headline"
                  lang="he"
                  multiline={false}
                />
              </div>
              <EditableText
                value={section.body}
                onChange={(v) => updateHeSection(section.id, 'body', v)}
                status={section.status}
                label="Body"
                lang="he"
              />
              <div className="flex justify-end">
                <CopyButton text={`${section.headline}\n\n${section.body}`} label={`Copy Section ${i + 1}`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'highlights' && (
        <div className="space-y-4">
          <div className="bg-navy-900/60 border border-navy-600/50 rounded-xl p-4">
            <EditableText
              value={br.blueHeadlineEn.text}
              onChange={(v) => updateSpecialField('blueHeadlineEn', v)}
              status={br.blueHeadlineEn.status}
              label={br.blueHeadlineEn.label}
              lang="en"
              note={br.blueHeadlineEn.note}
            />
          </div>
          <div className="bg-amber-900/10 border border-amber-700/30 rounded-xl p-4">
            <div className="text-xs font-semibold text-amber-400 mb-3 uppercase tracking-wider">
              Hebrew Blue Headline — Needs Decision
            </div>
            <EditableText
              value={br.blueHeadlineHe.text}
              onChange={(v) => updateSpecialField('blueHeadlineHe', v)}
              status={br.blueHeadlineHe.status}
              label={br.blueHeadlineHe.label}
              lang="he"
              note={br.blueHeadlineHe.note}
            />
            <div className="mt-3 text-xs text-slate-500">Options under consideration:</div>
            <div className="mt-2 space-y-1">
              {['עבודה עם TzviAir מעלה את הסטנדרט שלך', 'עבודה עם TzviAir מעלה את הרף שלך'].map((opt, i) => (
                <div key={i} className="flex items-center justify-between bg-navy-800 border border-navy-600/50 rounded-lg px-3 py-2">
                  <span dir="rtl" className="text-sm text-slate-300 font-hebrew">{opt}</span>
                  <CopyButton text={opt} />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-navy-900/60 border border-navy-600/50 rounded-xl p-4">
            <EditableText
              value={br.existingHeBlueHeadline.text}
              onChange={(v) => updateSpecialField('existingHeBlueHeadline', v)}
              status={br.existingHeBlueHeadline.status}
              label={br.existingHeBlueHeadline.label}
              lang="he"
            />
          </div>
          <div className="bg-navy-900/60 border border-navy-600/50 rounded-xl p-4">
            <EditableText
              value={br.bottomQuoteHe.text}
              onChange={(v) => updateSpecialField('bottomQuoteHe', v)}
              status={br.bottomQuoteHe.status}
              label={br.bottomQuoteHe.label}
              lang="he"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// 5. Entrance Bag A4 Flyer
function EntranceFlyerSection({ data, save, update }) {
  const flyer = data.entranceBagFlyer;

  const updateItem = (id, field, value) => {
    save((prev) => ({
      ...prev,
      entranceBagFlyer: {
        ...prev.entranceBagFlyer,
        side2: {
          ...prev.entranceBagFlyer.side2,
          items: prev.entranceBagFlyer.side2.items.map((item) =>
            item.id === id ? { ...item, [field]: value } : item
          ),
        },
      },
    }));
  };

  const allSide2Text = `${flyer.side2.title}\n\n` +
    flyer.side2.items.map((item, i) => `${i + 1}. ${item.headline}\n${item.body}`).join('\n\n') +
    `\n\n${flyer.side2.cta.text}`;

  return (
    <div className="space-y-5">
      {/* Side 1 */}
      <div className="bg-navy-900/60 border border-navy-600/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Side 1 — Visual Side</span>
          <StatusBadge status={flyer.side1.status} size="xs" />
        </div>
        <p className="text-sm text-slate-300">{flyer.side1.description}</p>
      </div>

      {/* Side 2 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Side 2 — Hebrew Text</span>
            <StatusBadge status={flyer.side2.status} size="xs" />
          </div>
          <CopyButton text={allSide2Text} label="Copy Side 2" />
        </div>

        {/* Title */}
        <div className="bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl px-4 py-3 mb-3">
          <div className="text-xs text-brand-cyan font-semibold mb-1">Title</div>
          <div dir="rtl" className="text-lg font-bold text-white font-hebrew text-right">{flyer.side2.title}</div>
          <CopyButton text={flyer.side2.title} className="mt-2" />
        </div>

        {/* Items */}
        <div className="space-y-3">
          {flyer.side2.items.map((item, i) => (
            <div key={item.id} className="bg-navy-900/60 border border-navy-600/50 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-brand-cyan font-bold text-sm shrink-0">{i + 1}.</span>
                <div className="flex-1 space-y-2">
                  <EditableText
                    value={item.headline}
                    onChange={(v) => updateItem(item.id, 'headline', v)}
                    status={item.status}
                    label="Headline"
                    lang="he"
                    multiline={false}
                  />
                  <EditableText
                    value={item.body}
                    onChange={(v) => updateItem(item.id, 'body', v)}
                    status={item.status}
                    label="Body"
                    lang="he"
                  />
                  <CopyButton text={`${item.headline}\n${item.body}`} label={`Copy Item ${i + 1}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-3 bg-navy-800/80 border border-brand-orange/20 rounded-xl p-4">
          <div className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-2">CTA</div>
          <EditableText
            value={flyer.side2.cta.text}
            onChange={(v) => {
              save((prev) => ({
                ...prev,
                entranceBagFlyer: {
                  ...prev.entranceBagFlyer,
                  side2: { ...prev.entranceBagFlyer.side2, cta: { ...prev.entranceBagFlyer.side2.cta, text: v } },
                },
              }));
            }}
            status={flyer.side2.cta.status}
            label="Call to Action"
            lang="he"
          />
        </div>
      </div>
    </div>
  );
}

// 6. Employee Prep
function EmployeePrepSection({ data }) {
  const ep = data.employeePrep;
  const files = data.files.filter((f) =>
    ['emp-en', 'emp-he', 'reminder'].includes(f.id)
  );

  return (
    <div className="space-y-5">
      {/* Files */}
      <div>
        <SectionHeader>Files — All Done</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {files.map((f) => (
            <div key={f.id} className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-3 flex items-start gap-2">
              <span className="text-emerald-400 text-lg shrink-0">📄</span>
              <div>
                <div className="text-sm font-medium text-emerald-200">{f.name}</div>
                <div className="text-xs text-emerald-400/70 mt-0.5">{f.notes}</div>
                <StatusBadge status={f.status} size="xs" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main message */}
      <div>
        <SectionHeader>Main Employee Message</SectionHeader>
        <div className="bg-brand-cyan/10 border border-brand-cyan/30 rounded-xl p-4 flex items-start justify-between gap-3">
          <p className="text-base font-semibold text-white">{ep.mainMessage}</p>
          <CopyButton text={ep.mainMessage} />
        </div>
      </div>

      {/* Philosophy */}
      <div className="bg-navy-900/60 border border-navy-600/50 rounded-xl p-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Philosophy</div>
        <p className="text-sm text-slate-300">{ep.philosophy}</p>
      </div>

      {/* Do not say */}
      <div className="bg-red-900/10 border border-red-800/30 rounded-xl p-4">
        <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">Do Not Say</div>
        <ul className="space-y-1.5">
          {ep.doNotSay.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-red-300">
              <span className="text-red-500 shrink-0">✕</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Commission wording */}
      <div className="bg-navy-900/60 border border-brand-orange/20 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-brand-orange uppercase tracking-wider">Referral / Commission Wording</div>
          <CopyButton text={ep.commissionWording} />
        </div>
        <p className="text-sm text-slate-300">{ep.commissionWording}</p>
      </div>
    </div>
  );
}

// 7. Booth Checklist
function BoothChecklistSection({ data, save }) {
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('certain');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);

  const checklist = data.checklist || [];

  const updateItem = (id, changes) => {
    save((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) => item.id === id ? { ...item, ...changes } : item),
    }));
  };

  const deleteItem = (id) => {
    save((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((item) => item.id !== id),
    }));
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    const id = `c${Date.now()}`;
    save((prev) => ({
      ...prev,
      checklist: [...prev.checklist, {
        id,
        item: newItem.trim(),
        category: newCategory,
        status: 'pending',
        assignee: '',
        notes: '',
      }],
    }));
    setNewItem('');
  };

  const filtered = filter === 'all'
    ? checklist
    : filter === 'done'
    ? checklist.filter((i) => ['purchased', 'brought', 'confirmed'].includes(i.status))
    : filter === 'pending'
    ? checklist.filter((i) => i.status === 'pending')
    : checklist.filter((i) => i.category === filter);

  const certain = checklist.filter((i) => i.category === 'certain');
  const maybe = checklist.filter((i) => i.category === 'maybe');
  const doneItems = checklist.filter((i) => ['purchased', 'brought', 'confirmed'].includes(i.status));

  const ITEM_STATUSES = ['pending', 'assigned', 'purchased', 'brought', 'confirmed'];

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-navy-900/60 border border-navy-600/40 rounded-xl px-3 py-3 text-center">
          <div className="text-xl font-bold text-brand-cyan">{certain.length}</div>
          <div className="text-xs text-slate-500">Must Have</div>
        </div>
        <div className="bg-navy-900/60 border border-navy-600/40 rounded-xl px-3 py-3 text-center">
          <div className="text-xl font-bold text-amber-400">{maybe.length}</div>
          <div className="text-xs text-slate-500">Maybe</div>
        </div>
        <div className="bg-navy-900/60 border border-navy-600/40 rounded-xl px-3 py-3 text-center">
          <div className="text-xl font-bold text-emerald-400">{doneItems.length}</div>
          <div className="text-xs text-slate-500">Confirmed</div>
        </div>
      </div>

      {/* Add item */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="Add new item..."
          className="flex-1 bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-cyan"
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="bg-navy-900 border border-navy-600 rounded-lg px-2 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-cyan"
        >
          <option value="certain">Must Have</option>
          <option value="maybe">Maybe</option>
        </select>
        <button
          onClick={addItem}
          className="px-3 py-2 bg-brand-cyan/20 border border-brand-cyan/50 text-brand-cyan rounded-lg text-sm hover:bg-brand-cyan/30 transition-colors"
        >
          Add
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 flex-wrap">
        {[['all', 'All'], ['certain', 'Must Have'], ['maybe', 'Maybe'], ['pending', 'Pending'], ['done', 'Confirmed']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              filter === key
                ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40'
                : 'bg-navy-800 text-slate-400 border border-navy-600 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`group flex items-start gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
              ['purchased', 'brought', 'confirmed'].includes(item.status)
                ? 'bg-emerald-900/10 border-emerald-800/30'
                : item.category === 'maybe'
                ? 'bg-navy-900/40 border-navy-600/30'
                : 'bg-navy-900/60 border-navy-600/40'
            }`}
          >
            {/* Checkbox-style status toggle */}
            <button
              onClick={() => {
                const statuses = ITEM_STATUSES;
                const currentIdx = statuses.indexOf(item.status);
                const next = statuses[(currentIdx + 1) % statuses.length];
                updateItem(item.id, { status: next });
              }}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                ['purchased', 'brought', 'confirmed'].includes(item.status)
                  ? 'border-emerald-500 bg-emerald-500'
                  : 'border-slate-600 hover:border-brand-cyan'
              }`}
            >
              {['purchased', 'brought', 'confirmed'].includes(item.status) && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            <div className="flex-1 min-w-0 space-y-1">
              {editingId === item.id ? (
                <input
                  type="text"
                  defaultValue={item.item}
                  autoFocus
                  onBlur={(e) => { updateItem(item.id, { item: e.target.value }); setEditingId(null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { updateItem(item.id, { item: e.target.value }); setEditingId(null); } }}
                  className="w-full bg-navy-900 border border-brand-cyan/50 rounded px-2 py-0.5 text-sm text-slate-100 focus:outline-none"
                />
              ) : (
                <span
                  className={`text-sm cursor-pointer ${
                    ['purchased', 'brought', 'confirmed'].includes(item.status)
                      ? 'text-emerald-300 line-through opacity-70'
                      : 'text-slate-200'
                  }`}
                  onDoubleClick={() => setEditingId(item.id)}
                >
                  {item.item}
                </span>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${item.category === 'certain' ? 'bg-blue-900/40 text-blue-400' : 'bg-amber-900/30 text-amber-400'}`}>
                  {item.category === 'certain' ? 'Must Have' : 'Maybe'}
                </span>
                <ChecklistStatusBadge status={item.status} />

                {/* Status selector */}
                <select
                  value={item.status}
                  onChange={(e) => updateItem(item.id, { status: e.target.value })}
                  className="text-xs bg-navy-900 border border-navy-600/50 rounded px-1 py-0.5 text-slate-400 focus:outline-none"
                >
                  {ITEM_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>

                {/* Assignee */}
                <input
                  type="text"
                  value={item.assignee}
                  onChange={(e) => updateItem(item.id, { assignee: e.target.value })}
                  placeholder="Assignee"
                  className="text-xs bg-navy-900 border border-navy-600/50 rounded px-1.5 py-0.5 text-slate-400 focus:outline-none focus:border-brand-cyan/50 w-20"
                />

                {item.notes && (
                  <span className="text-xs text-slate-500 italic">{item.notes}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setEditingId(item.id)}
                className="p-1 text-slate-500 hover:text-brand-cyan transition-colors"
                title="Edit"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => deleteItem(item.id)}
                className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                title="Delete"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 8. Architect Invitation List
function ArchitectListSection({ data }) {
  const file = data.files.find((f) => f.id === 'invite-sheet');
  return (
    <div className="space-y-4">
      <div className="bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl p-4">
        <div className="text-xs font-bold text-brand-cyan uppercase tracking-wider mb-3">Google Sheet</div>
        <a
          href={file?.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-brand-cyan hover:text-cyan-300 underline underline-offset-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open Architect Invitation Sheet
        </a>
        <p className="text-xs text-slate-500 mt-2">Currently being filled in by the team.</p>
      </div>

      <div className="bg-navy-900/60 border border-navy-600/50 rounded-xl p-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Sheet Columns</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['Employee Name', 'Architect Name', 'Architect Phone Number', 'Why They Should Be Invited'].map((col) => (
            <div key={col} className="text-xs text-slate-300 bg-navy-800 border border-navy-600/50 rounded-lg px-2 py-2 text-center">
              {col}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-navy-900/60 border border-navy-600/50 rounded-xl p-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</div>
        <StatusBadge status={STATUS.IN_PROGRESS} />
        <p className="text-xs text-slate-500 mt-2">List is being filled in. Invitation graphic is being created.</p>
      </div>
    </div>
  );
}

// 9. Lead Form
function LeadFormSection({ data }) {
  const file = data.files.find((f) => f.id === 'lead-app');
  return (
    <div className="space-y-4">
      <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">✅</span>
          <span className="text-sm font-semibold text-emerald-300">Lead Follow-Up System — Done</span>
        </div>
        <a
          href={file?.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-brand-cyan hover:text-cyan-300 underline underline-offset-2 break-all"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {file?.link}
        </a>
        <div className="mt-3">
          <CopyButton text={file?.link || ''} label="Copy Link" />
        </div>
      </div>
      <p className="text-sm text-slate-400">
        The lead form and follow-up system are complete. Raffle wording is done — raffle and lead form are the same flow.
      </p>
    </div>
  );
}

// 10. Raffle
function RaffleSection() {
  return (
    <div className="space-y-4">
      <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">✅</span>
          <span className="text-sm font-semibold text-emerald-300">Raffle / Lead Flow — Done</span>
        </div>
        <p className="text-sm text-slate-300">
          Raffle wording is done. The raffle and lead form are the same flow. Both are live at{' '}
          <a href="https://tzviairfinal.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-brand-cyan underline">
            tzviairfinal.vercel.app
          </a>.
        </p>
      </div>
      <p className="text-xs text-slate-500">This section will not be re-opened unless specifically requested.</p>
    </div>
  );
}

// 11. Screen Content
function ScreenSection() {
  return (
    <div className="space-y-4">
      <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">✅</span>
          <span className="text-sm font-semibold text-emerald-300">Screen Content — Done</span>
        </div>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 shrink-0">›</span>
            GIF file sent to graphic designer / team.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 shrink-0">›</span>
            Screen ordered and will stand vertically.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 shrink-0">›</span>
            Screen content is not an open task unless specifically requested.
          </li>
        </ul>
      </div>
    </div>
  );
}

// 12. Graphic Designer Tasks
function GraphicTasksSection({ data, save }) {
  const tasks = data.graphicTasks || [];

  const updateTask = (id, changes) => {
    save((prev) => ({
      ...prev,
      graphicTasks: prev.graphicTasks.map((t) => t.id === id ? { ...t, ...changes } : t),
    }));
  };

  const addTask = () => {
    const id = `gt${Date.now()}`;
    save((prev) => ({
      ...prev,
      graphicTasks: [...prev.graphicTasks, {
        id,
        task: 'New task',
        status: STATUS.IN_PROGRESS,
        priority: 'medium',
        notes: '',
      }],
    }));
  };

  const deleteTask = (id) => {
    save((prev) => ({
      ...prev,
      graphicTasks: prev.graphicTasks.filter((t) => t.id !== id),
    }));
  };

  const priorityColors = {
    high: 'text-red-400 bg-red-900/30',
    medium: 'text-amber-400 bg-amber-900/30',
    low: 'text-slate-400 bg-slate-800',
  };

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="bg-navy-900/60 border border-navy-600/50 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-slate-100">{task.task}</span>
                <StatusBadge status={task.status} size="xs" />
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>
                  {task.priority}
                </span>
              </div>
              {task.notes && (
                <p className="text-xs text-slate-400">{task.notes}</p>
              )}
              <div className="flex items-center gap-2">
                <select
                  value={task.status}
                  onChange={(e) => updateTask(task.id, { status: e.target.value })}
                  className="text-xs bg-navy-900 border border-navy-600 rounded-md px-2 py-1 text-slate-300 focus:outline-none focus:border-brand-cyan"
                >
                  {[STATUS.IN_PROGRESS, STATUS.DONE, STATUS.NEEDS_DECISION, STATUS.PENDING, STATUS.DEFERRED].map((s) => (
                    <option key={s} value={s}>{s.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</option>
                  ))}
                </select>
                <select
                  value={task.priority}
                  onChange={(e) => updateTask(task.id, { priority: e.target.value })}
                  className="text-xs bg-navy-900 border border-navy-600 rounded-md px-2 py-1 text-slate-300 focus:outline-none focus:border-brand-cyan"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-slate-600 hover:text-red-400 transition-colors p-1 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addTask}
        className="w-full py-2.5 border border-dashed border-navy-600 rounded-xl text-sm text-slate-500 hover:text-brand-cyan hover:border-brand-cyan/40 transition-colors"
      >
        + Add task
      </button>
    </div>
  );
}

// 13. Setup Day Plan
function SetupDaySection({ data, update }) {
  const [notes, setNotes] = useState(data.setupDayNotes || '');
  return (
    <div className="space-y-4">
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">⏳</span>
          <span className="text-sm font-semibold text-slate-400">Setup Day Plan — Deferred</span>
        </div>
        <p className="text-sm text-slate-400">
          Setup day planning has been deferred to next week. Add notes here as needed.
        </p>
      </div>
      <div>
        <div className="text-xs text-slate-500 mb-2 font-medium">Notes (editable)</div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => update('setupDayNotes', notes)}
          rows={5}
          placeholder="Add setup day notes here..."
          className="w-full bg-navy-900 border border-navy-600 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-cyan"
        />
      </div>
    </div>
  );
}

// 14. Notes / Decisions
function NotesDecisionsSection({ data, save, newNoteText, setNewNoteText }) {
  const decisions = data.decisions || [];
  const notes = data.notes || [];

  const updateDecision = (updated) => {
    save((prev) => ({
      ...prev,
      decisions: prev.decisions.map((d) => d.id === updated.id ? updated : d),
    }));
  };

  const addNote = () => {
    if (!newNoteText.trim()) return;
    const id = `note_${Date.now()}`;
    const timestamp = new Date().toLocaleString('en-IL', { timeZone: 'Asia/Jerusalem' });
    save((prev) => ({
      ...prev,
      notes: [{ id, text: newNoteText.trim(), timestamp }, ...(prev.notes || [])],
    }));
    setNewNoteText('');
  };

  const deleteNote = (id) => {
    save((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Decisions */}
      <div>
        <SectionHeader>Open Decisions</SectionHeader>
        <div className="space-y-3">
          {decisions.map((d) => (
            <DecisionCard key={d.id} decision={d} onUpdate={updateDecision} />
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <SectionHeader>Notes</SectionHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) addNote();
              }}
              placeholder="Add a note... (⌘+Enter to save)"
              rows={3}
              className="flex-1 bg-navy-900 border border-navy-600 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-cyan resize-none"
            />
            <button
              onClick={addNote}
              className="self-end px-4 py-2 bg-brand-cyan/20 border border-brand-cyan/50 text-brand-cyan rounded-xl text-sm hover:bg-brand-cyan/30 transition-colors"
            >
              Add
            </button>
          </div>

          {notes.length === 0 && (
            <p className="text-sm text-slate-600 italic text-center py-4">No notes yet.</p>
          )}
          {notes.map((note) => (
            <div key={note.id} className="bg-navy-900/60 border border-navy-600/40 rounded-xl p-3 group">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-slate-200 whitespace-pre-wrap flex-1">{note.text}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <CopyButton text={note.text} />
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="text-xs text-slate-600 mt-2">{note.timestamp}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
