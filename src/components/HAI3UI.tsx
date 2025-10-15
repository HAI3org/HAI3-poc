import React, { useState } from 'react';
import HAI3Core from './common/HAI3Core';
import { getScreenset, getScreensetScreen, getScreensetDefaultTab, Screenset } from './screensetConfig';

const HAI3UI: React.FC = () => {
  // Screenset system state
  const [currentScreenset, setCurrentScreenset] = useState<string>('_baseline');
  const screenset: Screenset = getScreenset(currentScreenset);

  // Active tab state - use screenset's default tab
  const [activeTab, setActiveTab] = useState<string>(getScreensetDefaultTab(currentScreenset));

  const [benchPrefillModelName, setBenchPrefillModelName] = useState<string | null>(null);

  // Handle screenset switching
  const handleScreensetChange = (newScreensetId: string): void => {
    setCurrentScreenset(newScreensetId);
    setActiveTab(getScreensetDefaultTab(newScreensetId));
  };

  // Handle tab switching - ensure chat shows latest conversation
  const handleTabChange = (newTab: string): void => {
    setActiveTab(newTab);
    // Chat screens now automatically load latest chat on mount
  };

  // Render the appropriate screen based on activeTab and current screenset
  const renderScreen = (): React.ReactElement => {
    const ScreenComponent = getScreensetScreen(currentScreenset, activeTab);

    if (!ScreenComponent) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-gray-500">
            <h2 className="text-xl font-semibold mb-2">Screen not found</h2>
            <p>The screen "{activeTab}" is not available in the "{screenset.name}" screenset.</p>
          </div>
        </div>
      );
    }

    // Handle special props for specific screens
    const getScreenProps = (): any => {
      const baseProps: any = {
        onScreensetChange: handleScreensetChange
      };

      // Models screen props
      if (activeTab === 'models') {
        return {
          ...baseProps,
          onBenchmarkModel: (modelName: string) => {
            setBenchPrefillModelName(modelName);
            setActiveTab('benchmarks');
          }
        };
      }

      // Benchmarks screen props
      if (activeTab === 'benchmarks') {
        return {
          ...baseProps,
          prefillModelName: benchPrefillModelName,
          onPrefillConsumed: () => setBenchPrefillModelName(null)
        };
      }

      // Audit screen props
      if (activeTab === 'audit') {
        return {
          ...baseProps,
          setActiveTab
        };
      }

      return baseProps;
    };

    return <ScreenComponent {...getScreenProps()} />;
  };

  return (
    <HAI3Core
      screenType={activeTab}
      controlledActiveTab={activeTab}
      onActiveTabChange={handleTabChange}
      currentScreenset={currentScreenset}
      onScreensetChange={handleScreensetChange}
    >
      {renderScreen()}
    </HAI3Core>
  );
};

export default HAI3UI;
