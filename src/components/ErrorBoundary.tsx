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
          backgroundColor: '#FAF7F2',
          color: '#1A1614',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{
            maxWidth: '540px',
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(43, 37, 33, 0.15)',
            borderRadius: '8px',
            padding: '2.5rem 2rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          }}>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.12em',
              color: '#B8860B',
              textTransform: 'uppercase',
            }}>
              CELLAR • AVVISO DI SISTEMA
            </span>
            <h1 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '24px',
              margin: '0.75rem 0',
              color: '#6C1A24',
            }}>
              Si è verificato un imprevisto
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#5F564F',
              marginBottom: '1.5rem',
              lineHeight: 1.5,
            }}>
              {this.state.error?.message || 'Errore imprevisto durante il rendering della cantina.'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #8B2332, #6C1A24)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                padding: '0.75rem 1.5rem',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
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
