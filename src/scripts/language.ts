import type { Locale } from '../data/i18n';

// Static routes determine language; lightboxes and the travel gallery read it here.
export function currentLocale(): Locale {
  return document.documentElement.lang === 'zh-CN' ? 'zh' : 'en';
}
