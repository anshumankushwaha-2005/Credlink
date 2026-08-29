import React from 'react';
import Button from './Button.jsx';

export default function EmptyState({
  title = 'No records found',
  description = 'Add your first item to get started tracking ledger details.',
  icon: Icon,
  actionText,
  onActionClick,
  className = '',
}) {
  return (
    <div className={`card text-center py-16 max-w-md mx-auto space-y-5 bg-white ${className}`}>
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100/50 flex items-center justify-center mx-auto text-slate-400">
          <Icon size={28} />
        </div>
      )}
      <div className="space-y-1.5 px-4">
        <h3 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
      {actionText && onActionClick && (
        <Button 
          onClick={onActionClick}
          size="sm"
          className="mx-auto shadow-md shadow-blue-500/5"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}
