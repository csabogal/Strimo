import { type ReactNode } from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: ReactNode
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-[#0f172a]/80 backdrop-blur-sm"
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#1e293b] shadow-2xl max-h-[calc(100vh-2rem)] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between border-b border-white/5 p-4 sm:p-6 sticky top-0 bg-[#1e293b] z-10">
                                <h3 className="text-lg sm:text-xl font-semibold text-white">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="rounded-lg p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-4 sm:p-6">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
