import { Chip, type ChipProps } from "@mui/material";

const map: Record<string, { label: string; color: ChipProps["color"] }> = {
  NEW: { label: "New", color: "default" },
  IN_REVIEW: { label: "In review", color: "info" },
  NEEDS_INFO: { label: "Needs info", color: "warning" },
  APPROVED: { label: "Approved", color: "success" },
  REJECTED: { label: "Rejected", color: "error" },
  CLOSED: { label: "Closed", color: "default" },
};

export function StatusChip({ status }: { status: string }) {
  const v = map[status] ?? { label: status, color: "default" as const };
  return <Chip size="small" label={v.label} color={v.color} variant="outlined" />;
}
