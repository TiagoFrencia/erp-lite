import React from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { useAuth } from "../context/AuthContext";

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const displayName =
    (user?.name as string)?.trim() ||
    (user?.username as string)?.trim() ||
    "Usuario";

  return (
    <AppBar
      position="sticky"
      color="primary"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid #334155",
      }}
    >
      <Toolbar
        sx={{
          minHeight: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3, // respira mejor
        }}
      >
        {/* Dejamos el lado izquierdo vacío para no duplicar el branding (está en Sidebar) */}
        <Box />

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {displayName}
          </Typography>
          <Button
            onClick={logout}
            size="small"
            variant="outlined"
            sx={{
              borderColor: "#FF4433",
              color: "#FF4433",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              "&:hover": { backgroundColor: "rgba(255,68,51,0.10)", borderColor: "#FF4433" },
            }}
          >
            Cerrar sesión
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
