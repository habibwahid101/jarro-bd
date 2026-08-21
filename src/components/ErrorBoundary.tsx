import React from 'react';
import { AlertTriangle, MessageCircle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Top-level render-error safety net.
 *
 * Without this, an unexpected error thrown during render (a bad API
 * response shape, a null-reference bug, etc.) unmounts the whole React
 * tree and the visitor sees a blank white page with no way forward except
 * guessing to reload. This catches that, shows a branded fallback with a
 * reload action and a direct concierge contact, and logs the error so it's
 * visible in the browser console for debugging.
 *
 * Note: React error boundaries only catch errors thrown during render,
 * lifecycle methods, and constructors of the component tree below them —
 * not errors inside event handlers or async callbacks (those are handled
 * locally, e.g. the try/catch + error banners in CheckoutView/AdminView).
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled render error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDF4F1] px-4">
          <div className="max-w-md w-full text-center bg-white rounded-2xl border border-[#F0D9DC] shadow-sm p-8">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#241A1E] mb-2">
              Something Went Wrong
            </h1>
            <p className="text-xs sm:text-sm text-[#8C6A72] mb-6">
              We hit an unexpected error loading this page. Your cart and any completed
              orders are safe — this is just a display issue. Please try reloading.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-[#241A1E] hover:bg-[#3D2830] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-lg flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              {/* TODO: replace with JARRO's real WhatsApp number (currently a placeholder). */}
              <a
                href="https://wa.me/8801000000000?text=Hello%2C%20I%20ran%20into%20an%20error%20on%20the%20JARRO%20website."
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-[#EFC9CE] hover:bg-[#FBE8E4] text-[#241A1E] text-xs font-bold uppercase tracking-[0.2em] rounded-lg flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact Us</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
