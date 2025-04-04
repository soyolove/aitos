'use client'

import { useEffect, useState } from 'react';
import { useTheme } from "next-themes";
import Image from "next/image";

export default function ThemedLogo({ size = "regular" }) {
  const { resolvedTheme, theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Detect user's system preference
  useEffect(() => {
    setMounted(true);
    
    // Check if theme is set to 'system' and match accordingly
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      // No need to set the theme here as 'system' will automatically follow OS preference
    }
  }, [theme, setTheme]);
  
  // Handle rendering during SSR
  if (!mounted) {
    const placeholderSize = size === "small" ? "w-8 h-8" : "w-20 h-20";
    return (
      <div className={placeholderSize} /> // Placeholder during SSR to prevent layout shift
    );
  }
  
  // Determine logo source based on resolved theme
  const logoSrc = resolvedTheme === "dark" ? "/aitos-w.png" : "/aitos.png";

  // Set dimensions based on size prop
  const dimensions = size === "small" ? 32 : 80;
  
  return (
    <Image
      src={logoSrc}
      alt="AITOS"
      width={dimensions}
      height={dimensions}
      className="rounded-none"
      priority // Add priority to improve loading performance for logo
    />
  );
}