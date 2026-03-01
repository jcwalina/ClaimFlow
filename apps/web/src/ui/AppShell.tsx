import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Avatar, Box, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText,
  Stack, Toolbar, Typography, useMediaQuery, useTheme, alpha, Divider, Chip,
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import { useAuth } from "../state/auth";

const SIDEBAR_W = 260;

const navItems = [
  { label: "Dashboard", icon: <DashboardRoundedIcon />, path: "/" },
  { label: "Claims", icon: <AssignmentRoundedIcon />, path: "/claims" },
  { label: "Tasks", icon: <TaskAltRoundedIcon />, path: "/tasks" },
  { label: "Audit Log", icon: <HistoryRoundedIcon />, path: "/audit" },
];

const adminItems = [
  { label: "Users", icon: <PeopleRoundedIcon />, path: "/admin/users" },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  function go(path: string) {
    nav(path);
    onClose?.();
  }

  const isActive = (path: string) =>
    path === "/" ? loc.pathname === "/" : loc.pathname.startsWith(path);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", py: 1.5, px: 1.5 }}>
      <Stack direction="row" alignItems="center" spacing={1.2} sx={{ px: 1, mb: 3 }}>
        <ShieldRoundedIcon sx={{ color: "primary.main", fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.5, fontSize: "1.15rem" }}>
          ClaimFlow
        </Typography>
        <Chip label="PRO" size="small" color="primary" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 800 }} />
      </Stack>

      <List disablePadding sx={{ flex: 1 }}>
        {navItems.map(item => (
          <ListItemButton
            key={item.path}
            onClick={() => go(item.path)}
            selected={isActive(item.path)}
            sx={{
              borderRadius: 2.5,
              mb: 0.4,
              py: 0.9,
              "&.Mui-selected": {
                bgcolor: (t) => alpha(t.palette.primary.main, 0.14),
                color: "primary.main",
                "&:hover": { bgcolor: (t) => alpha(t.palette.primary.main, 0.18) },
                "& .MuiListItemIcon-root": { color: "primary.main" },
              },
              "&:hover": { bgcolor: "rgba(148,163,184,0.06)" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 38, color: "text.secondary" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, fontSize: "0.875rem" }} />
          </ListItemButton>
        ))}

        {user?.role === "ADMIN" && (
          <>
            <Divider sx={{ my: 1.5, opacity: 0.3 }} />
            <Typography variant="caption" sx={{ px: 1, color: "text.secondary", fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", fontSize: "0.65rem" }}>
              Administration
            </Typography>
            {adminItems.map(item => (
              <ListItemButton
                key={item.path}
                onClick={() => go(item.path)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 2.5,
                  mb: 0.4,
                  py: 0.9,
                  mt: 0.5,
                  "&.Mui-selected": {
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.14),
                    color: "primary.main",
                    "&:hover": { bgcolor: (t) => alpha(t.palette.primary.main, 0.18) },
                    "& .MuiListItemIcon-root": { color: "primary.main" },
                  },
                  "&:hover": { bgcolor: "rgba(148,163,184,0.06)" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: "text.secondary" }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, fontSize: "0.875rem" }} />
              </ListItemButton>
            ))}
          </>
        )}
      </List>

      {user && (
        <Box sx={{
          p: 1.5,
          borderRadius: 3,
          bgcolor: "rgba(148,163,184,0.05)",
          border: "1px solid rgba(148,163,184,0.08)",
        }}>
          <Stack direction="row" alignItems="center" spacing={1.2}>
            <Avatar sx={{ width: 34, height: 34, fontSize: "0.85rem", fontWeight: 700, bgcolor: "primary.main" }}>
              {user.name.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                {user.role}
              </Typography>
            </Box>
            <IconButton size="small" onClick={signOut} sx={{ color: "text.secondary" }} aria-label="Logout">
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      )}
    </Box>
  );
}

export function AppShell() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const sidebarSx = {
    width: SIDEBAR_W,
    bgcolor: "#0A0E16",
    borderRight: "1px solid rgba(148,163,184,0.08)",
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {isDesktop ? (
        <Box component="nav" sx={{ width: SIDEBAR_W, flexShrink: 0 }}>
          <Box sx={{ ...sidebarSx, position: "fixed", top: 0, bottom: 0, overflowY: "auto" }}>
            <SidebarContent />
          </Box>
        </Box>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          PaperProps={{ sx: sidebarSx }}
        >
          <SidebarContent onClose={() => setMobileOpen(false)} />
        </Drawer>
      )}

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {!isDesktop && (
          <Toolbar sx={{ px: 2 }}>
            <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Menu">
              <MenuRoundedIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 800, ml: 1 }}>ClaimFlow</Typography>
          </Toolbar>
        )}

        <Box
          component="main"
          sx={{
            flex: 1,
            px: { xs: 2, md: 4 },
            py: { xs: 2, md: 3 },
            maxWidth: 1280,
            width: "100%",
            mx: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
