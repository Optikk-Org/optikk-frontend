import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@optikk/design-system';

export interface FeatureErrorBoundaryProps {
  children: React.ReactNode;
  featureName: string;
  onError?: (error: Error, featureName: string) => void;
}

interface State {
  error: Error | null;
}

export class FeatureErrorBoundary extends React.Component<FeatureErrorBoundaryProps, State> {
  constructor(props: FeatureErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[Telemetry] Feature crash in ${this.props.featureName}:`, error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, this.props.featureName);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="flex flex-col items-center justify-center p-6 border rounded-md"
          style={{
            borderColor: 'var(--color-error, #ef4444)',
            backgroundColor: 'var(--bg-surface, #1e1e24)',
          }}
        >
          <AlertCircle color="var(--color-error, #ef4444)" className="mb-2" size={32} />
          <h3
            className="text-md font-semibold mt-2"
            style={{ color: 'var(--color-error, #ef4444)' }}
          >
            Module Unavailable: {this.props.featureName}
          </h3>
          <p className="text-sm mt-1 mb-4" style={{ color: 'var(--text-secondary, #a1a1aa)' }}>
            This feature encountered an unexpected error and has been isolated.
          </p>
          <Button variant="secondary" onClick={() => this.setState({ error: null })}>
            Retry Module
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
