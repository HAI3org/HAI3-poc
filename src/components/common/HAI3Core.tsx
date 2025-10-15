import React, { useState, useRef, useEffect } from 'react';
import { Menu, Monitor } from 'lucide-react';
import { getMenuItemsBySection, getScreensetsList, getMenuItemSecondLayerConfig, getScreenseetMenuItems } from '../screensetConfig';
import { themes, defaultTheme, applyTheme, getStoredTheme, storeTheme, Theme } from '../themeConfig';
import { programConfigs } from '../screensets/dynaval/components/DynamicProgramIcons';
import DynavalSidebar from '../screensets/dynaval/components/DynavalSidebar';

// Types for component props
interface SubtitleConfig {
  content: React.ReactNode;
  isEditing?: boolean;
}

interface HAI3CoreProps {
  children: React.ReactElement;
  currentScreenset: string;
  screenType?: string;
  screenProps?: Record<string, any>;
  controlledActiveTab?: string;
  onActiveTabChange?: (tab: string) => void;
  subtitle?: SubtitleConfig;
  onScreensetChange?: (screenset: string) => void;
}

// Types for menu items
interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  component?: React.ComponentType<Record<string, unknown>>;
  section?: string;
}

// Types for system stats
interface SystemStats {
  totalMem: number;
  freeMem: number;
  load1: number;
  cores: number;
  platform: string;
}

// Types for Electron API
interface ElectronAPI {
  getAppPath: () => Promise<{
    app: string;
    userData: string;
    public: string;
    current: string;
  }>;
  getSystemStats: () => Promise<SystemStats>;
  getAppVersion: () => Promise<string>;
}

// Extend Window interface
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

