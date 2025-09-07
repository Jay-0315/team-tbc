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
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-card"
                style={{ width }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="icon-btn" aria-label="close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    )
}
