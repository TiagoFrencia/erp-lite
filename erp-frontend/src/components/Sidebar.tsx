import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { List, ListItemButton, ListItemText, Box, Chip } from '@mui/material';
import { getLowStockCount } from '../api/products';

export default function Sidebar() {
  const [lowStock, setLowStock] = useState<number>(0);

  useEffect(() => {
    let active = true;
    getLowStockCount()
      .then((n) => active && setLowStock(n))
      .catch(() => {});
      return () => {
      active = false;
      };
  }, []);

  const links: Array<{ to: string; label: string; withBadge?: boolean }> = [
    { to: '/', label: 'Dashboard' },
    { to: '/sales', label: 'Ventas' },
    { to: '/sales/new', label: 'Nueva venta' },
    { to: '/products', label: 'Productos' },
    // 👇 sacamos la entrada de /products/new
    { to: '/stock', label: 'Stock', withBadge: true },
    { to: '/customers', label: 'Clientes' },
  ];

  return (
    <Box sx={{ width: 240, p: 1 }}>
      <List component="nav">
        {links.map((link) => (
          <ListItemButton key={link.to} component={NavLink} to={link.to}>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{link.label}</span>
                  {link.withBadge && (
                    <Chip
                      size="small"
                      label={lowStock}
                      color={lowStock > 0 ? 'error' : 'default'}
                      sx={{ height: 20 }}
                    />
                  )}
                </Box>
              }
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
