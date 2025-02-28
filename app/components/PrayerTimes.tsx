'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { format, addDays, parseISO, parse } from 'date-fns';

// Add font import
import { Hind_Siliguri } from 'next/font/google';
import Navbar from './Navbar';
import { translations } from '../translations';

// Initialize the font
const hindSiliguri = Hind_Siliguri({
  weight: ['400', '500', '600', '700'],
  subsets: ['bengali'],
});

interface PrayerTime {
  timings: {
    [key: string]: string;  // Add index signature to allow string indexing
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  date: {
    readable: string;
    hijri: {
      date: string;
      month: {
        en: string;
      };
      year: string;
    };
  };
}

interface District {
  name: string;
  nameBangla: string;
  latitude: number;
  longitude: number;
}

interface Madhhab {
  name: string;
  nameBangla: string;
  method: number;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationInfo {
  name: string;
  nameBangla?: string;
}

const madhhabs: Madhhab[] = [
  { name: 'Hanafi', nameBangla: 'হানাফি', method: 1 },
  { name: 'Shafi', nameBangla: 'শাফিঈ', method: 4 },
  { name: 'Hanbali', nameBangla: 'হাম্বলী', method: 4 }
];

const districts: District[] = [
  { name: 'Dhaka', nameBangla: 'ঢাকা', latitude: 23.8103, longitude: 90.4125 },
  { name: 'Chittagong', nameBangla: 'চট্টগ্রাম', latitude: 22.3569, longitude: 91.7832 },
  { name: 'Sylhet', nameBangla: 'সিলেট', latitude: 24.8949, longitude: 91.8687 },
  { name: 'Rajshahi', nameBangla: 'রাজশাহী', latitude: 24.3745, longitude: 88.6042 },
  { name: 'Khulna', nameBangla: 'খুলনা', latitude: 22.8456, longitude: 89.5403 },
  { name: 'Barisal', nameBangla: 'বরিশাল', latitude: 22.7010, longitude: 90.3535 },
  { name: 'Rangpur', nameBangla: 'রংপুর', latitude: 25.7439, longitude: 89.2752 },
  { name: 'Mymensingh', nameBangla: 'ময়মনসিংহ', latitude: 24.7471, longitude: 90.4203 }
];

const prayerNamesBangla: { [key: string]: string } = {
  'Fajr': 'ফজর',
  'Sunrise': 'সূর্যোদয়',
  'Dhuhr': 'যোহর',
  'Asr': 'আসর',
  'Maghrib': 'মাগরিব',
  'Isha': 'ইশা',
  'Tahajjud': 'তাহাজ্জুদ'
};

const calculateTahajjudTime = (ishaTime: string, fajrTime: string): { start: string; end: string } => {
  const [ishaHours, ishaMinutes] = ishaTime.split(':').map(Number);
  const [fajrHours, fajrMinutes] = fajrTime.split(':').map(Number);

  // Convert Fajr time to minutes since midnight
  const fajrTotalMinutes = fajrHours * 60 + fajrMinutes;
  
  // Convert Isha time to minutes since midnight
  let ishaTotalMinutes = ishaHours * 60 + ishaMinutes;
  
  // If Isha is before midnight and Fajr is after, add 24 hours to Fajr
  const fajrTimeWithOffset = fajrTotalMinutes + (fajrHours < ishaHours ? 24 * 60 : 0);
  
  // Calculate the duration between Isha and Fajr
  const durationInMinutes = fajrTimeWithOffset - ishaTotalMinutes;
  
  // Tahajjud starts at last third of the night
  const tahajjudStartMinutes = ishaTotalMinutes + Math.floor(durationInMinutes * 0.66);
  
  // Convert back to hours and minutes
  const startHours = Math.floor(tahajjudStartMinutes / 60) % 24;
  const startMinutes = tahajjudStartMinutes % 60;
  
  return {
    start: `${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`,
    end: fajrTime
  };
};

const getPrayerEndTime = (currentPrayer: string, nextPrayer: string): string => {
  // Prayer end times based on Islamic rules
  switch (currentPrayer) {
    case 'Fajr':
      return nextPrayer; // Fajr ends at Sunrise
    case 'Dhuhr':
      return nextPrayer; // Dhuhr ends at Asr
    case 'Asr':
      return nextPrayer; // Asr ends at Maghrib
    case 'Maghrib':
      return nextPrayer; // Maghrib ends at Isha
    case 'Isha':
      return '23:59'; // Isha ends at midnight
    default:
      return '';
  }
};

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatTimeRemaining = (endTime: string, currentTime: Date): string => {
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const endDate = new Date(currentTime);
  endDate.setHours(endHours);
  endDate.setMinutes(endMinutes);
  endDate.setSeconds(0);

  if (endDate < currentTime) {
    endDate.setDate(endDate.getDate() + 1);
  }

  const diffMs = endDate.getTime() - currentTime.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

  if (diffHrs > 0) {
    return `${diffHrs.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`;
  }
  return `${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`;
};

const calculateProgress = (startTime: string, endTime: string, currentTime: Date): number => {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  let start = timeToMinutes(startTime);
  let end = timeToMinutes(endTime);
  let current = currentMinutes;

  // Handle cases where the time period crosses midnight
  if (end < start) {
    end += 24 * 60; // Add 24 hours worth of minutes
    if (current < start) {
      current += 24 * 60;
    }
  }

  // If current time is before start time or after end time, return 0
  if (current < start || current > end) {
    return 0;
  }

  // Calculate percentage
  const totalDuration = end - start;
  const elapsed = current - start;
  return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
};

const getCurrentPrayer = (prayerTimes: PrayerTime, currentTime: Date): string => {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  
  for (let i = 0; i < prayers.length; i++) {
    const currentPrayerTime = timeToMinutes(prayerTimes.timings[prayers[i] as keyof typeof prayerTimes.timings].split(' ')[0]);
    const nextPrayerTime = i < prayers.length - 1 
      ? timeToMinutes(prayerTimes.timings[prayers[i + 1] as keyof typeof prayerTimes.timings].split(' ')[0])
      : timeToMinutes('23:59');

    if (currentMinutes >= currentPrayerTime && currentMinutes < nextPrayerTime) {
      return prayers[i];
    }
  }

  // If current time is after Isha or before Fajr, check if it's Tahajjud time
  const tahajjudTime = calculateTahajjudTime(
    prayerTimes.timings.Isha.split(' ')[0],
    prayerTimes.timings.Fajr.split(' ')[0]
  );
  
  const tahajjudStartMinutes = timeToMinutes(tahajjudTime.start);
  const tahajjudEndMinutes = timeToMinutes(tahajjudTime.end);
  
  if (currentMinutes >= tahajjudStartMinutes || currentMinutes < tahajjudEndMinutes) {
    return 'Tahajjud';
  }

  return 'Isha'; // Default to Isha for the period after Isha until Tahajjud
};

// Add Bengali month names for Gregorian calendar
const gregorianMonthsBengali: { [key: string]: string } = {
  'Jan': 'জানুয়ারি',
  'Feb': 'ফেব্রুয়ারি',
  'Mar': 'মার্চ',
  'Apr': 'এপ্রিল',
  'May': 'মে',
  'Jun': 'জুন',
  'Jul': 'জুলাই',
  'Aug': 'আগস্ট',
  'Sep': 'সেপ্টেম্বর',
  'Oct': 'অক্টোবর',
  'Nov': 'নভেম্বর',
  'Dec': 'ডিসেম্বর'
};

// Add Bengali month names for Hijri calendar
const hijriMonthsBengali: { [key: string]: string } = {
  'Muharram': 'মুহাররম',
  'Safar': 'সফর',
  'Rabi al-awwal': 'রবিউল আউয়াল',
  'Rabi al-thani': 'রবিউস সানি',
  'Jumada al-awwal': 'জুমাদাল উলা',
  'Jumada al-thani': 'জুমাদাস সানি',
  'Rajab': 'রজব',
  'Shaban': 'শাবান',
  'Ramadan': 'রমজান',
  'Shawwal': 'শাওয়াল',
  'Dhul-Qadah': 'জিলকদ',
  'Dhul-Hijjah': 'জিলহজ',
  // Alternative spellings
  'Rabi Al-Awwal': 'রবিউল আউয়াল',
  'Rabi Al-Thani': 'রবিউস সানি',
  'Jumada Al-Ula': 'জুমাদাল উলা',
  'Jumada Al-Thaniyah': 'জুমাদাস সানি',
  'Dhu al-Qadah': 'জিলকদ',
  'Dhu al-Hijjah': 'জিলহজ',
  'Shaʻban': 'শাবান'
};

// Add Bengali numerals
const englishToBengaliNumerals: { [key: string]: string } = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯'
};

const convertToBengaliNumerals = (number: string): string => {
  return number.split('').map(digit => englishToBengaliNumerals[digit] || digit).join('');
};

// Add Bengali day names
const bengaliDayNames: { [key: string]: string } = {
  'Sunday': 'রবিবার',
  'Monday': 'সোমবার',
  'Tuesday': 'মঙ্গলবার',
  'Wednesday': 'বুধবার',
  'Thursday': 'বৃহস্পতিবার',
  'Friday': 'শুক্রবার',
  'Saturday': 'শনিবার'
};

const getLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

const getLocationName = async (coords: Coordinates): Promise<LocationInfo> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
    );
    const data = await response.json();
    return {
      name: data.address.city || data.address.town || data.address.village || data.address.suburb,
      nameBangla: data.address.city || data.address.town || data.address.village || data.address.suburb // You might want to add Bengali translation here
    };
  } catch (error) {
    throw new Error('Failed to get location name');
  }
};

