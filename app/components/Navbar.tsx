import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Hind_Siliguri } from 'next/font/google';
import { translations } from '../translations';
import { useDarkMode } from '../context/DarkModeContext';

// Initialize the font
const hindSiliguri = Hind_Siliguri({
  weight: ['400', '500', '600', '700'],
  subsets: ['bengali'],
});

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const { darkMode, toggleDarkMode } = useDarkMode();

  // Initialize language from localStorage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    // Set or default to Bengali
    if (!savedLanguage) {
      localStorage.setItem('language', 'bn');
    }
    setLanguage(savedLanguage as 'bn' | 'en' || 'bn');
  }, []);

  // Toggle language
  const toggleLanguage = () => {
    const newLanguage = language === 'bn' ? 'en' : 'bn';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    // Dispatch a custom event to notify other components of language change
    window.dispatchEvent(new CustomEvent('languageChange', { detail: newLanguage }));
  };

  const t = translations[language];

  return (
    <nav className={`bg-white dark:bg-gray-900 shadow-md transition-colors duration-200 ${hindSiliguri.className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-green-800 dark:text-green-400">
              {t.siteTitle}
            </Link>
          </div>

          {/* Language toggle, Dark mode toggle and Hamburger menu */}
          <div className="flex items-center space-x-4">
            {/* Language toggle button */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
              aria-label="Toggle language"
            >
              <div className="flex items-center justify-center text-base">
                {language === 'bn' ? 'English' : 'বাংলা'}
              </div>
            </button>

            {/* Dark mode toggle button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Hamburger menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-green-800 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`h-6 w-6 transition-transform duration-200 ${isMenuOpen ? 'transform rotate-180' : ''}`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown menu */}
      <div 
        className={`${isMenuOpen ? 'block' : 'hidden'} absolute right-0 mt-0 w-48 bg-white dark:bg-gray-900 shadow-lg rounded-b-lg z-50 transform origin-top-right transition-all duration-200`}
      >
        <div className="py-2">
          <Link
            href="/quran"
            className="block px-4 py-2 text-base font-medium text-green-800 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-gray-700"
          >
            {t.quran}
          </Link>
          <Link
            href="/masala"
            className="block px-4 py-2 text-base font-medium text-green-800 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-gray-700"
          >
            {t.masala}
          </Link>
          <Link
            href="/ramadan"
            className="block px-4 py-2 text-base font-medium text-green-800 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-gray-700"
          >
            {t.ramadanCalendar}
          </Link>
        </div>
      </div>
    </nav>
  );
} 