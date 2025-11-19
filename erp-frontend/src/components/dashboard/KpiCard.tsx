import { Card, CardContent, Stack, Typography } from '@mui/material';

type Props = { label: string; value: string; caption?: string };

export default function KpiCard({ label, value, caption }: Props) {
  return (
    <Card elevation={4} sx={{ borderRadius: 3, bgcolor: '#182234', boxShadow: '0 8px 20px rgba(0,0,0,0.25)' }}>
      <CardContent>
        <Stack spacing={0.5}>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1.2 }}>
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ color: 'primary.main', textShadow: '0 0 8px rgba(255,68,51,0.25)' }}>
            {value}
          </Typography>
          {caption && (
            <Typography variant="caption" color="text.secondary">
              {caption}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
