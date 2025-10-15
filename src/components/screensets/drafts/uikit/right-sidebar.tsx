import * as React from 'react';
import { cn } from '../../../../lib/utils';

export interface RightSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number | string; // e.g., 320 or '24rem'
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Right-aligned sidebar panel that respects UI themes via .hx-rsidebar.
 * Usage:
 * <RightSidebar header={<div>Title</div>}>Content</RightSidebar>
 */
export const RightSidebar: React.FC<RightSidebarProps> = ({
  className,
  width = 320,
  header,
  footer,
  children,
  ...props
}) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width
  };
  return (
    <aside
      className={cn(
        'hx-rsidebar flex flex-col shrink-0',
        // base spacing
        'h-full',
        className
      )}
      style={style}
      {...props}
    >
      {header && (
        <div className={cn('px-4 py-3 border-b', 'border-gray-200 dark:border-gray-700')}>
          {header}
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {children}
      </div>
      {footer && (
        <div className={cn('px-4 py-3 border-t', 'border-gray-200 dark:border-gray-700')}>
          {footer}
        </div>
      )}
    </aside>
  );
};

export default RightSidebar;
