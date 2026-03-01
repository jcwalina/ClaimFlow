import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Grid, Skeleton, Stack, Typography, alpha,
} from "@mui/material";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import FiberNewRoundedIcon from "@mui/icons-material/FiberNewRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../api/dashboard";
import { AuditEventItem } from "../ui/AuditEventItem";
import { useAuth } from "../state/auth";

function StatCard({ title, value, icon, color, onClick }: {
  title: string;
  value: number | undefined;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s, box-shadow 0.15s",
        "&:hover": onClick ? { transform: "translateY(-2px)", boxShadow: `0 8px 32px ${alpha(color, 0.2)}` } : {},
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600, mb: 0.5 }}>
              {title}
            </Typography>
            {value !== undefined ? (
              <Typography variant="h4" sx={{ fontWeight: 800, color }}>{value}</Typography>
            ) : (
              <Skeleton width={60} height={42} />
            )}
          </Box>
          <Box sx={{ p: 1, borderRadius: 2.5, bgcolor: alpha(color, 0.12), color, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    refetchInterval: 30_000,
  });

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">
          Welcome back, {user?.name?.split(" ")[0] ?? "User"}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.3 }}>
          Here's what's happening across your claims workflow today.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <StatCard title="My Claims" value={data?.myClaims} icon={<AssignmentRoundedIcon />} color="#7C3AED" onClick={() => nav("/claims")} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Overdue Tasks" value={data?.overdueTasks} icon={<WarningAmberRoundedIcon />} color="#EF4444" onClick={() => nav("/tasks")} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="New Claims" value={data?.newClaims} icon={<FiberNewRoundedIcon />} color="#22D3EE" onClick={() => nav("/claims?status=NEW")} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="In Review" value={data?.inReview} icon={<RateReviewRoundedIcon />} color="#F59E0B" onClick={() => nav("/claims?status=IN_REVIEW")} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.5 }}>Recent Activity</Typography>
              {isLoading ? (
                <Stack spacing={1}>{[1, 2, 3, 4].map(i => <Skeleton key={i} height={48} />)}</Stack>
              ) : data?.recentActivity?.length ? (
                <Stack spacing={0}>
                  {data.recentActivity.map(e => (
                    <AuditEventItem
                      key={e.id}
                      event={{ ...e, metadata: e.metadata as Record<string, unknown> }}
                      showClaim
                      onClick={e.claimId ? () => nav(`/claims/${e.claimId}`) : undefined}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>No recent activity.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>System Overview</Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>Total Claims</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{data?.totalClaims ?? "—"}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>Needs Information</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "warning.main" }}>{data?.needsInfo ?? "—"}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>Open Tasks</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "info.main" }}>{data?.openTasks ?? "—"}</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: alpha("#7C3AED", 0.06), borderColor: alpha("#7C3AED", 0.15) }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: "primary.main", mb: 0.5 }}>
                  Portfolio Project
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                  ClaimFlow demonstrates enterprise workflow patterns: RBAC, server-enforced transitions,
                  full audit trail, and production-grade UI — built with React, Express, Prisma & TypeScript.
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
