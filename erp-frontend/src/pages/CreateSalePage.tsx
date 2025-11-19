import { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  TextField,
  Typography,
  Button,
  Alert,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createSale } from "../api/sales";
import { createCustomer, Customer } from "../api/customers";

import CustomerSelector from "../components/customers/CustomerSelector";
import CreateCustomerDialog from "../components/customers/CreateCustomerDialog";

import SaleItemForm, {
  SaleItemFormValue,
} from "../components/sales/SaleItemForm";

import { useToast } from "../context/ToastProvider";

type InvoiceType = "A" | "B";
type PaymentMethod = "EFECTIVO" | "DEBITO" | "CREDITO" | "TRANSFERENCIA";

/**
 * Helper para obtener el stock desde el producto.
 * Basado en tu modelo backend: Integer stock;
 */
function getProductStock(product: any): number | undefined {
  if (!product) return undefined;
  if (typeof product.stock === "number") return product.stock;
  return undefined;
}

export default function CreateSalePage() {
  const nav = useNavigate();
  const toast = useToast();

  const [invoiceType, setInvoiceType] = useState<InvoiceType>("B");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("EFECTIVO");

  const [customerNameB, setCustomerNameB] =
    useState<string>("Consumidor Final");
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [items, setItems] = useState<SaleItemFormValue[]>([
    { product: null, quantity: 1 },
  ]);

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  /** Estado del dialog de nuevo cliente */
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
  const [createCustomerInitialQuery, setCreateCustomerInitialQuery] =
    useState<string>("");

  // Items enriquecidos para el resumen
  const summaryItems = useMemo(
    () =>
      items.map((it) => {
        const unitPrice = it.product?.salePrice ?? 0;
        const quantity = it.quantity > 0 ? it.quantity : 0;
        const subtotal = unitPrice * quantity;
        return {
          name: it.product?.name ?? "Sin producto",
          quantity,
          unitPrice,
          subtotal,
          hasProduct: !!it.product,
        };
      }),
    [items]
  );

  const total = useMemo(() => {
    return summaryItems.reduce((acc, it) => {
      if (!it.hasProduct || it.quantity <= 0) return acc;
      return acc + it.subtotal;
    }, 0);
  }, [summaryItems]);

  /** Integración CustomerSelector -> modal */
  const handleRequestCreateCustomer = (query: string) => {
    setCreateCustomerInitialQuery(query);
    setCreateCustomerOpen(true);
  };

  /** Al crear cliente desde el modal */
  const handleCreateCustomerSubmit = async (payload: {
    cuit: string;
    name: string;
    email?: string;
    phone?: string;
  }) => {
    const newCustomer = await createCustomer({
      name: payload.name,
      cuit: payload.cuit,
      email: payload.email,
      phone: payload.phone,
      active: true,
      status: "ACTIVE",
    });

    setSelectedCustomer(newCustomer);
    toast.success("Cliente creado con éxito");
  };

  const customerAError =
    submitAttempted &&
    invoiceType === "A" &&
    (!selectedCustomer || !selectedCustomer.id);

  const customerBError =
    submitAttempted &&
    invoiceType === "B" &&
    !customerNameB.trim();

  const handleChangeInvoiceType = (
    _event: React.MouseEvent<HTMLElement>,
    value: InvoiceType | null
  ) => {
    if (!value) return;
    setInvoiceType(value);
    setErr(null);
    setOk(null);
  };

  const getInvoiceTypeLabel = () =>
    invoiceType === "B" ? "Factura B (Consumidor Final)" : "Factura A";

  const getPaymentMethodLabel = () => {
    switch (paymentMethod) {
      case "EFECTIVO":
        return "Efectivo";
      case "DEBITO":
        return "Débito";
      case "CREDITO":
        return "Crédito";
      case "TRANSFERENCIA":
        return "Transferencia";
      default:
        return paymentMethod;
    }
  };

  const getCustomerDisplayName = () => {
    if (invoiceType === "A") {
      return (
        selectedCustomer?.name?.trim() || "Cliente sin seleccionar"
      );
    }
    return customerNameB.trim() || "Consumidor Final";
  };

  /** Manejo de cambios en una fila de ítem (merge de duplicados, etc.) */
  const handleItemChange = (index: number, next: SaleItemFormValue) => {
    const updated = [...items];
    updated[index] = next;

    const product = next.product;
    const productId = product?.id;

    if (product && productId != null) {
      // Buscar si el mismo producto está en otra fila
      let duplicateIndex: number | null = null;
      for (let i = 0; i < updated.length; i++) {
        if (i === index) continue;
        if (updated[i].product && updated[i].product!.id === productId) {
          duplicateIndex = i;
          break;
        }
      }

      if (duplicateIndex !== null) {
        const baseIndex = Math.min(index, duplicateIndex);
        const removeIndex = Math.max(index, duplicateIndex);

        const baseItem = updated[baseIndex];
        const dupItem = updated[removeIndex];

        const baseQty = baseItem.quantity || 0;
        const dupQty = dupItem.quantity || 0;
        const rawTotal = baseQty + dupQty;

        const stock = getProductStock(baseItem.product);

        let finalQty = rawTotal;
        if (typeof stock === "number" && stock > 0) {
          finalQty = Math.min(rawTotal, stock);
        }

        updated[baseIndex] = {
          ...baseItem,
          quantity: finalQty,
        };

        // Eliminamos la fila duplicada
        updated.splice(removeIndex, 1);
      }
    }

    if (updated.length === 0) {
      updated.push({ product: null, quantity: 1 });
    }

    setItems(updated);
  };

  /** Agregar nueva fila de ítem */
  const addEmptyItem = () => {
    setItems((prev) => [...prev, { product: null, quantity: 1 }]);
  };

  /** Submit de la venta */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setOk(null);
    setErr(null);

    // Validación cliente
    let effectiveCustomerName = "";
    let customerId: number | undefined;

    if (invoiceType === "A") {
      if (!selectedCustomer || !selectedCustomer.id) {
        setErr("Para Factura A tenés que seleccionar un cliente.");
        return;
      }
      customerId = Number(selectedCustomer.id);
      effectiveCustomerName = selectedCustomer.name?.trim()!;
    } else {
      const name = customerNameB.trim();
      if (!name) {
        setErr("El cliente (Consumidor Final u otro) es obligatorio.");
        return;
      }
      effectiveCustomerName = name;
    }

    // ✅ Validación de stock usando product.stock
    const stockErrorItem = items.find((it) => {
      if (!it.product) return false;
      const stock = getProductStock(it.product);
      return (
        typeof stock === "number" &&
        stock >= 0 &&
        it.quantity > stock
      );
    });

    if (stockErrorItem && stockErrorItem.product) {
      const stock = getProductStock(stockErrorItem.product);
      const name = stockErrorItem.product.name;
      const msg = `La cantidad de "${name}" supera el stock disponible (${stock}).`;
      setErr(msg);
      toast.error(msg);
      return;
    }

    // Ítems válidos
    const cleaned = items
      .filter((it) => it.product && it.product.id && it.quantity > 0)
      .map((it) => ({
        productId: it.product!.id,
        quantity: it.quantity,
      }));

    if (cleaned.length === 0) {
      setErr("Agregá al menos un ítem válido (producto + cantidad > 0).");
      return;
    }

  setLoading(true);
  try {
    await createSale({
      customerName: effectiveCustomerName,
      items: cleaned,
      invoiceType,
      customerId,
      paymentMethod,
    } as any);

    setOk("Venta creada con éxito");
    toast.success("Venta creada con éxito");

    // 🔄 Reset del formulario para cargar otra venta
    setItems([{ product: null, quantity: 1}]);
    setSelectedCustomer(null);
    setCustomerNameB("Consumidor Final");
    setSubmitAttempted(false);

    // ⏱️ Ocultamos el mensaje de éxito después de unos segundos
    setTimeout(() => {
      setOk(null);
    }, 3000);
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      "No se pudo crear la venta";
    setErr(msg);
    toast.error(msg);
  } finally {
    setLoading(false);
  }
  };

  const hasValidItems =
    summaryItems.some((it) => it.hasProduct && it.quantity > 0) &&
    total > 0;

  return (
    <Box sx={{ p: 2 }}>
      {/* ============= DIALOG NUEVO CLIENTE ============= */}
      <CreateCustomerDialog
        open={createCustomerOpen}
        initialQuery={createCustomerInitialQuery}
        onClose={() => setCreateCustomerOpen(false)}
        onSubmit={handleCreateCustomerSubmit}
      />

      {/* ============= HEADER ============= */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="baseline"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Nueva venta
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Registrá una nueva operación seleccionando cliente, ítems y
            medio de pago.
          </Typography>
        </Box>

        {hasValidItems && (
          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              Total estimado
            </Typography>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ color: "primary.main" }}
            >
              {total.toFixed(2)}
            </Typography>
          </Box>
        )}
      </Stack>

      {/* ============= LAYOUT PRINCIPAL ============= */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2.5}
        alignItems="flex-start"
      >
        {/* ===================================================================
            COLUMNA IZQUIERDA (FORMULARIO)
        =================================================================== */}
        <Paper
          component="form"
          onSubmit={onSubmit}
          sx={{
            p: 3,
            borderRadius: 3,
            flex: 2,
            minWidth: 0,
            bgcolor: "background.paper",
            border: "1px solid rgba(148,163,184,0.35)",
            boxShadow: "0px 16px 40px rgba(15,23,42,0.75)",
          }}
        >
          <Stack spacing={2.5}>
            {/* ================= COMPROBANTE + PAGO ================= */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ letterSpacing: 0.8 }}
                >
                  COMPROBANTE
                </Typography>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Tipo de comprobante
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={invoiceType}
                  onChange={handleChangeInvoiceType}
                  size="small"
                  sx={{
                    mt: 0.5,
                    bgcolor: "rgba(15,23,42,0.9)",
                    borderRadius: 999,
                    p: 0.3,
                    "& .MuiToggleButton-root": {
                      textTransform: "none",
                      px: 1.8,
                      borderRadius: 999,
                    },
                  }}
                >
                  <ToggleButton value="B">
                    Factura B (Consumidor Final)
                  </ToggleButton>
                  <ToggleButton value="A">Factura A</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Box sx={{ minWidth: 260 }}>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ letterSpacing: 0.8 }}
                >
                  PAGO
                </Typography>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Medio de pago
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {(["EFECTIVO", "DEBITO", "CREDITO", "TRANSFERENCIA"] as PaymentMethod[]).map(
                    (pm) => {
                      const label =
                        pm === "EFECTIVO"
                          ? "Efectivo"
                          : pm === "DEBITO"
                          ? "Débito"
                          : pm === "CREDITO"
                          ? "Crédito"
                          : "Transferencia";

                      const selected = paymentMethod === pm;

                      return (
                        <Button
                          key={pm}
                          variant={selected ? "contained" : "outlined"}
                          size="small"
                          onClick={() => setPaymentMethod(pm)}
                          sx={{
                            textTransform: "none",
                            fontSize: 13,
                            borderRadius: 999,
                            px: 1.9,
                            minHeight: 32,
                          }}
                        >
                          {label}
                        </Button>
                      );
                    }
                  )}
                </Stack>
              </Box>
            </Stack>

            <Divider sx={{ my: 0.5 }} />

            {/* ================= CLIENTE ================= */}
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: 0.8 }}
              >
                CLIENTE
              </Typography>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Datos del cliente
              </Typography>

              {invoiceType === "A" ? (
                <CustomerSelector
                  value={selectedCustomer}
                  onChange={setSelectedCustomer}
                  onCreateRequested={handleRequestCreateCustomer}
                  label="Cliente (Factura A)"
                  helperText={
                    customerAError
                      ? "Seleccioná un cliente para emitir Factura A."
                      : "Buscá por nombre, CUIT u otro dato."
                  }
                  error={customerAError}
                  textFieldProps={{
                    sx: {
                      "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline":
                        {
                          borderColor: "rgba(239,68,68,0.75)",
                        },
                    },
                  }}
                />
              ) : (
                <TextField
                  label="Cliente (Factura B)"
                  value={customerNameB}
                  onChange={(e) => setCustomerNameB(e.target.value)}
                  error={customerBError}
                  helperText={
                    customerBError
                      ? "El nombre del cliente es obligatorio."
                      : "Por defecto Consumidor Final. Podés cambiar el nombre si querés."
                  }
                  fullWidth
                />
              )}
            </Box>

            <Divider sx={{ my: 0.5 }} />

            {/* ================= ÍTEMS ================= */}
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="baseline"
                sx={{ mb: 1 }}
              >
                <Box>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ letterSpacing: 0.8 }}
                  >
                    ÍTEMS DE LA VENTA
                  </Typography>
                  <Typography variant="subtitle2">
                    Productos y cantidades
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  label={`${items.length} ítem${
                    items.length !== 1 ? "s" : ""
                  }`}
                  variant="outlined"
                  sx={{
                    borderColor: "rgba(148,163,184,0.4)",
                    color: "text.secondary",
                  }}
                />
              </Stack>

              <Stack spacing={1.2}>
                {items.map((it, idx) => (
                  <SaleItemForm
                    key={idx}
                    index={idx}
                    value={it}
                    onChange={(val) => handleItemChange(idx, val)}
                    onRemove={
                      items.length > 1
                        ? () =>
                            setItems((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                        : undefined
                    }
                    onRequestFocusNext={() => {
                      if (idx === items.length - 1) {
                        addEmptyItem();
                      }
                    }}
                    disabled={loading}
                  />
                ))}
              </Stack>

              <Button
                variant="outlined"
                onClick={addEmptyItem}
                sx={{
                  mt: 1,
                  textTransform: "none",
                  borderRadius: 999,
                  px: 2,
                }}
                disabled={loading}
              >
                Agregar ítem
              </Button>
            </Box>

            {/* ================= MENSAJES ================= */}
            {ok && <Alert severity="success">{ok}</Alert>}
            {err && <Alert severity="error">{err}</Alert>}

            {/* ================= ACCIONES ================= */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ pt: 1 }}
            >
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !hasValidItems}
                sx={{
                  minWidth: 190,
                  textTransform: "none",
                  borderRadius: 999,
                  py: 1,
                }}
              >
                {loading ? "Guardando..." : "Crear venta"}
              </Button>

              <Button
                variant="text"
                color="inherit"
                onClick={() => nav("/sales")}
                sx={{ textTransform: "none" }}
              >
                Cancelar
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* ===================================================================
            COLUMNA DERECHA (RESUMEN)
        =================================================================== */}
        <Paper
          sx={{
            p: 2.5,
            borderRadius: 3,
            flex: 1,
            minWidth: 280,
            bgcolor: "rgba(15,23,42,0.9)",
            border: "1px solid rgba(148,163,184,0.45)",
            boxShadow: "0px 18px 45px rgba(15,23,42,0.9)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Stack spacing={1.5}>
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: 0.8 }}
              >
                RESUMEN
              </Typography>
              <Typography variant="subtitle1" fontWeight={700}>
                Resumen de venta
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Cliente:</strong> {getCustomerDisplayName()}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Comprobante:</strong> {getInvoiceTypeLabel()}
              </Typography>
              <Typography variant="body2">
                <strong>Medio de pago:</strong> {getPaymentMethodLabel()}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 0.5,
                  color: "text.secondary",
                  fontWeight: 600,
                }}
              >
                Ítems
              </Typography>

              {!hasValidItems ? (
                <Typography variant="caption" color="text.secondary">
                  Todavía no agregaste ítems válidos. Seleccioná un
                  producto y una cantidad mayor a 0 para ver el detalle.
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="right">Cant.</TableCell>
                      <TableCell align="right">P. unit.</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summaryItems.map((it, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{it.name}</TableCell>
                        <TableCell align="right">
                          {it.quantity}
                        </TableCell>
                        <TableCell align="right">
                          {it.hasProduct && it.unitPrice > 0
                            ? it.unitPrice.toFixed(2)
                            : "-"}
                        </TableCell>
                        <TableCell align="right">
                          {it.hasProduct && it.subtotal > 0
                            ? it.subtotal.toFixed(2)
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>

            <Divider />

            <Box sx={{ textAlign: "right", mt: 0.5 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.25 }}
              >
                Total estimado
              </Typography>
              <Typography
                variant="h4"
                fontWeight={900}
                sx={{ color: "primary.main" }}
              >
                {total.toFixed(2)}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
