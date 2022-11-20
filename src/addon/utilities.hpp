#pragma once
#ifndef UTILITES_H
#define UTILITES_H

#include "types.hpp"

Napi::Value getAllWindows(const Napi::CallbackInfo &info);
Napi::Value getWindowChildren(const Napi::CallbackInfo &info);
Napi::Value getScreenSize(const Napi::CallbackInfo &info);
Napi::Value textToImg(const Napi::CallbackInfo &info);
Napi::Value vkToString(const Napi::CallbackInfo &info);
Napi::Value isButtonPressed(const Napi::CallbackInfo &info);

#endif