#include "includes.hpp"
#pragma once
#ifndef TYPES_H
#define TYPES_H

#define NONEXISTENT_VIRTUAL_KEY 255

struct WindowInfo {
  HWND hWnd = NULL;
  std::wstring className;
  std::wstring title;
};

struct MAKEBITMAPINFO : BITMAPINFO {
  MAKEBITMAPINFO(int height, int width) {
    bmiHeader.biWidth = width;
    bmiHeader.biHeight = -height;
    bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
    bmiHeader.biPlanes = 1;
    bmiHeader.biBitCount = 32;
    bmiHeader.biCompression = BI_RGB;
    bmiHeader.biSizeImage = 0;
    bmiHeader.biXPelsPerMeter = 0;
    bmiHeader.biYPelsPerMeter = 0;
    bmiHeader.biClrUsed = 0;
    bmiHeader.biClrImportant = 0;
  }
};

#endif