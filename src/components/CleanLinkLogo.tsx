import React from 'react';

interface CleanLinkLogoProps {
  size?: number;
  className?: string;
  showTile?: boolean;
}

export const CleanLinkLogo: React.FC<CleanLinkLogoProps> = ({
  size = 24,
  className = '',
  showTile = true
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {showTile && (
        <rect
          width="32"
          height="32"
          rx="7"
          className="fill-slate-900"
        />
      )}
      {/* 
        Artisanal Precision Link Motif:
        Two interlocking links with a clean 45-degree diagonal severance gap,
        representing surgical parameter truncation. Zero AI sparkles.
      */}
      <g transform={showTile ? "translate(4, 4)" : "translate(0, 0)"}>
        {/* Left Link Loop */}
        <path
          d="M10 7H7C4.79086 7 3 8.79086 3 11V13C3 15.2091 4.79086 17 7 17H10"
          stroke={showTile ? "#ffffff" : "currentColor"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right Link Loop */}
        <path
          d="M14 17H17C19.2091 17 21 15.2091 21 13V11C21 8.79086 19.2091 7 17 7H14"
          stroke={showTile ? "#38bdf8" : "#0284c7"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Central Precision Slicing Node */}
        <line
          x1="8.5"
          y1="12"
          x2="15.5"
          y2="12"
          stroke={showTile ? "#ffffff" : "currentColor"}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Surgical Cut Notch */}
        <circle
          cx="17"
          cy="7"
          r="1.25"
          fill={showTile ? "#38bdf8" : "#0284c7"}
        />
      </g>
    </svg>
  );
};
