import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Wallet, AlertCircle, CheckCircle2, Sparkles, Send, Mail, Trash2, ArrowUpRight } from 'lucide-react'
import Groq from 'groq-sdk'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { useState } from 'react'
import { generateMonthlyCharges } from '../lib/billing'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { generateEmailHTML } from '../lib/emailTemplate'
import { generateWhatsAppMessage } from '../lib/whatsappTemplate'

export const Dashboard = () => {
    const [aiInsight, setAiInsight] = useState<string>('')
    const queryClient = useQueryClient()
    const [isGeneratingReminder, setIsGeneratingReminder] = useState(false)
    const [isGeneratingCharges, setIsGeneratingCharges] = useState(false)

    // Fetch Platforms
    const { data: platforms } = useQuery({
        queryKey: ['platforms'],
        queryFn: async () => {
            const { data } = await supabase.from('platforms').select('*')
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
                charges: []
            }
        }
        acc[memberId].totalAmount += charge.amount
        acc[memberId].platforms.push(charge.platforms?.name)
        acc[memberId].chargeIds.push(charge.id)
        acc[memberId].charges.push(charge)
        if (new Date(charge.due_date) < new Date(acc[memberId].dueDate)) {
            acc[memberId].dueDate = charge.due_date
        }
        return acc
    }, {})

    const groupedChargesList = Object.values(groupedCharges || {})

    const handleMarkAsPaidGroup = async (group: any) => {
        if (!confirm(`¿Confirmar pago TOTAL de ${formatCurrency(group.totalAmount)} por ${group.member?.name}?`)) return;

        try {
            await Promise.all(group.charges.map(async (charge: any) => {
                const { error: chargeError } = await supabase
                    .from('charges')
                    .update({ status: 'paid' })
                    .eq('id', charge.id)

                if (chargeError) throw chargeError

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

    const [sendingEmailFor, setSendingEmailFor] = useState<string | null>(null)

    const handleSendPremiumManualEmail = async (chargeId: string) => {
        setSendingEmailFor(chargeId)
        try {
            const { data, error } = await supabase.functions.invoke('process-reminders', {
                body: { charge_id: chargeId }
            })

            if (error) throw error

            if (data?.processed > 0) {
                toast.success('Correo Premium enviado exitosamente')
                queryClient.invalidateQueries({ queryKey: ['charges'] })
            } else {
                toast.error('No se pudo enviar el correo')
            }
        } catch (error) {
            console.error('Error sending premium email:', error)
            toast.error('Error al conectar con el servicio de correo')
        } finally {
            setSendingEmailFor(null)
        }
    }



    const totalCost = platforms?.reduce((acc: any, p: any) => acc + Number(p.cost), 0) || 0
    const nextDue = pendingCharges?.[0]

    const generateReminder = async () => {
        const apiKey = import.meta.env.VITE_GROQ_API_KEY
        if (!apiKey) {
            toast.error('Falta la API Key de Groq (VITE_GROQ_API_KEY)')
            return
        }

        if (!groupedChargesList || groupedChargesList.length === 0) {
            toast.info('No hay cobros pendientes para generar recordatorios.')
            return
        }

        setIsGeneratingReminder(true)
        try {
            const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true })

            const debtSummary = groupedChargesList.map((g: any) => {
                const platformsList = g.platforms.filter((p: any) => p).join(', ') || 'Suscripción'
                const dateStr = g.dueDate ? format(new Date(g.dueDate), 'dd/MM') : 'Pendiente'
                return `- ${g.member?.name || 'Miembro'} debe un total de ${formatCurrency(g.totalAmount)} por: ${platformsList} (Vence: ${dateStr})`
            }).join('\n')

            const prompt = `Genera un mensaje amable pero firme para enviar por WhatsApp a los miembros del grupo de suscripciones "Strimo".

Lista de deudas pendientes (RESUMIDA POR PERSONA):
${debtSummary}

El mensaje debe:
1. Saludar al grupo.
2. Listar lo que debe cada uno (total y conceptos) de forma clara y organizada.
3. Recordar pagar antes de la fecha límite.
4. Incluir emojis relevantes.
5. No uses introducciones como "Aquí tienes el mensaje", solo dame el texto listo para copiar.
6. IMPORTANTE: La moneda es pesos colombianos (COP), usa el formato $ 0.000`

            const completion = await groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.8,
                max_tokens: 800
            })

            const responseText = completion.choices[0]?.message?.content || 'No se pudo generar el mensaje.'
            setAiInsight(responseText)
            toast.success('Mensaje de cobro generado')
        } catch (error: any) {
            console.error("Error Groq:", error)
            let msg = "Error generando recordatorio"
            if (error.message?.includes('API key')) msg = "API Key de Groq inválida"
            if (error.message?.includes('429')) msg = "Límite de uso excedido (Cuota Gratuita)"
            if (error.message?.includes('503')) msg = "Servicio de IA saturado"

            toast.error(`${msg}. Por favor espera un momento.`)
        } finally {
            setIsGeneratingReminder(false)
        }
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Dashboard
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm sm:text-base">Resumen general de tus suscripciones.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                        onClick={handleGenerateCharges}
                        isLoading={isGeneratingCharges}
                        variant="ghost"
                        className="text-indigo-300 hover:bg-indigo-500/10 w-full sm:w-auto"
                    >
                        Generar Cobros
                    </Button>
                    <Button
                        onClick={generateReminder}
                        isLoading={isGeneratingReminder}
                        variant="primary"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white w-full sm:w-auto"
                    >
                        <Sparkles size={18} className="mr-2" />
                        IA Cobranza
                    </Button>
                </div>
            </div>

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
                <div className="bg-[#1e293b]/50 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
                    <h2 className="text-lg font-bold text-white mb-4">Cobros Pendientes ({groupedChargesList.length})</h2>
                    {groupedChargesList.length > 0 ? (
                        <div className="space-y-3">
                            {groupedChargesList.map((group: any) => (
                                <div key={group.memberId} className="p-3 sm:p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-start sm:items-center justify-between gap-3 mb-3 sm:mb-0">
                                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300 font-bold text-xs uppercase w-10 text-center flex-shrink-0">
                                                {format(new Date(group.dueDate), 'dd')}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-white font-medium truncate">{group.member?.name}</p>
                                                <p className="text-xs text-slate-400 truncate">
                                                    {group.platforms.join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-white font-bold text-sm sm:text-base whitespace-nowrap">{formatCurrency(group.totalAmount)}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5 sm:mt-0 mt-3">
                                        {group.member?.phone && (
                                            <button
                                                onClick={() => {
                                                    const message = generateWhatsAppMessage({
                                                        memberName: group.member.name,
                                                        charges: group.charges.map((c: any) => ({
                                                            platformName: c.platforms?.name || 'Plataforma',
                                                            amount: c.amount
                                                        })),
                                                        totalAmount: group.totalAmount,
                                                        dueDate: format(new Date(group.dueDate), 'dd/MM/yyyy')
                                                    });
                                                    const phone = group.member.phone.replace(/\D/g, '');
                                                    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`, '_blank');
                                                }}
                                                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors cursor-pointer active:bg-green-500/30"
                                                title="WhatsApp Premium"
                                            >
                                                <Send size={18} />
                                            </button>
                                        )}
                                        {group.member?.email && (
                                            <button
                                                onClick={() => handleSendPremiumManualEmail(group.chargeIds[0])}
                                                disabled={sendingEmailFor === group.chargeIds[0]}
                                                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors disabled:opacity-50 cursor-pointer active:bg-blue-500/30"
                                                title="Enviar Correo Premium (Directo)"
                                            >
                                                <Mail size={18} className={sendingEmailFor === group.chargeIds[0] ? 'animate-pulse' : ''} />
                                            </button>
                                        )}
                                        <Button
                                            size="sm"
                                            onClick={() => handleMarkAsPaidGroup(group)}
                                            title="Marcar como pagado"
                                        >
                                            <CheckCircle2 size={18} />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => handleDeleteChargeGroup(group)}
                                            className="bg-red-500/10 text-red-500"
                                            title="Eliminar cobro"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-4">No hay cobros pendientes</p>
                    )}
                </div>

                <div className="bg-gradient-to-b from-slate-800/40 to-[#1e293b]/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="text-fuchsia-400" />
                        <h2 className="text-xl font-bold text-white">Automatización</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-300">Correos Inteligentes</span>
                                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">Activo</span>
                            </div>
                            <p className="text-xs text-slate-400">
                                La IA envía correos personalizados automáticamente en T-5 días, T-0 y T+5 días.
                            </p>
                        </div>

                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-sm font-medium text-slate-300 block mb-2">WhatsApp Asistido</span>
                            <p className="text-xs text-slate-400">
                                Usa el botón superior para el grupo, o los iconos individuales para chats privados.
                            </p>
                        </div>

                        {aiInsight && (
                            <div className="mt-4 p-4 bg-black/20 rounded-xl border border-white/5 text-sm text-slate-300">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-bold text-fuchsia-400">Mensaje Generado:</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(aiInsight);
                                                toast.success('Mensaje copiado al portapapeles');
                                            }}
                                            className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 rounded transition-colors text-slate-400 cursor-pointer"
                                        >
                                            Copiar
                                        </button>
                                        <a
                                            href={`https://wa.me/?text=${encodeURIComponent(aiInsight)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition-colors cursor-pointer"
                                        >
                                            WhatsApp
                                        </a>
                                    </div>
                                </div>
                                <div className="whitespace-pre-line overflow-y-auto max-h-[200px]">
                                    {aiInsight}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">Últimos Pagos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {payHistory && payHistory.length > 0 ? payHistory.map((h: any) => (
                        <div key={h.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">{h.charges?.members?.name}</p>
                                <p className="text-xs text-slate-400">
                                    {h.charges?.platforms?.name} • {format(new Date(h.payment_date), 'dd MMM', { locale: es })}
                                </p>
                            </div>
                            <span className="text-emerald-400 font-bold">{formatCurrency(h.amount_paid)}</span>
                        </div>
                    )) : (
                        <p className="text-slate-500 text-sm">Sin historial.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
