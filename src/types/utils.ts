export type SetWorkwindow = {
  /** Sets entire desktop as current workwindow */
  (): void;
  /** Sets current workwindow by {@link handle}. */
  (handle: number): void;
  /** Sets current workwindow by first window with {@link title} and/or {@link className} and sets it as current workwindow. */
  (title: string | null, className?: string | null): void;
  /** Sets current workwindow by first child window with {@link childClassName} and/or {@link childTitle} of window with {@link parentHandle}. */
  (
    parentHandle: number,
    childClassName: string | null,
    childTitle?: string | null
  ): void;
  /** Sets current workwindow by first child window with {@link childClassName} and/or {@link childTitle} of the first founded window with {@link parentTitle} and/or {@link parentClassName}. */
  (
    parentTitle: string | null,
    parentClassName: string | null,
    childClassName: string | null,
    childTitle?: string | null
  ): void;
};

export type SetThisParameter<This, Fn extends (...args: any[]) => any> = {
  (this: This, ...args: Parameters<Fn>): ReturnType<Fn>;
};

export type CancelableFunction<Fn extends Function> = Fn & {
  cancelCurrent(): Promise<void>;
};
