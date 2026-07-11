// Public language provider.
//
// Single source of truth for the active public-site language. It reads the
// PUBLISHED language settings (publicSettings/languages) through the existing
// PublicSettingsProvider, so publishing from the admin updates every open tab
// in real time with no redeploy.
//
// Responsibilities:
//   - English is always the default and the final fallback.
//   - Resolve the active language: saved preference → default → English.
//   - Persist the choice (only the code) when rememberPreference is enabled.
//   - Force English and hide the switcher when it is disabled.
//   - Keep document.documentElement.lang in sync.
//   - Synchronize the choice across browser tabs.
//   - SSR-safe: never touches window/localStorage during render.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getLocalizedText,
  type LanguageCode,
  type LanguageSettings,
  type MaybeLocalized,
} from "@/lib/cms/model";
import { usePublicSettings } from "@/lib/cms/PublicSettings";
import { translateUI, type UIStringKey } from "./dictionary";
import { translatePhrase } from "./content";

const STORAGE_KEY = "spm_language";

interface LanguageContextValue {
  /** Active language actually rendered (English when the switcher is off). */
  lang: LanguageCode;
  /** Change the active language (ignored when the switcher is disabled). */
  setLang: (lang: LanguageCode) => void;
  /** Published language configuration. */
  config: LanguageSettings;
  /** Whether the public switcher should render at all. */
  switcherEnabled: boolean;
  /** Enabled languages, always guaranteeing English first. */
  available: LanguageCode[];
  /** Resolve a CMS Localized value for the active language (English fallback). */
  tx: (value: MaybeLocalized, fallback?: string) => string;
  /** Resolve a shared UI-string key for the active language. */
  t: (key: UIStringKey) => string;
  /** Translate a rendered English phrase (section/marketing text) by lookup. */
  tt: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLang(): LanguageCode | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "en" || v === "si" ? v : null;
  } catch {
    return null;
  }
}

function detectBrowserLang(available: LanguageCode[]): LanguageCode | null {
  if (typeof navigator === "undefined") return null;
  const langs = [navigator.language, ...(navigator.languages ?? [])];
  for (const l of langs) {
    const code = l.toLowerCase().split("-")[0];
    if (code === "si" && available.includes("si")) return "si";
    if (code === "en" && available.includes("en")) return "en";
  }
  return null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { languages } = usePublicSettings();

  const switcherEnabled = languages.languageSwitcherEnabled;

  const available = useMemo<LanguageCode[]>(() => {
    const enabled = (languages.enabledLanguages ?? ["en"]).filter(
      (c): c is LanguageCode => c === "en" || c === "si",
    );
    // English must always be present and first.
    const rest = enabled.filter((c) => c !== "en");
    return ["en", ...rest];
  }, [languages.enabledLanguages]);

  const defaultLang: LanguageCode = languages.defaultLanguage === "si" ? "si" : "en";

  // Start from the configured default (English by default). Never read browser
  // storage during render — that would cause an SSR/hydration mismatch.
  const [lang, setLangState] = useState<LanguageCode>(defaultLang);

  // Resolve the real initial language once mounted (client only).
  useEffect(() => {
    if (!switcherEnabled) {
      setLangState("en");
      return;
    }
    let next: LanguageCode | null = null;
    if (languages.rememberPreference) next = readStoredLang();
    if (!next && languages.autoDetectBrowserLanguage) next = detectBrowserLang(available);
    if (!next) next = defaultLang;
    if (!available.includes(next)) next = "en";
    setLangState(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    switcherEnabled,
    languages.rememberPreference,
    languages.autoDetectBrowserLanguage,
    defaultLang,
    available.join(","),
  ]);

  // Keep <html lang> accurate for accessibility + SEO.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = switcherEnabled ? lang : "en";
    }
  }, [lang, switcherEnabled]);

  // Cross-tab synchronization.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === "en" || e.newValue === "si")) {
        setLangState(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setLang = useCallback(
    (next: LanguageCode) => {
      if (!switcherEnabled) return;
      if (!available.includes(next)) return;
      setLangState(next);
      if (languages.rememberPreference && typeof window !== "undefined") {
        try {
          window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* storage unavailable — non-fatal */
        }
      }
    },
    [switcherEnabled, available, languages.rememberPreference],
  );

  const effectiveLang: LanguageCode = switcherEnabled ? lang : "en";

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang: effectiveLang,
      setLang,
      config: languages,
      switcherEnabled,
      available,
      tx: (v, fallback = "") => getLocalizedText(v, effectiveLang, fallback),
      t: (key) => translateUI(key, effectiveLang),
      tt: (text) => translatePhrase(text, effectiveLang),
    }),
    [effectiveLang, setLang, languages, switcherEnabled, available],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Safe fallback so components never crash outside the provider (e.g. admin).
    return {
      lang: "en",
      setLang: () => {},
      config: {
        languageSwitcherEnabled: false,
        defaultLanguage: "en",
        enabledLanguages: ["en"],
        labels: { en: "English", si: "සිංහල" },
        shortLabels: { en: "EN", si: "සිං" },
        rememberPreference: false,
        autoDetectBrowserLanguage: false,
        showInHeader: false,
        showInMobileMenu: false,
        showInFooter: false,
        style: {
          variant: "compact",
          showIcon: true,
          showLanguageCode: true,
          showLanguageName: false,
        },
      },
      switcherEnabled: false,
      available: ["en"],
      tx: (v, fallback = "") => getLocalizedText(v, "en", fallback),
      t: (key) => translateUI(key, "en"),
      tt: (text) => text,
    };
  }
  return ctx;
}
