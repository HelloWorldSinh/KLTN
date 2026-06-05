import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  icon: Icon,
  maxWidth = 'md'
}) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative bg-white rounded-3xl shadow-2xl w-full ${maxWidthClasses[maxWidth]} overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-black/5`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 bg-primary text-white">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-6 w-6" />}
            <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-1">
          {children}
        </div>
      </div>
    </div>
  );
};
