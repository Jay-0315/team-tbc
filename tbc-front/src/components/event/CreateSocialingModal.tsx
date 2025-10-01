import { Dialog, DialogContent } from "@/components/ui/dialog"
import CreateEventWizard from "@/pages/events/CreateEventWizard"

type Props = {
  isOpen: boolean
  onClose: () => void
  onCreated: (groupId: number, roomId: number) => void
}

export default function CreateSocialingModal({ isOpen, onClose, onCreated }: Props) {
  const handleCreated = (groupId: number, roomId: number) => {
    onCreated(groupId, roomId)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-white"
        aria-describedby="create-socialing-description"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* 우측 상단 닫기 버튼 - 반투명 동그라미 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 flex items-center justify-center w-10 h-10 text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full transition-all hover:scale-110 shadow-lg"
          aria-label="닫기"
        >
          ✕
        </button>
        
        <div id="create-socialing-description" className="sr-only">
          새로운 소셜링을 만들 수 있는 양식입니다. 기본 정보, 상세 정보, 내용 작성의 3단계로 구성되어 있습니다.
        </div>
        <CreateEventWizard onCreated={handleCreated} isModal={true} />
      </DialogContent>
    </Dialog>
  )
}