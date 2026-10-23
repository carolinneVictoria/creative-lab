import { useState } from "react";
import type { GeneratedArt } from "./generateArt";

export type GalleryItem = {
  id: string;
  name: string;
  createdAt: number;
  art: GeneratedArt;
};

const STORAGE_KEY = "creative-lab:gallery";

// Lê a galeria; devolve lista vazia se não existir, estiver corrompida ou o acesso for bloqueado
export function loadGallery(): GalleryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const items: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? (items as GalleryItem[]) : [];
  } catch {
    return [];
  }
}

// Grava a galeria; devolve false se falhar (ex.: armazenamento cheio)
export function saveGallery(items: GalleryItem[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

export function useGallery() {
  const [items, setItems] = useState<GalleryItem[]>(loadGallery);

  function update(next: GalleryItem[]) {
    if (!saveGallery(next)) return false;
    setItems(next);
    return true;
  }

  function addArt(art: GeneratedArt, name: string) {
    const item: GalleryItem = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      art,
    };
    return update([item, ...items]);
  }

  function removeArt(id: string) {
    return update(items.filter((item) => item.id !== id));
  }

  // A mesma arte gerada tem o mesmo seed e as mesmas formas
  function isSaved(art: GeneratedArt | null) {
    if (!art) return false;
    const key = JSON.stringify(art);
    return items.some((item) => item.art.seed === art.seed && JSON.stringify(item.art) === key);
  }

  return { items, addArt, removeArt, isSaved };
}
