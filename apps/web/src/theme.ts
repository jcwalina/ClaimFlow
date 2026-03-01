import { createTheme, alpha } from "@mui/material/styles";

export const theme = createTheme({
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    h4: { fontWeight: 800, letterSpacing: -0.5 },
    h5: { fontWeight: 700, letterSpacing: -0.3 },
    h6: { fontWeight: 700, letterSpacing: -0.2 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, letterSpacing: 0.2 },
  },
  palette: {
    mode: "dark",
    background: {
      default: "#06090F",
      paper: "#0D1117",
    },
    primary: { main: "#7C3AED" },
    secondary: { main: "#22D3EE" },
    success: { main: "#22C55E" },
    warning: { main: "#F59E0B" },
    error: { main: "#EF4444" },
    info: { main: "#3B82F6" },
    divider: "rgba(148,163,184,0.10)",
    text: {
      primary: "#F1F5F9",
      secondary: "#94A3B8",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(148,163,184,0.15) transparent",
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": { background: "rgba(148,163,184,0.15)", borderRadius: 3 },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(148,163,184,0.08)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid rgba(148,163,184,0.08)",
          backgroundImage: "none",
          backgroundColor: "#0D1117",
          boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none" as const, fontWeight: 600, borderRadius: 10 },
        containedPrimary: {
          background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
          boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
          "&:hover": {
            background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
            boxShadow: "0 6px 20px rgba(124,58,237,0.45)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: "none" as const, fontWeight: 600, minHeight: 44 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
          backgroundColor: "#111827",
          border: "1px solid rgba(148,163,184,0.12)",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: alpha("#1E293B", 0.95),
          border: "1px solid rgba(148,163,184,0.12)",
          fontSize: "0.75rem",
          fontWeight: 500,
        },
      },
    },
  },
});
