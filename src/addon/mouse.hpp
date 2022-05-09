#pragma once
#ifndef MOUSE_H
#define MOUSE_H

#include "includes.hpp"

class Mouse {
 public:
  Napi::Value getMousePos(const Napi::CallbackInfo &info);
  void toggleMb(const Napi::CallbackInfo &info);
  void move(const Napi::CallbackInfo &info);
  void scrollWheel(const Napi::CallbackInfo &info);

 private:
  std::array<std::string, 3> buttonsName = {"left", "right", "middle"};

 protected:
#ifdef IS_WINDOWS
  POINT lastCoords = {0, 0};
  virtual void mousePosGetter(POINT *coords) = 0;
  virtual void mover(POINT coords, bool isAbsolute) = 0;
#endif

  bool saveMode = false;
  void setSaveMode(const Napi::CallbackInfo &info, const Napi::Value &value);
  virtual void mbToggler(uint8_t button, bool isButtonDown) = 0;
  virtual void wheelScroller(int x) = 0;
};

#endif