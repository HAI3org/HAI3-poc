import * as React from 'react';
import { cn } from '../../../../lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0 - 100
}

export const Progress: React.FC<ProgressProps> = ({ className, value = 0, ...props }) => {
  return (
    <div className={cn('hx-progress-track w-full h-2 rounded-full overflow-hidden', className)} {...props}>
      <div
        className="hx-progress-bar h-full transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
};
