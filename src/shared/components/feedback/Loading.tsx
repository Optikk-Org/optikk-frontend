import { Spin } from 'antd';

import type { LoadingProps } from './types';

export default function Loading({
  label = 'Loading...',
  size = 'default',
  fullscreen = false,
}: LoadingProps): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullscreen ? '100vh' : '160px',
        width: '100%',
      }}
    >
      <Spin size={size} tip={label} />
    </div>
  );
}
