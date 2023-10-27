import { FilterFn } from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";

export const fuzzy: FilterFn<any> = (row, columnId, filterValue, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), filterValue)

  // Store the ranking info
  addMeta(itemRank)

  // Return if the item should be filtered in/out
  return itemRank.passed
}

export const contains: FilterFn<any> = (row, columnId, filterValue: string | number) => {
  const value = row.getValue<string | number>(columnId);
  return value.toString().toLowerCase().trim().includes(
    filterValue.toString().toLowerCase().trim());
}
contains.autoRemove = (v) => !v;

export const containsSensitive: FilterFn<any> = (row, columnId, filterValue: string | number) => {
  const value = row.getValue<string | number>(columnId);
  return value.toString().trim().includes(
    filterValue.toString().trim());
}
containsSensitive.autoRemove = (v) => !v;

export const startsWith: FilterFn<any> = (row, columnId, filterValue: string | number) => {
  const value = row.getValue<string | number>(columnId);
  return value.toString().toLowerCase().trim().startsWith(
    filterValue.toString().toLowerCase().trim());
}
startsWith.autoRemove = (v) => !v;

export const startsWithSensitive: FilterFn<any> = (row, columnId, filterValue: string | number) => {
  const value = row.getValue<string | number>(columnId);
  return value.toString().trim().startsWith(
    filterValue.toString().trim());
}
startsWithSensitive.autoRemove = (v) => !v;

export const endsWith: FilterFn<any> = (row, columnId, filterValue: string | number) => {
  const value = row.getValue<string | number>(columnId);
  return value.toString().toLowerCase().trim().endsWith(
    filterValue.toString().toLowerCase().trim());
}
endsWith.autoRemove = (v) => !v;

export const endsWithSensitive: FilterFn<any> = (row, columnId, filterValue: string | number) => {
  const value = row.getValue<string | number>(columnId);
  return value.toString().trim().endsWith(
    filterValue.toString().trim());
}
endsWithSensitive.autoRemove = (v) => !v;

export const greaterThan: FilterFn<any> = (row, columnId, filterValue: string | number) => {
  const value = row.getValue<string | number>(columnId);
  return value > filterValue;
}
greaterThan.autoRemove = (v) => !v;

export const greaterThanOrEqualTo: FilterFn<any> = (row, columnId, filterValue: string | number) => {
  const value = row.getValue<string | number>(columnId);
  return value >= filterValue;
}
greaterThanOrEqualTo.autoRemove = (v) => !v;

export const lessThan: FilterFn<any> = (row, columnId, filterValue: string | number) => {
  const value = row.getValue<string | number>(columnId);
  return value < filterValue;
}
lessThan.autoRemove = (v) => !v;

export const lessThanOrEqualTo: FilterFn<any> = (row, columnId, filterValue: string | number) => {
  const value = row.getValue<string | number>(columnId);
  return value <= filterValue;
}
lessThanOrEqualTo.autoRemove = (v) => !v;

export const between: FilterFn<any> = (row, columnId, filterValue: [string | number, string | number]) => {
  const value = row.getValue<string | number>(columnId);
  return value >= filterValue[0] && value <= filterValue[1];
}
between.autoRemove = (v) => !v;

export const betweenExclusive: FilterFn<any> = (row, columnId, filterValue: [string | number, string | number]) => {
  const value = row.getValue<string | number>(columnId);
  return value > filterValue[0] && value < filterValue[1];
}
betweenExclusive.autoRemove = (v) => !v;

export const is: FilterFn<any> = (row, columnId, filterValue: any) => {
  const value = row.getValue<string>(columnId);
  return value === filterValue;
}
is.autoRemove = (v) => !v;

export const isNot: FilterFn<any> = (row, columnId, filterValue: any) => {
  const value = row.getValue<string>(columnId);
  return value !== filterValue;
}
isNot.autoRemove = (v) => !v;

export const isAnyOf: FilterFn<any> = (row, columnId, filterValue: any[]) => {
  const value = row.getValue(columnId);
  return filterValue.includes(value);
}
isAnyOf.autoRemove = (v) => !v;

export const equalsTo: FilterFn<any> = (row, columnId, filterValue: any) => {
  const value = row.getValue(columnId);
  return value === filterValue;
}
equalsTo.autoRemove = (v) => !v;

export const weakEqualsTo: FilterFn<any> = (row, columnId, filterValue: any) => {
  const value = row.getValue(columnId);
  return value == filterValue;
}
weakEqualsTo.autoRemove = (v) => !v;

export const notEqualsTo: FilterFn<any> = (row, columnId, filterValue: any) => {
  const value = row.getValue(columnId);
  return value !== filterValue;
}
notEqualsTo.autoRemove = (v) => !v;

export const strEqualsTo: FilterFn<any> = (row, columnId, filterValue: string) => {
  const value = row.getValue<string>(columnId);
  return value.toString().toLowerCase() === filterValue.toString().toLowerCase();
}
strEqualsTo.autoRemove = (v) => !v;

