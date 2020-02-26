
#include <windows.h>
#include "hardware.hpp"

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    Hardware::Init(env, exports);
    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)