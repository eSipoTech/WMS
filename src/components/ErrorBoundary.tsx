import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-black/20 backdrop-blur-xl border border-white/10 rounded-[32px] text-center">
          <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-white/60 mb-8 max-w-md">
            The application encountered an unexpected error while processing your request. 
            {this.state.error?.message && <span className="block mt-2 text-rose-400/80 font-mono text-xs">{this.state.error.message}</span>}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-porteo-orange text-white rounded-xl font-bold hover:bg-porteo-orange/90 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
