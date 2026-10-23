import { useState } from "react";
import { ColorPickerField } from "../assets/layout/ColorPickerField";
import { SliderField } from "../assets/layout/SliderField";
import { generateArt, type GeneratedArt } from "../utils/generateArt";

const DIMENSIONS = [
    "512x512",
    "1024x1024",
    "1080x1080",
    "1920x1080",
    "1080x1920",
] as const;

type Dimensions = (typeof DIMENSIONS)[number];
type ArtConfig = {
    style: "organic" | "circles" | "geometric" | "mixed";
    shapeCount: number;
    shapeSize: number;
    colorPalette: string[];
    backgroundColor: string;
    gradient: boolean;
    overlap: boolean;
    dimensions: Dimensions;
    seed?: number;
}

type SideFormProps = {
  // Arte exibida ao abrir o formulário; suas configurações pré-carregam os campos
  initialArt: GeneratedArt | null;
  onGenerate: (art: GeneratedArt) => void;
};

const DEFAULT_CONFIG: ArtConfig = {
    style: "organic",
    shapeCount: 25,
    shapeSize: 25,
    colorPalette: ["#7C6CF2", "#B8AEFF", "#FF8FC7"],
    backgroundColor: "#111522",
    gradient: false,
    overlap: false,
    dimensions: "512x512",
    seed: undefined
};

// Artes antigas da galeria não guardam a configuração: aproveita só a seed
function configFromArt(art: GeneratedArt | null): ArtConfig {
    if (!art) return DEFAULT_CONFIG;
    return art.config ?? { ...DEFAULT_CONFIG, seed: art.seed };
}

