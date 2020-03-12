
#include <windows.h>
#include "hardware.hpp"
#include "virtual.hpp"

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    Hardware::Init(env, exports);
    Virtual::Init(env, exports);
    exports["_sleep"] = Napi::Function::New(env, sleep);
    exports["_getWindow"] = Napi::Function::New(env, getWindow);
    exports["getWindowChild"] = Napi::Function::New(env, getWindowChild);
    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)