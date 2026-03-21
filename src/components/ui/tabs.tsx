import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/lib/utils';

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export interface TabsProps {
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'large';
  variant?: 'page' | 'compact';
  items: TabItem[];
  tabBarStyle?: React.CSSProperties;
}

const sizeClasses: Record<NonNullable<TabsProps['size']>, string> = {
  sm: 'text-[12px] px-2.5 py-1.5',
  md: 'text-[13px] px-3 py-2',
  lg: 'text-[14px] px-4 py-2.5',
  large: 'text-[14px] px-4 py-2.5',
};

const variantClasses: Record<
  NonNullable<TabsProps['variant']>,
  {
    list: string;
    item: string;
    active: string;
    inactive: string;
  }
> = {
  page: {
    list: 'flex gap-1 overflow-x-auto border-b border-[rgba(255,255,255,0.08)]',
    item:
      'relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-t-[14px] border border-transparent border-b-0 font-medium transition-all focus-visible:outline-none',
    active:
      'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text-primary)] shadow-[0_-12px_32px_rgba(0,0,0,0.14)]',
    inactive:
      'text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--text-primary)]',
  },
  compact: {
    list: 'flex gap-0.5 border-b border-[rgba(255,255,255,0.08)]',
    item:
      'relative inline-flex items-center gap-1.5 whitespace-nowrap font-medium transition-colors focus-visible:outline-none',
    active: 'text-[var(--color-primary)]',
    inactive: 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
  },
};

function Tabs({
  activeKey,
  onChange,
  className,
  size = 'md',
  variant = 'page',
  items,
  tabBarStyle,
}: TabsProps) {
  const config = variantClasses[variant];

  return (
    <TabsPrimitive.Root value={activeKey} onValueChange={onChange}>
      <TabsPrimitive.List
        className={cn(config.list, className)}
        style={tabBarStyle}
      >
        {items.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <TabsPrimitive.Trigger
              key={item.key}
              value={item.key}
              className={cn(
                config.item,
                sizeClasses[size],
                isActive ? config.active : config.inactive,
              )}
            >
              {item.icon}
              {item.label}
              {isActive && variant === 'compact' ? (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-primary)]" />
              ) : null}
            </TabsPrimitive.Trigger>
          );
        })}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}

export { Tabs };
