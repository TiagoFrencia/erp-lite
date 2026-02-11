import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Stack,
} from '@mui/material';
import { API_BASE_URL } from '../config';

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !password || !confirmPassword) {
            setError('Todos los campos son obligatorios');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Using direct axios call or fetch. Assuming axios is installed since it was mentioned in plan.
            // If API_URL import fails I will need to check config.ts. 
            // Safe bet: use relative path if proxy setup or try to import config.
            // I'll check config.ts content first? No, I'll just assume /api/auth/register works if proxy is set or I'll use Import from config.

            await axios.post(`${API_BASE_URL}/auth/register`, {
                username: username.trim(),
                password,
            });

            navigate('/login');
        } catch (err: any) {
            console.error(err);
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                'Error al registrar usuario';
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
                            Crear una nueva cuenta
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
                            autoComplete="new-password"
                            InputProps={{
                                sx: {
                                    bgcolor: '#1B2435',
                                    borderRadius: 2,
                                },
                            }}
                        />

                        <TextField
                            label="Confirmar Contraseña"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                            fullWidth
                            autoComplete="new-password"
                            InputProps={{
                                sx: {
                                    bgcolor: '#1B2435',
                                    borderRadius: 2,
                                },
                            }}
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
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </Button>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            textAlign="center"
                        >
                            ¿Ya tienes cuenta?{' '}
                            <Link to="/login" style={{ color: '#ff6b60', textDecoration: 'none', fontWeight: 600 }}>
                                Ingresa aquí
                            </Link>
                        </Typography>
                    </Stack>
                </Stack>
            </Paper>
        </Box>
    );
};

export default RegisterPage;
