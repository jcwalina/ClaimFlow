import React, { useMemo } from "react";
import {
  Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent,
  DialogTitle, MenuItem, Stack, TextField, Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminCreateUser, adminListUsers, adminUpdateUser } from "../api/admin";
import { useAuth } from "../state/auth";
import { Roles } from "@claimflow/shared";

export function AdminUsersPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("CASEWORKER");
  const [password, setPassword] = React.useState("");

  const q = useQuery({ queryKey: ["admin-users"], queryFn: adminListUsers });

  const createM = useMutation({
    mutationFn: () => adminCreateUser({ email, name, role, password }),
    onSuccess: () => {
      setOpen(false);
      setEmail(""); setName(""); setRole("CASEWORKER"); setPassword("");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const updateM = useMutation({
    mutationFn: (p: { id: string; role: string }) => adminUpdateUser(p.id, { role: p.role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  if (user?.role !== "ADMIN") return <Alert severity="error">Admin access required.</Alert>;

  const columns: GridColDef[] = useMemo(() => [
    { field: "email", headerName: "Email", flex: 1.2, minWidth: 220 },
    { field: "name", headerName: "Name", flex: 0.9, minWidth: 160 },
    {
      field: "role", headerName: "Role", flex: 0.7, minWidth: 160,
      renderCell: (p) => (
        <TextField
          select size="small" value={p.value}
          onChange={(e) => updateM.mutate({ id: p.row.id, role: e.target.value })}
          sx={{ minWidth: 150 }}
        >
          {Roles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
        </TextField>
      ),
      sortable: false,
    },
    {
      field: "createdAt", headerName: "Created", flex: 0.7, minWidth: 170,
      valueGetter: (value) => new Date(value as string).toLocaleDateString(),
    },
  ], [updateM]);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} gap={1}>
        <Box>
          <Typography variant="h4">Admin · Users</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Manage user accounts and role assignments.
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => setOpen(true)}>Create user</Button>
      </Stack>

      {q.error && <Alert severity="error">Failed to load users.</Alert>}

      <Card>
        <CardContent>
          <Box sx={{ height: 560 }}>
            <DataGrid
              rows={q.data?.items ?? []}
              columns={columns}
              getRowId={(r) => r.id}
              loading={q.isLoading}
              disableRowSelectionOnClick
              sx={{
                border: "1px solid rgba(148,163,184,0.08)",
                borderRadius: 3,
                ".MuiDataGrid-columnHeaders": { borderBottomColor: "rgba(148,163,184,0.08)" },
                ".MuiDataGrid-cell": { borderBottomColor: "rgba(148,163,184,0.06)" },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <TextField select label="Role" value={role} onChange={(e) => setRole(e.target.value)} fullWidth>
              {Roles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
            <TextField
              label="Password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Minimum 6 characters" fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} variant="outlined">Cancel</Button>
          <Button
            onClick={() => createM.mutate()} variant="contained"
            disabled={createM.isPending || !email || !name || password.length < 6}
          >
            {createM.isPending ? "Creating…" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
