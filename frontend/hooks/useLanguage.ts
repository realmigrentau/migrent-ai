import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "../lib/i18n";

export function useLanguage() {
  const { i18n } = useTranslation();

  const currentLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) ||
    SUPPORTED_LANGUAGES[0];

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
