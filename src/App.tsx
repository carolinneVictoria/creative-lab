
import { useState } from "react";
import { SideForm } from "./components/SideForm";
import { Principal } from "./components/Principal";
import type { GeneratedArt } from "./utils/generateArt";
import { Sidebar } from "./components/Sidebar";

export default function App() {
  const [art, setArt] = useState<GeneratedArt | null>(null);

  return (
    // Celular: colunas empilhadas com rolagem da página. Desktop (lg): 3 colunas fixas.
    <main className="flex min-h-screen flex-col bg-[#0B0D17] lg:h-screen lg:flex-row lg:overflow-hidden">
      <Sidebar />
      <Principal art={art} />
      <SideForm onGenerate={setArt} />
    </main>
  );
}
