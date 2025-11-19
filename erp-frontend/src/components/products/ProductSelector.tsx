// ==========================
//  src/components/products/ProductSelector.tsx
// ==========================
import { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  CircularProgress,
  TextField,
  TextFieldProps,
  Typography,
  Box,
} from "@mui/material";
import { Product, fetchProducts } from "../../api/products";

type ProductSelectorProps = {
  value: Product | null;
  onChange: (product: Product | null) => void;
  label?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  initialQuery?: string;
  textFieldProps?: Omit<TextFieldProps, "error" | "helperText" | "label">;
};

export default function ProductSelector({
  value,
  onChange,
  label = "Producto",
  helperText,
  error,
  disabled,
  initialQuery = "",
  textFieldProps,
}: ProductSelectorProps) {
  const [inputValue, setInputValue] = useState(initialQuery);
  const [options, setOptions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Siempre incluimos el value actual en las opciones (si no está)
  const mergedOptions = useMemo(() => {
    if (!value) return options;
    const exists = options.some((p) => p.id === value.id);
    return exists ? options : [value, ...options];
  }, [options, value]);

  useEffect(() => {
    let active = true;

    async function load() {
      const q = inputValue.trim();

      // 🧯 Si no hay búsqueda o es muy corta, NO cargamos ni mostramos spinner
      if (q.length < 2) {
        if (!active) return;

        setLoading(false);

        // Si hay un value seleccionado, lo dejamos como única opción
        if (value) {
          setOptions([value]);
        } else {
          setOptions([]);
        }
        return;
      }

      setLoading(true);
      try {
        const page = await fetchProducts({
          q,
          page: 0,
          size: 10,
        });

        if (!active) return;
        setOptions(page.content ?? []);
      } catch (e) {
        if (!active) return;
        setOptions([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [inputValue, value]);

  return (
    <Autocomplete
      disabled={disabled}
      options={mergedOptions}
      value={value}
      onChange={(_ev, newValue) => onChange(newValue)}
      getOptionLabel={(option) =>
        option?.name
          ? option.name
          : typeof option === "string"
          ? option
          : ""
      }
      isOptionEqualToValue={(opt, val) => opt.id === val.id}
      // 👇 solo consideramos "loading" cuando realmente hay búsqueda
      loading={loading && inputValue.trim().length >= 2}
      filterOptions={(x) => x}
      onInputChange={(_ev, newInput) => setInputValue(newInput)}
      renderOption={(props, option) => {
        const stock = (option as any)?.stock as number | undefined;

        return (
          <Box component="li" {...props}>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {option.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                SKU: {option.sku ?? "-"} • Precio:{" "}
                {option.salePrice ?? "-"}
                {typeof stock === "number" && ` • Stock: ${stock}`}
              </Typography>
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {/* 👇 el spinner solo aparece cuando loading de verdad */}
                {loading && inputValue.trim().length >= 2 ? (
                  <CircularProgress color="inherit" size={18} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          {...textFieldProps}
        />
      )}
    />
  );
}
