import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  IconButton,
  Button,
  Avatar,
  Stack
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import { useAuth } from '@context/AuthContext'
import { useNavigate } from 'react-router-dom'

/**
 * Layout principal de la app.
 * Renderiza AppBar superior + contenedor de página para children.
 * Si ya tenías un Drawer/Sidebar, mantené su render donde corresponda
 * (debajo del AppBar). Aquí dejamos un placeholder para un posible menú.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar */}
      <AppBar position="fixed" color="primary" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid #334155' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            ERP-Lite
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* Usuario + Cerrar sesión */}
          <Stack direction="row" spacing={2} alignItems="center">
            {user ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#FF4433' }}>
                  {user.username?.[0]?.toUpperCase() ?? 'U'}
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  {user.username}
                </Typography>
              </Stack>
            ) : null}

            <Button
              variant="outlined"
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={onLogout}
              sx={{
                borderColor: '#FF4433',
                color: '#FF4433',
                '&:hover': { borderColor: '#ff5a49', bgcolor: 'rgba(255,68,51,0.08)' }
              }}
            >
              Cerrar sesión
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Contenido principal */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Offset para el AppBar fijo */}
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>
    </Box>
  )
}
