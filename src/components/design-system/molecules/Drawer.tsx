import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './Drawer.css';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  lotStamp?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'md' | 'lg';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  lotStamp,
  children,
  footer,
  width = 'md',
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
    <div className="cellar-drawer-portal">
      <div className="cellar-drawer-backdrop" onClick={onClose} />
      <div
        className={`cellar-drawer cellar-drawer--${width}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Intestazione */}
        <div className="cellar-drawer__header">
          <div className="cellar-drawer__title-block">
            {lotStamp && <span className="cellar-drawer__stamp">{lotStamp}</span>}
            <h2 className="cellar-drawer__title">{title}</h2>
            {subtitle && <p className="cellar-drawer__subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="cellar-drawer__close-btn"
            onClick={onClose}
            aria-label="Chiudi pannello"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo scrollabile */}
        <div className="cellar-drawer__body">{children}</div>

        {/* Footer opzionale */}
        {footer && <div className="cellar-drawer__footer">{footer}</div>}
      </div>
    </div>
  );
};
