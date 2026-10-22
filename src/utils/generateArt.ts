
export type ArtStyle =
  | "organic"
  | "circles"
  | "geometric"
  | "mixed";

export type ArtDimensions =
  | "512x512"
  | "1024x1024"
  | "1080x1080"
  | "1920x1080"
  | "1080x1920";

export type ArtConfig = {
  style: ArtStyle;
  shapeCount: number;
  shapeSize: number;
  colorPalette: string[];
  backgroundColor: string;
  gradient: boolean;
  overlap: boolean;
  dimensions: ArtDimensions;
  seed?: number;
};

export type ArtShape = {
  id: number;
  type: "organic" | "circle" | "geometric";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  opacity: number;
  kind: ShapeKind;
  // Path centralizado em (0,0); renderizado com translate(x,y) rotate(rotation)
  path?: string;
  // Quando definido, a forma é desenhada só com contorno (sem preenchimento)
  strokeWidth?: number;
  gradient?: [string, string];
};

export type ShapeKind =
  | "circle"
  | "ring"
  | "concentric"
  | "halfCircle"
  | "quarterCircle"
  | "arc"
  | "crescent"
  | "blob"
  | "leaf"
  | "pill"
  | "wave"
  | "spiral"
  | "rect"
  | "triangle"
  | "diamond"
  | "polygon"
  | "stripes"
  | "zigzag"
  | "cross"
  | "dotGrid";

export type GeneratedArt = {
  width: number;
  height: number;
  backgroundColor: string;
  shapes: ArtShape[];
  seed: number;
};

type Random = () => number;

type ShapeBody = Pick<ArtShape, "type" | "kind" | "width" | "height" | "path" | "strokeWidth">;

type Point = { x: number; y: number };

function createRandomGenerator(seed: number): Random {
    let state = seed >>> 0;

    return function random(): number {
        state = (state + 0x6D2B79F5) >>> 0;

        let value = state;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    }
}

function randomBetween(random: Random, min: number, max: number): number {
    return min + random() * (max - min);
}

function randomInt(random: Random, min: number, max: number): number {
    return Math.floor(randomBetween(random, min, max + 1));
}

function pick<T>(random: Random, items: readonly T[]): T {
    return items[Math.floor(random() * items.length)];
}

function round(value: number): number {
    return Math.round(value * 100) / 100;
}

// Evita repetir a mesma cor em formas consecutivas.
function randomColor(random: Random, palette: string[], previous?: string): string {
  if (palette.length === 0) {
    return "#7C6CF2";
  }

  if (palette.length === 1) {
    return palette[0];
  }

  const options = palette.filter((color) => color !== previous);
  return pick(random, options.length > 0 ? options : palette);
}

// ---------- Helpers de path ----------

