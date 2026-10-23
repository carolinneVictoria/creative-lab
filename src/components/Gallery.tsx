import { Download, Images, Pencil, Trash2 } from "lucide-react";
import { useRef, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArtPreview } from "./ArtPreview";
import type { GeneratedArt } from "../utils/generateArt";
import type { GalleryItem } from "../utils/gallery-storage";
import { exportImage } from "../utils/export-image";

type GalleryProps = {
  items: GalleryItem[];
  onRemove: (id: string) => void;
  onOpen: (art: GeneratedArt) => void;
};

type GalleryCardProps = {
  item: GalleryItem;
  onRemove: (id: string) => void;
  onOpen: (art: GeneratedArt) => void;
};

const cardButtonClass =
  "rounded bg-gray-700 p-1.5 text-white hover:bg-gray-600";

function GalleryCard({ item, onRemove, onOpen }: GalleryCardProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  function handleDownload() {
    if (svgRef.current) exportImage(svgRef.current, "png", item.name);
  }

  function handleRemove() {
    if (confirm(`Excluir "${item.name}" da galeria?`)) onRemove(item.id);
  }

  return (
    <li className="flex flex-col overflow-hidden rounded-lg border border-[#252B40] bg-[#111522]">
      <div
        style={{ "--art-ratio": `${item.art.width} / ${item.art.height}` } as CSSProperties}
        className="aspect-(--art-ratio) w-full bg-gray-900"
      >
        <ArtPreview art={item.art} svgRef={svgRef} />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white" title={item.name}>
            {item.name}
          </p>
          <p className="text-xs text-[#A3AAC2]">
            {new Date(item.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>

        <div className="mt-auto flex gap-2">
          <button
            type="button"
            onClick={() => onOpen(item.art)}
            className={cardButtonClass}
            aria-label="Abrir no gerador"
            title="Abrir no gerador"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className={cardButtonClass}
            aria-label="Baixar PNG"
            title="Baixar PNG"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className={`${cardButtonClass} ml-auto hover:bg-red-600`}
            aria-label="Excluir"
            title="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}

export function Gallery({ items, onRemove, onOpen }: GalleryProps) {
  return (
    <div className="flex min-w-0 flex-col p-4 text-black lg:h-screen lg:flex-1 lg:overflow-y-auto">
      <header className="mb-2 shrink-0 p-2">
        <div className="flex items-center gap-3 lg:mb-4 lg:gap-4">
          <Images
            className="h-6 w-6 shrink-0 text-[#7C6CF2] lg:h-8 lg:w-8"
            aria-hidden="true"
          />

          <div className="flex flex-col">
            <h2 className="mb-1 text-xl font-bold text-white lg:mb-2 lg:text-2xl">
              Galeria
            </h2>
            <p className="text-sm text-white lg:text-base">
              {items.length === 1 ? "1 arte salva" : `${items.length} artes salvas`}
            </p>
          </div>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-[#252B40] p-8 text-center text-[#A3AAC2]">
          <p>Nenhuma arte salva ainda ✨</p>
          <Link
            to="/"
            className="rounded bg-[#7C6CF2] px-4 py-2 font-bold text-white hover:bg-[#9588FF]"
          >
            Criar uma arte
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <GalleryCard key={item.id} item={item} onRemove={onRemove} onOpen={onOpen} />
          ))}
        </ul>
      )}
    </div>
  );
}
