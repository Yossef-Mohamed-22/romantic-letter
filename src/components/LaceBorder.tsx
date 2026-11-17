import React from 'react';

interface LaceBorderProps {
  color?: string;
}

export const LaceBorder: React.FC<LaceBorderProps> = ({ color = '#D5B47A' }) => {
  return (
    <div className="absolute inset-0 pointer-events-none p-1.5 sm:p-4">
      {/* Outer border line with delicate dash/dots */}
      <div
        className="w-full h-full relative rounded-md border"
        style={{ borderColor: `${color}77` }}
      >
        {/* Inner thin border line */}
        <div
          className="absolute inset-1 sm:inset-2 rounded-sm border"
          style={{ borderColor: `${color}44` }}
        />

        {/* Top-Left Corner Flourish */}
        <div className="absolute -top-2 -left-2 w-6 h-6 sm:w-10 sm:h-10 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M10 90 C10 40, 40 10, 90 10 M10 70 C10 35, 35 10, 70 10 M25 75 C25 50, 50 25, 75 25 M30 30 A15 15 0 1 1 15 15 A15 15 0 0 1 30 30 Z"
              stroke={color}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="20" cy="20" r="4" fill={color} />
          </svg>
        </div>

        {/* Top-Right Corner Flourish */}
        <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-10 sm:h-10 pointer-events-none scale-x-[-1]">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M10 90 C10 40, 40 10, 90 10 M10 70 C10 35, 35 10, 70 10 M25 75 C25 50, 50 25, 75 25 M30 30 A15 15 0 1 1 15 15 A15 15 0 0 1 30 30 Z"
              stroke={color}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="20" cy="20" r="4" fill={color} />
          </svg>
        </div>

        {/* Bottom-Left Corner Flourish */}
        <div className="absolute -bottom-2 -left-2 w-6 h-6 sm:w-10 sm:h-10 pointer-events-none scale-y-[-1]">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M10 90 C10 40, 40 10, 90 10 M10 70 C10 35, 35 10, 70 10 M25 75 C25 50, 50 25, 75 25 M30 30 A15 15 0 1 1 15 15 A15 15 0 0 1 30 30 Z"
              stroke={color}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="20" cy="20" r="4" fill={color} />
          </svg>
        </div>

        {/* Bottom-Right Corner Flourish */}
        <div className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-10 sm:h-10 pointer-events-none scale-x-[-1] scale-y-[-1]">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M10 90 C10 40, 40 10, 90 10 M10 70 C10 35, 35 10, 70 10 M25 75 C25 50, 50 25, 75 25 M30 30 A15 15 0 1 1 15 15 A15 15 0 0 1 30 30 Z"
              stroke={color}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="20" cy="20" r="4" fill={color} />
          </svg>
        </div>

        {/* Top Center Heart Ornament */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-[#F2E3C3] flex items-center gap-1.5">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill={color}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>

        {/* Bottom Center Heart Ornament */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-3 bg-[#F2E3C3] flex items-center gap-1.5">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill={color}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
