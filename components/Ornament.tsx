/** A small gold lotus between two rules, used under section titles. */
export default function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`ornament ${className}`} aria-hidden>
      <svg viewBox="0 0 34 18" fill="currentColor">
        <path d="M17 1c2.6 3 3.4 6.4 0 11-3.4-4.6-2.6-8 0-11Z" />
        <path d="M9 5c3.6.6 6 3 7 7.6C11.6 12 9.6 9 9 5ZM25 5c-.6 4-2.6 7-7 7.6 1-4.6 3.4-7 7-7.6Z" opacity=".85" />
        <path d="M3 9.5c4.4-.4 8.6 1 11.4 4.2C9.6 14.6 5.8 13 3 9.5ZM31 9.5c-2.8 3.5-6.6 5.1-11.4 4.2 2.8-3.2 7-4.6 11.4-4.2Z" opacity=".7" />
        <path d="M6 16.2h22" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </div>
  );
}
