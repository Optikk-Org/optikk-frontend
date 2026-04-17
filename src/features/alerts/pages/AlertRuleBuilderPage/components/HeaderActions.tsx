import { Save, Send } from "lucide-react";
import { memo } from "react";

import { Button } from "@/components/ui";

interface Props {
  onReview: () => void;
  onSave: () => void;
}

function HeaderActionsComponent({ onReview, onSave }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" onClick={onReview}>
        <Send size={12} /> Review
      </Button>
      <Button variant="primary" size="sm" onClick={onSave}>
        <Save size={12} /> Save
      </Button>
    </div>
  );
}

export const HeaderActions = memo(HeaderActionsComponent);
