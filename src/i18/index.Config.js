import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { en, hi, ta, ma, te, ka } from "./translations/index";
import AsyncStorage from "@react-native-async-storage/async-storage";

const resources = {
  en: {
    translation: en,
  },
  hi: {
    translation: hi,
  },
  ta: {
    translation: ta,
  },
  ma: {
    translation: ma,
  },
  ka: {
    translation: ka,
  },
  te: {
    translation: te,
  },
};

// Wrap the initialization in an async function
const initializeI18n = async () => {
  const language = await AsyncStorage.getItem("language"); // Use a string key

  i18next.use(initReactI18next).init({
    debug: false,
    lng: language || "en", // Fallback to "en" if language is null
    compatibilityJSON: 'v3',
    fallbackLng: "en",
    resources,
  });
};

initializeI18n(); // Call the async function to initialize i18next

export default i18next;