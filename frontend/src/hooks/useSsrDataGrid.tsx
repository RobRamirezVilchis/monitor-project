import { UseCreatedQueryResult } from "@/api/helpers/createQuery";
import { FetchQueryOptions } from "@tanstack/react-query";
import { Prettify } from "@/utils/types";
import { ColumnFiltersState, PaginationState, SortingState } from "@tanstack/react-table";
import { useQueryState } from "./shared";
import { useEffect, useMemo, useState } from "react";
import { useImmer } from "use-immer";

export interface UseDataGridSsrOptions<
  Filters, 
  GlobalFilterName extends string = "search",
  PageName extends string = "page", 
  PageSizeName extends string = "page_size",
  SortingName extends string = "sort",

  Pagination = { [Key in PageName | PageSizeName]: number }
> {
  /**
   * The name of the query parameter that will be used to store the page number.
   * @default "page"
   */
  pageParamName?: PageName;
  /**
   * The name of the query parameter that will be used to store the page size.
   * @default "page_size"
   */
  pageSizeParamName?: PageSizeName;
  /**
   * The name of the query parameter that will be used to store the global filter.
   * @default "search"
   */
  globalFilterName?: GlobalFilterName;
  /**
   * The name of the query parameter that will be used to store the sorting.
   * @default "sort"
   */
  sortingParamName?: SortingName;

  /**
   * The default pagination values.
   * @default { page: 1, page_size: 25 }
   */
  defaultPagination?: Pagination;
  /**
   * The default global filter value.
   * @default ""
   */
  defaultGlobalFilter?: string;
  /**
   * The default filters values.
   * @default {}
   */
  defaultFilters?: Partial<Filters>;
  /**
   * The default sorting values.
   * @default []
   */
  defaultSorting?: SortingState;

  /** 
   * If true, empty values, such as empty strings, null, undefined, 
   * or empty arrays, will be removed from the returned query variables. 
   * */
  removeEmpty?: boolean;
}

/**
 * Hook used to manage data-grid pagination, sorting, and other filters in SSR.
 * @returns An object containing the current `state` of the data-grid filters,
 * the current `query variables` (this assumes that all filters are inside the same object), 
 * and the data-grid configuration boilerplate for the SSR data-grid.
 */
export const useSsrDataGrid = <
  Filters,
  GlobalFilterName extends string = "search",
  PageName extends string = "page", 
  PageSizeName extends string = "page_size",
  SortingName extends string = "sort",

  Pagination = { [Key in PageName | PageSizeName]: number },
  QueryVariables = Partial<Prettify<Pagination & Filters & { [Key in GlobalFilterName]: string; }>>
