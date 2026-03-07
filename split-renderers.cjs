const fs = require('fs');

const srcFile = 'src/components/ui/dashboard/SpecializedRendererRegistry.tsx';
const content = fs.readFileSync(srcFile, 'utf-8');

const IMPORTS = `import { APP_COLORS } from '@config/colorLiterals';
import { Empty, Table } from 'antd';
import { useMemo } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

import LatencyHistogram from '@components/charts/distributions/LatencyHistogram';
import LogHistogram from '@components/charts/distributions/LogHistogram';
import GaugeChart from '@components/charts/micro/GaugeChart';
import ServiceGraph from '@components/charts/specialized/ServiceGraph';
import LatencyHeatmapChart from '@components/charts/specialized/LatencyHeatmapChart';
import WaterfallChart from '@components/charts/specialized/WaterfallChart';

import {
  createBarDataset,
  createChartOptions,
  createLineDataset,
  getChartColor,
} from '@utils/chartHelpers';
import type {
  DashboardComponentSpec,
  DashboardDataSources,
  DashboardExtraContext,
} from '@/types/dashboardConfig';
import { useDashboardData } from '../hooks/useDashboardData';
import { buildAiTimeseries, resolveDataSourceId } from '../utils/dashboardUtils';
`;

const renderers = [
  'LogHistogramRenderer', 'LatencyHistogramRenderer', 'LatencyHeatmapRenderer',
  'AiLineRenderer', 'AiBarRenderer', 'TableRenderer', 'BarRenderer',
  'PieRenderer', 'AreaRenderer', 'GaugeRenderer', 'ScorecardRenderer',
  'HeatmapRenderer', 'ServiceMapRenderer', 'TraceWaterfallRenderer'
];

let components = {};

for (const comp of renderers) {
  const exportStr = `export function ${comp}(`;
  let startIndex = content.indexOf(`export function ${comp}(`);
  if (startIndex === -1) { // try checking with multiline params
      startIndex = content.indexOf(`export function ${comp}`);
  }
  if (startIndex === -1) {
    console.log(`Could not find ${comp}`);
    continue;
  }
  
  let braceCount = 0;
  let inString = false;
  let stringChar = '';
  let inBody = false;
  let endIndex = -1;
  
  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];
    
    if (!inString && (char === '"' || char === "'" || char === "\`")) {
      inString = true;
      stringChar = char;
    } else if (inString && char === stringChar && content[i-1] !== '\\') {
      inString = false;
    } else if (!inString) {
      if (char === '{') {
        inBody = true;
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (inBody && braceCount === 0) {
          endIndex = i + 1;
          break;
        }
      }
    }
  }
  
  if (endIndex !== -1) {
    let code = content.substring(startIndex, endIndex);
    
    // Check which variable names are used in the original code before replacement
    const hasRows = code.includes('const rows =');
    const hasTraces = code.includes('const traces =');
    const hasSpans = code.includes('const spans =');
    const hasData = /const data\s*=/.test(code);
    
    let destAlias = '';
    if (hasData) { destAlias = ''; }
    else if (hasRows) { destAlias = ': rows'; }
    else if (hasTraces) { destAlias = ': traces'; }
    else if (hasSpans) { destAlias = ': spans'; }

    const replacement = `const { rawData, data\${destAlias} } = useDashboardData(chartConfig, dataSources);`;

    code = code.replace(/const rawData = dataSources\?\.\[resolveDataSourceId\(chartConfig\)\];\s*const (?:data|rows|traces|spans) = useMemo\(\(\) => \{\s*const key = chartConfig\.dataKey;\s*const arr = key \? rawData\?\.\[key\] : rawData;\s*return Array\.isArray\(arr\) \? arr : \[\];\s*\}, \[rawData, chartConfig\.dataKey\]\);/g, replacement);
    code = code.replace(/const rawData = dataSources\?\.\[resolveDataSourceId\(chartConfig\)\];\s*const (?:rows|spans|traces) = useMemo\(\(\) => Array\.isArray\(rawData\) \? rawData : \[\], \[rawData\]\);/g, replacement);
    code = code.replace(/const rawData = dataSources\?\.\[resolveDataSourceId\(chartConfig\)\];/g, `const { rawData } = useDashboardData(chartConfig, dataSources);`);
        
    components[comp] = code;
  }
}

fs.mkdirSync('src/components/ui/dashboard/renderers', { recursive: true });

Object.entries(components).forEach(([name, code]) => {
  const fileContent = `${IMPORTS}\n${code}\n`;
  fs.writeFileSync(`src/components/ui/dashboard/renderers/${name}.tsx`, fileContent);
});

console.log('Files generated successfully.');
