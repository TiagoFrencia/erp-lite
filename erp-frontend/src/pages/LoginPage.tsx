import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

const LoginPage: React.FC = () => {
  const { login } = useAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation() as any;

  // Ruta a redirigir si venía de una página protegida
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      setError('Ingresá usuario y contraseña');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(username.trim(), password);
      navigate(from, { replace: true }); // Redirige a la página original o dashboard
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Error de autenticación';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={6}
        sx={{
          width: 400,
          maxWidth: '90vw',
          p: 3,
          borderRadius: 3,
          bgcolor: '#141C2C',
          boxShadow: '0 20px 60px rgba(0,0,0,.35)',
        }}
      >
        <Stack spacing={3}>
          {/* Title */}
          <Stack spacing={0.5} textAlign="center">
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                fontFamily: 'Montserrat, Inter, sans-serif',
                letterSpacing: 1,
                color: '#ff6b60',
              }}
            >
              ERP-LITE
            </Typography>
            <Typography color="text.secondary">
              Iniciá sesión para continuar
            </Typography>
          </Stack>

          {/* FORM */}
          <Stack spacing={2}>
            <TextField
              label="Usuario"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              fullWidth
              autoComplete="username"
              InputProps={{
                sx: {
                  bgcolor: '#1B2435',
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              fullWidth
              autoComplete="current-password"
              InputProps={{
                sx: {
                  bgcolor: '#1B2435',
                  borderRadius: 2,
                },
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
              }
              label="Recordarme en este equipo"
              sx={{ color: 'text.secondary' }}
            />

            {error && (
              <Typography variant="body2" color="error" sx={{ mt: -1 }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                bgcolor: '#ff6b60',
                color: '#fff',
                fontWeight: 700,
                borderRadius: 3,
                py: 1.2,
                '&:hover': { bgcolor: '#ff5b54' },
              }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>

            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
            >
              ¿Olvidaste tu contraseña?
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ pt: 1 }}
            >
              ¿No tienes cuenta?{' '}
              <span
                style={{
                  color: '#ff6b60',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
                onClick={() => navigate('/register')}
              >
                Regístrate aquí
              </span>
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default LoginPage;
