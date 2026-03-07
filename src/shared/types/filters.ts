/**
 *
 */
export type FilterValue = string | number | boolean | readonly string[] | null | undefined;

/**
 *
 */
export type QueryFilters = Record<string, FilterValue>;
