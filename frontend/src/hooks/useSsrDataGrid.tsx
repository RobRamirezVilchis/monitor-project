import { ColumnFiltersState, PaginationState, SortingState, Updater } from "@tanstack/react-table";
import { FetchQueryOptions } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useImmer } from "use-immer";

import { QueryParam, QueryParams, QueryStateOptions, useQueryState } from "./shared";
import { Prettify } from "@/utils/types";
import { UseCreatedQueryResult } from "@/api/helpers/createQuery";

export interface UseDataGridSsrOptions<
  ColumnFilters extends Record<string, any>,

  GlobalFilterName extends string = "search",
  PageName extends string = "page", 
  PageSizeName extends string = "page_size",
  SortingName extends string = "sort",

  Pagination = { [Key in PageName | PageSizeName]: number },
  State = Prettify<Pagination & { [Key in GlobalFilterName]: string } & ColumnFilters & { [Key in SortingName]: string }>,
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
   * @default { [pageParamName]: 1, [pageSizeParamName]: 25 }
   */
  defaultPagination?: Pagination;
  /**
   * The default sorting values.
   * @default []
   */
  defaultSorting?: string[];
  /**
   * The default global filter value.
   * @default ""
   */
  defaultGlobalFilter?: string;
  /**
   * The default column filters values.
   * Note: This cannot be used with the `columnFiltersInUrl` property,
   * if both are given at the same time, `defaultColumnFilters` will be ignored and 
   * the ColumnFilters type will complain as `defaultColumnFilters` takes 
   * precedence over `columnFiltersInUrl`.
   * @default {}
   */
  defaultColumnFilters?: ColumnFilters;

  /** 
   * If true, empty values, such as empty strings, null, undefined, 
   * or empty arrays, will be removed from the returned query variables. 
   * */
  removeEmpty?: boolean;

  /**
   * If true, the pagination will be stored in the url.
   * @default true
   */
  paginationInUrl?: boolean;
  /**
   * If true, the sorting will be stored in the url.
   * @default true
   */
    sortingInUrl?: boolean;
  /**
   * If true, the global filter will be stored in the url.
   * @default true
   */
  globalFilterInUrl?: boolean;
  /**
   * If an object is given, the column filters will be stored in the url.
   * 
   * Note: Using this property will make the `defaultColumnFilters` property to be ignored,
   * if both are given at the same time, the ColumnFilters type will complain 
   * as `defaultColumnFilters` takes precedence over `columnFiltersInUrl`.
   * @default false
   */
  columnFiltersInUrl?: ReducedQueryParams<ColumnFilters>; 

  /** Options passed to all the properties stored in the url with useQueryState */
  queryStateOptions?: QueryStateOptions;

  /** Transform functions to be applied to the `state` before creating the `queryVariables` */
  transform?: {
    [Key in keyof State]?: (value: State[Key]) => any;
  };
}

export type ReducedQueryParams<T> = {
  [Key in keyof T]?: QueryParam<T[Key]>;
};

export type DataGridState = {
  pagination: PaginationState;
  sorting: SortingState;
  globalFilter: string;
  columnFilters: ColumnFiltersState;
};

/**
 * Hook used to manage data-grid pagination, sorting, and other filters in SSR.
 * @returns An object containing the current `state` of the data-grid filters,
 * the current `query variables` (this assumes that all filters are inside the same object), 
 * and the data-grid configuration boilerplate for the SSR data-grid.
 */
export const useSsrDataGrid = <
  ColumnFilters extends Record<string, any>,

  GlobalFilterName extends string = "search",
  PageName extends string = "page",
  PageSizeName extends string = "page_size",
  SortingName extends string = "sort",

  Pagination = { [Key in PageName | PageSizeName]: number },
  State = Prettify<Pagination & { [Key in GlobalFilterName]: string } & ColumnFilters & { [Key in SortingName]: string }>,
  QueryVariables = { [Key in keyof State]?: any },
