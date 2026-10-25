import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { X, Mail, Lock, User, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import './AuthModal.css';

export interface AuthCardProps {
  inline?: boolean;
  onClose?: () => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthCard: React.FC<AuthCardProps> = ({
  inline = false,
  onClose,
  defaultMode = 'login',
}) => {
  const { authModalMode, closeAuthModal, signIn, signUp, openAuthModal } = useAuth();
  const [internalMode, setInternalMode] = useState<'login' | 'signup'>(defaultMode);

  const currentMode = inline ? internalMode : authModalMode;
  const isLogin = currentMode === 'login';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSwitchMode = (mode: 'login' | 'signup') => {
    resetForm();
    if (inline) {
      setInternalMode(mode);
    } else {
      openAuthModal(mode);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Inserisci sia l\'email che la password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La password deve contenere almeno 6 caratteri.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrorMessage('Credenziali non corrette. Verifica email e password.');
          } else {
            setErrorMessage(error.message);
          }
        } else {
          resetForm();
          onClose?.();
        }
      } else {
        const { error, needsEmailConfirmation } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('User already registered')) {
            setErrorMessage('Questa email è già registrata. Prova ad accedere.');
          } else {
            setErrorMessage(error.message);
          }
        } else if (needsEmailConfirmation) {
          setSuccessMessage(
            'Account creato con successo! Controlla la tua casella di posta per confermare l\'indirizzo email prima di accedere.'
          );
        } else {
          resetForm();
          onClose?.();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Si è verificato un errore inatteso.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`auth-modal-card ${inline ? 'auth-modal-card--inline' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Pulsante Chiusura (solo se modale) */}
      {!inline && (
        <button
          type="button"
          className="auth-modal-close"
          onClick={onClose || closeAuthModal}
          aria-label="Chiudi finestra di accesso"
        >
          <X size={18} />
        </button>
      )}

      {/* Header Editoriale */}
      <div className="auth-modal-header">
        <div className="auth-modal-badge">
          <Sparkles size={13} />
          <span>Cantina Privata</span>
        </div>
        <h2 className="auth-modal-title">
          {isLogin ? 'Accedi al tuo Caveau' : 'Crea la tua Cantina'}
        </h2>
        <p className="auth-modal-subtitle">
          {isLogin
            ? 'Inserisci le tue credenziali per sincronizzare e proteggere la tua collezione nel cloud.'
            : 'Registrati per iniziare a catalogare i tuoi vini e accedere da qualsiasi dispositivo.'}
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="auth-modal-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={isLogin}
          className={`auth-modal-tab ${isLogin ? 'auth-modal-tab--active' : ''}`}
          onClick={() => handleSwitchMode('login')}
        >
          Accedi
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isLogin}
          className={`auth-modal-tab ${!isLogin ? 'auth-modal-tab--active' : ''}`}
          onClick={() => handleSwitchMode('signup')}
        >
          Registrati
        </button>
      </div>

      {/* Messaggi di Errore / Successo */}
      {errorMessage && (
        <div className="auth-modal-alert auth-modal-alert--error" role="alert">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="auth-modal-alert auth-modal-alert--success" role="alert">
          <CheckCircle2 size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="auth-modal-form">
        {!isLogin && (
          <div className="auth-modal-field">
            <label htmlFor="auth-full-name" className="auth-modal-label">
              Nome o Nome Cantina
            </label>
            <div className="auth-modal-input-wrapper">
              <User size={16} className="auth-modal-input-icon" />
              <input
                id="auth-full-name"
                type="text"
                placeholder="Es. Marco Rossi o Caveau di Marco"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="auth-modal-input"
                autoComplete="name"
              />
            </div>
          </div>
        )}

        <div className="auth-modal-field">
          <label htmlFor="auth-email" className="auth-modal-label">
            Email
          </label>
          <div className="auth-modal-input-wrapper">
            <Mail size={16} className="auth-modal-input-icon" />
            <input
              id="auth-email"
              type="email"
              placeholder="nome@esempio.it"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-modal-input"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="auth-modal-field">
          <label htmlFor="auth-password" className="auth-modal-label">
            Password
          </label>
          <div className="auth-modal-input-wrapper">
            <Lock size={16} className="auth-modal-input-icon" />
            <input
              id="auth-password"
              type="password"
              placeholder="Almeno 6 caratteri"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-modal-input"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="auth-modal-submit-btn"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="auth-modal-spinner" />
              <span>{isLogin ? 'Accesso in corso...' : 'Creazione account...'}</span>
            </>
          ) : (
            <span>{isLogin ? 'Entra nella Cantina' : 'Crea il mio Account'}</span>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="auth-modal-card-footer">
        {isLogin ? (
          <p>
            Non hai ancora un account?{' '}
            <button
              type="button"
              className="auth-modal-link-btn"
              onClick={() => handleSwitchMode('signup')}
            >
              Registrati qui
            </button>
          </p>
        ) : (
          <p>
            Hai già un account?{' '}
            <button
              type="button"
              className="auth-modal-link-btn"
              onClick={() => handleSwitchMode('login')}
            >
              Accedi qui
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal } = useAuth();

  if (!isAuthModalOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={closeAuthModal} role="dialog" aria-modal="true">
      <AuthCard onClose={closeAuthModal} />
    </div>
  );
};

