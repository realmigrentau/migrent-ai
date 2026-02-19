"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import i18n from "../../../lib/i18n";
import Resources from "../../../pages/resources";

const SUPPORTED_LOCALES = ["en", "zh", "hi", "es", "ar", "fr", "ru", "pt"];

export default function LangResourcesPage() {
  const params = useParams();
  const lang = typeof params?.lang === "string" ? params.lang : "en";

  useEffect(() => {
    if (SUPPORTED_LOCALES.includes(lang) && i18n.language !== lang) {
      i18n.changeLanguage(lang);
      localStorage.setItem("migrent_language", lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  }, [lang]);

  return <Resources />;
}
