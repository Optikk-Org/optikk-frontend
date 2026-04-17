export function LabeledRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
        {label}
      </span>
      {children}
    </label>
  );
}
