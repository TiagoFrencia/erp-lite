import { useMemo } from 'react'

export function usePagination(totalElements: number, size: number) {
  return useMemo(() => {
    const pages = Math.ceil((totalElements || 0) / (size || 10))
    return pages
  }, [totalElements, size])
}
