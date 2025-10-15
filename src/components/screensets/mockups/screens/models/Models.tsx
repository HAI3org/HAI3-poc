import React, { useMemo, useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  Search as SearchIcon,
  Monitor,
  Cloud,
  Key,
  Crown,
  Copy,
  TrendingUp,
  MoreHorizontal,
  Check,
  PlusCircle,
  Cpu,
  Gauge,
  Link,
  Power,
  X as Close,
} from 'lucide-react';

// Type definitions
interface ModelData {
  name: string;
  vendor: string;
  availability: string[];
  shortlisted: boolean;
  scenarios: string[];
  publishedAt: string;
  cost: string;
  speed: string;
  quality: number;
  score: number;
  format?: string;
  params?: string;
  arch?: string;
  capabilities?: string[];
  tokensPerSec?: number;
  description?: string;
}

interface LoadedModel {
  id: string;
  vendor: string;
  name: string;
  vramGB: number;
  modelCardUrl: string;
  processedTokens: number;
  tokensPerSec: number;
  messages: number;
  lastUsed: string;
  sizeLabel: string;
  colorFrom: string;
  colorTo: string;
}

interface ChartDataPoint {
  t: number;
  v: number;
}

interface AvailabilityIconsProps {
  items?: string[];
}

interface ScenarioPillProps {
  label: string;
  color?: string;
}

interface ChartCardProps {
  title: string;
  data: ChartDataPoint[];
  color: string;
}

interface ModelsProps {
  onBenchmarkModel?: (modelName: string) => void;
}

interface CompareAttr {
  key: string;
  label: string;
  get: (model: ModelData) => string;
}

interface AttrDiffMeta {
  [key: string]: {
    allSame: boolean;
    vals: string[];
  };
}

interface PerfRow {
  key: string;
  label: string;
  get: (model: ModelData) => string | number;
}

const sampleModels: ModelData[] = [
  // From screenshot (approx values for demo)
  { name: 'GPT-4 Turbo', vendor: 'OpenAI', availability: ['desktop','cloud','api'], shortlisted: true, scenarios: ['C','R'], publishedAt: '6 Nov 2023', cost: '$0.030', speed: '85 t/s', quality: 95, score: 92 },
  { name: 'Claude 3 Opus', vendor: 'Anthropic', availability: ['desktop','cloud','api'], shortlisted: true, scenarios: ['C','R'], publishedAt: '1 Mar 2024', cost: '$0.075', speed: '78 t/s', quality: 97, score: 90 },
  { name: 'Llama 3 70B', vendor: 'Meta', availability: ['desktop','cloud'], shortlisted: false, scenarios: ['C','R'], publishedAt: '22 Apr 2024', cost: '$0.100', speed: '62 t/s', quality: 88, score: 83 },
  { name: 'Gemini Pro', vendor: 'Google', availability: ['desktop','cloud','api'], shortlisted: false, scenarios: ['C','V'], publishedAt: '1 Dec 2023', cost: '$0.025', speed: '90 t/s', quality: 89, score: 88 },
  { name: 'Mixtral 8x7B', vendor: 'Mistral AI', availability: ['desktop','cloud'], shortlisted: false, scenarios: ['C','T'], publishedAt: '1 Jan 2024', cost: '$0.300', speed: '75 t/s', quality: 82, score: 79 },
  { name: 'GPT-3.5 Turbo', vendor: 'OpenAI', availability: ['desktop','cloud','api'], shortlisted: false, scenarios: ['C','T'], publishedAt: '1 Mar 2023', cost: '$0.002', speed: '95 t/s', quality: 75, score: 78 },
  { name: 'Claude 3 Haiku', vendor: 'Anthropic', availability: ['desktop','cloud','api'], shortlisted: false, scenarios: ['C','R'], publishedAt: '1 Mar 2024', cost: '$0.003', speed: '92 t/s', quality: 78, score: 82 },
  { name: 'Text Embedding Ada 002', vendor: 'OpenAI', availability: ['desktop','cloud','api'], shortlisted: false, scenarios: ['E'], publishedAt: '24 Dec 2022', cost: '$0.000', speed: '98 t/s', quality: 85, score: 88 },
  { name: 'CodeLlama 34B', vendor: 'Meta', availability: ['desktop'], shortlisted: false, scenarios: ['C','T'], publishedAt: '31 Aug 2023', cost: '$0.000', speed: '58 t/s', quality: 79, score: 72 },
  { name: 'PaLM 2 Bison', vendor: 'Google', availability: ['desktop','cloud','api'], shortlisted: false, scenarios: ['C'], publishedAt: '15 May 2023', cost: '$0.020', speed: '72 t/s', quality: 81, score: 74 },
  { name: 'Claude 2', vendor: 'Anthropic', availability: ['desktop','cloud','api'], shortlisted: false, scenarios: ['C','R'], publishedAt: '12 Jul 2023', cost: '$0.080', speed: '68 t/s', quality: 91, score: 83 },
  { name: 'Vicuna 13B', vendor: 'LMSYS', availability: ['desktop'], shortlisted: false, scenarios: ['C'], publishedAt: '27 Mar 2023', cost: '$0.000', speed: '65 t/s', quality: 72, score: 68 },
  { name: 'Stable Diffusion XL', vendor: 'Stability AI', availability: ['desktop','cloud'], shortlisted: false, scenarios: ['V'], publishedAt: '25 Jul 2023', cost: '$0.000', speed: '45 t/s', quality: 93, score: 76 },
];

