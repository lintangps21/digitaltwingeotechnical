'use client';

import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  // Prevents hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <ThemeProvider attribute="class">{children}</ThemeProvider>;
}