import { api } from './client'

export type SaleItem = {
  id: number | string
  productId?: number | string
  quantity?: number
  unitPrice?: number
  subtotal?: number
}

export type Sale = {
  id: number | string
  customerName?: string
  total?: number
  totalAmount?: number
  createdAt?: string // ISO
  date?: string      // posible variante
  items?: SaleItem[]
}

export type Page<T> = {
  content: T[]
  page?: number
  size?: number
  totalPages?: number
  totalElements?: number
}

/**
 * Descarga ventas en un rango de fechas [start, end] (YYYY-MM-DD),
 * devolviendo una página grande para calcular series por día en el front.
 */
export async function fetchSalesByDateRange(params: {
  start: string
  end: string
  size?: number
}) {
  const { start, end, size = 200 } = params
  const r = await api.get<Page<Sale>>('/sales', {
    params: { startDate: start, endDate: end, page: 0, size, sort: 'createdAt,desc' }
  })
  return r.data
}

/** Últimas N ventas (para tabla “Recientes”) */
export async function fetchRecentSales(limit = 8) {
  const r = await api.get<Page<Sale>>('/sales', {
    params: { page: 0, size: limit, sort: 'createdAt,desc' }
  })
  return r.data
}
