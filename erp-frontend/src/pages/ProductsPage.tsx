import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Pagination,
  Stack,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, type Page, type Product } from '../api/products';
import { formatCurrencyARS } from '../utils/format';
import ProductForm from '../components/products/ProductForm';

export default function ProductsPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);

  const query = useQuery<Page<Product>, Error>({
    queryKey: ['products', { q, page }],
    queryFn: () => fetchProducts({ q: q || undefined, page, size: 10 }),
    placeholderData: (prev) => prev,
  });

  const rows = query.data?.content ?? [];
  const totalPages = query.data?.totalPages ?? 1;

  // Modal form
  const [openForm, setOpenForm] = useState(false);
  const [editRow, setEditRow] = useState<Product | null>(null);

  const openCreate = () => {
    setEditRow(null);
    setOpenForm(true);
  };
  const openEdit = (p: Product) => {
    setEditRow(p);
    setOpenForm(true);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Productos
      </Typography>

      <Card elevation={4} sx={{ borderRadius: 3, mb: 2 }}>
        <CardContent
          sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}
        >
          <TextField
            label="Buscar por nombre o SKU"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            sx={{ minWidth: 280 }}
          />
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={() => {
                setPage(0);
                query.refetch();
              }}
            >
              Aplicar
            </Button>
            <Button
              variant="text"
              onClick={() => {
                setQ('');
                setPage(0);
                query.refetch();
              }}
            >
              Limpiar
            </Button>
            <Button variant="contained" onClick={openCreate}>
              Nuevo producto
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {query.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {query.error?.message || 'Error al cargar productos'}
        </Alert>
      )}

      <Card elevation={4} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell align="right">Precio costo</TableCell>
                <TableCell align="right">Precio venta</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell align="right">Stock mín.</TableCell>
                <TableCell align="right">Activo</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((p, i) => {
                const key = String(p.id ?? `${p.name}-${i}`);
                const salePrice = p.salePrice ?? p.price ?? 0;
                const isActive = p.active !== undefined ? !!p.active : true;

                return (
                  <TableRow key={key} hover>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.sku ?? '-'}</TableCell>
                    <TableCell>{p.category ?? '-'}</TableCell>
                    <TableCell align="right">
                      {p.costPrice !== undefined
                        ? formatCurrencyARS(Number(p.costPrice))
                        : '-'}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrencyARS(Number(salePrice))}
                    </TableCell>
                    <TableCell align="right">{Number(p.stock ?? 0)}</TableCell>
                    <TableCell align="right">
                      {p.stockMin !== undefined ? Number(p.stockMin) : '-'}
                    </TableCell>
                    <TableCell align="right">
                      {isActive ? 'Activo' : 'Inactivo'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton onClick={() => openEdit(p)} size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && !query.isLoading && (
                <TableRow>
                  <TableCell colSpan={9}>Sin datos</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
            <Pagination
              page={page + 1}
              count={totalPages || 1}
              onChange={(_, p) => setPage(p - 1)}
              showFirstButton
              showLastButton
            />
          </Stack>
        </CardContent>
      </Card>

      <ProductForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        initialProduct={editRow ?? undefined}
        onSaved={() => query.refetch()}
      />
    </Box>
  );
}
