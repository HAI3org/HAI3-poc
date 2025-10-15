import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Cloud, Factory, Cpu, HardDrive, Gauge, DollarSign, Globe, Timer, Activity, BarChart2, RefreshCw, Search, CheckSquare, Square } from 'lucide-react';

// Interfaces
interface Vendor {
  id: string;
  name: string;
  regions: number;
  gpus: string[];
  url: string;
}

interface HardwareOffer {
  vendor: string;
  location: string;
  cpu: number;
  gpu: string;
  vram: number;
  disk: number;
  priceHr: number;
  b1p1: number;
  b16p1: number;
  b64p4: number;
  model: string;
  minCommit: string;
}

interface ModelSizes {
  [key: string]: number;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm mb-6 ${className}`}>
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  </div>
);

export default function HardwareWizard() {
  const [activeTab, setActiveTab] = useState<'vendors' | 'gpu-selection' | 'model-selection' | 'comparison'>('vendors');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [scenario, setScenario] = useState<string>('chat');
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(['chat']);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedGpuTypes, setSelectedGpuTypes] = useState<string[]>([]);
  const [eligibleGpus, setEligibleGpus] = useState<string[]>(['A6000', 'A100', 'H100', 'V100', 'RTX 4090']); // GPUs in the eligible shortlist
  const [minVram, setMinVram] = useState<string>('');
  const [budgetCap, setBudgetCap] = useState<string>('');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [eligibleModels, setEligibleModels] = useState<string[]>(['Llama 3.1 8B', 'Llama 3.1 70B', 'Mixtral 8x7B']); // Models in the eligible shortlist
  const [modelQuery, setModelQuery] = useState<string>('');
  const [showModelSearch, setShowModelSearch] = useState<boolean>(false);
  const [minPflops, setMinPflops] = useState<string>('');
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [gpuQuery, setGpuQuery] = useState<string>('');
  const [showGpuSearch, setShowGpuSearch] = useState<boolean>(false);
  const searchFormRef = useRef<HTMLDivElement>(null);
  const gpuSearchRef = useRef<HTMLDivElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);
  const gpuInputRef = useRef<HTMLInputElement>(null);

  // Handle ESC key and click outside to close search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showModelSearch) {
          setShowModelSearch(false);
          setModelQuery('');
        }
        if (showGpuSearch) {
          setShowGpuSearch(false);
          setGpuQuery('');
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      // Only close if clicking outside the search container and not on form elements
      if (searchFormRef.current && !searchFormRef.current.contains(e.target as Node) && showModelSearch && (e.target as Element).tagName !== 'INPUT') {
        setShowModelSearch(false);
      }
      if (gpuSearchRef.current && !gpuSearchRef.current.contains(e.target as Node) && showGpuSearch && (e.target as Element).tagName !== 'INPUT') {
        setShowGpuSearch(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModelSearch, showGpuSearch]);

  // Keep focus on model search input while typing; prevent page scroll when (re)focusing
  useEffect(() => {
    if (showModelSearch && modelInputRef.current && document.activeElement !== modelInputRef.current) {
      try { modelInputRef.current.focus({ preventScroll: true }); } catch (_) { modelInputRef.current.focus(); }
    }
  }, [modelQuery, showModelSearch]);

  // Keep focus on GPU search input while typing; prevent page scroll when (re)focusing
  useEffect(() => {
    if (showGpuSearch && gpuInputRef.current && document.activeElement !== gpuInputRef.current) {
      try { gpuInputRef.current.focus({ preventScroll: true }); } catch (_) { gpuInputRef.current.focus(); }
    }
  }, [gpuQuery, showGpuSearch]);

  // Mock vendor list (extendable)
  const vendors: Vendor[] = useMemo(() => ([
    { id: 'aws', name: 'AWS', regions: 26, gpus: ['A10G', 'A100', 'H100'], url: 'https://aws.amazon.com/ec2/instance-types/' },
    { id: 'gcp', name: 'Google Cloud', regions: 35, gpus: ['L4', 'A100', 'H100'], url: 'https://cloud.google.com/compute/docs/gpus' },
    { id: 'azure', name: 'Azure', regions: 60, gpus: ['A10', 'A100', 'H100'], url: 'https://learn.microsoft.com/azure/virtual-machines/sizes-gpu' },
    { id: 'runpod', name: 'RunPod', regions: 14, gpus: ['A4000', 'A6000', 'A100', 'H100'], url: 'https://www.runpod.io' },
    { id: 'lambda', name: 'Lambda', regions: 7, gpus: ['A6000', 'A100', 'H100'], url: 'https://lambdalabs.com' }
  ]), []);

  // Mock detailed offers (>=15 rows)
  const offers: HardwareOffer[] = useMemo(() => ([
    { vendor: 'AWS', location: 'us-east-1', cpu: 64, gpu: 'A100', vram: 80, disk: 2000, priceHr: 32.4, b1p1: 210, b16p1: 1450, b64p4: 5200, model: 'Llama 3.1 70B', minCommit: 'None' },
    { vendor: 'AWS', location: 'us-west-2', cpu: 64, gpu: 'A10G', vram: 24, disk: 1000, priceHr: 5.8, b1p1: 80, b16p1: 620, b64p4: 1800, model: 'Llama 3.1 8B', minCommit: 'None' },
    { vendor: 'AWS', location: 'eu-central-1', cpu: 96, gpu: 'H100', vram: 80, disk: 2000, priceHr: 39.9, b1p1: 250, b16p1: 1800, b64p4: 6400, model: 'Mixtral 8x7B', minCommit: '1 mo' },
    { vendor: 'Google Cloud', location: 'us-central1', cpu: 32, gpu: 'L4', vram: 24, disk: 1000, priceHr: 6.1, b1p1: 85, b16p1: 640, b64p4: 1900, model: 'Llama 3.1 8B', minCommit: 'None' },
    { vendor: 'Google Cloud', location: 'europe-west4', cpu: 64, gpu: 'A100', vram: 80, disk: 2000, priceHr: 29.9, b1p1: 205, b16p1: 1420, b64p4: 5000, model: 'Llama 3.1 70B', minCommit: 'None' },
    { vendor: 'Google Cloud', location: 'asia-southeast1', cpu: 32, gpu: 'L4', vram: 24, disk: 1000, priceHr: 6.9, b1p1: 82, b16p1: 610, b64p4: 1800, model: 'Mistral 7B', minCommit: 'None' },
    { vendor: 'Azure', location: 'eastus', cpu: 112, gpu: 'H100', vram: 80, disk: 2000, priceHr: 39.9, b1p1: 255, b16p1: 1820, b64p4: 6450, model: 'Mixtral 8x7B', minCommit: '1 mo' },
    { vendor: 'Azure', location: 'westeurope', cpu: 96, gpu: 'A100', vram: 80, disk: 2000, priceHr: 31.5, b1p1: 210, b16p1: 1480, b64p4: 5100, model: 'Llama 3.1 70B', minCommit: 'None' },
    { vendor: 'Azure', location: 'centralindia', cpu: 48, gpu: 'A10', vram: 24, disk: 1000, priceHr: 5.5, b1p1: 78, b16p1: 590, b64p4: 1700, model: 'Llama 3.1 8B', minCommit: 'None' },
    { vendor: 'RunPod', location: 'eu-west', cpu: 24, gpu: 'A6000', vram: 48, disk: 1000, priceHr: 1.8, b1p1: 92, b16p1: 710, b64p4: 2100, model: 'Llama 3.1 8B', minCommit: 'None' },
    { vendor: 'RunPod', location: 'us-east', cpu: 24, gpu: 'A4000', vram: 16, disk: 800, priceHr: 0.9, b1p1: 60, b16p1: 420, b64p4: 1250, model: 'Mistral 7B', minCommit: 'None' },
    { vendor: 'RunPod', location: 'ap-south', cpu: 24, gpu: 'A6000', vram: 48, disk: 1000, priceHr: 2.1, b1p1: 91, b16p1: 700, b64p4: 2050, model: 'Llama 3.1 8B', minCommit: 'None' },
    { vendor: 'Lambda', location: 'us-west', cpu: 80, gpu: 'A100', vram: 80, disk: 1000, priceHr: 12.0, b1p1: 198, b16p1: 1380, b64p4: 4800, model: 'Llama 3.1 70B', minCommit: 'None' },
    { vendor: 'Lambda', location: 'eu-west', cpu: 80, gpu: 'A100', vram: 80, disk: 1000, priceHr: 13.5, b1p1: 195, b16p1: 1360, b64p4: 4700, model: 'Llama 3.1 70B', minCommit: 'None' },
    { vendor: 'Lambda', location: 'us-central', cpu: 64, gpu: 'A6000', vram: 48, disk: 1000, priceHr: 2.4, b1p1: 95, b16p1: 720, b64p4: 2150, model: 'Llama 3.1 8B', minCommit: 'None' },
    { vendor: 'Google Cloud', location: 'us-east1', cpu: 64, gpu: 'H100', vram: 80, disk: 2000, priceHr: 41.0, b1p1: 260, b16p1: 1880, b64p4: 6600, model: 'Mixtral 8x7B', minCommit: '1 mo' },
    { vendor: 'AWS', location: 'ap-northeast-1', cpu: 64, gpu: 'A100', vram: 80, disk: 2000, priceHr: 34.0, b1p1: 205, b16p1: 1440, b64p4: 5050, model: 'Llama 3.1 70B', minCommit: 'None' },
    { vendor: 'Azure', location: 'japaneast', cpu: 96, gpu: 'A100', vram: 80, disk: 2000, priceHr: 33.0, b1p1: 208, b16p1: 1460, b64p4: 5080, model: 'Llama 3.1 70B', minCommit: 'None' }
  ]), []);

  // Default model suggestions with sizes
  const defaultModels = ['Llama 3.1 8B', 'Llama 3.1 70B', 'Mixtral 8x7B'];

  // Predefined GPU list
  const allGpuOptions = ['L4', 'A10', 'A10G', 'A4000', 'A6000', 'A100', 'H100', 'V100', 'T4', 'RTX 3090', 'RTX 4090', 'RTX A5000', 'RTX A6000'];

  // Model size mapping (in GB)
  const modelSizes: ModelSizes = {
    'Llama 3.1 8B': 16,
    'Llama 3.1 70B': 140,
    'Mistral 7B': 14,
    'Mixtral 8x7B': 90,
    'Claude 3 Haiku': 12,
    'GPT-4o-mini': 8,
    'GPT-4': 180,
    'Claude 3.5 Sonnet': 45,
    'Gemini Pro': 30
  };

  const allModelOptions = useMemo(() => {
    const fromOffers = Array.from(new Set(offers.map(o => o.model)));
    const defaults = Object.keys(modelSizes);
    return Array.from(new Set([...defaults, ...fromOffers])).sort();
  }, [offers]);

  const filteredModelOptions = useMemo(() => {
    if (!modelQuery.trim()) return allModelOptions;
    const q = modelQuery.toLowerCase().trim();
    return allModelOptions.filter(m => m.toLowerCase().includes(q));
  }, [allModelOptions, modelQuery]);

  const filteredGpuOptions = useMemo(() => {
    if (!gpuQuery.trim()) return allGpuOptions;
    const q = gpuQuery.toLowerCase().trim();
    return allGpuOptions.filter(g => g.toLowerCase().includes(q));
  }, [gpuQuery]);

  // Helper functions for model management
  const addToEligibleModels = (model: string) => {
    if (!eligibleModels.includes(model)) {
      setEligibleModels(prev => [...prev, model]);
    }
  };

  const removeFromEligibleModels = (model: string) => {
    setEligibleModels(prev => prev.filter(m => m !== model));
    // Also deselect if it was selected
    setSelectedModels(prev => prev.filter(m => m !== model));
  };

  const addToEligibleGpus = (gpu: string) => {
    if (!eligibleGpus.includes(gpu)) {
      setEligibleGpus(prev => [...prev, gpu]);
    }
  };

  const removeFromEligibleGpus = (gpu: string) => {
    setEligibleGpus(prev => prev.filter(g => g !== gpu));
    // Also deselect if it was selected
    setSelectedGpuTypes(prev => prev.filter(g => g !== gpu));
  };

  const toggleModelSelection = (model: string) => {
    setSelectedModels(prev =>
      prev.includes(model)
        ? prev.filter(m => m !== model)
        : [...prev, model]
    );
  };

  const toggleGpuSelection = (gpu: string) => {
    setSelectedGpuTypes(prev =>
      prev.includes(gpu)
        ? prev.filter(g => g !== gpu)
        : [...prev, gpu]
    );
  };

  const addModelFromSearch = (model: string) => {
    addToEligibleModels(model);
    // Optionally also select it
    if (!selectedModels.includes(model)) {
      setSelectedModels(prev => [...prev, model]);
    }
  };

  const removeModelFromSearch = (model: string) => {
    setSelectedModels(prev => prev.filter(m => m !== model));
  };

  const addGpuFromSearch = (gpu: string) => {
    addToEligibleGpus(gpu);
    // Optionally also select it
    if (!selectedGpuTypes.includes(gpu)) {
      setSelectedGpuTypes(prev => [...prev, gpu]);
    }
  };

  const removeGpuFromSearch = (gpu: string) => {
    setSelectedGpuTypes(prev => prev.filter(g => g !== gpu));
  };

  // Select all/deselect all functions
  const toggleAllScenarios = () => {
    const allScenarios = ['chat','code','docs','summarize','video'];
    setSelectedScenarios(prev => prev.length === allScenarios.length ? [] : allScenarios);
  };

  const toggleAllRegions = () => {
    const allRegions = ['us','eu','apac'];
    setSelectedRegions(prev => prev.length === allRegions.length ? [] : allRegions);
  };

  const toggleAllProviders = () => {
    const allProviders = ['AWS','Google Cloud','Azure','RunPod','Lambda'];
    setSelectedProviders(prev => prev.length === allProviders.length ? [] : allProviders);
  };

  const toggleAllGpuTypes = () => {
    setSelectedGpuTypes(prev => prev.length === eligibleGpus.length ? [] : [...eligibleGpus]);
  };

  const toggleAllModels = () => {
    setSelectedModels(prev => prev.length === eligibleModels.length ? [] : [...eligibleModels]);
  };

  const scenarioWeights: Record<string, number> = { chat: 1.0, code: 1.1, docs: 1.0, summarize: 0.9, video: 0.8 };

  // Filtering
  const filteredOffers = useMemo(() => {
    return offers.filter(o => {
      if (selectedRegions.length && !selectedRegions.some(r => o.location.includes(r))) return false;
      if (selectedGpuTypes.length && !selectedGpuTypes.includes(o.gpu)) return false;
      if (minVram && o.vram < Number(minVram)) return false;
      if (budgetCap && o.priceHr > Number(budgetCap)) return false;
      if (selectedProviders.length && !selectedProviders.includes(o.vendor)) return false;
      return true;
    }).map(o => ({ ...o, priceMonth: (o.priceHr * 24 * 30).toFixed(0) }));
  }, [offers, selectedRegions, selectedGpuTypes, minVram, budgetCap, selectedProviders]);

  const formatDuration = (sec: number): string => {
    if (!isFinite(sec) || sec <= 0) return 'n/a';
    if (sec < 60) return `${sec.toFixed(0)}s`;
    const min = sec/60; if (min < 60) return `${min.toFixed(1)}m`;
    const h = min/60; if (h < 24) return `${h.toFixed(1)}h`;
    const d = h/24; return `${d.toFixed(1)}d`;
  };

  const [sortField, setSortField] = useState<string>('priceHr');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const sortedOffers = useMemo(() => {
    const arr = [...filteredOffers];
    arr.sort((a,b)=>{
      const av = a[sortField as keyof HardwareOffer];
      const bv = b[sortField as keyof HardwareOffer];
      if (av === bv) return 0;
      return (av > bv ? 1 : -1) * (sortDir==='asc'?1:-1);
    });
    return arr;
  }, [filteredOffers, sortField, sortDir]);

  const topThreeOffers = useMemo(() => {
    return sortedOffers.slice(0, 3).map(o => ({
      ...o,
      priceMonth: (o.priceHr * 24 * 30).toFixed(0),
      cost1M: ((1000000 / (o.b64p4||1)) / 3600 * o.priceHr).toFixed(2),
      cost1B: ((1000000000 / (o.b64p4||1)) / 3600 * o.priceHr).toFixed(0),
      time1M: (1000000 / (o.b64p4||1)),
      time1B: (1000000000 / (o.b64p4||1))
    }));
  }, [sortedOffers]);

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  // Simple TCO calc (tokens cost + infra hourly)
  const [llmInputTokens, setLlmInputTokens] = useState<number>(1000000);
  const [llmOutputTokens, setLlmOutputTokens] = useState<number>(300000);
  const [infraHours, setInfraHours] = useState<number>(24);
  const [hourlyPrice, setHourlyPrice] = useState<number>(6.1);
  const providerTco = useMemo(() => {
    // rough token pricing defaults (USD per 1K)
    const inCost = (llmInputTokens / 1000) * 0.0005; // local/included default
    const outCost = (llmOutputTokens / 1000) * 0.0015;
    const infra = infraHours * hourlyPrice;
    return { inCost, outCost, infra, total: inCost + outCost + infra };
  }, [llmInputTokens, llmOutputTokens, infraHours, hourlyPrice]);

  return (
    <div className="h-full w-full flex flex-col p-4 overflow-y-auto">

      {/* Tabs removed as requested */}

      {(
        <div className="space-y-4">
                    {/* Selection - 3 vertical cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Card 1: Scenarios + Model Search + Preferred Models */}
            <Section title="Scenarios & Models">
              {/* Scenarios */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-gray-600">Scenarios</div>
                  <button
                    onClick={toggleAllScenarios}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {selectedScenarios.length === 5 ? <Square size={12} /> : <CheckSquare size={12} />}
                    {selectedScenarios.length === 5 ? 'None' : 'All'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['chat','code','docs','summarize','video'].map(s=> (
                    <label key={s} className={`px-2 py-1 border rounded cursor-pointer text-xs ${selectedScenarios.includes(s)?'bg-blue-50 border-blue-500 text-blue-700':'border-gray-300 text-gray-700'}`}>
                      <input type="checkbox" className="sr-only" checked={selectedScenarios.includes(s)} onChange={()=> setSelectedScenarios(prev => prev.includes(s)? prev.filter(x=>x!==s): [...prev, s])} />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

                            {/* Model Search */}
              <div className="mb-4" ref={searchFormRef}>
                <div className="text-xs text-gray-600 mb-1">Model Search</div>
                <div className="relative">
                  <Search size={12} className="absolute left-2 top-2 text-gray-400" />
                  <input
                    ref={modelInputRef}
                    value={modelQuery}
                    onChange={(e) => setModelQuery(e.target.value)}
                    onFocus={() => setShowModelSearch(true)}
                    className="w-full border rounded pl-6 pr-2 py-1 text-xs"
                    placeholder="Search and add models..."
                  />
                </div>

                {showModelSearch && (
                  <div className="mt-1 max-h-32 overflow-y-auto border rounded bg-white shadow-sm">
                    {(modelQuery.trim() ? filteredModelOptions : allModelOptions).map(model => {
                      const modelSize = modelSizes[model] || '?';
                      const isInEligible = eligibleModels.includes(model);
                      return (
                        <div
                          key={model}
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent input from losing focus
                            e.stopPropagation(); // Prevent click-outside handler from firing
                            isInEligible ? removeFromEligibleModels(model) : addModelFromSearch(model);
                          }}
                          className={`px-2 py-1 cursor-pointer hover:bg-blue-200 border-b last:border-b-0 text-xs ${
                            isInEligible ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{model}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">({modelSize}GB)</span>
                              {isInEligible ? (
                                <CheckSquare size={12} className="text-blue-600" />
                              ) : (
                                <Square size={12} className="text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {modelQuery.trim() && filteredModelOptions.length === 0 && (
                      <div className="px-2 py-1 text-xs text-gray-500">No models found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Eligible Models Shortlist */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-gray-600">Eligible Shortlist</div>
                  <button
                    onClick={toggleAllModels}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {selectedModels.length === eligibleModels.length ? <Square size={12} /> : <CheckSquare size={12} />}
                    {selectedModels.length === eligibleModels.length ? 'None' : 'All'}
                  </button>
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {eligibleModels.map(model => (
                    <label key={model} className={`flex items-center gap-1 px-2 py-1 border rounded cursor-pointer text-xs ${selectedModels.includes(model)?'bg-blue-50 border-blue-500 text-blue-700':'border-gray-300 text-gray-700'}`}>
                      <input type="checkbox" className="sr-only" checked={selectedModels.includes(model)} onChange={()=> toggleModelSelection(model)} />
                      {selectedModels.includes(model) ? <CheckSquare size={12} /> : <Square size={12} />}
                      <span className="truncate">{model}</span>
                    </label>
                  ))}
                </div>
              </div>
            </Section>

                        {/* Card 2: Regions + GPU Search + Preferred GPUs */}
            <Section title="Regions & GPUs">
              {/* Regions */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-gray-600">Regions</div>
                  <button
                    onClick={toggleAllRegions}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {selectedRegions.length === 3 ? <Square size={12} /> : <CheckSquare size={12} />}
                    {selectedRegions.length === 3 ? 'None' : 'All'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['us','eu','apac'].map(r=> (
                    <label key={r} className={`px-2 py-1 border rounded cursor-pointer text-xs ${selectedRegions.includes(r)?'bg-blue-50 border-blue-500 text-blue-700':'border-gray-300 text-gray-700'}`}>
                      <input type="checkbox" className="sr-only" checked={selectedRegions.includes(r)} onChange={()=> setSelectedRegions(prev => prev.includes(r)? prev.filter(x=>x!==r): [...prev, r])} />
                      {r.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>

                            {/* GPU Search */}
              <div className="mb-4" ref={gpuSearchRef}>
                <div className="text-xs text-gray-600 mb-1">GPU Search</div>
                <div className="relative">
                  <Search size={12} className="absolute left-2 top-2 text-gray-400" />
                  <input
                    ref={gpuInputRef}
                    value={gpuQuery}
                    onChange={(e) => setGpuQuery(e.target.value)}
                    onFocus={() => setShowGpuSearch(true)}
                    className="w-full border rounded pl-6 pr-2 py-1 text-xs"
                    placeholder="Search and add GPUs..."
                  />
                </div>

                {showGpuSearch && (
                  <div className="mt-1 max-h-32 overflow-y-auto border rounded bg-white shadow-sm">
                    {(gpuQuery.trim() ? filteredGpuOptions : allGpuOptions).map(gpu => {
                      const isInEligible = eligibleGpus.includes(gpu);
                      return (
                        <div
                          key={gpu}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            isInEligible ? removeFromEligibleGpus(gpu) : addGpuFromSearch(gpu);
                          }}
                          className={`px-2 py-1 cursor-pointer hover:bg-blue-200 border-b last:border-b-0 text-xs ${
                            isInEligible ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{gpu}</span>
                            {isInEligible ? (
                              <CheckSquare size={12} className="text-blue-600" />
                            ) : (
                              <Square size={12} className="text-gray-400" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {gpuQuery.trim() && filteredGpuOptions.length === 0 && (
                      <div className="px-2 py-1 text-xs text-gray-500">No GPUs found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Eligible GPUs Shortlist */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-gray-600">Eligible Shortlist</div>
                  <button
                    onClick={toggleAllGpuTypes}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {selectedGpuTypes.length === eligibleGpus.length ? <Square size={12} /> : <CheckSquare size={12} />}
                    {selectedGpuTypes.length === eligibleGpus.length ? 'None' : 'All'}
                  </button>
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {eligibleGpus.map(gpu => (
                    <label key={gpu} className={`flex items-center gap-1 px-2 py-1 border rounded cursor-pointer text-xs ${selectedGpuTypes.includes(gpu)?'bg-blue-50 border-blue-500 text-blue-700':'border-gray-300 text-gray-700'}`}>
                      <input type="checkbox" className="sr-only" checked={selectedGpuTypes.includes(gpu)} onChange={()=> toggleGpuSelection(gpu)} />
                      {selectedGpuTypes.includes(gpu) ? <CheckSquare size={12} /> : <Square size={12} />}
                      <span className="truncate">{gpu}</span>
                    </label>
                  ))}
                </div>
              </div>
            </Section>

                        {/* Card 3: Providers + Budget + Requirements */}
            <Section title="Providers & Requirements">
              {/* Providers */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-gray-600">Providers</div>
                  <button
                    onClick={toggleAllProviders}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {selectedProviders.length === 5 ? <Square size={12} /> : <CheckSquare size={12} />}
                    {selectedProviders.length === 5 ? 'None' : 'All'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['AWS','Google Cloud','Azure','RunPod','Lambda'].map(p=> (
                    <label key={p} className={`px-2 py-1 border rounded cursor-pointer text-xs ${selectedProviders.includes(p)?'bg-blue-50 border-blue-500 text-blue-700':'border-gray-300 text-gray-700'}`}>
                      <input type="checkbox" className="sr-only" checked={selectedProviders.includes(p)} onChange={()=> setSelectedProviders(prev => prev.includes(p)? prev.filter(x=>x!==p): [...prev, p])} />
                      {p === 'Google Cloud' ? 'GCP' : p}
                    </label>
                  ))}
                </div>
              </div>

                            {/* Budget & Requirements */}
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Budget Cap (USD/hr)</div>
                  <input
                    type="number"
                    value={budgetCap}
                    onChange={(e) => setBudgetCap(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-xs"
                    placeholder="Enter max hourly rate"
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Min VRAM (GB)</div>
                  <input
                    type="number"
                    value={minVram}
                    onChange={(e) => setMinVram(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-xs"
                    placeholder="Enter minimum VRAM"
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Min Performance (PFlops)</div>
                  <input
                    type="number"
                    value={minPflops}
                    onChange={(e) => setMinPflops(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-xs"
                    placeholder="Enter minimum performance"
                  />
                </div>
              </div>
            </Section>
          </div>

                    {/* Top 3 Suggestions */}
          {topThreeOffers.length > 0 && (
            <Section title="Top 3 Recommendations">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topThreeOffers.map((offer, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${offer.vendor === 'AWS' ? 'bg-orange-100 text-orange-700' : offer.vendor === 'Google Cloud' ? 'bg-blue-100 text-blue-700' : offer.vendor === 'Azure' ? 'bg-sky-100 text-sky-700' : 'bg-purple-100 text-purple-700'}`}>
                          {offer.vendor === 'Google Cloud' ? 'G' : offer.vendor.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{offer.vendor}</div>
                          <div className="text-xs text-gray-600">{offer.location}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">${offer.priceHr.toFixed(2)}/hr</div>
                        <div className="text-xs text-gray-500">${offer.priceMonth}/mo</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="bg-white rounded px-2 py-1">
                        <div className="text-gray-600">GPU</div>
                        <div className="font-semibold">{offer.gpu}</div>
                      </div>
                      <div className="bg-white rounded px-2 py-1">
                        <div className="text-gray-600">VRAM</div>
                        <div className="font-semibold">{offer.vram}GB</div>
                      </div>
                      <div className="bg-white rounded px-2 py-1">
                        <div className="text-gray-600">CPU</div>
                        <div className="font-semibold">{offer.cpu} cores</div>
                      </div>
                      <div className="bg-white rounded px-2 py-1">
                        <div className="text-gray-600">Disk</div>
                        <div className="font-semibold">{offer.disk}GB</div>
                      </div>
                    </div>

                    <div className="bg-white rounded p-3 mb-3">
                      <div className="text-xs text-gray-600 mb-2">Estimated Performance</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-gray-600">1M tokens</div>
                          <div className="font-semibold">{offer.cost1M} USD</div>
                          <div className="text-gray-500">{formatDuration(offer.time1M)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">1B tokens</div>
                          <div className="font-semibold">{offer.cost1B} USD</div>
                          <div className="text-gray-500">{formatDuration(offer.time1B)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <button className="w-full bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700">
                        Launch Instance
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

                    {/* Detailed Results Table */}
          {sortedOffers.length > 0 && (
            <Section title={`Detailed Results (${sortedOffers.length} offers)`}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-2 cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('vendor')}>
                        <div className="flex items-center gap-1">
                          Provider {sortField === 'vendor' && (sortDir === 'asc' ? '↑' : '↓')}
                        </div>
                      </th>
                      <th className="text-left py-2 px-2 cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('location')}>
                        <div className="flex items-center gap-1">
                          Location {sortField === 'location' && (sortDir === 'asc' ? '↑' : '↓')}
                        </div>
                      </th>
                      <th className="text-left py-2 px-2 cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('gpu')}>
                        <div className="flex items-center gap-1">
                          GPU {sortField === 'gpu' && (sortDir === 'asc' ? '↑' : '↓')}
                        </div>
                      </th>
                      <th className="text-left py-2 px-2 cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('vram')}>
                        <div className="flex items-center gap-1">
                          VRAM {sortField === 'vram' && (sortDir === 'asc' ? '↑' : '↓')}
                        </div>
                      </th>
                      <th className="text-left py-2 px-2 cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('cpu')}>
                        <div className="flex items-center gap-1">
                          CPU {sortField === 'cpu' && (sortDir === 'asc' ? '↑' : '↓')}
                        </div>
                      </th>
                      <th className="text-left py-2 px-2 cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('priceHr')}>
                        <div className="flex items-center gap-1">
                          Price/hr {sortField === 'priceHr' && (sortDir === 'asc' ? '↑' : '↓')}
                        </div>
                      </th>
                      <th className="text-left py-2 px-2">Model</th>
                      <th className="text-left py-2 px-2">Commit</th>
                      <th className="text-left py-2 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedOffers.map((offer, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-2">
                          <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${offer.vendor === 'AWS' ? 'bg-orange-100 text-orange-700' : offer.vendor === 'Google Cloud' ? 'bg-blue-100 text-blue-700' : offer.vendor === 'Azure' ? 'bg-sky-100 text-sky-700' : 'bg-purple-100 text-purple-700'}`}>
                            {offer.vendor === 'Google Cloud' ? 'GCP' : offer.vendor}
                          </div>
                        </td>
                        <td className="py-2 px-2 text-gray-900">{offer.location}</td>
                        <td className="py-2 px-2 text-gray-900">{offer.gpu}</td>
                        <td className="py-2 px-2 text-gray-900">{offer.vram}GB</td>
                        <td className="py-2 px-2 text-gray-900">{offer.cpu}</td>
                        <td className="py-2 px-2 text-gray-900">${offer.priceHr.toFixed(2)}</td>
                        <td className="py-2 px-2 text-gray-900">{offer.model}</td>
                        <td className="py-2 px-2 text-gray-900">{offer.minCommit}</td>
                        <td className="py-2 px-2">
                          <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                            Launch
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

                    {/* TCO Calculator */}
          <Section title="Total Cost of Ownership (TCO)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Token Costs</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Input Tokens</label>
                    <input
                      type="number"
                      value={llmInputTokens}
                      onChange={(e) => setLlmInputTokens(Number(e.target.value))}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Output Tokens</label>
                    <input
                      type="number"
                      value={llmOutputTokens}
                      onChange={(e) => setLlmOutputTokens(Number(e.target.value))}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Infrastructure</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Hours per Month</label>
                    <input
                      type="number"
                      value={infraHours}
                      onChange={(e) => setInfraHours(Number(e.target.value))}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Hourly Rate</label>
                    <input
                      type="number"
                      step="0.01"
                      value={hourlyPrice}
                      onChange={(e) => setHourlyPrice(Number(e.target.value))}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Monthly TCO Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">${providerTco.inCost.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">Input Tokens</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${providerTco.outCost.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">Output Tokens</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">${providerTco.infra.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">Infrastructure</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">${providerTco.total.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">Total TCO</div>
                </div>
              </div>
            </div>
          </Section>

                    {/* Mock Performance Metrics */}
          <Section title="Performance Metrics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">98.5%</div>
                <div className="text-sm text-gray-600">Uptime</div>
                <div className="text-xs text-green-600">+0.2% from last month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">~4.2s</div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
                <div className="text-xs text-green-600">-0.3s improvement</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">~6m</div>
                <div className="text-sm text-gray-600">VM start (mock)</div>
                <div className="text-xs text-gray-500">Estimated startup time</div>
              </div>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
