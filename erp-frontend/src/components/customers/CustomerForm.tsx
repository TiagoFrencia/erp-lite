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
import { Customer, createCustomer, updateCustomer } from '../../api/customers';

type Props = {
  open: boolean;
  onClose: () => void;
  initialCustomer?: Customer | null; // si viene => editar
  onSaved?: (c: Customer) => void;
};

export default function CustomerForm({
  open,
  onClose,
  initialCustomer,
  onSaved,
}: Props) {
  const qc = useQueryClient();
  const isEdit = useMemo(
    () => Boolean(initialCustomer?.id),
    [initialCustomer]
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (initialCustomer) {
      setName(initialCustomer.name ?? '');
      setEmail(initialCustomer.email ?? '');
      setPhone(initialCustomer.phone ?? '');
      setAddress(initialCustomer.address ?? '');
      // si no viene el campo, por defecto lo dejamos activo
      setActive(
        typeof initialCustomer.active === 'boolean'
          ? initialCustomer.active
          : true
      );
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setActive(true);
    }
  }, [initialCustomer, open]);

  const mutCreate = useMutation({
    mutationFn: (payload: Customer) => createCustomer(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      onSaved?.(data);
      onClose();
    },
  });

  const mutUpdate = useMutation({
    mutationFn: (payload: Customer) =>
      updateCustomer(String(initialCustomer!.id!), payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      onSaved?.(data);
      onClose();
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: Customer = {
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      active, // siempre mandamos true/false -> @NotNull del backend queda contento
    };

    if (isEdit) mutUpdate.mutate(payload);
    else mutCreate.mutate(payload);
  };

  const isSubmitting = mutCreate.isPending || mutUpdate.isPending;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      component="form"
      onSubmit={onSubmit}
    >
      <DialogTitle>{isEdit ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
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
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            label="Dirección"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <FormControlLabel
            control={
              <Switch
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
            }
            label="Cliente activo"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
        >
          {isEdit ? 'Guardar cambios' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
