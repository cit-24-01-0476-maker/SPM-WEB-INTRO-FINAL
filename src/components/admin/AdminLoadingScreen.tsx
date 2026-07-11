import { Loader2, ParkingSquare } from "lucide-react";

/** Premium full-screen loading state shown while auth is being verified. */
export function AdminLoadingScreen({ message = "Verifying secure session…" }: { message?: string }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-navy text-white">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-primary/25 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan/20 blur-[140px]" />
      <div className="relative flex flex-col items-center gap-5">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
          <ParkingSquare className="h-6 w-6" />
        </span>
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Loader2 className="h-4 w-4 animate-spin text-cyan" />
          {message}
        </div>
      </div>
    </div>
  );
}
