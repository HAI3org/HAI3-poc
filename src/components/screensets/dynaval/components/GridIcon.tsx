import React from 'react';

interface GridIconProps {
  size?: number;
  className?: string;
}

export const GridIcon: React.FC<GridIconProps> = ({ size = 20, className = '' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      {/* Top-left square */}
      <rect x="3" y="3" width="8" height="8" rx="2" />
      {/* Top-right square */}
      <rect x="13" y="3" width="8" height="8" rx="2" />
      {/* Bottom-left square */}
      <rect x="3" y="13" width="8" height="8" rx="2" />
      {/* Bottom-right circle */}
      <circle cx="17" cy="17" r="4" />
    </svg>
  );
};

export default GridIcon;
