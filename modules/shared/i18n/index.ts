import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ms from "./locales/ms.json";

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    initAsync: false,
    resources: {
      en: { translation: en },
      ms: { translation: ms },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}

export default i18n;
