import React from 'react';

export default function Badge({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  const baseStyle = "inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wide shrink-0 border select-none";
  
  const variants = {
    primary: "bg-blue-50 text-blue-700 border-blue-100/50",
    success: "bg-sky-50 text-sky-650 border-sky-100/50",
    warning: "bg-amber-50 text-amber-600 border-amber-100/50",
    danger: "bg-rose-50 text-rose-600 border-rose-100/50",
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
