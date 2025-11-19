// ==========================
//  src/components/sales/SaleItemForm.tsx
// ==========================
import { ChangeEvent, KeyboardEvent, useMemo } from "react";
import {
  Box,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Product } from "../../api/products";
import ProductSelector from "../products/ProductSelector";

export type SaleItemFormValue = {
  product: Product | null;
  quantity: number;
};

type SaleItemFormProps = {
  value: SaleItemFormValue;
  onChange: (value: SaleItemFormValue) => void;
  onRemove?: () => void;
  disabled?: boolean;
  index?: number; // por si querés mostrar el número de fila
  /**
   * Se dispara cuando el usuario aprieta Enter en la cantidad.
   * El padre puede usarlo para enfocar el siguiente ítem o agregar una fila nueva.
   */
  onRequestFocusNext?: () => void;
};

export default function SaleItemForm({
  value,
  onChange,
  onRemove,
  disabled,
  index,
  onRequestFocusNext,
}: SaleItemFormProps) {
  const { product, quantity } = value;

  const unitPrice = useMemo(
    () => product?.salePrice ?? 0,
    [product]
  );

  const lineTotal = useMemo(
    () => (quantity > 0 ? unitPrice * quantity : 0),
    [quantity, unitPrice]
  );

  function updateQuantity(next: number) {
    const safeQty =
      !Number.isFinite(next) || next <= 0 ? 1 : Math.floor(next);

    onChange({
      ...value,
      quantity: safeQty,
    });
  }

  function handleQuantityChange(ev: ChangeEvent<HTMLInputElement>) {
    const raw = ev.target.value;
    const parsed = Number(raw.replace(",", "."));
    updateQuantity(parsed);
  }

  function handleQuantityKeyDown(ev: KeyboardEvent<HTMLInputElement>) {
    if (ev.key === "ArrowUp") {
      ev.preventDefault();
      updateQuantity((quantity || 0) + 1);
      return;
    }

    if (ev.key === "ArrowDown") {
      ev.preventDefault();
      updateQuantity((quantity || 0) - 1);
      return;
    }

    if (ev.key === "Enter" || ev.key === "NumpadEnter") {
      if (onRequestFocusNext) {
        ev.preventDefault();
        onRequestFocusNext();
      }
    }
  }

  function handleProductChange(newProduct: Product | null) {
    onChange({
      ...value,
      product: newProduct,
    });
  }

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        p: 1.5,
        mb: 1,
        backgroundColor: "background.paper",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        {typeof index === "number" && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ width: 24 }}
          >
            {index + 1}
          </Typography>
        )}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <ProductSelector
            value={product}
            onChange={handleProductChange}
            label="Producto"
            disabled={disabled}
          />
        </Box>

        <TextField
          label="Cantidad"
          type="number"
          value={quantity || ""}
          onChange={handleQuantityChange}
          onKeyDown={handleQuantityKeyDown}
          disabled={disabled}
          inputProps={{
            min: 1,
            inputMode: "numeric",
            pattern: "[0-9]*",
            // Quita el estilo de spinner en Firefox
            style: { MozAppearance: "textfield" },
          }}
          sx={{
            width: 120,
            // Quita las flechitas (spinner) en Chrome / Edge / Safari
            "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
              {
                WebkitAppearance: "none",
                margin: 0,
              },
          }}
        />

        <Box sx={{ minWidth: 140, textAlign: "right" }}>
          <Typography variant="caption" color="text.secondary">
            Precio unitario
          </Typography>
          <Typography variant="body2">
            {unitPrice ? unitPrice.toFixed(2) : "-"}
          </Typography>
        </Box>

        <Box sx={{ minWidth: 140, textAlign: "right" }}>
          <Typography variant="caption" color="text.secondary">
            Subtotal
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {lineTotal ? lineTotal.toFixed(2) : "-"}
          </Typography>
        </Box>

        {onRemove && (
          <IconButton
            aria-label="Eliminar ítem"
            onClick={onRemove}
            disabled={disabled}
            sx={{ ml: 1 }}
          >
            <DeleteIcon />
          </IconButton>
        )}
      </Stack>
    </Box>
  );
}
