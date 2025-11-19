import { Card, CardContent, Typography } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export type Point = { date: string; total: number };

export default function SalesAreaChart({ data }: { data: Point[] }) {
  return (
    <Card elevation={4} sx={{ borderRadius: 3, height: 360, bgcolor: 'background.paper' }}>
      <CardContent sx={{ height: '100%' }}>
        <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700 }}>
          Ventas últimos 14 días
        </Typography>

        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={data}>
            {/* Estos son elementos SVG nativos: no se importan */}
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF4433" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#FF4433" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#CBD5E1' }} tickLine={false} />
            <YAxis tick={{ fill: '#CBD5E1' }} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: '#111827',
                border: '1px solid #FF4433',
                color: '#F8FAFC',
                borderRadius: 8,
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#FF4433"
              strokeWidth={3}
              fill="url(#salesGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