const HAI3Core: React.FC<HAI3CoreProps> = ({
  children,
  currentScreenset: currentScreenset,
  screenType,
  screenProps = {},
  controlledActiveTab,
  onActiveTabChange,
  subtitle,
  onScreensetChange: onScreensetChange
}) => {

  // Core UI state
  const [leftMenuCollapsed, setLeftMenuCollapsed] = useState<boolean>(true);
  const [showMenuTitles, setShowMenuTitles] = useState<boolean>(!leftMenuCollapsed);
  const [logoPath, setLogoPath] = useState<string>('/hai3-logo.svg');
  const [currentTheme, setCurrentTheme] = useState<string>(getStoredTheme() || defaultTheme);

  // Active tab management (controlled or uncontrolled)
  const [uncontrolledActiveTab, setUncontrolledActiveTab] = useState<string>('chat');
  const activeTab = controlledActiveTab ?? uncontrolledActiveTab;
  const setActiveTab = (tab: string): void => {
    if (onActiveTabChange) onActiveTabChange(tab);
    else setUncontrolledActiveTab(tab);
  };

  // State for second-layer menu button tooltip
  const [secondLayerMenuOpen, setSecondLayerMenuOpen] = useState(true);


  // Refs for UI elements
  const leftMenuRef = useRef<HTMLDivElement>(null);
  const secondLayerRef = useRef<HTMLDivElement>(null);

  // System stats for footer
  const [stats, setStats] = useState<SystemStats>({ totalMem: 0, freeMem: 0, load1: 0, cores: 1, platform: '' });
  const [appVersion, setAppVersion] = useState<string>('');

  // Get menu items based on current screenset
  const screensetMenuSections = getMenuItemsBySection(currentScreenset);
  const topMenuItems: MenuItem[] = screensetMenuSections.top || [];
  const middleMenuItems: MenuItem[] = screensetMenuSections.middle || [];
  const bottomMenuItems: MenuItem[] = screensetMenuSections.bottom || [];

  // Menu sizing
  const collapsedWidth = 64; // 4rem = 64px
  const expandedWidth = 240; // Accommodates longer titles

  // Second-layer menu configuration
  const currentSecondLayerConfig = getMenuItemSecondLayerConfig(currentScreenset, activeTab);
  const hasSecondLayerMenu = currentSecondLayerConfig?.enabled || false;

  // Listen for state changes from the second-layer menu to update the button tooltip
  useEffect(() => {
    const handleStateChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail.screensetKey === currentScreenset && customEvent.detail.tabId === activeTab) {
        setSecondLayerMenuOpen(customEvent.detail.isOpen);
      }
    };

    window.addEventListener('second-layer-menu-state-change', handleStateChange);

    return () => {
      window.removeEventListener('second-layer-menu-state-change', handleStateChange);
    };
  }, [currentScreenset, activeTab]);

  // Get screen title from screenset configuration
  const getScreenTitle = (): string => {
    const menuItems = getScreenseetMenuItems(currentScreenset);
    const tabToUse = activeTab || screenType || (menuItems.length > 0 ? menuItems[0].id : '');
    const currentMenuItem = menuItems.find(item => item.id === tabToUse);

    if (currentMenuItem) {
      return currentMenuItem.title;
    }

    // Fallback to capitalized tab name
    return tabToUse.charAt(0).toUpperCase() + tabToUse.slice(1);
  };

  // Handle menu collapse/expand with delayed title showing
  useEffect(() => {
    if (leftMenuCollapsed) {
      setShowMenuTitles(false);
    } else {
      const timer = setTimeout(() => {
        setShowMenuTitles(true);
      }, 75);
      return () => clearTimeout(timer);
    }
  }, [leftMenuCollapsed]);


  // Logo path detection for Electron vs browser
  useEffect(() => {
    if (window.electronAPI) {
      // In Electron, files are relative to index.html in the build directory
      setLogoPath('./hai3-logo.svg');
      console.log('Electron mode: using relative logo path');
    } else {
      // In browser, use absolute path from public directory
      setLogoPath('/hai3-logo.svg');
      console.log('Browser mode: using absolute logo path');
    }
  }, []);

  // Apply theme on mount and when currentTheme changes
  useEffect(() => {
    applyTheme(currentTheme);
    storeTheme(currentTheme);
  }, [currentTheme]);

  // Expose current screenset globally for screens to consume (avoids hardcoding screenset names)
  useEffect(() => {
    try {
      (window as any).__HS_CURRENT_SCREENSET__ = currentScreenset;
    } catch {}
  }, [currentScreenset]);

  // System stats polling
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fetchStats = async (): Promise<void> => {
      try {
        const s = await window?.electronAPI?.getSystemStats?.();
        if (s) setStats(s);
        if (!appVersion && window?.electronAPI?.getAppVersion) {
          const v = await window.electronAPI.getAppVersion();
          setAppVersion(v || '');
        }
      } catch {}
    };
    fetchStats();
    timer = setInterval(fetchStats, 2000);
    return () => clearInterval(timer);
  }, [appVersion]);

  // Calculate system stats for display
  const memTotalGB = stats.totalMem ? (stats.totalMem / (1024 ** 3)) : 0;
  const memUsedGB = stats.totalMem && stats.freeMem ? ((stats.totalMem - stats.freeMem) / (1024 ** 3)) : 0;
  const memPct = memTotalGB ? Math.min(100, Math.max(0, (memUsedGB / memTotalGB) * 100)) : 0;
  const cpuPct = stats.cores ? Math.min(100, Math.max(0, (stats.load1 / stats.cores) * 100)) : 0;

  // Props to pass down to child screens
  const childScreenProps = {
    setActiveTab,
    // Any other shared utilities can be added here
  };

  return (
    <div className="relative flex h-screen hx-body-primary overflow-hidden min-w-full">
      {/* Top Status Bar - Draggable */}
      <div
        className="absolute top-0 left-0 right-0 border-b hx-top-header z-50 cursor-move"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="px-3 py-1.5 text-xs flex items-center justify-center">
          <div className="select-none">
            HAI3
          </div>
        </div>

        {/* Screenset Selector - Embedded in top bar with no-drag */}
        {onScreensetChange && (
          <div
            className="absolute"
            style={{
              right: '100px',
              top: '50%',
              marginTop: '-40px',
              transform: 'translateY(-50%)',
              zIndex: 100,
              WebkitAppRegion: 'no-drag',
              pointerEvents: 'auto'
            } as React.CSSProperties}
          >
            <div
              className="bg-red-900 hover:bg-red-800 rounded-lg shadow-lg border border-red-700 px-2 py-1 transition-colors"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
              <div className="flex items-center gap-2 pt-20">
                <Monitor size={14} className="text-red-200" />
                <select
                  value={currentScreenset}
                  onChange={(e) => {
                    console.log('Screenset changed to:', e.target.value);
                    onScreensetChange(e.target.value);
                  }}
                  onClick={(e) => {
                    console.log('Select clicked');
                    e.stopPropagation();
                  }}
                  className="border-none outline-none text-red-100 bg-red-900 hover:bg-red-800 cursor-pointer font-medium text-sm min-w-0 appearance-none"
                  title="Switch UI Screenset"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fecaca' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 4px center',
                    backgroundSize: '10px',
                    paddingRight: '18px',
                    pointerEvents: 'auto'
                  } as React.CSSProperties}
                >
                  {getScreensetsList().map((screenset) => (
                    <option key={screenset.id} value={screenset.id} className="bg-red-900 text-red-100 py-1">
                      {screenset.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Left Sidebar */}
      <div
        className="transition-all duration-20 overflow-hidden hx-left-menu bg-gray-900 text-white min-h-screen pt-6 flex-shrink-0"
        style={{
          width: leftMenuCollapsed
            ? `${collapsedWidth}px`
            : `${expandedWidth}px`
        }}
      >
        <div className="flex flex-col h-screen py-3">
          {/* Company Logo / Brand */}
          <div className="flex items-center px-2 mb-0">
            <button
              onClick={() => setLeftMenuCollapsed(!leftMenuCollapsed)}
              className={`flex items-center gap-3 hover:bg-gray-800 rounded-lg transition-colors py-0 px-2 ${
                leftMenuCollapsed ? 'w-12 py-0' : 'w-full'
              }`}
              title={leftMenuCollapsed ? "Expand menu" : "Collapse menu"}
            >
              <img
                src={logoPath}
                alt="HAI3"
                className={`w-8 h-8 flex-shrink-0 ${leftMenuCollapsed ? 'hx-logo-collapsed' : 'hx-logo-expanded'}`}
                style={{ marginLeft: '-2px' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  console.error('Logo failed to load:', target.src);
                  // Hide broken image and show fallback
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.logo-fallback')) {
                    const fallbackText = document.createElement('div');
                    fallbackText.className = 'logo-fallback w-8 h-8 flex items-center justify-center bg-blue-600 text-white text-xs font-bold rounded';
                    fallbackText.textContent = 'H3';
                    parent.insertBefore(fallbackText, target);
                  }
                }}
              />
              {showMenuTitles && (
                <div className="flex items-center gap-2 transition-opacity ease-in-out">
                  <img src={window.electronAPI ? './hai3-logo-text.svg' : '/hai3-logo-text.svg'} alt="HAI3" className="h-8" />
                  <div
                    style={{
                      color: 'gray',
                      lineHeight: '11px',
                      fontSize: '11px',
                      textAlign: 'left',
                      overflow: 'hidden',
                      maxHeight: '22px'
                    }}
                  >
                    Dev kit<br />Demo v0.1
                  </div>
                </div>
              )}
            </button>
          </div>

          {/* Divider after logo header */}
          <div className="h-px bg-gray-700 my-2 mx-2" />

          {/* Menu Items */}
          <div className="flex-1 flex flex-col justify-between px-2 overflow-y-auto">
            <div className="flex flex-col gap-1">
              {currentScreenset === 'dynaval' ? (
                <DynavalSidebar
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  leftMenuCollapsed={leftMenuCollapsed}
                  showMenuTitles={showMenuTitles}
                  onProgramSelect={(id: string) => setActiveTab(id)}
                />
              ) : (
                <>
                  {/* Top Section - Core Tools */}
                  {topMenuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-3 rounded-lg transition-colors px-3 py-3 hx-left-menu-item ${
                        leftMenuCollapsed ? 'w-11' : 'w-full'
                      } ${
                        activeTab === item.id ? 'hx-left-menu-item-selected' : 'hx-left-menu-item'
                      }`}
                      title={item.title}
                    >
                      <item.icon size={20} className="flex-shrink-0" />
                      {showMenuTitles && (
                        <span className="text-sm ease-in-out truncate">{item.title}</span>
                      )}
                    </button>
                  ))}

                  {/* Divider after top section - only show if middle section has items */}
                  {middleMenuItems.length > 0 && (
                    <div className="h-px bg-gray-700 my-2 mx-2" />
                  )}

                  {/* Middle Section - Assistants */}
                  {middleMenuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-3 rounded-lg transition-colors px-3 py-3 ${
                        leftMenuCollapsed ? 'w-11' : 'w-full'
                      } ${
                        activeTab === item.id ? 'hx-left-menu-item-selected' : 'hx-left-menu-item'
                      }`}
                      title={item.title}
                    >
                      <item.icon size={20} className="flex-shrink-0" />
                      {showMenuTitles && (
                        <span className="text-sm ease-in-out truncate">{item.title}</span>
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Bottom Section - System Tools */}
            <div className="flex flex-col gap-1 mb-8">
              {/* Divider before bottom section - only show if bottom section has items */}
              {bottomMenuItems.length > 0 && (
                <div className="h-px bg-gray-700 my-2 mx-2" />
              )}

              {bottomMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 rounded-lg transition-colors px-3 py-3 ${
                    leftMenuCollapsed ? 'w-11' : 'w-full'
                  } ${
                    activeTab === item.id ? 'hx-left-menu-item-selected' : 'hx-left-menu-item'
                  }`}
                  title={item.title}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  {showMenuTitles && (
                    <span className="text-sm ease-in-out truncate">
                      {item.title}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Generic Second-Layer Menu - rendered when current tab has secondLayerMenu config */}
      {hasSecondLayerMenu && currentSecondLayerConfig?.renderer && (
        <div ref={secondLayerRef}>
          {currentSecondLayerConfig.renderer({
            // Pass the main screen props to the second layer menu
            ...children.props
          })}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen pt-6 min-w-0 overflow-hidden">
        {/* Header */}
        <div className="hx-header bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0 relative">
          <div
            className="absolute top-0 right-16 w-20 h-full cursor-move"
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
            title="Drag to move window"
          ></div>
          <div className="flex items-center gap-4" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            {hasSecondLayerMenu && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('toggle-second-layer-menu', { detail: { screensetKey: currentScreenset, tabId: activeTab } }))}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                title={secondLayerMenuOpen ? currentSecondLayerConfig?.collapsedTitle : currentSecondLayerConfig?.toggleTitle}
              >
                <Menu size={20} />
              </button>
            )}
            <h1 className="text-xl font-semibold">{getScreenTitle()}</h1>
            {/* Dynamic header content slot for screenset-specific portals (e.g., Chat title editor) */}
            <div id="dynamic-header-content" className="flex items-center" />
          </div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 overflow-hidden" style={{ paddingBottom: '30px' }}>
          {currentScreenset === 'dynaval' && programConfigs[activeTab] ? (
            React.createElement(programConfigs[activeTab].component, { ...screenProps, ...childScreenProps })
          ) : (
            React.cloneElement(children, { ...screenProps, ...childScreenProps })
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="hx-footer absolute bottom-0 left-0 right-0 border-t z-50">
        <div className="px-3 py-1.5 text-xs flex items-center gap-3 overflow-x-auto">
          <div className="inline-flex items-center gap-1 whitespace-nowrap">
            HAI3 {appVersion ? `v${appVersion}` : ''}
          </div>
          <div className="h-3 w-px hx-v-devider" />
          <div className="inline-flex items-center gap-1 whitespace-nowrap" title={`RAM used ${memUsedGB.toFixed(1)} GB of ${memTotalGB.toFixed(1)} GB`}>
            RAM: {memUsedGB.toFixed(1)} / {memTotalGB.toFixed(1)} GB ({memPct.toFixed(0)}%)
          </div>
          <div className="h-3 w-px hx-v-devider" />
          <div className="inline-flex items-center gap-1 whitespace-nowrap" title={`CPU load1 ${stats.load1?.toFixed?.(2) || 0} on ${stats.cores} cores`}>
            CPU: {cpuPct.toFixed(0)}%
          </div>
          {stats.platform && (
            <>
              <div className="h-3 w-px" />
              <div className=" whitespace-nowrap">{stats.platform}</div>
            </>
          )}
          <div className="flex-1" />

          {/* Theme Selector */}
          <>
            <div className="h-3 w-px hx-v-devider" />
            <div className="flex items-center gap-2">
              <Monitor size={14} className="" />
              <select
                value={currentTheme}
                onChange={(e) => setCurrentTheme(e.target.value)}
                className="text-xs bg-transparent border-none outline-none cursor-pointer font-medium"
                title="Switch Color Theme"
              >
                {themes.map((t: Theme) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        </div>
      </div>
    </div>
  );
};

export default HAI3Core;
