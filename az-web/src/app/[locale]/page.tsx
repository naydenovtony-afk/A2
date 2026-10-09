import { use } from "react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { SPORTS } from "az-shared";
import type { Locale } from "next-intl";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  const t = useTranslations("Home");
  const tSports = useTranslations("Sports");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <div className="flex justify-end">
        <LocaleSwitcher />
      </div>
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          {t("tagline")}
        </p>
        <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">{t("sportsHeading")}</h2>
        <ul className="flex flex-wrap gap-2">
          {SPORTS.map((sport) => (
            <li
              key={sport}
              className="rounded-full border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
            >
              {tSports(sport)}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
