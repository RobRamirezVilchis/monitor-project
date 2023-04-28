// https://stackoverflow.com/a/47914631

export type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};

export type RecursiveRequired<T> = {   
    [P in keyof T]-?: RecursiveRequired<T[P]>; 
};

export type PartialExcept<T, K extends keyof T> = RecursivePartial<T> & Pick<T, K>;

export type ReducerAction<T extends string, P = undefined> = {
  type: T;
} & (P extends undefined ? {} : { payload: P });

export type Reducer<S, A extends ReducerAction<any, any>> = (state: S, action: A) => S;
