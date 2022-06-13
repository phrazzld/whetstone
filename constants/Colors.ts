export const palette = {
  white: "#fff",
  grey: "#ccc",
  black: "#000",
  red: "#cc0000",
  blue: "#147efb",
  seaBlue: "#2f95dc",
  darkBlue: "#2e78b7",
  orange: "#ffab00"
}

const tintColorLight = palette.seaBlue;
const tintColorDark = palette.white;

export default {
  light: {
    text: palette.black,
    background: palette.white,
    tint: tintColorLight,
    tabIconDefault: palette.grey,
    tabIconSelected: tintColorLight,
    danger: palette.red,
    link: palette.blue
  },
  dark: {
    text: palette.white,
    background: palette.black,
    tint: tintColorDark,
    tabIconDefault: palette.grey,
    tabIconSelected: tintColorDark,
    danger: palette.red,
    link: palette.blue
  },
};