>(options?: UseDataGridSsrOptions<Filters, GlobalFilterName, PageName, PageSizeName, SortingName>) => {
  const {
    defaultPagination,
    defaultGlobalFilter = "",
    defaultFilters = {} as Filters,
    defaultSorting = [],

    removeEmpty = true,
    globalFilterName = "search" as GlobalFilterName,
    pageParamName = "page" as PageName,
    pageSizeParamName = "page_size" as PageSizeName,
    sortingParamName = "sort" as SortingName,
  } = options || {};

  const pagination = useQueryState({
    [pageParamName]: {
      defaultValue: defaultPagination?.[pageParamName] ?? 1,
      parse: (value) => parseInt(value),
      serialize: (value) => value.toString(),
    },
    [pageSizeParamName]: {
      defaultValue: defaultPagination?.[pageSizeParamName] ?? 25,
      parse: (value) => parseInt(value),
      serialize: (value) => value.toString(),
    },
  });
  const [sorting, setSorting] = useState<SortingState>(defaultSorting);
  const [globalFilter, setGlobalFilter] = useState<string>(defaultGlobalFilter);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [filters, setFilters] = useImmer<Partial<Filters>>(defaultFilters);

  const state = useMemo(() => ({
    pagination: {
      pageIndex: pagination.state[pageParamName] - 1,
      pageSize: pagination.state[pageSizeParamName],
    },
    globalFilter,
    columnFilters,
    sorting,
  }), [pagination.state, pageParamName, pageSizeParamName, globalFilter, columnFilters, sorting]);
  
  const queryVariables = useMemo(() => {
    const _queryVariables = {
      ...pagination.state,
      ...filters,
      [globalFilterName]: globalFilter,
      [sortingParamName]: sorting.map(x => `${x.desc ? "-" : ""}${x.id}`).join(","),
      ...columnFilters.reduce((acc, curr) => {
        acc[curr.id] = curr.value;
        return acc;
      }, {} as any),
    } as QueryVariables;
    
    if (removeEmpty) {
      for (const key in _queryVariables) {
        if (_queryVariables[key] === undefined 
            || _queryVariables[key] === null 
            || (_queryVariables[key] as any) === "" 
            || (_queryVariables[key] as any)?.length === 0
        ) {
          delete _queryVariables[key];
        }
      }
    }

    return _queryVariables;
  }, [pagination.state, filters, globalFilterName, globalFilter, sortingParamName, sorting, columnFilters, removeEmpty]);

  return {
    queryVariables,
    dataGridState: state,
    dataGridConfig: {
      enableSorting: true,
      manualSorting: true,
      onSortingChange: (value: any) => {
        const newValue = typeof value === "function" ? value(sorting) : value;
        setSorting(newValue);
      },
   
      enableFilters: true,
      enableGlobalFilter: true,
      manualFiltering: true,
      onGlobalFilterChange: (value: any) => {
        const newValue = typeof value === "function" ? value(globalFilter) : value;
        setGlobalFilter(newValue);
      },
      enableColumnFilters: true,
      onColumnFiltersChange: (values: any) => {
        const newValue = typeof values === "function" ? values(columnFilters) : values;
        setColumnFilters(newValue);
      },
  
      enablePagination: true,
      manualPagination: true,
      onPaginationChange: (value: any) => {
        const old: PaginationState = {
          pageIndex: pagination.state.page - 1,
          pageSize : pagination.state.page_size,
        };
        const newValue = typeof value === "function" ? value(old) : value;
        pagination.update({
          page: newValue.pageIndex + 1,
          page_size: newValue.pageSize,
        });
      },
    },
    updatePagination: pagination.update,
    updateFilters: setFilters,
    updateGlobalFilter: setGlobalFilter,
    updateSorting: setSorting,
  };
}

type Paginated = {
  pagination: any;
}

function isPaginated(obj: any): obj is Paginated {
  return !Array.isArray(obj) && !!obj.pagination && !!obj.data;
}

export interface UsePrefetchPaginatedAdjacentQueryParams<
  TQuery,
  TOptions = FetchQueryOptions<any, any, any, any>,
  PageName extends string = "page",
> {
  /**
   * The query to prefetch. Result of a call to `useQuery`.
   */
  query: TQuery,
  /**
   * The options to use when prefetching the query.
   */
  prefetchOptions?: TOptions,
  
  prefetchPages?: number,
  /**
   * The name of the query parameter that will be used to store the page number.
   * @default "page"
   */
  pageName?: PageName,
};

export function usePrefetchPaginatedAdjacentQuery<
  TQuery,
  TOptions = FetchQueryOptions<any, any, any, any>,
  PageName extends string = "page"
>({
  query,
  prefetchOptions: options,
  pageName = "page" as PageName,
}: UsePrefetchPaginatedAdjacentQueryParams<TQuery, TOptions, PageName>) {
  const _query = query as UseCreatedQueryResult<{ [Key in PageName]?: number }, any, any, any>;
  
  useEffect(() => {
    if (_query?.data && isPaginated(_query.data) && _query.data.pagination && !_query?.isPreviousData) {
      const paginationInfo = _query.data.pagination;
      if (paginationInfo[pageName] > 1) {
        _query.prefetch({
          ...options,
          variables: {
            [pageName]: paginationInfo[pageName] - 1,
          },
        } as any);
      }
      if (paginationInfo[pageName] < paginationInfo.pages) {
        _query.prefetch({
          ...options,
          variables: {
            [pageName]: paginationInfo[pageName] + 1,
          },
        } as any);
      }
    }
  }, [_query, _query.data, _query.isPreviousData, options, pageName]);
}
