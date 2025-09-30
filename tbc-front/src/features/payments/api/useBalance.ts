import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export type WalletBalance = {
  userId: number
  balance: number
}

export function useWalletBalance() {
  return useQuery<WalletBalance>({
    queryKey: ['wallet','balance','me'],
    queryFn: async () => {
      const { data } = await apiClient.get<WalletBalance>('/payments/wallet/me')
      return data
    },
    staleTime: 0,
    retry: 1,
  })
}