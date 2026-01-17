export const generateWhatsAppMessage = (params: {
    memberName: string;
    charges: { platformName: string; amount: number }[];
    totalAmount: number;
    dueDate: string;
}) => {
    const { memberName, charges, totalAmount, dueDate } = params;
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(amount).replace('$', '$ ');
    };

    // Estilo Premium Original con emojis vibrantes
    const chargesList = charges
        .map(c => `• *${c.platformName}:* ${formatCurrency(c.amount)}`)
        .join('\n');

    return `🌟 *STRIMO - RECORDATORIO DE PAGO* 🌟

Hola *${memberName}*, esperamos que estés muy bien. 😊

Te escribimos para recordarte tus suscripciones activas:
${chargesList}

💎 *TOTAL PENDIENTE: ${formatCurrency(totalAmount)}*
📅 *FECHA LÍMITE: ${dueDate}*

Recuerda realizar tu pago para seguir disfrutando del servicio sin interrupciones. 🚀

_Si ya realizaste el pago, por favor haz caso omiso_`.trim();
};
