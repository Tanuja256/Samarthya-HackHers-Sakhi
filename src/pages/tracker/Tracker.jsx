import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';
import { useTranslation } from 'react-i18next';
import { trackerTranslations } from './translations';
import BackButton from '../../components/BackButton';
import ConfirmModal from '../../components/ConfirmModal';

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* Symptom chips — keys written to symptom_logs.symptom */
const SYMPTOM_CHIPS = [
  { label: 'Acne', key: 'acne' },
  { label: 'Low energy', key: 'low_energy' },
  { label: 'Hair fall', key: 'hair_fall' },
  { label: 'Cramps', key: 'cramps' },
  { label: 'Mood dips', key: 'mood_dips' },
  { label: 'Cravings', key: 'cravings' },
  { label: 'Bloating', key: 'bloating' },
  { label: 'Poor sleep', key: 'poor_sleep' },
];

/* Severity — label shown to user; value stored in symptom_logs.severity (1–5) */
const SEVERITY_OPTIONS = [
  { label: 'Mild', value: 2 },
  { label: 'Moderate', value: 3 },
  { label: 'Strong', value: 5 },
];

/* ═══════════════════════════════════════════════════════════
   DEMO / SEED DATA  — shown when no user is logged in
   Matches the data visible in the reference screenshot.
═══════════════════════════════════════════════════════════ */
function buildSeedPeriodDates(year, month) {
  const s = new Set();
  for (const d of [2, 3, 4, 5]) {
    s.add(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }
  return s;
}

function buildSeedSymptomDates(year, month) {
  const s = new Set();
  for (const d of [9, 12, 16, 21]) {
    s.add(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }
  return s;
}

const SEED_CYCLE_DATA = [
  { label: 'Mar', length: 46 },
  { label: 'Apr', length: 48 },
  { label: 'May', length: 41 },
  { label: 'Jun', length: 38 },
  { label: 'Jul', length: 35 },
  { label: 'Aug', length: 32 },
];

const SEED_SYMPTOM_DATA = [
  { name: 'Acne', count: 12 },
  { name: 'Low energy', count: 20 },
  { name: 'Hair fall', count: 8 },
  { name: 'Cramps', count: 10 },
  { name: 'Mood dips', count: 13 },
  { name: 'Cravings', count: 18 },
];

/* ═══════════════════════════════════════════════════════════
   UTILITY
═══════════════════════════════════════════════════════════ */
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function getOrCreateUserId(authUser) {
  const { data: existing, error: fe } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', authUser.id)
    .single();

  if (fe && fe.code !== 'PGRST116') {
    console.error('[Sakhi Tracker] user row fetch error:', fe);
    return null;
  }
  if (existing?.id) return existing.id;

  const { data: created, error: ce } = await supabase
    .from('users')
    .upsert(
      { auth_id: authUser.id, name: authUser.email?.split('@')[0] ?? 'Sakhi User' },
      { onConflict: 'auth_id' }
    )
    .select('id')
    .single();

  if (ce) { console.error('[Sakhi Tracker] user row create error:', ce); return null; }
  return created?.id ?? null;
}

export function calculatePredictions(cycleLogs) {
  let autoAvgCycleLength = 28;
  let autoAvgPeriodDuration = 5;
  
  if (!cycleLogs || cycleLogs.length === 0) {
    return { autoAvgCycleLength, autoAvgPeriodDuration, predictedStart: null };
  }

  const uniqueStarts = [...new Set(cycleLogs.map(l => l.cycle_start))].sort();
  if (uniqueStarts.length >= 2) {
    let total = 0;
    let count = 0;
    for (let i = 0; i < uniqueStarts.length - 1; i++) {
      const d1 = new Date(uniqueStarts[i] + 'T00:00:00');
      const d2 = new Date(uniqueStarts[i + 1] + 'T00:00:00');
      const days = Math.round((d2 - d1) / 86_400_000);
      if (days >= 14 && days <= 90) {
        total += days;
        count++;
      }
    }
    if (count > 0) autoAvgCycleLength = Math.round(total / count);
  }

  let pdTotal = 0;
  let pdCount = 0;
  const uniquePeriods = new Map();
  cycleLogs.forEach(log => {
    if (log.cycle_end) {
      uniquePeriods.set(log.cycle_start, log.cycle_end);
    }
  });
  uniquePeriods.forEach((endStr, startStr) => {
    const start = new Date(startStr + 'T00:00:00');
    const end = new Date(endStr + 'T00:00:00');
    const dur = Math.round((end - start) / 86_400_000) + 1;
    if (dur >= 1 && dur <= 14) {
      pdTotal += dur;
      pdCount++;
    }
  });
  if (pdCount > 0) autoAvgPeriodDuration = Math.round(pdTotal / pdCount);

  const mostRecentStr = uniqueStarts[uniqueStarts.length - 1];
  const nextStart = new Date(new Date(mostRecentStr + 'T00:00:00').getTime() + autoAvgCycleLength * 86_400_000);
  
  const pad = (n) => String(n).padStart(2, '0');
  const formatLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  return {
    autoAvgCycleLength,
    autoAvgPeriodDuration,
    predictedStart: formatLocal(nextStart)
  };
}

/* ═══════════════════════════════════════════════════════════
   CALENDAR GRID COMPONENT
═══════════════════════════════════════════════════════════ */
function CalendarGrid({ year, month, selectedDate, actualPeriodDays, predictedPeriodDays, symptomDates, onSelectDate, onPrevMonth, onNextMonth, tTracker }) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDaySun = new Date(year, month, 1).getDay();   // 0 = Sun
  const firstDayMon = (firstDaySun + 6) % 7;               // convert to Mon-first: Mon=0, Sun=6
  const today = todayStr();

  // Build cell array: null for padding cells, number for real days
  const cells = [
    ...Array(firstDayMon).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const ds = (d) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  return (
    <div>
      {/* ── Month header + legend + nav ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label="Previous month"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-text/8 transition-colors cursor-pointer text-text/45"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h3 className="font-heading text-base font-bold text-text px-1">
            {tTracker(['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][month])} {year}
          </h3>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Next month"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-text/8 transition-colors cursor-pointer text-text/45"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-text/50">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-primary/15 inline-block" />
            {tTracker('period')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border border-primary/40 border-dashed bg-primary/5 inline-block" />
            {tTracker('predicted')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
            {tTracker('symptom')}
          </span>
        </div>
      </div>

      {/* ── Day-of-week header (Mon → Sun) ── */}
      <div className="grid grid-cols-7 mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center text-xs font-medium text-text/35 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* ── Day cells ── */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={`pad-${i}`} className="h-10" />;

          const dStr = ds(day);
          const hasActualPeriod = actualPeriodDays.has(dStr);
          const hasPredictedPeriod = predictedPeriodDays.has(dStr);
          const hasSymptom = symptomDates.has(dStr);
          const isSelected = selectedDate === dStr;
          const isToday = dStr === today;
          const isFutureUnlogged = dStr > today && !hasActualPeriod && !hasSymptom;

          return (
            <button
              key={day}
              type="button"
              id={`cal-day-${dStr}`}
              onClick={() => !isFutureUnlogged && onSelectDate(dStr)}
              disabled={isFutureUnlogged}
              className={[
                'flex flex-col items-center justify-center h-10 rounded-lg text-sm transition-all select-none',
                isFutureUnlogged
                  ? 'text-text/30 cursor-not-allowed'
                  : 'cursor-pointer',
                isSelected
                  ? 'border-2 border-accent text-accent font-semibold bg-accent/5'
                  : hasActualPeriod
                    ? 'bg-primary/15 text-primary font-medium hover:bg-primary/25'
                    : hasPredictedPeriod
                      ? 'border border-primary/40 border-dashed text-primary/70 bg-primary/5 hover:bg-primary/10'
                      : isToday
                        ? 'text-primary font-semibold hover:bg-primary/8'
                        : isFutureUnlogged ? '' : 'text-text/65 hover:bg-text/5',
              ].join(' ')}
            >
              <span className="leading-none">{day}</span>
              {/* Dots row — always rendered at fixed height so cells align */}
              <span className="h-2 flex items-center gap-0.5 mt-0.5">
                {hasSymptom && <span className="w-1.5 h-1.5 rounded-full bg-secondary block" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOG PANEL COMPONENT
   key={selectedDate} is passed from parent so it remounts
   on date change, resetting local chip/severity state.
═══════════════════════════════════════════════════════════ */
function LogPanel({ date, selectedLog, onSaveSymptoms, onMarkPeriod, onDeletePeriod, globalSaving, tTracker, lang, initialDuration }) {
  const [selected, setSelected] = useState([]);
  const [severity, setSeverity] = useState('Moderate');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [duration, setDuration] = useState(initialDuration);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { setDuration(initialDuration); }, [initialDuration, selectedLog]);

  const displayDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-IN', { day: 'numeric', month: 'long' })
    : '';

  const toggle = (key) =>
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const flash = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleSave = async () => {
    if (selected.length === 0) { flash(tTracker('select_symptom_first')); return; }
    setSaving(true);
    await onSaveSymptoms(date, selected, severity);
    setSaving(false);
    setSelected([]);
    flash(`${selected.length} ${selected.length > 1 ? tTracker('symptom_saved_plural') : tTracker('symptom_saved_single')}`);
  };

  const handlePeriod = async () => {
    if (date > todayStr()) { flash("You can only log dates up to today"); return; }
    setSaving(true);
    const targetDate = selectedLog ? selectedLog.cycle_start : date;
    await onMarkPeriod(targetDate, duration);
    setSaving(false);
    flash(tTracker('marked_period'));
  };

  const handleConfirmDelete = async () => {
    setIsModalOpen(false);
    setSaving(true);
    const targetDate = selectedLog ? selectedLog.cycle_start : date;
    await onDeletePeriod(targetDate);
    setSaving(false);
    flash('Period unmarked');
  };

  const isDisabled = saving || globalSaving;

  return (
    <div>
      <h3 className="font-heading text-base font-bold text-text mb-4">
        {tTracker('log_for')} {displayDate}
      </h3>

      {/* ── Symptom chips ── */}
      <div className="flex flex-wrap gap-2 mb-5">
        {SYMPTOM_CHIPS.map(({ label, key }) => (
          <button
            key={key}
            type="button"
            id={`chip-${key}`}
            onClick={() => toggle(key)}
            className={[
              'px-3.5 py-1.5 rounded-full border text-sm font-medium transition-all cursor-pointer',
              selected.includes(key)
                ? 'border-primary/50 bg-primary/12 text-primary'
                : 'border-text/15 text-text/60 hover:border-primary/35 hover:bg-primary/5',
            ].join(' ')}
          >
            {tTracker(key) || label}
          </button>
        ))}
      </div>

      {/* ── Severity selector ── */}
      <p className="text-sm font-medium text-text/65 mb-2.5">{tTracker('how_strong')}</p>
      <div className="flex gap-2 mb-5">
        {SEVERITY_OPTIONS.map(({ label }) => (
          <button
            key={label}
            type="button"
            id={`severity-${label.toLowerCase()}`}
            onClick={() => setSeverity(label)}
            className={[
              'flex-1 py-2.5 rounded-[var(--radius-button)] border text-sm font-medium transition-all cursor-pointer',
              severity === label
                ? 'border-primary bg-primary text-white'
                : 'border-text/15 text-text/60 hover:border-primary/35 bg-transparent',
            ].join(' ')}
          >
            {tTracker(label.toLowerCase()) || label}
          </button>
        ))}
      </div>

      {/* ── Feedback message ── */}
      {msg && (
        <p className={`text-xs mb-3 leading-relaxed ${msg.includes('Select') ? 'text-warning' : 'text-secondary'}`}>
          {msg}
        </p>
      )}

      {/* ── Action buttons ── */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2.5 flex-wrap">
          <button
            type="button"
            id="log-save-symptoms-btn"
            disabled={isDisabled}
            onClick={handleSave}
            className="px-4 py-2.5 rounded-[var(--radius-button)] bg-accent text-white text-sm font-semibold
                       hover:bg-accent/85 active:scale-[0.98] transition-all cursor-pointer
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {tTracker('save_symptoms')}
          </button>
          <button
            type="button"
            id="log-mark-period-btn"
            disabled={isDisabled}
            onClick={handlePeriod}
            className="px-4 py-2.5 rounded-[var(--radius-button)] border border-text/20 text-sm font-medium
                       text-text/65 hover:bg-text/5 transition-all cursor-pointer
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {selectedLog ? 'Update Period' : tTracker('mark_period')}
          </button>
          {selectedLog && (
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-[var(--radius-button)] border border-warning/30 text-warning text-sm font-medium
                         hover:bg-warning/10 transition-all cursor-pointer
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Unmark as period date
            </button>
          )}
        </div>

        {/* Duration Input */}
        <div className="flex gap-4 p-3 mt-1 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex-1">
             <label className="block text-xs font-semibold text-text/70 mb-1">
               {selectedLog ? "This Logged Period's Duration (days)" : "Duration for New Period Log (days)"}
             </label>
             <input type="number" min="1" max="14" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full bg-white border border-text/10 rounded px-2 py-1 text-sm outline-none focus:border-primary/50" />
           </div>
        </div>

        <ConfirmModal
          isOpen={isModalOpen}
          title="Unmark Period Date"
          message="Are you sure you want to unmark this period day? This will remove the period log."
          confirmText="Yes, unmark"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN TRACKER COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Tracker() {
  const { user } = useAuth();
  const { i18n } = useTranslation();

  const lang = i18n.language === 'mr' ? 'mr' : 'en';
  const tTracker = useCallback((key) => {
    return trackerTranslations[lang]?.[key] || trackerTranslations['en'][key] || key;
  }, [lang]);

  const isDemo = !user;

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [globalSaving, setGlobalSaving] = useState(false);

  /* Calendar dot sets */
  const [cycleLogs, setCycleLogs] = useState(() => isDemo ? SEED_CYCLE_DATA : []);
  const [symptomDates, setSymptomDates] = useState(() =>
    isDemo ? buildSeedSymptomDates(now.getFullYear(), now.getMonth()) : new Set()
  );

  /* Chart data */
  const [cycleData, setCycleData] = useState(() => isDemo ? SEED_CYCLE_DATA : []);
  const [symptomData, setSymptomData] = useState(() => isDemo ? SEED_SYMPTOM_DATA : []);

  /* ── Load all cycle logs ── */
  const loadUserDataAndLogs = useCallback(async () => {
    if (!user) return;
    const userId = await getOrCreateUserId(user);
    if (!userId) return;

    // Load all cycle logs
    const { data: logsData } = await supabase.from('cycle_logs').select('id, cycle_start, cycle_end').eq('user_id', userId).order('cycle_start', { ascending: true });
    if (logsData) {
      setCycleLogs(logsData);
    }
  }, [user]);

  useEffect(() => { loadUserDataAndLogs(); }, [loadUserDataAndLogs]);

  /* ── Load this month's dots from Supabase ── */
  const loadMonthData = useCallback(async () => {
    if (!user) return;
    const userId = await getOrCreateUserId(user);
    if (!userId) return;

    const pad = (n) => String(n).padStart(2, '0');
    const monthStart = `${year}-${pad(month + 1)}-01`;
    const monthEnd = `${year}-${pad(month + 1)}-${pad(new Date(year, month + 1, 0).getDate())}`;

    const { data: symptomsRes } = await supabase
      .from('symptom_logs')
      .select('logged_at')
      .eq('user_id', userId)
      .gte('logged_at', monthStart + 'T00:00:00')
      .lte('logged_at', monthEnd + 'T23:59:59');

    if (symptomsRes) setSymptomDates(new Set(symptomsRes.map((r) => r.logged_at.slice(0, 10))));
  }, [user, year, month]);

  /* ── Load chart data from Supabase ── */
  const loadChartData = useCallback(async () => {
    if (!user) return;
    const userId = await getOrCreateUserId(user);
    if (!userId) return;

    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 86_400_000);

    const [chartCyclesRes, chartSymptomsRes] = await Promise.all([
      supabase
        .from('cycle_logs')
        .select('cycle_start')
        .eq('user_id', userId)
        .gte('cycle_start', sixMonthsAgo.toISOString().slice(0, 10))
        .order('cycle_start', { ascending: true }),
      supabase
        .from('symptom_logs')
        .select('symptom')
        .eq('user_id', userId)
        .gte('logged_at', ninetyDaysAgo.toISOString()),
    ]);

    if (chartCyclesRes.data?.length > 1) {
      const uniqueStarts = [...new Set(chartCyclesRes.data.map(c => c.cycle_start))].sort();
      const built = [];
      for (let i = 0; i < uniqueStarts.length - 1; i++) {
        const start = new Date(uniqueStarts[i] + 'T00:00:00');
        const nextStart = new Date(uniqueStarts[i + 1] + 'T00:00:00');
        const days = Math.round((nextStart - start) / 86_400_000);
        // Exclude unrealistically short cycles (likely duplicate entries for same period)
        if (days >= 14 && days <= 90) {
          built.push({ label: SHORT_MONTHS[start.getMonth()], length: days });
        }
      }
      setCycleData(built);
    }

    if (chartSymptomsRes.data?.length > 0) {
      const counts = {};
      chartSymptomsRes.data.forEach(({ symptom }) => {
        const meta = SYMPTOM_CHIPS.find((s) => s.key === symptom);
        const name = meta?.label ?? symptom;
        counts[name] = (counts[name] ?? 0) + 1;
      });
      setSymptomData(
        Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => ({ name, count }))
      );
    }
  }, [user]);

  useEffect(() => { loadMonthData(); }, [loadMonthData]);
  useEffect(() => { loadChartData(); }, [loadChartData]);

  /* ── Prediction Logic ── */
  const pad = (n) => String(n).padStart(2, '0');
  const formatLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  /* ── Auto-calculated Averages ── */
  const { autoAvgCycleLength, autoAvgPeriodDuration, predictedStart } = useMemo(() => {
    return calculatePredictions(cycleLogs);
  }, [cycleLogs]);

  const actualPeriodDays = useMemo(() => {
    const days = new Set();
    if (!cycleLogs) return days;
    cycleLogs.forEach(log => {
      const startD = new Date(log.cycle_start + 'T00:00:00');
      let duration = 5;
      if (log.cycle_end) {
        const endD = new Date(log.cycle_end + 'T00:00:00');
        duration = Math.round((endD - startD) / 86_400_000) + 1;
      }
      for (let i = 0; i < duration; i++) {
        const d = new Date(startD.getTime() + i * 86_400_000);
        days.add(formatLocal(d));
      }
    });
    return days;
  }, [cycleLogs]);

  const predictedPeriodDays = useMemo(() => {
    if (!predictedStart) return new Set();
    const pDays = new Set();
    const nextStart = new Date(predictedStart + 'T00:00:00');
    for (let i = 0; i < autoAvgPeriodDuration; i++) {
      const d = new Date(nextStart.getTime() + i * 86_400_000);
      pDays.add(formatLocal(d));
    }
    return pDays;
  }, [predictedStart, autoAvgPeriodDuration]);

  /* ── Month navigation ── */
  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  };

  /* ── Save handlers ── */
  const handleSaveSymptoms = async (date, symptomKeys, severityLabel) => {
    const severityValue = SEVERITY_OPTIONS.find((s) => s.label === severityLabel)?.value ?? 3;

    if (!user) {
      setSymptomDates((prev) => new Set([...prev, date]));
      return;
    }

    setGlobalSaving(true);
    const userId = await getOrCreateUserId(user);
    if (userId) {
      const rows = symptomKeys.map((key) => ({
        user_id: userId,
        symptom: key,
        severity: severityValue,
        source: 'manual',
        logged_at: new Date(date + 'T12:00:00').toISOString(),
      }));
      const { error } = await supabase.from('symptom_logs').insert(rows);
      if (error) console.error('[Sakhi Tracker] symptom insert error:', error);
      else {
        setSymptomDates((prev) => new Set([...prev, date]));
        await loadChartData();
      }
    }
    setGlobalSaving(false);
  };

  const handleMarkPeriod = async (date, periodDur) => {
    const endD = new Date(new Date(date + 'T00:00:00').getTime() + (periodDur - 1) * 86_400_000);
    const cycleEnd = formatLocal(endD);

    if (!user) {
      setCycleLogs((prev) => {
        const existing = prev.find(p => p.cycle_start === date);
        if (existing) return prev.map(p => p.cycle_start === date ? { ...p, cycle_end: cycleEnd } : p);
        return [...prev, { id: Date.now().toString(), cycle_start: date, cycle_end: cycleEnd }];
      });
      return;
    }

    setGlobalSaving(true);
    const userId = await getOrCreateUserId(user);
    if (userId) {
      const existing = cycleLogs.find(l => l.cycle_start === date);
      let error = null;
      let inserted = null;

      if (existing) {
        const res = await supabase.from('cycle_logs').update({ cycle_end: cycleEnd }).eq('id', existing.id).select();
        error = res.error;
        inserted = res.data?.[0];
      } else {
        const res = await supabase.from('cycle_logs').insert({ user_id: userId, cycle_start: date, cycle_end: cycleEnd }).select();
        error = res.error;
        inserted = res.data?.[0];
      }

      if (error) console.error('[Sakhi Tracker] period mark error:', error);
      else if (inserted) {
        setCycleLogs((prev) => {
          if (existing) return prev.map(p => p.id === existing.id ? inserted : p);
          return [...prev, inserted];
        });
        await loadChartData();
      }
    }
    setGlobalSaving(false);
  };

  const handleDeletePeriod = async (date) => {
    if (!user) {
      setCycleLogs(prev => prev.filter(p => p.cycle_start !== date));
      return;
    }
    setGlobalSaving(true);
    const userId = await getOrCreateUserId(user);
    if (userId) {
      const { error } = await supabase.from('cycle_logs').delete().eq('cycle_start', date).eq('user_id', userId);
      if (!error) {
        setCycleLogs(prev => prev.filter(p => p.cycle_start !== date));
        await loadChartData();
      }
    }
    setGlobalSaving(false);
  };

  /* ── Smart insight strings ── */
  const cycleInsight = (() => {
    if (cycleData.length < 2) {
      return tTracker('cycle_insight_empty');
    }
    const first = cycleData[0].length;
    const last = cycleData[cycleData.length - 1].length;
    if (last < first) return tTracker('cycle_insight_down');
    if (last > first) return tTracker('cycle_insight_up');
    return tTracker('cycle_insight_stable');
  })();

  const symptomInsight = (() => {
    if (symptomData.length === 0) return tTracker('symptom_insight_empty');

    const getTransName = (name) => {
      const meta = SYMPTOM_CHIPS.find(s => s.label === name);
      return meta ? tTracker(meta.key) : name;
    };

    const top = getTransName(symptomData[0].name);
    const second = symptomData[1] ? getTransName(symptomData[1].name) : null;

    if (lang === 'mr') {
      return second
        ? `${top} आणि ${second.toLowerCase()} तुमच्यासाठी सर्वात जास्त वेळा दिसतात.`
        : `${top} तुमच्यासाठी सर्वात जास्त वेळा दिसते.`;
    }

    return second
      ? `${top} and ${second.toLowerCase()} show up most often for you.`
      : `${top} shows up most often for you.`;
  })();

  /* ── Get initial duration for LogPanel ── */
  const selectedLog = useMemo(() => {
    return cycleLogs.find(l => {
      const startD = new Date(l.cycle_start + 'T00:00:00');
      let dur = 5;
      if (l.cycle_end) {
        const endD = new Date(l.cycle_end + 'T00:00:00');
        dur = Math.round((endD - startD) / 86_400_000) + 1;
      }
      const targetD = new Date(selectedDate + 'T00:00:00');
      const diff = Math.round((targetD - startD) / 86_400_000);
      return diff >= 0 && diff < dur;
    });
  }, [cycleLogs, selectedDate]);

  const selectedInitialDuration = useMemo(() => {
    if (selectedLog && selectedLog.cycle_end) {
      const start = new Date(selectedLog.cycle_start + 'T00:00:00');
      const end = new Date(selectedLog.cycle_end + 'T00:00:00');
      return Math.round((end - start) / 86_400_000) + 1;
    }
    return autoAvgPeriodDuration;
  }, [selectedLog, autoAvgPeriodDuration]);

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">

      {/* ── Page heading ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text">
            {tTracker('page_title')}
          </h1>
          <BackButton />
        </div>
        <p className="text-sm text-text/50">
          {tTracker('page_subtitle')}
        </p>
      </div>

      {/* ── Top grid: Calendar | Log panel ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

        {/* Calendar card */}
        <div className="bg-white/65 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-5 shadow-sm">
          <CalendarGrid
            year={year}
            month={month}
            selectedDate={selectedDate}
            actualPeriodDays={actualPeriodDays}
            predictedPeriodDays={predictedPeriodDays}
            symptomDates={symptomDates}
            onSelectDate={setSelectedDate}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
            tTracker={tTracker}
          />
          {predictedStart && (
            <div className="mt-4 pt-4 border-t border-text/10 text-sm text-text/70 text-center font-medium">
              {tTracker('next_period_expected')}{' '}
              <span className="text-primary font-bold">
                {new Date(predictedStart + 'T00:00:00').toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-IN', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          )}
        </div>

        {/* Log panel card — key ensures local state resets on date change */}
        <div className="bg-white/65 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-5 shadow-sm">
          <LogPanel
            key={selectedDate}
            date={selectedDate}
            onSaveSymptoms={handleSaveSymptoms}
            onMarkPeriod={handleMarkPeriod}
            onDeletePeriod={handleDeletePeriod}
            selectedLog={selectedLog}
            globalSaving={globalSaving}
            tTracker={tTracker}
            lang={lang}
            initialDuration={selectedInitialDuration}
          />
        </div>
      </div>

      {/* ── Bottom grid: Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

        {/* Cycle length line chart */}
        <div className="bg-white/65 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-text mb-1">
            {tTracker('cycle_chart_title')}
          </h3>
          <p className="text-xs text-primary mb-4 leading-relaxed">{cycleInsight}</p>

          {cycleData.length < 2 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center gap-2">
              <span className="text-2xl">🌙</span>
              <p className="text-sm text-text/40 max-w-xs leading-relaxed">
                {tTracker('cycle_empty_state')}
              </p>
            </div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cycleData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2E2A2808" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickFormatter={(label) => {
                      const idx = SHORT_MONTHS.indexOf(label);
                      const keys = ['jan_short', 'feb_short', 'mar_short', 'apr_short', 'may_short', 'jun_short', 'jul_short', 'aug_short', 'sep_short', 'oct_short', 'nov_short', 'dec_short'];
                      return idx >= 0 ? tTracker(keys[idx]) : label;
                    }}
                    tick={{ fontSize: 11, fill: '#2E2A2865' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 60]}
                    ticks={[0, 15, 30, 45, 60]}
                    tick={{ fontSize: 11, fill: '#2E2A2865' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FDF8F3',
                      border: '1px solid #D9888025',
                      borderRadius: 8,
                      fontSize: 12,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                    formatter={(v) => [`${v} days`, 'Cycle length']}
                  />
                  <Line
                    type="monotone"
                    dataKey="length"
                    stroke="#D98880"
                    strokeWidth={2}
                    dot={{ fill: '#FDF8F3', stroke: '#D98880', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 5, fill: '#D98880', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Symptom frequency bar chart */}
        <div className="bg-white/65 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-text mb-1">
            {tTracker('symptoms_chart_title')}{' '}
            <span className="text-text/40 font-normal text-sm">{tTracker('last_90_days')}</span>
          </h3>
          <p className="text-xs text-text/50 mb-4 leading-relaxed">{symptomInsight}</p>

          {symptomData.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center gap-2">
              <span className="text-2xl">📊</span>
              <p className="text-sm text-text/40 max-w-xs leading-relaxed">
                {tTracker('symptom_empty_state')}
              </p>
            </div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={symptomData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2E2A2808" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickFormatter={(name) => {
                      const meta = SYMPTOM_CHIPS.find(s => s.label === name);
                      return meta ? tTracker(meta.key) : name;
                    }}
                    tick={{ fontSize: 10, fill: '#2E2A2865' }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#2E2A2865' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FDF8F3',
                      border: '1px solid #8FA88825',
                      borderRadius: 8,
                      fontSize: 12,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                    formatter={(v) => [`${v} times`, 'Logged']}
                  />
                  <Bar dataKey="count" fill="#8FA888" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ── Demo note ── */}
      {isDemo && (
        <p className="text-xs text-primary/70 mb-5">
          {tTracker('sample_data')}{' '}
          <a href="/login" className="underline hover:text-primary transition-colors">
            {tTracker('this_demo')}
          </a>
        </p>
      )}

      {/* ── Footer disclaimer ── */}
      <footer className="border-t border-text/8 pt-4 pb-2">
        <p className="text-[11px] text-text/35 text-center">
          {tTracker('disclaimer')}
        </p>
      </footer>
    </div>
  );
}
