import { useForm } from 'react-hook-form'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import type { Database } from '../../lib/database.types'


type Member = Database['public']['Tables']['members']['Row']
type MemberInsert = Database['public']['Tables']['members']['Insert']

interface MemberFormProps {
    initialData?: Member
    onSubmit: (data: MemberInsert) => void
    isLoading?: boolean
    onCancel: () => void
}

export const MemberForm = ({ initialData, onSubmit, isLoading, onCancel }: MemberFormProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<MemberInsert>({
        defaultValues: {
            name: initialData?.name || '',
            email: initialData?.email || '',
            phone: initialData?.phone || '',
            avatar_url: initialData?.avatar_url || '',
            active: initialData?.active ?? true
        }
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
                label="Nombre"
                placeholder="Juan Pérez"
                error={errors.name?.message}
                {...register('name', { required: 'El nombre es obligatorio' })}
            />

            <Input
                label="Correo Electrónico"
                type="email"
                placeholder="juan@ejemplo.com"
                error={errors.email?.message}
                {...register('email')}
            />

            <Input
                label="Teléfono"
                type="tel"
                placeholder="+57 300 123 4567"
                error={errors.phone?.message}
                {...register('phone')}
            />

            <Input
                label="URL de Avatar (Opcional)"
                placeholder="https://..."
                error={errors.avatar_url?.message}
                {...register('avatar_url')}
            />

            <div className="flex justify-end gap-3 mt-6">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    isLoading={isLoading}
                >
                    {initialData ? 'Actualizar' : 'Crear Miembro'}
                </Button>
            </div>
        </form>
    )
}
