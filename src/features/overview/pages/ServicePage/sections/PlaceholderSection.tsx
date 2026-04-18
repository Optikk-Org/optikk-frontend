import SectionShell from "./SectionShell";

interface PlaceholderSectionProps {
  readonly id: string;
  readonly title: string;
  readonly hint?: string;
}

export default function PlaceholderSection({ id, title, hint }: PlaceholderSectionProps) {
  return (
    <SectionShell id={id} title={title}>
      <div className="text-[12px] text-[var(--text-muted)]">
        {hint ?? "Panels for this section land in a later phase."}
      </div>
    </SectionShell>
  );
}
