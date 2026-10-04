import { ParkingSquare } from "lucide-react";

export function MotionLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`spm-motion-logo${compact ? " spm-motion-logo-compact" : ""}`}
      aria-hidden="true"
    >
      <span className="spm-logo-orbit spm-logo-orbit-one" />
      <span className="spm-logo-orbit spm-logo-orbit-two" />
      <span className="spm-logo-orbit spm-logo-orbit-three" />
      <span className="spm-logo-core">
        <ParkingSquare strokeWidth={1.5} />
      </span>
    </span>
  );
}
