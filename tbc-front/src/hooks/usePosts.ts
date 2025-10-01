import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { Post, CreatePostRequest, PostListResponse } from '@/types/post'

// Posts API functions
const postsApi = {
  // Using events as posts for now - TODO: confirm if we need separate posts endpoint
  getPosts: async (page = 0, size = 12): Promise<PostListResponse> => {
    try {
      const response = await apiClient.get(`/events?page=${page}&size=${size}`)
      console.log('Posts API response:', response.data) // 디버깅용
      
      // API 응답 구조에 따라 적절히 처리
      if (response.data.data) {
        return response.data.data
      } else if (response.data.content) {
        // Spring Boot Page 응답 구조
        return {
          content: response.data.content || [],
          totalElements: response.data.totalElements || 0,
          totalPages: response.data.totalPages || 0,
          size: response.data.size || size,
          number: response.data.number || page
        }
      } else {
        // 빈 응답인 경우 기본값 반환
        return {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: size,
          number: page
        }
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      // 에러 발생 시 빈 응답 반환
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: size,
        number: page
      }
    }
  },

  getPost: async (id: number): Promise<Post> => {
    try {
      const response = await apiClient.get(`/events/${id}`)
      console.log('Post detail API response:', response.data) // 디버깅용
      
      if (response.data.data) {
        return response.data.data
      } else if (response.data) {
        return response.data
      } else {
        throw new Error('Post not found')
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
      throw error
    }
  },

  createPost: async (postData: CreatePostRequest): Promise<Post> => {
    const formData = new FormData()
    formData.append('title', postData.title)
    formData.append('content', postData.content)
    if (postData.image) {
      formData.append('image', postData.image)
    }

    const response = await apiClient.post('/events', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data || response.data
  },

  // TODO: implement update and delete if needed
  updatePost: async (id: number, postData: Partial<CreatePostRequest>): Promise<Post> => {
    const response = await apiClient.put(`/events/${id}`, postData)
    return response.data.data || response.data
  },

  deletePost: async (id: number): Promise<void> => {
    await apiClient.delete(`/events/${id}`)
  }
}

// Posts query keys
export const postsKeys = {
  all: ['posts'] as const,
  lists: () => [...postsKeys.all, 'list'] as const,
  list: (page: number, size: number) => [...postsKeys.lists(), { page, size }] as const,
  details: () => [...postsKeys.all, 'detail'] as const,
  detail: (id: number) => [...postsKeys.details(), id] as const,
}

// Custom hooks for posts
export function usePosts(page = 0, size = 12) {
  return useQuery({
    queryKey: postsKeys.list(page, size),
    queryFn: () => postsApi.getPosts(page, size),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1, // 재시도 횟수 제한
  })
}

export function usePost(id: number) {
  return useQuery({
    queryKey: postsKeys.detail(id),
    queryFn: () => postsApi.getPost(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // 재시도 횟수 제한
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postsApi.createPost,
    onSuccess: () => {
      // Invalidate and refetch posts list
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() })
    },
    onError: (error) => {
      console.error('Failed to create post:', error)
    }
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreatePostRequest> }) =>
      postsApi.updatePost(id, data),
    onSuccess: (data) => {
      // Update the specific post in cache
      queryClient.setQueryData(postsKeys.detail(data.id), data)
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() })
    },
    onError: (error) => {
      console.error('Failed to update post:', error)
    }
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postsApi.deletePost,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: postsKeys.detail(id) })
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() })
    },
    onError: (error) => {
      console.error('Failed to delete post:', error)
    }
  })
}
