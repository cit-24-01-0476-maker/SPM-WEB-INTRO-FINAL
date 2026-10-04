import { AlertTriangle } from "lucide-react";
export function DataError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
      <p className="flex items-center gap-2 font-semibold">
        <AlertTriangle className="h-4 w-4" />
        Data could not be loaded
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Check your connection and backend configuration, then retry. Saved data has not been
        replaced with an empty result.
      </p>
      <button
        onClick={onRetry}
        className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
      >
        Retry
      </button>
    </div>
  );
}
