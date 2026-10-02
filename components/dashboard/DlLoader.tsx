// The kit's "magnet loader": three nested open bands pulsing in sequence,
// standing in for a spinner everywhere a button or inline status is busy.
// See dealerloft-components.css: .dl-loader / .p0 .p1 .p2 / @keyframes dl-pulse.
export function DlLoader({ className }: { className?: string }) {
  return (
    <span className={`dl-loader ${className ?? ""}`} aria-hidden="true">
      <svg viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          className="p0"
          d="M9 1C9 1 1.5 1 1.5 8C1.5 15 9 15 9 15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          className="p1"
          d="M9 4.5C9 4.5 4.5 4.5 4.5 8C4.5 11.5 9 11.5 9 11.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          className="p2"
          d="M9 7.5C9 7.5 7.5 7.5 7.5 8C7.5 8.5 9 8.5 9 8.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
