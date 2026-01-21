// Supabase Edge Function: create-payment
// Deploy with: supabase functions deploy create-payment

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')!

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

        const {
            package_id,
            package_name,
            credits,
            price,
            user_id,
            user_email,
            discount_percent
        } = await req.json()

        // Validate required fields
        if (!package_id || !credits || !price || !user_id) {
            throw new Error('Missing required fields')
        }

        // Create Mercado Pago preference
        const preference = {
            items: [{
                id: package_id,
                title: `${credits} Créditos Demeni Sites - ${package_name}`,
                description: `Pacote de ${credits} créditos para usar na plataforma`,
                quantity: 1,
                currency_id: 'BRL',
                unit_price: parseFloat(price.toFixed(2))
            }],
            payer: {
                email: user_email
            },
            back_urls: {
                success: `${req.headers.get('origin')}/app.html?payment=success`,
                failure: `${req.headers.get('origin')}/app.html?payment=failure`,
                pending: `${req.headers.get('origin')}/app.html?payment=pending`
            },
            auto_return: 'approved',
            external_reference: JSON.stringify({
                user_id,
                credits,
                package_id,
                discount_percent
            }),
            notification_url: `${SUPABASE_URL}/functions/v1/mp-webhook`,
            statement_descriptor: 'DEMENI SITES',
            payment_methods: {
                excluded_payment_types: [],
                installments: 1
            }
        }

        // Call Mercado Pago API
        const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preference)
        })

        if (!mpResponse.ok) {
            const error = await mpResponse.text()
            console.error('MP Error:', error)
            throw new Error('Mercado Pago API error')
        }

        const mpData = await mpResponse.json()

        // Log pending transaction
        await supabase.from('transactions').insert({
            user_id,
            type: 'purchase',
            amount: credits,
            description: `Compra: ${package_name} (${credits} créditos)`,
            payment_id: mpData.id,
            payment_status: 'pending',
            price_paid: price,
            metadata: { package_id, discount_percent }
        })

        return new Response(
            JSON.stringify({
                preference_id: mpData.id,
                init_point: mpData.init_point, // Checkout URL
                sandbox_init_point: mpData.sandbox_init_point // Test URL
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})
