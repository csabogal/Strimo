import { useForm } from 'react-hook-form'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import type { Database } from '../../lib/database.types'

type PlatformInsert = Database['public']['Tables']['platforms']['Insert']
type Platform = Database['public']['Tables']['platforms']['Row']

interface PlatformFormProps {
    initialData?: Platform
    onSubmit: (data: PlatformInsert) => void
    isLoading?: boolean
    onCancel: () => void
}

export const PlatformForm = ({ initialData, onSubmit, isLoading, onCancel }: PlatformFormProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<PlatformInsert>({

        defaultValues: {
            name: initialData?.name || '',
            cost: initialData?.cost || 0,
            billing_cycle: initialData?.billing_cycle || '1',
            payment_strategy: initialData?.payment_strategy || 'equal',
            icon_url: initialData?.icon_url || '',
            total_slots: initialData?.total_slots || 1,
            active_slots: initialData?.active_slots || 0,
        }
    })

    // Watch strategy to conditionally show fields if needed? 
    // For now just standard fields.

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
                label="Nombre de la Plataforma"
                placeholder="Netflix"
                error={errors.name?.message}
                {...register('name', { required: 'El nombre es obligatorio' })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                    label="Costo Mensual"
                    type="number"
                    placeholder="0"
                    error={errors.cost?.message}
                    {...register('cost', { valueAsNumber: true, min: 0 })}
                />

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Día de Corte (1-31)</label>
                    <Input
                        type="number"
                        placeholder="Ej: 15"
                        error={errors.billing_cycle?.message}
                        {...register('billing_cycle', {
                            required: 'Requerido',
                            min: { value: 1, message: 'mín 1' },
                            max: { value: 31, message: 'máx 31' }
                        })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Estrategia de Pago</label>
                    <select
                        className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        {...register('payment_strategy')}
                    >
                        <option value="equal">Equitativo (Dividir)</option>
                        <option value="rotation">Rotación (Turnos)</option>
                    </select>
                </div>
                <Input
                    label="Cupos Totales"
                    type="number"
                    placeholder="1"
                    error={errors.total_slots?.message}
                    {...register('total_slots', { valueAsNumber: true, min: 1 })}
                />
            </div>


            <Input
                label="URL del Icono (Logo)"
                placeholder="https://..."
                error={errors.icon_url?.message}
                {...register('icon_url')}
            />

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full sm:w-auto"
                >
                    {initialData ? 'Actualizar' : 'Crear Plataforma'}
                </Button>
            </div>
        </form>
    )
}
