import * as React from 'react';

export type BadgeVariant = 'default' | 'secondary' | 'accent' | 'destructive' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: 'ui-primary',
  secondary: 'ui-secondary',
  accent: 'ui-accent',
  destructive: 'ui-destructive',
  outline: 'bg-transparent border ui-border',
};

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps): React.ReactElement {
  return (
    <span className={`inline-flex items-center rounded-full text-xs px-2 py-0.5 ${variants[variant]} ${className}`} {...props} />
  );
}
