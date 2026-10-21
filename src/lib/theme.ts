export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

export function parseTheme(value: string | null): Theme {
  return value === "dark" ? "dark" : "light";
}

export function readStoredTheme(): Theme {
  try {
    return parseTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "light";
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function saveTheme(theme: Theme): void {
  applyTheme(theme);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The switch still works when browser storage is blocked or full.
  }
}

// Only fixed code is interpolated here. Run in <head> before content paints.
export const THEME_INIT_SCRIPT = `(function(){var t="light";try{t=localStorage.getItem("${THEME_STORAGE_KEY}") === "dark" ? "dark" : "light"}catch(e){}document.documentElement.classList.toggle("dark",t === "dark")})()`;
