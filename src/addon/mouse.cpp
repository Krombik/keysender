#include "mouse.hpp"

Napi::Value Mouse::getMousePos(const Napi::CallbackInfo &info) {
  Napi::Object pos = Napi::Object::New(info.Env());

  POINT coords;

  mousePosGetter(&coords);

  pos["x"] = coords.x;
  pos["y"] = coords.y;

  return pos;
}

void Mouse::toggleMb(const Napi::CallbackInfo &info) {
  mbToggler(info[0].As<Napi::String>(), info[1].As<Napi::Boolean>());
}

void Mouse::scrollWheel(const Napi::CallbackInfo &info) {
  wheelScroller(info[0].As<Napi::Number>().Int32Value());
}

void Mouse::move(const Napi::CallbackInfo &info) {
  POINT coords = {info[0].As<Napi::Number>().Int32Value(), info[1].As<Napi::Number>().Int32Value()};

  mover(coords, info[2].As<Napi::Boolean>());
}