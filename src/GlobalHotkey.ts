import { DEFAULT_DELAY } from "./constants";
import { Delay, KeyboardRegularButton } from "./types";
import { noop, sleep } from "./utils";

import { _GlobalHotkey } from "./addon";

type _Reason = "keyboard" | "action" | "stopped";

type Reason<T = undefined> = T extends NonNullable<T> ? _Reason | T : _Reason;

type HotkeyOnceModeOptions<T = undefined> = {
  /**
   * * if `"once"` - {@link HotkeyOnceModeOptions.action action} will call one time for each {@link HotkeyOptions.key key} press
   */
  mode: "once";
  /**
   * Method to be executed after the {@link HotkeyOptions.key hotkey} is pressed
   */
  action(this: GlobalHotkey<T>): void | Promise<void>;
};

type HotkeyRestModesOptions<T = undefined> = {
  /**
   * * if `"hold"` - {@link HotkeyRestModesOptions.action action} will repeat every {@link HotkeyRestModesOptions.delay delay} milliseconds while {@link HotkeyOptions.key key} is pressed or {@link HotkeyRestModesOptions.action action} returns `true`
   * * if `"toggle"` - {@link HotkeyRestModesOptions.action action} starts repeat repeat every {@link HotkeyRestModesOptions.delay delay} milliseconds after {@link HotkeyOptions.key key} first time pressed and stops after {@link HotkeyOptions.key key} second time pressed or {@link HotkeyRestModesOptions.action action} returns `false`
   */
  mode: "toggle" | "hold";
  /**
   * Method to check if hotkey is need to be executing
   * @default () => true
   */
  isEnable?(this: GlobalHotkey<T>): boolean | Promise<boolean>;
  /**
   * Method to be executed before the {@link HotkeyRestModesOptions.action action} loop
   */
  before?(this: GlobalHotkey<T>): void | Promise<void>;
  /**
   * @see {@link HotkeyRestModesOptions.mode mode}
   */
  action(this: GlobalHotkey<T>): boolean | Promise<boolean>;
  /**
   * Method to be executed after the {@link HotkeyRestModesOptions.action action} loop
   */
  after?(this: GlobalHotkey<T>, reason: Reason<T>): void | Promise<void>;
  /**
   * Delay in milliseconds between {@link HotkeyRestModesOptions.action action} executions
   * @default 35
   */
  delay?: Delay;
};

export type HotkeyOptions<T = undefined> = {
  /** hotkey */
  key: KeyboardRegularButton | number;
} & (HotkeyOnceModeOptions<T> | HotkeyRestModesOptions<T>);

class GlobalHotkey<T extends any = undefined> extends _GlobalHotkey {
  private _completion?: Promise<void>;
  private _reason?: T | "stopped";
  private _withAfter?: boolean;

  /**
   * Registers hotkey, if some hotkey already registered for this {@link HotkeyOptions.key key}, {@link GlobalHotkey.unregister unregister} previous hotkey and registers new hotkey
   */
  constructor(options: HotkeyOptions<T>) {
    super();

    let isFree = true;

    const { mode } = options;

    const getAction = () => {
      if (mode === "once") {
        const action: OmitThisParameter<typeof options.action> =
          options.action.bind(this);

        return async () => {
          if (isFree) {
            isFree = false;

            await action();

            isFree = true;
          }
        };
      }

      const action: OmitThisParameter<typeof options.action> =
        options.action.bind(this);

      const isEnable: OmitThisParameter<NonNullable<typeof options.isEnable>> =
        options.isEnable?.bind(this) || (() => true);

      const before: OmitThisParameter<NonNullable<typeof options.before>> =
        options.before?.bind(this) || noop;

      const { delay = DEFAULT_DELAY } = options;

      const createMain = (getReason: () => any) => {
        let after: () => void | Promise<void>;

        if (options.after) {
          const fn: OmitThisParameter<NonNullable<typeof options.after>> =
            options.after.bind(this);

          after = () => fn(getReason());

          this._withAfter = true;
        } else {
          after = noop;
        }

        return async () => {
          isFree = false;

          await before();

          while (this.hotkeyState && (await action())) {
            await sleep(delay);
          }

          await after();

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

  /**
   * Stops the loop of {@link HotkeyRestModesOptions.action action} executing
   * * Note: works only in `"toggle"` {@link HotkeyRestModesOptions.mode mode}
   * @param [reason="stopped"] - reason to {@link HotkeyRestModesOptions.after after}, if not provided defaults to `"stopped"`
   */
  stop(reason: T | "stopped" = "stopped") {
    if (this.hotkeyState) {
      if (this._withAfter) {
        this._reason = reason;
      }

      this.hotkeyState = false;

      return this._completion;
    }
  }
}

export default GlobalHotkey;
