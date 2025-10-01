import { ReactNode } from 'react'

type ModalProps = {
    title: string
    isOpen: boolean
    onClose: () => void
    children: ReactNode
    width?: number
}

export default function Modal({
                                  title,
                                  isOpen,
                                  onClose,
                                  children,
                                  width = 440,
                              }: ModalProps) {
    if (!isOpen) return null
    return (
        <div className="modal-overlay">
            {/* 우측 상단 닫기 버튼 - 반투명 동그라미 */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-[60] flex items-center justify-center w-10 h-10 text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full transition-all hover:scale-110 shadow-lg"
                aria-label="닫기"
            >
                ✕
            </button>
            
            <div
                className="modal-card"
                style={{ width }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3>{title}</h3>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    )
}
