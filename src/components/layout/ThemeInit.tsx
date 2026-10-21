import { THEME_INIT_SCRIPT } from "@/src/lib/theme";

export function ThemeInit() {
  return <script id="theme-init" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
}
