
#include "disableInput.hpp"

#include "helper.hpp"

DisableInputData DisableInput::mouse;
DisableInputData DisableInput::keyboard;

std::vector<BlockedInput> DisableInput::blockedInputs;

const std::map<int, int> DisableInput::downUpMap = {{WM_LBUTTONDOWN, WM_LBUTTONUP},
                                                    {WM_RBUTTONDOWN, WM_RBUTTONUP},
                                                    {WM_MBUTTONDOWN, WM_MBUTTONUP},
                                                    {WM_XBUTTONDOWN, WM_XBUTTONUP},
                                                    {WM_KEYDOWN, WM_KEYUP}};

bool DisableInput::check(DisableInputData &data, WPARAM wParam, int16_t vkCode) {
  if (data.inverted) {
    for (std::set<DisableInputContext>::iterator it = data.enabled.begin(); it != data.enabled.end(); ++it) {
      DisableInputContext ctx = *it;

      if (ctx.vkCode == vkCode && (wParam == ctx.down || ctx.action == wParam)) {
        return false;
      }
    }

    if (downUpMap.find(wParam) != downUpMap.end()) {
      const size_t size = data.pressedButtons.size();

      data.pressedButtons.insert(MAKELONG(downUpMap.at(wParam), vkCode));

      if (data.pressedButtons.size() > size) {
        blockedInputs.push_back({wParam, vkCode});
      }
    } else if (wParam != WM_MOUSEMOVE) {
      data.pressedButtons.erase(MAKELONG(wParam, vkCode));

      blockedInputs.push_back({wParam, vkCode});
    }

    return true;
  }

  for (std::set<DisableInputContext>::iterator it = data.disabled.begin(); it != data.disabled.end(); ++it) {
    DisableInputContext ctx = *it;

    if (ctx.vkCode == vkCode) {
      const bool isDown = wParam == ctx.down;

      if (isDown || ctx.action == wParam) {
        if (isDown) {
          const size_t size = data.pressedButtons.size();

          data.pressedButtons.insert(MAKELONG(ctx.action, vkCode));

          if (data.pressedButtons.size() > size) {
            blockedInputs.push_back({wParam, vkCode});
          }
        } else if (wParam != WM_MOUSEMOVE) {
          data.pressedButtons.erase(MAKELONG(ctx.action, vkCode));

          blockedInputs.push_back({wParam, vkCode});
        }

        return true;
      }
    }
  }

  return false;
}

LRESULT CALLBACK DisableInput::MouseHookProc(int nCode, WPARAM wParam, LPARAM lParam) {
  if (nCode >= 0) {
    const MSLLHOOKSTRUCT *data = (MSLLHOOKSTRUCT *)lParam;

    if ((data->flags & LLMHF_INJECTED) >> 0 == 0 && check(mouse, wParam, data->mouseData >> 16)) {
      return -1;
    }
  }

  return CallNextHookEx(0, nCode, wParam, lParam);
}

LRESULT CALLBACK DisableInput::KeyboardHookProc(int nCode, WPARAM wParam, LPARAM lParam) {
  if (nCode >= 0) {
    const KBDLLHOOKSTRUCT *data = (KBDLLHOOKSTRUCT *)lParam;

    if ((data->flags & LLKHF_INJECTED) >> 4 == 0 && check(keyboard, wParam, data->vkCode)) {
      return -1;
    }
  }

  return CallNextHookEx(0, nCode, wParam, lParam);
}

DisableInputContext DisableInput::handleMouse(const Napi::Value &action) {
  DisableInputContext item;

  const std::string key = action.As<Napi::String>();

  if (key == "move") {
    item.action = WM_MOUSEMOVE;
  } else if (key == "wheel-forward" || key == "wheel-back") {
    item.action = WM_MOUSEWHEEL;

    item.vkCode = "wheel-forward" ? WHEEL_DELTA : -WHEEL_DELTA;
  } else {
    if (key == "left") {
      item.down = WM_LBUTTONDOWN;
    } else if (key == "right") {
      item.down = WM_RBUTTONDOWN;
    } else if (key == "middle") {
      item.down = WM_MBUTTONDOWN;
    } else {
      item.down = WM_XBUTTONDOWN;

      item.vkCode = key == "x1" ? XBUTTON1 : XBUTTON2;
    }

    item.action = downUpMap.at(item.down);
  }

  return item;
}

DisableInputContext DisableInput::handleKeyboard(const Napi::Value &action) {
  DisableInputContext item;

  item.down = WM_KEYDOWN;

  item.action = downUpMap.at(item.down);

  item.vkCode = Helper::getKeyboardKeyCode(action);

  return item;
}

void DisableInput::cleanup(DisableInputData &data) {
  if (data.hhk != nullptr) {
    UnhookWindowsHookEx(data.hhk);

    data.hhk = nullptr;
  }

  data.disabled.clear();

  data.inverted = false;

  data.enabled.clear();
}

