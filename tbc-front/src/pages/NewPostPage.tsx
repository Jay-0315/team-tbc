import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useCreatePost } from '@/hooks/usePosts'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

export default function NewPostPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const createPostMutation = useCreatePost()
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null as File | null
  })

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/')
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, image: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('제목과 내용을 모두 입력해주세요.')
      return
    }

    try {
      await createPostMutation.mutateAsync({
        title: formData.title,
        content: formData.content,
        image: formData.image || undefined
      })
      
      toast.success('게시글이 성공적으로 작성되었습니다!')
      navigate('/posts')
    } catch (error) {
      toast.error('게시글 작성에 실패했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto">
        <div className="mx-auto max-w-2xl">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="mb-6 text-2xl font-bold text-gray-900">새 게시글 작성</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-700">
                  제목 *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="게시글 제목을 입력하세요"
                  required
                />
              </div>

              <div>
                <label htmlFor="content" className="block mb-2 text-sm font-medium text-gray-700">
                  내용 *
                </label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="게시글 내용을 입력하세요"
                  required
                />
              </div>

              <div>
                <label htmlFor="image" className="block mb-2 text-sm font-medium text-gray-700">
                  이미지 (선택사항)
                </label>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Preview"
                      className="object-cover w-32 h-32 rounded-md"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/posts')}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={createPostMutation.isPending}
                  className="flex-1"
                >
                  {createPostMutation.isPending ? '작성 중...' : '게시글 작성'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
