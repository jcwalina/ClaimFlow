import React from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";

interface Props {
  children: React.ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: "grid", placeItems: "center", minHeight: "60vh", p: 3 }}>
          <Stack spacing={2} alignItems="center" sx={{ maxWidth: 480 }}>
            <Typography variant="h5">Something went wrong</Typography>
            <Alert severity="error" sx={{ width: "100%" }}>
              {this.state.error?.message ?? "An unexpected error occurred."}
            </Alert>
            <Button
              variant="contained"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/";
              }}
            >
              Return to Dashboard
            </Button>
          </Stack>
        </Box>
      );
    }
    return this.props.children;
  }
}
