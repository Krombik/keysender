#pragma once
#ifndef HOTKEY_H
#define HOTKEY_H

#include "types.hpp"

enum HotkeyState {
  HOTKEY_REGISTERED,
  HOTKEY_REASSIGNMENT,
  HOTKEY_UNREGISTERED,
  HOTKEY_DELETED
};

struct HotkeyContext {
  HotkeyState state = HOTKEY_REGISTERED;
  UINT keyCode;
  Napi::ThreadSafeFunction tsf;
};

class Hotkey : public Napi::ObjectWrap<Hotkey> {
 public:
  Hotkey(const Napi::CallbackInfo &info) : Napi::ObjectWrap<Hotkey>(info){};
  void deleteHotkey(const Napi::CallbackInfo &info);
  void unregisterHotkey(const Napi::CallbackInfo &info);
  void reassignmentHotkey(const Napi::CallbackInfo &info);
  Napi::Value getButtonState(const Napi::CallbackInfo &info);
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  static void deleteAllHotkeys(const Napi::CallbackInfo &info);
  static void unregisterAllHotkeys(const Napi::CallbackInfo &info);

 private:
  void registerHotkey(const Napi::CallbackInfo &info);
  static Napi::FunctionReference constructor;

  HotkeyContext context;
  static std::set<HotkeyContext *> hotkeyPointers;
  static void messagesGetter(HotkeyContext *context);
  static void unregisterDuplicate(UINT keyCode);
};

#endif
