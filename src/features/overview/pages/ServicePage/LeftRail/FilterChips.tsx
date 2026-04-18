import { Badge } from "@shared/components/primitives/ui";

interface FilterChipsProps {
  readonly activeVersion: string | null;
  readonly environment: string | null;
}

export default function FilterChips({ activeVersion, environment }: FilterChipsProps) {
  if (!activeVersion && !environment) return null;

  return (
    <div className="flex flex-col gap-1">
      <div className="px-2 pb-1 text-[10px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
        Filters
      </div>
      <div className="flex flex-wrap gap-1 px-1">
        {activeVersion ? <Badge variant="info">{activeVersion}</Badge> : null}
        {environment ? <Badge variant="default">{environment}</Badge> : null}
      </div>
    </div>
  );
}
