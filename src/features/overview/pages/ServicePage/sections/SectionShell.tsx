import type { ReactNode } from "react";

import { PageSurface } from "@shared/components/ui";

interface SectionShellProps {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
}

export default function SectionShell({
  id,
  title,
  description,
  actions,
  children,
}: SectionShellProps) {
  return (
    <PageSurface id={id} padding="lg" className="scroll-mt-24">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="m-0 font-semibold text-[15px] text-[var(--text-primary)] tracking-tight">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 max-w-3xl text-[12px] text-[var(--text-muted)] leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </PageSurface>
  );
}
