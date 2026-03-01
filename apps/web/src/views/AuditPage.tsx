import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { listAudit } from "../api/audit";
import { AuditEventItem } from "../ui/AuditEventItem";
import { AUDIT_EVENT_LABELS, AUDIT_EVENT_TYPES } from "@claimflow/shared";

const PAGE_SIZE = 30;

export function AuditPage() {
  const nav = useNavigate();
  const [type, setType] = React.useState("");
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["audit-global", { type, page }],
    queryFn: () => listAudit({ type: type || undefined, page, pageSize: PAGE_SIZE }),
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h4">Audit Log</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {data ? `${data.total} events total` : "Loading…"} — every action is recorded for traceability.
        </Typography>
      </Box>

      <Stack direction="row" gap={1.5}>
        <TextField
          select size="small" label="Event type" value={type}
          onChange={(e) => { setType(e.target.value); setPage(1); }}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          {AUDIT_EVENT_TYPES.map(t => (
            <MenuItem key={t} value={t}>{AUDIT_EVENT_LABELS[t]}</MenuItem>
          ))}
        </TextField>
      </Stack>

      <Stack spacing={1}>
        {isLoading ? (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>Loading…</Typography>
        ) : data?.items?.length ? (
          data.items.map(e => (
            <Card
              key={e.id}
              sx={{
                cursor: e.claimId ? "pointer" : "default",
                "&:hover": e.claimId ? { borderColor: "primary.main" } : {},
              }}
              onClick={() => e.claimId && nav(`/claims/${e.claimId}`)}
            >
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <AuditEventItem
                  event={{ ...e, metadata: e.metadata as Record<string, unknown> }}
                  showClaim
                />
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent>
              <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center" }}>
                No audit events found.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Stack>

      {totalPages > 1 && (
        <Stack direction="row" justifyContent="center" gap={1} alignItems="center">
          <Button
            variant="outlined" size="small"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Page {page} of {totalPages}
          </Typography>
          <Button
            variant="outlined" size="small"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
