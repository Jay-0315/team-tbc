import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { paymentKeys } from './keys'

interface CreatePaymentRequest {
  userId: number
  orderId: string
  amount: number
  orderName: string
}

interface CreatePaymentResponse {
  orderId: string
}

export function useCharge() {
  return useMutation<CreatePaymentResponse, Error, CreatePaymentRequest>({
    mutationKey: paymentKeys.charge(),
    mutationFn: async (req) => {
      const res = await apiClient.post<CreatePaymentResponse>('/payments/charge', req)
      return res.data
    },
  })
}
