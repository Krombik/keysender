#include "keyboard.hpp"

#include "helper.hpp"

void Keyboard::toggleKey(const Napi::CallbackInfo &info) {
  if (info[0].IsNumber())
    keyToggler(info[0].As<Napi::Number>(), info[1].As<Napi::Boolean>());
  else
    keyToggler(Helper::keyboardButtons.at(info[0].As<Napi::String>()),
               info[1].As<Napi::Boolean>());
}

void Keyboard::printChar(const Napi::CallbackInfo &info) {
  charPrinter(info[0].As<Napi::Number>().Int32Value());
};