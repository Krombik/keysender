#pragma once
#ifndef HARDWARE_H
#define HARDWARE_H

#include "keyboard.hpp"
#include "mouse.hpp"
#include "workwindow.hpp"

class Hardware : public Keyboard, public Mouse, public Workwindow, public Napi::ObjectWrap<Hardware> {
 public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  Hardware(const Napi::CallbackInfo &info) : Napi::ObjectWrap<Hardware>(info){};

 private:
  static Napi::FunctionReference constructor;

  static const UINT extendKeys[];
  static const std::map<std::string, std::array<UINT, 2>> buttonsDef;
  int screenWidth = GetSystemMetrics(SM_CXVIRTUALSCREEN);
  int screenHeigh = GetSystemMetrics(SM_CYVIRTUALSCREEN);
  void mousePosGetter(POINT *coords);
  void mover(POINT coords, bool isAbsolute);
  void keyToggler(UINT key, bool isKeyDown);
  Napi::Value getLastCoords(const Napi::CallbackInfo &info);
  void mbToggler(std::string button, bool isButtonDown);
  void wheelScroller(int x);
  void charPrinter(std::wstring str);
#
};

#endif
