/**
 * cmdk hides CommandItems when their `value` does not match the search query.
 * Pinned options (e.g. "hotel not listed") must stay visible while filtering hotels.
 */
export function createComboboxFilter(
  alwaysVisibleOptionIds: readonly string[] = [],
) {
  const pinnedIds = new Set(alwaysVisibleOptionIds);

  return (value: string, search: string) => {
    for (const id of pinnedIds) {
      if (value.includes(id)) {
        return 1;
      }
    }

    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return 1;
    }

    return value.toLowerCase().includes(normalizedSearch) ? 1 : 0;
  };
}

export const CUSTOM_HOTEL_OPTION_ID = "__custom__";
