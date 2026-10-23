
import { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { SideForm } from "./components/SideForm";
import { Principal } from "./components/Principal";
import { Gallery } from "./components/Gallery";
import type { GeneratedArt } from "./utils/generateArt";
import { useGallery } from "./utils/gallery-storage";
import { Sidebar } from "./components/Sidebar";

export default function App() {
  // Histórico de artes geradas; `index` aponta para a arte exibida
  const [history, setHistory] = useState<GeneratedArt[]>([]);
  const [index, setIndex] = useState(-1);
  const art = history[index] ?? null;

  const { items, addArt, removeArt, isSaved } = useGallery();
  const navigate = useNavigate();

  function handleGenerate(newArt: GeneratedArt) {
    // Gerar uma arte nova descarta as artes que estavam à frente (refazer)
    setHistory([...history.slice(0, index + 1), newArt]);
    setIndex(index + 1);

    // No celular o formulário fica abaixo da arte: volta ao topo para mostrá-la
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleUndo() {
    setIndex((current) => Math.max(current - 1, 0));
  }

  function handleRedo() {
    setIndex((current) => Math.min(current + 1, history.length - 1));
  }

  function handleSaveToGallery(artToSave: GeneratedArt, name: string) {
    if (!addArt(artToSave, name)) {
      alert("Não foi possível salvar: o armazenamento do navegador está cheio.");
      return false;
    }
    return true;
  }

  // Abre uma arte da galeria no gerador, entrando no histórico de desfazer/refazer
  function handleOpenFromGallery(galleryArt: GeneratedArt) {
    handleGenerate(galleryArt);
    navigate("/");
  }

  return (
    // Celular: colunas empilhadas com rolagem da página. Desktop (lg): 3 colunas fixas.
    <main className="flex min-h-screen flex-col bg-[#0B0D17] lg:h-screen lg:flex-row lg:overflow-hidden">
      <Sidebar />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Principal
                art={art}
                canUndo={index > 0}
                canRedo={index < history.length - 1}
                onUndo={handleUndo}
                onRedo={handleRedo}
                isSaved={isSaved(art)}
                onSaveToGallery={handleSaveToGallery}
              />
              <SideForm initialArt={art} onGenerate={handleGenerate} />
            </>
          }
        />
        <Route
          path="/galeria"
          element={
            <Gallery items={items} onRemove={removeArt} onOpen={handleOpenFromGallery} />
          }
        />
      </Routes>
    </main>
  );
}
