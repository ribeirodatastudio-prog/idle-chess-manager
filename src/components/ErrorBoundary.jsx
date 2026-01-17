import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-8">
          <div className="max-w-2xl w-full bg-gray-800 p-6 rounded-lg border border-red-500 shadow-xl">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Something went wrong.</h1>
            <p className="text-gray-300 mb-4">
              The application encountered a critical error and could not render.
            </p>
            <div className="bg-black p-4 rounded overflow-x-auto mb-4">
              <code className="text-red-300 text-sm font-mono block">
                {this.state.error && this.state.error.toString()}
              </code>
            </div>
            <details className="text-xs text-gray-500 font-mono whitespace-pre-wrap">
              <summary className="cursor-pointer mb-2 hover:text-gray-300">Component Stack</summary>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
