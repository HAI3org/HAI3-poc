export type CommitRecord = {
  user: string;
  department: string;
  org: string;
  date: string; // YYYY-MM-DD
  locBugfixes: number;
  locFeatures: number;
  locThirdParty: number;
  locTech: number;
  locUnknown: number;
  qualityScore: number;
};

const users: Array<{ user: string; department: string; org: string; seed: number }> = [
  { user: 'john.doe', department: 'Platform', org: 'acme', seed: 101 },
  { user: 'jane.smith', department: 'Payments', org: 'acme', seed: 131 },
  { user: 'mike.wilson', department: 'Core', org: 'globex', seed: 151 },
  { user: 'emily.chen', department: 'Analytics', org: 'acme', seed: 181 },
  { user: 'alex.ivanov', department: 'Mobile', org: 'globex', seed: 191 },
  { user: 'sofia.garcia', department: 'Web', org: 'initech', seed: 211 }
];

// Generate 8 weeks of weekdays (Mon-Fri) starting from a fixed Monday (2025-07-07) to avoid gaps
const START_ISO = '2025-07-07'; // Monday
const WEEKS = 8;

function toISO(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function* weekdayDates(startISO: string, weeks: number): Generator<{ iso: string; dayIndex: number }> {
  const start = new Date(`${startISO}T00:00:00Z`);
  // Ensure Monday
  const day = start.getUTCDay();
  const diff = (day + 6) % 7; // 0 if Mon
  start.setUTCDate(start.getUTCDate() - diff);
  let idx = 0;
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 5; d++) {
      const cur = new Date(start);
      cur.setUTCDate(start.getUTCDate() + w * 7 + d);
      yield { iso: toISO(cur), dayIndex: idx++ };
    }
  }
}

// Simple deterministic pseudo-random based on seed and index
function prand(seed: number, i: number, min: number, max: number): number {
  // LCG params
  const a = 1664525;
  const c = 1013904223;
  let x = (seed + i * 9973) >>> 0;
  x = (a * x + c) >>> 0;
  const r = x / 0xffffffff;
  const val = Math.round(min + r * (max - min));
  return val;
}

export const rawData: CommitRecord[] = (() => {
  const rows: CommitRecord[] = [];
  for (const { iso, dayIndex } of weekdayDates(START_ISO, WEEKS)) {
    for (const u of users) {
      const features = prand(u.seed, dayIndex, 300, 560);
      const bugfixes = prand(u.seed + 1, dayIndex, 70, 160);
      const tech = prand(u.seed + 2, dayIndex, 40, 90);
      const third = prand(u.seed + 3, dayIndex, 30, 80);
      const unknown = prand(u.seed + 4, dayIndex, 6, 18);
      const quality = prand(u.seed + 5, dayIndex, 72, 95);
      rows.push({
        user: u.user,
        department: u.department,
        org: u.org,
        date: iso,
        locBugfixes: bugfixes,
        locFeatures: features,
        locTech: tech,
        locThirdParty: third,
        locUnknown: unknown,
        qualityScore: quality
      });
    }
  }
  return rows;
})();

