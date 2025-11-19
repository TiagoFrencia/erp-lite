// ==========================
//  src/components/customers/CustomerSelector.tsx
// ==========================
import { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  CircularProgress,
  TextField,
  TextFieldProps,
  Box,
  Button,
  Typography,
} from "@mui/material";
import {
  Customer,
  fetchCustomers,
  Page as CustomersPage,
} from "../../api/customers";

type CustomerSelectorProps = {
  value: Customer | null;
  onChange: (customer: Customer | null) => void;
  label?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  /**
   * Texto de búsqueda inicial (por ejemplo, para pre-cargar por nombre).
   */
  initialQuery?: string;
  /**
   * Props extra para el TextField interno.
   */
  textFieldProps?: Omit<TextFieldProps, "error" | "helperText" | "label">;
  /**
   * Callback opcional para cuando no se encuentran resultados y
   * el usuario quiere crear un nuevo cliente (Factura A).
   * Suele llamarse con el valor actual del input (CUIT o nombre).
   */
  onCreateRequested?: (rawQuery: string) => void;
};

export default function CustomerSelector({
  value,
  onChange,
  label = "Cliente",
  helperText,
  error,
  disabled,
  initialQuery = "",
  textFieldProps,
  onCreateRequested,
}: CustomerSelectorProps) {
  const [inputValue, setInputValue] = useState(initialQuery);
  const [options, setOptions] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  // Evitar perder el valor actual si no está en la lista de opciones
  const mergedOptions = useMemo(() => {
    if (!value) return options;
    const exists = options.some((c) => c.id === value.id);
    return exists ? options : [value, ...options];
  }, [options, value]);

  useEffect(() => {
    let active = true;

    async function load() {
      // No pegamos al backend por cada letra, pero un mínimo de 2 chars ayuda
      if (!inputValue || inputValue.trim().length < 2) {
        setOptions((prev) => (value ? [value, ...prev] : prev));
        return;
      }

      setLoading(true);
      try {
        const page: CustomersPage<Customer> = await fetchCustomers({
          q: inputValue.trim(),
          page: 0,
          size: 10,
        });

        if (!active) return;
        setOptions(page.content ?? []);
      } catch (e) {
        // Podríamos loguear o mostrar algo, pero preferimos no romper nada
        if (!active) return;
        setOptions([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [inputValue, value]);

  const trimmedInput = inputValue.trim();
  const canSuggestCreate =
    !!onCreateRequested && trimmedInput.length >= 2 && !loading;

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
      loading={loading}
      filterOptions={(x) => x} // dejamos que el filtrado lo haga el backend
      onInputChange={(_ev, newInput) => setInputValue(newInput)}
      noOptionsText={
        canSuggestCreate ? (
          <Box sx={{ py: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              No se encontraron clientes para &quot;{trimmedInput}&quot;.
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onMouseDown={(e) => e.preventDefault()} // evita que se cierre mal el dropdown
              onClick={() => onCreateRequested(trimmedInput)}
              sx={{
                textTransform: "none",
                borderRadius: 999,
                px: 1.5,
                fontSize: 12,
              }}
            >
              Crear cliente con este dato
            </Button>
          </Box>
        ) : (
          "No se encontraron clientes"
        )
      }
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
                {loading ? (
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
