import React from 'react';

interface CircularProgressProps {
  currentMl: number;
  goalMl: number;
  size?: number;
  strokeWidth?: number;
  isLiters?: boolean;
  color?: string;
  badgeText?: string;
  className?: string;
  showDropIcon?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  currentMl,
  goalMl,
  size = 230,
  strokeWidth = 14,
  isLiters = false,
  color = '#0284c7', // vibrant cyan/sky blue matching screenshot
  badgeText,
  className = '',
  showDropIcon = true,
}) => {
  const percentage = Math.min(Math.round((currentMl / Math.max(goalMl, 1)) * 100), 100);
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  const formattedCurrent = isLiters
    ? `${(currentMl / 1000).toFixed(2).replace(/\.00$/, '')}L`
    : currentMl.toLocaleString();

  const formattedGoal = isLiters
    ? `${(goalMl / 1000).toFixed(1)} L`
    : `${goalMl.toLocaleString()} ml`;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 origin-center"
      >
        <defs>
          <linearGradient id="circleProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
        </defs>

        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Progress Value Stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color || 'url(#circleProgressGrad)'}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center Display Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none px-4">
        {showDropIcon && (
          <div className="mb-1 text-sky-500 animate-pulse">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="currentColor"
              className="drop-shadow-sm"
            >
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
        )}

        <div className="flex items-baseline font-bold text-slate-800 tracking-tight leading-none">
          <span className="text-3xl sm:text-4xl">{formattedCurrent}</span>
          {!isLiters && <span className="text-lg font-semibold ml-1 text-slate-600">ml</span>}
        </div>

        <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">
          of {formattedGoal}
        </div>

        {badgeText !== undefined ? (
          <div className="mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
            {badgeText}
          </div>
        ) : (
          <div className="mt-2 text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100">
            {percentage}% hydrated
          </div>
        )}
      </div>
    </div>
  );
};
