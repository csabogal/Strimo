import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, MonitorPlay, Users, RotateCw, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { PlatformForm } from '../components/forms/PlatformForm'
import type { Database } from '../lib/database.types'

type Platform = Database['public']['Tables']['platforms']['Row']

import { PlatformMembersModal } from '../components/PlatformMembersModal'

export const Platforms = () => {
    const queryClient = useQueryClient()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
    const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null)
    const [managingPlatform, setManagingPlatform] = useState<Platform | null>(null)

    const { data: platforms, isLoading } = useQuery({
        queryKey: ['platforms'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('platforms')
                .select('*')
                .order('name')
            if (error) throw error
            return data
        }
    })

    // Create
    const createMutation = useMutation({
        mutationFn: async (newPlatform: any) => {
            const { error } = await supabase.from('platforms').insert(newPlatform)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platforms'] })
            toast.success('Plataforma creada')
            handleCloseModal()
        },
        onError: (err) => toast.error(err.message)
    })

    // Update
    const updateMutation = useMutation({
        mutationFn: async (platform: any) => {
            const { id, ...updates } = platform
            const { error } = await supabase.from('platforms').update(updates).eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platforms'] })
            toast.success('Plataforma actualizada')
            handleCloseModal()
        },
        onError: (err) => toast.error(err.message)
    })

    // Delete
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('platforms').delete().eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platforms'] })
            toast.success('Plataforma eliminada')
        },
        onError: (err) => toast.error(err.message)
    })

    const handleCreate = (data: any) => createMutation.mutate(data)
    const handleUpdate = (data: any) => {
        if (!editingPlatform) return
        updateMutation.mutate({ ...data, id: editingPlatform.id })
    }

    const handleDelete = (id: string) => {
        if (confirm('¿Estás seguro de eliminar esta plataforma?')) {
            deleteMutation.mutate(id)
        }
    }

    const handleEdit = (platform: Platform) => {
        setEditingPlatform(platform)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingPlatform(null)
    }

    const handleManageMembers = (platform: Platform) => {
        setManagingPlatform(platform)
        setIsMembersModalOpen(true)
    }

    const handleCloseMembersModal = () => {
        setIsMembersModalOpen(false)
        setManagingPlatform(null)
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Plataformas
                    </h1>
                    <p className="text-slate-400 mt-1">Netflix, Spotify, HBO, etc.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} className="mr-2" />
                    Nueva Plataforma
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-slate-500">Cargando plataformas...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {platforms?.map((platform) => (
                        // Card
                        <div
                            key={platform.id}
                            className="group relative bg-[#1e293b]/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3 items-center">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2">
                                        {platform.icon_url ? (
                                            <img src={platform.icon_url} alt={platform.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <MonitorPlay className="text-slate-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{platform.name}</h3>
                                        <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                            {platform.billing_cycle === 'monthly' ? 'Mensual' : 'Anual'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <Wallet size={16} />
                                        <span>Costo</span>
                                    </div>
                                    <span className="font-semibold text-white">{formatCurrency(platform.cost)}</span>
                                </div>

                                <div
                                    className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                                    onClick={() => handleManageMembers(platform)}
                                >
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <Users size={16} />
                                        <span>Cupos</span>
                                    </div>
                                    <span className="font-semibold text-white">
                                        {platform.active_slots} / {platform.total_slots}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
                                    {platform.payment_strategy === 'rotation' ? (
                                        <>
                                            <RotateCw size={12} className="text-indigo-400" />
                                            <span className="text-indigo-400 font-medium">Estrategia: Rotación</span>
                                        </>
                                    ) : (
                                        <>
                                            <Users size={12} className="text-emerald-400" />
                                            <span className="text-emerald-400 font-medium">Estrategia: Equitativo</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button
                                    onClick={() => handleEdit(platform)}
                                    className="p-2 bg-white/10 rounded-lg hover:bg-indigo-500 hover:text-white transition-colors text-slate-400"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(platform.id)}
                                    className="p-2 bg-white/10 rounded-lg hover:bg-red-500 hover:text-white transition-colors text-slate-400"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingPlatform ? 'Editar Plataforma' : 'Nueva Plataforma'}
            >
                <PlatformForm
                    initialData={editingPlatform || undefined}
                    onSubmit={editingPlatform ? handleUpdate : handleCreate}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                    onCancel={handleCloseModal}
                />
            </Modal>

            {managingPlatform && (
                <Modal
                    isOpen={isMembersModalOpen}
                    onClose={handleCloseMembersModal}
                    title={`Gestionar Miembros - ${managingPlatform.name}`}
                >
                    <PlatformMembersModal
                        platform={managingPlatform}
                        onClose={handleCloseMembersModal}
                    />
                </Modal>
            )}
        </div>
    )
}
