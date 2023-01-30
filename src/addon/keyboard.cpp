#include "keyboard.hpp"

#include "helper.hpp"

void Keyboard::toggleKey(const Napi::CallbackInfo &info) {
  keyToggler(Helper::getKeyboardKeyCode(info[0]), info[1].As<Napi::Boolean>());
}

void Keyboard::printChar(const Napi::CallbackInfo &info) {
  charPrinter(Helper::bufferToWstring(info[0]));
};