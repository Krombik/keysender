#include "workwindow.hpp"

#include "helper.hpp"

Napi::Value Workwindow::capture(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  RECT rect = {0, 0, 0, 0};

  int width, height;

  std::string format = "rgba";

  uint8_t threshold = 127;

  if (info[0].IsObject()) {
    Napi::Object part(env, info[0]);

    rect.left = part.Get("x").As<Napi::Number>().Int32Value();

    rect.top = part.Get("y").As<Napi::Number>().Int32Value();

    width = part.Get("width").As<Napi::Number>().Int32Value();

    height = part.Get("height").As<Napi::Number>().Int32Value();

    if (info[1].IsString()) {
      format = info[1].As<Napi::String>();
    }

    if (info[2].IsNumber()) {
      threshold = info[2].As<Napi::Number>().Int32Value();
    }
  } else {
    if (info[0].IsString()) {
      format = info[0].As<Napi::String>();
    }

    if (info[1].IsNumber()) {
      threshold = info[1].As<Napi::Number>().Int32Value();
    }

    if (hWnd != NULL) {
      GetClientRect(hWnd, &rect);

      width = rect.right - rect.left;

      height = rect.bottom - rect.top;
    } else {
      width = GetSystemMetrics(SM_CXVIRTUALSCREEN);

      height = GetSystemMetrics(SM_CYVIRTUALSCREEN);
    }
  }

  HDC context = GetDC(hWnd);

  MAKEBITMAPINFO bi(height, width);

  uint8_t *pixels;

  HBITMAP section = CreateDIBSection(context, &bi, DIB_RGB_COLORS, (void **)&pixels, 0, 0);

  if (pixels == nullptr) {
    return env.Undefined();
  }

  HDC memDC = CreateCompatibleDC(context);

  DeleteObject(SelectObject(memDC, section));

  BitBlt(memDC, 0, 0, width, height, context, rect.left, rect.top, SRCCOPY);

  DeleteDC(memDC);

  ReleaseDC(hWnd, context);

  Napi::Object img = Napi::Object::New(env);

  size_t size = height * width * 4;

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
  } else if (format == "monochrome") {
    size_t j = 0;

    for (size_t i = 0; i < size; i += 4, j++) {
      pixels[j] = pixels[i] * 0.114 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.299 < threshold ? 0 : 255;
    }

    memcpy(pixels, pixels, j);

    size = j;
  }

  img["width"] = width;

  img["height"] = height;

  Napi::Buffer<uint8_t> imgData = Napi::Buffer<uint8_t>::New(env, pixels, size);

  imgData.AddFinalizer([](Napi::Env env, HBITMAP section) { DeleteObject(section); },
                       section);

  img["data"] = imgData;

  return img;
}

Napi::Value Workwindow::getColor(const Napi::CallbackInfo &info) {
  HDC context = GetDC(hWnd);

  const unsigned int color = GetPixel(context, info[0].As<Napi::Number>().Int32Value(), info[1].As<Napi::Number>().Int32Value());

  ReleaseDC(hWnd, context);

  return Napi::Number::New(info.Env(), color);
}

void Workwindow::kill(const Napi::CallbackInfo &info) {
  DWORD pid;

  GetWindowThreadProcessId(hWnd, &pid);

  HANDLE hThread = OpenProcess(SYNCHRONIZE | PROCESS_TERMINATE, TRUE, pid);

  TerminateProcess(hThread, 0);

  CloseHandle(hThread);
}

void Workwindow::close(const Napi::CallbackInfo &info) {
  SendMessage(hWnd, WM_CLOSE, NULL, NULL);
}

BOOL CALLBACK Workwindow::EnumWindowsProc(HWND hWnd, LPARAM lParam) {
  if (!IsWindowVisible(hWnd) || !IsWindowEnabled(hWnd) || GetWindowTextLengthA(hWnd) == 0) {
    return TRUE;
  }

  Workwindow *self = (Workwindow *)lParam;

  if (!self->className.empty() && Helper::classNameGetter(hWnd).compare(self->className) != 0) {
    return TRUE;
  }
  if (!self->title.empty() && Helper::titleGetter(hWnd).compare(self->title) != 0) {
    return TRUE;
  }

  self->hWnd = hWnd;

  return FALSE;
}

