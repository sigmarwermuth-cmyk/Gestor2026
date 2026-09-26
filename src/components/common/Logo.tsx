import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  variant = 'auto',
}) => {
  const iconSizeMap = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const textSizeMap = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Sleek Modern Vector Monogram Mark */}
      <div className={`relative ${iconSizeMap[size]} shrink-0 drop-shadow-sm transition-transform duration-300 hover:scale-105`}>
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Dynamic Brand Gradients */}
            <linearGradient id="gf-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            <linearGradient id="gf-grad-accent" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>

            <linearGradient id="gf-grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            <filter id="gf-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2563EB" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Background Rounded Shield / Tile */}
          <rect
            x="2"
            y="2"
            width="40"
            height="40"
            rx="12"
            fill="url(#gf-grad-primary)"
            filter="url(#gf-glow)"
          />

          {/* Subtle inner glass highlight */}
          <rect
            x="3"
            y="3"
            width="38"
            height="18"
            rx="10"
            fill="white"
            fillOpacity="0.12"
          />

          {/* Modern Geometric 'G' Monogram with Growth Vector */}
          {/* Main outer G loop */}
          <path
            d="M29 14.5C26.5 12.5 23.5 11.5 20 11.5C13.6 11.5 8.5 16.5 8.5 22.8C8.5 29.1 13.6 34.1 20 34.1C26 34.1 30.5 30 31.3 24.5H20V20.2H35.8C36 21.2 36.1 22.2 36.1 23.3C36.1 32 29 38.5 19.8 38.5C10.5 38.5 3 31.5 3 22.8C3 14.1 10.5 7.1 19.8 7.1C24.8 7.1 29.2 8.9 32.5 12L29 14.5Z"
            fill="white"
            fillOpacity="0.96"
          />

          {/* Ascending Momentum Arrow / Dynamic Spark */}
          <path
            d="M27 9L36 9L36 18L32.5 14.5L25 22L21.5 18.5L28.5 11.5L27 9Z"
            fill="url(#gf-grad-accent)"
          />

          {/* Core financial center node */}
          <circle cx="20" cy="22.5" r="2.2" fill="#10B981" />
        </svg>
      </div>

      {/* Wordmark Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className={`font-extrabold tracking-tight leading-none ${textSizeMap[size]} flex items-center gap-1.5`}>
            <span className={variant === 'light' ? 'text-white' : 'text-slate-900'}>
              Gestor
            </span>
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-500 bg-clip-text text-transparent font-black">
              Financeiro
            </span>
          </div>
          <span className="text-[9px] tracking-widest uppercase font-bold text-slate-400 mt-0.5">
            Inteligência & Controle
          </span>
        </div>
      )}
    </div>
  );
};
