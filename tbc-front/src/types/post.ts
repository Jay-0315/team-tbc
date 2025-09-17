export interface Post {
  id: number
  title: string
  content: string
  author: {
    id: number
    nickname: string
    realName: string
  }
  createdAt: string
  updatedAt: string
  imageUrl?: string
  // TODO: confirm if posts have comments or if we use events instead
  commentCount?: number
  likeCount?: number
}

export interface CreatePostRequest {
  title: string
  content: string
  image?: File
}

export interface PostListResponse {
  content: Post[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

// Using existing Event structure as posts for now
// TODO: confirm if we should create separate Post entity or use Events
export interface EventCardDTO {
  id: number
  title: string
  description: string
  host: {
    id: number
    nickname: string
  }
  startDate: string
  endDate: string
  location: string
  maxParticipants: number
  currentParticipants: number
  category: string
  status: string
  imageUrl?: string
  isFavorite?: boolean
  reviewCount?: number
  averageRating?: number
}
