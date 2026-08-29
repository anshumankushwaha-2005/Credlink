import React from 'react';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  className = '',
  ...props
}) {
  const baseStyle = "inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 active:scale-[0.97] select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shrink-0 gap-2";
  
  const variants = {
    primary: "bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-blue-500/10 hover:shadow-md active:bg-brand-800",
    secondary: "bg-white border border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-650",
    danger: "bg-rose-50 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 text-rose-600",
    outline: "bg-transparent border border-brand-500 hover:bg-brand-50/30 text-brand-600",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!loading && Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
      <span>{children}</span>
    </button>
  );
}
