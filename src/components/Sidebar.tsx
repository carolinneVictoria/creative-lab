import { Images, LayoutGrid, Palette, Sparkles } from "lucide-react";

export function Sidebar() {
    return (
        // Celular: barra no topo com menu rolável na horizontal. Desktop: coluna lateral.
        <div className="w-full shrink-0 bg-[#111522] p-3 text-white lg:h-screen lg:w-64 lg:p-4">
            <div className="mb-2 lg:mb-4 lg:p-4">
                <div className="flex items-center gap-2 lg:mb-4">
                    <img src="/criativeLab.png" alt="Logo" className="h-10 w-10 lg:mb-4 lg:h-16 lg:w-16" />
                    <h2 className="font-sans text-lg font-bold lg:mb-4 lg:text-xl">Laboratório Criativo</h2>
                </div>
                <p className="hidden text-sm text-gray-300 lg:block">Transforme ideias em arte! ✨</p>
            </div>
            <ul className="flex w-full gap-1 overflow-x-auto text-sm text-gray-300 lg:block lg:space-y-2 lg:overflow-visible">
                <li>
                    <button type="button" className="sidebar-items">
                        <Sparkles fill="currentColor" aria-hidden="true" />
                        <span>Gerador de Arte</span>
                    </button>
                </li>
                <li>
                    <button type="button" className="sidebar-items">
                        <LayoutGrid aria-hidden="true" />
                        <span>Padrões</span>
                    </button>
                </li>
                <li>
                    <button type="button" className="sidebar-items">
                        <Palette aria-hidden="true" />
                        <span>Paletas</span>
                    </button>
                </li>
                <li>
                    <button type="button" className="sidebar-items">
                        <Images aria-hidden="true" />
                        <span>Galeria</span>
                    </button>
                </li>
            </ul>
        </div>
    )
}