>(options?: UseDataGridSsrOptions<ColumnFilters, GlobalFilterName, PageName, PageSizeName, SortingName, Pagination, State>) => {
  const {
    defaultPagination,
    defaultSorting = [] as SortingState,
    defaultGlobalFilter = "",
    defaultColumnFilters = {} as ColumnFilters,

    removeEmpty = true,
    globalFilterName = "search" as GlobalFilterName,
    pageParamName = "page" as PageName,
    pageSizeParamName = "page_size" as PageSizeName,
    sortingParamName = "sort" as SortingName,

    paginationInUrl = true,
    sortingInUrl = true,
    globalFilterInUrl = true,
    columnFiltersInUrl = {} as ReducedQueryParams<ColumnFilters>,
    
    queryStateOptions,
    transform: _transform,
  } = options || {};

  const transform = useMemo<Record<string, (value: any) => any>>(() => ({
    [sortingParamName]: (value: string[]) => value.join(","),
    ..._transform,
  }), [_transform, sortingParamName]);

  const [initialState] = useState(() => {
    const queryConfig: QueryParams<Record<string, any>> = {};
    const stateConfig: Record<string, any> = {};

    if (paginationInUrl) {
      queryConfig[pageParamName] = {
        defaultValue: defaultPagination?.[pageParamName as unknown as keyof Pagination] ?? 1,
        parse: (value) => parseInt(value as string),
        serialize: (value: number) => value.toString(),
      };
      queryConfig[pageSizeParamName] = {
        defaultValue: defaultPagination?.[pageSizeParamName as unknown as keyof Pagination] ?? 25,
        parse: (value) => parseInt(value as string),
        serialize: (value) => value.toString(),
      };
    }
    else {
      stateConfig[pageParamName] = defaultPagination?.[pageParamName as unknown as keyof Pagination] ?? 1;
      stateConfig[pageSizeParamName] = defaultPagination?.[pageSizeParamName as unknown as keyof Pagination] ?? 25;
    }

    if (sortingInUrl) {
      queryConfig[sortingParamName] = {
        defaultValue: defaultSorting,
        parse: (value) => (value as string).split(","),
        serialize: (value: string[]) => value.join(","),
      };
    }
    else {
      stateConfig[sortingParamName] = defaultSorting;
    }

    if (globalFilterInUrl) {
      queryConfig[globalFilterName] = {
        defaultValue: defaultGlobalFilter,
      };
    }
    else {
      stateConfig[globalFilterName] = defaultGlobalFilter;
    }

    return { queryConfig, stateConfig };
  });

  const [columnFiltersConfig] = useState(() => {
    const queryConfig: QueryParams<Record<string, any>> = {};
    const stateConfig: Record<string, any> = {};
    if (columnFiltersInUrl) {
      Object.entries(columnFiltersInUrl).forEach(([key, value]) => {
        queryConfig[key] = value;
      });
    }
    else {
      Object.keys(defaultColumnFilters).forEach(key => {
        stateConfig[key] = defaultColumnFilters[key];
      });
    }
    return { queryConfig, stateConfig };
  });

  const [_state, _setState] = useImmer(initialState.stateConfig);
  const _queryState = useQueryState(initialState.queryConfig, queryStateOptions);
  const [_columnFiltersState, _setColumnFiltersState] = useImmer(columnFiltersConfig.stateConfig);
  const _columnFiltersQueryState = useQueryState(columnFiltersConfig.queryConfig, queryStateOptions);

  const state = useMemo<Partial<State>>(() => ({
    ..._state,
    ..._queryState.state,
    ..._columnFiltersState,
    ..._columnFiltersQueryState.state,
  } as any), [_state, _queryState.state, _columnFiltersState, _columnFiltersQueryState.state]);

  const dataGridState = useMemo<DataGridState>(() => ({
    pagination: {
      pageIndex: (paginationInUrl ? _queryState.state[pageParamName] : _state[pageParamName]) - 1,
      pageSize: paginationInUrl ? _queryState.state[pageSizeParamName] : _state[pageSizeParamName],
    },
    sorting: (sortingInUrl ? _queryState.state[sortingParamName] : _state[sortingParamName])
      .map((x: string) => {
        const desc = x.startsWith("-");
        return {
          id: desc ? x.slice(1) : x,
          desc,
        };
      }),
    globalFilter: globalFilterInUrl ? _queryState.state[globalFilterName] : _state[globalFilterName],
    columnFilters: Object.entries(columnFiltersInUrl ? _columnFiltersQueryState.state : _columnFiltersState)
      .map(([id, value]) => ({
        id,
        value,
      })),
  }), [paginationInUrl, _queryState.state, pageParamName, _state, pageSizeParamName, sortingInUrl, sortingParamName, globalFilterInUrl, globalFilterName, columnFiltersInUrl, _columnFiltersQueryState.state, _columnFiltersState]);

  const queryVariables = useMemo<QueryVariables>(() => {
    const vars = {
      ...state,
    };
    if (transform) {
      Object.entries<(x: any) => any>(transform as any).forEach(([key, fn]) => {
        if (fn) {
          vars[key as keyof typeof vars] = fn(vars[key as keyof typeof vars]);
        }
      });
    }

    if (removeEmpty) {
      for (const key in vars) {
        if (vars[key] === undefined 
            || vars[key] === null 
            || (vars[key] as any) === "" 
            || (vars[key] as any)?.length === 0
        ) {
          delete vars[key];
        }
      }
    }

    return vars as any;
  }, [removeEmpty, state, transform]);

  return {
    /** Internal state. */
    state,
    /** State to be used by the data-grid component. */
    dataGridState,
    /** 
     * Query variables to be used by the useQuery hook.
     * This values are the state values after the transform functions have been applied.
     */
    queryVariables,
    /** Configuration to be used by the data-grid component. */
    dataGridConfig: {
      enableSorting: true,
      manualSorting: true,
      onSortingChange: (value: Updater<SortingState>) => {
        const newValue = (typeof value === "function" ? value(dataGridState.sorting) : value)
          .map(x => `${x.desc ? "-" : ""}${x.id}`);
        sortingInUrl
        ? _queryState.update({
            [sortingParamName]: newValue,
          })
        : _setState((draft) => {
          draft[sortingParamName] = newValue;
        });
      },
   
      enableFilters: true,
      enableGlobalFilter: true,
      manualFiltering: true,
      onGlobalFilterChange: (value: Updater<string>) => {
        const oldGlobalFilter = globalFilterInUrl ? _queryState.state[globalFilterName] : _state[globalFilterName];
        const newValue = typeof value === "function" ? value(oldGlobalFilter) : value;
        globalFilterInUrl 
        ? _queryState.update({ 
            [globalFilterName]: newValue 
          }) 
        : _setState((draft) => {
          draft[globalFilterName] = newValue;
        });
      },
      enableColumnFilters: true,
      onColumnFiltersChange: (value: Updater<ColumnFiltersState>) => {
        const newValue = (typeof value === "function" ? value(dataGridState.columnFilters) : value)
          .reduce((acc, curr) => {
            acc[curr.id] = curr.value;
            return acc;
          }, {} as any);
        columnFiltersInUrl 
        ? _columnFiltersQueryState.set(newValue) 
        : _setColumnFiltersState(newValue);
      },
  
      enablePagination: true,
      manualPagination: true,
      onPaginationChange: (value: Updater<PaginationState>) => {
        const newValue = typeof value === "function" ? value(dataGridState.pagination) : value;
        paginationInUrl 
        ? _queryState.update({
            [pageParamName]: newValue.pageIndex + 1,
            [pageSizeParamName]: newValue.pageSize,
          })
        : _setState((draft) => {
          draft[pageParamName] = newValue.pageIndex + 1;
          draft[pageSizeParamName] = newValue.pageSize;
        });
      },
    },
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
