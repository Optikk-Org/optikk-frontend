import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import DashboardPage from './DashboardPage';

const mockUsePageTabs = vi.fn();
const mockUseDashboardTabDocument = vi.fn();

vi.mock('@shared/hooks/usePageTabs', () => ({
  usePageTabs: (...args: unknown[]) => mockUsePageTabs(...args),
}));

vi.mock('@shared/hooks/useDashboardTabDocument', () => ({
  useDashboardTabDocument: (...args: unknown[]) => mockUseDashboardTabDocument(...args),
}));

vi.mock('@shared/components/ui/feedback', () => ({
  EmptyState: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock('@/components/ui', () => ({
  Tabs: ({
    activeKey,
    onChange,
    items,
  }: {
    activeKey: string;
    onChange: (next: string) => void;
    items: Array<{ key: string; label: string }>;
  }) => (
    <div>
      <div data-testid="active-tab">{activeKey}</div>
      {items.map((item) => (
        <button key={item.key} type="button" onClick={() => onChange(item.key)}>
          {item.label}
        </button>
      ))}
    </div>
  ),
  Skeleton: () => <div>loading</div>,
}));

vi.mock('./DashboardTabContent', () => ({
  default: ({ tab }: { tab: { id: string } }) => <div data-testid="tab-content">{tab.id}</div>,
}));

const tabs = [
  {
    id: 'resource-utilization',
    pageId: 'infrastructure',
    label: 'Resource Utilization',
    order: 10,
  },
  { id: 'jvm', pageId: 'infrastructure', label: 'JVM Runtime', order: 20 },
  { id: 'kubernetes', pageId: 'infrastructure', label: 'Kubernetes', order: 30 },
  { id: 'nodes', pageId: 'infrastructure', label: 'Nodes', order: 40 },
];

describe('DashboardPage', () => {
  it('honors the initial tab from the URL query parameter', () => {
    mockUsePageTabs.mockReturnValue({
      tabs,
      isLoading: false,
      error: null,
    });
    mockUseDashboardTabDocument.mockImplementation((_pageId: string, tabId: string) => ({
      tab: {
        id: tabId,
        pageId: 'infrastructure',
        label: tabId,
        order: 0,
        sections: [
          {
            id: 'summary',
            title: 'Summary',
            order: 10,
            collapsible: true,
            sectionTemplate: 'kpi-band',
          },
        ],
        panels: [
          {
            id: 'panel-1',
            panelType: 'stat-card',
            layoutVariant: 'kpi',
            sectionId: 'summary',
            order: 10,
            query: { endpoint: '/v1/test', method: 'GET' },
            layout: { x: 0, y: 0, w: 3, h: 3 },
            valueField: 'value',
          },
        ],
      },
      isLoading: false,
      error: null,
    }));

    render(
      <MemoryRouter initialEntries={['/infrastructure?tab=jvm']}>
        <DashboardPage pageId="infrastructure" />
      </MemoryRouter>
    );

    expect(screen.getByTestId('active-tab')).toHaveTextContent('jvm');
    expect(screen.getByTestId('tab-content')).toHaveTextContent('jvm');
    expect(mockUseDashboardTabDocument).toHaveBeenLastCalledWith('infrastructure', 'jvm');
  });

  it('switches to another infrastructure tab without losing the shared dashboard page state', async () => {
    const user = userEvent.setup();
    mockUsePageTabs.mockReturnValue({
      tabs,
      isLoading: false,
      error: null,
    });
    mockUseDashboardTabDocument.mockImplementation((_pageId: string, tabId: string) => ({
      tab: {
        id: tabId,
        pageId: 'infrastructure',
        label: tabId,
        order: 0,
        sections: [
          {
            id: 'summary',
            title: 'Summary',
            order: 10,
            collapsible: true,
            sectionTemplate: 'kpi-band',
          },
        ],
        panels: [
          {
            id: 'panel-1',
            panelType: 'stat-card',
            layoutVariant: 'kpi',
            sectionId: 'summary',
            order: 10,
            query: { endpoint: '/v1/test', method: 'GET' },
            layout: { x: 0, y: 0, w: 3, h: 3 },
            valueField: 'value',
          },
        ],
      },
      isLoading: false,
      error: null,
    }));

    render(
      <MemoryRouter initialEntries={['/infrastructure?tab=jvm']}>
        <DashboardPage pageId="infrastructure" />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Nodes' }));

    expect(screen.getByTestId('active-tab')).toHaveTextContent('nodes');
    expect(screen.getByTestId('tab-content')).toHaveTextContent('nodes');
    expect(mockUseDashboardTabDocument).toHaveBeenLastCalledWith('infrastructure', 'nodes');
  });
});
