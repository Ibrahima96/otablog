import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };
    props: any;

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono text-green-500 selection:bg-green-500 selection:text-black">
                    <div className="max-w-2xl w-full border border-green-500/30 p-8 rounded-lg bg-green-900/10 backdrop-blur-md relative overflow-hidden">
                        {/* Matrix Rain Effect Background (simplified) */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 0, .3) 25%, rgba(0, 255, 0, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, .3) 75%, rgba(0, 255, 0, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 0, .3) 25%, rgba(0, 255, 0, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, .3) 75%, rgba(0, 255, 0, .3) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}>
                        </div>

                        <div className="flex items-center gap-4 mb-6 border-b border-green-500/30 pb-4">
                            <AlertTriangle className="animate-pulse" size={48} />
                            <div>
                                <h1 className="text-3xl font-black tracking-widest uppercase">FATAL ERROR</h1>
                                <p className="text-green-500/70 text-sm">SYSTEM CRITICAL FAILURE DETECTED</p>
                            </div>
                        </div>

                        <div className="bg-black/50 p-4 rounded mb-6 border border-green-500/20 font-mono text-xs overflow-auto max-h-40">
                            <p className="text-red-500 mb-2">Error: {this.state.error?.message}</p>
                            <p className="opacity-50">Stack trace suppressed for security...</p>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="group flex items-center gap-2 px-6 py-3 bg-green-500/10 hover:bg-green-500 hover:text-black border border-green-500 transition-all uppercase tracking-widest font-bold text-sm w-full justification-center"
                        >
                            <RefreshCw className="group-hover:rotate-180 transition-transform duration-500" size={18} />
                            Reboot System
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
