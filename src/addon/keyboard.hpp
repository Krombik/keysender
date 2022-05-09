#pragma once
#ifndef KEYBOARD_H
#define KEYBOARD_H

#include "includes.hpp"

Napi::Value vkToString(const Napi::CallbackInfo &info);

class Keyboard {
 public:
  void toggleKey(const Napi::CallbackInfo &info);
  void printChar(const Napi::CallbackInfo &info);

 private:
#ifdef IS_WINDOWS
  virtual void keyToggler(UINT key, bool isKeyDown) = 0;
#endif

  virtual void charPrinter(int code) = 0;
};

#endif