function polygonPath(points: Point[], closed = true): string {
  return (
    points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${round(point.x)} ${round(point.y)}`)
      .join(" ") + (closed ? " Z" : "")
  );
}

function regularPolygon(sides: number, rx: number, ry: number, startAngle = -Math.PI / 2): Point[] {
  return Array.from({ length: sides }, (_, index) => {
    const angle = startAngle + (index / sides) * Math.PI * 2;
    return { x: Math.cos(angle) * rx, y: Math.sin(angle) * ry };
  });
}

function circlePath(cx: number, cy: number, r: number): string {
  const R = round(r);
  return `M ${round(cx - r)} ${round(cy)} a ${R} ${R} 0 1 0 ${round(r * 2)} 0 a ${R} ${R} 0 1 0 ${round(-r * 2)} 0 Z`;
}

// Curva suave passando pelos pontos médios (fechada ou aberta).
function smoothPath(points: Point[], closed: boolean): string {
  if (!closed) {
    let path = `M ${round(points[0].x)} ${round(points[0].y)}`;
    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      path += ` Q ${round(points[i].x)} ${round(points[i].y)} ${round(midX)} ${round(midY)}`;
    }
    const last = points[points.length - 1];
    return path + ` L ${round(last.x)} ${round(last.y)}`;
  }

  let path = "";
  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length];
    const midX = round((point.x + next.x) / 2);
    const midY = round((point.y + next.y) / 2);

    if (index === 0) {
      path = `M ${midX} ${midY}`;
    }

    path += ` Q ${round(point.x)} ${round(point.y)} ${midX} ${midY}`;
  });

  return path + " Z";
}


// ---------- Catálogo de formas ----------
// Cada gerador recebe o tamanho (diâmetro aproximado) e devolve um path centralizado em (0,0).

type ShapeFactory = (size: number, random: Random) => Omit<ShapeBody, "kind">;

const SHAPES: Record<ShapeKind, ShapeFactory> = {
  circle: (size) => ({
    type: "circle",
    width: size,
    height: size,
    path: circlePath(0, 0, size / 2),
  }),

  ring: (size, random) => {
    const strokeWidth = size * randomBetween(random, 0.06, 0.16);
    return {
      type: "circle",
      width: size,
      height: size,
      path: circlePath(0, 0, (size - strokeWidth) / 2),
      strokeWidth,
    };
  },

  concentric: (size, random) => {
    const count = randomInt(random, 2, 4);
    const strokeWidth = (size / 2 / count) * randomBetween(random, 0.25, 0.45);
    const path = Array.from({ length: count }, (_, index) =>
      circlePath(0, 0, (size / 2) * ((index + 1) / count) - strokeWidth / 2)
    ).join(" ");
    return { type: "circle", width: size, height: size, path, strokeWidth };
  },

  halfCircle: (size) => {
    const r = size / 2;
    // Centralizado verticalmente no próprio bounding box.
    const offset = r / 2;
    return {
      type: "geometric",
      width: size,
      height: r,
      path: `M ${round(-r)} ${round(offset)} A ${round(r)} ${round(r)} 0 0 1 ${round(r)} ${round(offset)} Z`,
    };
  },

  quarterCircle: (size) => {
    const r = size * 0.7;
    const o = r / 2;
    return {
      type: "geometric",
      width: r,
      height: r,
      path: `M ${round(-o)} ${round(-o)} L ${round(r - o)} ${round(-o)} A ${round(r)} ${round(r)} 0 0 1 ${round(-o)} ${round(r - o)} Z`,
    };
  },

  arc: (size, random) => {
    const r = size / 2;
    const sweep = randomBetween(random, 0.35, 0.75) * Math.PI * 2;
    const start = -Math.PI / 2 - sweep / 2;
    const end = start + sweep;
    const largeArc = sweep > Math.PI ? 1 : 0;
    return {
      type: "circle",
      width: size,
      height: size,
      path: `M ${round(Math.cos(start) * r)} ${round(Math.sin(start) * r)} A ${round(r)} ${round(r)} 0 ${largeArc} 1 ${round(Math.cos(end) * r)} ${round(Math.sin(end) * r)}`,
      strokeWidth: size * randomBetween(random, 0.05, 0.12),
    };
  },

  crescent: (size, random) => {
    const r = size / 2;
    const inner = r * randomBetween(random, 0.2, 0.7);
    return {
      type: "organic",
      width: size,
      height: size,
      path: `M 0 ${round(-r)} A ${round(r)} ${round(r)} 0 1 1 0 ${round(r)} A ${round(inner)} ${round(r)} 0 1 0 0 ${round(-r)} Z`,
    };
  },

  blob: (size, random) => {
    const width = size * randomBetween(random, 0.8, 1.2);
    const height = size * randomBetween(random, 0.8, 1.2);
    const pointCount = randomInt(random, 5, 9);
    const step = (Math.PI * 2) / pointCount;

    const points = Array.from({ length: pointCount }, (_, index) => {
      // Jitter no ângulo e no raio deixa o contorno menos simétrico.
      const angle = index * step + randomBetween(random, -step * 0.3, step * 0.3);
      const radius = randomBetween(random, 0.55, 1);
      return {
        x: Math.cos(angle) * (width / 2) * radius,
        y: Math.sin(angle) * (height / 2) * radius,
      };
    });

    return { type: "organic", width, height, path: smoothPath(points, true) };
  },

  leaf: (size, random) => {
    const h = size / 2;
    const w = h * randomBetween(random, 0.5, 0.9);
    return {
      type: "organic",
      width: w,
      height: size,
      path: `M 0 ${round(-h)} Q ${round(w * 1.4)} 0 0 ${round(h)} Q ${round(-w * 1.4)} 0 0 ${round(-h)} Z`,
    };
  },

  pill: (size, random) => {
    const strokeWidth = size * randomBetween(random, 0.2, 0.35);
    const half = (size - strokeWidth) / 2;
    return {
      type: "organic",
      width: size,
      height: strokeWidth,
      path: `M ${round(-half)} 0 L ${round(half)} 0`,
      strokeWidth,
    };
  },

  wave: (size, random) => {
    const waves = randomInt(random, 2, 4);
    const amplitude = size * randomBetween(random, 0.08, 0.18);
    const segments = waves * 8;
    const points = Array.from({ length: segments + 1 }, (_, index) => ({
      x: -size / 2 + (index / segments) * size,
      y: Math.sin((index / segments) * waves * Math.PI * 2) * amplitude,
    }));
    return {
      type: "organic",
      width: size,
      height: amplitude * 2,
      path: smoothPath(points, false),
      strokeWidth: size * randomBetween(random, 0.025, 0.06),
    };
  },

  spiral: (size, random) => {
    const turns = randomBetween(random, 2, 3.5);
    const steps = Math.round(turns * 16);
    const points = Array.from({ length: steps + 1 }, (_, index) => {
      const t = index / steps;
      const angle = t * turns * Math.PI * 2;
      const radius = t * (size / 2);
      return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
    });
    return {
      type: "organic",
      width: size,
      height: size,
      path: smoothPath(points, false),
      strokeWidth: size * randomBetween(random, 0.03, 0.06),
    };
  },

  rect: (size, random) => {
    const aspect = randomBetween(random, 0.4, 1.6);
    const width = size * Math.sqrt(aspect);
    const height = size / Math.sqrt(aspect);
    const rx = width / 2;
    const ry = height / 2;
    return {
      type: "geometric",
      width,
      height,
      path: polygonPath([
        { x: -rx, y: -ry },
        { x: rx, y: -ry },
        { x: rx, y: ry },
        { x: -rx, y: ry },
      ]),
    };
  },

  triangle: (size, random) => {
    const height = size * randomBetween(random, 0.7, 1.2);
    return {
      type: "geometric",
      width: size,
      height,
      path: polygonPath(regularPolygon(3, size / 2, height / 2)),
    };
  },

  diamond: (size, random) => {
    const width = size * randomBetween(random, 0.5, 0.9);
    return {
      type: "geometric",
      width,
      height: size,
      path: polygonPath(regularPolygon(4, width / 2, size / 2)),
    };
  },

  polygon: (size, random) => ({
    type: "geometric",
    width: size,
    height: size,
    path: polygonPath(regularPolygon(randomInt(random, 5, 8), size / 2, size / 2)),
  }),

  stripes: (size, random) => {
    const count = randomInt(random, 3, 7);
    const gap = size / count;
    const strokeWidth = gap * randomBetween(random, 0.25, 0.5);
    const length = size * randomBetween(random, 0.6, 1.2);
    const path = Array.from({ length: count }, (_, index) => {
      const y = -size / 2 + gap * (index + 0.5);
      return `M ${round(-length / 2)} ${round(y)} L ${round(length / 2)} ${round(y)}`;
    }).join(" ");
    return { type: "geometric", width: length, height: size, path, strokeWidth };
  },

  zigzag: (size, random) => {
    const peaks = randomInt(random, 3, 7);
    const amplitude = size * randomBetween(random, 0.08, 0.2);
    const points = Array.from({ length: peaks * 2 + 1 }, (_, index) => ({
      x: -size / 2 + (index / (peaks * 2)) * size,
      y: index % 2 === 0 ? amplitude : -amplitude,
    }));
    return {
      type: "geometric",
      width: size,
      height: amplitude * 2,
      path: polygonPath(points, false),
      strokeWidth: size * randomBetween(random, 0.03, 0.06),
    };
  },

  cross: (size, random) => {
    const h = size / 2;
    return {
      type: "geometric",
      width: size,
      height: size,
      path: `M ${round(-h)} 0 L ${round(h)} 0 M 0 ${round(-h)} L 0 ${round(h)}`,
      strokeWidth: size * randomBetween(random, 0.1, 0.2),
    };
  },

  dotGrid: (size, random) => {
    const cols = randomInt(random, 3, 6);
    const rows = randomInt(random, 3, 6);
    const gap = size / Math.max(cols, rows);
    const r = gap * randomBetween(random, 0.12, 0.25);
    const path: string[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        path.push(circlePath((col - (cols - 1) / 2) * gap, (row - (rows - 1) / 2) * gap, r));
      }
    }
    return { type: "geometric", width: cols * gap, height: rows * gap, path: path.join(" ") };
  },
};


// ---------- Composição em camadas ----------
// Arte abstrata costuma ter poucas formas grandes "âncora", formas médias
// e pequenos detalhes/texturas por cima. Cada estilo tem um repertório por camada
// (itens repetidos aumentam a chance de sorteio).

type Layer = "large" | "medium" | "small";

const REPERTOIRE: Record<Exclude<ArtStyle, "mixed">, Record<Layer, ShapeKind[]>> = {
  organic: {
    large: ["blob", "blob", "blob", "leaf", "crescent", "circle"],
    medium: ["blob", "blob", "leaf", "crescent", "wave", "pill", "spiral"],
    small: ["dotGrid", "wave", "pill", "circle", "spiral", "leaf"],
  },
  geometric: {
    large: ["rect", "rect", "halfCircle", "quarterCircle", "triangle", "circle"],
    medium: ["rect", "triangle", "diamond", "polygon", "halfCircle", "quarterCircle", "stripes", "ring"],
    small: ["cross", "zigzag", "dotGrid", "stripes", "triangle", "rect"],
  },
  circles: {
    large: ["circle", "circle", "halfCircle", "ring", "concentric"],
    medium: ["circle", "ring", "arc", "halfCircle", "concentric", "crescent"],
    small: ["circle", "circle", "dotGrid", "ring", "arc"],
  },
};

function repertoireFor(style: ArtStyle, layer: Layer): ShapeKind[] {
  if (style !== "mixed") {
    return REPERTOIRE[style][layer];
  }
  return [
    ...REPERTOIRE.organic[layer],
    ...REPERTOIRE.geometric[layer],
    ...REPERTOIRE.circles[layer],
  ];
}

function layerFor(index: number, total: number): Layer {
  const ratio = index / Math.max(total, 1);
  if (ratio < 0.15) return "large";
  if (ratio < 0.6) return "medium";
  return "small";
}

const GEOMETRIC_KINDS = new Set<ShapeKind>([
  "rect", "triangle", "diamond", "stripes", "zigzag", "cross", "dotGrid", "halfCircle", "quarterCircle",
]);

// Formas geométricas ficam mais "construtivistas" alinhadas em 0/45/90°.
function rotationFor(kind: ShapeKind, random: Random): number {
  if (GEOMETRIC_KINDS.has(kind) && random() < 0.7) {
    return randomInt(random, 0, 7) * 45;
  }
  return randomBetween(random, 0, 360);
}


function generateBody(style: ArtStyle, layer: Layer, size: number, random: Random): ShapeBody {
  const kind = pick(random, repertoireFor(style, layer));
  return { kind, ...SHAPES[kind](size, random) };
}


function parseDimensions(dimensions: ArtDimensions): { width: number; height: number } {
    const [width, height] = dimensions.split("x").map(Number);
    return { width, height };
}


type Placed = { x: number; y: number; radius: number };

const PLACEMENT_ATTEMPTS = 40;

// Amostragem por rejeição: tenta posições até achar uma sem colisão.
// Com sobreposição permitida, ainda espalha melhor escolhendo, entre alguns
// candidatos, o mais distante das formas já colocadas (best-candidate).
function findPosition(
  random: Random,
  width: number,
  height: number,
  radius: number,
  placed: Placed[],
  allowOverlap: boolean
): { x: number; y: number } | null {
  // Permite que formas saiam um pouco da borda para a composição não ficar "presa".
  const bleed = radius * 0.4;
  const randomPoint = () => ({
    x: randomBetween(random, -bleed, width + bleed),
    y: randomBetween(random, -bleed, height + bleed),
  });

  const gapTo = (point: { x: number; y: number }) =>
    placed.reduce(
      (min, other) => Math.min(min, Math.hypot(point.x - other.x, point.y - other.y) - other.radius - radius),
      Infinity
    );

  if (allowOverlap) {
    let best = randomPoint();
    let bestGap = gapTo(best);

    for (let attempt = 0; attempt < 4; attempt++) {
      const candidate = randomPoint();
      const gap = gapTo(candidate);
      if (gap > bestGap) {
        best = candidate;
        bestGap = gap;
      }
    }

    return best;
  }

  for (let attempt = 0; attempt < PLACEMENT_ATTEMPTS; attempt++) {
    const candidate = randomPoint();
    if (gapTo(candidate) >= 0) {
      return candidate;
    }
  }

  return null;
}


export function generateArt(config: ArtConfig): GeneratedArt {
  const { width, height } = parseDimensions(config.dimensions);
  const seed = config.seed ?? Math.floor(Math.random() * 2 ** 32);
  const random = createRandomGenerator(seed);

  // Converte o tamanho do slider (10 a 100)
  // em um tamanho proporcional à imagem.
  const baseSize = (config.shapeSize / 100) * Math.min(width, height) * 0.3;

  // Distribuição enviesada: poucas formas grandes, muitas pequenas.
  // Ordenadas da maior para a menor para as grandes ficarem ao fundo.
  const sizes = Array.from({ length: config.shapeCount }, () =>
    baseSize * (0.35 + 1.4 * random() ** 2)
  ).sort((a, b) => b - a);

  const shapes: ArtShape[] = [];
  const placed: Placed[] = [];
  let previousColor: string | undefined;

  sizes.forEach((initialSize, index) => {
    let size = initialSize;
    const layer = layerFor(index, sizes.length);

    // Sem sobreposição: se não couber, reduz a forma até 3 vezes antes de desistir.
    for (let shrink = 0; shrink < 4; shrink++) {
      const body = generateBody(config.style, layer, size, random);
      const radius = Math.max(body.width, body.height) / 2;
      const position = findPosition(random, width, height, radius, placed, config.overlap);

      if (!position) {
        size *= 0.75;
        continue;
      }

      const color = randomColor(random, config.colorPalette, previousColor);
      previousColor = color;

      shapes.push({
        id: shapes.length,
        ...body,
        x: round(position.x),
        y: round(position.y),
        width: round(body.width),
        height: round(body.height),
        rotation: round(rotationFor(body.kind, random)),
        color,
        // Contornos e detalhes ficam mais opacos para não "sumirem".
        opacity: round(
          body.strokeWidth || layer === "small"
            ? randomBetween(random, 0.85, 1)
            : config.overlap
              ? randomBetween(random, 0.55, 0.9)
              : randomBetween(random, 0.8, 1)
        ),
        strokeWidth: body.strokeWidth ? round(body.strokeWidth) : undefined,
        gradient: config.gradient
          ? [color, randomColor(random, config.colorPalette, color)]
          : undefined,
      });

      placed.push({ ...position, radius });
      return;
    }
  });

  return {
    width,
    height,
    backgroundColor: config.backgroundColor,
    shapes,
    seed,
  };
}
