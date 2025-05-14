import React from 'react';

export function HealthLensLogo({ className, size = 24 }: { className?: string, size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="HealthLens Logo"
    >
      <circle cx="12" cy="12" r="10" className="fill-primary/20 stroke-primary" strokeWidth="1.5" />
      <path d="M12 8V16" className="stroke-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 12H16" className="stroke-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
