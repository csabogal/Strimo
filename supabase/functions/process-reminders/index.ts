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
  platformName: string,
  amount: number,
  dueDate: string,
  reminderType: 'pre' | 'due' | 'overdue' | 'manual',
  aiMessage: string
}) => {
  const { memberName, platformName, amount, dueDate, reminderType, aiMessage } = params
  
  let typeText = '📢 Recordatorio de Pago';
  let typeColor = '#6366f1';

  if (reminderType === 'pre') typeText = '⏰ Pago próximo en 5 días';
  else if (reminderType === 'due') { typeText = '📢 ¡Hoy vence tu pago!'; typeColor = '#f59e0b'; }
  else if (reminderType === 'overdue') { typeText = '⚠️ Pago vencido'; typeColor = '#ef4444'; }

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
                <table style="width: 100%;">
                    <tr>
                        <td style="color: #94a3b8;">Plataforma:</td>
                        <td style="text-align: right; color: white;"><strong>${platformName}</strong></td>
                    </tr>
                    <tr>
                        <td style="color: #94a3b8;">Monto:</td>
                        <td style="text-align: right; color: #34d399; font-size: 20px;"><strong>${formatCurrency(amount)}</strong></td>
                    </tr>
                    <tr>
                        <td style="color: #94a3b8;">Vencimiento:</td>
                        <td style="text-align: right; color: white;">${dueDate}</td>
                    </tr>
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
  // Handle CORS preflight requests
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
    
    // Check if it's a manual trigger for a specific charge
    let manualChargeId = null;
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      manualChargeId = body.charge_id;
    }

    let query = supabase
      .from('charges')
      .select('*, members(name, email), platforms(name)')
      .eq('status', 'pending');

    if (manualChargeId) {
      query = query.eq('id', manualChargeId);
    }

    const { data: charges, error: fetchError } = await query;

    if (fetchError) throw fetchError

    const now = new Date()
    now.setHours(0, 0, 0, 0)
    
    const results = []
    
    for (const charge of charges || []) {
      const member = charge.members
      const platform = charge.platforms
      if (!member?.email || !platform?.name) continue

      let reminderType: 'pre' | 'due' | 'overdue' | 'manual' | null = null

      if (manualChargeId) {
        reminderType = 'manual';
      } else {
        const dueDate = new Date(charge.due_date)
        dueDate.setHours(0, 0, 0, 0)
        const diffDays = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 5) reminderType = 'pre'
        else if (diffDays === 0) reminderType = 'due'
        else if (diffDays === -5) reminderType = 'overdue'
      }

      if (!reminderType || (reminderType !== 'manual' && charge.last_reminder_type === reminderType)) {
        continue;
      }

      const prompt = `Actúa como el asistente de cobros de "Strimo". 
Escribe un mensaje CORTO y personalizado para ${member.name} sobre su suscripción a ${platform.name}.
No incluyas el monto ni la fecha en este texto, solo un saludo y un recordatorio amable.
Situación: ${reminderType === 'pre' ? 'Faltan 5 días' : reminderType === 'due' ? 'Vence hoy' : reminderType === 'overdue' ? 'Atrasado' : 'Recordatorio general'}.
Sé profesional pero cercano. Dame el JSON con "subject" y "message".`

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
        platformName: platform.name,
        amount: charge.amount,
        dueDate: charge.due_date,
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
        await supabase
          .from('charges')
          .update({
            last_reminder_at: new Date().toISOString(),
            last_reminder_type: reminderType
          })
          .eq('id', charge.id)
        
        results.push({ charge_id: charge.id, status: 'sent', type: reminderType })
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
