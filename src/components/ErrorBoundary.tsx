import React, { Component, ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-16 w-16 text-destructive" />
              </div>
              <CardTitle className="text-3xl">Something went wrong</CardTitle>
              <CardDescription className="text-base mt-2">
                We encountered an unexpected error. Don't worry, your data is safe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-mono text-sm text-muted-foreground break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold mb-2">Try one of these options:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Reload the page to recover from temporary issues</li>
                  <li>Go back to the home page and try again</li>
                  <li>Clear your browser cache if the problem persists</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 justify-center flex-wrap">
              <Button onClick={this.handleReload} variant="default" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>
              <Button onClick={this.handleGoHome} variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Go to Home
              </Button>
              <Button onClick={this.handleReset} variant="ghost">
                Try Again
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
