import { _textToImg } from "./addon";
import { TextToImgOptions } from "./types";
import { getFontName, toBGR } from "./utils";

const textToImg = (
  text: string,
  path: string,
  fontSize: number,
  options: TextToImgOptions = {}
) =>
  _textToImg(
    Buffer.from(text, "ucs2"),
    Buffer.from(path, "ucs2"),
    getFontName(path),
    fontSize,
    {
      enableActualHeight: false,
      enableAntiAliasing: true,
      format: "rgba",
      ...options,
      color: options.color !== undefined ? toBGR(options.color) : 0xffffff,
      backgroundColor:
        options.backgroundColor !== undefined
          ? toBGR(options.backgroundColor)
          : 0,
    }
  );

export default textToImg;
