#include "keyboard.hpp"

#include "helper.hpp"

#ifdef IS_WINDOWS

void Keyboard::toggleKey(const Napi::CallbackInfo &info) {
  if (info.Length() != 2 || (!info[0].IsString() && !info[0].IsNumber()) || !info[1].IsBoolean()) {
    Napi::Error::New(info.Env(), "Expected 2 arguments: String || Number, Boolean")
        .ThrowAsJavaScriptException();

    return;
  }

  UINT keyCode;

  if (!Helper::getKeyCode(info[0], &keyCode)) {
    Napi::Error::New(info.Env(), "Wrong key name")
        .ThrowAsJavaScriptException();

    return;
  }

  keyToggler(keyCode, info[1].As<Napi::Boolean>());
}

void Keyboard::printChar(const Napi::CallbackInfo &info) {
  if (info.Length() != 1 || !info[0].IsNumber()) {
    Napi::Error::New(info.Env(), "Expected 1 argument: Number")
        .ThrowAsJavaScriptException();

    return;
  }

  charPrinter(info[0].As<Napi::Number>().Int32Value());
};

#endif