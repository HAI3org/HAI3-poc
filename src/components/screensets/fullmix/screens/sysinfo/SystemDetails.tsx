import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  Cpu,
  HardDrive,
  Zap,
  Server,
  Database,
  Activity,
  TrendingUp,
  HardDrive as Storage,
  Monitor,
  Layers,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  ChevronDown,
  BarChart3,
  MessageSquare,
} from 'lucide-react';

// TypeScript interfaces
interface ChartDataPoint {
  t: number;
  v: number;
}

interface ChartCardProps {
  title: string;
  data: ChartDataPoint[];
  color: string;
  height?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  trend?: number;
  status?: 'good' | 'warning' | 'error' | 'info';
}

interface ProgressCardProps {
  title: string;
  current: number;
  total: number;
  unit?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  subtitle?: string;
}

interface MultiColorProgressCardProps {
  title: string;
  files: number;
  models: number;
  index: number;
  total: number;
  unit?: string;
  subtitle?: string;
}

interface HardwareMetrics {
  cpu: {
    cores: {
      physical: number;
      logical: number;
    };
    utilization: number;
    memoryBandwidth: string;
    temperature: number;
    power: number;
  };
  gpu: {
    name: string;
    vram: {
      total: number;
      free: number;
      used: number;
    };
    utilization: {
      compute: number;
      memory: number;
      tensor: number;
    };
    temperature: number;
    power: number;
  };
  ram: {
    total: number;
    used: number;
    swap: {
      total: number;
      used: number;
    };
    pageFaults: number;
  };
  storage: {
    total: number;
    free: number;
    readThroughput: number;
    writeThroughput: number;
    iops: number;
  };
}

interface AIServer {
  name: string;
  version: string;
  status: 'running' | 'stopped';
  gpu: number;
  cpu: number;
  ram: number;
  downloadedModels: number;
  downloadedSize: number;
  loadedModels: number;
  loadedSize: number;
}

interface ProcessInfo {
  name: string;
  ram: number;
  vram: number;
  cpu: number;
}

interface SoftwareMetrics {
  aiServers: AIServer[];
  processes: ProcessInfo[];
  concurrency: {
    activeSessions: number;
    activeChats: number;
    pipelines: number;
  };
  tokenThroughput: number;
  indexing: {
    indexSize: number;
    vectorDbSize: number;
    docsCount: number;
    embeddingsCount: number;
    searchLatency: {
      p50: number;
      p90: number;
    };
  };
}

interface ModelInfo {
  name: string;
  path: string;
  size: number;
  lastUsed: string;
}

interface FormatInfo {
  format: string;
  count: number;
  totalSize: number;
}

interface QuantizationInfo {
  level: string;
  count: number;
  totalSize: number;
}

interface ModelInventory {
  totalModels: number;
  totalSize: number;
  largestModels: ModelInfo[];
  formats: FormatInfo[];
  quantization: QuantizationInfo[];
}

