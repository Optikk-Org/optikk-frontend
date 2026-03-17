import { Row, Col, Card, Empty, Table, Tag } from 'antd';
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
    <div className="trace-comparison-view">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><GitCompare size={18} /> Trace Comparison</div>}
            className="glass-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 24 }}>
              <div className="trace-compare-header">
                <Tag color="blue">Trace A: {comparison.traceA.slice(0, 8)}...</Tag>
              </div>
              <div className="trace-compare-header">
                <Tag color="purple">Trace B: {comparison.traceB.slice(0, 8)}...</Tag>
              </div>
            </div>

            {comparison.timingDifferences.length === 0 ? (
              <Empty description="No significant timing differences found" />
            ) : (
              <Table 
                dataSource={comparison.timingDifferences} 
                columns={diffColumns} 
                pagination={false}
                size="middle"
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card 
            title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Layers size={18} /> Structural Deviations</div>}
            className="glass-card"
          >
            {comparison.structuralDifferences.length === 0 ? (
              <Empty description="Traces have identical structure" />
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
          </Card>
        </Col>
      </Row>
    </div>
  );
}
