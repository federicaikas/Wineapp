import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Cellar ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--paper-canvas)',
          color: 'var(--ink-primary)',
          fontFamily: 'var(--font-sans)',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{
            maxWidth: '540px',
            backgroundColor: 'var(--paper-card)',
            border: 'var(--border-tactile)',
            borderRadius: 'var(--radius-md)',
            padding: '2.5rem 2rem',
            boxShadow: 'var(--shadow-card)',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: '0.12em',
              color: 'var(--gold-foil)',
              textTransform: 'uppercase',
            }}>
              WINAPP • AVVISO DI SISTEMA
            </span>
            <h1 style={{
              fontFamily: 'var(--font-serif-display)',
              fontSize: 'var(--text-2xl)',
              margin: '0.75rem 0',
              color: 'var(--wine-bordeaux)',
            }}>
              Si è verificato un imprevisto
            </h1>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--ink-secondary)',
              marginBottom: '1.5rem',
              lineHeight: 1.5,
            }}>
              {this.state.error?.message || 'Errore imprevisto durante il rendering della cantina.'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, var(--wine-crimson), var(--wine-bordeaux))',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.75rem 1.5rem',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
              }}
            >
              Ricarica la Cantina
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

