import React from 'react';

export default function Skeleton({
  variant = 'text', // 'text', 'avatar', 'rect'
  className = '',
  ...props
}) {
  const baseStyle = "bg-slate-100 animate-pulse";
  
  const variants = {
    text: "h-3.5 w-full rounded",
    avatar: "w-10 h-10 rounded-full shrink-0",
    rect: "h-24 w-full rounded-2xl",
  };

  return (
    <div 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      {...props} 
    />
  );
}
