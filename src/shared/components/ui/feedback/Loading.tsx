import type { LoadingProps } from './types';

export default function Loading({
  label = 'Loading...',
  fullscreen = false,
}: LoadingProps): JSX.Element {
  return (
    <div
      className="flex items-center justify-center w-full"
      style={{ minHeight: fullscreen ? '100vh' : '160px' }}
    >
      <div className="flex-col items-center gap-sm">
        <div className="ok-spinner" />
        {label && <span className="text-xs text-muted">{label}</span>}
      </div>
    </div>
  );
}