export function SideForm({ initialArt, onGenerate }: SideFormProps) {

    const [config, setConfig] = useState<ArtConfig>(() => configFromArt(initialArt));

    function updateConfig<K extends keyof ArtConfig>(key: K, value: ArtConfig[K]) {
        setConfig((prevConfig) => ({
            ...prevConfig,
            [key]: value,
        }));
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const art = generateArt(config);
        onGenerate(art);
    }

    return (
        <div className="w-full shrink-0 bg-[#111522] p-4 text-white lg:h-screen lg:w-100 lg:overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Monte sua Arte</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="style" className="block text-sm font-medium mb-1">Estilo</label>
                    <select id="style" name="style" className="w-full rounded-lg border border-[#252B40] bg-[#1A2032] px-3 py-2 text-sm text-[#F4F3FF] transition focus:border-[#7C6CF2] focus:outline-none focus:ring-2 focus:ring-[#7C6CF2]/40"
                        value={config.style}
                        onChange={(event) => {
                            const style = event.target.value;
                            if (style === "organic" || style === "circles" || style === "geometric" || style === "mixed") {
                                updateConfig("style", style);
                            }
                        }}
                    >
                        <option value="organic">Orgânico</option>
                        <option value="circles">Círculos</option>
                        <option value="geometric">Geométrico</option>
                        <option value="mixed">Misto</option>
                    </select>
                </div>
                {/* Slider */}
                <div className="mb-4">
                    <SliderField label="Quantidade de formas"
                        min={5}
                        max={100}
                        initialValue={config.shapeCount}
                        onChange={(value) => {
                            updateConfig("shapeCount", value);
                        }} 
                    />
                </div>
                {/* Slider */}
                <div className="mb-4">
                    <SliderField label="Tamanho das formas"
                        // type="range"
                        min={10}
                        max={100}
                        initialValue={config.shapeSize}
                        onChange={(value) => {
                            updateConfig("shapeSize", value);
                        }}
                    />
                </div>
                {/* Seletor visual de cores */}
                <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Paleta de Cores</label>
                <ColorPickerField
                    maxColors={5}
                    initialColors={config.colorPalette}
                    onChange={(colors) => {
                    updateConfig("colorPalette", colors);
                    }}
                />
                </div>
                {/* Seleter de cor */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Fundo</label>
                    <ColorPickerField
                        maxColors={1}
                        initialColors={[config.backgroundColor]}
                        onChange={(colors) => updateConfig("backgroundColor", colors[0])}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="gradient-toggle" className="flex cursor-pointer items-center justify-between text-sm font-medium text-[#F4F3FF]">
                        Gradiente
                        <span className="relative inline-flex items-center">
                            <input
                                id="gradient-toggle"
                                name="gradient"
                                type="checkbox"
                                checked={config.gradient}
                                onChange={(event) => updateConfig("gradient", event.target.checked)}
                                className="peer sr-only"
                            />
                            <span className="h-6 w-11 rounded-full bg-[#252B40] transition-colors peer-checked:bg-[#7C6CF2] peer-focus-visible:ring-2 peer-focus-visible:ring-[#B8AEFF] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#111522]" />
                            <span className="pointer-events-none absolute left-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                        </span>
                    </label>
                </div>
                <div className="mb-4">
                    <label htmlFor="overlap-toggle" className="flex cursor-pointer items-center justify-between text-sm font-medium text-[#F4F3FF]">
                        Sobreposição
                        <span className="relative inline-flex items-center">
                            <input
                                id="overlap-toggle"
                                name="overlap"
                                type="checkbox"
                                checked={config.overlap}
                                onChange={(event) => updateConfig("overlap", event.target.checked)}
                                className="peer sr-only"
                            />
                            <span className="h-6 w-11 rounded-full bg-[#252B40] transition-colors peer-checked:bg-[#7C6CF2] peer-focus-visible:ring-2 peer-focus-visible:ring-[#B8AEFF] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#111522]" />
                            <span className="pointer-events-none absolute left-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                        </span>
                    </label>
                </div>
                <div className="mb-4">
                    <label htmlFor="dimensions" className="block text-sm font-medium mb-1">Dimensões</label>
                    <select
                        id="dimensions"
                        name="dimensions"
                        value={config.dimensions}
                        onChange={(event) => {
                            const dimensions = DIMENSIONS.find(
                                (option) => option === event.target.value,
                            );
                            if (dimensions) updateConfig("dimensions", dimensions);
                        }}
                        className="w-full rounded-lg border border-[#252B40] bg-[#1A2032] px-3 py-2 text-sm text-[#F4F3FF] transition focus:border-[#7C6CF2] focus:outline-none focus:ring-2 focus:ring-[#7C6CF2]/40"
                    >
                        <option value="512x512">Quadrado — 512 × 512</option>
                        <option value="1024x1024">Quadrado — 1024 × 1024</option>
                        <option value="1080x1080">Quadrado — 1080 × 1080</option>
                        <option value="1920x1080">Paisagem — 1920 × 1080</option>
                        <option value="1080x1920">Retrato — 1080 × 1920</option>
                    </select>
                </div>
                {/* Numero opcional */}
                <div className="mb-4">
                    <label htmlFor="seed" className="mb-1 block text-sm font-medium text-[#F4F3FF]">Seed</label>
                    <input
                        id="seed"
                        name="seed"
                        type="number"
                        min="0"
                        step="1"
                        value={config.seed ?? ""}
                        onChange={(event) => {
                            const value = event.target.value;
                            updateConfig("seed", value === "" ? undefined : Number(value));
                        }}
                        placeholder="Opcional"
                        className="w-full rounded-lg border border-[#252B40] bg-[#1A2032] px-3 py-2 text-sm text-[#F4F3FF] placeholder:text-[#A3AAC2] transition focus:border-[#7C6CF2] focus:outline-none focus:ring-2 focus:ring-[#7C6CF2]/40"
                    />
                </div>
                <button type="submit" className="w-full rounded bg-blue-500 px-4 py-3 font-bold text-white hover:bg-blue-600 lg:w-auto lg:py-2">
                    Submit
                </button>
            </form>
        </div>
    )
}