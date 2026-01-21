// Supabase Edge Function: mp-webhook
// Receives payment notifications from Mercado Pago
// Deploy with: supabase functions deploy mp-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')!

serve(async (req) => {
    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

        // Get notification data
        const url = new URL(req.url)
        const topic = url.searchParams.get('topic') || url.searchParams.get('type')
        const id = url.searchParams.get('id') || url.searchParams.get('data.id')

        // Also check body for IPN
        let body = {}
        try {
            body = await req.json()
        } catch { }

        const paymentId = id || body.data?.id
        const notificationType = topic || body.type

        console.log('Webhook received:', { notificationType, paymentId, body })

        // Only process payment notifications
        if (notificationType !== 'payment' || !paymentId) {
            return new Response('OK', { status: 200 })
        }

        // Fetch payment details from Mercado Pago
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
            }
        })

        if (!mpResponse.ok) {
            console.error('Failed to fetch payment:', await mpResponse.text())
            return new Response('Error fetching payment', { status: 500 })
        }

        const payment = await mpResponse.json()
        console.log('Payment details:', payment)

        // Parse external reference
        let externalRef = {}
        try {
            externalRef = JSON.parse(payment.external_reference || '{}')
        } catch { }

        const { user_id, credits, package_id, discount_percent } = externalRef

        if (!user_id || !credits) {
            console.error('Missing user_id or credits in external_reference')
            return new Response('Invalid external reference', { status: 400 })
        }

        // Check if already processed
        const { data: existingTx } = await supabase
            .from('transactions')
            .select('id, payment_status')
            .eq('payment_id', paymentId)
            .eq('payment_status', 'approved')
            .single()

        if (existingTx) {
            console.log('Payment already processed:', paymentId)
            return new Response('Already processed', { status: 200 })
        }

        // Process based on status
        if (payment.status === 'approved') {
            // Add credits to user
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('credits, xp, level')
                .eq('id', user_id)
                .single()

            if (profileError) {
                console.error('User not found:', user_id)
                return new Response('User not found', { status: 404 })
            }

            const newCredits = (profile.credits || 0) + credits

            // Also add XP for purchase (10 XP per 10 credits bought)
            const xpBonus = Math.floor(credits / 10) * 10
            const newXp = (profile.xp || 0) + xpBonus

            // Update user profile
            await supabase
                .from('profiles')
                .update({
                    credits: newCredits,
                    xp: newXp,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user_id)

            // Update transaction status
            await supabase
                .from('transactions')
                .update({
                    payment_status: 'approved',
                    payment_method: payment.payment_method_id || payment.payment_type_id
                })
                .eq('payment_id', paymentId)

            // If no existing transaction, create one
            const { data: txCheck } = await supabase
                .from('transactions')
                .select('id')
                .eq('payment_id', paymentId)
                .single()

            if (!txCheck) {
                await supabase.from('transactions').insert({
                    user_id,
                    type: 'purchase',
                    amount: credits,
                    description: `Compra aprovada: ${credits} créditos`,
                    payment_id: paymentId,
                    payment_status: 'approved',
                    payment_method: payment.payment_method_id,
                    price_paid: payment.transaction_amount,
                    metadata: { package_id, discount_percent, xp_bonus: xpBonus }
                })
            }

            console.log(`✅ Added ${credits} credits to user ${user_id}`)
        } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
            // Update transaction as rejected
            await supabase
                .from('transactions')
                .update({ payment_status: payment.status })
                .eq('payment_id', paymentId)

            console.log(`❌ Payment ${paymentId} was ${payment.status}`)
        }

        return new Response('OK', { status: 200 })

    } catch (error) {
        console.error('Webhook error:', error)
        return new Response('Internal error', { status: 500 })
    }
})
