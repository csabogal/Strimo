import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Wallet, AlertCircle, CheckCircle2, Sparkles, Send, Mail, Trash2 } from 'lucide-react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { useState } from 'react'
import { generateMonthlyCharges } from '../lib/billing'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export const Dashboard = () => {
    const [aiInsight, setAiInsight] = useState<string>('')
    const [isGenerating, setIsGenerating] = useState(false)
    const queryClient = useQueryClient()
    const [isGeneratingReminder, setIsGeneratingReminder] = useState(false)
    const [isGeneratingCharges, setIsGeneratingCharges] = useState(false)

    // Fetch Platforms (and their costs)
    const { data: platforms } = useQuery({
        queryKey: ['platforms'],
        queryFn: async () => {
            const { data } = await supabase.from('platforms').select('*')
            return data || []
        }
    })

    // Fetch Members
    const { data: members } = useQuery({
        queryKey: ['members'],
        queryFn: async () => {
            const { data } = await supabase.from('members').select('*')
            return data || []
        }
    })

    // Fetch Pending Charges
    const { data: pendingCharges } = useQuery({
        queryKey: ['charges', 'pending'],
        queryFn: async () => {
            const { data } = await supabase
                .from('charges')
                .select('*, members(name, email, phone), platforms(name)')
                .eq('status', 'pending')
                .order('due_date', { ascending: true })
            return data || []
        }
    })

    // Fetch Payment History
    const { data: payHistory } = useQuery({
        queryKey: ['payment_history'],
        queryFn: async () => {
            const { data } = await supabase
                .from('payment_history')
                .select('*, charges(*, platforms(name), members(name))')
                .order('payment_date', { ascending: false })
                .limit(5)
            return data || []
        }
    })

    const handleGenerateCharges = async () => {
        setIsGeneratingCharges(true)
        const now = new Date()
        const success = await generateMonthlyCharges(now.getMonth() + 1, now.getFullYear())
        if (success) {
            queryClient.invalidateQueries({ queryKey: ['charges'] })
        }
        setIsGeneratingCharges(false)
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(amount)
    }

    // Group charges by member
    const groupedCharges = pendingCharges?.reduce((acc: any, charge: any) => {
        const memberId = charge.member_id
        if (!acc[memberId]) {
            acc[memberId] = {
                memberId,
                member: charge.members,
                totalAmount: 0,
                platforms: [],
                chargeIds: [],
                dueDate: charge.due_date,
                charges: [] // Keep original charges for individual processing if needed
            }
        }
        acc[memberId].totalAmount += charge.amount
        acc[memberId].platforms.push(charge.platforms?.name)
        acc[memberId].chargeIds.push(charge.id)
        acc[memberId].charges.push(charge)
        // Keep the earliest due date
        if (new Date(charge.due_date) < new Date(acc[memberId].dueDate)) {
            acc[memberId].dueDate = charge.due_date
        }
        return acc
    }, {})

    const groupedChargesList = Object.values(groupedCharges || {})

    const handleMarkAsPaidGroup = async (group: any) => {
        if (!confirm(`¿Confirmar pago TOTAL de ${formatCurrency(group.totalAmount)} por ${group.member?.name}?`)) return;

        try {
            // Process all charges in parallel
            await Promise.all(group.charges.map(async (charge: any) => {
                // 1. Update status
                const { error: chargeError } = await supabase
                    .from('charges')
                    .update({ status: 'paid' })
                    .eq('id', charge.id)

                if (chargeError) throw chargeError

                // 2. Insert into payment_history
                const { error: historyError } = await supabase
                    .from('payment_history')
                    .insert({
                        charge_id: charge.id,
                        amount_paid: charge.amount,
                        payment_date: new Date().toISOString(),
                        method: 'manual',
                        notes: 'Pago grupal registrado desde Dashboard'
                    })

                if (historyError) throw historyError
            }))

            toast.success(`Pagos de ${group.member?.name} registrados`)
            queryClient.invalidateQueries({ queryKey: ['charges'] })
            queryClient.invalidateQueries({ queryKey: ['payment_history'] })

        } catch (error: any) {
            console.error('Error processing group payment:', error)
            toast.error('Error al registrar algunos pagos')
        }
    }

    const handleDeleteChargeGroup = async (group: any) => {
        if (!confirm(`¿Eliminar TODOS los cobros pendientes de ${group.member?.name}?`)) return

        const { error } = await supabase
            .from('charges')
            .delete()
            .in('id', group.chargeIds)

        if (error) {
            toast.error('Error al eliminar los cobros')
        } else {
            toast.success('Cobros eliminados exitosamente')
            queryClient.invalidateQueries({ queryKey: ['charges'] })
        }
    }

    // Calculate Total Monthly Cost
    const totalCost = platforms?.reduce((acc: any, p: any) => acc + Number(p.cost), 0) || 0

    // Calculate next due date from pending charges
    const nextDue = pendingCharges?.[0]

    const generateInsights = async () => {
        if (!platforms || !members) return
        setIsGenerating(true)
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
            const prompt = `
            Actúa como un asistente financiero para una app de suscripciones llamada Strimo.
            Datos actuales:
            - Total mensual en suscripciones: ${formatCurrency(totalCost)}
            - Plataformas activas: ${platforms.map((p: any) => p.name).join(', ')}
            - Número de miembros: ${members.length}
            
            Analiza estos gastos y dame 3 consejos breves o "insights" para optimizar o gestionar mejor estos pagos. 
            Sé conciso, amigable y usa un tono premium/profesional. Formato lista.
        `
            const result = await model.generateContent(prompt)
            const response = result.response
            setAiInsight(response.text())
        } catch (error) {
            console.error("Error Gemini:", error)
            setAiInsight("Lo siento, no pude generar insights en este momento.")
        } finally {
            setIsGenerating(false)
        }
    }

    const generateReminder = async () => {
        if (!groupedChargesList || groupedChargesList.length === 0) {
            toast.info('No hay cobros pendientes para generar recordatorios.')
            return
        }

        setIsGeneratingReminder(true)
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

            // Use grouped list for cleaner summary
            const debtSummary = groupedChargesList.map((g: any) =>
                `- ${g.member?.name} debe un total de ${formatCurrency(g.totalAmount)} por: ${g.platforms.join(', ')} (Vence: ${format(new Date(g.dueDate), 'dd/MM')})`
            ).join('\n')

            const prompt = `
            Genera un mensaje amable pero firme para enviar por WhatsApp a los miembros del grupo de suscripciones "Strimo".
            
            Lista de deudas pendientes (RESUMIDA POR PERSONA):
            ${debtSummary}
            
            El mensaje debe:
            1. Saludar al grupo.
            2. Listar lo que debe cada uno (total y conceptos) de forma clara y organizada.
            3. Recordar pagar antes de la fecha límite.
            4. Incluir emojis relevantes.
            5. No uses introducciones como "Aquí tienes el mensaje", solo dame el texto listo para copiar.
        `
            const result = await model.generateContent(prompt)
            setAiInsight(result.response.text())
            toast.success('Mensaje de cobro generado')
        } catch (error) {
            console.error("Error Gemini:", error)
            toast.error("Error generando recordatorio")
        } finally {
            setIsGeneratingReminder(false)
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                {/* ... Header ... */}
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Dashboard
                    </h1>
                    <p className="text-slate-400 mt-1">Resumen general de tus suscripciones.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={handleGenerateCharges}
                        isLoading={isGeneratingCharges}
                        variant="ghost"
                        className="text-indigo-300 hover:bg-indigo-500/10"
                    >
                        Generar Cobros
                    </Button>
                    <Button
                        onClick={generateReminder}
                        isLoading={isGeneratingReminder}
                        variant="primary"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                        <Sparkles size={18} className="mr-2" />
                        IA Cobranza
                    </Button>
                </div>
            </div>

            {/* ... Cards Section (Unchanged) ... */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-md">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Gasto Total Mensual</p>
                            <h3 className="text-2xl font-bold text-white">{formatCurrency(totalCost)}</h3>
                        </div>
                    </div>
                    <div className="text-xs text-indigo-300 bg-indigo-500/10 inline-block px-2 py-1 rounded-full">
                        {platforms?.length} Plataformas activas
                    </div>
                </div>

                <div className="bg-[#1e293b]/50 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Estado de Pagos</p>
                            <h3 className="text-2xl font-bold text-white">
                                {pendingCharges?.length ? `${pendingCharges.length} Recibos` : 'Al día'}
                            </h3>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">
                        {pendingCharges?.length ? 'Revisa los cobros abajo' : 'No hay deudas pendientes.'}
                    </p>
                </div>

                <div className="bg-[#1e293b]/50 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Próximo Vencimiento</p>
                            <h3 className="text-xl font-bold text-white">
                                {nextDue ? format(new Date(nextDue.due_date), 'dd MMM', { locale: es }) : '-'}
                            </h3>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                        {nextDue ? `${nextDue.platforms?.name} - ${formatCurrency(nextDue.amount)}` : 'Sin vencimientos próximos'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Pending Charges List (Grouped) */}
                <div className="bg-[#1e293b]/50 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
                    <h2 className="text-lg font-bold text-white mb-4">Cobros Pendientes ({groupedChargesList.length})</h2>
                    {groupedChargesList.length > 0 ? (
                        <div className="space-y-3">
                            {groupedChargesList.map((group: any) => (
                                <div key={group.memberId} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300 font-bold text-xs uppercase w-10 text-center">
                                            {format(new Date(group.dueDate), 'dd')}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{group.member?.name}</p>
                                            <p className="text-xs text-slate-400">
                                                {group.platforms.join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-bold mr-2">{formatCurrency(group.totalAmount)}</span>

                                        {/* Action Buttons */}
                                        <div className="flex gap-1">
                                            {group.member?.phone && (
                                                <a
                                                    href={`https://wa.me/${group.member.phone}?text=${encodeURIComponent(
                                                        `Hola ${group.member.name}, tienes pendientes en Strimo:\n` +
                                                        group.charges.map((c: any) => `- ${c.platforms?.name}: ${formatCurrency(c.amount)}`).join('\n') +
                                                        `\n*TOTAL: ${formatCurrency(group.totalAmount)}*\n\nPor favor realiza el pago lo antes posible. ¡Gracias!`
                                                    )}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                                                    title="Enviar recordatorio total por WhatsApp"
                                                >
                                                    <Send size={16} />
                                                </a>
                                            )}
                                            {group.member?.email && (
                                                <a
                                                    href={`mailto:${group.member.email}?subject=Recordatorio de Pago Strimo - ${format(new Date(), 'MMMM')}&body=${encodeURIComponent(
                                                        `Hola ${group.member.name},\n\nTe recordamos el resumen de tus pagos pendientes:\n\n` +
                                                        group.charges.map((c: any) => `- ${c.platforms?.name}: ${formatCurrency(c.amount)}`).join('\n') +
                                                        `\n\nTOTAL A PAGAR: ${formatCurrency(group.totalAmount)}\n\nPor favor realiza el pago lo antes posible.\n\nSaludos,\nTu admin de Strimo.`
                                                    )}`}
                                                    className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                                                    title="Enviar recordatorio total por Correo"
                                                >
                                                    <Mail size={16} />
                                                </a>
                                            )}
                                            <Button size="sm" onClick={() => handleMarkAsPaidGroup(group)} title="Marcar TODO como pagado (Grupo)">
                                                <CheckCircle2 size={16} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleDeleteChargeGroup(group)}
                                                title="Eliminar TODO el grupo"
                                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-4">No hay cobros pendientes</p>
                    )}
                </div>

                {/* AI Section (Reused for both Insights and Reminders) */}
                <div className="bg-gradient-to-b from-slate-800/40 to-[#1e293b]/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <Sparkles className="text-fuchsia-400" />
                            <h2 className="text-xl font-bold text-white">Strimo AI</h2>
                        </div>
                        <div className="flex gap-2">
                            {aiInsight && aiInsight.includes("debe") && (
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(aiInsight)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center h-9 px-3 text-sm font-medium bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/30 rounded-xl transition-all"
                                >
                                    <Send size={16} className="mr-2" />
                                    Enviar al Grupo
                                </a>
                            )}
                            <Button
                                onClick={generateInsights}
                                isLoading={isGenerating}
                                variant="secondary"
                                size="sm"
                            >
                                Ver Insights
                            </Button>
                        </div>
                    </div>

                    {aiInsight ? (
                        <div className="bg-black/20 rounded-xl p-4 text-slate-300 leading-relaxed whitespace-pre-line border border-white/5 flex-1 text-sm overflow-y-auto max-h-[300px]">
                            {aiInsight}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-500 text-center text-sm">
                            Usa "IA Cobranza" o "Ver Insights" para obtener ayuda de Gemini.
                        </div>
                    )}
                </div>
            </div>

            {/* Recent History (Mini view) */}
            <div className="mb-8">
                <h3 className="text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">Últimos Pagos Registrados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {payHistory && payHistory.length > 0 ? payHistory.map((h: any) => (
                        <div key={h.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">{h.charges?.members?.name}</p>
                                <p className="text-xs text-slate-400">
                                    {h.charges?.platforms?.name} • {format(new Date(h.payment_date), 'dd MMM yyyy', { locale: es })}
                                </p>
                            </div>
                            <span className="text-emerald-400 font-bold">{formatCurrency(h.amount_paid)}</span>
                        </div>
                    )) : (
                        <p className="text-slate-500 text-sm">No hay historial reciente.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
