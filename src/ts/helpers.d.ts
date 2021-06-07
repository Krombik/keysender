import EventEmitter = require("node:events");

type MergeTypesFromArray<T extends {}[]> = T[keyof T extends string
  ? keyof T
  : never];

type AddEmptyFields<T extends {}[], K extends {}> = {
  [i in keyof T]: Omit<K, keyof T[i]> & T[i];
};

type ArrayOfFieldKeys<T extends {}[]> = {
  [i in keyof T]: keyof T[i];
};

type FieldKeysFromArray<T extends string[]> = T[keyof T extends string
  ? keyof T
  : never];

export type MergeTypes<T extends {}[]> = MergeTypesFromArray<
  AddEmptyFields<
    T,
    Partial<Record<FieldKeysFromArray<ArrayOfFieldKeys<T>>, undefined>>
  >
>;

declare type Listener<F> = (
  ...args: F extends (...args: any) => any ? Parameters<F> : never
) => void;

type EventName<K extends string, common extends boolean> = common extends false
  ? `${"after" | "before"}-${K}`
  : K;

interface F<
  This,
  O extends {},
  Key extends string & keyof O,
  common extends boolean
> {
  <T extends Key>(
    event: EventName<T | Key, common>,
    listener: Listener<O[T]>
  ): This;
}

export declare interface GenericEventEmitter<
  O extends {},
  Key extends string & keyof O,
  common extends boolean = false
> {
  addListener: F<this, O, Key, common>;
  on: F<this, O, Key, common>;
  once: F<this, O, Key, common>;
  removeListener: F<this, O, Key, common>;
  off: F<this, O, Key, common>;
  removeAllListeners(event?: EventName<Key, common>): this;
  setMaxListeners(n: number): this;
  getMaxListeners(): number;
  listeners(event: EventName<Key, common>): Listener<O[Key]>[];
  rawListeners(event: EventName<Key, common>): Listener<O[Key]>[];
  emit(event: string | symbol, ...args: any[]): boolean;
  listenerCount(event: EventName<Key, common>): number;
  prependListener: F<this, O, Key, common>;
  prependOnceListener: F<this, O, Key, common>;
  eventNames(): EventName<Key, common>[];
}

export type EventType<T extends EventEmitter> = ReturnType<
  T["eventNames"]
>[number];
