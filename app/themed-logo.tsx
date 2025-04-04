'use client'
import { useTheme } from "next-themes";
import Image from "next/image";
export default function ThemedLogo() {
  const { resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === "dark" ? "/aitos-w.png" : "/aitos.png";

  return (
    <Image
      src={logoSrc}
      alt="AITOS"
      width={80}
      height={80}
      className="rounded-none"
    />
  );
}