BOOL CALLBACK Workwindow::EnumChildProc(HWND hWnd, LPARAM lParam) {
  if (!IsWindowVisible(hWnd) || !IsWindowEnabled(hWnd)) {
    return TRUE;
  }

  Workwindow *self = (Workwindow *)lParam;

  if (!self->childClassName.empty() && Helper::classNameGetter(hWnd).compare(self->childClassName) != 0) {
    return TRUE;
  }

  if (!self->childTitle.empty() && Helper::titleGetter(hWnd).compare(self->childTitle) != 0) {
    return TRUE;
  }

  self->hWnd = hWnd;

  return FALSE;
}

void Workwindow::setWorkwindow(const Napi::CallbackInfo &info) {
  if (info.Length() > 0) {
    if (info[0].IsNumber()) {
      hWnd = (HWND)info[0].As<Napi::Number>().Int64Value();

      if (info[1].IsBuffer()) {
        childClassName = Helper::bufferToWstring(info[1]);
      }

      if (info[2].IsBuffer()) {
        childTitle = Helper::bufferToWstring(info[2]);
      }
    } else {
      if (info[0].IsBuffer()) {
        title = Helper::bufferToWstring(info[0]);
      }

      if (info[1].IsBuffer()) {
        className = Helper::bufferToWstring(info[1]);
      }

      if (info[2].IsBuffer()) {
        childClassName = Helper::bufferToWstring(info[2]);
      }

      if (info[3].IsBuffer()) {
        childTitle = Helper::bufferToWstring(info[3]);
      }
    }

    if (hWnd == NULL) {
      EnumWindows(EnumWindowsProc, (LPARAM)this);
    }

    if (!childClassName.empty() || !childTitle.empty()) {
      EnumChildWindows(hWnd, EnumChildProc, (LPARAM)this);
    }
  } else {
    hWnd = NULL;
  }
};

Napi::Value Workwindow::refresh(const Napi::CallbackInfo &info) {
  hWnd = NULL;

  EnumWindows(EnumWindowsProc, (LPARAM)this);

  if (!childClassName.empty() || !childTitle.empty()) {
    EnumChildWindows(hWnd, EnumChildProc, (LPARAM)this);
  }

  return Napi::Boolean::New(info.Env(), hWnd != NULL);
}

Napi::Value Workwindow::getWorkwindow(const Napi::CallbackInfo &info) {
  return Helper::windowGetter(info, hWnd);
}

void Workwindow::setWindowView(const Napi::CallbackInfo &info) {
  RECT rect;

  GetWindowRect(hWnd, &rect);

  Napi::Object windowView(info.Env(), info[0]);

  Napi::Value x = windowView.Get("x");

  Napi::Value y = windowView.Get("y");

  Napi::Value width = windowView.Get("width");

  Napi::Value height = windowView.Get("height");

  SetWindowPos(hWnd,
               NULL,
               x.IsNumber() ? x.As<Napi::Number>().Int32Value() : rect.left,
               y.IsNumber() ? y.As<Napi::Number>().Int32Value() : rect.top,
               width.IsNumber() ? width.As<Napi::Number>().Int32Value() : rect.right - rect.left,
               height.IsNumber() ? height.As<Napi::Number>().Int32Value() : rect.bottom - rect.top,
               NULL);
}

Napi::Value Workwindow::getWindowView(const Napi::CallbackInfo &info) {
  Napi::Object windowInfo = Napi::Object::New(info.Env());

  if (hWnd != NULL) {
    RECT rect;

    POINT point = {0, 0};

    GetClientRect(hWnd, &rect);

    ClientToScreen(hWnd, &point);

    windowInfo["x"] = point.x;
    windowInfo["y"] = point.y;
    windowInfo["width"] = rect.right;
    windowInfo["height"] = rect.bottom;
  }

  return windowInfo;
}

Napi::Value Workwindow::isForeground(const Napi::CallbackInfo &info) {
  return Napi::Boolean::New(info.Env(), hWnd == GetForegroundWindow());
}

Napi::Value Workwindow::isOpen(const Napi::CallbackInfo &info) {
  return Napi::Boolean::New(info.Env(), IsWindow(hWnd));
}

void Workwindow::setForeground(const Napi::CallbackInfo &info) {
  SetForegroundWindow(hWnd);
}