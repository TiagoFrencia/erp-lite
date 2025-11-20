import  api  from './client'

export type DashboardSummary = {
  monthSalesCount: number
  monthSalesTotal: number
  last7DaysCount: number
}

export async function fetchDashboardSummary() {
  // baseURL ya apunta a '/api' (o VITE_API_BASE_URL con '/api'):
  const r = await api.get<DashboardSummary>('/dashboard/summary')
  return r.data
}
