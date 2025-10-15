import * as React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const base = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none px-3 py-1.5';

const variants: Record<ButtonVariant, string> = {
  primary: 'ui-primary hover:opacity-90',
  secondary: 'ui-secondary hover:opacity-90',
  outline: 'bg-transparent border ui-border hover:bg-black/5',
  destructive: 'ui-destructive hover:opacity-90',
  ghost: 'bg-transparent hover:bg-black/5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className = '', variant = 'primary', ...props },
  ref
) {
  return (
    <button ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
});
