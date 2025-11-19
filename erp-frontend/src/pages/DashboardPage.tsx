// ==========================
//  src/pages/DashboardPage.tsx
// ==========================
import React, { useMemo } from 'react';
import { Grid, Typography, Stack } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import KpiCard from '../components/dashboard/KpiCard';
import SalesAreaChart, { Point } from '../components/dashboard/SalesAreaChart';
import RecentSalesTable, { RecentSale } from '../components/dashboard/RecentSalesTable';
import { formatCurrencyARS } from '../utils/format';
import api from '../api/client';
import { fetchProducts, getLowStockCount, type Product } from '../api/products';

// ---- Tipos mínimos para las ventas del backend (SaleResponse) ----
type SaleResponse = {
  saleId?: number;
  customerName?: string;
  total?: number;
  subtotal?: number;
  totalAmount?: number;
  createdAt?: string; // ISO string
};

type Page<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};

// Normalizar un string de fecha del backend a "YYYY-MM-DD"
function toDayKey(raw?: string | null): string | null {
  if (!raw) return null;
  const iso = raw.length > 10 ? raw : `${raw}T00:00:00`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

const DashboardPage: React.FC = () => {
  // ==========================
  //  Query: productos (para total de productos)
  // ==========================
  const { data: productsPage } = useQuery<Page<Product>, Error>({
    queryKey: ['products', { scope: 'dashboard-count' }],
    queryFn: () => fetchProducts({ page: 0, size: 1 }),
    placeholderData: (prev) => prev,
  });

  const totalProducts =
    (productsPage as any)?.totalElements ??
    productsPage?.content?.length ??
    0;

  // ==========================
  //  Query: stock bajo (mismo criterio que Sidebar)
  // ==========================
  const { data: lowStockData } = useQuery<number, Error>({
    queryKey: ['products', 'low-stock-count', { threshold: 5 }],
    queryFn: () => getLowStockCount(5),
  });

  const lowStockCount = lowStockData ?? 0;

  // ==========================
  //  Query: ventas (primer página, últimas ventas)
  // ==========================
  const { data: salesPage } = useQuery<Page<SaleResponse>>({
    queryKey: ['sales', { page: 0, size: 100 }],
    queryFn: async () => {
      const resp = await api.get('/sales', {
        params: { page: 0, size: 100 },
      });
      const data = resp.data as any;
      return {
        content: Array.isArray(data.content) ? (data.content as SaleResponse[]) : [],
        totalPages: data.totalPages ?? 1,
        totalElements: data.totalElements ?? 0,
        number: data.number ?? 0,
        size: data.size ?? 10,
      };
    },
    placeholderData: (prev) => prev,
  });

  const sales: SaleResponse[] = salesPage?.content ?? [];

  // ==========================
  //  Ventas de hoy (KPI principal)
  // ==========================
  const todayTotal = useMemo(() => {
    if (!sales.length) return 0;

    const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return sales.reduce((acc, s) => {
      const key = toDayKey(s.createdAt);
      if (key !== todayKey) return acc;

      const total =
        typeof s.totalAmount === 'number'
          ? s.totalAmount
          : typeof s.total === 'number'
          ? s.total
          : 0;

      return acc + total;
    }, 0);
  }, [sales]);

  // ==========================
  //  Serie para "Ventas últimos 14 días"
  // ==========================
  const series: Point[] = useMemo(() => {
    // 1) Inicializar últimos 14 días en 0
    const map = new Map<string, number>(); // key = YYYY-MM-DD
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, 0);
    }

    // 2) Acumular montos por día
    for (const s of sales) {
      const key = toDayKey(s.createdAt);
      if (!key || !map.has(key)) continue;

      const total =
        typeof s.totalAmount === 'number'
          ? s.totalAmount
          : typeof s.total === 'number'
          ? s.total
          : 0;

      map.set(key, (map.get(key) ?? 0) + total);
    }

    // 3) Pasar a array ordenado y formatear fecha a dd/MM para el eje X
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, total]) => {
        const mm = key.slice(5, 7);
        const dd = key.slice(8, 10);
        return {
          date: `${dd}/${mm}`, // ej: "18/11"
          total,
        };
      });
  }, [sales]);

  // ==========================
  //  Ventas recientes (tabla derecha)
  // ==========================
  const recentRows: RecentSale[] = useMemo(() => {
    return sales.slice(0, 5).map((s) => {
      const total =
        typeof s.totalAmount === 'number'
          ? s.totalAmount
          : typeof s.total === 'number'
          ? s.total
          : 0;

      return {
        id: s.saleId ?? `${s.customerName}-${s.createdAt ?? ''}`,
        customerName: s.customerName ?? 'Consumidor Final',
        total,
        totalAmount: total,
        createdAt: s.createdAt,
      };
    });
  }, [sales]);

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={800}>
        Dashboard
      </Typography>

      <Grid container spacing={2}>
        {/* KPI: Ventas de hoy */}
        <Grid item xs={12} md={4}>
          <KpiCard
            label="Ventas de hoy"
            value={formatCurrencyARS(todayTotal)}
            caption="Basado en ventas registradas hoy"
          />
        </Grid>

        {/* KPI: Productos en catálogo */}
        <Grid item xs={12} md={4}>
          <KpiCard
            label="Productos"
            value={String(totalProducts)}
            caption="En catálogo"
          />
        </Grid>

        {/* KPI: Stock bajo (mismo criterio que Sidebar) */}
        <Grid item xs={12} md={4}>
          <KpiCard
            label="Stock bajo"
            value={String(lowStockCount)}
            caption={
              lowStockCount > 0 ? 'Revisar alertas de stock' : 'Todo en orden'
            }
          />
        </Grid>

        {/* Gráfico de ventas últimos 14 días */}
        <Grid item xs={12} md={8}>
          <SalesAreaChart data={series} />
        </Grid>

        {/* Ventas recientes */}
        <Grid item xs={12} md={4}>
          <RecentSalesTable rows={recentRows} />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default DashboardPage;
