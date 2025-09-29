import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { EditProfileDialog } from '@/components/profile/EditProfileDialog'
import { GroupHistoryCard } from '@/components/profile/GroupHistoryCard'
import { useProfile } from '@/hooks/useProfile'
import { useGroupHistory } from '@/hooks/useGroupHistory'

export function MyPage() {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [showEditDialog, setShowEditDialog] = useState(false)
  
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile()
  const { 
    currentGroups, 
    pastGroups, 
    createdGroups, 
    isLoading: historyLoading 
  } = useGroupHistory()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            로그인이 필요합니다
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            마이페이지를 보려면 먼저 로그인해주세요.
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            로그인하기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            마이페이지
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            프로필을 관리하고 모임 내역을 확인하세요.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="profile">프로필</TabsTrigger>
            <TabsTrigger value="groups">모임 내역</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {profileLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ProfileCard 
                profile={profile} 
                onEdit={() => setShowEditDialog(true)}
              />
            )}
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            {historyLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* 현재 참여한 모임 */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    현재 참여한 모임
                  </h2>
                  {currentGroups?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      현재 참여한 모임이 없습니다.
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {currentGroups?.map((group) => (
                        <GroupHistoryCard key={group.id} group={group} />
                      ))}
                    </div>
                  )}
                </div>

                {/* 과거 참여한 모임 */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    과거 참여한 모임
                  </h2>
                  {pastGroups?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      과거 참여한 모임이 없습니다.
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {pastGroups?.map((group) => (
                        <GroupHistoryCard key={group.id} group={group} />
                      ))}
                    </div>
                  )}
                </div>

                {/* 개설한 모임 */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    개설한 모임
                  </h2>
                  {createdGroups?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      개설한 모임이 없습니다.
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {createdGroups?.map((group) => (
                        <GroupHistoryCard key={group.id} group={group} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {showEditDialog && (
          <EditProfileDialog
            profile={profile}
            onClose={() => setShowEditDialog(false)}
            onSuccess={() => {
              setShowEditDialog(false)
              refetchProfile()
            }}
          />
        )}
      </div>
    </div>
  )
}
