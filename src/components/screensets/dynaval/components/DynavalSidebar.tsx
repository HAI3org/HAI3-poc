import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { ProgramMenu } from './ProgramMenu';
import { DynamicProgramIcons, programConfigs } from './DynamicProgramIcons';
import { GridIcon } from './GridIcon';

interface DynavalSidebarProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  leftMenuCollapsed: boolean;
  showMenuTitles: boolean;
  onProgramSelect?: (programId: string) => void;
}

export const DynavalSidebar: React.FC<DynavalSidebarProps> = ({
  activeTab,
  setActiveTab,
  leftMenuCollapsed,
  showMenuTitles,
  onProgramSelect
}) => {
  const [installedPrograms, setInstalledPrograms] = useState<string[]>([]);
  const [showProgramMenu, setShowProgramMenu] = useState(false);

  // Load installed programs from localStorage on mount
  useEffect(() => {
    const loadInstalledPrograms = () => {
      const stored = localStorage.getItem('dynaval_installed_programs');
      if (stored) {
        try {
          setInstalledPrograms(JSON.parse(stored));
        } catch (error) {
          console.error('Failed to parse installed programs:', error);
        }
      } else {
        // Initialize with chat pre-installed by default
        const defaultPrograms = ['chat'];
        setInstalledPrograms(defaultPrograms);
        localStorage.setItem('dynaval_installed_programs', JSON.stringify(defaultPrograms));
      }
    };

    loadInstalledPrograms();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dynaval_installed_programs') {
        loadInstalledPrograms();
      }
    };

    const handleProgramUpdate = () => {
      loadInstalledPrograms();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('programsUpdated', handleProgramUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('programsUpdated', handleProgramUpdate);
    };
  }, []);

  const handleProgramInstall = (programId: string) => {
    setInstalledPrograms(prev => {
      if (!prev.includes(programId)) {
        const newPrograms = [...prev, programId];
        localStorage.setItem('dynaval_installed_programs', JSON.stringify(newPrograms));
        window.dispatchEvent(new CustomEvent('programsUpdated'));
        return newPrograms;
      }
      return prev;
    });
  };

  const handleProgramUninstall = (programId: string) => {
    setInstalledPrograms(prev => {
      const newPrograms = prev.filter(id => id !== programId);
      localStorage.setItem('dynaval_installed_programs', JSON.stringify(newPrograms));
      window.dispatchEvent(new CustomEvent('programsUpdated'));
      return newPrograms;
    });
  };

  const handleProgramMenuClick = () => {
    setShowProgramMenu(true);
  };

  const handleProgramSelect = (programId: string) => {
    setActiveTab(programId);
    if (onProgramSelect) {
      onProgramSelect(programId);
    }
  };

  const handleCloseModal = () => {
    setShowProgramMenu(false);
  };

  return (
    <>
      <div className="flex flex-col gap-1">
        {/* Program Menu Button */}
        <button
          onClick={handleProgramMenuClick}
          className={`flex items-center gap-3 rounded-lg transition-colors px-3 py-3 hx-left-menu-item ${
            leftMenuCollapsed ? 'w-11' : 'w-full'
          }`}
          title="Program Store"
        >
          <GridIcon size={20} className="flex-shrink-0" />
          {showMenuTitles && (
            <span className="text-sm ease-in-out truncate">Programs</span>
          )}
        </button>


        {/* Dynamic Program Icons */}
        <DynamicProgramIcons
          onProgramSelect={handleProgramSelect}
          selectedProgram={activeTab}
        />
      </div>

      {/* Program Menu Modal */}
      {showProgramMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setShowProgramMenu(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <ProgramMenu
              onProgramInstall={handleProgramInstall}
              onProgramUninstall={handleProgramUninstall}
              installedPrograms={installedPrograms}
              onClose={handleCloseModal}
            />
          </div>
        </>
      )}
    </>
  );
};

export default DynavalSidebar;
