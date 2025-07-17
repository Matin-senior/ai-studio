import { useState, useEffect } from 'react';

const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    // خواندن تم ذخیره شده از حافظه یا تشخیص تم پیش‌فرض سیستم عامل
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // اگر تمی ذخیره نشده بود، تم سیستم عامل کاربر رو چک می‌کنه
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement; // تگ <html>

    // بهینه‌سازی: به جای data-attribute از class استفاده می‌کنیم
    // این روش استاندارد و پیشنهادی Tailwind CSS است
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // ذخیره انتخاب کاربر در حافظه برای بازدیدهای بعدی
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
};

export default useTheme;
