// Public website settings provider.
//
// Subscribes in real time (Firestore onSnapshot) to the PUBLISHED design,
// contact, hero and site settings, applies design tokens as CSS variables, and
// exposes everything through a context. Published changes therefore appear on
// open public tabs automatically — no reload required.
//
// A version-guarded last-known-good cache in localStorage renders instantly on
// first paint (no layout shift) and while offline, but real Firestore data
// always wins as soon as a snapshot arrives. The public website never crashes
// or surfaces admin/error messages.

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  DEFAULT_CONTACT,
  DEFAULT_DESIGN,
  DEFAULT_HERO,
  DEFAULT_NAVIGATION,
  DEFAULT_SITE,
  type ContactSettings,
  type DesignSettings,
  type HeroSettings,
  type NavigationSettings,
  type SiteSettings,
} from "./model";
import { applyDesign } from "./apply";
import { subscribePublicDoc, type SettingsKey } from "./store";

interface PublicSettings {
  design: DesignSettings;
  contact: ContactSettings;
  hero: HeroSettings;
  site: SiteSettings;
  navigation: NavigationSettings;
  loaded: boolean;
}

const defaults: PublicSettings = {
  design: DEFAULT_DESIGN,
  contact: DEFAULT_CONTACT,
  hero: DEFAULT_HERO,
  site: DEFAULT_SITE,
  navigation: DEFAULT_NAVIGATION,
  loaded: false,
};

const PublicSettingsContext = createContext<PublicSettings>(defaults);

// v2: version-guarded cache. Old v1 (spm-public-settings-v1) is incompatible.
const CACHE_KEY = "spm-public-settings-v2";
const LEGACY_CACHE_KEYS = ["spm-public-settings-v1"];

interface CachedEntry<T> {
  value: T;
  version: number;
}
interface CacheShape {
  design?: CachedEntry<DesignSettings>;
  contact?: CachedEntry<ContactSettings>;
  hero?: CachedEntry<HeroSettings>;
  site?: CachedEntry<SiteSettings>;
  navigation?: CachedEntry<NavigationSettings>;
}

function readCache(): CacheShape {
  if (typeof window === "undefined") return {};
  try {
    LEGACY_CACHE_KEYS.forEach((k) => window.localStorage.removeItem(k));
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CacheShape) : {};
  } catch {
    return {};
  }
}

function writeCache(cache: CacheShape): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* storage full / unavailable — non-fatal */
  }
}

export function PublicSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PublicSettings>(defaults);
  // Track the highest published version applied per key so a late/stale snapshot
  // or cached value can never overwrite newer live data.
  const versions = useRef<Record<SettingsKey, number>>({
    design: -1,
    contact: -1,
    hero: -1,
    site: -1,
    navigation: -1,
  });
  const cacheRef = useRef<CacheShape>({});

  useEffect(() => {
    // 1) Paint last-known-good cache immediately (version -1 so any snapshot wins).
    const cache = readCache();
    cacheRef.current = cache;
    if (cache.design || cache.contact || cache.hero || cache.site || cache.navigation) {
      setSettings((prev) => ({
        design: cache.design?.value ?? prev.design,
        contact: cache.contact?.value ?? prev.contact,
        hero: cache.hero?.value ?? prev.hero,
        site: cache.site?.value ?? prev.site,
        navigation: cache.navigation?.value ?? prev.navigation,
        loaded: false,
      }));
      if (cache.design?.value) applyDesign(cache.design.value);
    }

    // 2) Subscribe to live published documents. Firestore keeps every open tab
    //    in sync, so publishing from admin updates the public site immediately.
    const apply = <K extends SettingsKey>(
      key: K,
      value: PublicSettings[K],
      version: number,
      onApply?: (v: PublicSettings[K]) => void,
    ) => {
      // version 0 = document exists without a version yet, or a fallback; still
      // accept it on first delivery so we leave defaults behind.
      if (version < versions.current[key] && versions.current[key] >= 0) return;
      versions.current[key] = version;
      setSettings((prev) => ({ ...prev, [key]: value, loaded: true }));
      onApply?.(value);
      cacheRef.current = { ...cacheRef.current, [key]: { value, version } };
      writeCache(cacheRef.current);
    };

    const unsubs = [
      subscribePublicDoc<DesignSettings>("design", DEFAULT_DESIGN, (v, ver) =>
        apply("design", v, ver, applyDesign),
      ),
      subscribePublicDoc<ContactSettings>("contact", DEFAULT_CONTACT, (v, ver) =>
        apply("contact", v, ver),
      ),
      subscribePublicDoc<HeroSettings>("hero", DEFAULT_HERO, (v, ver) => apply("hero", v, ver)),
      subscribePublicDoc<SiteSettings>("site", DEFAULT_SITE, (v, ver) => apply("site", v, ver)),
      subscribePublicDoc<NavigationSettings>("navigation", DEFAULT_NAVIGATION, (v, ver) =>
        apply("navigation", v, ver),
      ),
    ];

    return () => {
      unsubs.forEach((u) => u());
    };
  }, []);

  return (
    <PublicSettingsContext.Provider value={settings}>{children}</PublicSettingsContext.Provider>
  );
}

export function usePublicSettings(): PublicSettings {
  return useContext(PublicSettingsContext);
}

/** Build a wa.me link from WhatsApp settings (number sanitized to digits). */
export function whatsappLink(number: string, message: string): string {
  const digits = number.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
