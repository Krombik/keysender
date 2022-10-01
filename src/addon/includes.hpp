#pragma once

#ifndef INCLUDES_H

#define INCLUDES_H
#define NAPI_VERSION 5

#if defined(__APPLE__)

#include <TargetConditionals.h>

#if defined(TARGET_OS_MAC)

#include <ApplicationServices/ApplicationServices.h>
#include <IOKit/hidsystem/IOHIDLib.h>
#include <IOKit/hidsystem/ev_keymap.h>

#define IS_MACOS

#endif

#endif

#if defined(WIN32) || defined(_WIN32) || defined(__WIN32__) || defined(__NT__)

#include <windows.h>

#define IS_WINDOWS

#endif

#include <napi.h>

#include <algorithm>
#include <array>
#include <chrono>
#include <cmath>
#include <functional>
#include <iostream>
#include <iterator>
#include <map>
#include <set>
#include <thread>
#include <vector>

#endif