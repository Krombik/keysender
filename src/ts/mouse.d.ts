import {
  EventEmitter,
  RandomFromRangeType,
  MouseButtonType,
  MouseEventType,
  PositionType,
} from "./types.d";
export declare interface mouse extends EventEmitter<MouseEventType> {
  buttonTogglerDelay: number | RandomFromRangeType;
  /** If saveMode is enable every mouse move method first back to last known coordinates ([0, 0] on first move), by default - disable. */
  enableSaveMode(bool: boolean): void;
  /** @returns current cursor position relative to workwindow. */
  getPos(): PositionType;
  /**
   * Switch mouse button state.
   * @param state - key state selection: true for press, false for release.
   * @param button - name of mouse button.
   * @param delay - milliseconds to sleep after switching mouse button state,
   * if not provided defaults to mouse.buttonTogglerDelay.
   */
  toggle(
    state: boolean,
    button?: MouseButtonType,
    delay?: number | RandomFromRangeType
  ): void;
  /**
   * Switch mouse button state async.
   * @param state - key state selection: true for press, false for release.
   * @param button - name of mouse button.
   * @param delay - milliseconds to await after switching mouse button state,
   * if not provided defaults to mouse.buttonTogglerDelay.
   */
  toggleAsync(
    state: boolean,
    button?: MouseButtonType,
    delay?: number | RandomFromRangeType
  ): Promise<void>;
  /**
   * Click mouse button.
   * @param button - name of mouse button,
   * if not provided defaults to "left".
   * @param afterPressDelay - milliseconds to sleep after mouse button pressed,
   * if not provided defaults to mouse.buttonTogglerDelay.
   * @param afterReleaseDelay - milliseconds to sleep after mouse button released,
   * if not provided defaults to 0.
   */
  click(
    button?: MouseButtonType,
    afterPressDelay?: number | RandomFromRangeType,
    afterReleaseDelay?: number | RandomFromRangeType
  ): void;
  /**
   * Click mouse button async.
   * @param button - name of mouse button,
   * if not provided defaults to "left".
   * @param afterPressDelay - milliseconds to await after mouse button pressed,
   * if not provided defaults to mouse.buttonTogglerDelay.
   * @param afterReleaseDelay - milliseconds to await after mouse button released,
   * if not provided defaults to 0.
   */
  clickAsync(
    button?: MouseButtonType,
    afterPressDelay?: number | RandomFromRangeType,
    afterReleaseDelay?: number | RandomFromRangeType
  ): Promise<void>;
  /**
   * Move mouse to [x, y].
   * @param delay - milliseconds to sleep after mouse movement,
   * if not provided defaults to 0.
   */
  moveTo(x: number, y: number, delay?: number | RandomFromRangeType): void;
  /**
   * Move mouse to [x, y] async.
   * @param delay - milliseconds to await after mouse movement,
   * if not provided defaults to 0.
   */
  moveToAsync(
    x: number,
    y: number,
    delay?: number | RandomFromRangeType
  ): Promise<void>;
  /**
   * Simulate human similar mouse movement from {lastCoords} to [x, y].
   * @param speed - move speed, if not provided defaults to 5,
   * if speed equals to "max" - immediate movement.
   * @param deviation - movement curvature, if not provided defaults to 30.
   */
  moveCurveTo(
    x: number,
    y: number,
    speed?: number | "max",
    deviation?: number
  ): void;
  /**
   * Simulate human similar mouse movement from {lastCoords} to [x, y] async.
   * @param speed - move speed, if not provided defaults to 5,
   * if speed equals to "max" - immediate movement.
   * @param deviation - movement curvature, if not provided defaults to 30.
   */
  moveCurveToAsync(
    x: number,
    y: number,
    speed?: number | "max",
    deviation?: number
  ): Promise<void>;
  /**
   * Move mouse from current position by [x, y] relatively.
   * @param delay - milliseconds to sleep after mouse movement,
   * if not provided defaults to 0.
   */
  move(x: number, y: number, delay?: number | RandomFromRangeType): void;
  /**
   * Move mouse from current position by [x, y] relatively async.
   * @param delay - milliseconds to await after mouse movement,
   * if not provided defaults to 0.
   */
  moveAsync(
    x: number,
    y: number,
    delay?: number | RandomFromRangeType
  ): Promise<void>;
  /**
   * Scroll mouse wheel.
   * @param amount - the amount of wheel movement. A positive value indicates that the wheel was rotated forward, away from the user,
   * a negative value indicates that the wheel was rotated backward, toward the user.
   * @param delay - milliseconds to sleep after wheel scroll,
   * if not provided defaults to 0.
   */
  scrollWheel(amount: number, delay?: number | RandomFromRangeType): void;
  /**
   * Scroll mouse wheel async.
   * @param amount - the amount of wheel movement. A positive value indicates that the wheel was rotated forward, away from the user,
   * a negative value indicates that the wheel was rotated backward, toward the user.
   * @param delay - milliseconds to await after wheel scroll,
   * if not provided defaults to 0.
   */
  scrollWheelAsync(
    count: number,
    delay?: number | RandomFromRangeType
  ): Promise<void>;
}
