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
  virtual void keyToggler(UINT key, bool isKeyDown) = 0;
  virtual void charPrinter(std::wstring str) = 0;
};

#endif