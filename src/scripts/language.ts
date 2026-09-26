import { localeMeta, localeStorageKey, normaliseI18nText, translate, type Locale } from '../data/i18n';

const originalText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();
const translatedAttributes = ['alt', 'aria-label', 'title', 'placeholder'];

function storedLocale(): Locale {
  try {
    return window.localStorage.getItem(localeStorageKey) === 'zh' ? 'zh' : 'en';
  } catch {
    return 'en';
  }
}

export function currentLocale(): Locale {
  return document.documentElement.dataset.locale === 'zh' ? 'zh' : 'en';
}

function translatedValue(value: string, locale: Locale) {
  const translated = translate(value, locale);
  const leading = value.match(/^\s*/)?.[0] ?? '';
  const trailing = value.match(/\s*$/)?.[0] ?? '';
  return `${leading}${translated}${trailing}`;
}

function updateText(locale: Locale) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest('script, style, svg, [data-i18n-skip]')) return NodeFilter.FILTER_REJECT;
      return normaliseI18nText(node.nodeValue ?? '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });

  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => {
    const original = originalText.get(node) ?? node.nodeValue ?? '';
    if (!originalText.has(node)) originalText.set(node, original);
    node.nodeValue = translatedValue(original, locale);
  });
}

function updateAttributes(locale: Locale) {
  document.querySelectorAll<HTMLElement>('*').forEach((element) => {
    translatedAttributes.forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (!value || element.closest('[data-i18n-skip]')) return;
      let attributes = originalAttributes.get(element);
      if (!attributes) {
        attributes = new Map();
        originalAttributes.set(element, attributes);
      }
      const original = attributes.get(attribute) ?? value;
      if (!attributes.has(attribute)) attributes.set(attribute, original);
      element.setAttribute(attribute, translate(original, locale));
    });
  });
}

function updateDocumentMetadata(locale: Locale) {
  const title = document.querySelector('title');
  if (title) {
    const original = title.dataset.i18nOriginal ?? title.textContent ?? '';
    title.dataset.i18nOriginal = original;
    title.textContent = translate(original, locale);
  }
  const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (description) {
    const original = description.dataset.i18nOriginal ?? description.content;
    description.dataset.i18nOriginal = original;
    description.content = translate(original, locale);
  }
}

function updateToggle(locale: Locale) {
  document.querySelectorAll<HTMLButtonElement>('[data-language-toggle]').forEach((toggle) => {
    toggle.setAttribute('aria-label', localeMeta[locale].toggleLabel);
    toggle.setAttribute('title', localeMeta[locale].toggleLabel);
    toggle.dataset.locale = locale;
  });
}

export function applyLocale(locale: Locale, persist = true) {
  document.documentElement.dataset.locale = locale;
  document.documentElement.lang = localeMeta[locale].code;
  updateText(locale);
  updateAttributes(locale);
  updateDocumentMetadata(locale);
  updateToggle(locale);
  if (persist) {
    try {
      window.localStorage.setItem(localeStorageKey, locale);
    } catch {
      // Language selection still works for this page when storage is unavailable.
    }
  }
  document.dispatchEvent(new CustomEvent('suhangxia:localechange', { detail: { locale } }));
}

export function initialiseLanguage() {
  const locale = storedLocale();
  applyLocale(locale, false);
  document.querySelectorAll<HTMLButtonElement>('[data-language-toggle]').forEach((toggle) => {
    toggle.addEventListener('click', () => applyLocale(currentLocale() === 'en' ? 'zh' : 'en'));
  });
}
