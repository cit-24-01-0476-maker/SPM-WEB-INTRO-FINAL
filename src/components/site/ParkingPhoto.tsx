const CROPS = {
  parking: "540 100 582 550",
  mobile: "66 992 300 211",
  gate: "410 992 300 211",
  dashboard: "755 992 301 211",
};

/** Reuse the exact artwork from the approved concept without raster edits. */
export function ParkingPhoto({
  scene = "parking",
  className = "",
}: {
  scene?: keyof typeof CROPS;
  className?: string;
}) {
  return (
    <svg
      viewBox={CROPS[scene]}
      role="img"
      aria-label={`SPM ECO ${scene} concept illustration`}
      className={`parking-photo ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <image href="/images/spm-eco-design.png" width="1122" height="1402" />
    </svg>
  );
}
