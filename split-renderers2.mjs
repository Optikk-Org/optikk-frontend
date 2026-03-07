import ts from 'typescript';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcFile = path.join(__dirname, 'src/components/ui/dashboard/SpecializedRendererRegistry.tsx');
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

const sourceFile = ts.createSourceFile(
  'SpecializedRendererRegistry.tsx',
  content,
  ts.ScriptTarget.Latest,
  true
);

let components = {};

function visit(node) {
  if (ts.isFunctionDeclaration(node) && node.name) {
    const name = node.name.getText(sourceFile);
    if (renderers.includes(name)) {
      let code = node.getText(sourceFile);
      
      const hasRows = code.includes('const rows =');
      const hasTraces = code.includes('const traces =');
      const hasSpans = code.includes('const spans =');
      const hasData = /const data\s*=/.test(code);
      
      let destAlias = '';
      if (hasData) { destAlias = ''; }
      else if (hasRows) { destAlias = ': rows'; }
      else if (hasTraces) { destAlias = ': traces'; }
      else if (hasSpans) { destAlias = ': spans'; }

      const replacement = `const { rawData, data${destAlias} } = useDashboardData(chartConfig, dataSources);`;

      code = code.replace(/const rawData = dataSources\?\.\[resolveDataSourceId\(chartConfig\)\];\s*const (?:data|rows|traces|spans) = useMemo\(\(\) => \{\s*const key = chartConfig\.dataKey;\s*const arr = key \? rawData\?\.\[key\] : rawData;\s*return Array\.isArray\(arr\) \? arr : \[\];\s*\}, \[rawData, chartConfig\.dataKey\]\);/g, replacement);
      code = code.replace(/const rawData = dataSources\?\.\[resolveDataSourceId\(chartConfig\)\];\s*const (?:rows|spans|traces) = useMemo\(\(\) => Array\.isArray\(rawData\) \? rawData : \[\], \[rawData\]\);/g, replacement);
      code = code.replace(/const rawData = dataSources\?\.\[resolveDataSourceId\(chartConfig\)\];/g, `const { rawData } = useDashboardData(chartConfig, dataSources);`);
      
      // Ensure 'export ' is present if it's not starting with 'export '
      if (!code.startsWith('export ')) {
        code = 'export ' + code;
      }
      
      components[name] = code;
    }
  }
  ts.forEachChild(node, visit);
}

visit(sourceFile);

fs.mkdirSync(path.join(__dirname, 'src/components/ui/dashboard/renderers'), { recursive: true });

Object.entries(components).forEach(([name, code]) => {
  const fileContent = `${IMPORTS}\n${code}\n`;
  fs.writeFileSync(path.join(__dirname, `src/components/ui/dashboard/renderers/${name}.tsx`), fileContent);
});

console.log('Files generated successfully.');
