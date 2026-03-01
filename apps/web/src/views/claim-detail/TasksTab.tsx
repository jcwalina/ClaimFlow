import React from "react";
import {
  Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, MenuItem, Stack, TextField, Tooltip, Typography,
} from "@mui/material";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listClaimTasks, createTask, updateTask } from "../../api/tasks";
import { TASK_TYPE_LABELS } from "@claimflow/shared";

interface TasksTabProps {
  claimId: string;
  canWrite: boolean;
}

const taskTypes = Object.entries(TASK_TYPE_LABELS);

export function TasksTab({ claimId, canWrite }: TasksTabProps) {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState({ type: "REQUEST_INFO", title: "", dueDate: "" });

  const tasksQ = useQuery({
    queryKey: ["claim", claimId, "tasks"],
    queryFn: () => listClaimTasks(claimId),
  });

  const createM = useMutation({
    mutationFn: () => createTask(claimId, { type: form.type, title: form.title, dueDate: form.dueDate || undefined }),
    onSuccess: () => {
      setDialogOpen(false);
      setForm({ type: "REQUEST_INFO", title: "", dueDate: "" });
      qc.invalidateQueries({ queryKey: ["claim", claimId, "tasks"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
    },
  });

  const closeM = useMutation({
    mutationFn: (taskId: string) => updateTask(taskId, { status: "CLOSED" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["claim", claimId, "tasks"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
    },
  });

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2">Tasks ({tasksQ.data?.items?.length ?? 0})</Typography>
        {canWrite && (
          <Button variant="outlined" size="small" onClick={() => setDialogOpen(true)}>
            Create task
          </Button>
        )}
      </Stack>

      <Stack spacing={1.5}>
        {tasksQ.data?.items?.length ? (
          tasksQ.data.items.map(t => (
            <Card key={t.id} sx={{ bgcolor: "rgba(255,255,255,0.02)" }}>
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography sx={{ fontWeight: 700 }}>{t.title}</Typography>
                      <Chip label={TASK_TYPE_LABELS[t.type] ?? t.type} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.65rem" }} />
                      <Chip
                        label={t.status}
                        size="small"
                        color={t.status === "OPEN" ? "warning" : "success"}
                        sx={{ height: 20, fontSize: "0.65rem" }}
                      />
                    </Stack>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {t.dueDate ? `Due: ${new Date(t.dueDate).toLocaleDateString()}` : "No due date"}
                      {t.assignedTo ? ` · ${t.assignedTo.name}` : ""}
                    </Typography>
                  </Box>
                  {t.status === "OPEN" && canWrite && (
                    <Tooltip title="Close task">
                      <IconButton size="small" color="success" onClick={() => closeM.mutate(t.id)} disabled={closeM.isPending}>
                        <CheckCircleOutlineRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>No tasks for this claim.</Typography>
        )}
      </Stack>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select label="Type" value={form.type}
              onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
            >
              {taskTypes.map(([value, label]) => (
                <MenuItem key={value} value={value}>{label}</MenuItem>
              ))}
            </TextField>
            <TextField label="Title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
            <TextField
              label="Due date" type="date" value={form.dueDate}
              onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => createM.mutate()} disabled={createM.isPending || !form.title.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
