import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./state/auth";
import { AppShell } from "./ui/AppShell";
import { LoginPage } from "./views/LoginPage";
import { DashboardPage } from "./views/DashboardPage";
import { ClaimsPage } from "./views/ClaimsPage";
import { ClaimDetailPage } from "./views/ClaimDetailPage";
import { ClaimCreatePage } from "./views/ClaimCreatePage";
import { TasksPage } from "./views/TasksPage";
import { AuditPage } from "./views/AuditPage";
import { AdminUsersPage } from "./views/AdminUsersPage";

function Protected({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    ),
    children: [
      { index: true, element: <Protected><DashboardPage /></Protected> },
      { path: "claims", element: <Protected><ClaimsPage /></Protected> },
      { path: "claims/new", element: <Protected><ClaimCreatePage /></Protected> },
      { path: "claims/:id", element: <Protected><ClaimDetailPage /></Protected> },
      { path: "tasks", element: <Protected><TasksPage /></Protected> },
      { path: "audit", element: <Protected><AuditPage /></Protected> },
      { path: "admin/users", element: <Protected><AdminUsersPage /></Protected> },
      { path: "login", element: <LoginPage /> },
    ],
  },
]);
