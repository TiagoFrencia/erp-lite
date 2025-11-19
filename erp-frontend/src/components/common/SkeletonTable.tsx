import { Table, TableBody, TableCell, TableRow, Skeleton } from '@mui/material';

export default function SkeletonTable({ rows = 5, cols = 3 }) {
  return (
    <Table>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: cols }).map((__, j) => (
              <TableCell key={j}>
                <Skeleton variant="text" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
