#pragma once
#ifndef WORKWINDOW_H
#define WORKWINDOW_H

#include "types.hpp"

class Workwindow {
 public:
  Napi::Value capture(const Napi::CallbackInfo &info);
  Napi::Value refresh(const Napi::CallbackInfo &info);
  Napi::Value getColor(const Napi::CallbackInfo &info);
  Napi::Value isForeground(const Napi::CallbackInfo &info);
  Napi::Value isOpen(const Napi::CallbackInfo &info);
  void setForeground(const Napi::CallbackInfo &info);
  void kill(const Napi::CallbackInfo &info);
  void close(const Napi::CallbackInfo &info);

  static BOOL CALLBACK EnumWindowsProc(HWND hWnd, LPARAM lParam);
  static BOOL CALLBACK EnumChildProc(HWND hWnd, LPARAM lParam);

 protected:
  HWND hWnd = NULL;

  std::wstring title, className, childTitle, childClassName;
  void setWorkwindow(const Napi::CallbackInfo &info);
  Napi::Value getWorkwindow(const Napi::CallbackInfo &info);
  void setWindowView(const Napi::CallbackInfo &info);
  Napi::Value getWindowView(const Napi::CallbackInfo &info);
};

#endif
