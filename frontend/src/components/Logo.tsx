type LogoProps = {
  className?: string;
};

// WhosePic mark: a face-detection "focus frame" — corner brackets around a
// head silhouette — filled with the brand violet → magenta → teal gradient.
export function Logo({ className = "h-7 w-7" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="WhosePic logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="whosepic-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7C2DFF" />
          <stop offset="50%" stopColor="#E0148C" />
          <stop offset="100%" stopColor="#00CC9A" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#whosepic-logo)" />
      <g
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 6H7a1 1 0 0 0-1 1v5" />
        <path d="M20 6h5a1 1 0 0 1 1 1v5" />
        <path d="M26 20v5a1 1 0 0 1-1 1h-5" />
        <path d="M12 26H7a1 1 0 0 1-1-1v-5" />
      </g>
      <circle cx="16" cy="14" r="3.3" fill="#fff" />
      <path
        d="M10.8 25.5c0-3.2 2.3-5.4 5.2-5.4s5.2 2.2 5.2 5.4"
        fill="#fff"
      />
    </svg>
  );
}
