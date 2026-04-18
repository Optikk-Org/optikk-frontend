import type { ServiceSectionSpec } from "../defaultLayout";
import { useActiveSection } from "./useActiveSection";

interface SectionNavProps {
  readonly sections: readonly ServiceSectionSpec[];
}

function scrollTo(id: string): void {
  const element = document.getElementById(id);
  if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function SectionNav({ sections }: SectionNavProps) {
  const activeId = useActiveSection(sections.map((s) => s.id));

  return (
    <nav className="flex flex-col gap-1">
      <div className="px-2 pb-1 text-[10px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
        Sections
      </div>
      {sections.map((section) => {
        const active = section.id === activeId;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollTo(section.id)}
            className={`rounded-[var(--card-radius)] px-2 py-1.5 text-left text-[12px] transition-colors ${
              active
                ? "bg-[var(--bg-hover)] font-medium text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            }`}
          >
            {section.label}
          </button>
        );
      })}
    </nav>
  );
}
