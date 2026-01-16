import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Check, ArrowUp, ArrowDown } from 'lucide-react'

import { supabase } from '../lib/supabase'
import { Button } from './ui/Button'
import type { Database } from '../lib/database.types'

type Platform = Database['public']['Tables']['platforms']['Row']
type Member = Database['public']['Tables']['members']['Row']

interface PlatformMembersModalProps {
    platform: Platform
    onClose: () => void
}

export const PlatformMembersModal = ({ platform, onClose }: PlatformMembersModalProps) => {
    const queryClient = useQueryClient()
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])
    const [rotationMembers, setRotationMembers] = useState<{ member_id: string, rotation_order: number | null }[]>([])

    // Fetch all members
    const { data: allMembers } = useQuery({
        queryKey: ['members'],
        queryFn: async () => {
            const { data } = await supabase.from('members').select('*')
            return data as Member[] || []
        }
    })

    // Fetch current subscriptions for this platform
    const { data: currentSubsData } = useQuery({
        queryKey: ['subscriptions', platform.id],
        queryFn: async () => {
            const { data } = await supabase
                .from('member_subscriptions')
                .select('member_id, rotation_order')
                .eq('platform_id', platform.id)
                .order('rotation_order', { ascending: true })
            return data || []
        }
    })

    useEffect(() => {
        if (currentSubsData) {
            setSelectedMembers(currentSubsData.map(s => s.member_id))
            if (platform.payment_strategy === 'rotation') {
                setRotationMembers(currentSubsData)
            }
        }
    }, [currentSubsData, platform.payment_strategy])

    // Mutation to update subscriptions (Add/Remove)
    const updateSubsMutation = useMutation({
        mutationFn: async (newMemberIds: string[]) => {
            const currentIds = currentSubsData?.map(s => s.member_id) || []

            // 1. Get current subs to know what to delete
            const toDelete = currentIds.filter(id => !newMemberIds.includes(id)) || []
            const toAdd = newMemberIds.filter(id => !currentIds.includes(id)) || []

            if (toDelete.length > 0) {
                await supabase
                    .from('member_subscriptions')
                    .delete()
                    .eq('platform_id', platform.id)
                    .in('member_id', toDelete)
            }

            if (toAdd.length > 0) {
                // Determine start rotation order
                let nextOrder = 1
                if (platform.payment_strategy === 'rotation') {
                    // Find max order in *current local state* to avoid DB race mostly
                    const maxOrder = rotationMembers.length > 0
                        ? Math.max(...rotationMembers.map(r => r.rotation_order || 0))
                        : 0
                    nextOrder = maxOrder + 1
                }

                // Prepare inserts
                const inserts = toAdd.map((memberId, index) => ({
                    member_id: memberId,
                    platform_id: platform.id,
                    rotation_order: platform.payment_strategy === 'rotation' ? nextOrder + index : null,
                    share_cost: platform.payment_strategy === 'rotation' ? platform.cost : 0
                }))
                await supabase.from('member_subscriptions').insert(inserts)
            }

            // Update share_cost for EQUAL strategy
            if (platform.payment_strategy === 'equal' && newMemberIds.length > 0) {
                const newShare = platform.cost / newMemberIds.length
                await supabase
                    .from('member_subscriptions')
                    .update({ share_cost: newShare })
                    .eq('platform_id', platform.id)
            }

            // Update active_slots count
            await supabase.from('platforms').update({ active_slots: newMemberIds.length }).eq('id', platform.id)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
            queryClient.invalidateQueries({ queryKey: ['platforms'] })
            toast.success('Suscripciones actualizadas')
            if (platform.payment_strategy !== 'rotation') onClose()
        },
        onError: (err) => toast.error(err.message)
    })

    // Mutation to update rotation order
    const reorderMutation = useMutation({
        mutationFn: async (items: { member_id: string, rotation_order: number }[]) => {
            // Upsert doesn't work easily with just these fields if ID isn't primary unique key for just them (it's composite).
            // Safer to update one by one or use an RPC if needed. Loop is fine for small numbers.
            for (const item of items) {
                await supabase
                    .from('member_subscriptions')
                    .update({ rotation_order: item.rotation_order })
                    .match({ platform_id: platform.id, member_id: item.member_id })
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
            toast.success('Orden de turnos actualizado')
        }
    })

    const toggleMember = (memberId: string) => {
        if (selectedMembers.includes(memberId)) {
            setSelectedMembers(prev => prev.filter(id => id !== memberId))
        } else {
            if (platform.total_slots && selectedMembers.length >= platform.total_slots) {
                toast.error(`Máximo ${platform.total_slots} cupos permitidos`)
                return
            }
            setSelectedMembers(prev => [...prev, memberId])
        }
    }

    const handleSave = async () => {
        await updateSubsMutation.mutateAsync(selectedMembers)
        // If rotation, we might want to consolidate orders, but existing logic handles adds.
        // Re-orders are handled by arrow buttons immediately.
        onClose()
    }

    const moveOrder = async (index: number, direction: 'up' | 'down') => {
        if (!rotationMembers) return
        const newOrder = [...rotationMembers]

        if (direction === 'up') {
            if (index === 0) return
            // Swap
            const temp = newOrder[index]
            newOrder[index] = newOrder[index - 1]
            newOrder[index - 1] = temp
        } else {
            if (index === newOrder.length - 1) return
            // Swap
            const temp = newOrder[index]
            newOrder[index] = newOrder[index + 1]
            newOrder[index + 1] = temp
        }

        // Re-assign explicit order numbers 1..N based on new array position
        const updates = newOrder.map((item, idx) => ({
            member_id: item.member_id,
            rotation_order: idx + 1
        }))

        setRotationMembers(updates) // Optimistic UI
        reorderMutation.mutate(updates)
    }

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium text-slate-400 mb-2">
                    Selecciona los miembros para {platform.name}
                    <span className="ml-2 text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full">
                        {selectedMembers.length} / {platform.total_slots} Ocupados
                    </span>
                </h4>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 mb-4">
                    {allMembers?.map(member => {
                        const isSelected = selectedMembers.includes(member.id)
                        return (
                            <div
                                key={member.id}
                                onClick={() => toggleMember(member.id)}
                                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                    ? 'bg-indigo-600/20 border-indigo-500/50'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                        {member.avatar_url ? (
                                            <img src={member.avatar_url} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            member.name.charAt(0)
                                        )}
                                    </div>
                                    <span className={isSelected ? 'text-white' : 'text-slate-400'}>{member.name}</span>
                                </div>
                                {isSelected && <Check size={16} className="text-indigo-400" />}
                            </div>
                        )
                    })}
                </div>

                {/* Rotation Order Section */}
                {platform.payment_strategy === 'rotation' && rotationMembers.length > 0 && (
                    <div className="mt-6 border-t border-white/10 pt-4">
                        <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                            Orden de Turnos (Rotación)
                            <span className="text-xs text-slate-500 font-normal ml-auto">Usa las flechas para reordenar</span>
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {rotationMembers.map((rm, idx) => {
                                const member = allMembers?.find(m => m.id === rm.member_id)
                                if (!member) return null
                                return (
                                    <div key={rm.member_id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 flex items-center justify-center bg-slate-700 rounded-full text-xs font-bold text-white">
                                                {idx + 1}
                                            </span>
                                            <span className="text-sm text-slate-300">{member.name}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => moveOrder(idx, 'up')}
                                                disabled={idx === 0}
                                                className="p-1 hover:bg-white/10 rounded disabled:opacity-30 text-slate-400 disabled:cursor-not-allowed"
                                            >
                                                <ArrowUp size={14} />
                                            </button>
                                            <button
                                                onClick={() => moveOrder(idx, 'down')}
                                                disabled={idx === rotationMembers.length - 1}
                                                className="p-1 hover:bg-white/10 rounded disabled:opacity-30 text-slate-400 disabled:cursor-not-allowed"
                                            >
                                                <ArrowDown size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} isLoading={updateSubsMutation.isPending || reorderMutation.isPending}>Guardar Cambios</Button>
            </div>
        </div>
    )
}
