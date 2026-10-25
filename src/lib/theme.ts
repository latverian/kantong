import type { Settings } from '../db/types';

/** Applies light/dark tokens to <html> and the iOS status-bar colour. */
export function applyTheme(theme: Settings['theme'] = 'system') {
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const color = dark ? '#0B0F17' : '#F4F5F9';
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', color));
}
