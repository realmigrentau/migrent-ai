import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "../lib/i18n";

export function useLanguage() {
  const { i18n } = useTranslation();

  const currentLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) ||
    SUPPORTED_LANGUAGES[0];

  // If a previous visit stored a locale that is no longer enabled, switch
  // back explicitly so i18next stops trying to load it.
  useEffect(() => {
    if (i18n.language && !SUPPORTED_LANGUAGES.some((l) => l.code === i18n.language)) {
      void i18n.changeLanguage(SUPPORTED_LANGUAGES[0].code);
    }
  }, [i18n]);

  const changeLanguage = useCallback(
    (code: LanguageCode) => {
      i18n.changeLanguage(code);
      const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
      document.documentElement.dir = lang?.dir || "ltr";
      document.documentElement.lang = code;
    },
    [i18n],
  );

  useEffect(() => {
    document.documentElement.dir = currentLanguage.dir;
    document.documentElement.lang = currentLanguage.code;
  }, [currentLanguage]);

  return {
    currentLanguage,
    changeLanguage,
    languages: SUPPORTED_LANGUAGES,
    isRTL: currentLanguage.dir === "rtl",
  };
}
