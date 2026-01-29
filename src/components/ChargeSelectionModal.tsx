import { X, CheckCircle2, Send } from 'lucide-react'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Charge {
    id: string
    platform: string
    amount: number
    dueDate: string
}

interface ChargeSelectionModalProps {
    isOpen: boolean
    onClose: () => void
    mode: 'whatsapp' | 'payment'
    memberName: string
    charges: Charge[]
    onConfirm: (selectedChargeIds: string[]) => void
}

export const ChargeSelectionModal = ({
    isOpen,
    onClose,
    mode,
    memberName,
    charges,
    onConfirm
}: ChargeSelectionModalProps) => {
    // Pre-select all charges by default
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    // Update selected IDs when charges change or modal opens
    useEffect(() => {
        if (isOpen && charges.length > 0) {
            setSelectedIds(new Set(charges.map(c => c.id)))
        }
    }, [isOpen, charges])

    if (!isOpen) return null

    const toggleCharge = (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
    }

    const toggleAll = () => {
        if (selectedIds.size === charges.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(charges.map(c => c.id)))
        }
    }

    const selectedCharges = charges.filter(c => selectedIds.has(c.id))
    const totalAmount = selectedCharges.reduce((sum, c) => sum + c.amount, 0)

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(amount)
    }

    const handleConfirm = () => {
        if (selectedIds.size === 0) return
        onConfirm(Array.from(selectedIds))
    }

    const allSelected = selectedIds.size === charges.length

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-gradient-to-b from-slate-800/95 to-[#1e293b]/95 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col backdrop-blur-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h3 className="text-xl font-bold text-white">
                            {mode === 'whatsapp' ? 'Enviar WhatsApp' : 'Marcar como Pagado'}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">{memberName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="text-slate-400" size={20} />
                    </button>
                </div>

                {/* Charges List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {/* Select All Checkbox */}
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleAll}
                            className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                        />
                        <span className="text-white font-semibold flex-1">
                            {allSelected ? 'Desmarcar todos' : 'Seleccionar todos'}
                        </span>
                    </div>

                    {/* Individual Charges */}
                    {charges.map((charge) => (
                        <label
                            key={charge.id}
                            className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                        >
                            <input
                                type="checkbox"
                                checked={selectedIds.has(charge.id)}
                                onChange={() => toggleCharge(charge.id)}
                                className="w-5 h-5 mt-0.5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-white font-medium truncate">
                                    {charge.platform}
                                </div>
                                <div className="text-sm text-slate-400 mt-1">
                                    Vence: {format(new Date(charge.dueDate), "dd 'de' MMMM", { locale: es })}
                                </div>
                            </div>
                            <div className="text-white font-semibold text-right whitespace-nowrap">
                                {formatCurrency(charge.amount)}
                            </div>
                        </label>
                    ))}
                </div>

                {/* Footer with Total and Actions */}
                <div className="p-6 border-t border-white/10 space-y-4">
                    {/* Total Amount */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-white/10">
                        <span className="text-slate-300 font-medium">
                            Total ({selectedIds.size} {selectedIds.size === 1 ? 'cobro' : 'cobros'})
                        </span>
                        <span className="text-white text-xl font-bold">
                            {formatCurrency(totalAmount)}
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-colors font-medium cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={selectedIds.size === 0}
                            className={`flex-1 px-4 py-3 rounded-lg font-medium flex cursor-pointer items-center justify-center gap-2 transition-all ${mode === 'whatsapp'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/30'
                                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                                } disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}
                        >
                            {mode === 'whatsapp' ? (
                                <>
                                    <Send size={18} />
                                    Enviar WhatsApp
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={18} />
                                    Marcar como Pagado
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
