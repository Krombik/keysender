
import { keyboard } from './src/ts/keyboard.d'
import { mouse } from './src/ts/mouse.d'
import { workwindow } from './src/ts/workwindow.d'

declare class Worker {
    /** @param handle - handle of workwindow. */
    constructor(handle: number);
    /** Provides methods to synthesize keystrokes. */
    declare keyboard: keyboard;
    /** Provides methods to synthesize mouse motions, and button clicks. */
    declare mouse: mouse;
    /** Provides methods to work with workwindow. */
    declare workwindow: workwindow;
}

/** Provides methods implementations on hardware level. */
export declare class Hardware extends Worker { }

/** Provides methods implementations on virtual level. */
export declare class Virtual extends Worker { }

export { vkToString } from './src/ts/keyboard.d';

export { GlobalHotkey } from './src/ts/hotkey.d';

export { getScreenSize, getWindow, getWindowChild } from './src/ts/workwindow.d'

export { sleep } from './src/ts/sleep.d'

export * from './src/ts/types.d'
