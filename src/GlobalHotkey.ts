import { DEFAULT_DELAY } from "./constants";
import { Delay, KeyboardRegularButton } from "./types";
import { noop, sleep } from "./utils";

import { _GlobalHotkey } from "./addon";

type Reason = "toggle" | "released" | "ended" | String;

export declare type HotkeyOptions = {
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
        reason: Reason
      ): void | Promise<void>;
      delay?: Delay;
    }
);

class GlobalHotkey extends _GlobalHotkey {
  private _canceled?: Promise<void>;
  private _reason?: Reason;

  constructor(options: HotkeyOptions) {
    super();

    this._canceled = undefined;

    let isFree = true;

    const { key } = options;

    let handleAction;

    if (options.mode === "once") {
      const action: OmitThisParameter<typeof options.action> =
        options.action.bind(this);

      handleAction = async () => {
        if (isFree) {
          isFree = false;

          await action();

          isFree = true;
        }
      };
    } else {
      const isEnable: OmitThisParameter<NonNullable<typeof options.isEnable>> =
        options.isEnable?.bind(this) || (() => true);

      const onBeforeAction: OmitThisParameter<
        NonNullable<typeof options.onBeforeAction>
      > = options.onBeforeAction?.bind(this) || noop;

      const action: OmitThisParameter<typeof options.action> =
        options.action.bind(this);

      const finalizerCallback: OmitThisParameter<
        NonNullable<typeof options.finalizerCallback>
      > = options.finalizerCallback?.bind(this) || noop;

      const { delay = DEFAULT_DELAY } = options;

      if (options.mode === "toggle") {
        handleAction = async () => {
          if ((this.hotkeyState = !this.hotkeyState)) {
            if (isFree && (await isEnable())) {
              isFree = false;

              let resolve: () => void;

              this._canceled = new Promise<void>((_resolve) => {
                resolve = _resolve;
              });

              await onBeforeAction();

              while (this.hotkeyState && (await action())) {
                await sleep(delay);
              }

              await finalizerCallback(
                this._reason || (this.hotkeyState ? "ended" : "toggled")
              );

              this.hotkeyState = false;

              this._reason = undefined;

              isFree = true;

              resolve!();

              this._canceled = undefined;
            } else {
              this.hotkeyState = false;
            }
          }
        };
      } else if (options.mode === "hold") {
        handleAction = async () => {
          if (isFree && (await isEnable())) {
            isFree = false;

            let hotkeyState;

            while ((hotkeyState = this.hotkeyState) && (await action())) {
              await sleep(delay);
            }

            await finalizerCallback(hotkeyState ? "ended" : "released");

            isFree = true;
          }
        };
      } else {
        throw new Error("No mode was selected");
      }
    }

    this._register(key, options.mode, handleAction);
  }

  stop(reason: Reason = "stopped") {
    if (this.hotkeyState) {
      this._reason = reason;

      this.hotkeyState = false;

      return this._canceled;
    }
  }
}

export default GlobalHotkey;
