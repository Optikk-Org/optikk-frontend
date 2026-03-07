import React, { useState, useRef, useCallback, useEffect } from 'react';

import { APP_COLORS } from '@config/colorLiterals';
import { 
  NODE_WIDTH, 
  NODE_HEIGHT, 
  STAGE_GAP_X, 
  PAD_LEFT, 
  truncate, 
  inferDomain, 
  nodeSeverity, 
  buildPath 
} from './utils/graphUtils';
import { useServiceGraphLayout } from './hooks/useServiceGraphLayout';
import './ServiceGraph.css';

/**
 * Interactive service dependency graph with force-directed layout and health status.
 */
export default function ServiceGraph({ nodes = [], edges = [], onNodeClick }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [hoveredEdge, setHoveredEdge] = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [expanded, setExpanded] = useState(false);

  const { 
    stageColumns, 
    positions, 
    contentWidth, 
    contentHeight, 
    incidentCount, 
    edges: graphEdges, 
    maxCalls 
  } = useServiceGraphLayout(nodes, edges);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setExpanded(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const zoomIn = () => setScale((prev) => Math.min(2.8, prev + 0.12));
  const zoomOut = () => setScale((prev) => Math.max(0.45, prev - 0.12));
  const resetView = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const toggleExpand = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;

    if (!document.fullscreenEnabled || !el.requestFullscreen) {
      setExpanded((prev) => !prev);
      return;
    }

    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen();
      } else if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
        await el.requestFullscreen();
      }
    } catch (_) {
      setExpanded((prev) => !prev);
    }
  }, []);

  const handleWheel = useCallback((event: any) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    event.preventDefault();
    setScale((prev) => Math.min(2.8, Math.max(0.45, prev + (event.deltaY > 0 ? -0.08 : 0.08))));
  }, []);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setTooltipPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });

    if (!dragging) return;
    const dx = (event.clientX - dragStart.x) / scale;
    const dy = (event.clientY - dragStart.y) / scale;
    setTranslate((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    setDragStart({ x: event.clientX, y: event.clientY });
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: event.clientX, y: event.clientY });
  };

  const handleMouseUp = () => setDragging(false);

  if (!nodes.length) {
    return <div className="service-graph-empty"><p>No services to display</p></div>;
  }

  return (
    <div ref={containerRef} className={`service-graph-container ${expanded ? 'expanded' : ''}`}>
      <div className="graph-toolbar graph-toolbar-left">
        <button className="graph-toolbar-btn" onClick={zoomOut} title="Zoom Out">-</button>
        <div className="graph-toolbar-zoom">{Math.round(scale * 100)}%</div>
        <button className="graph-toolbar-btn" onClick={zoomIn} title="Zoom In">+</button>
      </div>

      <div className="graph-toolbar graph-toolbar-right">
        <button className="graph-toolbar-btn ghost" onClick={resetView}>Reset View</button>
        <button className="graph-toolbar-btn" onClick={toggleExpand}>{expanded ? 'Exit Expand' : 'Expand'}</button>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${contentWidth} ${contentHeight}`}
        className="service-graph-svg"
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
      >
        <defs>
          <marker id="service-flow-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={APP_COLORS.hex_5a6275_2} />
          </marker>
          <marker id="service-flow-arrow-critical" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={APP_COLORS.hex_ff4d5a_2} />
          </marker>
          <filter id="critical-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.8" floodColor={APP_COLORS.hex_ff4d5a_2} floodOpacity="0.55" />
          </filter>
        </defs>

        <g transform={`translate(${translate.x}, ${translate.y}) scale(${scale})`}>
          <g className="stage-label-layer">
            {stageColumns.map((_: any, stageIndex: number) => {
              const xCenter = PAD_LEFT + stageIndex * STAGE_GAP_X + NODE_WIDTH / 2;
              return (
                <g key={`stage-${stageIndex}`}>
                  <rect x={xCenter - 46} y={28} width={92} height={24} rx={12} className="stage-pill" />
                  <text x={xCenter} y={44} textAnchor="middle" className="stage-pill-text">
                    {`STAGE ${stageIndex + 1}`}
                  </text>
                </g>
              );
            })}
          </g>

          <g className="edge-layer">
            {graphEdges.map((edge: any, index: number) => {
              const source = positions[edge.source];
              const target = positions[edge.target];
              if (!source || !target) return null;

              const startX = source.x + NODE_WIDTH;
              const startY = source.y + NODE_HEIGHT / 2;
              const endX = target.x;
              const endY = target.y + NODE_HEIGHT / 2;
              const isCritical = Number(edge.errorRate || 0) > 5;
              const width = 1.4 + (Number(edge.callCount || 0) / maxCalls) * 2 + (isCritical ? 1.1 : 0);

              return (
                <path
                  key={`${edge.source}-${edge.target}-${index}`}
                  d={buildPath(startX, startY, endX, endY)}
                  className={`service-flow-edge ${isCritical ? 'critical' : ''}`}
                  strokeWidth={width}
                  markerEnd={`url(#${isCritical ? 'service-flow-arrow-critical' : 'service-flow-arrow'})`}
                  filter={isCritical ? 'url(#critical-glow)' : undefined}
                  onMouseEnter={() => setHoveredEdge(edge)}
                  onMouseLeave={() => setHoveredEdge(null)}
                />
              );
            })}
          </g>

          <g className="node-layer">
            {(nodes as any[]).map((node) => {
              const pos = positions[node.name];
              if (!pos) return null;

              const severity = nodeSeverity(node);
              const domain = inferDomain(node.name);
              const alerts = incidentCount.get(node.name) || 0;
              const domainBadgeWidth = Math.max(54, domain.length * 7 + 12);

              return (
                <g
                  key={node.name}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className={`service-flow-node ${severity.key}`}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (onNodeClick) onNodeClick(node);
                  }}
                  style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
                >
                  <rect x="0" y="0" width={NODE_WIDTH} height={NODE_HEIGHT} rx="13" className="node-card" />
                  <rect x="0" y="10" width="4" height={NODE_HEIGHT - 20} rx="2" className="node-accent" />

                  <text x="16" y="27" className="node-title">{truncate(node.name, 30)}</text>

                  <circle cx="18" cy="48" r="4" fill={severity.color} />
                  <text x="29" y="52" className="node-severity" fill={severity.color}>{severity.label}</text>

                  <rect x="98" y="38" rx="6" width={domainBadgeWidth} height="18" className="node-domain-badge" />
                  <text x={106} y="51" className="node-domain-text">{domain}</text>

                  {alerts > 0 && (
                    <text x={NODE_WIDTH - 16} y="52" textAnchor="end" className="node-alert-text">
                      {`${alerts} ${alerts === 1 ? 'Alert' : 'Alerts'}`}
                    </text>
                  )}

                  <text x="16" y="76" className="node-metric-text">
                    {`Err ${Number(node.errorRate || 0).toFixed(2)}%`}
                  </text>
                  <text x={NODE_WIDTH - 16} y="76" textAnchor="end" className="node-metric-text muted">
                    {`${Number(node.avgLatency || 0).toFixed(0)}ms`}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {hoveredNode && (
        <div className="service-graph-tooltip" style={{ left: tooltipPos.x + 12, top: tooltipPos.y + 12 }}>
          <div className="tooltip-header">{hoveredNode.name}</div>
          <div className="tooltip-row"><span className="tooltip-label">Status</span><span className="tooltip-value">{hoveredNode.status || 'unknown'}</span></div>
          <div className="tooltip-row"><span className="tooltip-label">Requests</span><span className="tooltip-value">{Number(hoveredNode.requestCount || 0)}</span></div>
          <div className="tooltip-row"><span className="tooltip-label">Error Rate</span><span className="tooltip-value">{Number(hoveredNode.errorRate || 0).toFixed(2)}%</span></div>
          <div className="tooltip-row"><span className="tooltip-label">Latency</span><span className="tooltip-value">{Number(hoveredNode.avgLatency || 0).toFixed(0)}ms</span></div>
        </div>
      )}

      {hoveredEdge && !hoveredNode && (
        <div className="service-graph-tooltip" style={{ left: tooltipPos.x + 12, top: tooltipPos.y + 12 }}>
          <div className="tooltip-header">{`${hoveredEdge.source} -> ${hoveredEdge.target}`}</div>
          <div className="tooltip-row"><span className="tooltip-label">Calls</span><span className="tooltip-value">{Number(hoveredEdge.callCount || 0)}</span></div>
          <div className="tooltip-row"><span className="tooltip-label">Error Rate</span><span className="tooltip-value">{Number(hoveredEdge.errorRate || 0).toFixed(2)}%</span></div>
          <div className="tooltip-row"><span className="tooltip-label">Latency</span><span className="tooltip-value">{Number(hoveredEdge.avgLatency || 0).toFixed(0)}ms</span></div>
        </div>
      )}
    </div>
  );
}
