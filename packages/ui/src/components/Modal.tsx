import { ReactNode, useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'small' | 'medium' | 'large';
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, size = 'medium', children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="modal-backdrop"
    >
      <div
        className={`bg-white rounded-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
        data-testid="modal-content"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 text-2xl leading-none"
            data-testid="modal-close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
