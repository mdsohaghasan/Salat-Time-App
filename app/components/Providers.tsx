'use client';

import { DarkModeProvider } from '../context/DarkModeContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DarkModeProvider>
      {children}
    </DarkModeProvider>
  );
} 