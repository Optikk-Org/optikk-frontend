import { useState } from "react";

import { Tabs } from "@/components/ui";
import {
  DemoKpiStrip,
  DemoLogsList,
  DemoServicesGrid,
  DemoTimeseriesChart,
  DemoTraceFlamegraph,
} from "@shared/demo";

export interface ProductDemoSection {
  readonly kind: "product-demo";
  readonly eyebrow?: string;
  readonly title: string;
  readonly body?: string;
}

type DemoTabId = "services" | "logs" | "traces";

const TAB_ITEMS = [
  { key: "services", label: "Services" },
  { key: "logs", label: "Logs" },
  { key: "traces", label: "Traces" },
] as const;

function ServicesPanel() {
  return (
    <div className="flex flex-col gap-4">
      <DemoKpiStrip />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
          <div className="mb-2 font-medium text-[13px] text-[var(--text-secondary)]">
            Requests per service
          </div>
          <DemoTimeseriesChart variant="requests" height={220} legend />
        </div>
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
          <div className="mb-2 font-medium text-[13px] text-[var(--text-secondary)]">
            P95 latency per service
          </div>
          <DemoTimeseriesChart variant="p95" height={220} legend />
        </div>
      </div>
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
        <div className="mb-3 font-medium text-[13px] text-[var(--text-secondary)]">
          Service health
        </div>
        <DemoServicesGrid />
      </div>
    </div>
  );
}

function LogsPanel() {
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <div className="font-medium text-[13px] text-[var(--text-secondary)]">
          Recent log lines
        </div>
        <span className="font-mono text-[11px] text-[var(--text-muted)]">
          service:* level:(ERROR OR WARN OR INFO)
        </span>
      </div>
      <DemoLogsList />
    </div>
  );
}

function TracesPanel() {
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
      <div className="mb-3 font-medium text-[13px] text-[var(--text-secondary)]">
        Flamegraph — critical path highlighted
      </div>
      <DemoTraceFlamegraph />
    </div>
  );
}

export function ProductDemo({ eyebrow, title, body }: ProductDemoSection) {
  const [active, setActive] = useState<DemoTabId>("services");

  return (
    <section className="marketing-section marketing-product-demo">
      <div className="marketing-product-demo-header">
        {eyebrow ? <div className="marketing-eyebrow">{eyebrow}</div> : null}
        <h2 className="marketing-h2">{title}</h2>
        {body ? <p className="marketing-body">{body}</p> : null}
      </div>
      <div className="marketing-product-demo-tabs">
        <Tabs
          activeKey={active}
          onChange={(k) => setActive(k as DemoTabId)}
          variant="page"
          size="md"
          items={TAB_ITEMS.map((t) => ({ key: t.key, label: t.label }))}
        />
      </div>
      <div className="marketing-product-demo-body">
        {active === "services" ? <ServicesPanel /> : null}
        {active === "logs" ? <LogsPanel /> : null}
        {active === "traces" ? <TracesPanel /> : null}
      </div>
      <div className="marketing-product-demo-footnote">
        Frozen snapshot — no live API calls from this page.
      </div>
    </section>
  );
}
