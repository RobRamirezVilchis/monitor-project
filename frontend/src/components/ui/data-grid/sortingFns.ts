import { sortingFns as _sortingFns, SortingFn } from "@tanstack/react-table";
import { compareItems, RankingInfo } from "@tanstack/match-sorter-utils";

export const fuzzy: SortingFn<any> = (rowA, rowB, columnId) => {
  let dir = 0;

  // Only sort by rank if the column has ranking information
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId]! as RankingInfo,
      rowB.columnFiltersMeta[columnId]! as RankingInfo
    );
  }

  // Provide an alphanumeric fallback for when the item ranks are equal
  return dir === 0 ? _sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
}

export const sortingFns = {
  fuzzy,
}

export type SortingFnOption = keyof typeof sortingFns;
