import * as React from 'react';
import { cn } from '../../../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const base = 'hx-btn inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none';

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'hx-btn-primary',
  secondary: 'hx-btn-secondary',
  outline: 'hx-btn-outline',
  ghost: 'hx-btn-ghost',
  destructive: 'hx-btn-destructive'
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3',
  md: 'h-9 px-4',
  lg: 'h-10 px-5',
  icon: 'h-9 w-9'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button ref={ref} className={cn(base, variantClasses[variant], sizeClasses[size], className)} {...props} />
    );
  }
);
Button.displayName = 'Button';
