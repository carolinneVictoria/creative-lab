
import { useState } from "react";

type SliderFieldProps = {
  label: string;
  min: number;
  max: number;
  step?: number;
  initialValue: number;
  onChange?: (value: number) => void;
};

export function SliderField({
  label,
  min,
  max,
  step = 1,
  initialValue,
  onChange,
}: SliderFieldProps) {
  const [value, setValue] = useState(initialValue);

  function handleChange(newValue: number) {
    setValue(newValue);
    onChange?.(newValue);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#F4F3FF]">
          {label}
        </label>

        <span className="rounded-md bg-[#252B40] px-3 py-1 text-sm text-[#B8AEFF]">
          {value}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) =>
          handleChange(Number(event.target.value))
        }
        className="w-full cursor-pointer accent-[#7C6CF2]"
      />

      <div className="flex justify-between text-xs text-[#A3AAC2]">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
