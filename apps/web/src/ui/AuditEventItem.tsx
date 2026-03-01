import { Box, Chip, Stack, Typography } from "@mui/material";
import { AUDIT_EVENT_LABELS, formatAuditDetail } from "@claimflow/shared";

interface AuditEventItemProps {
  event: {
    id: string;
    type: string;
    claimId?: string | null;
    actor: { name: string; role: string };
    metadata: Record<string, unknown>;
    createdAt: string;
  };
  onClick?: () => void;
  showClaim?: boolean;
}

export function AuditEventItem({ event, onClick, showClaim }: AuditEventItemProps) {
  const detail = formatAuditDetail(event.type, event.metadata);

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1.5}
      onClick={onClick}
      sx={{
        py: 1.2, px: 1.5, borderRadius: 2,
        cursor: onClick ? "pointer" : "default",
        "&:hover": onClick ? { bgcolor: "rgba(148,163,184,0.05)" } : {},
      }}
    >
      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main", flexShrink: 0 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" gap={0.8} flexWrap="wrap">
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {AUDIT_EVENT_LABELS[event.type] ?? event.type}
          </Typography>
          {detail && <Chip label={detail} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.65rem" }} />}
          {showClaim && event.claimId && (
            <Chip label={`Claim: ${event.claimId.slice(0, 8)}…`} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.65rem" }} />
          )}
        </Stack>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {event.actor.name} ({event.actor.role}) · {new Date(event.createdAt).toLocaleString()}
        </Typography>
      </Box>
    </Stack>
  );
}
