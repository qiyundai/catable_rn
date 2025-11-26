import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from '../locales/en.json';
import zh from '../locales/zh.json';
import ja from '../locales/ja.json';

const resources = {
  en: { translation: en },
  zh: { translation: zh },
  ja: { translation: ja },
};

// Get initial language from device locale or default to 'en'
const getInitialLanguage = (): string => {
  try {
    return Localization.locale.split('-')[0]; // Get language code (e.g., 'en' from 'en-US')
  } catch {
    return 'en';
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Function to change language
export const changeLanguage = (language: 'en' | 'zh' | 'ja') => {
  i18n.changeLanguage(language);
};

// Function to initialize language from user preference
export const initializeLanguage = (language?: 'en' | 'zh' | 'ja') => {
  if (language && ['en', 'zh', 'ja'].includes(language)) {
    i18n.changeLanguage(language);
  }
};

export default i18n;
