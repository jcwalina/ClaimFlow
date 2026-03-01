import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, Card, CardContent, Chip, IconButton, MenuItem, Stack, TextField,
  Tooltip, Typography,
} from "@mui/material";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listTasks, updateTask, type TaskWithClaim } from "../api/tasks";
import { useAuth } from "../state/auth";
import { hasPermission, TASK_TYPE_LABELS, type Role } from "@claimflow/shared";

function TaskCard({ task, canWrite, onClose, onNavigate }: {
  task: TaskWithClaim;
  canWrite: boolean;
  onClose: (id: string) => void;
  onNavigate: (claimId: string) => void;
}) {
  const isOverdue = task.status === "OPEN" && task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <Card sx={{ borderColor: isOverdue ? "error.main" : undefined, borderWidth: isOverdue ? 1 : undefined }}>
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
              <Typography sx={{ fontWeight: 700 }}>{task.title}</Typography>
              <Chip label={TASK_TYPE_LABELS[task.type] ?? task.type} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.65rem" }} />
              <Chip
                label={task.status}
                size="small"
                color={task.status === "OPEN" ? (isOverdue ? "error" : "warning") : "success"}
                sx={{ height: 20, fontSize: "0.65rem" }}
              />
              {isOverdue && <Chip label="OVERDUE" size="small" color="error" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 800 }} />}
            </Stack>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {task.claim?.claimantName ?? ""} · {task.claim?.policyNumber ?? ""}
              {task.dueDate ? ` · Due: ${new Date(task.dueDate).toLocaleDateString()}` : ""}
              {task.assignedTo ? ` · ${task.assignedTo.name}` : ""}
            </Typography>
          </Box>
          <Stack direction="row" gap={0.5}>
            {task.status === "OPEN" && canWrite && (
              <Tooltip title="Close task">
                <IconButton size="small" color="success" onClick={() => onClose(task.id)}>
                  <CheckCircleOutlineRoundedIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Go to claim">
              <IconButton size="small" onClick={() => onNavigate(task.claimId)}>
                <OpenInNewRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function TasksPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const role = (user?.role ?? "READ_ONLY") as Role;
  const canWrite = hasPermission(role, "claims:write");

  const [statusFilter, setStatusFilter] = React.useState("OPEN");
  const [mineOnly, setMineOnly] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["tasks", { status: statusFilter, mine: mineOnly }],
    queryFn: () => listTasks({ status: statusFilter || undefined, mine: mineOnly, pageSize: 50 }),
  });

  const closeM = useMutation({
    mutationFn: (taskId: string) => updateTask(taskId, { status: "CLOSED" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h4">Tasks</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {data ? `${data.total} tasks found` : "Loading…"}
        </Typography>
      </Box>

      <Stack direction="row" gap={1.5} flexWrap="wrap">
        <TextField
          select size="small" label="Status" value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="OPEN">Open</MenuItem>
          <MenuItem value="CLOSED">Closed</MenuItem>
        </TextField>
        <Button
          variant={mineOnly ? "contained" : "outlined"} size="small"
          onClick={() => setMineOnly(!mineOnly)}
        >
          {mineOnly ? "My Tasks" : "All Tasks"}
        </Button>
      </Stack>

      <Stack spacing={1.5}>
        {isLoading ? (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>Loading tasks…</Typography>
        ) : data?.items?.length ? (
          data.items.map(t => (
            <TaskCard
              key={t.id}
              task={t}
              canWrite={canWrite}
              onClose={(id) => closeM.mutate(id)}
              onNavigate={(claimId) => nav(`/claims/${claimId}`)}
            />
          ))
        ) : (
          <Card>
            <CardContent>
              <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center" }}>
                No tasks found.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Stack>
  );
}
