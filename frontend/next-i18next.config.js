/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh", "hi", "es", "ar", "fr", "ru", "pt"],
    localeDetection: true,
  },
  fallbackLng: "en",
  ns: ["common"],
  defaultNS: "common",
  localePath: typeof window === "undefined" ? require("path").resolve("./public/locales") : "/locales",
  reloadOnPrerender: process.env.NODE_ENV === "development",
};
