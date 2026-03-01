import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, Grid, IconButton, MenuItem, Stack, Tab, Tabs,
  TextField, Tooltip, Typography, alpha,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignClaim, getClaim } from "../api/claims";
import { listUsers } from "../api/users";
import { StatusChip } from "../ui/StatusChip";
import { PriorityChip } from "../ui/PriorityChip";
import { useAuth } from "../state/auth";
import { hasPermission, type Role } from "@claimflow/shared";
import { OverviewTab } from "./claim-detail/OverviewTab";
import { NotesTab } from "./claim-detail/NotesTab";
import { TasksTab } from "./claim-detail/TasksTab";
import { AttachmentsTab } from "./claim-detail/AttachmentsTab";
import { AuditTab } from "./claim-detail/AuditTab";

export function ClaimDetailPage() {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();

  const [tab, setTab] = React.useState(0);
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [assignee, setAssignee] = React.useState("");

  const role = (user?.role ?? "READ_ONLY") as Role;
  const canWrite = hasPermission(role, "claims:write");
  const canAssign = hasPermission(role, "claims:assign");
  const canTransition = hasPermission(role, "claims:transition");
  const isApprover = role === "SUPERVISOR" || role === "ADMIN";

  const claimQ = useQuery({ queryKey: ["claim", id], queryFn: () => getClaim(id), enabled: !!id });
  const usersQ = useQuery({ queryKey: ["users"], queryFn: listUsers, enabled: canAssign });

  const assignM = useMutation({
    mutationFn: () => assignClaim(id, assignee),
    onSuccess: () => {
      setAssignOpen(false);
      qc.invalidateQueries({ queryKey: ["claim", id] });
      qc.invalidateQueries({ queryKey: ["audit"] });
    },
  });

  if (claimQ.isLoading) {
    return <Typography sx={{ color: "text.secondary" }}>Loading claim…</Typography>;
  }
  if (claimQ.error) return <Alert severity="error">Could not load claim.</Alert>;

  const claim = claimQ.data!;

  return (
    <Stack spacing={2}>
      {/* Header */}
      <Stack direction="row" alignItems="center" gap={1}>
        <IconButton onClick={() => nav("/claims")} size="small">
          <ArrowBackRoundedIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Typography variant="h4">{claim.claimantName}</Typography>
            <StatusChip status={claim.status} />
            <PriorityChip priority={claim.priority} />
          </Stack>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {claim.policyNumber} · {claim.claimType} · ID: {claim.id}
          </Typography>
        </Box>
        {canAssign && (
          <Tooltip title="Assign claim">
            <Button
              variant="outlined"
              startIcon={<PersonAddAltRoundedIcon />}
              onClick={() => { setAssignee(claim.assignedTo?.id ?? ""); setAssignOpen(true); }}
              size="small"
            >
              {claim.assignedTo ? "Reassign" : "Assign"}
            </Button>
          </Tooltip>
        )}
      </Stack>

      <Grid container spacing={2}>
        {/* Main content area with tabs */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
                <Tab label="Overview" />
                <Tab label="Notes" />
                <Tab label="Tasks" />
                <Tab label="Attachments" />
                <Tab label="Audit" />
              </Tabs>
              <Divider sx={{ mb: 2 }} />

              {tab === 0 && <OverviewTab claim={claim} canTransition={canTransition} isApprover={isApprover} />}
              {tab === 1 && <NotesTab claimId={id} canWrite={canWrite} />}
              {tab === 2 && <TasksTab claimId={id} canWrite={canWrite} />}
              {tab === 3 && <AttachmentsTab claimId={id} canWrite={canWrite} />}
              {tab === 4 && <AuditTab claimId={id} />}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Quick Info</Typography>
                <Stack spacing={1.2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>Status</Typography>
                    <StatusChip status={claim.status} />
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>Priority</Typography>
                    <PriorityChip priority={claim.priority} />
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>Assigned</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {claim.assignedTo?.name ?? "Unassigned"}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.04) }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: "primary.main", mb: 0.5 }}>
                  Reviewer Note
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                  This detail page demonstrates tabbed navigation, RBAC-controlled actions,
                  audit trail, and task management — all backed by server-enforced rules.
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Assign dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Assign Claim</DialogTitle>
        <DialogContent>
          <TextField
            select fullWidth label="Select user"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            sx={{ mt: 1 }}
          >
            {(usersQ.data?.items ?? []).map(u => (
              <MenuItem key={u.id} value={u.id}>{u.name} ({u.role})</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => assignM.mutate()}
            disabled={assignM.isPending || !assignee}
          >
            {assignM.isPending ? "Assigning…" : "Assign"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
