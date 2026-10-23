import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Images, LayoutGrid, Menu, Palette, Sparkles, X } from "lucide-react";

export function Sidebar() {
    // Celular: opções escondidas até clicar no ícone de menu
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        // Celular: barra no topo com menu recolhível. Desktop: coluna lateral.
        <nav className="w-full shrink-0 bg-[#111522] p-3 text-white lg:h-screen lg:w-64 lg:p-4">
            <div className="lg:mb-4 lg:p-4">
                <div className="flex items-center gap-2 lg:mb-4">
                    <img src="/criativeLab.png" alt="Logo" className="h-10 w-10 lg:mb-4 lg:h-16 lg:w-16" />
                    <h2 className="font-sans text-lg font-bold lg:mb-4 lg:text-xl">Laboratório Criativo</h2>
                    <button
                        type="button"
                        onClick={() => setMenuOpen((open) => !open)}
                        className="ml-auto rounded p-2 hover:bg-gray-700 lg:hidden"
                        aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
                        aria-expanded={menuOpen}
                        aria-controls="sidebar-menu"
                    >
                        {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
                <p className="hidden text-sm text-gray-300 lg:block">Transforme ideias em arte! ✨</p>
            </div>
            <ul
                id="sidebar-menu"
                className={`mt-2 w-full space-y-1 text-sm text-gray-300 lg:mt-0 lg:block lg:space-y-2 ${menuOpen ? "block" : "hidden"}`}
            >
                <li>
                    <NavLink to="/" end className="sidebar-items" onClick={() => setMenuOpen(false)}>
                        <Sparkles fill="currentColor" aria-hidden="true" />
                        <span>Gerador de Arte</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/galeria" className="sidebar-items" onClick={() => setMenuOpen(false)}>
                        <Images aria-hidden="true" />
                        <span>Galeria</span>
                    </NavLink>
                </li>
            </ul>
        </nav>
    )
}