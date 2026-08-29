import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  icon: Icon,
  className = '',
}) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in">
      <div 
        className={`bg-white rounded-[32px] w-full max-w-md p-6 relative border border-slate-100 shadow-soft-lg flex flex-col justify-between max-h-[90vh] animate-slide-up ${className}`}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition-all duration-200 active:scale-95"
        >
          <X size={20} />
        </button>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Header */}
          {(title || Icon) && (
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3.5 pt-2">
              {Icon && (
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 text-brand-600 flex items-center justify-center shrink-0">
                  <Icon size={20} />
                </div>
              )}
              <div>
                {title && <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{title}</h3>}
                {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
              </div>
            </div>
          )}

          {/* Modal Content */}
          <div className="pt-2 text-slate-700">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}
