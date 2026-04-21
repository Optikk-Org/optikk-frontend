import { useMemo } from "react";

import type { LogRecord } from "../../../types";
import { buildLogTableColumns } from "../logColumnDefs";

export function useLogsHubColumns(onSelectMessage: (row: LogRecord) => void) {
  return useMemo(() => buildLogTableColumns(onSelectMessage), [onSelectMessage]);
}
