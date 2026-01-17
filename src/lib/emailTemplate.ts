export const generateEmailHTML = (params: {
    memberName: string
    charges: Array<{ platformName: string; amount: number }>
    totalAmount: number
    dueDate?: string
    reminderType?: 'pre' | 'due' | 'overdue'
}) => {
    const { memberName, charges, totalAmount, dueDate, reminderType } = params

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(amount)
    }

    const getMessage = () => {
        if (!reminderType) return '💰 Resumen de Pagos Pendientes'
        if (reminderType === 'pre') return '⏰ Recordatorio: Pago próximo en 5 días'
        if (reminderType === 'due') return '📢 ¡Hoy vence tu pago!'
        return '⚠️ Recordatorio: Pago vencido'
    }

    const chargesList = charges.map(c => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid rgba(148, 163, 184, 0.1);">
                <span style="color: #94a3b8; font-size: 14px;">📺 ${c.platformName}</span>
            </td>
            <td style="padding: 12px; text-align: right; border-bottom: 1px solid rgba(148, 163, 184, 0.1);">
                <strong style="color: #f1f5f9; font-size: 16px;">${formatCurrency(c.amount)}</strong>
            </td>
        </tr>
    `).join('')

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recordatorio de Pago - Strimo</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh;">
    <div style="max-width: 600px; margin: 40px auto; padding: 20px;">
        <!-- Header con logo -->
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 16px 32px; border-radius: 16px; box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);">
                <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">✨ Strimo</h1>
            </div>
        </div>

        <!-- Card principal -->
        <div style="background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
            <!-- Encabezado del mensaje -->
            <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%); padding: 24px; border-bottom: 1px solid rgba(148, 163, 184, 0.1);">
                <h2 style="margin: 0 0 8px 0; color: #f1f5f9; font-size: 24px; font-weight: 700;">
                    ${getMessage()}
                </h2>
                <p style="margin: 0; color: #94a3b8; font-size: 14px;">
                    Hola <strong style="color: #c084fc;">${memberName}</strong> 👋
                </p>
            </div>

            <!-- Contenido -->
            <div style="padding: 32px 24px;">
                <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                    Te recordamos tu resumen de pagos pendientes en Strimo:
                </p>

                <!-- Tabla de cobros -->
                <div style="background: rgba(15, 23, 42, 0.5); border-radius: 16px; overflow: hidden; margin-bottom: 24px; border: 1px solid rgba(148, 163, 184, 0.1);">
                    <table style="width: 100%; border-collapse: collapse;">
                        ${chargesList}
                    </table>
                </div>

                <!-- Total -->
                <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%); padding: 20px; border-radius: 16px; border: 1px solid rgba(16, 185, 129, 0.2); text-align: center; margin-bottom: 24px;">
                    <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
                        TOTAL A PAGAR
                    </p>
                    <p style="margin: 0; color: #34d399; font-size: 36px; font-weight: 800;">
                        ${formatCurrency(totalAmount)}
                    </p>
                </div>

                ${dueDate ? `
                <div style="background: rgba(251, 191, 36, 0.1); padding: 16px; border-radius: 12px; border-left: 4px solid #fbbf24; margin-bottom: 24px;">
                    <p style="margin: 0; color: #fbbf24; font-size: 14px;">
                        <strong>📅 Fecha límite:</strong> ${new Date(dueDate).toLocaleDateString('es-CO', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>
                ` : ''}

                <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0;">
                    Por favor realiza el pago lo antes posible para mantener tus servicios activos. 
                    Si ya realizaste el pago, ignora este mensaje.
                </p>
            </div>

            <!-- Footer -->
            <div style="background: rgba(15, 23, 42, 0.5); padding: 20px 24px; border-top: 1px solid rgba(148, 163, 184, 0.1);">
                <p style="margin: 0; color: #64748b; font-size: 12px; text-align: center; line-height: 1.5;">
                    Este es un recordatorio automático generado por Strimo.<br>
                    Si tienes alguna pregunta, contacta con tu administrador.
                </p>
            </div>
        </div>

        <!-- Espaciador final -->
        <div style="text-align: center; margin-top: 30px;">
            <p style="color: #475569; font-size: 12px; margin: 0;">
                Powered by <strong style="color: #8b5cf6;">Strimo AI</strong> 
            </p>
        </div>
    </div>
</body>
</html>
    `.trim()
}
