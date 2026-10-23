
import { useState } from "react";
import { SideForm } from "./components/SideForm";
import { Principal } from "./components/Principal";
import type { GeneratedArt } from "./utils/generateArt";
import { Sidebar } from "./components/Sidebar";

export default function App() {
  // Histórico de artes geradas; `index` aponta para a arte exibida
  const [history, setHistory] = useState<GeneratedArt[]>([]);
  const [index, setIndex] = useState(-1);
  const art = history[index] ?? null;

  function handleGenerate(newArt: GeneratedArt) {
    // Gerar uma arte nova descarta as artes que estavam à frente (refazer)
    setHistory([...history.slice(0, index + 1), newArt]);
    setIndex(index + 1);
  }

  function handleUndo() {
    setIndex((current) => Math.max(current - 1, 0));
  }

  function handleRedo() {
    setIndex((current) => Math.min(current + 1, history.length - 1));
  }

  return (
    // Celular: colunas empilhadas com rolagem da página. Desktop (lg): 3 colunas fixas.
    <main className="flex min-h-screen flex-col bg-[#0B0D17] lg:h-screen lg:flex-row lg:overflow-hidden">
      <Sidebar />
      <Principal
        art={art}
        canUndo={index > 0}
        canRedo={index < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
      <SideForm onGenerate={handleGenerate} />
    </main>
  );
}
