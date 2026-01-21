import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount)
}

const generatePremiumEmail = (params: {
  memberName: string,
  charges: { platformName: string, amount: number, dueDate: string }[],
  totalAmount: number,
  reminderType: 'pre' | 'due' | 'overdue' | 'manual',
  aiMessage: string
}) => {
  const { memberName, charges, totalAmount, reminderType, aiMessage } = params
  
  let typeText = '📢 Recordatorio de Pago';
  let typeColor = '#6366f1';

  if (reminderType === 'pre') typeText = '⏰ Pago próximo en 5 días';
  else if (reminderType === 'due') { typeText = '📢 ¡Hoy vence tu pago!'; typeColor = '#f59e0b'; }
  else if (reminderType === 'overdue') { typeText = '⚠️ Pago vencido'; typeColor = '#ef4444'; }

  const chargesHtml = charges.map(c => `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 10px 0; color: #94a3b8;">${c.platformName}</td>
        <td style="padding: 10px 0; text-align: right; color: white;">${formatCurrency(c.amount)}</td>
    </tr>
  `).join('');

  const oldestDueDate = charges.reduce((min, c) => c.dueDate < min ? c.dueDate : min, charges[0].dueDate);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #0f172a; color: #f1f5f9;">
    <div style="max-width: 600px; margin: 20px auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 12px 24px; border-radius: 12px;">
                <h1 style="margin: 0; color: white; font-size: 24px;">✨ Strimo</h1>
            </div>
        </div>

        <div style="background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px;">
                <h2 style="margin: 0 0 8px 0; color: ${typeColor}; font-size: 20px;">${typeText}</h2>
                <p style="margin: 0; color: #94a3b8;">Hola <strong>${memberName}</strong>,</p>
            </div>

            <div style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                ${aiMessage.replace(/\n/g, '<br>')}
            </div>

            <div style="background: rgba(15,23,42,0.5); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <th style="text-align: left; padding-bottom: 10px; color: #94a3b8; font-size: 12px; text-transform: uppercase;">Plataforma</th>
                            <th style="text-align: right; padding-bottom: 10px; color: #94a3b8; font-size: 12px; text-transform: uppercase;">Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${chargesHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td style="padding-top: 20px; color: white; font-weight: bold; font-size: 14px;">TOTAL A PAGAR:</td>
                            <td style="padding-top: 20px; text-align: right; color: #34d399; font-size: 24px;"><strong>${formatCurrency(totalAmount)}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding-top: 20px;">
                                <div style="background: rgba(245, 158, 11, 0.1); border: 1px dashed rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 12px; text-align: center;">
                                    <span style="color: #f59e0b; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                                        🗓️ Fecha límite de pago: ${new Date(oldestDueDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <p style="font-size: 14px; color: #64748b; text-align: center; margin: 0;">
                Si ya realizaste el pago, por favor ignora este mensaje.
            </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #475569; font-size: 12px;">
            Enviado por Strimo AI
        </div>
    </div>
</body>
</html>
  `.trim()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'No authorization header' }), { 
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    
    let manualChargeId = null;
    let manualMemberId = null;

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      manualChargeId = body.charge_id;
      manualMemberId = body.member_id;
    }

    // Fetch pending charges
    let query = supabase
      .from('charges')
      .select('*, members(id, name, email), platforms(name)')
      .eq('status', 'pending');

    if (manualChargeId) {
      // If a specific charge is sent, we find the member and then all their pending charges
      const { data: triggerCharge } = await supabase
        .from('charges')
        .select('member_id')
        .eq('id', manualChargeId)
        .single();
      
      if (triggerCharge) {
        query = query.eq('member_id', triggerCharge.member_id);
      }
    } else if (manualMemberId) {
      query = query.eq('member_id', manualMemberId);
    }

    const { data: charges, error: fetchError } = await query;
    if (fetchError) throw fetchError

    if (!charges || charges.length === 0) {
      return new Response(JSON.stringify({ success: true, processed: 0, message: 'No charges to process' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // Group charges by member for processing
    const memberGroups = charges.reduce((acc, charge) => {
      const mId = charge.members.id;
      if (!acc[mId]) {
        acc[mId] = {
          member: charge.members,
          charges: []
        };
      }
      acc[mId].charges.push(charge);
      return acc;
    }, {} as Record<string, any>);

    const now = new Date()
    now.setHours(0, 0, 0, 0)
    
    const results = []
    
    for (const mId in memberGroups) {
      const group = memberGroups[mId];
      const member = group.member;
      const memberCharges = group.charges;

      if (!member?.email) continue;

      const totalAmount = memberCharges.reduce((sum: number, c: any) => sum + Number(c.amount), 0);
      const platformsText = memberCharges.map((c: any) => c.platforms.name).join(', ');

      let reminderType: 'pre' | 'due' | 'overdue' | 'manual' | null = null

      if (manualChargeId || manualMemberId) {
        reminderType = 'manual';
      } else {
        // For auto processing, we use the oldest due date to determine the type
        const oldestDueDate = new Date(memberCharges.reduce((min: string, c: any) => c.due_date < min ? c.due_date : min, memberCharges[0].due_date));
        oldestDueDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((oldestDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 5) reminderType = 'pre'
        else if (diffDays === 0) reminderType = 'due'
        else if (diffDays === -5) reminderType = 'overdue'

        // Check if we already sent this type of reminder recently for ANY of these charges
        const alreadySent = memberCharges.some((c: any) => c.last_reminder_type === reminderType);
        if (alreadySent) reminderType = null;
      }

      if (!reminderType) continue;

      const prompt = `Actúa como el asistente de cobros de "Strimo". 
Escribe un mensaje CORTO y amable para ${member.name} sobre sus suscripciones pendientes: ${platformsText}.
No incluyas los montos individuales ni el total en este texto, solo un saludo y un recordatorio de que tiene estas cuentas pendientes.
Situación: ${reminderType === 'pre' ? 'Faltan 5 días para el vencimiento' : reminderType === 'due' ? 'Vencen hoy' : reminderType === 'overdue' ? 'Están atrasadas' : 'Recordatorio general'}.
Sé profesional pero muy cercano. Dame el JSON con "subject" y "message".`

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" }
        })
      })

      const groqData = await groqRes.json()
      const aiContent = JSON.parse(groqData.choices[0].message.content)

      const emailHtml = generatePremiumEmail({
        memberName: member.name,
        charges: memberCharges.map((c: any) => ({
          platformName: c.platforms.name,
          amount: c.amount,
          dueDate: c.due_date
        })),
        totalAmount,
        reminderType,
        aiMessage: aiContent.message
      })

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Strimo <recordatorios@strimoapp.site>",
          to: [member.email],
          subject: aiContent.subject,
          html: emailHtml
        })
      })

      if (resendRes.ok) {
        const chargeIds = memberCharges.map((c: any) => c.id);
        await supabase
          .from('charges')
          .update({
            last_reminder_at: new Date().toISOString(),
            last_reminder_type: reminderType
          })
          .in('id', chargeIds);
        
        results.push({ member_id: mId, charges_count: chargeIds.length, status: 'sent', type: reminderType })
      }
    }

    return new Response(JSON.stringify({ success: true, processed: results.length, details: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
