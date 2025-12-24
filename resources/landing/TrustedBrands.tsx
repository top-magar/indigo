'use client';

import React from 'react';

export const TrustedBrands: React.FC = () => {
  return (
    <div id="trusted-by" className="bg-background/50 border-y border-border/50 py-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm font-semibold text-muted-foreground tracking-wide mb-8">Powering Nepal's Best Brands</p>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-10 opacity-70 hover:opacity-100 transition-opacity duration-500 grayscale hover:grayscale-0 items-center">

          {/* Daraz Logo */}
          <div className="h-8 md:h-10 w-auto group">
            <svg viewBox="0 0 110 30" className="h-full w-auto fill-foreground group-hover:fill-[#F57224] transition-colors" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.9 2.5C7.2 2.5 2.5 7.2 2.5 12.9S7.2 23.3 12.9 23.3C18.6 23.3 23.3 18.6 23.3 12.9S18.6 2.5 12.9 2.5ZM10.5 18.1L10.5 7.7L17.5 12.9L10.5 18.1Z" />
              <text x="30" y="21" fontFamily="sans-serif" fontWeight="800" fontSize="20" letterSpacing="-1">daraz</text>
            </svg>
          </div>

          {/* eSewa Logo */}
          <div className="h-8 md:h-9 w-auto group">
            <svg viewBox="0 0 120 40" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35H35V5H20Z" className="fill-foreground group-hover:fill-[#60BB46] transition-colors" />
              <path d="M20 15L25 20L20 25" stroke="currentColor" strokeWidth="3" className="stroke-background group-hover:stroke-white transition-colors" />
              <text x="45" y="28" fontFamily="sans-serif" fontWeight="900" fontSize="24" className="fill-foreground group-hover:fill-[#60BB46] transition-colors">eSewa</text>
            </svg>
          </div>

          {/* Khalti Logo */}
          <div className="h-7 md:h-8 w-auto group">
            <svg viewBox="0 0 120 35" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 5H25V12H12V23H25V30H5V5Z" className="fill-foreground group-hover:fill-[#5C2D91] transition-colors" />
              <path d="M18 12L28 5M18 23L28 30" stroke="currentColor" strokeWidth="4" className="stroke-foreground group-hover:stroke-[#5C2D91] transition-colors" />
              <text x="35" y="26" fontFamily="sans-serif" fontWeight="800" fontSize="24" className="fill-foreground group-hover:fill-[#5C2D91] transition-colors">Khalti</text>
            </svg>
          </div>

          {/* IME Pay Logo */}
          <div className="h-7 md:h-8 w-auto group">
            <svg viewBox="0 0 130 35" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="2" width="50" height="31" rx="4" className="fill-foreground group-hover:fill-[#ED1C24] transition-colors" />
              <text x="5" y="24" fontFamily="sans-serif" fontWeight="900" fontSize="18" className="fill-background group-hover:fill-white transition-colors">IME</text>
              <text x="58" y="24" fontFamily="sans-serif" fontWeight="900" fontSize="20" className="fill-foreground group-hover:fill-[#ED1C24] transition-colors">pay</text>
            </svg>
          </div>

          {/* Bhatbhateni Logo */}
          <div className="h-8 md:h-10 w-auto group flex items-center gap-2">
            <svg viewBox="0 0 200 40" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="15" className="fill-foreground group-hover:fill-[#0054A6] transition-colors" />
              <text x="15" y="25" fontFamily="sans-serif" fontWeight="bold" fontSize="16" fill="white">B</text>
              <text x="45" y="26" fontFamily="sans-serif" fontWeight="800" fontSize="20" className="fill-foreground group-hover:fill-[#0054A6] transition-colors">Bhat-Bhateni</text>
            </svg>
          </div>

        </div>
      </div>
    </div>
  );
};
