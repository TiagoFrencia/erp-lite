// ==========================
//  src/components/customers/CreateCustomerDialog.tsx
// ==========================
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
} from "@mui/material";

export type CreateCustomerPayload = {
  cuit: string;
  name: string;
  email?: string;
  phone?: string;
};

type CreateCustomerDialogProps = {
  open: boolean;
  onClose: () => void;
  /**
   * Valor inicial que viene del buscador (CUIT o nombre).
   * Suele venir desde el CustomerSelector cuando no encuentra resultados.
   */
  initialQuery?: string;
  /**
   * Callback que se ejecuta al confirmar la creación.
   * El padre se encarga de llamar a la API, manejar errores y, si quiere,
   * setear el cliente seleccionado.
   */
  onSubmit: (payload: CreateCustomerPayload) => Promise<void> | void;
};

export default function CreateCustomerDialog({
  open,
  onClose,
  initialQuery = "",
  onSubmit,
}: CreateCustomerDialogProps) {
  const [cuit, setCuit] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cuando se abre el diálogo, prellenamos CUIT o nombre según el query
  useEffect(() => {
    if (open) {
      setError(null);
      setSaving(false);

      // Heurística simple: si son casi todo números, lo tomamos como CUIT.
      const trimmed = initialQuery.trim();
      const onlyDigits = trimmed.replace(/\D/g, "");
      if (onlyDigits.length >= 8) {
        setCuit(trimmed);
        setName("");
      } else {
        setName(trimmed);
        setCuit("");
      }
    }
  }, [open, initialQuery]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cuitTrimmed = cuit.trim();
    const nameTrimmed = name.trim();

    if (!cuitTrimmed || !nameTrimmed) {
      setError("CUIT y Razón social son obligatorios.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        cuit: cuitTrimmed,
        name: nameTrimmed,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      // Si el padre no tiró error, cerramos el diálogo
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo crear el cliente.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Nuevo cliente (Factura A)</DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Cargá los datos mínimos para emitir una Factura A. Podés
            completar más datos después desde el módulo de Clientes.
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="CUIT"
              value={cuit}
              onChange={(e) => setCuit(e.target.value)}
              required
              autoFocus
            />

            <TextField
              label="Razón social"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <TextField
              label="Email (opcional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Teléfono (opcional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            {error && (
              <Typography
                variant="body2"
                color="error"
                sx={{ mt: 0.5 }}
              >
                {error}
              </Typography>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleClose}
            disabled={saving}
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{ textTransform: "none", borderRadius: 999, px: 2.5 }}
          >
            {saving ? "Guardando..." : "Guardar cliente"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
