#include "mouse.hpp"

#ifdef IS_WINDOWS

Napi::Value Mouse::getMousePos(const Napi::CallbackInfo &info) {
  Napi::Object pos = Napi::Object::New(info.Env());

  POINT coords;

  mousePosGetter(&coords);

  pos["x"] = coords.x;
  pos["y"] = coords.y;

  return pos;
}

void Mouse::toggleMb(const Napi::CallbackInfo &info) {
  if (info.Length() != 2 || !info[0].IsString() || !info[1].IsBoolean()) {
    Napi::Error::New(info.Env(), "Expected 2 arguments: String, Boolean")
        .ThrowAsJavaScriptException();

    return;
  }

  const uint8_t button = std::distance(buttonsName.begin(), std::find(buttonsName.begin(), buttonsName.end(), std::string(info[0].As<Napi::String>())));

  if (button == buttonsName.size()) {
    Napi::Error::New(info.Env(), "Wrong button name")
        .ThrowAsJavaScriptException();

    return;
  }

  mbToggler(button, info[1].As<Napi::Boolean>());
}

void Mouse::scrollWheel(const Napi::CallbackInfo &info) {
  if (info.Length() != 1 || !info[0].IsNumber()) {
    Napi::Error::New(info.Env(), "Expected 1 argument: Number")
        .ThrowAsJavaScriptException();

    return;
  }

  wheelScroller(info[0].As<Napi::Number>().Int32Value());
}

void Mouse::move(const Napi::CallbackInfo &info) {
  if (info.Length() != 3 || !info[0].IsNumber() || !info[1].IsNumber() || !info[2].IsBoolean()) {
    Napi::Error::New(info.Env(), "Expected 3 arguments: Number, Number, Boolean")
        .ThrowAsJavaScriptException();

    return;
  }

  POINT coords = {info[0].As<Napi::Number>().Int32Value(), info[1].As<Napi::Number>().Int32Value()};

  mover(coords, info[2].As<Napi::Boolean>());
}

void Mouse::setSaveMode(const Napi::CallbackInfo &info, const Napi::Value &value) {
  if (!info[0].IsBoolean()) {
    Napi::Error::New(info.Env(), "Expected a Boolean")
        .ThrowAsJavaScriptException();

    return;
  }

  saveMode = info[0].As<Napi::Boolean>();
};

#endif