import React from 'react';

export default function Card({
  children,
  className = '',
  hoverable = true,
  animate = true,
  delayIdx = 0,
  onClick,
  ...props
}) {
  const baseStyle = "bg-white rounded-3xl border border-slate-100/60 p-5 md:p-6 text-slate-800 transition-all duration-300";
  const hoverStyle = hoverable ? "hover:shadow-soft-lg hover:-translate-y-0.5" : "shadow-soft";
  const animClass = animate ? "animate-slide-up" : "";
  const cursorStyle = onClick ? "cursor-pointer select-none active:scale-[0.99]" : "";

  return (
    <div
      onClick={onClick}
      className={`${baseStyle} ${hoverStyle} ${animClass} ${className} ${cursorStyle}`}
      style={animate && delayIdx > 0 ? { animationDelay: `${delayIdx * 50}ms` } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