void DisableInput::enable(DisableInputData &data, const Napi::Value &value, std::function<DisableInputContext(Napi::Value)> handleItem, size_t count) {
  if (value.IsArray()) {
    Napi::Array actions = value.As<Napi::Array>();

    if (data.inverted) {
      for (size_t i = 0; i < actions.Length(); i++) {
        data.enabled.insert(handleItem(actions.Get(i)));
      }

      if (data.enabled.size() == count) {
        cleanup(data);
      }
    } else {
      for (size_t i = 0; i < actions.Length(); i++) {
        data.disabled.erase(handleItem(actions.Get(i)));
      }

      if (data.disabled.empty()) {
        cleanup(data);
      }
    }
  } else {
    cleanup(data);
  }
}

void DisableInput::disable(DisableInputData &data, const Napi::Value &value, std::function<DisableInputContext(Napi::Value)> handleItem, int idHook, HOOKPROC lpfn) {
  if (value.IsArray()) {
    Napi::Array actions = value.As<Napi::Array>();

    if (data.inverted) {
      for (size_t i = 0; i < actions.Length(); i++) {
        data.enabled.erase(handleItem(actions.Get(i).As<Napi::String>()));
      }
    } else {
      if (!actions.IsEmpty()) {
        for (size_t i = 0; i < actions.Length(); i++) {
          data.disabled.insert(handleItem(actions.Get(i).As<Napi::String>()));
        }

        if (data.hhk == nullptr) {
          data.hhk = SetWindowsHookExW(idHook, lpfn, NULL, 0);
        }
      }
    }
  } else if (data.inverted) {
    data.enabled.clear();
  } else {
    data.inverted = true;

    if (data.hhk == nullptr) {
      data.hhk = SetWindowsHookExW(idHook, lpfn, NULL, 0);
    }
  }
}

MouseInput DisableInput::getMouseInput(const BlockedInput &blockedInput) {
  bool state = blockedInput.wParam == WM_LBUTTONDOWN;

  if (state || blockedInput.wParam == WM_LBUTTONUP) {
    return {"left", state};
  }

  state = blockedInput.wParam == WM_RBUTTONDOWN;

  if (state || blockedInput.wParam == WM_RBUTTONUP) {
    return {"right", state};
  }

  state = blockedInput.wParam == WM_MBUTTONDOWN;

  if (state || blockedInput.wParam == WM_MBUTTONUP) {
    return {"middle", state};
  }

  state = blockedInput.vkCode == WHEEL_DELTA;

  if (state || blockedInput.vkCode == -WHEEL_DELTA) {
    return {"wheel", state};
  }

  return {blockedInput.vkCode == XBUTTON1 ? "x1" : "x2", blockedInput.wParam == WM_XBUTTONDOWN};
}

Napi::Object DisableInput::mapBlockedItem(const Napi::Env &env, const BlockedInput &blockedInput, std::map<BlockedInput, Napi::Object> &itemMap) {
  if (itemMap.find(blockedInput) != itemMap.end()) {
    return itemMap.at(blockedInput);
  }

  Napi::Object item = Napi::Object::New(env);

  const bool isKeyDown = blockedInput.wParam == WM_KEYDOWN;

  const bool isKeyboard = isKeyDown || blockedInput.wParam == WM_KEYUP;

  if (isKeyboard) {
    item["device"] = Napi::String::New(env, "keyboard");

    item["button"] = Napi::String::New(env, Helper::getKeyName(blockedInput.vkCode));

    item["state"] = Napi::Boolean::New(env, isKeyDown);
  } else {
    item["device"] = Napi::String::New(env, "mouse");

    const MouseInput input = getMouseInput(blockedInput);

    item["button"] = Napi::String::New(env, input.button);

    item["state"] = Napi::Boolean::New(env, input.state);
  }

  return item;
}

Napi::Value DisableInput::call(const Napi::CallbackInfo &info) {
  const Napi::Env env = info.Env();

  Napi::Object options = info[1].IsObject() ? info[1].As<Napi::Object>() : Napi::Object::New(env);

  if (bool(info[0].As<Napi::Boolean>())) {
    disable(mouse, options.Get("mouse"), &handleMouse, WH_MOUSE_LL, MouseHookProc);

    disable(keyboard, options.Get("keyboard"), &handleKeyboard, WH_KEYBOARD_LL, KeyboardHookProc);

    return env.Undefined();
  }

  enable(mouse, options.Get("mouse"), &handleMouse, 8);

  enable(keyboard, options.Get("keyboard"), &handleKeyboard, Helper::keyboardButtons.size());

  Napi::Array arr = Napi::Array::New(env);

  std::map<BlockedInput, Napi::Object> itemMap;

  for (size_t i = 0; i < blockedInputs.size(); i++) {
    arr.Set(i, mapBlockedItem(env, blockedInputs[i], itemMap));
  }

  blockedInputs.clear();

  return arr;
}