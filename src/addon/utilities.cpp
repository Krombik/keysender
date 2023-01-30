#include "utilities.hpp"

#include "helper.hpp"

Napi::Value vkToString(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  std::string name = Helper::getKeyName(info[0].As<Napi::Number>());

  return name != "" ? Napi::String::New(env, name) : env.Undefined();
}

Napi::Value getAllWindows(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  std::vector<HWND> hWnds;

  EnumWindows(&Helper::EnumAllWindowsProc, reinterpret_cast<LPARAM>(&hWnds));

  Napi::Array windows = Napi::Array::New(env);

  for (const HWND &hWnd : hWnds) {
    windows[windows.Length()] = Helper::windowGetter(info, hWnd);
  }

  return windows;
}

Napi::Value textToImg(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::Object options(env, info[4]);

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
  std::wstring title, className;

  HWND hWnd = NULL;

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

  Napi::Array children = Napi::Array::New(info.Env());

  if (hWnd != NULL) {
    std::vector<HWND> hWnds;

    EnumChildWindows(hWnd, Helper::EnumChildrenProc, reinterpret_cast<LPARAM>(&hWnds));

    if (!hWnds.empty()) {
      for (const HWND &hWnd : hWnds) {
        children[children.Length()] = Helper::windowGetter(info, hWnd);
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

Napi::Value isButtonPressed(const Napi::CallbackInfo &info) {
  return Napi::Boolean::New(
      info.Env(),
      GetAsyncKeyState(std::string(info[0].As<Napi::String>()) == "mouse" ? Helper::mouseButtons.at(info[1].As<Napi::String>())
                                                                          : Helper::getKeyboardKeyCode(info[1])) < 0);
};