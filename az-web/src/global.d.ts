import type { routing } from "@/i18n/routing";
import type messages from "../messages/bg.json";

// Type-safe locales and message keys for next-intl.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
