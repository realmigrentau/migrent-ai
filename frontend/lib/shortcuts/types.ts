// Shortcut types for the MigRent keyboard system.

export type ShortcutCategory =
  | "navigation"
  | "search"
  | "listings"
  | "messaging"
  | "help";

export type ShortcutScope =
  | "global"
  | "signed-in"
  | "owner"
  | "seeker"
  | "listing-detail"
  | "owner-dashboard";

export type ShortcutContext = {
  pathname: string;
  role: "owner" | "seeker" | null;
  isAuthenticated: boolean;
};

export type ShortcutDefinition = {
  id: string;
  label: string;
  category: ShortcutCategory;
  scope: ShortcutScope;
  // Either a single combo (e.g. ["mod", "k"]) or a sequence (e.g. ["g", "d"]).
  // "mod" means Cmd on Mac, Ctrl on other platforms.
  // For sequences, only single non-modifier keys are supported.
  keys: string[];
  isSequence?: boolean;
  // Optional description for the cheatsheet.
  description?: string;
  // Whether the shortcut is allowed to fire while typing in an input/textarea.
  // Defaults to false. Modifier-based shortcuts (e.g. mod+k) usually set true.
  allowInInput?: boolean;
  // Action runs when the shortcut fires. Receives the current context.
  action: (ctx: ShortcutContext) => void;
  // Returns true if the shortcut should be eligible to fire right now.
  // Defaults to: scope check only.
  enabledWhen?: (ctx: ShortcutContext) => boolean;
};

export type ShortcutPrefs = {
  enabled: boolean;
  categories: Record<ShortcutCategory, boolean>;
};

export const DEFAULT_PREFS: ShortcutPrefs = {
  enabled: true,
  categories: {
    navigation: true,
    search: true,
    listings: true,
    messaging: true,
    help: true,
  },
};

export const CATEGORY_LABELS: Record<ShortcutCategory, string> = {
  navigation: "Navigation",
  search: "Search & Command",
  listings: "Listings",
  messaging: "Messaging",
  help: "Help",
};

export const CATEGORY_DESCRIPTIONS: Record<ShortcutCategory, string> = {
  navigation: "Jump between pages with the g prefix",
  search: "Open the command palette and search",
  listings: "Quick actions on listings",
  messaging: "Send and navigate messages",
  help: "Discover what's available",
};
