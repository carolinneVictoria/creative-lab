
import {
  AtSign,
  Download,
  Globe,
  Link,
  Mail,
  MessageCircle,
  RotateCcw,
  RotateCw,
  Share,
  Share2,
  Sparkles,
} from "lucide-react";
import { ArtPreview } from "./ArtPreview";
import type { GeneratedArt } from "../utils/generateArt";
import { exportImage, svgToBlob, type ImageFormat } from "../utils/export-image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

type PrincipalProps = {
  art: GeneratedArt | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
};

type Menu = "download" | "share" | null;

const SHARE_TEXT = "Olha a arte que eu criei no Creative Lab!";

const menuItemClass =
  "flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-white hover:bg-gray-600";

export function Principal({ art, canUndo, canRedo, onUndo, onRedo }: PrincipalProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [openMenu, setOpenMenu] = useState<Menu>(null);
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState("creative-lab");

  // Fecha o menu ao clicar fora ou apertar Esc
  useEffect(() => {
    if (!openMenu) return;

    function handleClick(event: MouseEvent) {
      if (!actionsRef.current?.contains(event.target as Node)) setOpenMenu(null);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenMenu(null);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [openMenu]);

  function toggleMenu(menu: Menu) {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  async function handleExport(format: ImageFormat) {
    setOpenMenu(null);
    if (!svgRef.current || !art) return;
    await exportImage(svgRef.current, format, fileName);
  }

  const canShareFiles =
    typeof navigator !== "undefined" && typeof navigator.canShare === "function";

  async function handleNativeShare() {
    setOpenMenu(null);
    if (!svgRef.current || !art) return;

    const blob = await svgToBlob(svgRef.current, "png");
    const file = new File([blob], "creative-lab.png", { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Creative Lab", text: SHARE_TEXT });
      } catch {
        // Usuário cancelou o compartilhamento
      }
    } else {
      await exportImage(svgRef.current, "png");
    }
  }

  function openShareUrl(url: string) {
    setOpenMenu(null);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setOpenMenu(null);
    }, 1200);
  }

  const pageUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(SHARE_TEXT);

  const shareOptions = [
    {
      label: "WhatsApp",
      icon: MessageCircle,
      url: `https://wa.me/?text=${shareText}%20${pageUrl}`,
    },
    {
      label: "X / Twitter",
      icon: AtSign,
      url: `https://twitter.com/intent/tweet?text=${shareText}&url=${pageUrl}`,
    },
    {
      label: "Facebook",
      icon: Globe,
      url: `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`,
    },
    {
      label: "E-mail",
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent("Creative Lab")}&body=${shareText}%20${pageUrl}`,
    },
  ];

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
        <div ref={actionsRef} className="flex items-center gap-3 lg:mb-4 lg:gap-4">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="rounded bg-gray-700 px-4 py-2 font-bold text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Desfazer"
          >
            <RotateCcw />
          </button>

          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="rounded bg-gray-700 px-4 py-2 font-bold text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Refazer"
          >
            <RotateCw />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu("share")}
              disabled={!art}
              className="rounded bg-gray-700 px-4 py-2 font-bold text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Compartilhar"
              aria-haspopup="menu"
              aria-expanded={openMenu === "share"}
            >
              <Share2 />
            </button>

            {openMenu === "share" && (
              <div
                role="menu"
                className="absolute right-0 z-10 mt-2 w-52 overflow-hidden rounded-lg border border-[#252B40] bg-gray-700 shadow-lg"
              >
                {canShareFiles && (
                  <button type="button" role="menuitem" onClick={handleNativeShare} className={menuItemClass}>
                    <Share className="h-4 w-4" /> Compartilhar imagem…
                  </button>
                )}
                {shareOptions.map(({ label, icon: Icon, url }) => (
                  <button
                    key={label}
                    type="button"
                    role="menuitem"
                    onClick={() => openShareUrl(url)}
                    className={menuItemClass}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
                <button type="button" role="menuitem" onClick={handleCopyLink} className={menuItemClass}>
                  <Link className="h-4 w-4" /> {copied ? "Link copiado!" : "Copiar link"}
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu("download")}
              disabled={!art}
              className="rounded bg-[#7C6CF2] px-4 py-2 font-bold text-white hover:bg-[#9588FF] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Baixar arte"
              aria-haspopup="menu"
              aria-expanded={openMenu === "download"}
            >
              <Download />
            </button>

            {openMenu === "download" && (
              <div
                role="menu"
                className="absolute right-0 z-10 mt-2 w-56 overflow-hidden rounded-lg border border-[#252B40] bg-gray-700 shadow-lg"
              >
                <label className="block px-4 pt-3 pb-2 text-xs text-[#A3AAC2]">
                  Nome da arte
                  <input
                    type="text"
                    value={fileName}
                    onChange={(event) => setFileName(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && handleExport("png")}
                    placeholder="creative-lab"
                    autoFocus
                    className="mt-1 w-full rounded border border-[#252B40] bg-gray-800 px-2 py-1 text-sm text-white outline-none focus:border-[#7C6CF2]"
                  />
                </label>
                <button type="button" role="menuitem" onClick={() => handleExport("png")} className={menuItemClass}>
                  Baixar PNG
                </button>
                <button type="button" role="menuitem" onClick={() => handleExport("svg")} className={menuItemClass}>
                  Baixar SVG
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Área de visualização da arte */}
      {/* Celular: área na proporção da arte e na largura da tela. Desktop: ocupa a altura restante. */}
      <div
        style={{ "--art-ratio": art ? `${art.width} / ${art.height}` : "1 / 1" } as CSSProperties}
        className="flex aspect-(--art-ratio) w-full items-center justify-center overflow-hidden rounded-lg border border-[#252B40] bg-[#0B0D17] lg:aspect-auto lg:min-h-0 lg:flex-1"
      >
        <div className="h-full w-full bg-gray-900">
          <ArtPreview art={art} svgRef={svgRef} />
        </div>
      </div>
    </div>
  );
}
