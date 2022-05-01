import { Delay } from "./types";
import { Worker } from "./types/key_sender";

export const random = (min: number, max: number) =>
  min < max ? Math.floor(Math.random() * (max + 1 - min)) + min : min;

export const sleep = (delay: Delay) => {
  if (Array.isArray(delay)) {
    delay = random(delay[0], delay[1]);
  }

  if (delay)
    return new Promise<void>((res) => {
      setTimeout(res, delay as number);
    });
};

export const stringsToBuffers = <T extends any[]>(args: T) => {
  return args.map((item) =>
    typeof item === "string" ? Buffer.from(item, "ucs2") : item
  );
};

export const lazyGetters = <T extends {}>(
  self: T,
  worker: Worker,
  args: { key: string; handleModule: (worker: Worker) => any }[]
) => {
  for (let i = args.length; i--; ) {
    const { key, handleModule } = args[i];

    Object.defineProperty(self, key, {
      configurable: true,
      get() {
        Object.defineProperty(self, key, {
          value: handleModule(worker),
        });

        return self[key];
      },
    });
  }
};

export const noop = function () {};
