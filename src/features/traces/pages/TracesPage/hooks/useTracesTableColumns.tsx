import { useMemo } from "react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";

import { buildTraceTableColumns } from "../traceColumnDefs";

export function useTracesTableColumns(
  selectedTraceIdsRef: MutableRefObject<string[]>,
  setSelectedTraceIds: Dispatch<SetStateAction<string[]>>
) {
  return useMemo(
    () => buildTraceTableColumns(selectedTraceIdsRef, setSelectedTraceIds),
    [selectedTraceIdsRef, setSelectedTraceIds]
  );
}
