import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { paymentKeys } from './keys'

interface ConfirmRequest {
  paymentKey: string
  orderId: string
  amount: number
}

interface ConfirmResponse {
  orderId: string
  state: string
  amount: number
  balance: number
}

export function useConfirm() {
  return useMutation<ConfirmResponse, Error, ConfirmRequest>({
    mutationKey: paymentKeys.confirm(),
    mutationFn: async (req) => {
      const res = await apiClient.post<ConfirmResponse>('/payments/confirm', req)
      return res.data
    },
  })
}