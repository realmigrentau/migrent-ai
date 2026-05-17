import { useCallback, useEffect, useState } from "react";

export type Palette = "sky" | "sand" | "cloud" | "mint" | "blush" | "paper";

export const PALETTES: { id: Palette; name: string; desc: string; tag?: "Recommended" | "Original"; swatch: string[] }[] = [
  {
    id: "sky",
    name: "Sky",
    desc: "Soft light blue - clear and friendly",
    tag: "Recommended",
    swatch: ["#e6edf6", "#f2f6fb", "#0f1d2e", "#1c4a7a", "#2d6a4f"],
  },
  {
    id: "sand",
    name: "Sand & Navy",
    desc: "Warm, hospitable - the original direction",
    tag: "Original",
    swatch: ["#f5f1e8", "#fbf8f0", "#14181c", "#0e2237", "#2d6a4f"],
  },
  {
    id: "cloud",
    name: "Cloud & Slate",
    desc: "Cool neutral - broadest audience, premium-clean",
    swatch: ["#eff2f6", "#f7f9fc", "#0f172a", "#1e3a5f", "#0e7c66"],
  },
  {
    id: "mint",
    name: "Mint Garden",
    desc: "Soft green surface, deep forest primary",
    swatch: ["#e8f0ea", "#f3f8f4", "#142019", "#1f5538", "#a8521c"],
  },
  {
    id: "blush",
    name: "Blush",
    desc: "Warm rose pink, deep wine primary",
    swatch: ["#f4e7e3", "#faf1ee", "#2a1818", "#6b2c3a", "#1f5538"],
  },
  {
    id: "paper",
    name: "Paper",
    desc: "Pure neutral grayscale, ink primary",
    swatch: ["#f4f4f2", "#fafaf9", "#18181b", "#18181b", "#1f5538"],
  },
];

const STORAGE_KEY = "migrent_palette";
const DEFAULT_PALETTE: Palette = "sky";

function readPalette(): Palette {
  if (typeof window === "undefined") return DEFAULT_PALETTE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && PALETTES.some((p) => p.id === stored)) {
      return stored as Palette;
    }
  } catch {}
  return DEFAULT_PALETTE;
}

function applyPalette(palette: Palette) {
  if (typeof document === "undefined") return;
  if (palette === DEFAULT_PALETTE) {
    document.documentElement.removeAttribute("data-palette");
  } else {
    document.documentElement.setAttribute("data-palette", palette);
  }
}

export function usePalette() {
  const [palette, setPaletteState] = useState<Palette>(DEFAULT_PALETTE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const p = readPalette();
    setPaletteState(p);
    applyPalette(p);
    setMounted(true);
  }, []);

  const setPalette = useCallback((p: Palette) => {
    setPaletteState(p);
    applyPalette(p);
    try {
      localStorage.setItem(STORAGE_KEY, p);
    } catch {}
  }, []);

  return { palette, setPalette, mounted };
}
