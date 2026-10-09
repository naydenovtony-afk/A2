import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <Link href="/" className="text-emerald-700 underline dark:text-emerald-400">
        {t("back")}
      </Link>
    </main>
  );
}
