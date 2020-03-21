declare type keyboardButtons = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z" | "+" | "-" | "." | "," | "?" | "~" | "[" | "]" | "|" | "'" | "backspace" | "delete" | "enter" | "tab" | "escape" | "up" | "down" | "right" | "left" | "home" | "end" | "pageup" | "pagedown" | "f1" | "f2" | "f3" | "f4" | "f5" | "f6" | "f7" | "f8" | "f9" | "f10" | "f11" | "f12" | "f13" | "f14" | "f15" | "f16" | "f17" | "f18" | "f19" | "f20" | "f21" | "f22" | "f23" | "f24" | "capslock" | "alt" | "ctrl" | "shift" | "lshift" | "rshift" | "lctrl" | "rctrl" | "lalt" | "ralt" | "space" | "prntscrn" | "insert" | "numlock" | "num0" | "num0" | "num1" | "num2" | "num3" | "num4" | "num5" | "num6" | "num7" | "num8" | "num9" | "num+" | "num-" | "num*" | "num/" | "num.";
declare type mouseButtons = "left" | "right" | "middle";
declare type keyboardEvents = "printText" | "toogleKey" | "sendKey" | "sendKeys";
declare type mouseEvents = "toogle" | "click" | "moveTo" | "moveCurveTo" | "move" | "scrollWheel";
declare type windowInfo = { x?: number, y?: number, width?: number, height?: number };
declare type img = { data: Buffer, height: number, width: number, colorAt(x: number, y: number): string };
declare type windowData = { handle: number, className: string, title: string };

/**
 * Hardware class provide hardware inputs.
 */
