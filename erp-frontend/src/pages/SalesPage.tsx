// ==========================
//   src/pages/SalesPage.tsx
// ==========================

import { useEffect, useState } from "react";
import { fetchSales, exportSalesCSV, exportSalesPDF, Sale } from "../api/sales";
import Loading from "../components/Loading";
import ErrorAlert from "../components/ErrorAlert";

import {
  Box,
  Paper,
  Stack,
  TextField,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ----- Filtros -----
  const [customer, setCustomer] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minTotal, setMinTotal] = useState("");

  // ----- Detalle -----
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  async function loadSales() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchSales({
        page,
        size,
        customer: customer || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        minTotal: minTotal ? Number(minTotal) : undefined,
      });

      setSales(data.content);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      console.error(err);
      setError("Error al cargar las ventas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function resetFilters() {
    setCustomer("");
    setDateFrom("");
    setDateTo("");
    setMinTotal("");
    setPage(0);
    loadSales();
  }

  function handleRowClick(sale: Sale) {
    setSelectedSale(sale);
    setDetailOpen(true);
  }

  function handleCloseDetail() {
    setDetailOpen(false);
  }

  // Print ticket
  function handlePrintTicket() {
    window.print();
  }

  // Export CSV / PDF
  async function handleExportCSV() {
    try {
      const blob = await exportSalesCSV({
        customer: customer || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        minTotal: minTotal ? Number(minTotal) : undefined,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ventas.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError("Error al exportar CSV");
    }
  }

  async function handleExportPDF() {
    try {
      const blob = await exportSalesPDF({
        customer: customer || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        minTotal: minTotal ? Number(minTotal) : undefined,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ventas.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError("Error al exportar PDF");
    }
  }

  return (
    <Box sx={{ p: 2, maxWidth: 1100, mx: "auto" }}>
      {/* Título */}
      <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
        Ventas
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
        Consulta el historial de ventas, filtra por cliente, fechas o monto mínimo y
        exportá resultados.
      </Typography>

      {/* Filtros */}
      <Paper sx={{ px: 3, py: 3.5, borderRadius: 3, mb: 4 }} elevation={3}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          justifyContent="space-between"
        >
          {/* Inputs */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr 1fr" },
              gap: 2,
              flexGrow: 1,
            }}
          >
            <TextField
              label="Buscar cliente"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              size="small"
              fullWidth
            />

            <TextField
              label="Desde"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />

            <TextField
              label="Hasta"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />

            <TextField
              label="Mínimo total"
              type="number"
              value={minTotal}
              onChange={(e) => setMinTotal(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Botones */}
          <Stack direction={{ xs: "row", md: "column" }} spacing={1.5}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" color="error" onClick={loadSales}>
                Aplicar
              </Button>
              <Button variant="outlined" color="error" onClick={resetFilters}>
                Limpiar
              </Button>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small" onClick={handleExportCSV}>
                Exportar CSV
              </Button>
              <Button
                variant="contained"
                size="small"
                color="error"
                onClick={handleExportPDF}
              >
                Exportar PDF
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {loading && <Loading />}
      {error && <ErrorAlert message={error} />}

      {/* TABLA */}
      <Paper sx={{ p: 0, borderRadius: 3 }} elevation={3}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Cliente</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Comprobante</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Medio de pago</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sales.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No hay ventas registradas.
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => {
                  const anySale = sale as any;

                  const invoiceType = anySale.invoiceType ?? "B";
                  const payment =
                    anySale.paymentMethod ?? anySale.method ?? "-";

                  let paymentLabel: string;
                  switch (payment) {
                    case "EFECTIVO":
                      paymentLabel = "Efectivo";
                      break;
                    case "DEBITO":
                      paymentLabel = "Débito";
                      break;
                    case "CREDITO":
                      paymentLabel = "Crédito";
                      break;
                    case "TRANSFERENCIA":
                      paymentLabel = "Transferencia";
                      break;
                    default:
                      paymentLabel = payment || "-";
                      break;
                  }

                  const formattedTotal = sale.total.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });

                  const formattedDate = new Date(
                    sale.date
                  ).toLocaleString("es-AR");

                  return (
                    <TableRow
                      key={sale.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleRowClick(sale)}
                    >
                      <TableCell>{sale.customerName}</TableCell>
                      <TableCell>{invoiceType}</TableCell>
                      <TableCell>{paymentLabel}</TableCell>
                      <TableCell>${formattedTotal}</TableCell>
                      <TableCell>{formattedDate}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        <Box
          sx={{
            px: 3,
            py: 1.5,
            borderTop: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="caption">
            Página {page + 1} de {totalPages}
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>

            <Button
              variant="contained"
              size="small"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Siguiente
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* MODAL DETALLE */}
      <Dialog
        open={detailOpen && !!selectedSale}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalle de venta #{selectedSale?.id}</DialogTitle>

        <DialogContent dividers>
          {selectedSale && (
            <>
              {/* Cabecera */}
              <Typography variant="subtitle1" fontWeight={600}>
                {selectedSale.customerName}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Total: $
                {selectedSale.total.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Fecha: {new Date(selectedSale.date).toLocaleString("es-AR")}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Items */}
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Ítems de la venta
              </Typography>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell>Cantidad</TableCell>
                    <TableCell>Precio unit.</TableCell>
                    <TableCell>Subtotal</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {selectedSale.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No hay ítems asociados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    selectedSale.items.map((it, i) => {
                      const unit = it.price ?? 0;
                      const subtotal = it.subtotal ?? unit * it.quantity;

                      return (
                        <TableRow key={i}>
                          <TableCell>{it.productName}</TableCell>
                          <TableCell>{it.quantity}</TableCell>
                          <TableCell>
                            $
                            {unit.toLocaleString("es-AR", {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell>
                            $
                            {subtotal.toLocaleString("es-AR", {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePrintTicket}
          >
            Imprimir ticket
          </Button>

          <Button onClick={handleCloseDetail}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* ESTILOS PARA IMPRIMIR SOLO EL TICKET */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }
            .MuiDialog-root, .MuiDialog-root * {
              visibility: visible !important;
            }
            .MuiDialog-paper {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              box-shadow: none !important;
            }
            button {
              display: none !important;
            }
          }
        `}
      </style>
    </Box>
  );
}
