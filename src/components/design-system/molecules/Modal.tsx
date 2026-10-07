import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  lotStamp?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hideCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  lotStamp,
  children,
  footer,
  size = 'md',
  hideCloseButton = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="cellar-modal-portal">
      <div className="cellar-modal-backdrop" onClick={onClose} />
      <div
        className={`cellar-modal cellar-modal--${size}`}
        role="dialog"
        aria-modal="true"
      >
        {!hideCloseButton && (
          <button
            type="button"
            className="cellar-modal__close-btn"
            onClick={onClose}
            aria-label="Chiudi finestra"
          >
            <X size={18} />
          </button>
        )}

        {(title || lotStamp) && (
          <div className="cellar-modal__header">
            {lotStamp && <span className="cellar-modal__stamp">{lotStamp}</span>}
            {title && <h2 className="cellar-modal__title">{title}</h2>}
            {subtitle && <p className="cellar-modal__subtitle">{subtitle}</p>}
          </div>
        )}

        <div className="cellar-modal__body">{children}</div>

        {footer && <div className="cellar-modal__footer">{footer}</div>}
      </div>
    </div>
  );
};
