import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
            gap: '1rem',
          }}
        >
          <h1 style={{ fontFamily: 'Cinzel, serif', color: '#D4AF37' }}>
            Algo deu errado
          </h1>
          <p style={{ color: '#A89E8A', maxWidth: 480 }}>{this.state.error.message}</p>
          <button
            onClick={this.reset}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#7B2CBF',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'Cinzel, serif',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontSize: 12,
            }}
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
