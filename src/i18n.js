import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // فایل‌های ترجمه را از سرور (یا پوشه public) بارگیری می‌کند
  .use(initReactI18next) // i18next را به ری‌اکت متصل می‌کند
  .init({
    lng: 'en', // زبان پیش‌فرض
    fallbackLng: 'en', // زبانی که در صورت نبود ترجمه استفاده می‌شود
    debug: true, // پیام‌های دیباگ را در کنسول نمایش می‌دهد (برای توسعه)
    
    backend: {
      // مسیر فایل‌های ترجمه
      loadPath: '/locales/{{lng}}/translation.json',
    },

    interpolation: {
      escapeValue: false, // ری‌اکت خودش از حملات XSS جلوگیری می‌کند
    },
  });

export default i18n;
