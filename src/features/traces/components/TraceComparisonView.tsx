import { Table } from 'antd';
import { Surface, Badge } from '@shared/design-system';
import { GitCompare, Clock, Layers, AlertCircle } from 'lucide-react';
import { TraceComparisonResult } from '../types';
import { formatDuration } from '@/shared/utils/formatters';

interface TraceComparisonViewProps {
  comparison: TraceComparisonResult;
}

export default function TraceComparisonView({ comparison }: TraceComparisonViewProps) {
  const diffColumns = [
    { title: 'Operation', dataIndex: 'operation', key: 'operation' },
    { title: 'Trace A', dataIndex: 'valueA', key: 'valueA' },
    { title: 'Trace B', dataIndex: 'valueB', key: 'valueB' },
    { 
      title: 'Diff', 
      dataIndex: 'diff', 
      key: 'diff',
      render: (val: number) => (
        <span style={{ color: val > 0 ? '#f04438' : '#73c991' }}>
          {val > 0 ? '+' : ''}{formatDuration(val)}
        </span>
      )
    },
  ];

  return (
    <div className="trace-comparison-view" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Surface className="glass-card" padding="lg">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 600 }}><GitCompare size={18} /> Trace Comparison</div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 24 }}>
          <div className="trace-compare-header">
            <Badge color="blue">Trace A: {comparison.traceA.slice(0, 8)}...</Badge>
          </div>
          <div className="trace-compare-header">
            <Badge color="purple">Trace B: {comparison.traceB.slice(0, 8)}...</Badge>
          </div>
        </div>

        {comparison.timingDifferences.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>No significant timing differences found</div>
        ) : (
          <Table
            dataSource={comparison.timingDifferences}
            columns={diffColumns}
            pagination={false}
            size="middle"
          />
        )}
      </Surface>

      <Surface className="glass-card" padding="lg">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 600 }}><Layers size={18} /> Structural Deviations</div>
        {comparison.structuralDifferences.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>Traces have identical structure</div>
        ) : (
          <div className="structural-diff-list">
            {comparison.structuralDifferences.map((diff, i) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--glass-border)' }}>
                <AlertCircle size={14} style={{ marginRight: 8, color: 'var(--warning-color)' }} />
                {diff.message}
              </div>
            ))}
          </div>
        )}
      </Surface>
    </div>
  );
}
