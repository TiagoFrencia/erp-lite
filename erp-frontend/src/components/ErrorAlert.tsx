import { Alert } from '@mui/material'

export default function ErrorAlert({ message }: { message?: string }) {
  if (!message) return null
  return <Alert severity="error">{message}</Alert>
}
