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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-br from-slate-50 via-white to-slate-100"
        aria-describedby="create-socialing-description"
      >
        <div id="create-socialing-description" className="sr-only">
          새로운 소셜링을 만들 수 있는 양식입니다. 기본 정보, 상세 정보, 내용 작성의 3단계로 구성되어 있습니다.
        </div>
        <CreateEventWizard onCreated={handleCreated} isModal={true} />
      </DialogContent>
    </Dialog>
  )
}