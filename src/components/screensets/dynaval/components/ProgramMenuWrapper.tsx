import React, { useState, useEffect } from 'react';
import { ProgramMenu } from './ProgramMenu';

interface ProgramMenuWrapperProps {
  onClose?: () => void;
}

export const ProgramMenuWrapper: React.FC<ProgramMenuWrapperProps> = ({ onClose }) => {
  const [installedPrograms, setInstalledPrograms] = useState<string[]>([]);

  // Load installed programs from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('dynaval_installed_programs');
    if (stored) {
      try {
        setInstalledPrograms(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse installed programs:', error);
      }
    }
  }, []);

  // Save installed programs to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dynaval_installed_programs', JSON.stringify(installedPrograms));
  }, [installedPrograms]);

  const handleProgramInstall = (programId: string) => {
    setInstalledPrograms(prev => {
      if (!prev.includes(programId)) {
        const newPrograms = [...prev, programId];
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('programsUpdated'));
        return newPrograms;
      }
      return prev;
    });
  };

  const handleProgramUninstall = (programId: string) => {
    setInstalledPrograms(prev => {
      const newPrograms = prev.filter(id => id !== programId);
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('programsUpdated'));
      return newPrograms;
    });
  };

  return (
    <ProgramMenu
      onProgramInstall={handleProgramInstall}
      onProgramUninstall={handleProgramUninstall}
      installedPrograms={installedPrograms}
      onClose={onClose || (() => {})}
    />
  );
};

export default ProgramMenuWrapper;