export declare class Hardware {
    /**
    @param handle - handle of workwindow
    */
    declare constructor(handle: number);
    declare keyboard = {
        keyTooglerDelay: 35,
        keySenderDelay: 35,
        /**
         * Adds the {listener} before event {eventName}
         */
        before(eventName: keyboardEvents, listener: (...args: any[]) => void): void { },
        /**
         * Adds the {listener} after event {eventName}
         */
        after(eventName: keyboardEvents, listener: (...args: any[]) => void): void { },
        /** Print text.
         * @param text - string to print.
         * @param keySenderDelay - delay in milliseconds to sleep after sending key,
         * if not provided defaults 0.
         */
        printText(text: string, keySenderDelay?: [number, number] | number): void { },
        /** Print text async.
         * @param text - string to print.
         * @param keySenderDelay - delay in milliseconds to await after sending key,
         * if not provided defaults to 0.
         */
        async printTextAsync(text: string, keySenderDelay?: [number, number] | number): Promise { },
        /**
         * Switch key state.
         * @param key - name of key.
         * @param isKeyDown - key state selection: true for press, false for release.
         * @param delay - delay in milliseconds to sleep after switching key state,
         * if not provided defaults to this.keyTooglerDelay.
         */
        toogleKey(key: keyboardButtons, isKeyDown?: boolean, delay?: [number, number] | number): void { },
        /**
         * Switch key state async.
         * @param key - name of key.
         * @param isKeyDown - key state selection: true for press, false for release.
         * @param delay - delay in milliseconds to await after switching key state,
         * if not provided defaults to this.keyTooglerDelay.
         */
        async toogleKeyAsync(key: keyboardButtons, isKeyDown?: boolean, delay?: [number, number] | number): Promise { },
        /**
         * Press and release key.
         * @param key - name of key.
         * @param keyTooglerDelay - delay in milliseconds to sleep after press key,
         * if not provided defaults to this.keyTooglerDelay.
         * @param keySenderDelay - delay in milliseconds to sleep after release key,
         * if not provided defaults to 0.
         */
        sendKey(keys: keyboardButtons, keyTooglerDelay?: [number, number] | number, keySenderDelay?: [number, number] | number): void { },
        /**
         * Press and release key async.
         * @param key - name of key.
         * @param keyTooglerDelay - delay in milliseconds to await after press key,
         * if not provided defaults to this.keyTooglerDelay.
         * @param keySenderDelay - delay in milliseconds to await after release key,
         * if not provided defaults to 0.
         */
        async sendKeyAsync(keys: keyboardButtons, keyTooglerDelay?: [number, number] | number, keySenderDelay?: [number, number] | number): Promise { },
        /**
         * Press and release array of keys.
         * @param keys - array with keys.
         * @param keyTooglerDelay - delay in milliseconds to sleep after press key,
         * if not provided defaults to this.keyTooglerDelay.
         * @param keySenderDelay - delay in milliseconds to sleep after release key,
         * if not provided defaults to {keyTooglerDelay}, if {keyTooglerDelay} not provided defaults to this.keySenderDelay.
         */
        sendKeys(keys: keyboardButtons[], keyTooglerDelay?: [number, number] | number, keySenderDelay?: [number, number] | number): void { },
        /**
         * Press and release array of keys async.
         * @param keys - array with keys.
         * @param keyTooglerDelay - delay in milliseconds to await after press key,
         * if not provided defaults to this.keyTooglerDelay.
         * @param keySenderDelay - delay in milliseconds to await after release key,
         * if not provided defaults to {keyTooglerDelay}, if {keyTooglerDelay} not provided defaults to this.keySenderDelay.
         */
        async sendKeysAsync(keys: keyboardButtons[], keyTooglerDelay?: [number, number] | number, keySenderDelay?: [number, number] | number): Promise { }
    };
    declare mouse = {
        buttonTooglerDelay: 35,
        /** If saveMod is true every mouse method first back to {lastCoords}, by default: false. */
        set saveMod(bool: boolean) { },
        get saveMod(): boolean { },
        /** Last coordinates of mouse, change after every mouseMove method, by default: [0,0]. */
        set lastCoords(coords: [number, number]) { },
        get lastCoords(): [number, number] { },
        /**
         * Adds the {listener} before event {eventName}
         */
        before(eventName: mouseEvents, listener: (...args: any[]) => void): void { },
        /**
         * Adds the {listener} after event {eventName}
         */
        after(eventName: mouseEvents, listener: (...args: any[]) => void): void { },
        /**
         * Get current cursor position at screen for Hardware class or position at current workwindow.
         */
        getPos(): [number, number] { },
        /**
         * Switch mouse button state.
         * @param isButtonDown - key state selection: true for press, false for release.
         * @param button - name of mouse button.
         * @param buttonTooglerDelay - delay in milliseconds to sleep after switching mouse button state,
         * if not provided defaults to this.buttonTooglerDelay.
         */
        toogle(isButtonDown: boolean, button?: mouseButtons, buttonTooglerDelay?: [number, number] | number): void { },
        /**
         * Switch mouse button state async.
         * @param isButtonDown - key state selection: true for press, false for release.
         * @param button - name of mouse button.
         * @param buttonTooglerDelay - delay in milliseconds to await after switching mouse button state,
         * if not provided defaults to this.buttonTooglerDelay.
         */
        async toogleAsync(isButtonDown: boolean, button?: mouseButtons, buttonTooglerDelay?: [number, number] | number): Promise { },
        /**
         * Click mouse button
         * @param button - name of mouse button.
         * @param buttonTooglerDelay - delay in milliseconds to sleep after press mouse button,
         * if not provided defaults to this.buttonTooglerDelay.
         * @param buttonSenderDelay - delay in milliseconds to sleep after release mouse button,
         * if not provided defaults to 0.
         */
        click(button?: mouseButtons, buttonTooglerDelay?: [number, number] | number, buttonSenderDelay?: [number, number] | number): void { },
        /**
         * Click mouse button async
         * @param button - name of mouse button.
         * @param buttonTooglerDelay - delay in milliseconds to await after press mouse button,
         * if not provided defaults to this.buttonTooglerDelay.
         * @param buttonSenderDelay - delay in milliseconds to await after release mouse button,
         * if not provided defaults to 0.
         */
        async clickAsync(button?: mouseButtons, buttonTooglerDelay?: [number, number] | number, buttonSenderDelay?: [number, number] | number): Promise { },
        /**
         * Move mouse to [x, y].
         * @param delay - delay in milliseconds to sleep after move mouse,
         * if not provided defaults to 0.
         */
        moveTo(x: number, y: number, delay?: [number, number] | number): void { },
        /**
         * Move mouse to [x, y] async.
         * @param delay - delay in milliseconds to await after move mouse,
         * if not provided defaults to 0.
         */
        async moveToAsync(x: number, y: number, delay?: [number, number] | number): Promise { },
        /**
         * Emitate human like mouse move from {lastCoords} to [x, y].
         * @param speed - movespeed, if not provided defaults to 5.
         * @param deviation - movement curvature, if not provided defaults to 30.
         */
        moveCurveTo(x: number, y: number, speed?: number, deviation?: number): void { },
        /**
         * Emitate human like mouse move from {lastCoords} to [x, y] async.
         * @param speed - movespeed, if not provided defaults to 5.
         * @param deviation - movement curvature, if not provided defaults to 30.
         */
        async moveCurveToAsync(x: number, y: number, speed?: number, deviation?: number): Promise { },
        /**
         * Move mouse relative to the current position by [x, y].
         * @param delay - delay in milliseconds to sleep after move mouse,
         * if not provided defaults to 0.
         */
        move(x: number, y: number, delay?: [number, number] | number): void { },
        /**
         * Move mouse relative to the current position by [x, y] async.
         * @param delay - delay in milliseconds to await after move mouse,
         * if not provided defaults to 0.
         */
        async moveAsync(x: number, y: number, delay?: [number, number] | number): Promise { },
        /**
         * Scroll mouse wheel for {count} times.
         * @param wheelTooglerDelay - delay in milliseconds to sleep after wheel scroll,
         * if not provided defaults to 0.
         */
        scrollWheel(count: number, wheelTooglerDelay?: [number, number] | number): void { },
        /**
         * Scroll mouse wheel for {count} times async.
         * @param wheelTooglerDelay - delay in milliseconds to await after wheel scroll,
         * if not provided defaults to 0.
         */
        async scrollWheelAsync(count: number, wheelTooglerDelay?: [number, number] | number): Promise { }
    }
    declare workwindow = {
        /** set current worwindow */
        set is(workwindow: number) { },
        /** @returns current workwindow handle, title and className */
        get is(): windowData { },
        /** set window position and size */
        set info(info: windowInfo) { },
        /** get window position and size */
        get info(): windowInfo { },
        /**
         * Adds the {listener} after event {eventName}
         */
        on(eventName: "capture", listener: (...args: any[]) => void): void { },
        /** set current workwindow foreground */
        setForeground(): void { },
        isForeground(): boolean { },
        isOpen(): boolean { },
        /**
         * capture part of current workwindow from [x, y] to [x+width,y+height].
         */
        capture(x: number, y: number, width: number, height: number): img { },
        /**
         * capture current workwindow.
         */
        capture(): img { },
        /**
         * Terminate current workwindow.
         */
        kill(): void { },
        /**
         * Close current workwindow by sending close message.
         */
        close(): void { }
    }
};

