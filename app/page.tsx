import type { Metadata } from 'next';
import PrayerTimes from './components/PrayerTimes';

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: 'Prayer Times Schedule',
    description: 'View accurate prayer times for Fajr, Dhuhr, Asr, Maghrib, Isha and Tahajjud prayers with real-time updates.',
    alternates: {
      canonical: '/',
      languages: {
        'en': '/en',
        'bn': '/bn'
      },
    },
  };
};

export default function Home() {
  return (
    <main>
      <PrayerTimes />
    </main>
  );
} 