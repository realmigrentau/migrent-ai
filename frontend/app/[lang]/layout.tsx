import { ReactNode } from "react";

const SUPPORTED_LOCALES = ["en", "zh", "hi", "es", "ar", "fr", "ru", "pt"];

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <div dir={dir} lang={lang}>
      {children}
    </div>
  );
}
