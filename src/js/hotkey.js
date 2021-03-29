const { _GlobalHotkey } = require("../../build/Release/key_sender.node");

module.exports.GlobalHotkey = class extends _GlobalHotkey {
  constructor({
    key,
    isEnabled,
    action,
    mode,
    delay = 0,
    finalizerCallback,
    getProps,
    updateState,
    initialState,
    initialProps,
  }) {
    super();
    let isWorking = false;
    const _action = action.bind(this);
    let getCurrentProps;
    let prevProps = initialProps;
    if (getProps) {
      let state = initialState;
      let prevState = initialState;
      const _getProps = getProps && getProps.bind(this);
      const _updateState = updateState && updateState.bind(this);
      getCurrentProps = (_updateState
        ? function () {
            const currSate = _updateState(state);
            const currProps = _getProps(currSate, prevState, prevProps);
            prevProps = currProps;
            prevState = state || currSate;
            state = currSate;
            return currProps;
          }
        : function () {
            const currProps = _getProps(state, prevState, prevProps);
            prevState = state;
            prevProps = currProps;
            return currProps;
          }
      ).bind(this);

      this.setState = (arg) => {
        state = typeof arg === "function" ? arg(state) : arg;
      };
      this.getState = () => state;
    }
    const _isEnabled = isEnabled && isEnabled.bind(this);
    const _finalizerCallback =
      finalizerCallback && finalizerCallback.bind(this);
    this._register(
      key,
      mode || "once",
      mode === "toggle"
        ? async () => {
            if ((this.hotkeyState = !this.hotkeyState)) {
              if (isWorking || (_isEnabled && !(await _isEnabled()))) {
                this.hotkeyState = false;
                return;
              }
              isWorking = true;
              const props = getCurrentProps && getCurrentProps();
              while (this.hotkeyState && (await _action(props)))
                await new Promise((_) => setTimeout(_, delay));
              if (_finalizerCallback)
                await _finalizerCallback(
                  props,
                  _finalizerCallback.length > 1 &&
                    (this._reason || (this.hotkeyState ? "ended" : "toggled"))
                );
              this.hotkeyState = false;
              this._reason = undefined;
              isWorking = false;
            }
          }
        : mode === "hold"
        ? async () => {
            if (isWorking || (_isEnabled && !(await _isEnabled()))) return;
            isWorking = true;
            const props = getCurrentProps && getCurrentProps();
            if (_finalizerCallback) {
              if (_finalizerCallback.length < 2) {
                while (this.hotkeyState && (await _action(props)))
                  await new Promise((_) => setTimeout(_, delay));
                await _finalizerCallback(props);
              } else {
                let hotkeyState;
                while (
                  (hotkeyState = this.hotkeyState) &&
                  (await _action(props))
                )
                  await new Promise((_) => setTimeout(_, delay));
                await _finalizerCallback(
                  props,
                  hotkeyState ? "ended" : "released"
                );
              }
            } else {
              while (this.hotkeyState && (await _action(props)))
                await new Promise((_) => setTimeout(_, delay));
            }
            isWorking = false;
          }
        : async () => {
            if (isWorking || (_isEnabled && !(await _isEnabled()))) return;
            isWorking = true;
            await _action(getCurrentProps && getCurrentProps());
            isWorking = false;
          }
    );
  }
  stop(reason = "stopped") {
    this.hotkeyState = false;
    this._reason = reason;
  }
};
