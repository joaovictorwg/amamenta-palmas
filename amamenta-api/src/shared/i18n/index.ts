import pt from './pt.json';
import en from './en.json';

export type SupportedLang = 'pt' | 'en';

const translations = { pt, en } as const;

export function t(key: string, lang: SupportedLang = 'pt'): string {
    const keys = key.split('.');
    let value: any = translations[lang];
    for (const k of keys) {
        value = value?.[k];
        if (value === undefined) return key;
    }
    return value;
}
