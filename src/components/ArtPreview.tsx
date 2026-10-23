
import type { GeneratedArt, ArtShape } from "../utils/generateArt";

import { useId, type RefObject } from "react";

type ArtPreviewProps = {
  art: GeneratedArt | null;
  svgRef?: RefObject<SVGSVGElement | null>;
};

type ShapeProps = {
  shape: ArtShape;
  idPrefix: string;
};

function Shape({ shape, idPrefix }: ShapeProps) {
  const gradientId = `${idPrefix}-gradient-${shape.id}`;

  // Todas as formas são centralizadas em (0,0) e posicionadas via transform.
  const paint = shape.gradient ? `url(#${gradientId})` : shape.color;
  const isStroke = shape.strokeWidth !== undefined;

  const commonProps = {
    fill: isStroke ? "none" : paint,
    stroke: isStroke ? paint : undefined,
    strokeWidth: shape.strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    opacity: shape.opacity,
    transform: `translate(${shape.x} ${shape.y}) rotate(${shape.rotation})`,
  };

  return (
    <>
      {shape.gradient && (
        <defs>
          {/* userSpaceOnUse: funciona também em linhas (bbox com altura 0) */}
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1={-shape.width / 2}
            y1={-shape.height / 2}
            x2={shape.width / 2}
            y2={shape.height / 2}
          >
            <stop offset="0%" stopColor={shape.gradient[0]} />
            <stop offset="100%" stopColor={shape.gradient[1]} />
          </linearGradient>
        </defs>
      )}

      {shape.path ? (
        <path {...commonProps} d={shape.path} />
      ) : shape.type === "circle" ? (
        <circle {...commonProps} r={shape.width / 2} />
      ) : (
        <rect
          {...commonProps}
          x={-shape.width / 2}
          y={-shape.height / 2}
          width={shape.width}
          height={shape.height}
        />
      )}
    </>
  );
}

export function ArtPreview({ art, svgRef }: ArtPreviewProps) {
  // IDs únicos por SVG: várias artes na mesma página (galeria) não podem compartilhar gradientes/recortes
  const idPrefix = `art${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  if (!art) {
    return (
      <div className="flex h-full w-full items-center justify-center text-[#A3AAC2]">
        Sua arte aparecerá aqui ✨
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${art.width} ${art.height}`}
        className="h-full w-full rounded-lg object-contain shadow-2xl"
        role="img"
        ref={svgRef}
        aria-label="Arte abstrata generativa"
      >
        <defs>
          <clipPath id={`${idPrefix}-clip`}>
            <rect width={art.width} height={art.height} />
          </clipPath>
        </defs>

        {/* Corta formas que ultrapassam a borda da arte */}
        <g clipPath={`url(#${idPrefix}-clip)`}>
          <rect
            width={art.width}
            height={art.height}
            fill={art.backgroundColor}
          />

          {art.shapes.map((shape) => (
            <Shape key={shape.id} shape={shape} idPrefix={idPrefix} />
          ))}
        </g>
      </svg>
    </div>
  );
}
