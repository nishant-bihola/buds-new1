import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary] ERROR:", error.message);
    console.error("[ErrorBoundary] STACK:", error.stack);
    console.error("[ErrorBoundary] COMPONENT STACK:", info.componentStack);
    this.props.onError?.(error);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div className="w-full h-full flex items-center justify-center min-h-[200px]" />
      );
    }
    return this.props.children;
  }
}
