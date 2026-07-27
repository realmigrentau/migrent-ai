import { Html, Head, Main, NextScript } from "next/document";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function Document() {
  return (
    <Html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        {/* Fonts: Fraunces (display, roman) · Hanken Grotesk (body) · Space Mono (meta) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Hanken+Grotesk:wght@400..800&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />

        {/* Preconnect to backend services so the first API call is faster */}
        {SUPABASE_URL && <link rel="preconnect" href={SUPABASE_URL} crossOrigin="anonymous" />}
        {API_URL && <link rel="preconnect" href={API_URL} crossOrigin="anonymous" />}

        {/* DNS-prefetch fallback for older clients */}
        {SUPABASE_URL && <link rel="dns-prefetch" href={SUPABASE_URL} />}
        {API_URL && <link rel="dns-prefetch" href={API_URL} />}

        {/* PWA + mobile */}
        <link rel="manifest" href="/manifest.json" />
        {/* Browser chrome follows the theme: warm paper in light, espresso in dark */}
        <meta name="theme-color" content="#f6f1e9" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#17120e" media="(prefers-color-scheme: dark)" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MigRent" />
        <meta name="format-detection" content="telephone=no" />
      </Head>
      <body className="antialiased">
        {/* Inline theme + palette bootstrap: prevent flash of wrong theme on first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
