import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // load translations using http -> see /public/locales
  // learn more: https://github.com/i18next/i18next-http-backend
  .use(HttpApi)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: process.env.NODE_ENV === "development", // Log i18n events in development
    fallbackLng: "ko", // Use Korean as fallback language
    supportedLngs: ["ko", "en", "zh"], // Supported languages
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json", // Path to translation files
    },
    // Define namespaces to load initially
    ns: [
      "titleScreen",
      "commentInput",
      "settings",
      "storyMenu",
      "characters",
      "script",
      "missions",
      "instagramScene",
      "missionPanel",
      "commentScene",
      "opinionStats",
      "monologues",
      "instagramPost",
      "commentOverlay",
      "instagramPostInput",
      "instagramCommentList",
      "resultScene", // Add resultScene namespace
    ],
    defaultNS: "common", // Optional: Define a default namespace if you create common.json
    detection: {
      // Order and from where user language should be detected
      order: ["localStorage", "navigator"],
      // Cache user language in localStorage
      caches: ["localStorage"],
    },
  });

export default i18n;
