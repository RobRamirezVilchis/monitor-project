// https://stackoverflow.com/a/47914631

export type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};

export type RecursiveRequired<T> = {   
    [P in keyof T]-?: RecursiveRequired<T[P]>; 
};

export type PartialExcept<T, K extends keyof T> = RecursivePartial<T> & Pick<T, K>;

export type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

/** Extracts the elements from an array type */
export type Unpacked<T> = T extends (infer U)[] ? U : T;

/** Creates the union of two array types and flattens it */
export type UnionFlatten<T, K> = Array<Unpacked<T> | Unpacked<K>>;

export type ReducerAction<T extends string, P = undefined> = {
  type: T;
} & (P extends undefined ? {} : { payload: P });

export type Reducer<S, A extends ReducerAction<any, any>> = (state: S, action: A) => S;

export type PartialKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// https://www.totaltypescript.com/concepts/the-prettify-helper
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;

/** Adding this to a string union will prevent it from decaying to a string while still allowing any string value */
export type NoDecayStringUnion = string & {};
//                               string & Record<never, never>;
//                               string & NonNullable<unknown>;

/** Creates a string union that shows autocompletion for the given strings `T` while still allowing any string value */
export type StringUnion<T extends string> = T | NoDecayStringUnion;