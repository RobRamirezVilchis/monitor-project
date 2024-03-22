
export function randomColor() {
  return "#" + Math.floor(Math.random() * 0xFFFFFF << 0).toString(16);
}

export function randomRGBColor() {
  return {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256), 
    b: Math.floor(Math.random() * 256)
  };
}

// Convert a hex color string to an RGB color object
export function hexToRgb(hex: string) {
  const hexcolor = hex[0] === "#" ? hex.substring(1) : hex;

  if (hexcolor.length === 3) {
    const r = parseInt(hexcolor[0] + hexcolor[0], 16);
    const g = parseInt(hexcolor[1] + hexcolor[1], 16);
    const b = parseInt(hexcolor[2] + hexcolor[2], 16);
    return { r, g, b };
  }

  const r = parseInt(hexcolor.substring(0, 2), 16);
  const g = parseInt(hexcolor.substring(2, 4), 16);
  const b = parseInt(hexcolor.substring(4, 6), 16);
  return { r, g, b };
}

// https://www.w3.org/TR/AERT/#color-contrast
export function colorBrightness(color: string) {
  const { r, g, b } = hexToRgb(color);

  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq;
}

// https://www.w3.org/TR/AERT/#color-contrast
export function colorDifference(color1: string, color2: string) {
  const { r: r1, g: g1, b: b1 } = hexToRgb(color1);

  const { r: r2, g: g2, b: b2 } = hexToRgb(color2);

  const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
  return diff;
}

export function colorContrast(color: string, options?: { 
  light?: string, dark?: string
}) {
  options = { 
    light: "#ffffff", 
    dark: "#000000",
    ...options
  };
  
  const brightness = colorBrightness(color);
  return brightness > 125 ? options.dark : options.light;
}
