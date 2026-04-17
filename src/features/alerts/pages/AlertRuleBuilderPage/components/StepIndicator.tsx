import { memo } from "react";

import { STEPS, type StepKey } from "../constants";

interface Props {
  step: StepKey;
  onSelect: (next: StepKey) => void;
}

function StepIndicatorComponent({ step, onSelect }: Props) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {STEPS.map((entry, index) => {
        const active = entry.key === step;
        return (
          <button
            key={entry.key}
            type="button"
            onClick={() => onSelect(entry.key)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
              active
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                : "border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
            }`}
          >
            <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px]">{index + 1}</span>
            {entry.label}
          </button>
        );
      })}
    </div>
  );
}

export const StepIndicator = memo(StepIndicatorComponent);
