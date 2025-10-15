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
  qualityScore: number;
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
  department: string;
  org: string;
  locBugfixes: number;
  locFeatures: number;
  locThirdParty: number;
  locCommitted: number;
  qualityScore: number;
};

type SortKey = keyof Pick<AggregatedRow, 'user' | 'department' | 'org' | 'locCommitted' | 'locBugfixes' | 'locFeatures' | 'locThirdParty' | 'qualityScore'>;
type SortDir = 'asc' | 'desc';
type CategoryKey = 'locBugfixes' | 'locFeatures' | 'locThirdParty' | 'locTotal';

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

const categoryConfig: Record<CategoryKey, { label: string; color: string }> = {
  locBugfixes: { label: 'Bugs LoC', color: '#f97316' },
  locFeatures: { label: 'Features LoC', color: '#2563eb' },
  locThirdParty: { label: 'Third-party LoC', color: '#8b5cf6' },
  locTotal: { label: 'Total LoC', color: '#0f172a' }
};

type ChartPoint = {
  label: string;
  sortValue: number;
  locBugfixes: number;
  locFeatures: number;
  locThirdParty: number;
  locTotal: number;
  [key: string]: number | string;
};

type ChartMode = 'stacked' | 'line';

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
};

const ChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
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
      <div className="mt-3 border-t border-gray-100 pt-2 text-right text-xs text-gray-500">
        Total: {numberFmt(total)}
      </div>
    </div>
  );
};

const userCategoryKey = (user: string, category: CategoryKey) => `${user}__${category}`;

