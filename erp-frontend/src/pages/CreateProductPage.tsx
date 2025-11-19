// ==========================
//  src/pages/CreateProductPage.tsx
// ==========================
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Breadcrumbs,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ProductForm from '../components/products/ProductForm';
import type { Product } from '../api/products';

export default function CreateProductPage() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/products');
  };

  const handleSaved = (_p: Product) => {
    navigate('/products');
  };

  return (
    <Box>
      {/* Migas de pan / breadcrumb */}
      <Breadcrumbs sx={{ mb: 1 }} aria-label="breadcrumb">
        <Button
          component={RouterLink}
          to="/products"
          size="small"
          startIcon={<ArrowBackIcon fontSize="small" />}
          sx={{ textTransform: 'none', px: 0, minWidth: 0 }}
        >
          Productos
        </Button>
        <Typography color="text.secondary" fontSize={14}>
          Cargar producto
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <AddBoxIcon />
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Cargar producto
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completá los datos del nuevo producto para agregarlo al catálogo.
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/products')}
          sx={{ textTransform: 'none' }}
        >
          Volver a productos
        </Button>
      </Stack>

      {/* Contenedor principal */}
      <Card elevation={4} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ pt: 2 }}>
          {/* Usamos el mismo formulario que el modal, pero siempre abierto aquí */}
          <ProductForm
            open={true}
            onClose={handleClose}
            initialProduct={null}
            onSaved={handleSaved}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
