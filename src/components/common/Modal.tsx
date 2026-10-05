import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-2xl',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll and listen to Esc key when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[999999] overflow-y-auto print:static print:z-auto print:overflow-visible print:bg-transparent print:p-0">
      {/* Backdrop overlay - completely hidden during print */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity print:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centering wrapper with min-h-full & safe padding */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6 print:p-0 print:m-0 print:block">
        <div
          className={`relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full ${maxWidth} border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150 my-6 print:border-none print:shadow-none print:bg-transparent print:my-0 print:p-0 print:max-w-none`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - hidden during print */}
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Tutup dialog (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto print:p-0 print:m-0 print:max-h-none print:overflow-visible">{children}</div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
