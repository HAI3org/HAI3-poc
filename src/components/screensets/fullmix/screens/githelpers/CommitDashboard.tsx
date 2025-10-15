import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  BarChart3,
  Calendar,
  Filter,
  SortAsc,
  SortDesc,
  User as UserIcon,
  Building2,
  Search,
  X
} from 'lucide-react';

type CommitRecord = {
  user: string;
  department: string;
  org: string;
  date: string;
  locBugfixes: number;
  locFeatures: number;
  locThirdParty: number;
  locTech?: number;
  locUnknown?: number;
  qualityScore: number;
};

type CompType = 'user' | 'team_total' | 'team_avg' | 'department_total' | 'department_avg';
type CompItemShape = { type: CompType; key: string };

type ChartComparisonAdderProps = {
  users: string[];
  teams: string[];
  departments: string[];
  excluded: CompItemShape[];
  onAdd: (item: CompItemShape) => void;
};

const ChartComparisonAdder: React.FC<ChartComparisonAdderProps> = ({ users, teams, departments, excluded, onAdd }) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CompType>('user');
  const [query, setQuery] = useState('');

  const excludedSet = useMemo(() => new Set(excluded.map(e => `${e.type}:${e.key}`)), [excluded]);

  const options = useMemo(() => {
    const list = mode === 'user' ? users : mode.startsWith('team') ? teams : departments;
    return list
      .filter(k => !excludedSet.has(`${mode}:${k}`))
      .filter(k => k.toLowerCase().includes(query.trim().toLowerCase()))
      .slice(0, 10);
  }, [mode, users, teams, departments, excludedSet, query]);

  const modes: { t: CompType; label: string }[] = [
    { t: 'user', label: 'user' },
    { t: 'team_total', label: 'team (total)' },
    { t: 'team_avg', label: 'team (avg)' },
    { t: 'department_total', label: 'department (total)' },
    { t: 'department_avg', label: 'department (avg)' }
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="rounded-full border border-dashed border-blue-300 px-3 py-1 text-xs font-medium text-blue-500 hover:border-blue-400 hover:text-blue-600"
      >
        + Add
      </button>
      {open && (
        <div className="absolute z-10 mt-2 w-72 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="flex border-b border-gray-100">
            {modes.map((m) => (
              <button
                key={m.t}
                onClick={() => setMode(m.t)}
                className={`px-2 py-2 text-xs ${mode === m.t ? 'text-blue-600' : 'text-gray-500'} hover:text-blue-700`}
              >
                {m.label}
              </button>
            ))}
            <div className="ml-auto p-2">
              <button onClick={() => setOpen(false)} className="rounded-full p-1 text-gray-400 hover:text-gray-600" aria-label="Close">
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={mode === 'user' ? 'Search users' : mode.startsWith('team') ? 'Search teams' : 'Search departments'}
              className="w-full border-none text-sm focus:outline-none"
              autoFocus
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-400">No options</div>
            ) : (
              options.map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    onAdd({ type: mode, key: k });
                    setQuery('');
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span>{k}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

type ChartUserAdderProps = {
  availableUsers: string[];
  excludedUsers: string[];
  onAdd: (user: string) => void;
};

const ChartUserAdder: React.FC<ChartUserAdderProps> = ({ availableUsers, excludedUsers, onAdd }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const options = useMemo(
    () =>
      availableUsers
        .filter(user => !excludedUsers.includes(user))
        .filter(user => user.toLowerCase().includes(query.trim().toLowerCase()))
        .slice(0, 10),
    [availableUsers, excludedUsers, query]
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="rounded-full border border-dashed border-blue-300 px-3 py-1 text-xs font-medium text-blue-500 hover:border-blue-400 hover:text-blue-600"
      >
        + Add user
      </button>
      {open && (
        <div className="absolute z-10 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search users"
              className="w-full border-none text-sm focus:outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-400">No users found</div>
            ) : (
              options.map(user => (
                <button
                  key={user}
                  type="button"
                  onClick={() => {
                    onAdd(user);
                    setQuery('');
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span>{user}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

type AggregatedRow = {
  user: string;
  team: string;
  department: string;
  org: string;
  locBugfixes: number;
  locFeatures: number;
  locTech: number;
  locThirdParty: number;
  locUnknown: number;
  locCommitted: number;
  qualityScore: number;
};

type SortKey = keyof Pick<AggregatedRow, 'user' | 'team' | 'department' | 'org' | 'locCommitted' | 'locBugfixes' | 'locFeatures' | 'locTech' | 'locThirdParty' | 'locUnknown' | 'qualityScore'>;
type SortDir = 'asc' | 'desc';
type CategoryKey = 'locBugfixes' | 'locFeatures' | 'locTech' | 'locThirdParty' | 'locUnknown' | 'locTotal';

const rawData: CommitRecord[] = [
  { user: 'john.doe', department: 'Platform', org: 'acme', date: '2025-08-18', locBugfixes: 140, locFeatures: 360, locThirdParty: 45, qualityScore: 82 },
  { user: 'john.doe', department: 'Platform', org: 'acme', date: '2025-08-19', locBugfixes: 120, locFeatures: 390, locThirdParty: 30, qualityScore: 84 },
  { user: 'john.doe', department: 'Platform', org: 'acme', date: '2025-08-21', locBugfixes: 160, locFeatures: 420, locThirdParty: 55, qualityScore: 87 },
  { user: 'john.doe', department: 'Platform', org: 'acme', date: '2025-08-25', locBugfixes: 130, locFeatures: 460, locThirdParty: 60, qualityScore: 88 },
  { user: 'john.doe', department: 'Platform', org: 'acme', date: '2025-08-28', locBugfixes: 150, locFeatures: 480, locThirdParty: 70, qualityScore: 89 },
  { user: 'jane.smith', department: 'Payments', org: 'acme', date: '2025-08-17', locBugfixes: 80, locFeatures: 340, locThirdParty: 45, qualityScore: 86 },
  { user: 'jane.smith', department: 'Payments', org: 'acme', date: '2025-08-20', locBugfixes: 95, locFeatures: 360, locThirdParty: 55, qualityScore: 89 },
  { user: 'jane.smith', department: 'Payments', org: 'acme', date: '2025-08-23', locBugfixes: 110, locFeatures: 380, locThirdParty: 40, qualityScore: 90 },
  { user: 'jane.smith', department: 'Payments', org: 'acme', date: '2025-08-26', locBugfixes: 100, locFeatures: 420, locThirdParty: 50, qualityScore: 92 },
  { user: 'jane.smith', department: 'Payments', org: 'acme', date: '2025-08-28', locBugfixes: 105, locFeatures: 390, locThirdParty: 60, qualityScore: 91 },
  { user: 'mike.wilson', department: 'Core', org: 'globex', date: '2025-08-18', locBugfixes: 70, locFeatures: 260, locThirdParty: 40, qualityScore: 72 },
  { user: 'mike.wilson', department: 'Core', org: 'globex', date: '2025-08-19', locBugfixes: 65, locFeatures: 240, locThirdParty: 35, qualityScore: 74 },
  { user: 'mike.wilson', department: 'Core', org: 'globex', date: '2025-08-24', locBugfixes: 90, locFeatures: 280, locThirdParty: 50, qualityScore: 76 },
  { user: 'mike.wilson', department: 'Core', org: 'globex', date: '2025-08-27', locBugfixes: 85, locFeatures: 300, locThirdParty: 45, qualityScore: 78 },
  { user: 'mike.wilson', department: 'Core', org: 'globex', date: '2025-08-29', locBugfixes: 95, locFeatures: 310, locThirdParty: 55, qualityScore: 80 },
  { user: 'emily.chen', department: 'Analytics', org: 'acme', date: '2025-08-16', locBugfixes: 100, locFeatures: 480, locThirdParty: 70, qualityScore: 90 },
  { user: 'emily.chen', department: 'Analytics', org: 'acme', date: '2025-08-20', locBugfixes: 120, locFeatures: 500, locThirdParty: 80, qualityScore: 92 },
  { user: 'emily.chen', department: 'Analytics', org: 'acme', date: '2025-08-24', locBugfixes: 110, locFeatures: 520, locThirdParty: 75, qualityScore: 93 },
  { user: 'emily.chen', department: 'Analytics', org: 'acme', date: '2025-08-27', locBugfixes: 130, locFeatures: 540, locThirdParty: 85, qualityScore: 94 },
  { user: 'alex.ivanov', department: 'Mobile', org: 'globex', date: '2025-08-18', locBugfixes: 90, locFeatures: 310, locThirdParty: 60, qualityScore: 78 },
  { user: 'alex.ivanov', department: 'Mobile', org: 'globex', date: '2025-08-21', locBugfixes: 95, locFeatures: 330, locThirdParty: 55, qualityScore: 80 },
  { user: 'alex.ivanov', department: 'Mobile', org: 'globex', date: '2025-08-25', locBugfixes: 100, locFeatures: 350, locThirdParty: 50, qualityScore: 81 },
  { user: 'alex.ivanov', department: 'Mobile', org: 'globex', date: '2025-08-28', locBugfixes: 110, locFeatures: 360, locThirdParty: 65, qualityScore: 83 },
  { user: 'sofia.garcia', department: 'Web', org: 'initech', date: '2025-08-17', locBugfixes: 70, locFeatures: 280, locThirdParty: 45, qualityScore: 82 },
  { user: 'sofia.garcia', department: 'Web', org: 'initech', date: '2025-08-20', locBugfixes: 75, locFeatures: 290, locThirdParty: 50, qualityScore: 83 },
  { user: 'sofia.garcia', department: 'Web', org: 'initech', date: '2025-08-23', locBugfixes: 80, locFeatures: 300, locThirdParty: 55, qualityScore: 84 },
  { user: 'sofia.garcia', department: 'Web', org: 'initech', date: '2025-08-27', locBugfixes: 85, locFeatures: 320, locThirdParty: 60, qualityScore: 85 }
];

const numberFmt = (n: number) => n.toLocaleString();

const qualityClass = (q: number) => {
  if (q >= 90) return 'bg-green-100 text-green-700';
  if (q >= 80) return 'bg-blue-100 text-blue-700';
  if (q >= 70) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

const parseDate = (date: string): Date => new Date(`${date}T00:00:00Z`);

const formatDayLabel = (date: Date): string =>
  new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);

const startOfWeekUTC = (date: Date): Date => {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = (day + 6) % 7; // Monday as start of week
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const startOfMonthUTC = (date: Date): Date => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
};

const formatWeekLabel = (monday: Date): string => `Week of ${formatDayLabel(monday)}`;
const formatMonthLabel = (firstOfMonth: Date): string =>
  new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(firstOfMonth);

const categoryConfig: Record<CategoryKey, { label: string; color: string }> = {
  locBugfixes: { label: 'Bugs LoC', color: '#2563eb' },
  locFeatures: { label: 'Features LoC', color: '#60a5fa' },
  locTech: { label: 'Tech LoC', color: '#93c5fd' },
  locThirdParty: { label: 'Third-party LoC', color: '#bfdbfe' },
  locUnknown: { label: 'Unknown LoC', color: '#dbeafe' },
  locTotal: { label: 'Total LoC', color: '#0f172a' }
};

const categoryOrder: CategoryKey[] = ['locBugfixes', 'locFeatures', 'locTech', 'locThirdParty', 'locUnknown'];

const comparisonPalettes: string[][] = [
  ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'], // blueish
  ['#047857', '#059669', '#10b981', '#34d399', '#6ee7b7'], // greenish
  ['#6d28d9', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd'], // purple
  ['#c2410c', '#ea580c', '#f97316', '#fb923c', '#fdba74'], // orange
  ['#be123c', '#e11d48', '#f43f5e', '#fb7185', '#fda4af']  // rose
];

const comparisonTotalColors: string[] = [
  '#1d4ed8', '#047857', '#6d28d9', '#c2410c', '#be123c'
];

type ChartPoint = {
  label: string;
  sortValue: number;
  locBugfixes: number;
  locFeatures: number;
  locTech: number;
  locThirdParty: number;
  locUnknown: number;
  locTotal: number;
  [key: string]: number | string;
};

 

const PAGE_SIZE = 10;

type CustomTooltipItem = {
  name?: string | number;
  color?: string;
  value?: number | string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: CustomTooltipItem[];
  label?: string | number;
  showTotalFooter?: boolean;
};

const ChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, showTotalFooter = true }) => {
  if (!active || !payload || payload.length === 0) return null;

  const total = payload.reduce<number>((sum, entry) => sum + Number(entry.value ?? 0), 0);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-md text-sm">
      <div className="font-medium text-gray-900">{label}</div>
      <div className="mt-2 space-y-1">
        {payload.map(entry => (
          <div key={entry.name?.toString()} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-gray-600">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color || '#94a3b8' }}
              />
              {entry.name}
            </span>
            <span className="font-semibold text-gray-900">{numberFmt(Number(entry.value ?? 0))}</span>
          </div>
        ))}
      </div>
      {showTotalFooter && (
        <div className="mt-3 border-t border-gray-100 pt-2 text-right text-xs text-gray-500">
          Total: {numberFmt(total)}
        </div>
      )}
    </div>
  );
};

const userCategoryKey = (user: string, category: CategoryKey) => `${user}__${category}`;
type ComparisonType = 'user' | 'team_total' | 'team_avg' | 'department_total' | 'department_avg';
type ComparisonItem = { type: ComparisonType; key: string };
const comparisonKey = (item: ComparisonItem, category: CategoryKey) => `${item.type}:${item.key}__${category}`;

const CommitDashboard: React.FC = () => {
  const [orgQuery, setOrgQuery] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('locCommitted');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [focusedUser, setFocusedUser] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<ComparisonItem[]>([]);
  const [timeScale, setTimeScale] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [visibleCategories, setVisibleCategories] = useState<Record<CategoryKey, boolean>>({
    locBugfixes: true,
    locFeatures: true,
    locTech: true,
    locThirdParty: true,
    locUnknown: true,
    locTotal: true
  });
  const [page, setPage] = useState(0);

  const orgOptions = useMemo(() => Array.from(new Set(rawData.map(record => record.org))).sort(), []);
  const userOptions = useMemo(() => Array.from(new Set(rawData.map(record => record.user))).sort(), []);

  const filteredRecords = useMemo(() => {
    return rawData.filter(record => {
      const orgSearch = orgQuery.trim().toLowerCase();
      const userSearch = userQuery.trim().toLowerCase();
      if (orgSearch && !record.org.toLowerCase().includes(orgSearch)) return false;
      if (userSearch && !record.user.toLowerCase().includes(userSearch)) return false;
      if (from && record.date < from) return false;
      if (to && record.date > to) return false;
      return true;
    });
  }, [orgQuery, userQuery, from, to]);

  const tableRows = useMemo<AggregatedRow[]>(() => {
    const grouped = new Map<string, { row: AggregatedRow; qualityTotal: number; sampleCount: number }>();

    filteredRecords.forEach(record => {
      if (!grouped.has(record.user)) {
        grouped.set(record.user, {
          row: {
            user: record.user,
            team: record.department,
            department: record.department,
            org: record.org,
            locBugfixes: 0,
            locFeatures: 0,
            locTech: 0,
            locThirdParty: 0,
            locUnknown: 0,
            locCommitted: 0,
            qualityScore: 0
          },
          qualityTotal: 0,
          sampleCount: 0
        });
      }

      const entry = grouped.get(record.user)!;
      entry.row.team = record.department;
      entry.row.department = record.department;
      entry.row.org = record.org;
      entry.row.locBugfixes += record.locBugfixes;
      entry.row.locFeatures += record.locFeatures;
      entry.row.locTech += record.locTech || 0;
      entry.row.locThirdParty += record.locThirdParty;
      entry.row.locUnknown += record.locUnknown || 0;
      entry.row.locCommitted = entry.row.locBugfixes + entry.row.locFeatures + entry.row.locTech + entry.row.locThirdParty + entry.row.locUnknown;
      entry.qualityTotal += record.qualityScore;
      entry.sampleCount += 1;
    });

    return Array.from(grouped.values()).map(entry => ({
      ...entry.row,
      qualityScore: entry.sampleCount ? Math.round(entry.qualityTotal / entry.sampleCount) : 0
    }));
  }, [filteredRecords]);

  const sortedRows = useMemo(() => {
    const arr = [...tableRows];
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      const as = String(av).toLowerCase();
      const bs = String(bv).toLowerCase();
      if (as < bs) return sortDir === 'asc' ? -1 : 1;
      if (as > bs) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [tableRows, sortKey, sortDir]);

  useEffect(() => {
    if (!sortedRows.length) {
      if (focusedUser !== null) setFocusedUser(null);
      return;
    }

    if (!focusedUser || !sortedRows.some(row => row.user === focusedUser)) {
      setFocusedUser(sortedRows[0].user);
    }
  }, [sortedRows, focusedUser]);

  useEffect(() => {
    setSelectedItems(prev => {
      if (!sortedRows.length) {
        return prev.length ? [] : prev;
      }
      return prev.filter(item => {
        if (item.type === 'user') return sortedRows.some(row => row.user === item.key);
        if (item.type.startsWith('team')) return true;
        if (item.type.startsWith('department')) return true;
        return false;
      });
    });
  }, [sortedRows]);

  useEffect(() => {
    setPage(0);
  }, [orgQuery, userQuery, from, to]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
    if (page >= totalPages) {
      setPage(totalPages - 1);
    }
  }, [page, sortedRows.length]);

  const selectedSummary = useMemo(
    () => sortedRows.find(row => row.user === focusedUser) ?? null,
    [sortedRows, focusedUser]
  );

  const chartData = useMemo<ChartPoint[]>(() => {
    if (!filteredRecords.length) return [];

    const byDate = new Map<
      string,
      {
        totals: Record<CategoryKey, number>;
        perUser: Map<string, Record<CategoryKey, number>>;
        perTeam: Map<string, Record<CategoryKey, number>>;
        perDept: Map<string, Record<CategoryKey, number>>;
        perTeamUsers: Map<string, Set<string>>;
        perDeptUsers: Map<string, Set<string>>;
      }
    >();

    filteredRecords.forEach(record => {
      const bucket = byDate.get(record.date) ?? {
        totals: { locBugfixes: 0, locFeatures: 0, locTech: 0, locThirdParty: 0, locUnknown: 0, locTotal: 0 },
        perUser: new Map(),
        perTeam: new Map(),
        perDept: new Map(),
        perTeamUsers: new Map(),
        perDeptUsers: new Map()
      };

      bucket.totals.locBugfixes += record.locBugfixes;
      bucket.totals.locFeatures += record.locFeatures;
      bucket.totals.locTech += record.locTech || 0;
      bucket.totals.locThirdParty += record.locThirdParty;
      bucket.totals.locUnknown += record.locUnknown || 0;
      bucket.totals.locTotal =
        bucket.totals.locBugfixes + bucket.totals.locFeatures + bucket.totals.locTech + bucket.totals.locThirdParty + bucket.totals.locUnknown;

      const userEntry = bucket.perUser.get(record.user) ?? {
        locBugfixes: 0,
        locFeatures: 0,
        locTech: 0,
        locThirdParty: 0,
        locUnknown: 0,
        locTotal: 0
      };

      userEntry.locBugfixes += record.locBugfixes;
      userEntry.locFeatures += record.locFeatures;
      userEntry.locTech += record.locTech || 0;
      userEntry.locThirdParty += record.locThirdParty;
      userEntry.locUnknown += record.locUnknown || 0;
      userEntry.locTotal = userEntry.locBugfixes + userEntry.locFeatures + userEntry.locTech + userEntry.locThirdParty + userEntry.locUnknown;

      bucket.perUser.set(record.user, userEntry);

      const teamKey = record.department;
      const teamEntry = bucket.perTeam.get(teamKey) ?? {
        locBugfixes: 0,
        locFeatures: 0,
        locTech: 0,
        locThirdParty: 0,
        locUnknown: 0,
        locTotal: 0
      };
      teamEntry.locBugfixes += record.locBugfixes;
      teamEntry.locFeatures += record.locFeatures;
      teamEntry.locTech += record.locTech || 0;
      teamEntry.locThirdParty += record.locThirdParty;
      teamEntry.locUnknown += record.locUnknown || 0;
      teamEntry.locTotal = teamEntry.locBugfixes + teamEntry.locFeatures + teamEntry.locTech + teamEntry.locThirdParty + teamEntry.locUnknown;
      bucket.perTeam.set(teamKey, teamEntry);
      const teamUsers = bucket.perTeamUsers.get(teamKey) ?? new Set<string>();
      teamUsers.add(record.user);
      bucket.perTeamUsers.set(teamKey, teamUsers);

      const deptKey = record.org;
      const deptEntry = bucket.perDept.get(deptKey) ?? {
        locBugfixes: 0,
        locFeatures: 0,
        locTech: 0,
        locThirdParty: 0,
        locUnknown: 0,
        locTotal: 0
      };
      deptEntry.locBugfixes += record.locBugfixes;
      deptEntry.locFeatures += record.locFeatures;
      deptEntry.locTech += record.locTech || 0;
      deptEntry.locThirdParty += record.locThirdParty;
      deptEntry.locUnknown += record.locUnknown || 0;
      deptEntry.locTotal = deptEntry.locBugfixes + deptEntry.locFeatures + deptEntry.locTech + deptEntry.locThirdParty + deptEntry.locUnknown;
      bucket.perDept.set(deptKey, deptEntry);
      const deptUsers = bucket.perDeptUsers.get(deptKey) ?? new Set<string>();
      deptUsers.add(record.user);
      bucket.perDeptUsers.set(deptKey, deptUsers);
      byDate.set(record.date, bucket);
    });

    const dateKeys = Array.from(byDate.keys());
    if (!dateKeys.length) return [];

    const minDate = dateKeys.reduce((min, date) => (date < min ? date : min));
    const maxDate = dateKeys.reduce((max, date) => (date > max ? date : max));

    const startDate = from ? parseDate(from) : parseDate(minDate);
    const endDate = to ? parseDate(to) : parseDate(maxDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate > endDate) {
      return [];
    }

    const grouped = new Map<string, ChartPoint>();
    const cursor = new Date(startDate);

    while (cursor <= endDate) {
      const day = cursor.getUTCDay();
      if (day !== 0 && day !== 6) {
        const iso = cursor.toISOString().slice(0, 10);
        const data = byDate.get(iso);

        let groupKey: string;
        let label: string;
        let sortValue: number;
        if (timeScale === 'daily') {
          groupKey = iso;
          label = formatDayLabel(cursor);
          sortValue = cursor.getTime();
        } else if (timeScale === 'weekly') {
          const monday = startOfWeekUTC(cursor);
          groupKey = `w-${monday.toISOString().slice(0, 10)}`;
          label = formatWeekLabel(monday);
          sortValue = monday.getTime();
        } else {
          const first = startOfMonthUTC(cursor);
          groupKey = `m-${first.toISOString().slice(0, 7)}`;
          label = formatMonthLabel(first);
          sortValue = first.getTime();
        }

        const gp = grouped.get(groupKey) ?? {
          label,
          sortValue,
          locBugfixes: 0,
          locFeatures: 0,
          locTech: 0,
          locThirdParty: 0,
          locUnknown: 0,
          locTotal: 0
        } as ChartPoint;

        const totals = data?.totals ?? {
          locBugfixes: 0,
          locFeatures: 0,
          locTech: 0,
          locThirdParty: 0,
          locUnknown: 0,
          locTotal: 0
        };

        gp.locBugfixes += totals.locBugfixes;
        gp.locFeatures += totals.locFeatures;
        gp.locTech += totals.locTech;
        gp.locThirdParty += totals.locThirdParty;
        gp.locUnknown += totals.locUnknown;
        gp.locTotal += totals.locTotal;

        if (selectedItems.length > 0) {
          selectedItems.forEach(item => {
            let rec = { locBugfixes: 0, locFeatures: 0, locTech: 0, locThirdParty: 0, locUnknown: 0, locTotal: 0 };
            if (item.type === 'user') {
              const u = data?.perUser.get(item.key);
              if (u) rec = u;
            } else if (item.type === 'team_total') {
              const t = data?.perTeam.get(item.key);
              if (t) rec = t;
            } else if (item.type === 'team_avg') {
              const t = data?.perTeam.get(item.key);
              const cnt = data?.perTeamUsers.get(item.key)?.size || 0;
              if (t && cnt > 0) {
                rec = {
                  locBugfixes: Math.round(t.locBugfixes / cnt),
                  locFeatures: Math.round(t.locFeatures / cnt),
                  locTech: Math.round(t.locTech / cnt),
                  locThirdParty: Math.round(t.locThirdParty / cnt),
                  locUnknown: Math.round(t.locUnknown / cnt),
                  locTotal: Math.round(t.locTotal / cnt)
                };
              }
            } else if (item.type === 'department_total') {
              const d = data?.perDept.get(item.key);
              if (d) rec = d;
            } else if (item.type === 'department_avg') {
              const d = data?.perDept.get(item.key);
              const cnt = data?.perDeptUsers.get(item.key)?.size || 0;
              if (d && cnt > 0) {
                rec = {
                  locBugfixes: Math.round(d.locBugfixes / cnt),
                  locFeatures: Math.round(d.locFeatures / cnt),
                  locTech: Math.round(d.locTech / cnt),
                  locThirdParty: Math.round(d.locThirdParty / cnt),
                  locUnknown: Math.round(d.locUnknown / cnt),
                  locTotal: Math.round(d.locTotal / cnt)
                };
              }
            }
            gp[comparisonKey(item, 'locBugfixes')] = (gp[comparisonKey(item, 'locBugfixes')] as number | undefined || 0) + rec.locBugfixes;
            gp[comparisonKey(item, 'locFeatures')] = (gp[comparisonKey(item, 'locFeatures')] as number | undefined || 0) + rec.locFeatures;
            gp[comparisonKey(item, 'locTech')] = (gp[comparisonKey(item, 'locTech')] as number | undefined || 0) + rec.locTech;
            gp[comparisonKey(item, 'locThirdParty')] = (gp[comparisonKey(item, 'locThirdParty')] as number | undefined || 0) + rec.locThirdParty;
            gp[comparisonKey(item, 'locUnknown')] = (gp[comparisonKey(item, 'locUnknown')] as number | undefined || 0) + rec.locUnknown;
            gp[comparisonKey(item, 'locTotal')] = (gp[comparisonKey(item, 'locTotal')] as number | undefined || 0) + rec.locTotal;
          });
        }

        grouped.set(groupKey, gp);
      }

      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return Array.from(grouped.values()).sort((a, b) => (a.sortValue as number) - (b.sortValue as number));
  }, [filteredRecords, selectedItems, from, to, timeScale]);

  const setSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'user' || key === 'team' || key === 'department' || key === 'org' ? 'asc' : 'desc');
    }
  };

  const toggleCategory = (key: CategoryKey) => {
    setVisibleCategories(prev => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      if (prev[key] && activeCount === 1) return prev;
      return { ...prev, [key]: !prev[key] };
    });
  };

  const activeCategories = useMemo(
    () =>
      (Object.entries(categoryConfig) as [CategoryKey, { label: string; color: string }][]).filter(
        ([key]) => visibleCategories[key]
      ),
    [visibleCategories]
  );

  const activeBarCategories = useMemo(
    () => activeCategories.filter(([key]) => key !== 'locTotal'),
    [activeCategories]
  );

  const hasChartData = chartData.length > 0 && activeCategories.length > 0;

  const availableUsers = useMemo(() => sortedRows.map(row => row.user), [sortedRows]);
  const availableTeams = useMemo(() => Array.from(new Set(filteredRecords.map(r => r.department))).sort(), [filteredRecords]);
  const availableDepartments = useMemo(() => Array.from(new Set(filteredRecords.map(r => r.org))).sort(), [filteredRecords]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));

  const pagedRows = useMemo(
    () => sortedRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [sortedRows, page]
  );

  const canAddMore = selectedItems.length < 5;

  const showTotalsOnly = selectedItems.length === 0;

  const toggleComparison = useCallback((item: ComparisonItem) => {
    setSelectedItems(prev => {
      const exists = prev.some(p => p.type === item.type && p.key === item.key);
      if (exists) return prev.filter(p => !(p.type === item.type && p.key === item.key));
      if (prev.length >= 5) return prev;
      return [...prev, item];
    });
  }, []);

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden p-4">
      <div className="mb-4 rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Commit Dashboard</h1>
              <p className="text-sm text-gray-500">Commits per user with LOC breakdown and quality</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">{sortedRows.length} users</div>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:items-end">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Org search</label>
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={orgQuery}
                  onChange={e => setOrgQuery(e.target.value)}
                  placeholder="Search orgs"
                  list="org-suggestions"
                  className="w-full rounded-md border border-gray-300 py-1 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {orgQuery && (
                  <button
                    type="button"
                    onClick={() => setOrgQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:text-gray-600"
                    aria-label="Clear org search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <datalist id="org-suggestions">
                {orgOptions.map(org => (
                  <option key={org} value={org} />
                ))}
              </datalist>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">User search</label>
            <div className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4 text-gray-400" />
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={userQuery}
                  onChange={e => setUserQuery(e.target.value)}
                  placeholder="Search users"
                  list="user-suggestions"
                  className="w-full rounded-md border border-gray-300 py-1 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {userQuery && (
                  <button
                    type="button"
                    onClick={() => setUserQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:text-gray-600"
                    aria-label="Clear user search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <datalist id="user-suggestions">
                {userOptions.map(user => (
                  <option key={user} value={user} />
                ))}
              </datalist>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">From</label>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">To</label>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={to}
                onChange={e => setTo(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Presets</label>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                onChange={e => {
                  const preset = e.target.value;
                  if (!preset) {
                    setFrom('');
                    setTo('');
                    return;
                  }

                  const today = new Date();
                  const end = today.toISOString().slice(0, 10);

                  if (preset === '7d') {
                    const start = new Date(today);
                    start.setDate(start.getDate() - 7);
                    setFrom(start.toISOString().slice(0, 10));
                    setTo(end);
                  } else if (preset === '30d') {
                    const start = new Date(today);
                    start.setDate(start.getDate() - 30);
                    setFrom(start.toISOString().slice(0, 10));
                    setTo(end);
                  }
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All time</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 space-y-4 overflow-y-auto">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {([
                    { key: 'user', label: 'User' },
                    { key: 'team', label: 'Team' },
                    { key: 'department', label: 'Department' },
                    { key: 'org', label: 'Org' },
                    { key: 'locCommitted', label: 'LOC Committed' },
                    { key: 'locBugfixes', label: 'LOC in Bugfixes' },
                    { key: 'locFeatures', label: 'LOC in Features' },
                    { key: 'locTech', label: 'LOC in Tech' },
                    { key: 'locThirdParty', label: 'LOC in Third-party/Submodule' },
                    { key: 'locUnknown', label: 'LOC Unknown' },
                    { key: 'qualityScore', label: 'Overall Code Quality' }
                  ] as { key: SortKey; label: string }[]).map(column => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      <button onClick={() => setSort(column.key)} className="group flex items-center space-x-1">
                        <span>{column.label}</span>
                        {sortKey === column.key ? (
                          sortDir === 'asc' ? (
                            <SortAsc className="h-3 w-3 text-gray-400" />
                          ) : (
                            <SortDesc className="h-3 w-3 text-gray-400" />
                          )
                        ) : (
                          <SortDesc className="h-3 w-3 text-transparent group-hover:text-gray-300" />
                        )}
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Chart</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {pagedRows.map(row => (
                  <tr
                    key={row.user}
                    className={`cursor-pointer transition ${
                      focusedUser === row.user ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setFocusedUser(row.user)}
                    aria-selected={focusedUser === row.user}
                  >
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{row.user}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{row.team}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{row.department}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{row.org}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{numberFmt(row.locCommitted)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{numberFmt(row.locBugfixes)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{numberFmt(row.locFeatures)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{numberFmt(row.locTech)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{numberFmt(row.locThirdParty)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{numberFmt(row.locUnknown)}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`rounded px-2 py-1 text-xs font-medium ${qualityClass(row.qualityScore)}`}>
                        {row.qualityScore}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-right">
                      {(() => {
                        const item = { type: 'user' as ComparisonType, key: row.user };
                        const isSelected = selectedItems.some(i => i.type === item.type && i.key === item.key);
                        return (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              toggleComparison(item);
                            }}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                              isSelected
                                ? 'border-transparent bg-blue-600 text-white hover:bg-blue-700'
                                : canAddMore
                                ? 'border-blue-200 bg-white text-blue-600 hover:border-blue-300'
                                : 'border-gray-200 bg-gray-50 text-gray-400'
                            }`}
                            disabled={!isSelected && !canAddMore}
                          >
                            {isSelected ? 'Remove' : 'Add to chart'}
                          </button>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
                {sortedRows.length === 0 && (
                  <tr>
                    <td colSpan={12} className="px-4 py-6 text-center text-sm text-gray-500">
                      No data matches the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Page {page + 1} of {totalPages} · Showing {sortedRows.length ? page * PAGE_SIZE + 1 : 0}–
            {Math.min((page + 1) * PAGE_SIZE, sortedRows.length)} of {sortedRows.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(prev => Math.max(0, prev - 1))}
              disabled={page === 0}
              className="rounded-md border border-gray-200 px-3 py-1 text-sm font-medium text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-md border border-gray-200 px-3 py-1 text-sm font-medium text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {selectedSummary && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedSummary.user} contributions</h2>
                <p className="text-sm text-gray-500">
                  {selectedSummary.department} • {selectedSummary.org}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1 text-blue-700">
                  <span className="font-semibold">{numberFmt(selectedSummary.locCommitted)}</span>
                  total LoC
                </span>
                <span className={`flex items-center gap-2 rounded-lg px-3 py-1 ${qualityClass(selectedSummary.qualityScore)}
                `}>
                  Quality {selectedSummary.qualityScore}
                </span>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex rounded-full bg-gray-100 p-1 text-sm font-medium text-gray-500">
                {(['daily', 'weekly', 'monthly'] as const).map(scale => (
                  <button
                    key={scale}
                    onClick={() => setTimeScale(scale)}
                    className={`rounded-full px-3 py-1 capitalize transition ${
                      timeScale === scale ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-700'
                    }`}
                  >
                    {scale}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(categoryConfig) as [CategoryKey, { label: string; color: string }][]).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => toggleCategory(key)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${
                      visibleCategories[key]
                        ? 'border-transparent bg-gray-900 text-white shadow'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: info.color }} />
                    {info.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Add (max 5)</label>
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map((item, idx) => (
                    <span
                      key={`${item.type}:${item.key}`}
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: `${comparisonPalettes[idx % comparisonPalettes.length][0]}22`,
                        color: comparisonPalettes[idx % comparisonPalettes.length][0],
                        border: `1px solid ${comparisonPalettes[idx % comparisonPalettes.length][0]}33`
                      }}
                    >
                      {item.type === 'user' ? item.key : item.type.replace('_', ' ') + ': ' + item.key}
                      <button
                        type="button"
                        onClick={() => toggleComparison(item)}
                        className="rounded-full p-1"
                        style={{ color: comparisonPalettes[idx % comparisonPalettes.length][0] }}
                        aria-label={`Remove`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {showTotalsOnly && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      Total (all filtered users)
                    </span>
                  )}
                  {canAddMore && (
                    <ChartComparisonAdder
                      users={availableUsers}
                      teams={availableTeams}
                      departments={availableDepartments}
                      excluded={selectedItems}
                      onAdd={toggleComparison}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 h-72 w-full">
              {hasChartData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ left: 4, right: 12, top: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        stroke="#d1d5db"
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={48}
                      />
                      <YAxis tickFormatter={numberFmt} tick={{ fill: '#6b7280', fontSize: 12 }} stroke="#d1d5db" />
                      <Tooltip content={<ChartTooltip showTotalFooter={showTotalsOnly} />} />
                      {showTotalsOnly
                        ? activeBarCategories.map(([key, info]) => (
                            <Bar
                              key={key}
                              dataKey={key}
                              name={info.label}
                              stackId="total"
                              fill={info.color}
                              animationDuration={500}
                            />
                          ))
                        : selectedItems.flatMap((item, idx) =>
                            activeBarCategories.map(([key]) => (
                              <Bar
                                key={`${item.type}:${item.key}-${key}`}
                                dataKey={comparisonKey(item, key)}
                                name={`${item.type === 'user' ? item.key : item.type.replace('_', ' ') + ': ' + item.key} – ${categoryConfig[key].label}`}
                                stackId={`${item.type}:${item.key}`}
                                fill={comparisonPalettes[idx % comparisonPalettes.length][categoryOrder.indexOf(key)]}
                                animationDuration={500}
                              />
                            ))
                          )}
                      {visibleCategories.locTotal && (
                        <>
                          {showTotalsOnly ? (
                            <Line
                              type="monotone"
                              dataKey="locTotal"
                              name={categoryConfig.locTotal.label}
                              stroke={comparisonPalettes[0][0]}
                              strokeWidth={2}
                              dot={false}
                              animationDuration={500}
                            />
                          ) : (
                            selectedItems.map((item, idx) => (
                              <Line
                                key={`${item.type}:${item.key}-locTotal`}
                                type="monotone"
                                dataKey={comparisonKey(item, 'locTotal')}
                                name={`${item.type === 'user' ? item.key : item.type.replace('_', ' ') + ': ' + item.key} – ${categoryConfig.locTotal.label}`}
                                stroke={comparisonPalettes[idx % comparisonPalettes.length][0]}
                                strokeWidth={1.5}
                                strokeDasharray="4 2"
                                dot={false}
                                animationDuration={500}
                              />
                            ))
                          )}
                        </>
                      )}
                    </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  No chart data for the current selection.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitDashboard;
