import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Product,
  ProductPayload,
  createProduct,
  updateProduct,
} from '../../api/products';

type Props = {
  open: boolean;
  onClose: () => void;
  initialProduct?: Product | null; // si viene => editar
  onSaved?: (p: Product) => void;
};

export default function ProductForm({
  open,
  onClose,
  initialProduct,
  onSaved,
}: Props) {
  const qc = useQueryClient();

  const isEdit = useMemo(() => Boolean(initialProduct?.id), [initialProduct]);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [active, setActive] = useState(true);

  // nuevos campos
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [barcode, setBarcode] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [costPrice, setCostPrice] = useState<number | undefined>(undefined);
  const [profitMargin, setProfitMargin] = useState<number | undefined>(
    undefined
  );
  const [salePrice, setSalePrice] = useState<number | undefined>(undefined);
  const [stockMin, setStockMin] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name ?? '');
      setSku(initialProduct.sku ?? '');
      setPrice(Number(initialProduct.price ?? initialProduct.salePrice ?? 0));
      setStock(Number(initialProduct.stock ?? 0));
      setActive(
        initialProduct.active !== undefined ? !!initialProduct.active : true
      );

      setCategory(initialProduct.category ?? '');
      setDescription(initialProduct.description ?? '');
      setBarcode(initialProduct.barcode ?? '');
      setImageUrl(initialProduct.imageUrl ?? '');
      setCostPrice(
        initialProduct.costPrice !== undefined
          ? Number(initialProduct.costPrice)
          : undefined
      );
      setProfitMargin(
        initialProduct.profitMargin !== undefined
          ? Number(initialProduct.profitMargin)
          : undefined
      );
      setSalePrice(
        initialProduct.salePrice !== undefined
          ? Number(initialProduct.salePrice)
          : undefined
      );
      setStockMin(
        initialProduct.stockMin !== undefined
          ? Number(initialProduct.stockMin)
          : undefined
      );
    } else {
      setName('');
      setSku('');
      setPrice(0);
      setStock(0);
      setActive(true);

      setCategory('');
      setDescription('');
      setBarcode('');
      setImageUrl('');
      setCostPrice(undefined);
      setProfitMargin(undefined);
      setSalePrice(undefined);
      setStockMin(undefined);
    }
  }, [initialProduct, open]);

  const mutCreate = useMutation({
    mutationFn: (payload: ProductPayload) => createProduct(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['stock'] });
      onSaved?.(data);
      onClose();
    },
  });

  const mutUpdate = useMutation({
    mutationFn: (payload: ProductPayload) =>
      updateProduct(Number(initialProduct!.id!), payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['stock'] });
      onSaved?.(data);
      onClose();
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalPrice = Number(price) || 0;
    const finalSalePrice =
      salePrice !== undefined ? Number(salePrice) || 0 : finalPrice;

    const payload: ProductPayload = {
      name: name.trim(),
      sku: sku.trim(),
      price: finalPrice,
      stock: Number(stock) || 0,
      active,

      category: category.trim() || undefined,
      description: description.trim() || undefined,
      barcode: barcode.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,

      costPrice:
        costPrice !== undefined ? Number(costPrice) || 0 : undefined,
      profitMargin:
        profitMargin !== undefined ? Number(profitMargin) || 0 : undefined,
      salePrice: finalSalePrice,
      stockMin:
        stockMin !== undefined ? Number(stockMin) || 0 : undefined,
    };

    if (isEdit) mutUpdate.mutate(payload);
    else mutCreate.mutate(payload);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      component="form"
      onSubmit={onSubmit}
    >
      <DialogTitle>{isEdit ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <TextField
              label="SKU"
              value={sku}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, ""); // solo números
                const formatted = raw.padStart(3, "0");        // 001, 045, 300
                setSku(formatted);
              }}
              required
            />

          <TextField
            label="Categoría"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <TextField
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={2}
          />

          <TextField
            label="Código de barras"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />

          <TextField
            label="URL de imagen"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          <TextField
            label="Precio costo"
            type="number"
            value={costPrice ?? ''}
            onChange={(e) =>
              setCostPrice(
                e.target.value === '' ? undefined : Number(e.target.value)
              )
            }
            inputProps={{ min: 0, step: '0.01' }}
          />

          <TextField
            label="Margen de ganancia (%)"
            type="number"
            value={profitMargin ?? ''}
            onChange={(e) =>
              setProfitMargin(
                e.target.value === '' ? undefined : Number(e.target.value)
              )
            }
            inputProps={{ min: 0, step: '0.01' }}
          />

          <TextField
            label="Precio venta"
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value || 0))}
            inputProps={{ min: 0, step: '0.01' }}
            required
          />

          <TextField
            label="Stock inicial"
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value || 0))}
            inputProps={{ min: 0, step: '1' }}
            required
          />

          <TextField
            label="Stock mínimo"
            type="number"
            value={stockMin ?? ''}
            onChange={(e) =>
              setStockMin(
                e.target.value === '' ? undefined : Number(e.target.value)
              )
            }
            inputProps={{ min: 0, step: '1' }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
            }
            label="Activo"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          type="submit"
          variant="contained"
          disabled={mutCreate.isPending || mutUpdate.isPending}
        >
          {isEdit ? 'Guardar cambios' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
