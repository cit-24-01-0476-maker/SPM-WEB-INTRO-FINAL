import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Shared public button. All colours, radius, shadow and hover behaviour come
// from CMS design tokens defined as CSS custom properties in styles.css and
// overridden at runtime by Design Studio (see src/lib/cms/apply.ts). Changing
// button colours in the admin panel therefore updates every real public button
// immediately after publishing — no redeploy, no hardcoded Tailwind colours.

type Variant = "primary" | "secondary";

export interface CmsButtonProps {
  variant?: Variant;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  target?: string;
  rel?: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
  /** Use the translucent secondary style for dark backgrounds (e.g. hero). */
  onDark?: boolean;
}

export const CmsButton = forwardRef<HTMLElement, CmsButtonProps>(function CmsButton(
  {
    variant = "primary",
    href,
    onClick,
    type = "button",
    disabled,
    target,
    rel,
    className,
    ariaLabel,
    children,
    onDark = false,
  },
  ref,
) {
  const variantClass =
    variant === "primary"
      ? "cms-btn--primary"
      : onDark
        ? "cms-btn--secondary-dark"
        : "cms-btn--secondary";

  const classes = cn(
    "cms-btn group inline-flex items-center justify-center gap-2",
    variantClass,
    className,
  );

  if (href) {
    const isExternal = /^https?:|^mailto:|^tel:/.test(href);
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        onClick={onClick}
        target={target ?? (isExternal ? "_blank" : undefined)}
        rel={rel ?? (isExternal ? "noopener noreferrer" : undefined)}
        aria-label={ariaLabel}
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={classes}
    >
      {children}
    </button>
  );
});
