import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { SERVICE_DETAIL_SECTIONS } from "../defaultLayout";
import FilterChips from "./FilterChips";
import SectionNav from "./SectionNav";
import ServiceSwitcher from "./ServiceSwitcher";
import { useRailCollapsed } from "./useRailCollapsed";

interface LeftRailProps {
  readonly serviceName: string;
  readonly activeVersion: string | null;
  readonly environment: string | null;
}

function CollapseButton({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? "Expand rail" : "Collapse rail"}
      className="flex items-center justify-center rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-1.5 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
    >
      <Icon size={14} />
    </button>
  );
}

export default function LeftRail({ serviceName, activeVersion, environment }: LeftRailProps) {
  const { collapsed, toggle } = useRailCollapsed();

  if (collapsed) {
    return (
      <aside className="flex w-10 shrink-0 items-start pt-2">
        <CollapseButton collapsed={collapsed} onToggle={toggle} />
      </aside>
    );
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col gap-4 border-[var(--border-color)] border-r pr-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-[13px] text-[var(--text-primary)]">Navigate</div>
        <CollapseButton collapsed={collapsed} onToggle={toggle} />
      </div>
      <SectionNav sections={SERVICE_DETAIL_SECTIONS} />
      <FilterChips activeVersion={activeVersion} environment={environment} />
      <ServiceSwitcher currentServiceName={serviceName} />
    </aside>
  );
}
