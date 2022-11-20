#pragma once
#ifndef HOOK_H
#define HOOK_H

#include "types.hpp"

struct HookContext {
  WPARAM wParam;
  WPARAM antagonist;
  bool state = true;
  int16_t data = 0;
  Napi::ThreadSafeFunction tsf;
};

struct HookData {
  std::set<HookContext *> set;
  HHOOK hhk = nullptr;
};

class Hook : public Napi::ObjectWrap<Hook> {
 public:
  Hook(const Napi::CallbackInfo &info) : Napi::ObjectWrap<Hook>(info){};
  void registerHook(const Napi::CallbackInfo &info);
  Napi::Value getButtonState(const Napi::CallbackInfo &info);
  void unregister(const Napi::CallbackInfo &info);
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  static void unregisterAll(const Napi::CallbackInfo &info);
  static HookData mouse;
  static HookData keyboard;

 private:
  HookContext context;
  std::string device;
  void setWParam(bool state, WPARAM down, WPARAM up);
  static void unregisterAllFrom(HookData &data);
  static void callStack(std::set<HookContext *> const &stack, WPARAM wParam, int16_t data);
  static LRESULT CALLBACK KeyboardHookProc(int nCode, WPARAM wParam, LPARAM lParam);
  static LRESULT CALLBACK MouseHookProc(int nCode, WPARAM wParam, LPARAM lParam);

  static Napi::FunctionReference constructor;
};

#endif
