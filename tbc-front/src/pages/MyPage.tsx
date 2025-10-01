import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { EditProfileDialog } from '@/components/profile/EditProfileDialog'
import { GroupHistoryCard } from '@/components/profile/GroupHistoryCard'
import { FavoriteEventsTab } from '@/components/profile/FavoriteEventsTab'
import { useProfile } from '@/hooks/useProfile'
import { useGroupHistory } from '@/hooks/useGroupHistory'
import { useWalletBalance } from '@/features/payments/api/useBalance'

export function MyPage() {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [showEditDialog, setShowEditDialog] = useState(false)
  
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile()
  const { 
    currentGroups, 
    pastGroups, 
    createdGroups, 
    isLoading: historyLoading 
  } = useGroupHistory()
  const { data: wallet, isLoading: walletLoading } = useWalletBalance()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full shadow-lg">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            로그인이 필요합니다
          </h1>
          <p className="text-gray-600 mb-8">
            마이페이지를 보려면 먼저 로그인해주세요.
          </p>
          <Button 
            onClick={() => window.location.href = '/login'}
            className="w-full bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            로그인하기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full shadow-lg">
              <span className="text-2xl">👤</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              마이페이지
            </h1>
            <p className="text-gray-600">
              프로필을 관리하고 모임 내역을 확인하세요.
            </p>
          </div>
          
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger 
              value="profile"
              className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm rounded-lg font-medium"
            >
              프로필
            </TabsTrigger>
            <TabsTrigger 
              value="joined"
              className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm rounded-lg font-medium"
            >
              참가한 모임
            </TabsTrigger>
            <TabsTrigger 
              value="created"
              className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm rounded-lg font-medium"
            >
              개설한 모임
            </TabsTrigger>
            <TabsTrigger 
              value="favorites"
              className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm rounded-lg font-medium"
            >
              찜한 모임
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {profileLoading ? (
              <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-2xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-600">프로필 정보를 불러오는 중...</p>
              </div>
            ) : (
              <ProfileCard
                profile={profile || undefined}
                onEdit={() => setShowEditDialog(true)}
              />
            )}
          </TabsContent>

          {/* 참가한 모임 탭 */}
          <TabsContent value="joined" className="space-y-6">
            {historyLoading ? (
              <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-2xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-600">모임 정보를 불러오는 중...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* 현재 참여한 모임 */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-amber-400">
                      <span className="text-sm">📅</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      현재 참여 중인 모임
                    </h2>
                  </div>
                  {currentGroups?.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <div className="inline-flex items-center justify-center w-12 h-12 mb-4 text-gray-400 bg-gray-100 rounded-full">
                        <span className="text-xl">📅</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-700 mb-2">현재 참여 중인 모임이 없습니다</h3>
                      <p className="text-gray-500">새로운 모임에 참여해보세요!</p>
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
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-amber-400">
                      <span className="text-sm">📚</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      참가했던 모임
                    </h2>
                  </div>
                  {pastGroups?.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <div className="inline-flex items-center justify-center w-12 h-12 mb-4 text-gray-400 bg-gray-100 rounded-full">
                        <span className="text-xl">📚</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-700 mb-2">참가했던 모임이 없습니다</h3>
                      <p className="text-gray-500">첫 번째 모임에 참여해보세요!</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {pastGroups?.map((group) => (
                        <GroupHistoryCard key={group.id} group={group} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* 개설한 모임 탭 */}
          <TabsContent value="created" className="space-y-6">
            {historyLoading ? (
              <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-2xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-600">모임 정보를 불러오는 중...</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-amber-400">
                    <span className="text-sm">🎯</span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    내가 개설한 모임
                  </h2>
                </div>
                {createdGroups?.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="inline-flex items-center justify-center w-12 h-12 mb-4 text-gray-400 bg-gray-100 rounded-full">
                      <span className="text-xl">🎯</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">개설한 모임이 없습니다</h3>
                    <p className="text-gray-500">새로운 모임을 만들어보세요!</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {createdGroups?.map((group) => (
                      <GroupHistoryCard key={group.id} group={group} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* 찜한 모임 탭 */}
          <TabsContent value="favorites" className="space-y-6">
            <FavoriteEventsTab />
          </TabsContent>
        </Tabs>

        {showEditDialog && (
          <EditProfileDialog
            profile={profile || undefined}
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