/**
 * Virtual class provide virtual inputs to workwindow.
 */
export declare class Virtual extends Hardware { }

export declare class GlobalHotkey {
    /**
     * Register hotkey.
     * @param key - hotkey name.
     * @param func - function that calls after hotkey pressed.
     * @param isHold - if true, {func} will repeat while hotkey is pressed.
     * @param delay - set delay between {func} calls if {isHold} is true, by default = 0.
     */
    static register(key: keyboardButtons, func: () => void, isHold?: boolean, delay?: number): void;
    /**
     * Unregister hotkey.
     * @param key - hotkey name.
     */
    static unregister(key: keyboardButtons): void;
    /**
     * Unregister all hotkeys;
     */
    static unregisterAll(): void;
}

export declare function getScreenSize(): [number, number];

/**
 * Get array with {handle, title, className} of all open windows.
 */
export declare function getWindow(): windowData[];
/**
 * Get window {handle} by {title} and(or) {className}.
 */
export declare function getWindow(title: string | null, className?: string | null): number;

/**
 * Get array with {handle, title, className} of all children.
 */
export declare function getWindowChild(parentHandle: number): windowData[];
/**
 * Get child handle of {parentHandle} by {className} and(or) {title}.
 */
export declare function getWindowChild(parentHandle: number, className: string | null, title?: string | null): number;

/**
 * Pause current thred for {ms} milliseconds.
 */
export declare function sleep(ms: number | [number, number]): void;