function ChartCard({ title, data, color, height = "h-36" }: ChartCardProps) {
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
      <div className={`w-full ${height}`}>
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
              fill={`url(#${gradientId})`}
              strokeWidth={2}
            />
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0.05}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon, color = "blue", trend, status }: MetricCardProps) {
  const colorClasses: Record<string, string> = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    red: "text-red-600 bg-red-50",
    yellow: "text-yellow-600 bg-yellow-50",
    purple: "text-purple-600 bg-purple-50",
    gray: "text-gray-600 bg-gray-50"
  };

  const statusIcons: Record<string, React.ReactNode> = {
    good: <CheckCircle size={16} className="text-green-500" />,
    warning: <AlertTriangle size={16} className="text-yellow-500" />,
    error: <XCircle size={16} className="text-red-500" />,
    info: <Info size={16} className="text-blue-500" />
  };

  return (
    <div className="hx-card">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon width={20} height={20} />
        </div>
        {status && statusIcons[status]}
      </div>
      <div className="mb-1">
        <h1>{value}</h1>
        <p>{title}</p>
      </div>
      {subtitle && (
        <div className="text-xs text-gray-500 flex items-center gap-1">
          {subtitle}
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp size={12} />
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProgressCard({ title, current, total, unit = "GB", color = "blue", subtitle }: ProgressCardProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  const colorClasses: Record<string, string> = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500"
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold text-gray-700">{title}</div>
        <div className="text-sm text-gray-600">{current}/{total} {unit}</div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      {subtitle && (
        <div className="text-xs text-gray-500">{subtitle}</div>
      )}
    </div>
  );
}

function MultiColorProgressCard({ title, files, models, index, total, unit = "GB", subtitle }: MultiColorProgressCardProps) {
  const filesPercentage = total > 0 ? (files / total) * 100 : 0;
  const modelsPercentage = total > 0 ? (models / total) * 100 : 0;
  const indexPercentage = total > 0 ? (index / total) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold text-gray-700">{title}</div>
        <div className="text-sm text-gray-600">{files + models + index}/{total} {unit}</div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2 flex">
        <div
          className="h-2 bg-blue-500 rounded-l-full"
          style={{ width: `${filesPercentage}%` }}
        ></div>
        <div
          className="h-2 bg-red-500"
          style={{ width: `${modelsPercentage}%` }}
        ></div>
        <div
          className="h-2 bg-yellow-500 rounded-r-full"
          style={{ width: `${indexPercentage}%` }}
        ></div>
      </div>
      {subtitle && (
        <div className="text-xs text-gray-500">{subtitle}</div>
      )}
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Files: {files} {unit}</span>
        <span>Models: {models} {unit}</span>
        <span>Index: {index} {unit}</span>
      </div>
    </div>
  );
}

function SystemDetails() {
  // System metrics state
  const [cpuSeries, setCpuSeries] = useState<ChartDataPoint[]>([]);
  const [ramSeries, setRamSeries] = useState<ChartDataPoint[]>([]);
  const [gpuSeries, setGpuSeries] = useState<ChartDataPoint[]>([]);
  const [gpuMemorySeries, setGpuMemorySeries] = useState<ChartDataPoint[]>([]);

  // Collapsible sections state
  const [topMetricsCollapsed, setTopMetricsCollapsed] = useState<boolean>(false);
  const [hardwareUtilizationCollapsed, setHardwareUtilizationCollapsed] = useState<boolean>(false);
  const [hardwareCollapsed, setHardwareCollapsed] = useState<boolean>(false);
  const [softwareCollapsed, setSoftwareCollapsed] = useState<boolean>(false);
  const [inventoryCollapsed, setInventoryCollapsed] = useState<boolean>(false);

  // Mock hardware data
  const [hardwareMetrics, setHardwareMetrics] = useState<HardwareMetrics>({
    cpu: {
      cores: { physical: 8, logical: 16 },
      utilization: 45,
      memoryBandwidth: "25.6 GB/s",
      temperature: 65,
      power: 85
    },
    gpu: {
      name: "NVIDIA RTX 4090",
      vram: { total: 24, free: 8.2, used: 15.8 },
      utilization: { compute: 78, memory: 65, tensor: 45 },
      temperature: 72,
      power: 320
    },
    ram: {
      total: 32,
      used: 18.4,
      swap: { total: 8, used: 0.2 },
      pageFaults: 1247
    },
    storage: {
      total: 1000,
      free: 234,
      readThroughput: 3500,
      writeThroughput: 2800,
      iops: 85000
    }
  });

  // Mock software runtime data
  const [softwareMetrics, setSoftwareMetrics] = useState<SoftwareMetrics>({
    aiServers: [
      {
        name: "Ollama",
        version: "0.1.29",
        status: "running",
        gpu: 78,
        cpu: 45,
        ram: 12.3,
        downloadedModels: 8,
        downloadedSize: 45.2,
        loadedModels: 2,
        loadedSize: 12.8
      },
      {
        name: "LM Studio",
        version: "0.2.20",
        status: "running",
        gpu: 65,
        cpu: 23,
        ram: 8.7,
        downloadedModels: 12,
        downloadedSize: 78.4,
        loadedModels: 1,
        loadedSize: 8.5
      },
      {
        name: "vLLM",
        version: "0.3.1",
        status: "stopped",
        gpu: 0,
        cpu: 0,
        ram: 0,
        downloadedModels: 4,
        downloadedSize: 22.1,
        loadedModels: 0,
        loadedSize: 0
      }
    ],
    processes: [
      { name: "ollama", ram: 8.2, vram: 12.1, cpu: 45 },
      { name: "lmstudio", ram: 6.8, vram: 8.5, cpu: 23 },
      { name: "python", ram: 2.1, vram: 0, cpu: 12 }
    ],
    concurrency: {
      activeSessions: 3,
      activeChats: 5,
      pipelines: 2
    },
    tokenThroughput: 1250,
    indexing: {
      indexSize: 2.4,
      vectorDbSize: 1.8,
      docsCount: 15420,
      embeddingsCount: 89200,
      searchLatency: { p50: 45, p90: 120 }
    }
  });

  // Mock model inventory data
  const [modelInventory, setModelInventory] = useState<ModelInventory>({
    totalModels: 24,
    totalSize: 156.8,
    largestModels: [
      { name: "Llama-3-70B-instruct.q4", path: "/models/llama3-70b", size: 44.2, lastUsed: "2 hours ago" },
      { name: "Claude-3-Opus", path: "/models/claude3-opus", size: 38.7, lastUsed: "1 day ago" },
      { name: "GPT-4-Turbo", path: "/models/gpt4-turbo", size: 32.1, lastUsed: "3 hours ago" }
    ],
    formats: [
      { format: "GGUF", count: 12, totalSize: 89.4 },
      { format: "Safetensors", count: 8, totalSize: 45.2 },
      { format: "ONNX", count: 4, totalSize: 22.2 }
    ],
    quantization: [
      { level: "fp16", count: 6, totalSize: 78.3 },
      { level: "q4", count: 10, totalSize: 45.6 },
      { level: "int8", count: 8, totalSize: 32.9 }
    ]
  });

  // Generate mock time series data
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let cpu = 45 + Math.random() * 10;
    let ram = 58 + Math.random() * 8;
    let gpu = 78 + Math.random() * 12;
    let gpuMemory = 65 + Math.random() * 15;

    const step = () => {
      const now = Date.now();
      cpu += (Math.random() - 0.5) * 6;
      ram += (Math.random() - 0.5) * 4;
      gpu += (Math.random() - 0.5) * 8;
      gpuMemory += (Math.random() - 0.5) * 5;

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

  return (
    <div className="h-full w-full flex flex-col p-4 overflow-y-auto">


      {/* Top 4 Key Metrics Cards */}
      <div className="mb-6">
        <button
          onClick={() => setTopMetricsCollapsed(!topMetricsCollapsed)}
          className="w-full flex items-center text-left mb-4"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 size={20} className="hx-color-1" />
            Key System Metrics
            <ChevronDown
              size={20}
              className={`text-gray-500 transition-transform ${topMetricsCollapsed ? 'rotate-180' : ''}`}
            />
          </h2>
        </button>

        {!topMetricsCollapsed && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Chat Requests"
              value={softwareMetrics.concurrency.activeSessions}
              subtitle="Messages count"
              icon={MessageSquare}
              color="blue"
            />
            <MetricCard
              title="Token Throughput"
              value={`${softwareMetrics.tokenThroughput} t/s`}
              subtitle={`Search latency: ${softwareMetrics.indexing.searchLatency.p90}ms`}
              icon={TrendingUp}
              color="green"
            />
            <MetricCard
              title="Vector DB Size"
              value={`${softwareMetrics.indexing.vectorDbSize} GB`}
              subtitle={`${softwareMetrics.indexing.docsCount.toLocaleString()} docs`}
              icon={Database}
              color="purple"
            />
            <MetricCard
              title="Total Models Size"
              value={`${modelInventory.totalSize} GB`}
              subtitle={`${modelInventory.totalModels} models`}
              icon={Package}
              color="yellow"
            />
          </div>
        )}
      </div>

      {/* Hardware Utilization Section */}
      <div className="mb-6">
        <button
          onClick={() => setHardwareUtilizationCollapsed(!hardwareUtilizationCollapsed)}
          className="w-full flex items-center text-left mb-4"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Activity size={20} className="text-blue-600" />
            Hardware Utilization
            <ChevronDown
              size={20}
              className={`text-gray-500 transition-transform ${hardwareUtilizationCollapsed ? 'rotate-180' : ''}`}
            />
          </h2>
        </button>

        {!hardwareUtilizationCollapsed && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            <ChartCard title="CPU usage (last 5 min)" data={cpuSeries} color="#60a5fa" />
            <ChartCard title="RAM usage (last 5 min)" data={ramSeries} color="#34d399" />
            <ChartCard title="GPU utilization" data={gpuSeries} color="#a78bfa" />
            <ChartCard title="GPU memory usage" data={gpuMemorySeries} color="#f59e0b" />
          </div>
        )}
      </div>

      {/* Hardware Metrics Section */}
      <div className="mb-6">
        <button
          onClick={() => setHardwareCollapsed(!hardwareCollapsed)}
          className="w-full flex items-center text-left mb-4"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Server size={20} className="text-blue-600" />
            Hardware Metrics
            <ChevronDown
              size={20}
              className={`text-gray-500 transition-transform ${hardwareCollapsed ? 'rotate-180' : ''}`}
            />
          </h2>
        </button>

        {!hardwareCollapsed && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* CPU Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg text-blue-600 bg-blue-50">
                <Cpu size={20} />
              </div>
              <div className="text-sm text-gray-500">{hardwareMetrics.cpu.utilization}%</div>
            </div>
            <div className="mb-3">
              <div className="text-lg font-semibold text-gray-900">CPU</div>
              <div className="text-sm text-gray-600">
                {hardwareMetrics.cpu.cores.physical} physical / {hardwareMetrics.cpu.cores.logical} logical cores
              </div>
            </div>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Memory Bandwidth:</span>
                <span>{hardwareMetrics.cpu.memoryBandwidth}</span>
              </div>
              <div className="flex justify-between">
                <span>Temperature:</span>
                <span>{hardwareMetrics.cpu.temperature}°C</span>
              </div>
              <div className="flex justify-between">
                <span>Power:</span>
                <span>{hardwareMetrics.cpu.power}W</span>
              </div>
            </div>
          </div>

          {/* GPU Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg text-purple-600 bg-purple-50">
                <Monitor size={20} />
              </div>
              <div className="text-sm text-gray-500">{hardwareMetrics.gpu.utilization.compute}%</div>
            </div>
            <div className="mb-3">
              <div className="text-lg font-semibold text-gray-900">{hardwareMetrics.gpu.name}</div>
              <div className="text-sm text-gray-600">VRAM: {hardwareMetrics.gpu.vram.used}/{hardwareMetrics.gpu.vram.total} GB</div>
            </div>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Memory Util:</span>
                <span>{hardwareMetrics.gpu.utilization.memory}%</span>
              </div>
              <div className="flex justify-between">
                <span>Tensor Cores:</span>
                <span>{hardwareMetrics.gpu.utilization.tensor}%</span>
              </div>
              <div className="flex justify-between">
                <span>Temperature:</span>
                <span>{hardwareMetrics.gpu.temperature}°C</span>
              </div>
              <div className="flex justify-between">
                <span>Power:</span>
                <span>{hardwareMetrics.gpu.power}W</span>
              </div>
            </div>
          </div>

          {/* RAM Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg text-green-600 bg-green-50">
                <HardDrive size={20} />
              </div>
              <div className="text-sm text-gray-500">{Math.round((hardwareMetrics.ram.used / hardwareMetrics.ram.total) * 100)}%</div>
            </div>
            <div className="mb-3">
              <div className="text-lg font-semibold text-gray-900">System RAM</div>
              <div className="text-sm text-gray-600">{hardwareMetrics.ram.used}/{hardwareMetrics.ram.total} GB used</div>
            </div>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Swap:</span>
                <span>{hardwareMetrics.ram.swap.used}/{hardwareMetrics.ram.swap.total} GB</span>
              </div>
              <div className="flex justify-between">
                <span>Page Faults:</span>
                <span>{hardwareMetrics.ram.pageFaults.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Storage Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg text-yellow-600 bg-yellow-50">
                <Storage size={20} />
              </div>
              <div className="text-sm text-gray-500">{Math.round(((hardwareMetrics.storage.total - hardwareMetrics.storage.free) / hardwareMetrics.storage.total) * 100)}%</div>
            </div>
            <div className="mb-3">
              <div className="text-lg font-semibold text-gray-900">Storage</div>
              <div className="text-sm text-gray-600">{hardwareMetrics.storage.total - hardwareMetrics.storage.free}/{hardwareMetrics.storage.total} GB used</div>
            </div>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Read:</span>
                <span>{hardwareMetrics.storage.readThroughput} MB/s</span>
              </div>
              <div className="flex justify-between">
                <span>Write:</span>
                <span>{hardwareMetrics.storage.writeThroughput} MB/s</span>
              </div>
              <div className="flex justify-between">
                <span>IOPS:</span>
                <span>{hardwareMetrics.storage.iops.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Discovered Local AI Services */}
      <div className="mb-6">
        <button
          onClick={() => setSoftwareCollapsed(!softwareCollapsed)}
          className="w-full flex items-center text-left mb-4"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Zap size={20} className="text-green-600" />
            Discovered Local AI Services
            <ChevronDown
              size={20}
              className={`text-gray-500 transition-transform ${softwareCollapsed ? 'rotate-180' : ''}`}
            />
          </h2>
        </button>

        {!softwareCollapsed && (
          <>
            {/* AI Service Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {softwareMetrics.aiServers.map((server, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${server.status === 'running' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <div>
                        <div className="font-semibold text-gray-900">{server.name}</div>
                        <div className="text-sm text-gray-500">v{server.version}</div>
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${server.status === 'running' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {server.status}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="font-semibold text-blue-700">{server.gpu}%</div>
                        <div className="text-blue-600">GPU</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="font-semibold text-green-700">{server.cpu}%</div>
                        <div className="text-green-600">CPU</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="font-semibold text-purple-700">{server.ram} GB</div>
                        <div className="text-purple-600">RAM</div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Downloaded Models:</span>
                        <span>{server.downloadedModels} ({server.downloadedSize} GB)</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Loaded Models:</span>
                        <span>{server.loadedModels} ({server.loadedSize} GB)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Model Inventory Metrics Section */}
      <div className="mb-6">
        <button
          onClick={() => setInventoryCollapsed(!inventoryCollapsed)}
          className="w-full flex items-center text-left mb-4"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package size={20} className="text-purple-600" />
            Model Inventory Metrics
            <ChevronDown
              size={20}
              className={`text-gray-500 transition-transform ${inventoryCollapsed ? 'rotate-180' : ''}`}
            />
          </h2>
        </button>

        {!inventoryCollapsed && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Model Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Model Summary</h3>
              <div className="space-y-4">
                <MetricCard
                  title="Total Models"
                  value={modelInventory.totalModels}
                  subtitle="Installed models"
                  icon={Layers}
                  color="blue"
                />
                <MultiColorProgressCard
                  title="Disk Space Used"
                  files={45.2}
                  models={modelInventory.totalSize}
                  index={softwareMetrics.indexing.indexSize}
                  total={200}
                  unit="GB"
                  subtitle="Storage breakdown"
                />
              </div>
            </div>

          {/* Largest Models */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Largest Models</h3>
            <div className="space-y-3">
              {modelInventory.largestModels.map((model, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-gray-900 truncate">{model.name}</div>
                    <div className="text-sm font-semibold text-gray-700">{model.size} GB</div>
                  </div>
                  <div className="text-xs text-gray-500 truncate">{model.path}</div>
                  <div className="text-xs text-gray-400 mt-1">Last used: {model.lastUsed}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Formats & Quantization */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Formats & Quantization</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Formats</h4>
                <div className="space-y-2">
                  {modelInventory.formats.map((format, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{format.format}</span>
                      <span className="text-gray-900">{format.count} ({format.totalSize} GB)</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Quantization</h4>
                <div className="space-y-2">
                  {modelInventory.quantization.map((quant, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{quant.level}</span>
                      <span className="text-gray-900">{quant.count} ({quant.totalSize} GB)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export default SystemDetails;
