import React from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, Divider, Stack, TextField, Typography, alpha } from "@mui/material";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import { login } from "../api/auth";
import { useAuth } from "../state/auth";
import { ApiError } from "../api/http";

const DEMO_PASSWORD = "demo123";

const presets = [
  { label: "Admin", email: "admin@demo.com", color: "#7C3AED" },
  { label: "Supervisor", email: "supervisor@demo.com", color: "#3B82F6" },
  { label: "Caseworker", email: "caseworker@demo.com", color: "#22C55E" },
  { label: "Read-only", email: "readonly@demo.com", color: "#94A3B8" },
];

export function LoginPage() {
  const nav = useNavigate();
  const { refresh } = useAuth();
  const [email, setEmail] = React.useState("admin@demo.com");
  const [password, setPassword] = React.useState(DEMO_PASSWORD);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      await refresh();
      nav("/", { replace: true });
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,0.25), transparent 80%)",
      }}
    >
      <Card sx={{ width: "min(460px, calc(100% - 32px))", border: "1px solid rgba(148,163,184,0.12)" }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 1 }}>
            <ShieldRoundedIcon sx={{ color: "primary.main", fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
              ClaimFlow
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
            Enterprise claims workflow management. Sign in to continue.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" fullWidth />
              <TextField label="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" fullWidth />
              <Button variant="contained" type="submit" disabled={loading} size="large" sx={{ py: 1.3 }}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>Demo accounts</Typography>
          </Divider>

          <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center">
            {presets.map(p => (
              <Button
                key={p.email} variant="outlined" size="small"
                onClick={() => { setEmail(p.email); setPassword(DEMO_PASSWORD); }}
                sx={{ borderColor: alpha(p.color, 0.4), color: p.color, "&:hover": { borderColor: p.color, bgcolor: alpha(p.color, 0.08) } }}
              >
                {p.label}
              </Button>
            ))}
          </Stack>

          <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: 2, color: "text.secondary" }}>
            All demo passwords: <code>{DEMO_PASSWORD}</code>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
