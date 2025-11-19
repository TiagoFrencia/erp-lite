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
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useQuery } from '@tanstack/react-query';
import {
  fetchCustomers,
  type Page,
  type Customer,
  exportCustomersCSV,
} from '../api/customers';
import CustomerForm from '../components/customers/CustomerForm';
import { downloadBlob } from '../lib/download';

export default function CustomersPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);

  const query = useQuery<Page<Customer>, Error>({
    queryKey: ['customers', { q, page }],
    queryFn: () => fetchCustomers({ q: q || undefined, page, size: 10 }),
    placeholderData: (prev) => prev,
  });

  const rows = query.data?.content ?? [];
  const totalPages = query.data?.totalPages ?? 1;

  const totalCustomers =
    (query.data as any)?.totalElements ?? rows.length ?? 0;

  // 🔥 Ahora contamos activos/inactivos desde el campo REAL: active
  const totalActive = rows.filter((c) => c.active === true).length;
  const totalInactive = rows.filter((c) => c.active === false).length;

  const [openForm, setOpenForm] = useState(false);
  const [editRow, setEditRow] = useState<Customer | null>(null);

  const openCreate = () => {
    setEditRow(null);
    setOpenForm(true);
  };

  const openEdit = (c: Customer) => {
    setEditRow(c);
    setOpenForm(true);
  };

  const exportCsv = async () => {
    try {
      const blob = await exportCustomersCSV({ q: q || undefined });
      downloadBlob(blob, 'clientes.csv');
    } catch {
      alert('No se pudo exportar el CSV de clientes.');
    }
  };

  const handleApplyFilters = () => {
    setPage(0);
    query.refetch();
  };

  const handleClearFilters = () => {
    setQ('');
    setPage(0);
    query.refetch();
  };

  return (
    <Box>
      {/* Cabecera del módulo */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
            Clientes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestioná tus clientes. Buscá por nombre, email o CUIT y exportá la
            información para facturación.
          </Typography>
        </Box>

        {/* KPIs rápidos */}
        <Stack direction="row" spacing={2}>
          <Card
            elevation={0}
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              minWidth: 140,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Total clientes
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {totalCustomers}
            </Typography>
          </Card>

          <Card
            elevation={0}
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              minWidth: 140,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Activos
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {totalActive}
            </Typography>
          </Card>

          <Card
            elevation={0}
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              minWidth: 140,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Inactivos
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {totalInactive}
            </Typography>
          </Card>
        </Stack>
      </Box>

      {/* Filtros */}
      <Card elevation={4} sx={{ borderRadius: 3, mb: 2 }}>
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', md: 'center' },
          }}
        >
          <Box sx={{ flex: 1, minWidth: 260 }}>
            <TextField
              fullWidth
              label="Buscar"
              placeholder="Buscar por nombre, email o CUIT…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyFilters();
              }}
            />
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="outlined" onClick={handleApplyFilters}>
              Aplicar
            </Button>
            <Button variant="text" onClick={handleClearFilters}>
              Limpiar
            </Button>
            <Button variant="contained" onClick={openCreate}>
              Nuevo cliente
            </Button>
            <Button variant="outlined" onClick={exportCsv}>
              Export CSV
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {query.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {query.error?.message || 'Error al cargar clientes'}
        </Alert>
      )}

      {/* Tabla */}
      <Card elevation={4} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((c, i) => {
                const email = c.email?.trim() || 'Sin email';
                const phone = c.phone?.trim() || 'Sin teléfono';
                const address = c.address?.trim() || 'Sin dirección';

                return (
                  <TableRow key={String(c.id ?? `${c.name}-${i}`)} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{c.name}</Typography>
                    </TableCell>
                    <TableCell>{email}</TableCell>
                    <TableCell>{phone}</TableCell>
                    <TableCell>{address}</TableCell>

                    {/* 🔥 Estado usando ACTIVE del backend */}
                    <TableCell>
                      {typeof c.active === 'boolean' ? (
                        <Chip
                          size="small"
                          label={c.active ? 'Activo' : 'Inactivo'}
                          color={c.active ? 'success' : 'default'}
                          variant="outlined"
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontStyle: 'italic' }}
                        >
                          Sin estado
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton onClick={() => openEdit(c)} size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}

              {rows.length === 0 && !query.isLoading && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        No encontramos clientes con estos filtros.
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        Probá cambiar la búsqueda o crear un nuevo cliente.
                      </Typography>
                      <Button variant="contained" onClick={openCreate}>
                        Nuevo cliente
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
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

      <CustomerForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        initialCustomer={editRow ?? undefined}
        onSaved={() => query.refetch()}
      />
    </Box>
  );
}
