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
  Switch,
  FormControlLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProducts,
  type Page,
  type Product,
  adjustStock,
  exportStockCSV,
} from '../api/products';
import { formatCurrencyARS } from '../utils/format';
import { downloadBlob } from '../lib/download';

export default function StockPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [onlyLow, setOnlyLow] = useState(true);
  const [threshold, setThreshold] = useState(5);

  const qc = useQueryClient();

  const query = useQuery<Page<Product>, Error>({
    queryKey: ['stock', { q, page, onlyLow, threshold }],
    queryFn: () =>
      fetchProducts({
        q: q || undefined,
        page,
        size: 10,
        stockLt: onlyLow ? threshold : undefined,
      }),
    placeholderData: (prev) => prev,
  });

  const rows = query.data?.content ?? [];
  const totalPages = query.data?.totalPages ?? 1;

  // ----- Ajuste de stock -----
  const [openAdj, setOpenAdj] = useState(false);
  const [adjProduct, setAdjProduct] = useState<Product | null>(null);
  const [adjType, setAdjType] = useState<'IN' | 'OUT'>('IN');
  const [adjQty, setAdjQty] = useState<number>(1);
  const [adjNote, setAdjNote] = useState('');

  const mutAdjust = useMutation({
    mutationFn: () =>
      adjustStock({
        productId: String(adjProduct!.id!),
        type: adjType,
        quantity: Number(adjQty) || 0,
        note: adjNote || undefined,
      }),
    onSuccess: () => {
      setOpenAdj(false);
      qc.invalidateQueries({ queryKey: ['stock'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const openAdjustFor = (p: Product) => {
    setAdjProduct(p);
    setAdjType('IN');
    setAdjQty(1);
    setAdjNote('');
    setOpenAdj(true);
  };

  const exportCsv = async () => {
    try {
      const blob = await exportStockCSV({
        q: q || undefined,
        onlyLow,
        threshold,
      });
      downloadBlob(blob, 'inventario.csv');
    } catch {
      // si no existe endpoint, no rompemos
      alert('No se pudo exportar el inventario.');
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Stock
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

          <FormControlLabel
            control={
              <Switch
                checked={onlyLow}
                onChange={(e) => {
                  setOnlyLow(e.target.checked);
                  setPage(0);
                }}
              />
            }
            label="Solo bajo stock"
          />

          <TextField
            label="Umbral"
            type="number"
            value={threshold}
            onChange={(e) =>
              setThreshold(Math.max(0, Number(e.target.value || 0)))
            }
            InputProps={{ inputProps: { min: 0, step: 1 } }}
            disabled={!onlyLow}
            sx={{ width: 120 }}
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
                setOnlyLow(true);
                setThreshold(5);
                setPage(0);
                query.refetch();
              }}
            >
              Limpiar
            </Button>
            <Button variant="outlined" onClick={exportCsv}>
              Export CSV
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {query.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {query.error?.message || 'Error al cargar stock'}
        </Alert>
      )}

      <Card elevation={4} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell align="right">Precio venta</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell align="right">Stock mín.</TableCell>
                <TableCell align="right">Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((p, i) => {
                const key = String(p.id ?? `${p.name}-${i}`);
                const stockNum = Number(p.stock ?? 0);
                const salePrice = p.salePrice ?? p.price ?? 0;
                const isLow = stockNum < threshold;

                return (
                  <TableRow key={key} hover>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.sku ?? '-'}</TableCell>
                    <TableCell align="right">
                      {formatCurrencyARS(Number(salePrice))}
                    </TableCell>
                    <TableCell align="right">{stockNum}</TableCell>
                    <TableCell align="right">
                      {p.stockMin !== undefined ? Number(p.stockMin) : '-'}
                    </TableCell>
                    <TableCell align="right">
                      {isLow ? (
                        <Chip label="Bajo" color="error" size="small" />
                      ) : (
                        <Chip label="OK" variant="outlined" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => openAdjustFor(p)}>
                        Ajustar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && !query.isLoading && (
                <TableRow>
                  <TableCell colSpan={7}>Sin datos</TableCell>
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

      {/* ----- Modal Ajuste de Stock ----- */}
      <Dialog
        open={openAdj}
        onClose={() => setOpenAdj(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Ajustar stock</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Producto"
              value={adjProduct?.name ?? ''}
              InputProps={{ readOnly: true }}
            />
            <TextField
              select
              label="Tipo"
              value={adjType}
              onChange={(e) => setAdjType(e.target.value as 'IN' | 'OUT')}
            >
              <MenuItem value="IN">Ingreso</MenuItem>
              <MenuItem value="OUT">Egreso</MenuItem>
            </TextField>
            <TextField
              label="Cantidad"
              type="number"
              value={adjQty}
              onChange={(e) =>
                setAdjQty(Math.max(0, Number(e.target.value || 0)))
              }
              inputProps={{ min: 0, step: 1 }}
              required
            />
            <TextField
              label="Nota (opcional)"
              value={adjNote}
              onChange={(e) => setAdjNote(e.target.value)}
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdj(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => mutAdjust.mutate()}
            disabled={mutAdjust.isPending || !adjProduct || adjQty <= 0}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
