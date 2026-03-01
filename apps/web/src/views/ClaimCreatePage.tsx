import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert, Button, Card, CardContent, Divider, Grid, MenuItem, Stack,
  Step, StepLabel, Stepper, TextField, Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClaim } from "../api/claims";
import { CLAIM_TYPE_LABELS } from "@claimflow/shared";

const steps = ["Applicant", "Coverage & Details", "Review & Submit"];
const claimTypeOptions = Object.entries(CLAIM_TYPE_LABELS);

export function ClaimCreatePage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [active, setActive] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    claimantName: "",
    policyNumber: "",
    claimType: "GENERAL",
    icdCode: "",
    dateOfService: "",
    amountClaimed: "",
    description: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
  });

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  const createM = useMutation({
    mutationFn: () => {
      setError(null);
      return createClaim({
        claimantName: form.claimantName,
        policyNumber: form.policyNumber,
        claimType: form.claimType,
        icdCode: form.icdCode || undefined,
        dateOfService: form.dateOfService || undefined,
        amountClaimed: form.amountClaimed ? Number(form.amountClaimed) : undefined,
        description: form.description || undefined,
        priority: form.priority,
      });
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["claims"] });
      nav(`/claims/${res.id}`, { replace: true });
    },
    onError: (err: Error) => setError(err.message),
  });

  const canNext =
    (active === 0 && form.claimantName.trim().length >= 2 && form.policyNumber.trim().length >= 5) ||
    (active === 1) ||
    (active === 2);

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Create Claim</Typography>

      <Card>
        <CardContent>
          <Stepper activeStep={active} sx={{ mb: 3 }}>
            {steps.map(s => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
          </Stepper>

          <Divider sx={{ mb: 3 }} />

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {active === 0 && (
            <Stack spacing={2.5}>
              <Typography variant="h6">Applicant Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth label="Claimant Name" value={form.claimantName}
                    onChange={(e) => update("claimantName", e.target.value)}
                    helperText="Full name of the insured person (min 2 chars)" required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth label="Policy Number" value={form.policyNumber}
                    onChange={(e) => update("policyNumber", e.target.value)}
                    helperText="Insurance policy number (e.g. TK-88301)" required
                  />
                </Grid>
              </Grid>
            </Stack>
          )}

          {active === 1 && (
            <Stack spacing={2.5}>
              <Typography variant="h6">Coverage & Claim Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    select fullWidth label="Claim Type" value={form.claimType}
                    onChange={(e) => update("claimType", e.target.value)}
                  >
                    {claimTypeOptions.map(([value, label]) => (
                      <MenuItem key={value} value={value}>{label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select fullWidth label="Priority" value={form.priority}
                    onChange={(e) => update("priority", e.target.value)}
                  >
                    <MenuItem value="LOW">Low</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="HIGH">High</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth label="ICD Code (optional)" value={form.icdCode}
                    onChange={(e) => update("icdCode", e.target.value)}
                    helperText="ICD-10 diagnosis code, e.g. M54.5"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth label="Date of Service" type="date" value={form.dateOfService}
                    onChange={(e) => update("dateOfService", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth label="Amount Claimed (€)" type="number" value={form.amountClaimed}
                    onChange={(e) => update("amountClaimed", e.target.value)}
                    helperText="Requested reimbursement amount"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth multiline minRows={3} label="Description (optional)" value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    helperText="Additional details about the claim"
                  />
                </Grid>
              </Grid>
            </Stack>
          )}

          {active === 2 && (
            <Stack spacing={2}>
              <Typography variant="h6">Review & Submit</Typography>
              <Card sx={{ bgcolor: "rgba(255,255,255,0.02)" }}>
                <CardContent>
                  <Grid container spacing={1.5}>
                    <Grid item xs={6}><Typography variant="caption" color="text.secondary">Claimant</Typography><Typography sx={{ fontWeight: 700 }}>{form.claimantName}</Typography></Grid>
                    <Grid item xs={6}><Typography variant="caption" color="text.secondary">Policy #</Typography><Typography sx={{ fontWeight: 700 }}>{form.policyNumber}</Typography></Grid>
                    <Grid item xs={6}><Typography variant="caption" color="text.secondary">Type</Typography><Typography sx={{ fontWeight: 700 }}>{CLAIM_TYPE_LABELS[form.claimType] ?? form.claimType}</Typography></Grid>
                    <Grid item xs={6}><Typography variant="caption" color="text.secondary">Priority</Typography><Typography sx={{ fontWeight: 700 }}>{form.priority}</Typography></Grid>
                    {form.icdCode && <Grid item xs={6}><Typography variant="caption" color="text.secondary">ICD</Typography><Typography sx={{ fontWeight: 700 }}>{form.icdCode}</Typography></Grid>}
                    {form.dateOfService && <Grid item xs={6}><Typography variant="caption" color="text.secondary">Service Date</Typography><Typography sx={{ fontWeight: 700 }}>{form.dateOfService}</Typography></Grid>}
                    {form.amountClaimed && <Grid item xs={6}><Typography variant="caption" color="text.secondary">Amount</Typography><Typography sx={{ fontWeight: 700 }}>€ {Number(form.amountClaimed).toLocaleString("de-DE", { minimumFractionDigits: 2 })}</Typography></Grid>}
                    {form.description && <Grid item xs={12}><Typography variant="caption" color="text.secondary">Description</Typography><Typography>{form.description}</Typography></Grid>}
                  </Grid>
                </CardContent>
              </Card>
            </Stack>
          )}

          <Divider sx={{ my: 3 }} />

          <Stack direction="row" justifyContent="space-between">
            <Button variant="outlined" onClick={active === 0 ? () => nav("/claims") : () => setActive(a => a - 1)}>
              {active === 0 ? "Cancel" : "Back"}
            </Button>
            {active < 2 ? (
              <Button variant="contained" onClick={() => setActive(a => a + 1)} disabled={!canNext}>
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => createM.mutate()}
                disabled={createM.isPending || !form.claimantName || !form.policyNumber}
              >
                {createM.isPending ? "Creating…" : "Create Claim"}
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
