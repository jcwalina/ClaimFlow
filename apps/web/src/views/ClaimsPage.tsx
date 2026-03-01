import React, { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box, Button, Card, CardContent, InputAdornment, MenuItem, Stack, TextField, Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { listClaims } from "../api/claims";
import { StatusChip } from "../ui/StatusChip";
import { PriorityChip } from "../ui/PriorityChip";
import { useAuth } from "../state/auth";
import { hasPermission, type Role } from "@claimflow/shared";

const STATUSES = ["", "NEW", "IN_REVIEW", "NEEDS_INFO", "APPROVED", "REJECTED", "CLOSED"];
const PRIORITIES = ["", "HIGH", "MEDIUM", "LOW"];

export function ClaimsPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [sp] = useSearchParams();

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState(sp.get("status") ?? "");
  const [priority, setPriority] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(15);

  const canWrite = user?.role ? hasPermission(user.role as Role, "claims:write") : false;

  const { data, isLoading, error } = useQuery({
    queryKey: ["claims", { search, status, priority, page, pageSize }],
    queryFn: () =>
      listClaims({
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined,
        page: page + 1,
        pageSize,
        sort: "updatedAt_desc",
      }),
  });

  const columns: GridColDef[] = useMemo(() => [
    { field: "claimantName", headerName: "Claimant", flex: 1.2, minWidth: 180 },
    { field: "policyNumber", headerName: "Policy #", flex: 0.8, minWidth: 130 },
    { field: "claimType", headerName: "Type", flex: 0.6, minWidth: 110 },
    {
      field: "status", headerName: "Status", flex: 0.7, minWidth: 130,
      renderCell: (p) => <StatusChip status={String(p.value)} />,
      sortable: false,
    },
    {
      field: "priority", headerName: "Priority", flex: 0.6, minWidth: 100,
      renderCell: (p) => <PriorityChip priority={String(p.value)} />,
      sortable: false,
    },
    {
      field: "assignedTo", headerName: "Assigned", flex: 0.8, minWidth: 140,
      valueGetter: (_value, row) => (row as Record<string, { name?: string }>).assignedTo?.name ?? "—",
      sortable: false,
    },
    {
      field: "updatedAt", headerName: "Updated", flex: 0.7, minWidth: 150,
      valueGetter: (value) => new Date(value as string).toLocaleDateString(),
    },
  ], []);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", md: "row" }} alignItems={{ md: "center" }} justifyContent="space-between" gap={1}>
        <Box>
          <Typography variant="h4">Claims</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {data ? `${data.total} total claims` : "Loading…"}
          </Typography>
        </Box>
        {canWrite && (
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => nav("/claims/new")}>
            Create claim
          </Button>
        )}
      </Stack>

      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} gap={1.5} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search by name, policy number, or claim ID…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ opacity: 0.5 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              select label="Status" value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
              sx={{ minWidth: 150 }}
            >
              {STATUSES.map(s => <MenuItem key={s} value={s}>{s || "All"}</MenuItem>)}
            </TextField>
            <TextField
              select label="Priority" value={priority}
              onChange={(e) => { setPriority(e.target.value); setPage(0); }}
              sx={{ minWidth: 140 }}
            >
              {PRIORITIES.map(p => <MenuItem key={p} value={p}>{p || "All"}</MenuItem>)}
            </TextField>
          </Stack>

          {error && <Typography color="error" sx={{ mb: 1 }}>Failed to load claims.</Typography>}

          <Box sx={{ height: 600 }}>
            <DataGrid
              rows={data?.items ?? []}
              columns={columns}
              getRowId={(r) => r.id}
              loading={isLoading}
              paginationMode="server"
              rowCount={data?.total ?? 0}
              paginationModel={{ page, pageSize }}
              onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }}
              pageSizeOptions={[10, 15, 25, 50]}
              disableRowSelectionOnClick
              onRowClick={(p) => nav(`/claims/${p.row.id}`)}
              sx={{
                border: "1px solid rgba(148,163,184,0.08)",
                borderRadius: 3,
                ".MuiDataGrid-columnHeaders": { borderBottomColor: "rgba(148,163,184,0.08)" },
                ".MuiDataGrid-cell": { borderBottomColor: "rgba(148,163,184,0.06)", cursor: "pointer" },
                ".MuiDataGrid-row:hover": { bgcolor: "rgba(124,58,237,0.04)" },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
