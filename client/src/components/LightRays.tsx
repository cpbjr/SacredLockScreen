/**
 * Ethereal Light Rays SVG Component
 * Creates divine radiant light effect for hero section
 */

export const LightRays = () => {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="lightGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFF9E6" stopOpacity="0.8" />
          <stop offset="40%" stopColor="#D4A853" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FAF9F7" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="ray1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF9E6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#D4A853" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="ray2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8DCC8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#D4A853" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="ray3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF9E6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#E8A07A" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Central radial glow */}
      <circle cx="600" cy="320" r="480" fill="url(#lightGlow)" />

      {/* Light rays emanating from top center */}
      <g transform="translate(600, 100)">
        {/* Ray 1 */}
        <path
          d="M -50 0 L -150 700 L -120 700 L -30 0 Z"
          fill="url(#ray1)"
          opacity="0.6"
        >
          <animate
            attributeName="opacity"
            values="0.4;0.7;0.4"
            dur="8s"
            repeatCount="indefinite"
          />
        </path>

        {/* Ray 2 */}
        <path
          d="M -20 0 L -60 700 L -30 700 L 0 0 Z"
          fill="url(#ray2)"
          opacity="0.5"
        >
          <animate
            attributeName="opacity"
            values="0.3;0.6;0.3"
            dur="6s"
            repeatCount="indefinite"
          />
        </path>

        {/* Ray 3 */}
        <path
          d="M 20 0 L 30 700 L 60 700 L 0 0 Z"
          fill="url(#ray1)"
          opacity="0.5"
        >
          <animate
            attributeName="opacity"
            values="0.35;0.65;0.35"
            dur="7s"
            repeatCount="indefinite"
          />
        </path>

        {/* Ray 4 */}
        <path
          d="M 50 0 L 120 700 L 150 700 L 30 0 Z"
          fill="url(#ray3)"
          opacity="0.6"
        >
          <animate
            attributeName="opacity"
            values="0.4;0.7;0.4"
            dur="9s"
            repeatCount="indefinite"
          />
        </path>

        {/* Additional rays for fuller effect */}
        <path
          d="M -120 0 L -280 700 L -250 700 L -100 0 Z"
          fill="url(#ray2)"
          opacity="0.4"
        >
          <animate
            attributeName="opacity"
            values="0.2;0.5;0.2"
            dur="10s"
            repeatCount="indefinite"
          />
        </path>

        <path
          d="M 120 0 L 250 700 L 280 700 L 100 0 Z"
          fill="url(#ray2)"
          opacity="0.4"
        >
          <animate
            attributeName="opacity"
            values="0.25;0.55;0.25"
            dur="11s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    </svg>
  );
};
