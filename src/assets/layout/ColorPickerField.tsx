
import { useState } from "react";

type ColorPickerFieldProps = {
  initialColors?: string[];
  maxColors?: number;
  onChange?: (colors: string[]) => void;
};

const PRESET_COLORS = [
  "#7C6CF2",
  "#B8AEFF",
  "#FF8FC7",
  "#FFD166",
  "#63D6C5",
  "#5B8DEF",
  "#F4F3FF",
  "#F47C64",
  "#111522",
];

export function ColorPickerField({
  initialColors = ["#7C6CF2", "#B8AEFF", "#FF8FC7"],
  maxColors = 5,
  onChange,
}: ColorPickerFieldProps) {
  const [colors, setColors] = useState<string[]>(initialColors);
  const [customColor, setCustomColor] = useState("#FFD166");

  function toggleColor(color: string) {
    let updatedColors: string[];

    if (colors.includes(color)) {
      updatedColors = colors.filter((item) => item !== color);
    } else {
      if (colors.length >= maxColors) return;
      updatedColors = [...colors, color];
    }

    setColors(updatedColors);
    onChange?.(updatedColors);
  }

  function addCustomColor() {
    if (colors.length >= maxColors || colors.includes(customColor)) return;

    const updatedColors = [...colors, customColor];
    setColors(updatedColors);
    onChange?.(updatedColors);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">

        <span className="text-xs text-[#B8AEFF]">
          {colors.length}/{maxColors}
        </span>
      </div>

      {/* Cores selecionadas */}
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            title={`Remover ${color}`}
            aria-label={`Remover cor ${color}`}
            onClick={() => toggleColor(color)}
            className="flex h-9 w-9 items-center justify-center rounded-lg
              border-2 border-[#B8AEFF] transition hover:scale-105"
            style={{ backgroundColor: color }}
          >
            <span className="text-sm text-white drop-shadow">
              ×
            </span>
          </button>
        ))}
      </div>

      {/* Paleta predefinida */}
      <div>
        <p className="mb-2 text-xs text-[#A3AAC2]">
          Cores disponíveis
        </p>

        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => {
            const selected = colors.includes(color);
            const limitReached = colors.length >= maxColors;

            return (
              <button
                key={color}
                type="button"
                aria-label={`Selecionar cor ${color}`}
                aria-pressed={selected}
                disabled={!selected && limitReached}
                onClick={() => toggleColor(color)}
                className={`h-8 w-8 rounded-lg border-2 transition
                  ${
                    selected
                      ? "border-white ring-2 ring-[#7C6CF2]"
                      : "border-[#252B40] hover:scale-110"
                  }
                  disabled:cursor-not-allowed disabled:opacity-40`}
                style={{ backgroundColor: color }}
              />
            );
          })}
        </div>
      </div>

      {/* Cor personalizada */}
      <div className="flex items-center gap-3">
        <input
          type="color"
          aria-label="Escolher cor personalizada"
          value={customColor}
          onChange={(event) => setCustomColor(event.target.value)}
          className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent"
        />

        <span className="flex-1 text-xs text-[#A3AAC2]">
          Cor personalizada
        </span>

        <button
          type="button"
          onClick={addCustomColor}
          disabled={
            colors.length >= maxColors || colors.includes(customColor)
          }
          className="rounded-lg bg-[#7C6CF2] px-3 py-2 text-sm
            font-medium transition hover:bg-[#9588FF]
            disabled:cursor-not-allowed disabled:opacity-40"
        >
          Adicionar
        </button>
      </div>

      <p className="text-xs text-[#A3AAC2]">
        {colors.length >= maxColors
          ? `Limite de ${maxColors} ${maxColors === 1 ? "cor atingido" : "cores atingido"}.`
          : `Selecione até ${maxColors} ${maxColors === 1 ? "cor" : "cores"} para sua arte.`}
      </p>
    </div>
  );
}
