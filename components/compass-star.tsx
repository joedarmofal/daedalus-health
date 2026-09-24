export function CompassStar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="0.75" />
      <path
        d="M32 6 35.1 28.9 58 32 35.1 35.1 32 58 28.9 35.1 6 32 28.9 28.9 32 6Z"
        fill="currentColor"
      />
      <g transform="rotate(45 32 32)" opacity="0.45">
        <path
          d="M32 14 33.8 30.2 50 32 33.8 33.8 32 50 30.2 33.8 14 32 30.2 30.2 32 14Z"
          fill="currentColor"
        />
      </g>
      <circle cx="32" cy="32" r="5" fill="#F9F8F3" />
      <circle cx="32" cy="32" r="5" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}
