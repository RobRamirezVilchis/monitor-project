export function ascendingComparator<T>(a: T, b: T) {
  return (
    a === b 
    ? 0 
    : a < b 
      ? -1 
      : 1
  );
}

export function descendingComparator<T>(a: T, b: T) {
  return (
    a === b
    ? 0
    : a > b
      ? -1
      : 1
  );
}

export function binarySearch<T>(
  arr: T[], item: T, comparator: (a: T, b: T) => number = ascendingComparator
) {
  let l = 0;
  let r = arr.length - 1;

  while (l <= r) {
    const mid = Math.floor((l + r) / 2);
    const comp = comparator(item, arr[mid]);

    if (comp === 0) return mid;
    else if (comp > 0) l = mid + 1;
    else if (comp < 0) r = mid - 1;
  }

  return -1;
}
  
export function sortedInsert<T>(
  arr: T[], item: T, comparator: (a: T, b: T) => number = ascendingComparator
) {
  let p = 0;
  let l = 0;
  let r = arr.length - 1;

  while (l <= r) {
    const mid = Math.floor((l + r) / 2);
    const comp = comparator(item, arr[mid]);

    if (comp === 0) {
      p = mid;
      break;
    }
    else if (comp > 0) {
      l = mid + 1;
      p = l;
    }
    else if (comp < 0) {
      r = mid - 1;
      p = r + 1;
    }
  }

  arr.splice(p, 0, item);
  return p;
}