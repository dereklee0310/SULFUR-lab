import { register, init, getLocaleFromNavigator } from 'svelte-i18n';
import { browser } from '$app/environment';

const defaultLocale = 'zh-CN';

register('en', () => import('$lib/assets/locales/en.json'));
register('sv', () => import('$lib/assets/locales/sv.json'));
register('fr', () => import('$lib/assets/locales/fr.json'));
register('it', () => import('$lib/assets/locales/it.json'));
register('de', () => import('$lib/assets/locales/de.json'));
register('es', () => import('$lib/assets/locales/es.json'));
register('pt', () => import('$lib/assets/locales/pt.json'));
register('ru', () => import('$lib/assets/locales/ru.json'));
register('pl', () => import('$lib/assets/locales/pl.json'));
register('ja', () => import('$lib/assets/locales/ja.json'));
register('ko', () => import('$lib/assets/locales/ko.json'));
register('tr', () => import('$lib/assets/locales/tr.json'));
register('zh-CN', () => import('$lib/assets/locales/zh-CN.json'));

init({
	fallbackLocale: defaultLocale,
	initialLocale: defaultLocale,
	// initialLocale: browser ? getLocaleFromNavigator() : defaultLocale,
});