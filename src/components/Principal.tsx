
import { RotateCcw, Share, Share2, Sparkles } from "lucide-react";
import { ArtPreview } from "./ArtPreview";
import type { GeneratedArt } from "../utils/generateArt";

type PrincipalProps = {
  art: GeneratedArt | null;
};

export function Principal({ art }: PrincipalProps) {
  return (
    <div className="flex min-w-0 flex-col p-4 text-black lg:h-screen lg:flex-1">
      <header className="mb-2 shrink-0 p-2">
        <div className="flex items-center gap-3 lg:mb-4 lg:gap-4">
          <Sparkles
            fill="currentColor"
            className="h-6 w-6 shrink-0 text-[#7C6CF2] lg:h-8 lg:w-8"
            aria-hidden="true"
          />

          <div className="flex flex-col">
            <h2 className="mb-1 text-xl font-bold text-white lg:mb-2 lg:text-2xl">
              Gerador de Artes
            </h2>
            <p className="text-sm text-white lg:text-base">
              Explore formas, cores e novas composições!
            </p>
          </div>
        </div>
      </header>

      <div className="mb-4 flex shrink-0 justify-end">
        <div className="flex items-center gap-3 lg:mb-4 lg:gap-4">
          <button
            type="button"
            className="rounded bg-gray-700 px-4 py-2 font-bold text-white hover:bg-gray-600"
            aria-label="Desfazer"
          >
            <RotateCcw />
          </button>

          <button
            type="button"
            className="rounded bg-gray-700 px-4 py-2 font-bold text-white hover:bg-gray-600"
            aria-label="Compartilhar"
          >
            <Share />
          </button>

          <button
            type="button"
            className="rounded bg-[#7C6CF2] px-4 py-2 font-bold text-white hover:bg-[#9588FF]"
            aria-label="Exportar arte"
          >
            <Share2 />
          </button>
        </div>
      </div>

      {/* Área de visualização da arte */}
      {/* Celular: área quadrada na largura da tela. Desktop: ocupa a altura restante. */}
      <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-[#252B40] bg-[#0B0D17] lg:aspect-auto lg:min-h-0 lg:flex-1">
        <div className="aspect-square h-full max-h-full max-w-full bg-gray-900">
          <ArtPreview art={art} />
        </div>
      </div>
    </div>
  );
}
