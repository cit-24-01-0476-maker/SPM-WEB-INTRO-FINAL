import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { PublicSettingsProvider } from "@/lib/cms/PublicSettings";
import { ThemeProvider } from "@/lib/use-theme";
import { Toaster } from "@/components/ui/sonner";
import { trackPageView, initScrollTracking, resetScrollTracking } from "@/lib/analytics";
import { startPresence, type PresenceHandle } from "@/lib/analytics/presence";
import { setActivePresence } from "@/lib/analytics/presence-instance";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SPM ECO System | Smart Parking Management System Sri Lanka" },
      {
        name: "description",
        content:
          "SPM ECO System is a smart parking management platform for Sri Lanka with real-time parking availability, advance booking, ANPR gate automation, dynamic pricing, QR payment, retail parking abuse control, and an operator dashboard.",
      },
      {
        name: "keywords",
        content:
          "smart parking Sri Lanka, parking management system, ANPR parking system, number plate recognition parking, dynamic parking pricing, QR parking payment, retail parking management, Colombo parking solution, automated parking system, parking operator dashboard",
      },
      { name: "author", content: "SPM ECO System" },
      {
        property: "og:title",
        content: "SPM ECO System | Smart Parking Management System Sri Lanka",
      },
      {
        property: "og:description",
        content:
          "A complete software + hardware smart parking ecosystem: real-time booking, ANPR gate automation, dynamic pricing, QR payment, retail parking control, and operator analytics.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "SPM ECO System" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('spm-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}var r=document.documentElement;r.classList.toggle('dark',t==='dark');r.style.colorScheme=t;}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function isBareRoute(pathname: string) {
  return pathname.startsWith("/admin");
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const bare = isBareRoute(pathname);
  const presenceRef = useRef<PresenceHandle | null>(null);

  // Public-site analytics (skip admin/auth surfaces).
  useEffect(() => {
    if (bare) return;
    resetScrollTracking();
    void trackPageView(pathname);
    const cleanup = initScrollTracking();
    return cleanup;
  }, [pathname, bare]);

  // Real live-visitor presence (Firebase Realtime Database) — public site only.
  useEffect(() => {
    if (bare || typeof window === "undefined") return;
    const handle = startPresence(window.location.pathname, document.title);
    presenceRef.current = handle;
    setActivePresence(handle);
    return () => {
      handle.stop();
      presenceRef.current = null;
      setActivePresence(null);
    };
  }, [bare]);

  // Update the current page on client navigation without restarting presence.
  useEffect(() => {
    if (bare) return;
    presenceRef.current?.updatePage(
      pathname,
      typeof document !== "undefined" ? document.title : "",
    );
  }, [pathname, bare]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {bare ? (
          <Outlet />
        ) : (
          <PublicSettingsProvider>
            <div className="flex min-h-screen flex-col bg-background">
              <Navbar />
              <main className="flex-1">
                {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
                <Outlet />
              </main>
              <Footer />
              <WhatsAppButton />
            </div>
          </PublicSettingsProvider>
        )}
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
