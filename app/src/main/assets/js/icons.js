if( window.BO == null ) {
  window.BO = {};
}

/**
 * Icons
 */
BO.icons = {
  "mylocation": [
    {
      "tagName": "line",
      "x1": 32, "y1": 2, "x2": 32, "y2": 8,
      "stroke-width": 8,
      "fill": "none",
    },
    {
      "tagName": "line",
      "x1": 32, "y1": 54, "x2": 32, "y2": 62,
      "stroke-width": 8,
      "fill": "none",
    },
    {
      "tagName": "line",
      "x1": 2, "y1": 32, "x2": 8, "y2": 32,
      "stroke-width": 8,
      "fill": "none",
    },
    {
      "tagName": "line",
      "x1": 54, "y1": 32, "x2": 62, "y2": 32,
      "stroke-width": 8,
      "fill": "none",
    },
    {
      "tagName": "circle",
      "cx": 32, "cy": 32, "r": 24,
      "stroke-width": 4,
      "fill": "none",
    },
    {
      "tagName": "circle",
      "cx": 32, "cy": 32, "r": 16,
      "stroke-width": 4,
    },
  ],
  "gnss": [
    {
      "tagName": "path",
      "d": "M 38 2 L 44 2 L 62 20 L 62 28 z",
      "stroke-width": 4,
    },
    {
      "tagName": "path",
      "d": "M 38,10 a 8,8 270 0 0 16,16",
      "stroke-width": 4,
      "fill": "none",
    },
    {
      "tagName": "path",
      "d": "M 28,14 a 12,12 270 0 0 24,24",
      "stroke-width": 4,
      "fill": "none",
    },
    {
      "tagName": "path",
      "d": "M 16,20 a 16,16 270 0 0 30,30",
      "stroke-width": 4,
      "fill": "none",
    },
  ],
  "up": [
    {
      "tagName": "path",
      "d": "M 2 32 L 32 2 L 62 32",
      "stroke-width": 8,
      "fill": "none",
    },
    {
      "tagName": "path",
      "d": "M 2 62 L 32 32 L 62 62",
      "fill": "none",
      "stroke-width": 8,
    },
  ],
  "down": [
    {
      "tagName": "path",
      "d": "M 2 2 L 32 32 L 62 2",
      "stroke-width": 8,
      "fill": "none",
    },
    {
      "tagName": "path",
      "d": "M 2 32 L 32 62 L 62 32",
      "fill": "none",
      "stroke-width": 8,
    },
  ],
  "home": [
    {
      "tagName": "path",
      "d": "M 2 32 L 32 2 L 62 32",
      "stroke-width": 8,
      "fill": "none",
    },
    {
      "tagName": "path",
      "d": "M 16 62 L 48 62 L 48 36 L 32 20 L 16 36 z",
      "stroke-width": 8,
    },
  ],
  "info": [
    {
      "tagName": "circle",
      "cx": 32, "cy": 14, "r": 12,
      "stroke-width": 0,
    },
    {
      "tagName": "path",
      "d": "M 24 30 L 24 62 L 40 62 L 40 30 z",
      "stroke-width": 0,
    },
  ],
  "tup": [
    {
      "tagName": "path",
      "d": "M 32 6 L 62 58 L 2 58 z",
      "stroke-width": 0,
    },
  ],
  "tdown": [
    {
      "tagName": "path",
      "d": "M 32 58 L 62 6 L 2 6 z",
      "stroke-width": 0,
    },
  ],
  // 2021-04-01 Added
  "singlemap": [
    {
      "tagName": "path",
      "d": "M 2 2 62 2 62 62 2 62 z",
      "stroke-width": 0,
    },
  ],
  // 2021-04-01 Added
  "dualmaph": [
    {
      "tagName": "path",
      "d": "M 2 2 30 2 30 62 2 62 z",
      "stroke-width": 0,
    },
    {
      "tagName": "path",
      "d": "M 34 2 63 2 63 62 34 62 z",
      "stroke-width": 0,
    },
  ],
  // 2021-04-05 Added
  "dualmapv": [
    {
      "tagName": "path",
      "d": "M 2 2,2 30,62 30,62 2 z M 2 34,2 63,62 63,62 34 z",
      "stroke-width": 0,
    },
  ],
  // 2021-04-01 Added
  "cross": [
    {
      "tagName": "path",
      "d": "M 28 2,36 2,36 28,62 28,62 36,36 36,36 62,28 62,28 36,2 36,2 28,28 28,28 2 z",
      "stroke-width": 0,
    },
  ],
  // 2021-04-04 Added
  "crosshair": [
    {
      "tagName": "path",
      "d": "M 32 2,30 4,30 26,32 28,34 26,34 4 z M 32 62,34 60,34 38,32 36,30 38,30 60,32 62 z M 2 32,4 30,26 30,28 32,26 34,4 34 z M 62 32,60 34,38 34,36 32,38 30,60 30,62 32 z",
      "stroke-width": 1,
    },
  ],
};

