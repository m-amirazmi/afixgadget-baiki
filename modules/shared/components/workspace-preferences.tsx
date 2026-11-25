"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import i18n from "../i18n";

export type Locale = "en" | "ms";
export type FontSize = "small" | "medium" | "large";

type WorkspacePreferences = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  fontSize: FontSize;
  setFontSize: (fontSize: FontSize) => void;
};

const WorkspacePreferencesContext = createContext<WorkspacePreferences | null>(
  null,
);

const THEME_CHANGE_EVENT = "baiki-theme-change";
const FONT_SIZE_CHANGE_EVENT = "baiki-font-size-change";

function readCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const prefix = `${name}=`;
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(prefix));
  return cookie?.slice(prefix.length);
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax`;
}

function subscribe(onChange: () => void) {
  const onLanguageChange = () => onChange();
  i18n.on("languageChanged", onLanguageChange);
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  window.addEventListener(FONT_SIZE_CHANGE_EVENT, onChange);
  return () => {
    i18n.off("languageChanged", onLanguageChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
    window.removeEventListener(FONT_SIZE_CHANGE_EVENT, onChange);
  };
}

function getLocaleSnapshot(): Locale {
  return i18n.resolvedLanguage === "ms" ? "ms" : "en";
}

function getThemeSnapshot() {
  return readCookie("baiki_theme") === "dark";
}

function getFontSizeSnapshot(): FontSize {
  const fontSize = readCookie("baiki_font_size");
  return fontSize === "medium" || fontSize === "large" ? fontSize : "small";
}

function getServerLocaleSnapshot(): Locale {
  return "en";
}

function getServerThemeSnapshot() {
  return false;
}

function getServerFontSizeSnapshot(): FontSize {
  return "small";
}

export function WorkspacePreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const locale = useSyncExternalStore(
    subscribe,
    getLocaleSnapshot,
    getServerLocaleSnapshot,
  );
  const isDark = useSyncExternalStore(
    subscribe,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const fontSize = useSyncExternalStore(
    subscribe,
    getFontSizeSnapshot,
    getServerFontSizeSnapshot,
  );

  useEffect(() => {
    const savedLocale = readCookie("baiki_locale");
    if (savedLocale === "en" || savedLocale === "ms") {
      void i18n.changeLanguage(savedLocale);
    }
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    writeCookie("baiki_locale", nextLocale);
    void i18n.changeLanguage(nextLocale);
  }, []);

  const setIsDark = useCallback((nextIsDark: boolean) => {
    writeCookie("baiki_theme", nextIsDark ? "dark" : "light");
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  const setFontSize = useCallback((nextFontSize: FontSize) => {
    writeCookie("baiki_font_size", nextFontSize);
    window.dispatchEvent(new Event(FONT_SIZE_CHANGE_EVENT));
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "ms" ? "ms-MY" : "en";
  }, [locale]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    document.documentElement.dataset.fontSize = fontSize;
  }, [fontSize]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      isDark,
      setIsDark,
      fontSize,
      setFontSize,
    }),
    [fontSize, isDark, locale, setFontSize, setIsDark, setLocale],
  );

  return (
    <WorkspacePreferencesContext.Provider value={value}>
      {children}
    </WorkspacePreferencesContext.Provider>
  );
}

export function useWorkspacePreferences() {
  const preferences = useContext(WorkspacePreferencesContext);
  if (!preferences) {
    throw new Error(
      "useWorkspacePreferences must be used within WorkspacePreferencesProvider.",
    );
  }
  return preferences;
}
