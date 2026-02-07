"use client";

import Analytics from "@/components/analytics";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const defaultTheme = process.env.NEXT_PUBLIC_DEFAULT_THEME || "light";

  return (
    <NextThemesProvider defaultTheme={defaultTheme} {...props}>
      {children}
      <Toaster position="top-center" richColors />
      <Analytics />
    </NextThemesProvider>
  );
}
