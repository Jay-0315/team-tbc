export const eventKeys = {
  root: ['events'] as const,
  list: (params: { category?: string; status?: string; sort?: string; page?: number; size?: number }) =>
    [...eventKeys.root, 'list', params] as const,
  detail: (id: number) => [...eventKeys.root, 'detail', id] as const,
  reviews: (eventId: number) => [...eventKeys.root, 'reviews', eventId] as const,
}


