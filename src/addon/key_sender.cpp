
#include "disableInput.hpp"
#include "hardware.hpp"
#include "hook.hpp"
#include "hotkey.hpp"
#include "utilities.hpp"
#include "virtual.hpp"

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  Hardware::Init(env, exports);
  Virtual::Init(env, exports);
  Hotkey::Init(env, exports);
  Hook::Init(env, exports);

  exports["disableInput"] = Napi::Function::New(env, &DisableInput::call);
  exports["_textToImg"] = Napi::Function::New(env, textToImg);
  exports["_getAllWindows"] = Napi::Function::New(env, getAllWindows);
  exports["_getWindowChildren"] = Napi::Function::New(env, getWindowChildren);
  exports["vkToString"] = Napi::Function::New(env, vkToString);
  exports["getScreenSize"] = Napi::Function::New(env, getScreenSize);
  exports["isButtonPressed"] = Napi::Function::New(env, isButtonPressed);

  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)