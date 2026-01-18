
import React from 'react';

export const SLAHLogo = ({ variant = 'light', className = "" }: { variant?: 'light' | 'dark', className?: string }) => {
  const textColor = variant === 'light' ? 'fill-white' : 'fill-slate-900';
  const slahTextColor = variant === 'light' ? 'fill-white' : 'fill-slate-800';
  
  return (
    <svg viewBox="0 0 400 300" className={className} xmlns="http://www.w3.org/2000/svg">
      <text x="200" y="60" textAnchor="middle" className={textColor} style={{ fontSize: '28px', fontWeight: 300, letterSpacing: '2px', fontFamily: 'serif' }}>SIERRA LEONE</text>
      <text x="200" y="115" textAnchor="middle" className={textColor} style={{ fontSize: '62px', fontWeight: 900, fontFamily: 'Inter, sans-serif' }}>ASSOCIATION</text>
      <text x="200" y="165" textAnchor="middle" className={textColor} style={{ fontSize: '42px', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>OF HOTELS</text>
      <rect x="50" y="190" width="130" height="60" className="fill-emerald-500" />
      <rect x="220" y="190" width="130" height="60" className="fill-indigo-600" />
      <path d="M 110 245 A 90 90 0 0 0 290 245" fill="none" className={variant === 'light' ? 'stroke-white' : 'stroke-slate-900'} strokeWidth="4" />
      <text x="200" y="275" textAnchor="middle" className={slahTextColor} style={{ fontSize: '44px', fontWeight: 700, fontFamily: 'cursive, sans-serif' }}>SLAH</text>
    </svg>
  );
};

export default SLAHLogo;
