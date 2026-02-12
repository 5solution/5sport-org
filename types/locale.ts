import { Locale } from '@/i18n';

export type { Locale };

export interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}