export const strEqualsToSensitive: FilterFn<any> = (row, columnId, filterValue: string) => {
  const value = row.getValue<string>(columnId);
  return value.toString() === filterValue.toString();
}
strEqualsToSensitive.autoRemove = (v) => !v;

// Dates

export const dateEqualsTo: FilterFn<any> = (row, columnId, filterValue: number) => {
  const value = row.getValue<Date>(columnId);
  if (!value) return false;
  return value.valueOf() === filterValue;
}
dateEqualsTo.autoRemove = (v) => !v || !v?.valueOf;
dateEqualsTo.resolveFilterValue = (v) => v.valueOf();

export const isAfter: FilterFn<any> = (row, columnId, filterValue: number) => {
  const value = row.getValue<Date>(columnId);
  if (!value) return false;
  return value.valueOf() > filterValue;
}
isAfter.autoRemove = (v) => !v || !v?.valueOf;
isAfter.resolveFilterValue = (v) => v.valueOf();

export const isAfterOrEqualTo: FilterFn<any> = (row, columnId, filterValue: number) => {
  const value = row.getValue<Date>(columnId);
  if (!value) return false;
  return value.valueOf() >= filterValue;
}
isAfterOrEqualTo.autoRemove = (v) => !v || !v?.valueOf;
isAfterOrEqualTo.resolveFilterValue = (v) => v.valueOf();

export const isBefore: FilterFn<any> = (row, columnId, filterValue: number) => {
  const value = row.getValue<Date>(columnId);
  if (!value) return false;
  return value.valueOf() < filterValue;
}
isBefore.autoRemove = (v) => !v || !v?.valueOf;
isBefore.resolveFilterValue = (v) => v.valueOf();

export const isBeforeOrEqualTo: FilterFn<any> = (row, columnId, filterValue: number) => {
  const value = row.getValue<Date>(columnId);
  if (!value) return false;
  return value.valueOf() <= filterValue;
}
isBeforeOrEqualTo.autoRemove = (v) => !v || !v?.valueOf;
isBeforeOrEqualTo.resolveFilterValue = (v) => v.valueOf();

export const isDateBetween: FilterFn<any> = (row, columnId, filterValue: [number, number]) => {
  const value = row.getValue<Date>(columnId);
  if (!value) return false;
  return value.valueOf() >= filterValue[0] && value.valueOf() <= filterValue[1];
}
isDateBetween.autoRemove = (v) => !v || !v?.length;
isDateBetween.resolveFilterValue = (v) => [v[0].valueOf(), v[1].valueOf()];

export const isDateBetweenExclusive: FilterFn<any> = (row, columnId, filterValue: [number, number]) => {
  const value = row.getValue<Date>(columnId);
  if (!value) return false;
  return value.valueOf() > filterValue[0] && value.valueOf() < filterValue[1];
}
isDateBetweenExclusive.autoRemove = (v) => !v || !v?.length;
isDateBetweenExclusive.resolveFilterValue = (v) => [v[0].valueOf(), v[1].valueOf()];

// Utils

export const isNull: FilterFn<any> = (row, columnId) => {
  const value = row.getValue(columnId);
  return value === null;
}

export const isNotNull: FilterFn<any> = (row, columnId) => {
  const value = row.getValue(columnId);
  return value !== null;
}

export const isUndefined: FilterFn<any> = (row, columnId) => {
  const value = row.getValue(columnId);
  return value === undefined;
}

export const isNotUndefined: FilterFn<any> = (row, columnId) => {
  const value = row.getValue(columnId);
  return value !== undefined;
}

export const isEmpty: FilterFn<any> = (row, columnId) => {
  const value = row.getValue(columnId);
  return value === null || value === undefined || value === "";
}

export const isNotEmpty: FilterFn<any> = (row, columnId) => {
  const value = row.getValue(columnId);
  return value !== null && value !== undefined && value !== "";
}

export const isTrueish: FilterFn<any> = (row, columnId) => {
  const value = row.getValue(columnId);
  return !!value;
}

export const isFalseish: FilterFn<any> = (row, columnId) => {
  const value = row.getValue(columnId);
  return !value;
}

export const filterFns = {
  fuzzy,
  contains,
  containsSensitive,
  startsWith,
  startsWithSensitive,
  endsWith,
  endsWithSensitive,
  greaterThan,
  greaterThanOrEqualTo,
  lessThan,
  lessThanOrEqualTo,
  between,
  betweenExclusive,
  is,
  isNot,
  isAnyOf,
  equalsTo,
  weakEqualsTo,
  notEqualsTo,
  strEqualsTo,
  strEqualsToSensitive,

  dateEqualsTo,
  isAfter,
  isAfterOrEqualTo,
  isBefore,
  isBeforeOrEqualTo,
  isDateBetween,
  isDateBetweenExclusive,

  isNull,
  isNotNull,
  isUndefined,
  isNotUndefined,
  isEmpty,
  isNotEmpty,
  isTrueish,
  isFalseish,
}

export type FilterFnOption = keyof typeof filterFns;