function AvailabilityIcons({ items }: AvailabilityIconsProps): JSX.Element {
  return (
    <div className="flex items-center gap-1 text-gray-500">
      {items?.includes('desktop') && <Monitor size={16} />}
      {items?.includes('cloud') && <Cloud size={16} />}
      {items?.includes('api') && <Key size={16} />}
    </div>
  );
}

function ScenarioPill({ label, color = 'bg-blue-600' }: ScenarioPillProps): JSX.Element {
  return (
    <span className={`inline-flex items-center justify-center h-6 min-w-[24px] px-2 text-xs font-semibold text-white rounded ${color}`}>
      {label}
    </span>
  );
}

function ChartCard({ title, data, color }: ChartCardProps): JSX.Element {
  const now = Date.now();
  const chartData = data.map(d => ({
    time: d.t,
    value: Number(d.v?.toFixed ? d.v.toFixed(2) : d.v),
    relMin: (d.t - now) / 60000, // negative minutes to now
  }));
  const gradientId = `grad-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
      <div className="text-xs font-semibold text-gray-700 mb-1">{title}</div>
      <div className="w-full h-36">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 6, right: 14, left: 6, bottom: 0 }}>
            <CartesianGrid vertical stroke="#eef2f7" strokeDasharray="2 4" />
            <XAxis
              dataKey="time"
              type="number"
              domain={[now - 5 * 60 * 1000, now]}
              tickFormatter={(t) => {
                const d = new Date(t);
                return `${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
              }}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
              minTickGap={24}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              width={42}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, borderColor: '#e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value) => [`${Number(value).toFixed(1)}%`, title]}
              labelFormatter={(t) => new Date(t).toLocaleTimeString()}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeOpacity={0.6}
              fillOpacity={0.2}
              fill={color}
              strokeWidth={1}
              isAnimationActive
              animationDuration={700}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Models({ onBenchmarkModel }: ModelsProps): JSX.Element {
  const [filterText, setFilterText] = useState<string>('');
  const [shortlistedOnly, setShortlistedOnly] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]); // model names for compare
  const [view, setView] = useState<'table' | 'compare'>('table'); // table | compare
  const [diffOnly, setDiffOnly] = useState<boolean>(false); // show only differing attributes

  // Demo: currently loaded models for the top status cards
  const [loadedModels, setLoadedModels] = useState<LoadedModel[]>([
    {
      id: 'lm1', vendor: 'OpenAI', name: 'GPT-4 Turbo', vramGB: 24,
      modelCardUrl: 'https://platform.openai.com/docs/models', processedTokens: 154_230,
      tokensPerSec: 85, messages: 412, lastUsed: 'just now', sizeLabel: '24 GB',
      colorFrom: 'from-blue-500', colorTo: 'to-indigo-600'
    },
    {
      id: 'lm2', vendor: 'Anthropic', name: 'Claude 3 Opus', vramGB: 48,
      modelCardUrl: 'https://www.anthropic.com/news/claude-3', processedTokens: 98_410,
      tokensPerSec: 78, messages: 289, lastUsed: '2m ago', sizeLabel: '48 GB',
      colorFrom: 'from-rose-500', colorTo: 'to-pink-600'
    },
    {
      id: 'lm3', vendor: 'Meta', name: 'Llama 3 70B', vramGB: 64,
      modelCardUrl: 'https://ai.meta.com/llama/', processedTokens: 65_772,
      tokensPerSec: 62, messages: 147, lastUsed: '5m ago', sizeLabel: '70B',
      colorFrom: 'from-emerald-500', colorTo: 'to-teal-600'
    },
    {
      id: 'lm4', vendor: 'Mistral', name: 'Mixtral 8x7B', vramGB: 32,
      modelCardUrl: 'https://mistral.ai/news/mixtral-of-experts/', processedTokens: 73_105,
      tokensPerSec: 75, messages: 205, lastUsed: '14m ago', sizeLabel: '8x7B',
      colorFrom: 'from-amber-500', colorTo: 'to-orange-600'
    },
    {
      id: 'lm5', vendor: 'Google', name: 'Gemini Pro', vramGB: 24,
      modelCardUrl: 'https://ai.google.dev/gemini-api/docs/models', processedTokens: 81_992,
      tokensPerSec: 90, messages: 334, lastUsed: '1h ago', sizeLabel: 'Pro',
      colorFrom: 'from-cyan-500', colorTo: 'to-sky-600'
    },
  ]);

  // 5-minute CPU, RAM, GPU and GPU memory series (mocked every 2s, 0-100%)
  const [cpuSeries, setCpuSeries] = useState<ChartDataPoint[]>([]); // {t, v}
  const [ramSeries, setRamSeries] = useState<ChartDataPoint[]>([]);
  const [gpuSeries, setGpuSeries] = useState<ChartDataPoint[]>([]);
  const [gpuMemorySeries, setGpuMemorySeries] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    // random-walk bounded 0..100
    let cpu = 40 + Math.random() * 20;
    let ram = 55 + Math.random() * 15;
    let gpu = 30 + Math.random() * 30;
    let gpuMemory = 65 + Math.random() * 25;
    const step = () => {
      const now = Date.now();
      cpu += (Math.random() - 0.5) * 8; // wiggle
      ram += (Math.random() - 0.5) * 5;
      gpu += (Math.random() - 0.5) * 7;
      gpuMemory += (Math.random() - 0.5) * 6;
      cpu = Math.max(0, Math.min(100, cpu));
      ram = Math.max(0, Math.min(100, ram));
      gpu = Math.max(0, Math.min(100, gpu));
      gpuMemory = Math.max(0, Math.min(100, gpuMemory));
      setCpuSeries(prev => {
        const next = [...prev, { t: now, v: cpu }];
        return next.filter(p => now - p.t <= 5 * 60 * 1000);
      });
      setRamSeries(prev => {
        const next = [...prev, { t: now, v: ram }];
        return next.filter(p => now - p.t <= 5 * 60 * 1000);
      });
      setGpuSeries(prev => {
        const next = [...prev, { t: now, v: gpu }];
        return next.filter(p => now - p.t <= 5 * 60 * 1000);
      });
      setGpuMemorySeries(prev => {
        const next = [...prev, { t: now, v: gpuMemory }];
        return next.filter(p => now - p.t <= 5 * 60 * 1000);
      });
    };
    step();
    timer = setInterval(step, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleUnload = (id: string): void => {
    // In real app, call backend/unloader. For demo remove card.
    setLoadedModels(prev => prev.filter(m => m.id !== id));
  };

  const filteredModels = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    return sampleModels.filter((m) => {
      const matchesQuery =
        q === '' || m.name.toLowerCase().includes(q) || m.vendor.toLowerCase().includes(q);
      const matchesShortlist = !shortlistedOnly || m.shortlisted;
      return matchesQuery && matchesShortlist;
    });
  }, [filterText, shortlistedOnly]);

  const toggleSelected = (name: string): void => {
    setSelected((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  };

  const selectedModels = useMemo(() => {
    return sampleModels.filter((m) => selected.includes(m.name));
  }, [selected]);

  const compareAttrs: CompareAttr[] = [
    { key: 'vendor', label: 'Vendor', get: (m) => m.vendor || '-' },
    { key: 'format', label: 'Format', get: (m) => m.format || '—' },
    { key: 'params', label: 'Parameters', get: (m) => m.params || '—' },
    { key: 'arch', label: 'Architecture', get: (m) => m.arch || '—' },
    { key: 'capabilities', label: 'Capabilities', get: (m) => (m.capabilities?.length ? m.capabilities.join(', ') : (m.scenarios?.join?.(', ') || '—')) },
    { key: 'tps', label: 'Potential tokens/sec', get: (m) => m.tokensPerSec ? String(m.tokensPerSec) : (typeof m.speed === 'string' ? m.speed : '—') },
    { key: 'desc', label: 'Description', get: (m) => m.description || '—' },
  ];

  const attrDiffMeta: AttrDiffMeta = useMemo(() => {
    const meta: AttrDiffMeta = {};
    const toKey = (v: any) => (v === null || v === undefined ? '—' : String(v));
    compareAttrs.forEach((row) => {
      const vals = selectedModels.map((m) => toKey(row.get(m)));
      const first = vals[0];
      const allSame = vals.every((v) => v === first);
      meta[row.key] = { allSame, vals };
    });
    return meta;
  }, [compareAttrs, selectedModels]);

  return (
    <div className="h-full w-full flex flex-col p-4 max-w-full overflow-y-auto">
      {/* System Information */}
      <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <ChartCard title="CPU usage (last 5 min)" data={cpuSeries} color="#60a5fa" />
        <ChartCard title="RAM usage (last 5 min)" data={ramSeries} color="#34d399" />
        <ChartCard title="GPU utilization" data={gpuSeries} color="#a78bfa" />
        <ChartCard title="GPU memory usage" data={gpuMemorySeries} color="#f59e0b" />
      </div>

      {/* Loaded Models: colored status cards */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Loaded models</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {loadedModels.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl p-4 text-white bg-gradient-to-br ${m.colorFrom} ${m.colorTo} shadow-md min-h-[140px]`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase tracking-wide opacity-90">{m.vendor}</div>
                <a
                  href={m.modelCardUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-white/90 hover:text-white text-xs"
                  title="Model card"
                >
                  <Link size={14} /> Card
                </a>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-base font-semibold leading-tight">{m.name}</div>
                <div className="text-[11px] font-semibold bg-white/15 rounded px-2 py-0.5">{m.sizeLabel}</div>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                <div className="flex items-center gap-1 bg-white/10 rounded px-2 py-1">
                  <span className="font-semibold">{m.messages.toLocaleString()}</span>
                  <span className="opacity-90 truncate">messages</span>
                </div>
                <div className="flex items-center gap-1 bg-white/10 rounded px-2 py-1">
                  <span className="font-semibold">{m.processedTokens.toLocaleString()}</span>
                  <span className="opacity-90 truncate">tokens</span>
                </div>
                <div className="flex items-center gap-1 bg-white/10 rounded px-2 py-1">
                  <Gauge size={14} className="shrink-0" />
                  <span className="truncate">{m.tokensPerSec} tok/s</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <div className="opacity-90">Last used: <span className="font-medium">{m.lastUsed}</span></div>
                <button
                  className="inline-flex items-center gap-1 text-white/90 hover:text-white text-xs border border-white/30 hover:border-white rounded px-2 py-1"
                  title="Unload model"
                  onClick={() => handleUnload(m.id)}
                >
                  <Power size={14} /> Unload
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
      {/* Available models */}
      <div className="mt-2 mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Available models</h3>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-[400px]">
          <SearchIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Filter by name, vendor, service..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button className="px-2 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50" title="List">
            <Copy size={16} />
          </button>
          <button className="px-2 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50" title="Grid">
            <Monitor size={16} />
          </button>
        </div>
        <div className="flex items-center gap-1 ml-2 lg:ml-4">
          <button
            onClick={() => setShortlistedOnly((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
              shortlistedOnly
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Crown size={16} className={shortlistedOnly ? 'text-white' : 'text-gray-600'} />
            <span className="hidden sm:inline">Shortlisted</span>
          </button>
          <button
            onClick={() => setShortlistedOnly(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm border-gray-200 bg-white text-gray-700 hover:bg-gray-50`}
          >
            <Check size={16} className="text-gray-600" />
            <span className="hidden sm:inline">All</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm">
            <PlusCircle size={16} className="text-gray-600" />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>
        <div className="w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0">
          <button
            onClick={() => selected.length >= 2 ? setView('compare') : null}
            disabled={selected.length < 2}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm border ${selected.length < 2 ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed' : 'text-white bg-blue-600 hover:bg-blue-700 border-blue-600'}`}
            title={selected.length < 2 ? 'Select at least 2 models to compare' : 'Compare selected'}
          >
            <TrendingUp size={16} /> Compare{selected.length > 0 ? ` (${selected.length})` : ''}
          </button>
        </div>
      </div>

      {view === 'table' && (
        <div className="flex-1 overflow-visible">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500">
                <th>Name</th>
                <th>Vendor</th>
                <th>Availability</th>
                <th>Shortlisted</th>
                <th>Scenarios</th>
                <th>Published At</th>
                <th>Cost</th>
                <th>Speed</th>
                <th>Quality</th>
                <th>Score</th>
                <th>Compare</th>
                <th>Benchmark</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredModels.map((m, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td>{m.name}</td>
                  <td>{m.vendor}</td>
                  <td><AvailabilityIcons items={m.availability} /></td>
                  <td>{m.shortlisted ? <Crown size={16} className="text-gray-500" /> : '-'}</td>
                  <td>
                    <div className="flex gap-1">
                      {m.scenarios.map((s, i) => (
                        <ScenarioPill key={i} label={s} />
                      ))}
                    </div>
                  </td>
                  <td>{m.publishedAt}</td>
                  <td>{m.cost}</td>
                  <td>{m.speed}</td>
                  <td>{m.quality}</td>
                  <td>{m.score}</td>
                  <td>
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={selected.includes(m.name)}
                      onChange={() => toggleSelected(m.name)}
                    />
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-gray-700">
                    <button
                      className="inline-flex items-center justify-center p-1 rounded hover:bg-gray-100"
                      title="Benchmark this model"
                      onClick={() => onBenchmarkModel && onBenchmarkModel(m.name)}
                    >
                      <TrendingUp size={16} className="text-gray-600" />
                    </button>
                  </td>
                  <td className="px-2 py-3 border-b border-gray-100 text-right"><button className="p-1 hover:bg-gray-100 rounded"><MoreHorizontal size={16} className="text-gray-500" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {view === 'compare' && (
        <div className="flex-1 overflow-hidden">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-800">Compare models ({selectedModels.length})</div>
            <div className="flex items-center gap-2">
              {selectedModels.length >= 2 && (
                <button
                  onClick={() => setDiffOnly((v) => !v)}
                  className={`inline-flex items-center gap-2 px-2 py-1 rounded border text-sm ${diffOnly ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  title="Toggle to show only differing attributes"
                >
                  Show differences only
                </button>
              )}
              <button onClick={() => setView('table')} className="inline-flex items-center gap-2 px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm">
                <Close size={14} /> Close
              </button>
            </div>
          </div>
          {/* Attribute comparison grid: sticky first column, horizontal scroll for models */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-auto max-w-full">
            <div className="min-w-[720px]">
              <div className="grid" style={{ gridTemplateColumns: `240px repeat(${selectedModels.length}, minmax(220px, 1fr))` }}>
                {/* Header row */}
                <div className="sticky left-0 z-10 bg-gray-50 px-3 py-2 border-b border-gray-200 text-xs uppercase text-gray-500">Attribute</div>
                {selectedModels.map((m) => (
                  <div key={m.name} className="px-3 py-2 border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">{m.name}</div>
                ))}

                {/* Rows */}
                {compareAttrs
                  .filter((row) => !(diffOnly && attrDiffMeta[row.key]?.allSame))
                  .map((row) => {
                    const meta = attrDiffMeta[row.key] || { allSame: false };
                    const labelBadge = (
                      <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${meta.allSame ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>
                        {meta.allSame ? 'Common' : 'Different'}
                      </span>
                    );
                    return (
                      <React.Fragment key={row.key}>
                        <div className="sticky left-0 z-10 bg-white px-3 py-3 border-b border-gray-100 text-sm font-medium text-gray-900">
                          {row.label}
                          {labelBadge}
                        </div>
                        {selectedModels.map((m) => (
                          <div
                            key={m.name + row.key}
                            className={`px-3 py-3 border-b border-gray-100 text-sm ${meta.allSame ? 'text-gray-700' : 'bg-amber-50 text-gray-900'}`}
                          >
                            {row.get(m)}
                          </div>
                        ))}
                      </React.Fragment>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Performance comparison (e-commerce style list of comparable metrics) */}
          <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-auto max-w-full">
            <div className="px-3 py-2 border-b border-gray-200 text-xs uppercase text-gray-500">Performance</div>
            <div className="min-w-[720px]">
              <div className="grid" style={{ gridTemplateColumns: `240px repeat(${selectedModels.length}, minmax(220px, 1fr))` }}>
                {(() => {
                  const toKey = (v: any) => (v === null || v === undefined ? '—' : String(v));
                  const perfRows: PerfRow[] = [
                    { key: 'speed', label: 'Speed (tokens/sec)', get: (m) => m.tokensPerSec || (typeof m.speed === 'string' ? m.speed : '—') },
                    { key: 'quality', label: 'Quality', get: (m) => m.quality ?? '—' },
                    { key: 'score', label: 'Score', get: (m) => m.score ?? '—' },
                  ];
                  return perfRows
                    .filter((row) => {
                      const vals = selectedModels.map((m) => toKey(row.get(m)));
                      const allSame = vals.length > 0 && vals.every((v) => v === vals[0]);
                      return !(diffOnly && allSame);
                    })
                    .map((row) => {
                      const vals = selectedModels.map((m) => toKey(row.get(m)));
                      const allSame = vals.length > 0 && vals.every((v) => v === vals[0]);
                      const badgeClass = allSame ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700';
                      return (
                        <React.Fragment key={row.key}>
                          <div className="sticky left-0 z-10 bg-white px-3 py-3 border-b border-gray-100 text-sm font-medium text-gray-900">
                            {row.label}
                            <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeClass}`}>
                              {allSame ? 'Common' : 'Different'}
                            </span>
                          </div>
                          {selectedModels.map((m, i) => (
                            <div key={m.name + '-' + row.key}
                              className={`px-3 py-3 border-b border-gray-100 text-sm ${allSame ? 'text-gray-700' : 'bg-amber-50 text-gray-900'}`}
                            >
                              {vals[i]}
                            </div>
                          ))}
                        </React.Fragment>
                      );
                    });
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Models;
