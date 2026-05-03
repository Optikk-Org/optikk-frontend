import { getById } from "./traceByIdApi";
import { query } from "./tracesQueryApi";

export const tracesExplorerApi = { query, getById };
export type { TracesQueryResponse } from "../types/trace";
