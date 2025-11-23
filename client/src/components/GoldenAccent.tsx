/**
 * Golden Accent Decorative Element
 * SVG decorative shapes with golden glow for section breaks
 */

interface GoldenAccentProps {
  variant?: 'arc' | 'circle' | 'line';
  className?: string;
}

export const GoldenAccent = ({ variant = 'arc', className = '' }: GoldenAccentProps) => {
  if (variant === 'circle') {
    return (
      <svg
        className={`w-16 h-16 ${className}`}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="circleGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D4A853" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#D4A853" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="24" fill="url(#circleGlow)" />
        <circle cx="32" cy="32" r="16" stroke="#D4A853" strokeWidth="2" fill="none" opacity="0.6" />
        <circle cx="32" cy="32" r="8" fill="#D4A853" opacity="0.4" />
      </svg>
    );
  }

  if (variant === 'line') {
    return (
      <svg
        className={`w-24 h-2 ${className}`}
        viewBox="0 0 96 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4A853" stopOpacity="0" />
            <stop offset="50%" stopColor="#D4A853" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#D4A853" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="0" y="3" width="96" height="2" fill="url(#lineGradient)" />
      </svg>
    );
  }

  // Default: arc
  return (
    <svg
      className={`w-32 h-16 ${className}`}
      viewBox="0 0 128 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D4A853" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#D4A853" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#D4A853" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path
        d="M 10 60 Q 64 10, 118 60"
        stroke="url(#arcGradient)"
        strokeWidth="3"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M 20 58 Q 64 18, 108 58"
        stroke="#D4A853"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
};
