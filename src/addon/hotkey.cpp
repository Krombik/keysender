
#include "hotkey.hpp"

#include "helper.hpp"

std::set<HotkeyContext *> Hotkey::hotkeyPointers;

Napi::Value Hotkey::getButtonState(const Napi::CallbackInfo &info) {
  return Napi::Boolean::New(info.Env(), GetAsyncKeyState(context.keyCode) < 0);
}

void Hotkey::unregisterDuplicate(UINT keyCode) {
  for (std::set<HotkeyContext *>::iterator it = hotkeyPointers.begin(); it != hotkeyPointers.end(); ++it) {
    HotkeyContext &context = **it;

    if (context.keyCode == keyCode) {
      context.keyCode = NONEXISTENT_VIRTUAL_KEY;

      context.state = HOTKEY_UNREGISTERED;

      return;
    }
  }
}

void Hotkey::messagesGetter(HotkeyContext *context) {
  MSG msg = {0};

  const UINT keyCode = context->keyCode;

  RegisterHotKey(NULL, 0, NULL, keyCode);

  uint8_t prevState = 2;

  uint8_t currState;

  while (context->state == HOTKEY_REGISTERED && GetMessageW(&msg, NULL, 0, 0)) {
    if (msg.message == WM_HOTKEY) {
      currState = GetKeyState(keyCode) & 1;

      if (currState != prevState) {
        prevState = currState;

        context->tsf.BlockingCall(&Helper::tsfCallback);
      }
    }
  }

  UnregisterHotKey(NULL, 0);

  if (context->state == HOTKEY_REASSIGNMENT) {
    context->state = HOTKEY_REGISTERED;

    messagesGetter(context);
  } else if (context->state == HOTKEY_DELETED) {
    context->tsf.Release();

    delete context;
  }
}

void Hotkey::registerHotkey(const Napi::CallbackInfo &info) {
  const UINT keyCode = Helper::getKeyboardKeyCode(info[0]);

  if (!hotkeyPointers.empty()) {
    unregisterDuplicate(keyCode);
  }

  context.keyCode = keyCode;

  context.tsf = Napi::ThreadSafeFunction::New(info.Env(), info[1].As<Napi::Function>(), "F", 0, 1);

  hotkeyPointers.insert(&context);

  CreateThread(NULL, NULL, (LPTHREAD_START_ROUTINE)messagesGetter, &context, NULL, NULL);
}

void Hotkey::reassignmentHotkey(const Napi::CallbackInfo &info) {
  const UINT keyCode = Helper::getKeyboardKeyCode(info[0]);

  if (hotkeyPointers.size() > 1) {
    unregisterDuplicate(keyCode);
  }

  context.keyCode = keyCode;

  if (context.state == HOTKEY_REGISTERED) {
    context.state = HOTKEY_REASSIGNMENT;
  } else if (context.state == HOTKEY_UNREGISTERED) {
    context.state = HOTKEY_REGISTERED;

    CreateThread(NULL, NULL, (LPTHREAD_START_ROUTINE)messagesGetter, &context, NULL, NULL);
  }
}

void Hotkey::unregisterHotkey(const Napi::CallbackInfo &info) {
  context.keyCode = NONEXISTENT_VIRTUAL_KEY;

  context.state = HOTKEY_UNREGISTERED;
}

void Hotkey::unregisterAllHotkeys(const Napi::CallbackInfo &info) {
  std::for_each(
      hotkeyPointers.begin(),
      hotkeyPointers.end(),
      [](HotkeyContext *context) {
        context->state = HOTKEY_UNREGISTERED;

        context->keyCode = NONEXISTENT_VIRTUAL_KEY;
      });
}

void Hotkey::deleteHotkey(const Napi::CallbackInfo &info) {
  context.state = HOTKEY_DELETED;

  hotkeyPointers.erase(&context);
}

void Hotkey::deleteAllHotkeys(const Napi::CallbackInfo &info) {
  std::for_each(
      hotkeyPointers.begin(),
      hotkeyPointers.end(),
      [](HotkeyContext *context) {
        context->state = HOTKEY_DELETED;
      });

  hotkeyPointers.clear();
}

Napi::FunctionReference Hotkey::constructor;

Napi::Object Hotkey::Init(Napi::Env env, Napi::Object exports) {
  Napi::HandleScope scope(env);

  Napi::Function func = DefineClass(
      env,
      "_GlobalHotkey",
      {
          InstanceMethod("_register", &Hotkey::registerHotkey),
          InstanceMethod("_getButtonState", &Hotkey::getButtonState),
          InstanceMethod("unregister", &Hotkey::unregisterHotkey),
          InstanceMethod("delete", &Hotkey::deleteHotkey),
          InstanceMethod("reassignment", &Hotkey::reassignmentHotkey),
          StaticMethod("unregisterAll", &Hotkey::unregisterAllHotkeys),
          StaticMethod("deleteAll", &Hotkey::deleteAllHotkeys),
      });

  constructor = Napi::Persistent(func);

  constructor.SuppressDestruct();

  exports.Set("_GlobalHotkey", func);

  return exports;
}