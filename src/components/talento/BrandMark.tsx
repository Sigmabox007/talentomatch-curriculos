export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <rect x="1" y="1" width="38" height="38" rx="10" className="fill-brand-foreground/10" />
      <circle cx="15.5" cy="20" r="8.5" fill="none" strokeWidth="2.6" className="stroke-brand-foreground" />
      <circle cx="24.5" cy="20" r="8.5" fill="none" strokeWidth="2.6" className="stroke-primary" />
      <path d="M20 13.2a8.5 8.5 0 0 1 0 13.6a8.5 8.5 0 0 1 0-13.6z" className="fill-primary/70" />
    </svg>
  );
}
