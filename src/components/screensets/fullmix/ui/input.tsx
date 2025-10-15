import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = '', ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={`ui-input border rounded-md text-sm px-2 py-1 outline-none focus:ui-ring ${className}`}
      {...props}
    />
  );
});
