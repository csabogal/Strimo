import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Phone, Mail } from 'lucide-react'

import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { MemberForm } from '../components/forms/MemberForm'
import type { Database } from '../lib/database.types'

type Member = Database['public']['Tables']['members']['Row']

export const Members = () => {
    const queryClient = useQueryClient()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingMember, setEditingMember] = useState<Member | null>(null)

    // Fetch Members
    const { data: members, isLoading } = useQuery({
        queryKey: ['members'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('members')
                .select('*')
                .order('name')

            if (error) throw error
            return data
        }
    })

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: async (newMember: any) => {
            const { error } = await supabase.from('members').insert(newMember)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] })
            toast.success('Miembro creado exitosamente')
            handleCloseModal()
        },
        onError: (error) => {
            toast.error('Error al crear miembro: ' + error.message)
        }
    })

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: async (member: any) => {
            const { id, ...updates } = member
            const { error } = await supabase.from('members').update(updates).eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] })
            toast.success('Miembro actualizado exitosamente')
            handleCloseModal()
        },
        onError: (error) => {
            toast.error('Error al actualizar: ' + error.message)
        }
    })

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('members').delete().eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] })
            toast.success('Miembro eliminado')
        },
        onError: (error) => {
            toast.error('Error al eliminar: ' + error.message)
        }
    })

    const handleCreate = (data: any) => {
        createMutation.mutate(data)
    }

    const handleUpdate = (data: any) => {
        if (!editingMember) return
        updateMutation.mutate({ ...data, id: editingMember.id })
    }

    const handleEditClick = (member: Member) => {
        setEditingMember(member)
        setIsModalOpen(true)
    }

    const handleDeleteClick = (id: string) => {
        if (confirm('¿Estás seguro de eliminar este miembro?')) {
            deleteMutation.mutate(id)
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingMember(null)
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Miembros
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm sm:text-base">Gestiona a tus amigos y familiares.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
                    <Plus size={20} className="mr-2" />
                    Nuevo Miembro
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-slate-500">Cargando miembros...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {members?.map((member) => (
                        <div
                            key={member.id}
                            className="group relative bg-[#1e293b]/50 backdrop-blur-md border border-white/5 rounded-2xl p-4 sm:p-6 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 sm:hover:-translate-y-1"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex gap-3 sm:gap-4 flex-1 min-w-0">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg shadow-indigo-500/20 flex-shrink-0">
                                        {member.avatar_url ? (
                                            <img src={member.avatar_url} alt={member.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            member.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-white text-base sm:text-lg truncate">{member.name}</h3>
                                        <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm mt-1">
                                            <Mail size={14} className="flex-shrink-0" />
                                            <span className="truncate">{member.email || 'Sin correo'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm mt-1">
                                            <Phone size={14} className="flex-shrink-0" />
                                            <span className="truncate">{member.phone || 'Sin teléfono'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action buttons - always visible on mobile, hover on desktop */}
                                <div className="flex gap-2 ml-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEditClick(member)}
                                        className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/10 rounded-lg hover:bg-indigo-500 hover:text-white transition-colors text-slate-400 active:bg-indigo-600 cursor-pointer"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(member.id)}
                                        className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/10 rounded-lg hover:bg-red-500 hover:text-white transition-colors text-slate-400 active:bg-red-600 cursor-pointer"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingMember ? 'Editar Miembro' : 'Nuevo Miembro'}
            >
                <MemberForm
                    initialData={editingMember || undefined}
                    onSubmit={editingMember ? handleUpdate : handleCreate}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </div>
    )
}
