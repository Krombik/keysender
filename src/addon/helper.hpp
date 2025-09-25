#pragma once
#ifndef HELPER_H
#define HELPER_H

#include "types.hpp"

class Helper {
 public:
  static std::wstring bufferToWstring(const Napi::Value &value);
  static void tsfCallback(Napi::Env env, Napi::Function jsCallback);
  static std::string getKeyName(UINT vkCode);
  static std::wstring classNameGetter(HWND hWnd);
  static std::wstring titleGetter(HWND hWnd);
  static Napi::Object windowGetter(const Napi::CallbackInfo &info, HWND hWnd);
  static BOOL CALLBACK EnumWindowsProc(HWND hWnd, LPARAM lParam);
  static BOOL CALLBACK EnumAllWindowsProc(HWND hWnd, LPARAM lParam);
  static BOOL CALLBACK EnumChildrenProc(HWND hWnd, LPARAM lParam);
  static UINT getKeyboardKeyCode(const Napi::Value &value);
  static const std::map<std::string, UINT> mouseButtons;
  static const std::map<std::string, UINT> keyboardButtons;
  static const std::map<std::string, std::array<UINT, 2>> mouseEvents;
};

#endif