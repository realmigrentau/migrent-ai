import type { NextRouter } from "next/router";
import type { ShortcutDefinition, ShortcutContext } from "./types";
import { emit } from "./events";

// The single source of truth for all V1 shortcuts.
// Anything shown in the UI MUST come from this registry.
export function buildRegistry(router: NextRouter): ShortcutDefinition[] {
  const go = (href: string) => () => {
    void router.push(href);
  };

  return [
    // ── Help ─────────────────────────────────────────────────────
    {
      id: "help.cheatsheet",
      label: "Show keyboard shortcuts",
      category: "help",
      scope: "global",
      keys: ["?"],
      description: "Open this cheatsheet",
      action: () => emit("shortcut:open-cheatsheet"),
    },

    // ── Search & Command ─────────────────────────────────────────
    {
      id: "search.palette",
      label: "Open command palette",
      category: "search",
      scope: "global",
      keys: ["mod", "k"],
      allowInInput: true,
      description: "Quickly jump anywhere",
      action: () => emit("shortcut:open-palette"),
    },
    {
      id: "search.focus",
      label: "Focus search",
      category: "search",
      scope: "global",
      keys: ["/"],
      description: "Focus the global search bar",
      action: (ctx) => {
        // Try to focus an element marked as the global search input first.
        const target = document.querySelector<HTMLElement>(
          '[data-shortcut-target="global-search"]'
        );
        if (target) {
          target.focus();
          if (target instanceof HTMLInputElement) target.select();
          return;
        }
        // Fall back to navigating to the search page.
        const href = ctx.role === "owner" ? "/owner/listings" : "/seeker/search";
        void router.push(href);
      },
    },

    // ── Navigation (g <letter>) ─────────────────────────────────
    {
      id: "nav.home",
      label: "Go to Home",
      category: "navigation",
      scope: "global",
      keys: ["g", "h"],
      isSequence: true,
      action: go("/"),
    },
    {
      id: "nav.dashboard",
      label: "Go to Dashboard",
      category: "navigation",
      scope: "signed-in",
      keys: ["g", "d"],
      isSequence: true,
      action: go("/dashboard"),
    },
    {
      id: "nav.search",
      label: "Go to Search",
      category: "navigation",
      scope: "global",
      keys: ["g", "s"],
      isSequence: true,
      action: go("/seeker/search"),
    },
    {
      id: "nav.messages",
      label: "Go to Messages",
      category: "navigation",
      scope: "signed-in",
      keys: ["g", "m"],
      isSequence: true,
      action: go("/account/messages"),
    },
    {
      id: "nav.wishlist",
      label: "Go to Wishlist",
      category: "navigation",
      scope: "seeker",
      keys: ["g", "w"],
      isSequence: true,
      action: go("/seeker/wishlist"),
    },
    {
      id: "nav.my-listings",
      label: "Go to My Listings",
      category: "navigation",
      scope: "owner",
      keys: ["g", "l"],
      isSequence: true,
      action: go("/owner/listings"),
    },
    {
      id: "nav.settings",
      label: "Go to Settings",
      category: "navigation",
      scope: "signed-in",
      keys: ["g", "p"],
      isSequence: true,
      action: go("/account/settings"),
    },

    // ── Listings (contextual) ───────────────────────────────────
    {
      id: "listing.new",
      label: "Create new listing",
      category: "listings",
      scope: "owner-dashboard",
      keys: ["n"],
      action: go("/owner/listings/new"),
      enabledWhen: (ctx) =>
        ctx.role === "owner" &&
        (ctx.pathname.startsWith("/dashboard") ||
          ctx.pathname.startsWith("/owner/listings")),
    },
    {
      id: "listing.contact",
      label: "Message host",
      category: "listings",
      scope: "listing-detail",
      keys: ["c"],
      action: () => {
        const target = document.querySelector<HTMLElement>(
          '[data-shortcut-target="contact-owner"]'
        );
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          target.click();
        } else {
          emit("shortcut:contact-owner");
        }
      },
      enabledWhen: (ctx) =>
        ctx.pathname.startsWith("/listing/") &&
        typeof document !== "undefined" &&
        !!document.querySelector('[data-shortcut-target="contact-owner"]'),
    },

  ];
}

export function isShortcutEligible(
  def: ShortcutDefinition,
  ctx: ShortcutContext
): boolean {
  // Scope gating.
  switch (def.scope) {
    case "global":
      break;
    case "signed-in":
      if (!ctx.isAuthenticated) return false;
      break;
    case "owner":
      if (ctx.role !== "owner") return false;
      break;
    case "seeker":
      if (ctx.role !== "seeker") return false;
      break;
    case "listing-detail":
      if (!ctx.pathname.startsWith("/listing/")) return false;
      break;
    case "owner-dashboard":
      if (ctx.role !== "owner") return false;
      if (
        !ctx.pathname.startsWith("/dashboard") &&
        !ctx.pathname.startsWith("/owner/listings")
      ) {
        return false;
      }
      break;
  }
  if (def.enabledWhen && !def.enabledWhen(ctx)) return false;
  return true;
}
