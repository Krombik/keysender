import { _textToImg } from "./addon";
import { TextToImgOptions } from "./types";
import { getFontName, toBGR } from "./utils";

/**
 * Draws text using the specified font `(supports .ttf and .otf only)`
 * @param text - text to draw
 * @param path - path to font
 * @param fontSize - font size in px
 */
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
      color: "color" in options ? toBGR(options.color!) : 0xffffff,
      backgroundColor:
        "backgroundColor" in options ? toBGR(options.backgroundColor!) : 0,
    }
  );

export default textToImg;
