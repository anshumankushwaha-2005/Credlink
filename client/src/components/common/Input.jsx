import React from 'react';

export default function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  icon: Icon,
  error = '',
  required = false,
  className = '',
  autoFocus = false,
  ...props
}) {
  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && (
        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon size={16} />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          required={required}
          className={`input ${Icon ? '!pl-11 pr-4' : 'px-4'} ${
            error 
              ? 'border-rose-300 focus:ring-rose-500/10 focus:border-rose-500' 
              : 'border-slate-200/80 focus:ring-blue-500/10 focus:border-brand-500'
          }`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[10px] font-semibold text-rose-500 mt-1 animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
}
