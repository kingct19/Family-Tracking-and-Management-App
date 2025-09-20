import { Component, ErrorInfo, ReactNode } from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ error, errorInfo });

        // Log error to monitoring service in production
        if (import.meta.env.PROD) {
            console.error('Error caught by boundary:', error, errorInfo);
            // TODO: Send to Sentry or similar service
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-md">
                        <div className="text-center">
                            <FiAlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                            <h1 className="mt-6 text-2xl font-bold text-gray-900">Something went wrong</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                We&apos;re sorry, but something unexpected happened. Please try again.
                            </p>

                            {import.meta.env.DEV && this.state.error && (
                                <details className="mt-4 text-left">
                                    <summary className="cursor-pointer text-sm font-medium text-gray-700">
                                        Error Details (Development Only)
                                    </summary>
                                    <div className="mt-2 p-4 bg-gray-100 rounded-md text-xs font-mono text-gray-800">
                                        <div className="mb-2">
                                            <strong>Error:</strong> {this.state.error.message}
                                        </div>
                                        <div className="mb-2">
                                            <strong>Stack:</strong>
                                            <pre className="whitespace-pre-wrap mt-1">
                                                {this.state.error.stack}
                                            </pre>
                                        </div>
                                        {this.state.errorInfo && (
                                            <div>
                                                <strong>Component Stack:</strong>
                                                <pre className="whitespace-pre-wrap mt-1">
                                                    {this.state.errorInfo.componentStack}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </details>
                            )}

                            <div className="mt-6">
                                <button
                                    onClick={this.handleRetry}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <FiRefreshCw className="w-4 h-4 mr-2" />
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
