import React from "react";
import {
  Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent,
  DialogTitle, Stack, TextField, Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addAttachmentMeta, listAttachments, type Attachment } from "../../api/claims";

interface AttachmentsTabProps {
  claimId: string;
  canWrite: boolean;
}

const INITIAL_FORM = { filename: "", mimeType: "application/pdf", size: 0 };

export function AttachmentsTab({ claimId, canWrite }: AttachmentsTabProps) {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState(INITIAL_FORM);

  const attQ = useQuery({
    queryKey: ["claim", claimId, "attachments"],
    queryFn: () => listAttachments(claimId),
  });

  const addM = useMutation({
    mutationFn: () => addAttachmentMeta(claimId, form),
    onSuccess: () => {
      setDialogOpen(false);
      setForm(INITIAL_FORM);
      qc.invalidateQueries({ queryKey: ["claim", claimId, "attachments"] });
    },
  });

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2">Attachments (metadata only)</Typography>
        {canWrite && (
          <Button variant="outlined" size="small" onClick={() => setDialogOpen(true)}>
            Add attachment
          </Button>
        )}
      </Stack>

      <Stack spacing={1.5}>
        {attQ.data?.items?.length ? (
          attQ.data.items.map((a: Attachment) => (
            <Card key={a.id} sx={{ bgcolor: "rgba(255,255,255,0.02)" }}>
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>{a.filename}</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {a.mimeType} · {(a.size / 1024).toFixed(0)} KB
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {new Date(a.createdAt).toLocaleString()}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>No attachments yet.</Typography>
        )}
      </Stack>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Attachment (metadata)</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Filename" value={form.filename} onChange={(e) => setForm(f => ({ ...f, filename: e.target.value }))} />
            <TextField label="MIME type" value={form.mimeType} onChange={(e) => setForm(f => ({ ...f, mimeType: e.target.value }))} />
            <TextField label="Size (bytes)" type="number" value={form.size} onChange={(e) => setForm(f => ({ ...f, size: Number(e.target.value) }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => addM.mutate()} disabled={addM.isPending || !form.filename}>Add</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
