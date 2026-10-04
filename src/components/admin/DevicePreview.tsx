// Responsive device preview frame. Renders children at a true device width and
// scales the frame down to fit the available panel width (no browser zoom).

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ExternalLink, Monitor, RefreshCw, Smartphone, Tablet } from "lucide-react";
import { PREVIEW_DEVICES, type PreviewDeviceId } from "@/lib/cms/model";
import { cn } from "@/lib/utils";

function deviceIcon(id: PreviewDeviceId) {
  if (id === "desktop" || id === "laptop") return Monitor;
  if (id === "tablet") return Tablet;
  return Smartphone;
}

export function DevicePreview({
  children,
  height = 620,
  openHref = "/",
}: {
  children: ReactNode;
  height?: number;
  openHref?: string;
}) {
  const [device, setDevice] = useState<PreviewDeviceId>("desktop");
  const [reloadKey, setReloadKey] = useState(0);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const width = PREVIEW_DEVICES.find((d) => d.id === device)?.width ?? 1440;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const avail = el.clientWidth - 24;
      setScale(Math.min(1, avail / width));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-1">
          {PREVIEW_DEVICES.map((d) => {
            const Icon = deviceIcon(d.id);
            return (
              <button
                key={d.id}
                onClick={() => setDevice(d.id)}
                title={`${d.label} — ${d.width}px`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
                  device === d.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{d.label}</span>
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="mr-1 hidden text-[11px] font-medium text-muted-foreground sm:inline">
            {width}px · {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary"
            title="Reload preview"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <a
            href={openHref}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary"
            title="Open full preview in a new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
      <div
        ref={containerRef}
        className="overflow-hidden bg-secondary/40 p-3"
        style={{ height: height + 24 }}
      >
        <div
          style={{
            width,
            height: height / scale,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <div
            key={reloadKey}
            className="h-full w-full overflow-y-auto rounded-xl bg-background shadow-lg"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
