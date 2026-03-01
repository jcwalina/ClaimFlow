import { Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { listAudit } from "../../api/audit";
import { AuditEventItem } from "../../ui/AuditEventItem";

interface AuditTabProps {
  claimId: string;
}

export function AuditTab({ claimId }: AuditTabProps) {
  const auditQ = useQuery({
    queryKey: ["audit", { claimId }],
    queryFn: () => listAudit({ claimId, pageSize: 50 }),
  });

  return (
    <Stack spacing={1.5}>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
        Complete audit trail — every action is logged for traceability.
      </Typography>
      {auditQ.data?.items?.length ? (
        auditQ.data.items.map(e => (
          <AuditEventItem
            key={e.id}
            event={{ ...e, metadata: e.metadata as Record<string, unknown> }}
          />
        ))
      ) : (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>No audit events.</Typography>
      )}
    </Stack>
  );
}
