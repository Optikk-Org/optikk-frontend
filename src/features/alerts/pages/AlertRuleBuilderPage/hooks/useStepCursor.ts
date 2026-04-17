import { useCallback, useMemo, useState } from "react";

import { STEPS, type StepKey } from "../constants";

export function useStepCursor() {
  const [step, setStep] = useState<StepKey>("type");
  const currentStepIndex = useMemo(
    () => STEPS.findIndex((entry) => entry.key === step),
    [step]
  );
  const moveStep = useCallback((direction: -1 | 1) => {
    setStep((prev) => {
      const idx = STEPS.findIndex((entry) => entry.key === prev);
      const nextIndex = Math.min(STEPS.length - 1, Math.max(0, idx + direction));
      return STEPS[nextIndex]?.key ?? "type";
    });
  }, []);
  return { step, setStep, currentStepIndex, moveStep };
}
