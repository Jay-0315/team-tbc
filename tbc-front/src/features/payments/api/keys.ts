export const paymentKeys = {
  all: ['payments'] as const,
  charge: () => [...paymentKeys.all, 'charge'] as const,
  confirm: () => [...paymentKeys.all, 'confirm'] as const,
}