import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errStr = (error.message || '') + ' ' + (error.stack || '');
    const isExtension = /chrome-extension:\/\/|moz-extension:\/\//i.test(errStr) ||
      (/evmask|metamask|phantom|inpage\.js/i.test(errStr) && !/hopecommunity|src\/|react|firebase|firestore/i.test(errStr));

    if (isExtension) {
      this.setState({ hasError: false, error: null });
      return;
    }
    // Genuine application errors are always logged and handled
    console.error('Application Error Boundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F5EE] p-6 text-[#202826]">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-[#216761]/20 p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#B3392F]/10 text-[#B3392F] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#173F3A]">
              Something unexpected occurred
            </h2>
            <p className="text-sm text-[#66736F] leading-relaxed">
              We encountered a temporary interface issue. Your session data and clinical records remain safe.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#216761] hover:bg-[#173F3A] text-white text-sm font-medium rounded-xl transition-all shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
