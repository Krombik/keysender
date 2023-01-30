
#include "hook.hpp"

#include "helper.hpp"

HookData Hook::mouse;
HookData Hook::keyboard;

void Hook::callStack(std::set<HookContext *> const &stack, WPARAM wParam, int16_t data) {
  for (std::set<HookContext *>::iterator it = stack.begin(); it != stack.end(); ++it) {
    HookContext &context = **it;

    if (context.data == data) {
      if (context.antagonist != 0) {
        if (wParam == context.antagonist) {
          context.state = true;
        } else if (context.state && wParam == context.wParam) {
          context.state = false;

          context.tsf.BlockingCall(&Helper::tsfCallback);
        }
      } else if (context.wParam == wParam) {
        context.tsf.BlockingCall(&Helper::tsfCallback);
      }
    }
  }
}

LRESULT CALLBACK Hook::MouseHookProc(int nCode, WPARAM wParam, LPARAM lParam) {
  if (nCode >= 0) {
    const MSLLHOOKSTRUCT *data = (MSLLHOOKSTRUCT *)lParam;

    if ((data->flags & LLMHF_INJECTED) >> 0 == 0) {
      callStack(mouse.set, wParam, data->mouseData >> 16);
    }
  }

  return CallNextHookEx(0, nCode, wParam, lParam);
}

LRESULT CALLBACK Hook::KeyboardHookProc(int nCode, WPARAM wParam, LPARAM lParam) {
  if (nCode >= 0) {
    const KBDLLHOOKSTRUCT *data = (KBDLLHOOKSTRUCT *)lParam;

    if ((data->flags & LLKHF_INJECTED) >> 4 == 0) {
      callStack(keyboard.set, wParam, data->vkCode);
    }
  }

  return CallNextHookEx(0, nCode, wParam, lParam);
}

void Hook::unregisterAllFrom(HookData &data) {
  if (data.set.size() > 0) {
    UnhookWindowsHookEx(data.hhk);

    data.hhk = nullptr;

    for (std::set<HookContext *>::iterator it = data.set.begin(); it != data.set.end(); ++it) {
      (*it)->tsf.Release();
    }

    data.set.clear();
  }
}

void Hook::unregisterAll(const Napi::CallbackInfo &info) {
  unregisterAllFrom(mouse);

  unregisterAllFrom(keyboard);
}

void Hook::setWParam(bool state, WPARAM down, WPARAM up) {
  if (state) {
    context.wParam = down;

    context.antagonist = up;
  } else {
    context.wParam = up;

    context.antagonist = 0;
  }
}

Napi::Value Hook::getButtonState(const Napi::CallbackInfo &info) {
  return Napi::Boolean::New(info.Env(), !context.state);
}

void Hook::registerHook(const Napi::CallbackInfo &info) {
  device = info[0].As<Napi::String>();

  const bool state(info[2].As<Napi::Boolean>());

  context.tsf = Napi::ThreadSafeFunction::New(info.Env(), info[3].As<Napi::Function>(), "F", 0, 1);

  if (device == "mouse") {
    const std::string button = info[1].As<Napi::String>();

    if (button != "wheel") {
      const std::array<UINT, 2> events = Helper::mouseEvents.at(button);

      setWParam(state, events[1], events[0]);

      if (button == "x1") {
        context.data = XBUTTON1;
      } else if (button == "x2") {
        context.data = XBUTTON2;
      }
    } else {
      context.wParam = WM_MOUSEWHEEL;

      context.antagonist = 0;

      context.data = state ? WHEEL_DELTA : -WHEEL_DELTA;
    }

    mouse.set.insert(&context);

    if (mouse.hhk == nullptr) {
      mouse.hhk = SetWindowsHookExW(WH_MOUSE_LL, MouseHookProc, NULL, 0);
    }
  } else if (device == "keyboard") {
    setWParam(state, WM_KEYDOWN, WM_KEYUP);

    context.data = Helper::getKeyboardKeyCode(info[1]);

    keyboard.set.insert(&context);

    if (keyboard.hhk == nullptr) {
      keyboard.hhk = SetWindowsHookExW(WH_KEYBOARD_LL, KeyboardHookProc, NULL, 0);
    }
  }
}

void Hook::unregister(const Napi::CallbackInfo &info) {
  HookData &data = device == "mouse" ? mouse : keyboard;

  if (data.set.erase(&context) > 0) {
    if (data.set.empty()) {
      UnhookWindowsHookEx(data.hhk);

      data.hhk = nullptr;
    }

    context.tsf.Release();
  }
}

Napi::FunctionReference Hook::constructor;

Napi::Object Hook::Init(Napi::Env env, Napi::Object exports) {
  Napi::HandleScope scope(env);

  Napi::Function func = DefineClass(
      env,
      "_Hook",
      {
          InstanceMethod("_register", &Hook::registerHook),
          InstanceMethod("_getButtonState", &Hook::getButtonState),
          InstanceMethod("delete", &Hook::unregister),
          StaticMethod("deleteAll", &Hook::unregisterAll),
      });

  constructor = Napi::Persistent(func);

  constructor.SuppressDestruct();

  exports.Set("_Hook", func);

  return exports;
}