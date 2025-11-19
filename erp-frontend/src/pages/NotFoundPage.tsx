import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <Box
      sx={{
        height: '100vh',
        bgcolor: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <Typography variant="h2" sx={{ mb: 2, color: '#ff4d4f' }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Página no encontrada
      </Typography>
      <Button
        variant="contained"
        component={Link}
        to="/"
        sx={{
          bgcolor: '#ff4d4f',
          '&:hover': { bgcolor: '#ff6b6c' },
        }}
      >
        Volver al inicio
      </Button>
    </Box>
  );
}
