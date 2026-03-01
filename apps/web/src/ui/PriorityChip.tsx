import { Chip } from "@mui/material";

const map: Record<string, { label: string; color: "error" | "warning" | "info" | "default" }> = {
  HIGH: { label: "High", color: "error" },
  MEDIUM: { label: "Medium", color: "warning" },
  LOW: { label: "Low", color: "info" },
};

export function PriorityChip({ priority }: { priority: string }) {
  const v = map[priority] ?? { label: priority, color: "default" as const };
  return <Chip size="small" label={v.label} color={v.color} variant="outlined" />;
}
