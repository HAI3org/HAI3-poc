import * as React from 'react';
import { cn } from '../../../../lib/utils';

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
}
const TabsContext = React.createContext<TabsContextValue | null>(null);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (v: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue, value, onValueChange, className, children, ...props }) => {
  const [internal, setInternal] = React.useState(defaultValue);
  const current = value ?? internal;
  const setValue = (v: string) => {
    if (onValueChange) onValueChange(v);
    setInternal(v);
  };
  return (
    <TabsContext.Provider value={{ value: current, setValue }}>
      <div className={cn('', className)} {...props}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('hx-tabs-list inline-flex items-center rounded-lg p-1', className)} {...props} />
);

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ className, value, children, ...props }) => {
  const ctx = React.useContext(TabsContext);
  const active = ctx?.value === value;
  return (
    <button
      onClick={() => ctx?.setValue(value)}
      className={cn(
        'hx-tab px-4 py-2 rounded-md text-sm font-medium transition-colors',
        active ? 'hx-tab-active' : 'hx-tab-inactive',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ className, value, children, ...props }) => {
  const ctx = React.useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return (
    <div className={cn('mt-4', className)} {...props}>{children}</div>
  );
};
