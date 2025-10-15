import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Server, Link as LinkIcon, Settings as SettingsIcon, Trash2, Pause, Play, Copy, RefreshCw, FileText, HelpCircle, Maximize2, Minimize2, X } from 'lucide-react';

// TypeScript interfaces
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export default function Settings() {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [port, setPort] = useState<string>('1234');
  const [serveLan, setServeLan] = useState<boolean>(true);
  const [jitLoading, setJitLoading] = useState<boolean>(true);
  const [autoUnload, setAutoUnload] = useState<boolean>(true);
  const [idleTtlMin, setIdleTtlMin] = useState<number>(60);
  const [keepLastJit, setKeepLastJit] = useState<boolean>(true);
  const [enableCors, setEnableCors] = useState<boolean>(false);

  const [fileLogLevel, setFileLogLevel] = useState<LogLevel>('info');
  const [windowLogLevel, setWindowLogLevel] = useState<LogLevel>('info');
  const [logRetention, setLogRetention] = useState<number>(7);
  const [sanitizeLogs, setSanitizeLogs] = useState<boolean>(true);
  const [logLocation] = useState<string>('/var/log/hai3/api-server.log');

  const [logs, setLogs] = useState<string[]>([]);
  const [freezeLogs, setFreezeLogs] = useState<boolean>(false);
  const logsRef = useRef<HTMLDivElement>(null);
  const [logsExpanded, setLogsExpanded] = useState<boolean>(false);

  // Mock log generator
  useEffect(() => {
    const interval = setInterval(() => {
      if (freezeLogs) return;
      setLogs(prev => {
        const next = [...prev, `${new Date().toLocaleTimeString()} [${windowLogLevel.toUpperCase()}] Server heartbeat on :${port}`];
        return next.slice(-500);
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [freezeLogs, windowLogLevel, port]);

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  const baseUrl = useMemo(() => {
    if (!enabled) return '';
    const host = serveLan ? 'http://0.0.0.0' : 'http://localhost';
    return `${host}:${port}`;
  }, [enabled, serveLan, port]);

  const copyLogs = (): void => {
    const text = logs.join('\n');
    navigator.clipboard?.writeText(text);
  };

  const clearLogs = (): void => setLogs([]);

  const logsBytes = useMemo(() => logs.join('\n').length, [logs]);

  const formatBytes = (bytes: number): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B','KB','MB','GB','TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(i ? 1 : 0)} ${sizes[i]}`;
  };

  return (
    <div className="h-full w-full flex flex-col p-4 gap-4 overflow-y-auto">
      {/* Top: left settings column + right logs column */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1">
        <div className="flex flex-col gap-4">
          {/* Server controls */}
          <div className="hx-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">Enable HAI3 Demo API Server</div>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={enabled} onChange={() => setEnabled(!enabled)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>

            {enabled && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 inline-flex items-center gap-2">
                <LinkIcon size={14} /> Server URL: <span className="font-medium">{baseUrl}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {enabled && (
                <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                  <div className="text-sm">Server Port</div>
                  <input
                    value={port}
                    onChange={(e) => setPort(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-24 border rounded px-2 py-1 text-sm"
                  />
                </div>
              )}
              {enabled && (
                <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                  <div className="text-sm inline-flex items-center gap-1">Enable CORS <HelpCircle size={14} className="text-gray-400" /></div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={enableCors} onChange={() => setEnableCors(!enableCors)} />
                    <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              )}
              {enabled && (
                <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                  <div className="text-sm inline-flex items-center gap-1">Serve on Local Network <HelpCircle size={14} className="text-gray-400" /></div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={serveLan} onChange={() => setServeLan(!serveLan)} />
                    <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-orange-500 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              )}
              {enabled && (
                <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                  <div className="text-sm inline-flex items-center gap-1">Just-in-Time Model Loading <HelpCircle size={14} className="text-gray-400" /></div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={jitLoading} onChange={() => setJitLoading(!jitLoading)} />
                    <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              )}
              {enabled && (
                <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                  <div className="text-sm inline-flex items-center gap-1">Auto unload unused JIT models <HelpCircle size={14} className="text-gray-400" /></div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={autoUnload} onChange={() => setAutoUnload(!autoUnload)} />
                    <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              )}
              {enabled && (
                <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                  <div className="text-sm">Max idle TTL (min)</div>
                  <input
                    value={idleTtlMin}
                    onChange={(e) => setIdleTtlMin(parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
                    className="w-24 border rounded px-2 py-1 text-sm"
                  />
                </div>
              )}
              {enabled && (
                <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                  <div className="text-sm inline-flex items-center gap-1">Only Keep Last JIT Loaded Model <HelpCircle size={14} className="text-gray-400" /></div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={keepLastJit} onChange={() => setKeepLastJit(!keepLastJit)} />
                    <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* File logs configuration */}
          <div className="hx-card space-y-3">
            <div className="text-sm font-medium inline-flex items-center gap-2">
              <SettingsIcon size={16} /> Server file logs configuration
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                <div className="text-sm">File logs level</div>
                <select
                  value={fileLogLevel}
                  onChange={(e) => setFileLogLevel(e.target.value as LogLevel)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="error">error</option>
                  <option value="warn">warn</option>
                  <option value="info">info</option>
                  <option value="debug">debug</option>
                </select>
              </div>
              <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                <div className="text-sm">Set retention (days)</div>
                <input
                  value={logRetention}
                  onChange={(e) => setLogRetention(parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
                  className="w-24 border rounded px-2 py-1 text-sm"
                />
              </div>
              <div className="flex items-center justify-between border rounded-lg px-3 py-2 col-span-1 sm:col-span-2">
                <div className="text-sm">Logs location</div>
                <div className="text-sm text-gray-600">{logLocation}</div>
              </div>
              <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                <div className="text-sm">Sanitize logs</div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={sanitizeLogs} onChange={() => setSanitizeLogs(!sanitizeLogs)} />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
              <div className="flex items-center justify-end">
                <button onClick={clearLogs} className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 size={16} /> Clear logs
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Logs panel */}
        <div className="hx-card flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium inline-flex items-center gap-2">
              <FileText size={16} /> Server logs
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500 mr-2">Total size: {formatBytes(logsBytes)}</div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-gray-600">Window level</span>
                <select
                  value={windowLogLevel}
                  onChange={(e) => setWindowLogLevel(e.target.value as LogLevel)}
                  className="border rounded px-1.5 py-1 text-xs"
                >
                  <option value="error">error</option>
                  <option value="warn">warn</option>
                  <option value="info">info</option>
                  <option value="debug">debug</option>
                </select>
              </div>
              <button onClick={() => setLogsExpanded(true)} className="px-2 py-1.5 text-sm border rounded-lg inline-flex items-center gap-1"><Maximize2 size={14} /> Expand</button>
              <button onClick={() => setFreezeLogs(!freezeLogs)} className="px-2 py-1.5 text-sm border rounded-lg inline-flex items-center gap-1">
                {freezeLogs ? <Play size={14} /> : <Pause size={14} />} {freezeLogs ? 'Resume' : 'Freeze'}
              </button>
              <button onClick={copyLogs} className="px-2 py-1.5 text-sm border rounded-lg inline-flex items-center gap-1"><Copy size={14} /> Copy</button>
              <button onClick={clearLogs} className="px-2 py-1.5 text-sm border rounded-lg inline-flex items-center gap-1"><RefreshCw size={14} /> Clear</button>
            </div>
          </div>
          <div ref={logsRef} className="mt-3 hx-body-secondary border rounded-lg p-3 h-[calc(100vh-240px)] overflow-auto font-mono text-xs whitespace-pre-wrap">
            {logs.length === 0 ? 'No logs yet.' : logs.join('\n')}
          </div>
        </div>
      </div>

      {/* Expanded logs overlay */}
      {logsExpanded && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="h-full w-full flex flex-col p-4 gap-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-800 inline-flex items-center gap-2">
                <FileText size={16} /> Server logs (Full view)
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setLogsExpanded(false)} className="px-2 py-1.5 text-sm border rounded-lg inline-flex items-center gap-1"><Minimize2 size={14} /> Collapse</button>
                <button onClick={() => setLogsExpanded(false)} className="px-2 py-1.5 text-sm border rounded-lg inline-flex items-center gap-1"><X size={14} /> Close</button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setFreezeLogs(!freezeLogs)} className="px-2 py-1.5 text-sm border rounded-lg inline-flex items-center gap-1">
                {freezeLogs ? <Play size={14} /> : <Pause size={14} />} {freezeLogs ? 'Resume' : 'Freeze'}
              </button>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-gray-600">Window level</span>
                <select
                  value={windowLogLevel}
                  onChange={(e) => setWindowLogLevel(e.target.value as LogLevel)}
                  className="border rounded px-1.5 py-1 text-xs"
                >
                  <option value="error">error</option>
                  <option value="warn">warn</option>
                  <option value="info">info</option>
                  <option value="debug">debug</option>
                </select>
              </div>
              <button onClick={copyLogs} className="px-2 py-1.5 text-sm border rounded-lg inline-flex items-center gap-1"><Copy size={14} /> Copy</button>
              <button onClick={clearLogs} className="px-2 py-1.5 text-sm border rounded-lg inline-flex items-center gap-1"><RefreshCw size={14} /> Clear</button>
              <div className="text-xs text-gray-500 ml-2">Total size: {formatBytes(logsBytes)}</div>
            </div>
            <div className="flex-1 bg-gray-50 border rounded-lg p-3 overflow-auto font-mono text-xs text-gray-800 whitespace-pre-wrap">
              {logs.length === 0 ? 'No logs yet.' : logs.join('\n')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
