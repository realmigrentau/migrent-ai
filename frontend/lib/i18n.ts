import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
// Bundle the default (English) translations so they are available
// synchronously during server-side render and static generation. The HTTP
// backend can't fetch the relative /locales path on the server, which is why
// SSR/SSG HTML previously shipped raw keys (nav.home, about.storyP1, ...).
// The other 7 languages keep loading on demand via HttpBackend.
import enCommon from "../public/locales/en/common.json";

/**
 * Every locale that has a translation file. Only the ones listed in
 * NEXT_PUBLIC_ENABLED_LOCALES are offered to visitors.
 *
 * Why the gate: the seven non-English files cover the t()-driven strings
 * (about 97% of keys) but most newer pages, the legal pages, emails and
 * error states are hard-coded English. Switching to Arabic used to set
 * lang="ar" on a page that stayed English and left-to-right. A locale is
 * enabled once tests/unit/locales.test.ts passes for it AND a native
 * speaker has reviewed the legal and safety copy. Until then the selector
 * shows English only, which is honest.
 */
export const ALL_LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "zh", label: "中文", flag: "🇨🇳", dir: "ltr" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳", dir: "ltr" },
  { code: "es", label: "Español", flag: "🇪🇸", dir: "ltr" },
  { code: "ar", label: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "ru", label: "Русский", flag: "🇷🇺", dir: "ltr" },
  { code: "pt", label: "Português", flag: "🇧🇷", dir: "ltr" },
] as const;

export type LanguageCode = (typeof ALL_LANGUAGES)[number]["code"];

const ENABLED: string[] = (process.env.NEXT_PUBLIC_ENABLED_LOCALES || "en")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const SUPPORTED_LANGUAGES = ALL_LANGUAGES.filter((l) => ENABLED.includes(l.code));

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
    // A stored preference for a locale that is no longer enabled falls
    // back to English instead of rendering a mixed-language page.
    nonExplicitSupportedLngs: false,
    load: "languageOnly",
    ns: ["common"],
    defaultNS: "common",
    // English is bundled so it renders correctly on the server; the remaining
    // languages are still fetched lazily by HttpBackend. partialBundledLanguages
    // is required so the backend is still consulted for non-bundled languages.
    resources: {
      en: { common: enCommon },
    },
    partialBundledLanguages: true,
    // Initialise synchronously so t() returns real strings during SSR/SSG
    // instead of falling back to the raw key.
    initImmediate: false,
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "migrent_language",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
