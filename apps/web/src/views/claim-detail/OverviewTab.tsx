import { Alert, Box, Button, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transitionClaim } from "../../api/claims";
import { PriorityChip } from "../../ui/PriorityChip";
import { ALLOWED_TRANSITIONS } from "@claimflow/shared";
import type { Claim } from "@claimflow/shared";
import { ApiError } from "../../api/http";

interface OverviewTabProps {
  claim: Claim;
  canTransition: boolean;
  isApprover: boolean;
}

export function OverviewTab({ claim, canTransition, isApprover }: OverviewTabProps) {
  const qc = useQueryClient();

  const transitionM = useMutation({
    mutationFn: (to: string) => transitionClaim(claim.id, to),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["claim", claim.id] });
      qc.invalidateQueries({ queryKey: ["audit"] });
      qc.invalidateQueries({ queryKey: ["claim", claim.id, "tasks"] });
    },
  });

  const allowedNext = ALLOWED_TRANSITIONS[claim.status] ?? [];

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>Priority</Typography>
          <Box><PriorityChip priority={claim.priority} /></Box>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>Assigned to</Typography>
          <Typography sx={{ fontWeight: 700 }}>{claim.assignedTo?.name ?? "Unassigned"}</Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>Claim Type</Typography>
          <Typography sx={{ fontWeight: 700 }}>{claim.claimType}</Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>Amount</Typography>
          <Typography sx={{ fontWeight: 700 }}>
            {claim.amountClaimed != null
              ? `€ ${claim.amountClaimed.toLocaleString("de-DE", { minimumFractionDigits: 2 })}`
              : "—"}
          </Typography>
        </Grid>
        {claim.icdCode && (
          <Grid item xs={6} md={3}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>ICD Code</Typography>
            <Typography sx={{ fontWeight: 700 }}>{claim.icdCode}</Typography>
          </Grid>
        )}
        {claim.dateOfService && (
          <Grid item xs={6} md={3}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>Date of Service</Typography>
            <Typography sx={{ fontWeight: 700 }}>{new Date(claim.dateOfService).toLocaleDateString()}</Typography>
          </Grid>
        )}
        <Grid item xs={12}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>Description</Typography>
          <Typography sx={{ fontWeight: 500 }}>{claim.description || "No description provided."}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>Created</Typography>
          <Typography variant="body2">{new Date(claim.createdAt).toLocaleString()}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>Last Updated</Typography>
          <Typography variant="body2">{new Date(claim.updatedAt).toLocaleString()}</Typography>
        </Grid>
      </Grid>

      {canTransition && allowedNext.length > 0 && (
        <Card sx={{ bgcolor: "rgba(255,255,255,0.02)" }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Workflow Transitions</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>
              Transitions are enforced server-side. Approve/Reject requires Supervisor or Admin role.
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {allowedNext.map(to => {
                const restricted = (to === "APPROVED" || to === "REJECTED") && !isApprover;
                return (
                  <Button
                    key={to}
                    variant="outlined"
                    size="small"
                    disabled={transitionM.isPending || restricted}
                    onClick={() => transitionM.mutate(to)}
                    color={to === "APPROVED" ? "success" : to === "REJECTED" ? "error" : "inherit"}
                  >
                    → {to.replace("_", " ")}
                  </Button>
                );
              })}
            </Stack>
            {transitionM.error && (
              <Alert severity="error" sx={{ mt: 1.5 }}>
                {transitionM.error instanceof ApiError ? transitionM.error.message : "Transition failed"}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
