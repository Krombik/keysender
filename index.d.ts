declare type keyboardButtons = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z" | "+" | "-" | "." | "," | "?" | "~" | "[" | "]" | "|" | "'" | "backspace" | "delete" | "enter" | "tab" | "escape" | "up" | "down" | "right" | "left" | "home" | "end" | "pageup" | "pagedown" | "f1" | "f2" | "f3" | "f4" | "f5" | "f6" | "f7" | "f8" | "f9" | "f10" | "f11" | "f12" | "f13" | "f14" | "f15" | "f16" | "f17" | "f18" | "f19" | "f20" | "f21" | "f22" | "f23" | "f24" | "capslock" | "alt" | "ctrl" | "shift" | "lshift" | "rshift" | "lctrl" | "rctrl" | "lalt" | "ralt" | "space" | "prntscrn" | "insert" | "numlock" | "num0" | "num0" | "num1" | "num2" | "num3" | "num4" | "num5" | "num6" | "num7" | "num8" | "num9" | "num+" | "num-" | "num*" | "num/" | "num.";
declare type mouseButtons = "left" | "right" | "middle";
declare type keyboardEvents = "printText" | "toogleKey" | "sendKey" | "sendKeys";
declare type mouseEvents = "toogle" | "click" | "moveTo" | "moveCurveTo" | "move" | "scrollWheel";
declare type windowInfo = { x?: number, y?: number, width?: number, height?: number };
declare type img = { data: Buffer, height: number, width: number, colorAt(x: number, y: number): string };
declare type windowData = { handle: number, className: string, title: string };
export declare class Hardware {
    /**
    @param hWnd - handle of workwindow
    */
    declare constructor(hWnd: number);
    declare keyboard = {
        keyTooglerDelay: 35,
        keySenderDelay: 35,
        before(event: keyboardEvents, func: void): void { },
        after(event: keyboardEvents, func: void): void { },
        printText(text: string, keySenderDelay?: [number, number] | number = 0): void { },
        async printTextAsync(text: string, keySenderDelay?: [number, number] | number = 0): void { },
        toogleKey(key: keyboardButtons, isKeyDown?: boolean = true, delay?: [number, number] | number = this.keyTooglerDelay): void { },
        async toogleKeyAsync(key: keyboardButtons, isKeyDown?: boolean = true, delay?: [number, number] | number = this.keyTooglerDelay): void { },
        sendKey(keys: keyboardButtons, keyTooglerDelay?: [number, number] | number = this.keyTooglerDelay, keySenderDelay?: [number, number] | number = 0): void { },
        async sendKeyAsync(keys: keyboardButtons, keyTooglerDelay?: [number, number] | number = this.keyTooglerDelay, keySenderDelay?: [number, number] | number = 0): void { },
        sendKeys(keys: keyboardButtons[], keyTooglerDelay?: [number, number] | number = this.keyTooglerDelay, keySenderDelay?: [number, number] | number = keyTooglerDelay === undefined ? this.keySenderDelay : keyTooglerDelay): void { },
        async sendKeysAsync(keys: keyboardButtons[], keyTooglerDelay?: [number, number] | number = this.keyTooglerDelay, keySenderDelay?: [number, number] | number = keyTooglerDelay === undefined ? this.keySenderDelay : keyTooglerDelay): void { }
    };
    declare mouse = {
        buttonTooglerDelay: 35,
        set saveMod(bool: boolean) { },
        get saveMod(): boolean { },
        set lastCoords(coords: [number, number]) { },
        get lastCoords(): [number, number] { },
        before(event: mouseEvents, func: void): void { },
        after(event: mouseEvents, func: void): void { },
        getPos(): [number, number] { },
        toogle(isButtonDown: boolean, button?: mouseButtons = "left", buttonTooglerDelay?: [number, number] | number = this.buttonTooglerDelay): void { },
        async toogleAsync(isButtonDown: boolean, button?: mouseButtons = "left", buttonTooglerDelay?: [number, number] | number = this.buttonTooglerDelay): void { },
        click(button?: mouseButtons = "left", buttonTooglerDelay?: [number, number] | number = this.buttonTooglerDelay, buttonSenderDelay?: [number, number] | number = 0): void { },
        async clickAsync(button?: mouseButtons = "left", buttonTooglerDelay?: [number, number] | number = this.buttonTooglerDelay, buttonSenderDelay?: [number, number] | number = 0): void { },
        moveTo(x: number, y: number, delay?: [number, number] | number = 0): void { },
        async moveToAsync(x: number, y: number, delay?: [number, number] | number = 0): void { },
        moveCurveTo(x: number, y: number, speed?: number = 5, deviation?: number = 30): void { },
        async moveCurveToAsync(x: number, y: number, speed?: number = 5, deviation?: number = 30): void { },
        move(x: number, y: number, delay?: [number, number] | number = 0): void { },
        async moveAsync(x: number, y: number, delay?: [number, number] | number = 0): void { },
        scrollWheel(count?: number = 1, wheelTooglerDelay?: [number, number] | number = 0): void { },
        async scrollWheelAsync(count?: number = 1, wheelTooglerDelay?: [number, number] | number = 0): void { }
    }
    declare workwindow = {
        set is(workwindow: number) { },
        get is(): windowData { },
        set info(info: windowInfo) { },
        get info(): windowInfo { },
        on(event: "capture", func: void): void { },
        setForeground(): void { },
        isForeground(): boolean { },
        isOpen(): boolean { },
        capture(x: number, y: number, width: number, height: number): img { },
        capture(): img { },
        kill(): void { },
        close(): void { }
    }
};

export declare class Virtual extends Hardware { }

export declare class GlobalHotkey {
    static register(key: keyboardButtons, func: void): void;
    static unregister(key: keyboardButtons): void;
    static unregisterAll(): void;
}

export declare function getScreenSize(): [number, number];

export declare function getWindow(): windowData[];
export declare function getWindow(title: string, className?: string | null): number;

export declare function getWindowChild(parentHandle: number): windowData[];
export declare function getWindowChild(parentHandle: number, className: string, title?: string | null): number;

export declare function sleep(ms: number | [number, number]): void;