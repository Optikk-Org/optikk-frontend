import { Card, type CardProps } from '@/components/ui';
import { cn } from '@/lib/utils';

interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PageShell({
  className,
  children,
  ...props
}: PageShellProps): JSX.Element {
  return (
    <div className={cn('flex flex-col gap-4 px-1 pb-6', className)} {...props}>
      {children}
    </div>
  );
}

export interface PageSurfaceProps extends CardProps {}

export function PageSurface({
  className,
  elevation = 1,
  padding = 'lg',
  children,
  ...props
}: PageSurfaceProps): JSX.Element {
  return (
    <Card
      elevation={elevation}
      padding={padding}
      className={cn(
        'border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(16,20,31,0.98),rgba(8,11,18,0.94))] shadow-[0_24px_64px_rgba(0,0,0,0.28)]',
        className,
      )}
      {...props}
    >
      {children}
    </Card>
  );
}
