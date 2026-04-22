import React, { memo } from 'react';

interface LogoProps {
  className?: string;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = memo(({ className = '', light = false }) => {
  const textColor = light ? '#FFFFFF' : '#1a1a1a';
  const accentColor = '#c41e3a'; // corporate red accent

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Geometric concrete block icon */}
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Concrete cube outline */}
        <rect x="2" y="10" width="20" height="20" fill={accentColor} opacity="0.9" />
        <rect x="8" y="4" width="20" height="20" fill={accentColor} opacity="0.7" />
        <rect x="14" y="6" width="20" height="20" stroke={textColor} strokeWidth="1.5" fill="none" />
        {/* Cross lines suggesting concrete texture */}
        <line x1="14" y1="16" x2="34" y2="16" stroke={textColor} strokeWidth="0.8" opacity="0.4" />
        <line x1="14" y1="22" x2="34" y2="22" stroke={textColor} strokeWidth="0.8" opacity="0.4" />
        <line x1="22" y1="6" x2="22" y2="26" stroke={textColor} strokeWidth="0.8" opacity="0.4" />
      </svg>

      {/* Company name */}
      <div className="flex flex-col leading-none">
        <span
          className="text-[15px] font-medium tracking-[0.08em] uppercase"
          style={{ color: textColor }}
        >
          Mantovani
        </span>
        <span
          className="text-[11px] font-normal tracking-[0.12em] uppercase opacity-70"
          style={{ color: textColor }}
        >
          Beton sh.p.k
        </span>
      </div>
    </div>
  );
});

Logo.displayName = 'Logo';

export default Logo;
