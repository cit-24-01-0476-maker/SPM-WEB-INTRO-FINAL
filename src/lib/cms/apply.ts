// Applies published design settings to the document as CSS variables, and
// loads safe fonts. Also provides colour/contrast helpers used by the editor.

import { FONT_HREFS, SAFE_FONTS, type DesignSettings, type SafeFont } from "./model";

const FONT_STACK_TAIL = ', "Helvetica Neue", ui-sans-serif, system-ui, sans-serif';

function fontStack(family: string): string {
  return `"${family}"${FONT_STACK_TAIL}`;
}

/** Load a safe font family from the fixed allow-list only. */
export function ensureFont(family: string): void {
  if (typeof document === "undefined") return;
  if (!(SAFE_FONTS as readonly string[]).includes(family)) return; // reject arbitrary/unsafe names
  const href = FONT_HREFS[family as SafeFont];
  const id = `cms-font-${family.replace(/\s+/g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

/* --- colour parsing / contrast --------------------------------------- */

export function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

/** Return an rgba() string from a hex colour and alpha (0–1). */
export function rgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(23,107,255,${alpha})`;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

/** Lighten (positive) or darken (negative) a hex colour by a percentage. */
export function shiftColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const amt = Math.round((percent / 100) * 255);
  const clamp = (n: number) => Math.max(0, Math.min(255, n));
  const to2 = (n: number) => clamp(n).toString(16).padStart(2, "0");
  return `#${to2(rgb[0] + amt)}${to2(rgb[1] + amt)}${to2(rgb[2] + amt)}`;
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colours (1–21), or null if unparsable. */
export function contrastRatio(a: string, b: string): number | null {
  const la = luminance(a);
  const lb = luminance(b);
  if (la === null || lb === null) return null;
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

export function contrastRating(ratio: number | null): {
  label: string;
  tone: "good" | "ok" | "bad";
} {
  if (ratio === null) return { label: "—", tone: "ok" };
  if (ratio >= 4.5) return { label: `${ratio.toFixed(1)}:1 AA`, tone: "good" };
  if (ratio >= 3) return { label: `${ratio.toFixed(1)}:1 Large`, tone: "ok" };
  return { label: `${ratio.toFixed(1)}:1 Low`, tone: "bad" };
}

/** Apply design tokens to a target element's inline CSS variables. */
export function applyDesign(design: DesignSettings, target?: HTMLElement): void {
  const el = target ?? (typeof document !== "undefined" ? document.documentElement : null);
  if (!el) return;
  const c = design.colors;
  const set = (k: string, v: string) => el.style.setProperty(k, v);

  // The CMS design palette is the LIGHT theme. When dark mode is active the
  // dark palette in styles.css (.dark) must win — but inline styles override
  // class rules, so in dark mode we REMOVE these inline overrides instead of
  // writing the light values (which previously clobbered dark mode everywhere).
  const isDark =
    el === (typeof document !== "undefined" ? document.documentElement : null) &&
    el.classList.contains("dark");
  const setColor = (k: string, v: string) => {
    if (isDark) el.style.removeProperty(k);
    else el.style.setProperty(k, v);
  };

  // Core semantic tokens (consumed across the site + shadcn components).
  setColor("--primary", c.techBlue);
  setColor("--ring", c.techBlue);
  setColor("--accent", c.cyanAccent);
  setColor("--cyan", c.cyanAccent);
  setColor("--navy", c.primaryNavy);
  setColor("--deep", c.deepBlue);
  setColor("--background", c.lightBackground);
  setColor("--card", c.cardBackground);
  setColor("--popover", c.cardBackground);
  setColor("--foreground", c.mainText);
  setColor("--card-foreground", c.mainText);
  setColor("--muted-foreground", c.secondaryText);
  setColor("--secondary-foreground", c.deepBlue);
  setColor("--border", c.border);
  setColor("--input", c.border);
  setColor("--success", c.success);
  setColor("--warning", c.warning);
  setColor("--destructive", c.error);
  setColor("--sidebar", c.adminSidebar);

  // Gradients + glows.
  set(
    "--gradient-primary",
    `linear-gradient(120deg, ${c.buttonGradientStart} 0%, ${c.buttonGradientEnd} 100%)`,
  );
  set("--gradient-hero", `linear-gradient(155deg, ${c.primaryNavy} 0%, ${c.deepBlue} 100%)`);
  set("--cms-hero-glow", c.heroGlow);
  set("--cms-section-glow", c.sectionGlow);

  // Typography.
  const t = design.typography;
  ensureFont(t.headingFont);
  ensureFont(t.bodyFont);
  ensureFont(t.navFont);
  ensureFont(t.buttonFont);
  set("--font-display", fontStack(t.headingFont));
  set("--font-sans", fontStack(t.bodyFont));
  set("--cms-font-nav", fontStack(t.navFont));
  set("--cms-font-button", fontStack(t.buttonFont));
  set("--cms-hero-title", `${t.heroTitleSize}px`);
  set("--cms-section-title", `${t.sectionTitleSize}px`);
  set("--cms-subheading", `${t.subheadingSize}px`);
  set("--cms-body-size", `${t.bodyTextSize}px`);
  set("--cms-small-size", `${t.smallTextSize}px`);
  set("--cms-heading-weight", String(t.headingWeight));
  set("--cms-body-weight", String(t.bodyWeight));
  set("--cms-line-height", String(t.lineHeight));
  set("--cms-letter-spacing", `${t.letterSpacing}em`);

  // Buttons.
  const b = design.buttons;
  set("--button-radius", `${b.borderRadius}px`);
  set("--card-radius", `${b.borderRadius + 6}px`);
  set("--cms-btn-padding-x", `${b.paddingX}px`);
  set("--cms-btn-padding-y", `${b.paddingY}px`);
  set("--cms-btn-weight", String(b.fontWeight));

  // Public button design tokens — consumed by the shared CmsButton so that
  // changing button colours in Design Studio updates every real public button
  // immediately after publishing (no redeploy).
  const shadowAlpha = Math.min(0.6, Math.max(0, b.shadow / 100));
  const primaryHover = shiftColor(b.primaryBg, -10);
  const secondaryHover = shiftColor(b.secondaryBg, -6);
  set("--button-primary-bg", b.primaryBg);
  set("--button-primary-text", b.primaryText);
  set("--button-primary-border", b.primaryBg);
  set("--button-primary-hover-bg", primaryHover);
  set("--button-primary-hover-text", b.primaryText);
  set("--button-primary-radius", `${b.borderRadius}px`);
  set("--button-primary-shadow", `0 10px 24px -8px ${rgba(b.primaryBg, shadowAlpha)}`);
  set(
    "--button-primary-hover-shadow",
    `0 14px 30px -8px ${rgba(b.primaryBg, Math.min(0.75, shadowAlpha + 0.15))}`,
  );
  set("--button-primary-glow", b.enableGlow ? `0 0 22px ${rgba(c.heroGlow, 0.55)}` : "none");
  set("--button-primary-transition", `${design.animations.buttonHoverDuration}ms`);
  set("--button-primary-lift", b.enableHoverLift ? `-${b.hoverElevation}px` : "0px");
  set("--button-primary-press", String(b.pressScale));
  set("--button-secondary-bg", b.secondaryBg);
  set("--button-secondary-text", b.secondaryText);
  set("--button-secondary-border", b.borderColor);
  set("--button-secondary-hover-bg", secondaryHover);
  set("--button-border-width", `${b.borderWidth}px`);
  set("--button-padding-x", `${b.paddingX}px`);
  set("--button-padding-y", `${b.paddingY}px`);
  set("--button-weight", String(b.fontWeight));

  // Animations.
  const a = design.animations;
  set("--animation-duration", `${a.revealDuration}ms`);
  set("--cms-reveal-distance", `${a.revealDistance}px`);
  set("--cms-button-hover", `${a.buttonHoverDuration}ms`);
  set("--cms-card-hover", `${a.cardHoverDuration}ms`);
  set("--cms-float-speed", `${a.floatingSpeed}ms`);
}
