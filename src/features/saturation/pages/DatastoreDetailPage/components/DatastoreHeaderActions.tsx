import { memo } from "react";

import { Badge, Button } from "@shared/components/primitives/ui";

function categoryBadgeVariant(category: string): "info" | "warning" {
  return category === "redis" ? "warning" : "info";
}

interface Props {
  category: string;
  onOpen: (target: "logs" | "traces") => void;
}

function DatastoreHeaderActionsComponent({ category, onOpen }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={categoryBadgeVariant(category)}>{category}</Badge>
      <Button size="sm" variant="secondary" onClick={() => onOpen("logs")}>
        Logs
      </Button>
      <Button size="sm" variant="secondary" onClick={() => onOpen("traces")}>
        Traces
      </Button>
    </div>
  );
}

export const DatastoreHeaderActions = memo(DatastoreHeaderActionsComponent);
