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

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    // Grouping Strategy
    // For Manual: Group by Member ID (Consolidate ALL pending)
    // For Auto: Group by Member ID + Reminder Type (Only strictly matching dates)
    
    interface GroupedCharges {
        [key: string]: {
            member: any,
            charges: any[],
            reminderType: 'pre' | 'due' | 'overdue' | 'manual'
        }
    }

    const groups: GroupedCharges = {};

    charges.forEach(charge => {
        const mId = charge.members.id;
        
        // Manual Mode: Consolidate everything for this member
        if (manualChargeId || manualMemberId) {
            const key = `${mId}_manual`;
            if (!groups[key]) {
                groups[key] = {
                    member: charge.members,
                    charges: [],
                    reminderType: 'manual'
                };
            }
            groups[key].charges.push(charge);
            return; // Skip auto logic
        }

        // Auto Mode: Determine strict status per charge
        const dueDate = new Date(charge.due_date);
        dueDate.setHours(0,0,0,0);
        
        // Calculate diff days: Due - Now
        // 5 days left = 5
        // Due today = 0
        // Overdue by 5 days = -5
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        let type: 'pre' | 'due' | 'overdue' | null = null;
        
        if (diffDays === 5) type = 'pre';
        else if (diffDays === 0) type = 'due';
        else if (diffDays === -5) type = 'overdue';

        // If no relevant status today, skip
        if (!type) return;

        // If already sent this specific type for this charge, skip
        if (charge.last_reminder_type === type) return;

        // Group by Member + Type
        const key = `${mId}_${type}`;
        if (!groups[key]) {
            groups[key] = {
                member: charge.members,
                charges: [],
                reminderType: type
            };
        }
        groups[key].charges.push(charge);
    });

    const results = []
    
    for (const key in groups) {
      const group = groups[key];
      const member = group.member;
      const memberCharges = group.charges;
      const reminderType = group.reminderType;

      if (!member?.email || memberCharges.length === 0) continue;

      const totalAmount = memberCharges.reduce((sum: number, c: any) => sum + Number(c.amount), 0);
      const platformsText = memberCharges.map((c: any) => c.platforms.name).join(', ');

      const prompt = `Actúa como el asistente de cobros de "Strimo". 
Escribe un mensaje CORTO y amable para ${member.name} sobre sus suscripciones pendientes: ${platformsText}.
No incluyas saludos iniciales (como 'Hola Camilo'), ni montos, ni totales. Ve directamente a la información importante del recordatorio, ya que el diseño del correo ya incluye un saludo en la parte superior.
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
        const updatePayload: any = {
           last_reminder_at: new Date().toISOString()
        };
        
        // Only update type for auto-reminders (to track state)
        // For manual, we might not want to overwrite the strict 'pre'/'due' state?
        // Actually, if we send a manual reminder, 'last_reminder_type' becomes 'manual'.
        // Then 'pre' logic will see 'manual' != 'pre', so it WILL send 'pre'.
        // This is arguably good (auto-reminders shouldn't be skipped just because I manually poked you).
        // Let's stick to updating type always.
        updatePayload.last_reminder_type = reminderType;

        await supabase
          .from('charges')
          .update(updatePayload)
          .in('id', chargeIds);
        
        results.push({ member_id: member.id, charges_count: chargeIds.length, status: 'sent', type: reminderType })
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
