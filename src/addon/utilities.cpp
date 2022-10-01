#include "utilities.hpp"

#include "helper.hpp"

#ifdef IS_WINDOWS

Napi::Value vkToString(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (info.Length() != 1 || !info[0].IsNumber()) {
    Napi::Error::New(env, "Expected 1 arguments: Number")
        .ThrowAsJavaScriptException();

    return env.Undefined();
  }

  UINT keyCode = info[0].As<Napi::Number>();

  for (auto it = Helper::keysDef.begin(); it != Helper::keysDef.end(); ++it) {
    if (it->second == keyCode) {
      return Napi::String::New(env, it->first);
    }
  }

  return env.Undefined();
}

Napi::Value getAllWindows(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  std::vector<HWND> hWnds;

  EnumWindows(Helper::EnumAllWindowsProc, reinterpret_cast<LPARAM>(&hWnds));

  Napi::Array windows = Napi::Array::New(env);

  for (const HWND &hWnd : hWnds) {
    windows[windows.Length()] = Helper::windowGetter(hWnd, env);
  }

  return windows;
}

Napi::Value textToImg(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (!info[0].IsBuffer() || !info[1].IsBuffer() || !info[2].IsBuffer() || !info[3].IsNumber() || !info[4].IsObject()) {
    Napi::Error::New(env, "Expected 5 arguments: Buffer, Buffer, Buffer, Number, Object")
        .ThrowAsJavaScriptException();

    return env.Undefined();
  }

  Napi::Object options(env, info[4]);

  if (!options.Get("color").IsNumber() || !options.Get("backgroundColor").IsNumber() || !options.Get("enableActualHeight").IsBoolean() || !options.Get("enableAntiAliasing").IsBoolean() || !options.Get("format").IsString()) {
    Napi::Error::New(env, "Wrong options")
        .ThrowAsJavaScriptException();

    return env.Undefined();
  }

  RECT rect = {0, 0, 0, 0};

  std::wstring text = Helper::bufferToWstring(info[0]);

  std::wstring path = Helper::bufferToWstring(info[1]);

  std::wstring fontName = Helper::bufferToWstring(info[2]);

  uint16_t fontSize = info[3].As<Napi::Number>().Int32Value();

  UINT fontFormat = DT_SINGLELINE;

  DWORD fontQuality = DEFAULT_QUALITY;

  if (!bool(options.Get("enableAntiAliasing").As<Napi::Boolean>())) {
    fontFormat |= DT_NOCLIP;
    fontQuality = NONANTIALIASED_QUALITY;
  }

  AddFontResourceExW(path.data(), FR_PRIVATE | FR_NOT_ENUM, 0);

  HFONT mhFont = CreateFontW(-fontSize, NULL, NULL, NULL, FW_NORMAL, FALSE, FALSE, FALSE, DEFAULT_CHARSET, OUT_TT_ONLY_PRECIS,
                             CLIP_DEFAULT_PRECIS, fontQuality, DEFAULT_PITCH | FF_DONTCARE, fontName.data());

  HDC memDC = CreateCompatibleDC(NULL);

  SelectObject(memDC, mhFont);

  DrawTextW(memDC, text.data(), text.size(), &rect, DT_CALCRECT | fontFormat);

  if (bool(options.Get("enableActualHeight").As<Napi::Boolean>())) {
    fontFormat |= DT_BOTTOM;
    rect.bottom = fontSize;
  }

  MAKEBITMAPINFO bi(rect.bottom, rect.right);

  uint8_t *pixels;

  HBITMAP section = CreateDIBSection(memDC, &bi, DIB_RGB_COLORS, (void **)&pixels, 0, 0);

  DeleteObject(SelectObject(memDC, section));

  SetTextColor(memDC, (COLORREF)options.Get("color").As<Napi::Number>().Int32Value());

  SetBkMode(memDC, OPAQUE);

  SetBkColor(memDC, (COLORREF)options.Get("backgroundColor").As<Napi::Number>().Int32Value());

  DrawTextW(memDC, text.data(), text.size(), &rect, fontFormat);

  DeleteDC(memDC);

  Napi::Object img = Napi::Object::New(env);

  size_t size = rect.bottom * rect.right * 4;

  std::string format = options.Get("format").As<Napi::String>();

  if (format == "rgba") {
    for (size_t i = 0; i < size; i += 4) {
      std::swap(pixels[i], pixels[i + 2]);

      pixels[i + 3] = 255;
    }
  } else if (format == "grey") {
    size_t j = 0;

    for (size_t i = 0; i < size; i += 4, j++) {
      pixels[j] = pixels[i] * 0.114 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.299;
    }

    memcpy(pixels, pixels, j);

    size = j;
  }

  img["width"] = rect.right;
  img["height"] = rect.bottom;

  Napi::Buffer<uint8_t> imgData = Napi::Buffer<uint8_t>::New(env, pixels, size);

  imgData.AddFinalizer(
      [](Napi::Env env, HBITMAP section) {
        DeleteObject(section);
      },
      section);

  img["data"] = imgData;

  DeleteObject(mhFont);

  RemoveFontResourceExW(path.data(), FR_PRIVATE | FR_NOT_ENUM, 0);

  return img;
}

Napi::Value getWindowChildren(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  std::wstring title, className;

  HWND hWnd = NULL;

  if (info.Length() < 1 || info.Length() > 2 || (!info[0].IsBuffer() && !info[0].IsNull() && !info[0].IsNumber()) || (!info[1].IsBuffer() && !info[1].IsNull() && !info[1].IsUndefined()) || (info[0].IsNull() && info[1].IsNull())) {
    Napi::Error::New(info.Env(), "Expected 1-2 arguments: Buffer || Null || Number, Buffer || Null")
        .ThrowAsJavaScriptException();

    return env.Undefined();
  }
  if (info[0].IsNumber()) {
    hWnd = (HWND)info[0].As<Napi::Number>().Int64Value();
  } else {
    WindowInfo *windowInfo = new WindowInfo;

    if (info[0].IsBuffer()) {
      windowInfo->title = Helper::bufferToWstring(info[0]);
    }

    if (info[1].IsBuffer()) {
      windowInfo->className = Helper::bufferToWstring(info[1]);
    }

    EnumWindows(Helper::EnumWindowsProc, (LPARAM)windowInfo);

    hWnd = windowInfo->hWnd;

    delete windowInfo;
  }

  Napi::Array children = Napi::Array::New(env);

  if (hWnd != NULL) {
    std::vector<HWND> hWnds;

    EnumChildWindows(hWnd, Helper::EnumChildrenProc, reinterpret_cast<LPARAM>(&hWnds));

    if (!hWnds.empty()) {
      for (const HWND &hWnd : hWnds) {
        children[children.Length()] = Helper::windowGetter(hWnd, env);
      }
    }
  }

  return children;
}

Napi::Value getScreenSize(const Napi::CallbackInfo &info) {
  Napi::Object screenSize = Napi::Object::New(info.Env());

  screenSize["width"] = GetSystemMetrics(SM_CXVIRTUALSCREEN);
  screenSize["height"] = GetSystemMetrics(SM_CYVIRTUALSCREEN);

  return screenSize;
}

#endif