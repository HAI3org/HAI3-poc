import React, { useEffect, useState } from 'react';
import {
  Monitor,
  Cloud,
  Layers,
  Search as SearchIcon,
  Crown,
  Check,
  Power,
  Download,
  Star,
  StarOff,
  Cpu,
  HardDrive,
  Gauge,
  LucideIcon
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../uikit/tabs';
import { Input } from '../../uikit/input';
import { Button } from '../../uikit/button';
import { Badge } from '../../uikit/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../uikit/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../uikit/table';
import { Progress } from '../../uikit/progress';
import { fetchLocalModels, fetchCloudModels } from './api';
import type { LocalModel, CloudModel, Model, Tab } from './data';

// Types are imported from './data'

interface LoadedModelTileProps {
  model: LocalModel;
  onUnload: (id: string) => void;
}

// Data now provided via API

function LoadedModelTile({ model, onUnload }: LoadedModelTileProps): JSX.Element {
  const getGradientColors = (vendor: string): string => {
    const colorMap: Record<string, string> = {
      'Meta': 'from-emerald-500 to-teal-600',
      'Mistral AI': 'from-amber-500 to-orange-600',
      'OpenAI': 'from-blue-500 to-indigo-600',
      'Anthropic': 'from-rose-500 to-pink-600',
      'Google': 'from-cyan-500 to-sky-600'
    };
    return colorMap[vendor] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className={`rounded-xl p-4 text-white bg-gradient-to-br ${getGradientColors(model.vendor)} shadow-md min-h-[140px]`}>
      <div className="flex items-center justify-between mb-2">
        <Badge className="hx-tile-overlay text-white uppercase tracking-wide">{model.vendor}</Badge>
        <Badge className="text-[11px] hx-tile-overlay text-white">{model.size}</Badge>
      </div>
      <div className="text-base font-semibold leading-tight mb-2">{model.name}</div>
      <div className="grid grid-cols-3 gap-2 text-[11px] mb-3">
        <Badge className="flex items-center gap-1 hx-tile-overlay text-white">
          <span className="font-semibold">{model.messages.toLocaleString()}</span>
          <span className="opacity-90 truncate">msgs</span>
        </Badge>
        <Badge className="flex items-center gap-1 hx-tile-overlay text-white">
          <Gauge size={12} className="shrink-0" />
          <span className="truncate">{model.tokensPerSec} t/s</span>
        </Badge>
        <Badge className="flex items-center gap-1 hx-tile-overlay text-white">
          <HardDrive size={12} className="shrink-0" />
          <span className="truncate">{model.vramGB}GB</span>
        </Badge>
      </div>
      <div className="flex items-center justify-between text-xs">
        <Badge className="hx-tile-overlay text-white">Last: <span className="font-medium">{model.lastUsed}</span></Badge>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-white/90 border border-white/30 hover:text-white hover:border-white"
          onClick={() => onUnload(model.id)}
        >
          <Power size={12} /> Unload
        </Button>
      </div>
    </div>
  );
}

function Models(): JSX.Element {
  const [activeTab, setActiveTab] = useState<string>('local');
  const [filterText, setFilterText] = useState<string>('');
  const [localModels, setLocalModels] = useState<LocalModel[]>([]);
  const [cloudModels, setCloudModels] = useState<CloudModel[]>([]);
  const [loadedModels, setLoadedModels] = useState<LocalModel[]>([]);
  const [downloads, setDownloads] = useState<Record<string, { state: 'idle' | 'downloading' | 'done'; progress: number }>>({
    // Illustrate different states across different rows
    // local3: downloading, local4: idle (shows Download button)
    local3: { state: 'downloading', progress: 42 }
  });

  useEffect(() => {
    fetchLocalModels().then((locals) => {
      setLocalModels(locals);
      setLoadedModels(locals.filter(m => m.loaded));
    });
    fetchCloudModels().then(setCloudModels);
  }, []);

  const handleUnload = (id: string): void => {
    setLoadedModels(prev => prev.filter(m => m.id !== id));
  };

  const toggleShortlist = (id: string, isLocal: boolean = true): void => {
    if (isLocal) {
      // Update local models shortlist status
    } else {
      // Update cloud models shortlist status
    }
  };

  const getFilteredModels = <T extends Model>(models: T[]): T[] => {
    const q = filterText.trim().toLowerCase();
    return models.filter(m =>
      q === '' ||
      m.name.toLowerCase().includes(q) ||
      m.vendor.toLowerCase().includes(q)
    );
  };

  const filteredLocalModels = getFilteredModels(localModels);
  const filteredCloudModels = getFilteredModels(cloudModels);
  const allModels: Model[] = [...localModels, ...cloudModels];
  const filteredAllModels = getFilteredModels(allModels);

  const tabs: Tab[] = [
    { id: 'local', label: 'Local Models', icon: Monitor },
    { id: 'cloud', label: 'Cloud Models', icon: Cloud },
    { id: 'all', label: 'All Models', icon: Layers }
  ];

  const isLocalModel = (model: Model): model is LocalModel => {
    return 'vramGB' in model;
  };

  const startDownload = (id: string): void => {
    setDownloads((prev) => ({ ...prev, [id]: { state: 'downloading', progress: 0 } }));
  };

  // no cancel flow in simplified UX

  return (
    <div className="h-full w-full flex flex-col p-4 max-w-full overflow-y-auto">
      {/* Tab Navigation */}
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <Icon size={16} />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {/* Search Filter */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
            <Input
              placeholder="Filter models..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

      {/* Local Models Tab */}
        <TabsContent value="local" className="flex-1">
          {/* Loaded Models Tiles */}
          {loadedModels.length > 0 && (
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Loaded Models</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {loadedModels.map((model) => (
                      <LoadedModelTile key={model.id} model={model} onUnload={handleUnload} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* All Local Models Grid */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>All Local Models</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Shortlisted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLocalModels.map((model) => (
                      <TableRow key={model.id}>
                        <TableCell className="font-medium text-foreground">{model.name}</TableCell>
                        <TableCell className="text-foreground">{model.vendor}</TableCell>
                        <TableCell>
                          <Badge variant={model.loaded ? 'success' : 'secondary'}>
                            {model.loaded ? 'Loaded' : 'Not loaded'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleShortlist(model.id, true)}
                            aria-label="Toggle shortlist"
                          >
                            {model.shortlisted ? (
                              <Star size={16} className="text-yellow-500" />
                            ) : (
                              <StarOff size={16} className="text-muted-foreground" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {!model.loaded && (
                              <Button size="sm" className="gap-1">
                                <Download size={12} /> Load
                              </Button>
                            )}
                            {model.loaded && (
                              <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleUnload(model.id)}>
                                <Power size={12} /> Unload
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      {/* Cloud Models Tab */}
        <TabsContent value="cloud" className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Cloud Models</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Speed</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Shortlisted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCloudModels.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell className="font-medium text-foreground">{model.name}</TableCell>
                      <TableCell className="text-foreground">{model.vendor}</TableCell>
                      <TableCell className="text-foreground">{model.cost}</TableCell>
                      <TableCell className="text-foreground">{model.speed}</TableCell>
                      <TableCell className="text-foreground">{model.quality}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleShortlist(model.id, false)}
                          aria-label="Toggle shortlist"
                        >
                          {model.shortlisted ? (
                            <Star size={16} className="text-yellow-500" />
                          ) : (
                            <StarOff size={16} className="text-muted-foreground" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

      {/* All Models Tab */}
        <TabsContent value="all" className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>All Models</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="w-[220px]">Status</TableHead>
                    <TableHead>Shortlisted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAllModels.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell className="font-medium text-foreground">{model.name}</TableCell>
                      <TableCell className="text-foreground">{model.vendor}</TableCell>
                      <TableCell>
                        <Badge variant={model.id.startsWith('local') ? 'info' : 'secondary'} className="text-[11px] px-2 py-0.5">
                          {model.id.startsWith('local') ? 'Local' : 'Cloud'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {model.id.startsWith('local') ? (
                          model.loaded ? (
                            <Badge variant="success" className="text-[11px] px-2 py-0.5">Loaded</Badge>
                          ) : (
                            (() => {
                              const st = downloads[model.id] ?? { state: 'idle' as const, progress: 0 };
                              switch (st.state) {
                                case 'downloading':
                                  return (
                                    <div className="flex items-center gap-2 w-40 max-w-full">
                                      <div className="flex-1">
                                        <Progress value={st.progress} className="h-1" />
                                      </div>
                                      <div className="w-8 text-[10px] tabular-nums text-muted-foreground text-right">{Math.round(st.progress)}%</div>
                                    </div>
                                  );
                                case 'done':
                                  return <Badge variant="success" className="text-[11px] px-2 py-0.5">Downloaded</Badge>;
                                default:
                                  return (
                                    <Button size="sm" className="gap-1" onClick={() => startDownload(model.id)}>
                                      <Download size={12} /> Download
                                    </Button>
                                  );
                              }
                            })()
                          )
                        ) : (
                          <Badge variant={model.loaded ? 'success' : 'secondary'} className="text-[11px] px-2 py-0.5">
                            {model.loaded ? 'Loaded' : 'Available'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleShortlist(model.id, model.id.startsWith('local'))}
                          aria-label="Toggle shortlist"
                        >
                          {model.shortlisted ? (
                            <Star size={16} className="text-yellow-500" />
                          ) : (
                            <StarOff size={16} className="text-muted-foreground" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Models;
