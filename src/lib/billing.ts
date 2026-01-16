import { supabase } from './supabase'
import { toast } from 'sonner'

export const generateMonthlyCharges = async (month: number, year: number) => {
    try {
        // 1. Check if charges already exist for this month/year? 
        // Ideally we should warning or skip. For now, we trust the user triggers it once.
        
        // 2. Fetch all platforms
        const { data: platforms, error: pError } = await supabase.from('platforms').select('*')
        if (pError) throw pError
        if (!platforms) return

        let generatedCount = 0

        for (const platform of platforms) {
            // Get subscriptions
            const { data: subs, error: sError } = await supabase
                .from('member_subscriptions')
                .select('*')
                .eq('platform_id', platform.id)
                .order('rotation_order', { ascending: true }) // Important for rotation
            
            if (sError || !subs || subs.length === 0) continue

            const cycleDay = parseInt(platform.billing_cycle || '1')
            // Get last day of the specific month (month is 1-indexed here, so using 'month' as index gives the 0th day of next month = last day of current)
            const daysInCurrentMonth = new Date(year, month, 0).getDate()
            const actualDay = Math.min(cycleDay, daysInCurrentMonth)
            
            const dueDate = new Date(year, month - 1, actualDay)
            const dateStr = dueDate.toISOString().split('T')[0]

            if (platform.payment_strategy === 'equal') {
                // Everyone gets a charge of share_cost
                const share = platform.cost / subs.length
                
                const charges = subs.map(sub => ({
                    member_id: sub.member_id,
                    platform_id: platform.id,
                    amount: share,
                    month: month,
                    year: year,
                    due_date: dateStr,
                    status: 'pending'
                }))

                const { error: cError } = await supabase.from('charges').insert(charges)
                if (cError) console.error(`Error charging for ${platform.name}:`, cError)
                else generatedCount += charges.length

            } else if (platform.payment_strategy === 'rotation') {
                // Determine who pays.
                // Logic: (month_index) % total_subs
                // Ideally rotation_order is 1, 2, 3...
                // We use (month + (year * 12)) to get a monotonic month index? 
                // Or just keep it simple: month % subs.length (if orders are sequential).
                
                // Let's use robust modulo on the subscriptions array index.
                // We trust 'subs' is ordered by 'rotation_order'.
                // Index to pay = (current_global_month_index) % subs.length
                // current_global_month_index = (year * 12) + (month - 1)
                
                const globalMonthIndex = (year * 12) + (month - 1)
                const payerIndex = globalMonthIndex % subs.length
                const payerSub = subs[payerIndex]

                if (payerSub) {
                     const charge = {
                        member_id: payerSub.member_id,
                        platform_id: platform.id,
                        amount: platform.cost,
                        month: month,
                        year: year,
                        due_date: dateStr,
                        status: 'pending'
                     }
                     const { error: cError } = await supabase.from('charges').insert(charge)
                     if (cError) console.error(`Error charging for ${platform.name}:`, cError)
                     else generatedCount++
                }
            }
        }

        toast.success(`Generados ${generatedCount} cobros para ${month}/${year}`)
        return true

    } catch (error: any) {
        console.error('Error generating charges:', error)
        toast.error('Error generando cobros: ' + error.message)
        return false
    }
}
