import React, { useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  inverted?: boolean;
  className?: string;
  variant?: 'full' | 'emblem' | 'horizontal';
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = true,
  inverted = false,
  className = '',
  variant = 'horizontal',
}) => {
  const [imgError, setImgError] = useState(false);
  const logoSrc = '/src/assets/images/kurtta_brand_logo_1791049613623.jpg';

  const sizeConfig = {
    sm: {
      emblem: 'w-8 h-8 rounded-lg',
      brand: 'text-sm font-extrabold tracking-tight',
      tag: 'text-[9px] font-medium tracking-wide',
      svgWidth: 32,
    },
    md: {
      emblem: 'w-10 h-10 rounded-xl',
      brand: 'text-base font-black tracking-tight',
      tag: 'text-[10px] font-semibold tracking-wide',
      svgWidth: 40,
    },
    lg: {
      emblem: 'w-14 h-14 rounded-2xl shadow-sm',
      brand: 'text-xl font-black tracking-tight',
      tag: 'text-xs font-semibold tracking-wide',
      svgWidth: 56,
    },
    xl: {
      emblem: 'w-20 h-20 rounded-3xl shadow-md',
      brand: 'text-2xl sm:text-3xl font-black tracking-tight',
      tag: 'text-xs sm:text-sm font-semibold tracking-wide',
      svgWidth: 80,
    },
  }[size];

  // Pure SVG Emblem matching the uploaded Kurtta kids clothes logo
  const KurttaEmblemSVG = (
    <div
      className={`relative shrink-0 overflow-hidden ${sizeConfig.emblem} bg-gradient-to-br from-[#1EB5EB] via-[#00AEEF] to-[#0284C7] flex items-center justify-center shadow-xs border border-sky-300/40`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full p-1.5 drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Diamond Outer Frame */}
        <rect
          x="50"
          y="12"
          width="48"
          height="48"
          transform="rotate(45 50 12)"
          stroke="#FFFFFF"
          strokeWidth="5"
          fill="none"
          strokeLinejoin="miter"
        />

        {/* Serif 'K' Emblem */}
        <g fill="#FFFFFF">
          {/* Vertical stem */}
          <rect x="36" y="27" width="7" height="46" rx="1" />
          {/* Top serif */}
          <rect x="30" y="25" width="19" height="4.5" rx="0.5" />
          {/* Bottom serif */}
          <rect x="30" y="70.5" width="19" height="4.5" rx="0.5" />
          
          {/* Upper diagonal arm */}
          <polygon points="41,50 63,26 72,26 49,52" />
          {/* Upper arm top serif */}
          <rect x="61" y="24" width="12" height="4" rx="0.5" />

          {/* Lower diagonal arm */}
          <polygon points="46,47 68,73 76,73 53,49" />
          {/* Lower arm bottom serif */}
          <rect x="65" y="72" width="13" height="4" rx="0.5" />
        </g>
      </svg>
    </div>
  );

  if (variant === 'emblem') {
    return KurttaEmblemSVG;
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Emblem with fallback */}
      {KurttaEmblemSVG}

      {/* Brand Text */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1">
          <span
            className={`${sizeConfig.brand} tracking-wider font-extrabold uppercase ${
              inverted ? 'text-white' : 'text-stone-900'
            }`}
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
          >
            KURTTA
          </span>
          <span
            className={`text-[9px] font-bold -mt-2 ${
              inverted ? 'text-sky-300' : 'text-[#00AEEF]'
            }`}
          >
            ®
          </span>
        </div>
        {showTagline && (
          <span
            className={`${sizeConfig.tag} italic lowercase font-medium ${
              inverted ? 'text-sky-200' : 'text-[#00AEEF]'
            }`}
            style={{ fontFamily: "'Comic Sans MS', 'Plus Jakarta Sans', cursive, sans-serif" }}
          >
            kids clothes
          </span>
        )}
      </div>
    </div>
  );
};
