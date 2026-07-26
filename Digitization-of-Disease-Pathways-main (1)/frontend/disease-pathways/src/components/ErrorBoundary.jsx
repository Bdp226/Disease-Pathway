import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service like Sentry or Datadog
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{
            padding: '2rem', 
            margin: '2rem',
            background: 'rgba(255, 0, 0, 0.1)', 
            borderLeft: '4px solid #ff4444',
            borderRadius: '4px',
            color: '#fff',
            fontFamily: 'SiemensSans, sans-serif'
        }}>
          <h2>Something went wrong in this component.</h2>
          <p style={{ color: '#ccc' }}>Our engineering team has been notified. Please try refreshing the page.</p>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', color: '#ff8888', fontSize: '0.85rem' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
