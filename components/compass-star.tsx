export function CompassStar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="16" cy="16" r="4.5" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M16 3.5 17.6 14.4 28.5 16 17.6 17.6 16 28.5 14.4 17.6 3.5 16 14.4 14.4 16 3.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
