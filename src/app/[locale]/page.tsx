import { isLocale, defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import ExportHero from "@/components/sections/ExportHero";
import ProcessingCapacity from "@/components/sections/ProcessingCapacity";
import Journey from "@/components/sections/Journey";
import PackingDocumentation from "@/components/sections/PackingDocumentation";

export default async function CoffeeExportHome({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const dict = await getDictionary(locale);

  return (
    <>
      <ExportHero dict={dict} locale={locale} />
      <ProcessingCapacity dict={dict} />
      <Journey dict={dict} />
      <PackingDocumentation dict={dict} />
    </>
  );
}
