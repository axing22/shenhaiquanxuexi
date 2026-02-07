import "@/app/globals.css";

import { getMessages, getTranslations } from "next-intl/server";
import { locales } from "@/i18n/locale";

import { Inter as FontSans } from "next/font/google";
import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@/providers/theme";
import { cn } from "@/lib/utils";
import Script from 'next/script'
import { ToastProvider } from "@/components/ui/toast";
import Analytics from "@/components/analytics";
import AuthSessionProvider from "@/auth/session";
import SignModal from "@/components/sign/modal";
import { AppContextProvider } from "@/contexts/app";
import { auth } from "@/auth";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  // locale is available but not needed for getTranslations
  await params;
  const t = await getTranslations();

  return {
    title: {
      template: `%s`,
      default: t("metadata.title") || "",
    },
    description: t("metadata.description") || "",
    keywords: t("metadata.keywords") || "",
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();
  const session = await auth();
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL || "";
  const googleAdsenseCode = process.env.NEXT_PUBLIC_GOOGLE_ADCODE || "";
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID || "";

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {googleAdsenseCode && (
          <meta name="google-adsense-account" content={googleAdsenseCode} />
        )}

        <link rel="icon" href="/favicon.ico" />

        {webUrl && locales &&
          locales.map((loc) => (
            <link
              key={loc}
              rel="alternate"
              hrefLang={loc}
              href={`${webUrl}${loc === "en" ? "" : `/${loc}`}/`}
            />
          ))}
        {webUrl && <link rel="alternate" hrefLang="x-default" href={webUrl} />}
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased overflow-x-hidden",
          fontSans.variable
        )}
      >
        {/* Analytics Scripts - using Script component to avoid hydration issues */}
        <Analytics />
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="0ac1cf59-ffb8-44fe-a0a2-a638cfb22693"
          strategy="afterInteractive"
        />
        <Script
          id="baidu-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var _hmt = _hmt || [];
              (function() {
                var hm = document.createElement("script");
                hm.src = "https://hm.baidu.com/hm.js?9accc6f6e29153e0f99afbe460e4ae8f";
                var s = document.getElementsByTagName("script")[0];
                s.parentNode.insertBefore(hm, s);
              })();
            `
          }}
        />
        {clarityId && (
          <Script
            id="clarity-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${clarityId}");
              `
            }}
          />
        )}
        <NextIntlClientProvider messages={messages}>
          <AuthSessionProvider>
            <AppContextProvider initialUserData={{ user: session?.user }}>
              <ThemeProvider
                attribute="class"
                disableTransitionOnChange
                enableSystem={false}
                defaultTheme="light"
              >
                <ToastProvider>
                  <SignModal />
                  {children}
                </ToastProvider>
              </ThemeProvider>
            </AppContextProvider>
          </AuthSessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
