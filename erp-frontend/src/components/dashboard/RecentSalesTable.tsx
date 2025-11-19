import { Card, CardContent, Typography, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { formatCurrencyARS, formatDateTimeAR } from '../../utils/format';

export type RecentSale = { id: number | string; customerName?: string; total?: number; totalAmount?: number; createdAt?: string };

export default function RecentSalesTable({ rows }: { rows: RecentSale[] }) {
  return (
    <Card elevation={4} sx={{ borderRadius: 3, bgcolor: 'background.paper' }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700 }}>
          Ventas recientes
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => {
              const total = r.total ?? r.totalAmount ?? 0;
              return (
                <TableRow key={String(r.id)}>
                  <TableCell>{r.customerName ?? '—'}</TableCell>
                  <TableCell>{formatCurrencyARS(total)}</TableCell>
                  <TableCell>{r.createdAt ? formatDateTimeAR(r.createdAt) : '—'}</TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={3}>Sin datos</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
