export type TranslationType = {
  // Navbar
  siteTitle: string;
  quran: string;
  masala: string;
  ramadanCalendar: string;

  // Prayer Times
  prayerTimesTitle: string;
  selectDistrict: string;
  selectMadhhab: string;
  selectDate: string;
  currentWakt: string;
  timeRange: string;
  remainingTime: string;
  completed: string;
  hijri: string;

  // Prayer Names
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  tahajjud: string;

  // Error Messages
  loadError: string;
};

export const translations: Record<'en' | 'bn', TranslationType> = {
  en: {
    // Navbar
    siteTitle: 'Prayer Times',
    quran: 'Quran',
    masala: 'Masala',
    ramadanCalendar: 'Ramadan Calendar',

    // Prayer Times
    prayerTimesTitle: 'Prayer Times Schedule',
    selectDistrict: 'Select District',
    selectMadhhab: 'Select Madhhab',
    selectDate: 'Select Date',
    currentWakt: 'Current Time',
    timeRange: 'Time Range',
    remainingTime: 'Remaining Time',
    completed: 'Completed',
    hijri: 'Hijri',

    // Prayer Names
    fajr: 'Fajr',
    sunrise: 'Sunrise',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
    tahajjud: 'Tahajjud',

    // Error Messages
    loadError: 'Failed to load prayer times. Please try again.'
  },
  bn: {
    // Navbar
    siteTitle: 'নামাজের সময়',
    quran: 'কুরআন',
    masala: 'মাসালা',
    ramadanCalendar: 'রমজান ক্যালেন্ডার',

    // Prayer Times
    prayerTimesTitle: 'নামাজের সময়সূচী',
    selectDistrict: 'জেলা নির্বাচন করুন',
    selectMadhhab: 'মাযহাব নির্বাচন করুন',
    selectDate: 'তারিখ নির্বাচন করুন',
    currentWakt: 'বর্তমান ওয়াক্ত',
    timeRange: 'সময়সীমা',
    remainingTime: 'এর সময় বাকি আছে',
    completed: 'সম্পন্ন হয়েছে',
    hijri: 'হিজরি',

    // Prayer Names
    fajr: 'ফজর',
    sunrise: 'সূর্যোদয়',
    dhuhr: 'যোহর',
    asr: 'আসর',
    maghrib: 'মাগরিব',
    isha: 'ইশা',
    tahajjud: 'তাহাজ্জুদ',

    // Error Messages
    loadError: 'নামাজের সময় লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
  }
}; 