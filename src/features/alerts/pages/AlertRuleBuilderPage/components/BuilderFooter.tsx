import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo } from "react";

import { Button } from "@/components/ui";

import { STEPS } from "../constants";

interface Props {
  currentStepIndex: number;
  onMove: (direction: -1 | 1) => void;
}

function BuilderFooterComponent({ currentStepIndex, onMove }: Props) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <Button
        variant="secondary"
        size="sm"
        disabled={currentStepIndex === 0}
        onClick={() => onMove(-1)}
      >
        <ChevronLeft size={12} /> Back
      </Button>
      <Button
        variant="primary"
        size="sm"
        disabled={currentStepIndex === STEPS.length - 1}
        onClick={() => onMove(1)}
      >
        Next <ChevronRight size={12} />
      </Button>
    </div>
  );
}

export const BuilderFooter = memo(BuilderFooterComponent);
