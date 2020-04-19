import { EventEmitter, pos, size, img, windowData, uint8, workwindowEvent } from './types.d'
export declare interface workwindow extends EventEmitter<workwindowEvent> {
    /** Set current workwindow by {handle}. */
    set(handle: number): void;
    /** @returns object with {handle}, {title} and {className} of current workwindow. */
    get(): windowData;
    /** Set workwindow position and(or) size.
     * @param info - object {x, y, width, height}
     */
    setInfo(info: Partial<pos & size>): void;
    /** @returns object {x, y, width, height} */
    getInfo(): pos & size;
    /** Set current workwindow foreground. */
    setForeground(): void;
    isForeground(): boolean;
    isOpen(): boolean;
    /**
     * Capture part of current workwindow (or screen if {handle} is 0).
     * @param part - position of top left corner and size to be capture
     * @param format - color format of return data, could be "rgba", "bgra", "grey", "monochrome"
     * if not provided defaults to "rgba".
     * @param threshold - color limit for "monochrome" format, if the pixel value is smaller than the threshold, it is set to 0, otherwise it is set to 255
     * if not provided defaults to 127.
     * @returns object {data, width, height}.
     */
    capture(part: pos & size, format?: "rgba" | "bgra" | "grey"): img;
    capture(part: pos & size, format: "monochrome", threshold?: uint8): img;
    capture(format?: "rgba" | "bgra" | "grey"): img;
    capture(format: "monochrome", threshold?: uint8): img;
    /** @param returnType - type of return value, "string" for hexadecimal color representation "rrggbb", "array" for array representation of color [r,g,b], "number" for color representation in decimal
     * if not provided defaults to "string".
     * @returns pixel color in [x, y] from current workwindow (or screen if {handle} is 0). */
    colorAt(x: number, y: number, returnType?: "string"): string;
    colorAt(x: number, y: number, returnType: "array"): [uint8, uint8, uint8];
    colorAt(x: number, y: number, returnType: "number"): number;
    /** Terminate current workwindow by killing it's thread.*/
    kill(): void;
    /** Close current workwindow by sending close message. */
    close(): void;
}

/** @returns object {width, height} with screen size. */
export declare function getScreenSize(): size;

/** Get array with objects {handle, title, className} of all open windows. */
export declare function getWindow(): windowData[];
/** Get window {handle} by {title} and(or) {className}. */
export declare function getWindow(title: string | null, className?: string | null): number;

/** Get array with objects {handle, title, className} of all {parentHandle} children. */
export declare function getWindowChild(parentHandle: number): windowData[];
/** Get {handle} of {parentHandle} child by {className} and(or) {title}. */
export declare function getWindowChild(parentHandle: number, className: string | null, title?: string | null): number;
