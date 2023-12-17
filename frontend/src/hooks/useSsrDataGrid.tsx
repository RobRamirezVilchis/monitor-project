import { QueryOptions, UseCreatedQuery, UseCreatedQueryResult, createQuery } from "@/api/helpers/createQuery";
// import { OptionallyPaginated, Paginated, isPaginated } from "@/api/types";
import { FetchQueryOptions, QueryKey } from "@tanstack/react-query";
import { Prettify } from "@/utils/types";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { useQueryState } from "./shared";
import { useEffect, useMemo, useState } from "react";
import { useImmer } from "use-immer";

export interface UseDataGridSsrFiltersOptions<
  Filters, 
  GlobalFilterName extends string = "search",
  PageName extends string = "page", 
  PageSizeName extends string = "page_size",
  SortingName extends string = "sort",

  Pagination = { [Key in PageName | PageSizeName]: number }
> {
  pageParamName?: PageName;
  pageSizeParamName?: PageSizeName;
  globalFilterName?: GlobalFilterName;
  sortingParamName?: SortingName;

  defaultPagination?: Pagination;
  defaultGlobalFilter?: string;
  defaultFilters?: Partial<Filters>;
  defaultSorting?: SortingState;

  /** 
   * If true, empty values, such as empty strings, null, undefined, 
   * or empty arrays, will be removed from the query variables. 
   * */
  removeEmpty?: boolean;
}

export const useDataGridSsrFilters = <
  Filters,
  GlobalFilterName extends string = "search",
  PageName extends string = "page", 
  PageSizeName extends string = "page_size",
  SortingName extends string = "sort",

  Pagination = { [Key in PageName | PageSizeName]: number },
  QueryVariables = Partial<Prettify<Pagination & Filters & { [Key in GlobalFilterName]: string; }>>
>({
  defaultPagination,
  defaultFilters = {} as Filters,
  defaultSorting = [],
  removeEmpty = true,
  globalFilterName = "search" as GlobalFilterName,
  pageParamName = "page" as PageName,
  pageSizeParamName = "page_size" as PageSizeName,
  sortingParamName = "sort" as SortingName,
}: UseDataGridSsrFiltersOptions<Filters, GlobalFilterName, PageName, PageSizeName, SortingName>) => {
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
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [filters, setFilters] = useImmer<Partial<Filters>>(defaultFilters);

  const state = useMemo(() => ({
    pagination: {
      pageIndex: pagination.state[pageParamName] - 1,
      pageSize: pagination.state[pageSizeParamName],
    },
    globalFilter,
    sorting,
  }), [pagination.state, pageParamName, pageSizeParamName, globalFilter, sorting]);
  
  const queryVariables = useMemo(() => {
    const _queryVariables = {
      ...pagination.state,
      ...filters,
      [globalFilterName]: globalFilter,
      [sortingParamName]: sorting.map(x => `${x.desc ? "-" : ""}${x.id}`).join(","),
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
  }, [pagination.state, filters, globalFilterName, globalFilter, sortingParamName, sorting, removeEmpty]);

  return {
    state,
    queryVariables,
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
  query: TQuery,
  options?: TOptions,
  pageName?: PageName,
};

export function usePrefetchPaginatedAdjacentQuery<
  TQuery,
  TOptions = FetchQueryOptions<any, any, any, any>,
  PageName extends string = "page"
>({
  query,
  options,
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
