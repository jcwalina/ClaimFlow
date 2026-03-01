import { api } from "./http";

export type DashboardStats = {
  myClaims: number;
  overdueTasks: number;
  newClaims: number;
  inReview: number;
  needsInfo: number;
  totalClaims: number;
  openTasks: number;
  recentActivity: {
    id: string;
    type: string;
    claimId: string | null;
    actor: { id: string; name: string; role: string };
    metadata: Record<string, any>;
    createdAt: string;
  }[];
};

export async function getDashboardStats() {
  return api<DashboardStats>("/dashboard/stats");
}
