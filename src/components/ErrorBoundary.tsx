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
          backgroundColor: 'var(--background-base)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{
            maxWidth: '540px',
            backgroundColor: 'var(--surface-card)',
            border: 'var(--border-tactile)',
            borderRadius: 'var(--radius-md)',
            padding: '2.5rem 2rem',
            boxShadow: 'var(--shadow-card)',
          }}>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              letterSpacing: '0.12em',
              color: 'var(--accent-secondary-dark)',
              textTransform: 'uppercase',
            }}>
              AFFINAPP • AVVISO DI SISTEMA
            </span>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-2xl)',
              margin: '0.75rem 0',
              color: 'var(--brand-primary)',
            }}>
              Si è verificato un imprevisto
            </h1>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              lineHeight: 1.5,
            }}>
              {this.state.error?.message || 'Errore imprevisto durante il rendering della cantina.'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-primary))',
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

