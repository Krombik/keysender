#pragma once
#ifndef VIRTUAL_H
#define VIRTUAL_H

#include "keyboard.hpp"
#include "mouse.hpp"
#include "workwindow.hpp"

class Virtual : public Keyboard, public Mouse, public Workwindow, public Napi::ObjectWrap<Virtual> {
 public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  Virtual(const Napi::CallbackInfo &info) : Napi::ObjectWrap<Virtual>(info){};

 private:
  static Napi::FunctionReference constructor;

  static const std::map<std::string, UINT> wParams;
  void mousePosGetter(POINT *coords);
  void mover(POINT coords, bool isAbsolute);
  void keyToggler(UINT key, bool isKeyDown);

  Napi::Value getLastCoords(const Napi::CallbackInfo &info);
  void mbToggler(std::string button, bool isButtonDown);
  void wheelScroller(int x);
  void charPrinter(std::wstring str);
};

#endif