const CommitDashboard: React.FC = () => {
  const [orgQuery, setOrgQuery] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('locCommitted');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [focusedUser, setFocusedUser] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [chartMode, setChartMode] = useState<ChartMode>('stacked');
  const [visibleCategories, setVisibleCategories] = useState<Record<CategoryKey, boolean>>({
    locBugfixes: true,
    locFeatures: true,
    locThirdParty: true,
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
            department: record.department,
            org: record.org,
            locBugfixes: 0,
            locFeatures: 0,
            locThirdParty: 0,
            locCommitted: 0,
            qualityScore: 0
          },
          qualityTotal: 0,
          sampleCount: 0
        });
      }

      const entry = grouped.get(record.user)!;
      entry.row.department = record.department;
      entry.row.org = record.org;
      entry.row.locBugfixes += record.locBugfixes;
      entry.row.locFeatures += record.locFeatures;
      entry.row.locThirdParty += record.locThirdParty;
      entry.row.locCommitted = entry.row.locBugfixes + entry.row.locFeatures + entry.row.locThirdParty;
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
    setSelectedUsers(prev => {
      if (!sortedRows.length) {
        return prev.length ? [] : prev;
      }

      const valid = prev.filter(user => sortedRows.some(row => row.user === user));
      if (valid.length !== prev.length) {
        return valid;
      }
      return prev;
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
      }
    >();

    filteredRecords.forEach(record => {
      const bucket = byDate.get(record.date) ?? {
        totals: { locBugfixes: 0, locFeatures: 0, locThirdParty: 0, locTotal: 0 },
        perUser: new Map()
      };

      bucket.totals.locBugfixes += record.locBugfixes;
      bucket.totals.locFeatures += record.locFeatures;
      bucket.totals.locThirdParty += record.locThirdParty;
      bucket.totals.locTotal =
        bucket.totals.locBugfixes + bucket.totals.locFeatures + bucket.totals.locThirdParty;

      const userEntry = bucket.perUser.get(record.user) ?? {
        locBugfixes: 0,
        locFeatures: 0,
        locThirdParty: 0,
        locTotal: 0
      };

      userEntry.locBugfixes += record.locBugfixes;
      userEntry.locFeatures += record.locFeatures;
      userEntry.locThirdParty += record.locThirdParty;
      userEntry.locTotal = userEntry.locBugfixes + userEntry.locFeatures + userEntry.locThirdParty;

      bucket.perUser.set(record.user, userEntry);
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

    const selectedSet = new Set(selectedUsers);

    const points: ChartPoint[] = [];
    const cursor = new Date(startDate);

    while (cursor <= endDate) {
      const day = cursor.getUTCDay();
      if (day !== 0 && day !== 6) {
        const iso = cursor.toISOString().slice(0, 10);
        const data = byDate.get(iso);

        const totals = data?.totals ?? {
          locBugfixes: 0,
          locFeatures: 0,
          locThirdParty: 0,
          locTotal: 0
        };

        const point: ChartPoint = {
          label: formatDayLabel(cursor),
          sortValue: cursor.getTime(),
          locBugfixes: totals.locBugfixes,
          locFeatures: totals.locFeatures,
          locThirdParty: totals.locThirdParty,
          locTotal: totals.locTotal
        };

        if (selectedSet.size > 0) {
          selectedSet.forEach(user => {
            const userTotals = data?.perUser.get(user) ?? {
              locBugfixes: 0,
              locFeatures: 0,
              locThirdParty: 0,
              locTotal: 0
            };
            point[userCategoryKey(user, 'locBugfixes')] = userTotals.locBugfixes;
            point[userCategoryKey(user, 'locFeatures')] = userTotals.locFeatures;
            point[userCategoryKey(user, 'locThirdParty')] = userTotals.locThirdParty;
            point[userCategoryKey(user, 'locTotal')] = userTotals.locTotal;
          });
        }

        points.push(point);
      }

      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return points.sort((a, b) => (a.sortValue as number) - (b.sortValue as number));
  }, [filteredRecords, selectedUsers, from, to]);

  const setSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'user' || key === 'department' || key === 'org' ? 'asc' : 'desc');
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

  const availableChartUsers = useMemo(() => sortedRows.map(row => row.user), [sortedRows]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));

  const pagedRows = useMemo(
    () => sortedRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [sortedRows, page]
  );

  const canAddMoreUsers = selectedUsers.length < 5;

  const showTotalsOnly = selectedUsers.length === 0;

  const toggleChartUser = useCallback((user: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(user)) {
        return prev.filter(u => u !== user);
      }
      if (prev.length >= 5) return prev;
      return [...prev, user];
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
                    { key: 'department', label: 'Department' },
                    { key: 'org', label: 'Org' },
                    { key: 'locCommitted', label: 'LOC Committed' },
                    { key: 'locBugfixes', label: 'LOC in Bugfixes' },
                    { key: 'locFeatures', label: 'LOC in Features' },
                    { key: 'locThirdParty', label: 'LOC in Third-party/Submodule' },
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
                    <td className="px-4 py-2 text-sm text-gray-600">{row.department}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{row.org}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{numberFmt(row.locCommitted)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{numberFmt(row.locBugfixes)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{numberFmt(row.locFeatures)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{numberFmt(row.locThirdParty)}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`rounded px-2 py-1 text-xs font-medium ${qualityClass(row.qualityScore)}`}>
                        {row.qualityScore}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-right">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          toggleChartUser(row.user);
                        }}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                          selectedUsers.includes(row.user)
                            ? 'border-transparent bg-blue-600 text-white hover:bg-blue-700'
                            : canAddMoreUsers
                            ? 'border-blue-200 bg-white text-blue-600 hover:border-blue-300'
                            : 'border-gray-200 bg-gray-50 text-gray-400'
                        }`}
                        disabled={!selectedUsers.includes(row.user) && !canAddMoreUsers}
                      >
                        {selectedUsers.includes(row.user) ? 'Remove' : 'Add to chart'}
                      </button>
                    </td>
                  </tr>
                ))}
                {sortedRows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-sm text-gray-500">
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
                {(['stacked', 'line'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setChartMode(mode)}
                    className={`rounded-full px-3 py-1 capitalize transition ${
                      chartMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-700'
                    }`}
                  >
                    {mode === 'stacked' ? 'Stacked bars' : 'Lines'}
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
                <label className="mb-1 block text-xs text-gray-500">Add users to chart (max 5)</label>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(user => (
                    <span
                      key={user}
                      className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                    >
                      {user}
                      <button
                        type="button"
                        onClick={() => toggleChartUser(user)}
                        className="rounded-full p-1 text-blue-500 hover:text-blue-700"
                        aria-label={`Remove ${user}`}
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
                  {canAddMoreUsers && (
                    <ChartUserAdder availableUsers={availableChartUsers} excludedUsers={selectedUsers} onAdd={toggleChartUser} />
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 h-72 w-full">
              {hasChartData ? (
                <ResponsiveContainer width="100%" height="100%">
                  {chartMode === 'stacked' ? (
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
                      <Tooltip content={<ChartTooltip />} />
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
                        : selectedUsers.flatMap(user =>
                            activeBarCategories.map(([key, info]) => (
                              <Bar
                                key={`${user}-${key}`}
                                dataKey={userCategoryKey(user, key)}
                                name={`${user} – ${info.label}`}
                                stackId={user}
                                fill={info.color}
                                animationDuration={500}
                              />
                            ))
                          )}
                      {visibleCategories.locTotal && (
                        <>
                          <Line
                            type="monotone"
                            dataKey="locTotal"
                            name={categoryConfig.locTotal.label}
                            stroke={categoryConfig.locTotal.color}
                            strokeWidth={2}
                            dot={false}
                            animationDuration={500}
                          />
                          {!showTotalsOnly &&
                            selectedUsers.map(user => (
                              <Line
                                key={`${user}-locTotal`}
                                type="monotone"
                                dataKey={userCategoryKey(user, 'locTotal')}
                                name={`${user} – ${categoryConfig.locTotal.label}`}
                                stroke={categoryConfig.locTotal.color}
                                strokeWidth={1.5}
                                strokeDasharray="4 2"
                                dot={false}
                                animationDuration={500}
                              />
                            ))}
                        </>
                      )}
                    </ComposedChart>
                  ) : (
                    <LineChart data={chartData} margin={{ left: 4, right: 12, top: 20, bottom: 0 }}>
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
                      <Tooltip content={<ChartTooltip />} />
                      {showTotalsOnly
                        ? activeCategories.map(([key, info]) => (
                            <Line
                              key={key}
                              type="monotone"
                              dataKey={key}
                              name={info.label}
                              stroke={info.color}
                              strokeWidth={2}
                              dot={false}
                              animationDuration={500}
                            />
                          ))
                        : selectedUsers.flatMap(user =>
                            activeCategories.map(([key, info]) => (
                              <Line
                                key={`${user}-${key}`}
                                type="monotone"
                                dataKey={userCategoryKey(user, key)}
                                name={`${user} – ${info.label}`}
                                stroke={info.color}
                                strokeWidth={2}
                                dot={false}
                                animationDuration={500}
                              />
                            ))
                          )}
                    </LineChart>
                  )}
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
