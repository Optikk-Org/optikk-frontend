import { Skeleton as AntdSkeleton } from 'antd';

import type { FeedbackSkeletonProps } from './types';

export default function Skeleton({
  rows = 3,
  active = true,
}: FeedbackSkeletonProps): JSX.Element {
  return <AntdSkeleton active={active} paragraph={{ rows }} />;
}
