import React from "react";
import { Avatar, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addNote, listNotes } from "../../api/claims";

interface NotesTabProps {
  claimId: string;
  canWrite: boolean;
}

export function NotesTab({ claimId, canWrite }: NotesTabProps) {
  const qc = useQueryClient();
  const [note, setNote] = React.useState("");

  const notesQ = useQuery({
    queryKey: ["claim", claimId, "notes"],
    queryFn: () => listNotes(claimId),
  });

  const noteM = useMutation({
    mutationFn: () => addNote(claimId, note),
    onSuccess: () => {
      setNote("");
      qc.invalidateQueries({ queryKey: ["claim", claimId, "notes"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
    },
  });

  return (
    <Stack spacing={2}>
      {canWrite && (
        <Stack direction="row" gap={1}>
          <TextField
            fullWidth
            label="Add a note…"
            multiline
            minRows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={() => noteM.mutate()}
            disabled={!note.trim() || noteM.isPending}
            sx={{ alignSelf: "flex-end" }}
          >
            Add
          </Button>
        </Stack>
      )}
      <Stack spacing={1.5}>
        {notesQ.data?.items?.length ? (
          notesQ.data.items.map(n => (
            <Card key={n.id} sx={{ bgcolor: "rgba(255,255,255,0.02)" }}>
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
                  <Avatar sx={{ width: 26, height: 26, fontSize: "0.7rem", bgcolor: "primary.main" }}>
                    {n.author.name.charAt(0)}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{n.author.name}</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ pl: 4.5 }}>{n.text}</Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>No notes yet.</Typography>
        )}
      </Stack>
    </Stack>
  );
}
