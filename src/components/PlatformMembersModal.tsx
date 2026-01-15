import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Check } from 'lucide-react'

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

    // Fetch all members
    const { data: allMembers } = useQuery({
        queryKey: ['members'],
        queryFn: async () => {
            const { data } = await supabase.from('members').select('*')
            return data as Member[] || []
        }
    })

    // Fetch current subscriptions for this platform
    const { data: currentSubs } = useQuery({
        queryKey: ['subscriptions', platform.id],
        queryFn: async () => {
            const { data } = await supabase
                .from('member_subscriptions')
                .select('member_id')
                .eq('platform_id', platform.id)
            return data?.map(s => s.member_id) || []
        }
    })

    useEffect(() => {
        if (currentSubs) {
            setSelectedMembers(currentSubs)
        }
    }, [currentSubs])

    // Mutation to update subscriptions
    const updateSubsMutation = useMutation({
        mutationFn: async (newMemberIds: string[]) => {
            // 1. Get current subs to know what to delete
            const toDelete = currentSubs?.filter(id => !newMemberIds.includes(id)) || []
            const toAdd = newMemberIds.filter(id => !currentSubs?.includes(id)) || []

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
                    const { data: maxOrderData } = await supabase
                        .from('member_subscriptions')
                        .select('rotation_order')
                        .eq('platform_id', platform.id)
                        .order('rotation_order', { ascending: false })
                        .limit(1)
                        .single()

                    if (maxOrderData?.rotation_order) {
                        nextOrder = maxOrderData.rotation_order + 1
                    }
                }

                // Prepare inserts
                const inserts = toAdd.map((memberId, index) => ({
                    member_id: memberId,
                    platform_id: platform.id,
                    rotation_order: platform.payment_strategy === 'rotation' ? nextOrder + index : null,
                    share_cost: platform.payment_strategy === 'rotation' ? platform.cost : 0 // Placeholder for equal, updated below
                }))
                await supabase.from('member_subscriptions').insert(inserts)
            }

            // Update share_cost for EQUAL strategy (for ALL members, existing + new)
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
            onClose()
        },
        onError: (err) => toast.error(err.message)
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

    const handleSave = () => {
        updateSubsMutation.mutate(selectedMembers)
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
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2">
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
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} isLoading={updateSubsMutation.isPending}>Guardar Cambios</Button>
            </div>
        </div>
    )
}
