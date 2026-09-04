import type { Metadata } from "next";
import type { ReactNode } from "react";
import { locales, localeDirections, isLocale, defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { display, body, mono, arabic } from "@/lib/fonts";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AiChatLauncher from "@/components/layout/AiChatLauncher";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const dict = await getDictionary(locale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const dir = localeDirections[locale];
  const dict = await getDictionary(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${display.variable} ${body.variable} ${mono.variable} ${arabic.variable}`}
    >
      <body
        className={
          locale === "ar"
            ? "font-arabic bg-pine-900 antialiased"
            : "font-sans bg-pine-900 antialiased"
        }
      >
        <Header locale={locale} dict={dict} />
        <main>{children}</main>
        <Footer locale={locale} dict={dict} />
        <AiChatLauncher dict={dict} locale={locale} />
      </body>
    </html>
  );
}
