import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          {/* [MODIFIED] Wrapped component in a Card for UI consistency */}
          <Card className="max-w-lg w-full shadow-xl border-destructive/50">
            <CardHeader className="text-center items-center pt-8">
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto border-4 border-destructive/20">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
              <CardTitle className="text-2xl pt-4">
                Something went wrong
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">
                We apologize for the inconvenience. An unexpected error occurred.
              </p>

              {/* [MODIFIED] Improved styling for development error message */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <details className="text-left">
                      <summary className="cursor-pointer font-medium mb-2">
                        Error Details (Development Only)
                      </summary>
                      <pre className={cn(
                        "text-xs overflow-auto rounded-md p-3 bg-muted border",
                        "font-mono"
                      )}>
                        {this.state.error.message}
                        {'\n'}
                        {this.state.error.stack}
                      </pre>
                    </details>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button onClick={this.handleRetry} variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={() => window.location.reload()} className="w-full">
                Reload Page
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;