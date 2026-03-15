export type Locale = "fr" | "en";

export const defaultLocale: Locale = "fr";
export const locales: Locale[] = ["fr", "en"];

export { translations } from "./translations";
export type { Translations } from "./translations/fr";
