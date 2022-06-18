import { DEFAULT_DELAY } from "./constants";
import { Delay, KeyboardRegularButton } from "./types";
import { noop, sleep } from "./utils";

import { _GlobalHotkey } from "./addon";

type _Reason = "keyboard" | "action" | "stopped";

type Reason<T = undefined> = T extends NonNullable<T> ? _Reason | T : _Reason;

export declare type HotkeyOptions<T = undefined> = {
  key: KeyboardRegularButton | number;
} & (
  | {
      mode: "once";
      action(this: GlobalHotkey): void | Promise<void>;
    }
  | {
      mode: "toggle" | "hold";
      isEnable?(this: GlobalHotkey): boolean | Promise<boolean>;
      onBeforeAction?(this: GlobalHotkey): void | Promise<void>;
      action(this: GlobalHotkey): boolean | Promise<boolean>;
      finalizerCallback?(
        this: GlobalHotkey,
        reason: Reason<T>
      ): void | Promise<void>;
      /**
       * @default 35
       */
      delay?: Delay;
    }
);

class GlobalHotkey<T extends any = undefined> extends _GlobalHotkey {
  private _completion?: Promise<void>;
  private _reason?: T | "stopped";
  private _withFinalizerCallback?: boolean;

  constructor(options: HotkeyOptions<T>) {
    super();

    let isFree = true;

    const { mode } = options;

    const action: OmitThisParameter<typeof options.action> =
      options.action.bind(this);

    const getAction = () => {
      if (mode === "once") {
        return async () => {
          if (isFree) {
            isFree = false;

            await action();

            isFree = true;
          }
        };
      }

      const isEnable: OmitThisParameter<NonNullable<typeof options.isEnable>> =
        options.isEnable?.bind(this) || (() => true);

      const onBeforeAction: OmitThisParameter<
        NonNullable<typeof options.onBeforeAction>
      > = options.onBeforeAction?.bind(this) || noop;

      const { delay = DEFAULT_DELAY } = options;

      const createMain = (getReason: () => any) => {
        let finalizerCallback: () => void | Promise<void>;

        if (options.finalizerCallback) {
          const fn: OmitThisParameter<
            NonNullable<typeof options.finalizerCallback>
          > = options.finalizerCallback.bind(this);

          finalizerCallback = () => fn(getReason());

          this._withFinalizerCallback = true;
        } else {
          finalizerCallback = noop;
        }

        return async () => {
          isFree = false;

          await onBeforeAction();

          while (this.hotkeyState && (await action())) {
            await sleep(delay);
          }

          await finalizerCallback();

          isFree = true;
        };
      };

      if (mode === "toggle") {
        const main = createMain(() => {
          if ("_reason" in this) {
            const reason = this._reason!;

            delete this._reason;

            return reason;
          }

          if (this.hotkeyState) {
            this.hotkeyState = false;

            return "action";
          }

          return "keyboard";
        });

        return async () => {
          if ((this.hotkeyState = !this.hotkeyState)) {
            if (isFree && (await isEnable())) {
              let resolve: () => void;

              this._completion = new Promise<void>((_resolve) => {
                resolve = _resolve;
              });

              await main();

              resolve!();
            } else {
              this.hotkeyState = false;
            }
          }
        };
      }

      if (mode === "hold") {
        const main = createMain(() =>
          this.hotkeyState ? "action" : "keyboard"
        );

        return async () => {
          if (isFree && (await isEnable())) {
            await main();
          }
        };
      }

      throw new Error("No mode was selected");
    };

    this._register(options.key, mode, getAction());
  }

  stop(reason: T | "stopped" = "stopped") {
    if (this.hotkeyState) {
      if (this._withFinalizerCallback) {
        this._reason = reason;
      }

      this.hotkeyState = false;

      return this._completion;
    }
  }
}

export default GlobalHotkey;
