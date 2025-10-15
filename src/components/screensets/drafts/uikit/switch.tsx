import * as React from 'react';
import { cn } from '../../../../lib/utils';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, checked, disabled, ...props }, ref) => {
    return (
      <label className={cn('hx-switch gap-2', disabled && 'opacity-60 cursor-not-allowed')}> 
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          aria-checked={!!checked}
          className="hx-switch-input"
          checked={!!checked}
          disabled={disabled}
          {...props}
        />
        <span className="hx-switch-track">
          <span className="hx-switch-thumb" />
        </span>
        {(label || description) && (
          <span className="flex flex-col leading-tight select-none">
            {label && <span className="text-sm">{label}</span>}
            {description && <span className="text-xs opacity-70">{description}</span>}
          </span>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch';
