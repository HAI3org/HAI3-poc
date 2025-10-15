export type Theme = {
  id: string;
  name: string;
};

export const themes: Theme[] = [
  { id: 'default', name: 'Default' },
  { id: 'dark', name: 'Dark' },
  { id: 'minimal', name: 'Minimal' },
  { id: 'windsurf', name: 'Windsurf Dark' },
  { id: 'cursor', name: 'Cursor Dark' },
  { id: 'hxdark', name: 'HX Dark' },
];

export const defaultTheme = 'default';

const STORAGE_KEY = 'hx-theme';

export function getStoredTheme(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeTheme(themeId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, themeId);
  } catch {}
}

export function applyTheme(themeId: string): void {
  const root = document.documentElement; // <html>
  root.setAttribute('data-theme', themeId);
}
