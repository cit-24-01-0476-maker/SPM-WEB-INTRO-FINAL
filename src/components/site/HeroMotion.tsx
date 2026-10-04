export function HeroMotion() {
  return (
    <svg
      className="spm-hero-roads"
      viewBox="0 0 1400 760"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient
          id="spm-road-ink"
          x1="0"
          y1="760"
          x2="1400"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#176bff" stopOpacity=".18" />
          <stop offset=".5" stopColor="#19c6f4" stopOpacity=".3" />
          <stop offset="1" stopColor="#176bff" stopOpacity=".06" />
        </linearGradient>
      </defs>
      <path
        className="spm-road-base"
        d="M-90 650H310Q370 650 370 590V560Q370 510 430 510H650Q710 510 710 450V190Q710 130 770 130H1470"
      />
      <path
        className="spm-road-base"
        d="M-70 690H330Q410 690 410 610V590Q410 550 450 550H690Q750 550 750 490V230Q750 170 810 170H1470"
      />
      <path
        className="spm-road-trace"
        d="M-90 650H310Q370 650 370 590V560Q370 510 430 510H650Q710 510 710 450V190Q710 130 770 130H1470"
        pathLength="100"
      />
      <circle cx="370" cy="650" r="8" className="spm-road-node" />
      <circle cx="710" cy="510" r="8" className="spm-road-node spm-road-node-two" />
      <circle cx="750" cy="170" r="8" className="spm-road-node spm-road-node-three" />
    </svg>
  );
}
