const isObject = (obj: any) => {
  return (obj && typeof obj === "object" && !Array.isArray(obj));
}

/**
 * @param obj The object to extract the property from 
 * @param str A string that represent the property to get. Nested properties must be
 * separated by dots '.' (this works for both objects and arrays)
 * @returns The property value
 * @see https://stackoverflow.com/a/6491621 for the original implementation
 */
export const objectPropByString = (obj: any, str: string) => {
  str = str.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
  str = str.replace(/^\./, ""); // strip a leading dot
  const indexes = str.split(".");
  let curr = obj;

  for (let i = 0; i < indexes.length; ++i) {
    let key = indexes[i];
    if (key in curr) {
      curr = curr[key as keyof any];
    } else {
      return;
    }
  }

  return curr as any;
};

/**
 * 
 * @param obj The original object to modify
 * @param str A string that represent the property to set. Nested properties must be
 * separated by dots '.' (this works for both objects and arrays)
 * @param value The value that the given property will get
 * @param numericKeysForArraysOnly If true, this will interpret that numeric keys should be
 * used exclusively as array indexes, and not as object keys (default: true)
 * @returns A reference to the original object 
 * (NOTE: The original object is mutated and not a copy of it)
 */
export const setPropValueByString = (obj: any, str: string, value: any, numericKeysForArraysOnly: boolean = true) => {
  str = str.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
  str = str.replace(/^\./, ""); // strip a leading dot
  let indexes = str.split(".");
  let curr = null;
  let next = obj;

  for (let i = 0; i < indexes.length; ++i) {
    const key = indexes[i];
    curr = next[key as keyof any];
    if (!curr) {
      if (i === indexes.length - 1)
        curr = value;
      else {
        if (numericKeysForArraysOnly && indexes[i + 1].match(/^\d+$/))
          curr = [];
        else
          curr = {};
      }
    }
    next[key as keyof any] = curr
    next = curr
  }

  return obj as any;
};

/**
 * Return a (deep) filtered object based in the keys of the filter object
 * @param original The original object to be filtered 
 * @param filter A object with keys that must exist in the original object to be
 * used as a filter. Comparison is deep.
 * @returns The original object only with the keys that exists in the filter object
 */
export const filterFromObject = (original: any, filter: any) => {
  return Object.fromEntries(
    Object.entries(filter).map(([fKey, fValue]) => {
      let oValue = original[fKey];
      if (typeof oValue === "object") {
        oValue = filterFromObject(oValue, fValue);
      }
      return [fKey, oValue];
    })
  );
};

/**
 * Deeply merge source `object` into `target`, replacing or add `source` properties to `target`.
 * @param target The target object to be merged
 * @param source The source object to be merged
 * @returns A new object with the merged properties of the target and source objects.
 * If the same property exists in both objects, the source property will be used.
 * If the property is an object, the merge will be done recursively.
 * If the property is an array, the source array will replace the target array.
 */
export const deepMerge = (target: any, source: any) => {
  if (!isObject(target) || !isObject(source)) return source;
  for (const key in source) {
    if (typeof source[key] === "object") {
      if (!target[key]) Object.assign(target, { [key]: {} });
      deepMerge(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }
  return target;
}