export default function PrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDistrict, setSelectedDistrict] = useState<District>(districts[0]);
  const [selectedMadhhab, setSelectedMadhhab] = useState<Madhhab>(madhhabs[0]);
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [userLocation, setUserLocation] = useState<LocationInfo | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize language from localStorage
    const savedLanguage = localStorage.getItem('language') as 'bn' | 'en';
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    // Listen for language changes
    const handleLanguageChange = (event: CustomEvent<'bn' | 'en'>) => {
      setLanguage(event.detail);
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        setLoading(true);
        const formattedDate = format(parseISO(selectedDate), 'dd-MM-yyyy');
        
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${formattedDate}?latitude=${selectedDistrict.latitude}&longitude=${selectedDistrict.longitude}&method=${selectedMadhhab.method}`
        );
        
        if (!response.ok) {
          throw new Error('নামাজের সময় লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        }

        const data = await response.json();
        setPrayerTimes(data.data);
        setLoading(false);
      } catch (err) {
        setError('নামাজের সময় লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [selectedDistrict, selectedMadhhab, selectedDate]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const coords = await getLocation();
        const locationInfo = await getLocationName(coords);
        setUserLocation(locationInfo);
        
        // Find the nearest district
        const nearest = findNearestDistrict(coords.latitude, coords.longitude, districts);
        if (nearest) {
          setSelectedDistrict(nearest);
        }
      } catch (error) {
        setLocationError(error instanceof Error ? error.message : 'Failed to get location');
      }
    };

    fetchLocation();
  }, []);

  const t = translations[language];

  // Format the date for display
  const formatDateForDisplay = (dateStr: string) => {
    const date = parseISO(dateStr);
    return format(date, 'dd/MM/yyyy');
  };

  // Parse the displayed date back to yyyy-MM-dd format
  const parseDateFromDisplay = (dateStr: string) => {
    try {
      const date = parse(dateStr, 'dd/MM/yyyy', new Date());
      return format(date, 'yyyy-MM-dd');
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 dark:bg-gray-900">
        {t.loadError}
      </div>
    );
  }

  const convertTo12Hour = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    return format(date, 'hh:mm a');
  };

  const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  // Calculate Tahajjud time and current prayer
  const tahajjudTime = prayerTimes ? calculateTahajjudTime(
    prayerTimes.timings.Isha.split(' ')[0],
    prayerTimes.timings.Fajr.split(' ')[0]
  ) : null;

  const currentPrayer = prayerTimes ? getCurrentPrayer(prayerTimes, currentTime) : null;

  const findNearestDistrict = (lat: number, lon: number, districts: District[]): District | null => {
    let nearest = null;
    let minDistance = Infinity;

    districts.forEach(district => {
      const distance = calculateDistance(lat, lon, district.latitude, district.longitude);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = district;
      }
    });

    return nearest;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <>
      <Navbar />
      <div className={`min-h-screen bg-gradient-to-b from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 py-8 sm:py-12 px-3 sm:px-4 ${hindSiliguri.className}`}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
            <h1 
              className="text-2xl sm:text-3xl font-bold text-center text-green-800 dark:text-green-400 mb-2"
              itemScope 
              itemType="https://schema.org/WebPage"
            >
              <span itemProp="name">{t.prayerTimesTitle}</span>
            </h1>
            <div 
              role="region" 
              aria-label="Prayer time controls"
              className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-3xl"
            >
              <div className="relative">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {t.selectDistrict}
                </label>
                <select
                  value={selectedDistrict.name}
                  onChange={(e) => {
                    const district = districts.find(d => d.name === e.target.value);
                    if (district) setSelectedDistrict(district);
                  }}
                  className="w-full px-2 sm:px-4 py-2 text-base sm:text-lg bg-white dark:bg-gray-700 border border-green-300 dark:border-green-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:text-white"
                >
                  {districts.map((district) => (
                    <option key={district.name} value={district.name}>
                      {language === 'bn' ? district.nameBangla : district.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {t.selectMadhhab}
                </label>
                <select
                  value={selectedMadhhab.name}
                  onChange={(e) => {
                    const madhhab = madhhabs.find(m => m.name === e.target.value);
                    if (madhhab) setSelectedMadhhab(madhhab);
                  }}
                  className="w-full px-2 sm:px-4 py-2 text-base sm:text-lg bg-white dark:bg-gray-700 border border-green-300 dark:border-green-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:text-white"
                >
                  {madhhabs.map((madhhab) => (
                    <option key={madhhab.name} value={madhhab.name}>
                      {language === 'bn' ? madhhab.nameBangla : madhhab.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {t.selectDate}
                </label>
                <input
                  type="text"
                  value={formatDateForDisplay(selectedDate)}
                  onChange={(e) => {
                    const newDate = parseDateFromDisplay(e.target.value);
                    if (newDate) {
                      setSelectedDate(newDate);
                    }
                  }}
                  className="w-full px-2 sm:px-4 py-2 text-base sm:text-lg bg-white dark:bg-gray-700 border border-green-300 dark:border-green-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:text-white [&::-webkit-calendar-picker-indicator]:dark:invert"
                  placeholder="DD/MM/YYYY"
                  onFocus={(e) => {
                    e.target.type = 'date';
                    e.target.value = selectedDate;
                  }}
                  onBlur={(e) => {
                    e.target.type = 'text';
                    e.target.value = formatDateForDisplay(selectedDate);
                  }}
                />
              </div>
            </div>
            {prayerTimes && (
              <>
                <div 
                  role="contentinfo" 
                  aria-label="Current date"
                  className="text-center mb-6"
                >
                  <p className="text-gray-600 dark:text-gray-300 text-lg py-3 my-2">
                    {language === 'bn' 
                      ? `আজ `
                      : `Today is `}
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400 px-2">
                      {language === 'bn'
                        ? bengaliDayNames[format(new Date(prayerTimes.date.readable), 'EEEE')]
                        : format(new Date(prayerTimes.date.readable), 'EEEE')}
                    </span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">
                    {language === 'bn'
                      ? `${convertToBengaliNumerals(prayerTimes.date.hijri.date)} ${hijriMonthsBengali[prayerTimes.date.hijri.month.en] || prayerTimes.date.hijri.month.en} ${convertToBengaliNumerals(prayerTimes.date.hijri.year)} ${t.hijri}`
                      : `${prayerTimes.date.hijri.date} ${prayerTimes.date.hijri.month.en} ${prayerTimes.date.hijri.year} ${t.hijri}`}
                  </p>
                </div>

                <div 
                  role="main"
                  aria-label="Current prayer information"
                  className="mb-6 sm:mb-8 rounded-xl p-4 sm:p-6 text-center bg-gradient-to-r from-green-50 via-green-100 to-green-50 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 border-2 border-green-200 dark:border-green-600"
                >
                  {currentPrayer && (
                    <div className="grid md:grid-cols-2 gap-4 sm:gap-8 relative px-2 sm:px-4">
                      <div className="space-y-3 sm:space-y-4 mx-2 sm:mx-3">
                        <div className="bg-white dark:bg-gray-800 rounded-lg px-4 sm:px-8 py-4 sm:py-5 shadow-md h-full">
                          <div className="mb-3 sm:mb-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-400">
                              {language === 'bn' ? prayerNamesBangla[currentPrayer] : currentPrayer}
                            </h2>
                            <p className="text-base sm:text-lg font-medium text-green-800 dark:text-green-500">
                              {t.currentWakt}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                              {t.timeRange}
                            </p>
                            {currentPrayer === 'Tahajjud' ? (
                              <div>
                                <div className="font-mono text-2xl sm:text-3xl font-bold text-green-900 whitespace-nowrap">
                                  {convertTo12Hour(tahajjudTime?.start || '')} - {convertTo12Hour(tahajjudTime?.end || '')}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="font-mono text-2xl sm:text-3xl font-bold text-green-900 whitespace-nowrap">
                                  {convertTo12Hour(prayerTimes.timings[currentPrayer].split(' ')[0])} - {currentPrayer === 'Isha' 
                                    ? convertTo12Hour('23:59')
                                    : convertTo12Hour(prayerTimes.timings[
                                        prayerOrder[prayerOrder.indexOf(currentPrayer) + 1]
                                      ].split(' ')[0])}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="hidden md:block absolute right-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-green-700 via-green-800 to-green-700 dark:from-green-500 dark:via-green-400 dark:to-green-500"></div>

                      <div className="space-y-3 sm:space-y-4 mx-2 sm:mx-3">
                        <div className="bg-white dark:bg-gray-800 rounded-lg px-4 sm:px-8 py-4 sm:py-5 shadow-md h-full">
                          <div className="mb-3 sm:mb-4">
                            <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                              {t.remainingTime}
                            </p>
                            <div className="font-mono text-4xl sm:text-5xl font-extrabold text-green-700">
                              {currentPrayer === 'Tahajjud'
                                ? formatTimeRemaining(tahajjudTime?.end || '', currentTime)
                                : formatTimeRemaining(
                                    currentPrayer === 'Isha'
                                      ? '23:59'
                                      : prayerTimes.timings[prayerOrder[prayerOrder.indexOf(currentPrayer) + 1]].split(' ')[0],
                                    currentTime
                                  )}
                            </div>
                          </div>

                          <div className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                            {t.completed}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                  className="bg-orange-500 h-3 rounded-full transition-all duration-1000"
                                  style={{ 
                                    width: `${currentPrayer === 'Tahajjud'
                                      ? calculateProgress(
                                          tahajjudTime?.start || '',
                                          tahajjudTime?.end || '',
                                          currentTime
                                        )
                                      : calculateProgress(
                                          prayerTimes.timings[currentPrayer].split(' ')[0],
                                          currentPrayer === 'Isha'
                                            ? '23:59'
                                            : prayerTimes.timings[prayerOrder[prayerOrder.indexOf(currentPrayer) + 1]].split(' ')[0],
                                          currentTime
                                        )}%`
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="text-lg font-bold text-green-700 w-16">
                              {Math.round(currentPrayer === 'Tahajjud'
                                ? calculateProgress(
                                    tahajjudTime?.start || '',
                                    tahajjudTime?.end || '',
                                    currentTime
                                  )
                                : calculateProgress(
                                    prayerTimes.timings[currentPrayer].split(' ')[0],
                                    currentPrayer === 'Isha'
                                      ? '23:59'
                                      : prayerTimes.timings[prayerOrder[prayerOrder.indexOf(currentPrayer) + 1]].split(' ')[0],
                                    currentTime
                                  ))}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div 
                  role="list"
                  aria-label="Prayer schedule"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                >
                  {tahajjudTime && (
                    <div className={`rounded-xl p-4 sm:p-6 text-center transform hover:scale-105 transition-transform duration-200 border-2
                      ${currentPrayer === 'Tahajjud' 
                        ? 'bg-green-100 dark:bg-gray-700 border-green-500 dark:border-green-400 shadow-lg' 
                        : 'bg-green-50 dark:bg-gray-800 border-green-200 dark:border-green-600'}`}>
                      <h3 className="text-2xl sm:text-3xl font-bold text-green-800 dark:text-green-400 mb-3 sm:mb-4">
                        {language === 'bn' ? prayerNamesBangla['Tahajjud'] : t.tahajjud}
                      </h3>
                      <div className="text-xl sm:text-2xl font-semibold text-green-600 whitespace-nowrap">
                        <span>{convertTo12Hour(tahajjudTime.start)}</span>
                        <span className="mx-2">-</span>
                        <span>{convertTo12Hour(tahajjudTime.end)}</span>
                      </div>
                    </div>
                  )}
                  {prayerOrder.map((name, index) => {
                    if (name === 'Sunrise') return null;
                    const prayerKey = name.toLowerCase() as keyof typeof t;
                    const nextPrayer = prayerOrder[prayerOrder.indexOf(name) + 1];
                    const endTime = nextPrayer ? prayerTimes.timings[nextPrayer].split(' ')[0] : '23:59';
                    
                    return (
                      <div
                        key={name}
                        className={`rounded-xl p-4 sm:p-6 text-center transform hover:scale-105 transition-transform duration-200 border-2
                          ${currentPrayer === name 
                            ? 'bg-green-100 dark:bg-gray-700 border-green-500 dark:border-green-400 shadow-lg' 
                            : 'bg-green-50 dark:bg-gray-800 border-green-200 dark:border-green-600'}`}
                      >
                        <h3 className="text-2xl sm:text-3xl font-bold text-green-800 dark:text-green-400 mb-3 sm:mb-4">
                          {language === 'bn' ? prayerNamesBangla[name] : t[prayerKey]}
                        </h3>
                        <div className="text-xl sm:text-2xl font-semibold text-green-600 whitespace-nowrap">
                          <span>{convertTo12Hour(prayerTimes.timings[name as keyof typeof prayerTimes.timings].split(' ')[0])}</span>
                          <span className="mx-2">-</span>
                          <span>{convertTo12Hour(endTime)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-center text-gray-600 dark:text-gray-400 py-2">
        {userLocation ? (
          <p>
            {language === 'bn' 
              ? `আপনার বর্তমান অবস্থান: ${userLocation.nameBangla || userLocation.name}`
              : `Your current location: ${userLocation.name}`}
          </p>
        ) : locationError ? (
          <p className="text-sm text-red-500">
            {language === 'bn'
              ? 'অবস্থান পাওয়া যায়নি। অনুগ্রহ করে অবস্থান অ্যাক্সেস অনুমতি দিন।'
              : 'Location not found. Please allow location access.'}
          </p>
        ) : null}
      </div>
      <footer className="text-center py-4 text-gray-600 dark:text-gray-400">
        <p>
          © {new Date().getFullYear()} Prayer Times. Developed by{' '}
          <a 
            href="https://www.fb.com/sohaghasan.net" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
          >
            Shoaib Hasan Sohag
          </a>
        </p>
      </footer>
    </>
  );
} 