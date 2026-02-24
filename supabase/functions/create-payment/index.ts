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

        const body = await req.json()
        const {
            package_id,
            package_name,
            credits,
            price,
            user_id,
            user_email,
            discount_percent,
            // Franchise checkout fields
            is_franchise_checkout,
            referral_code
        } = body

        // ========== FRANCHISE CHECKOUT (no auth required) ==========
        if (is_franchise_checkout) {
            if (!package_id || !credits || !price) {
                throw new Error('Missing required fields for franchise checkout')
            }

            // MP requires valid public URLs for back_urls (localhost rejected)
            const franchiseBaseUrl = 'https://sites.rafaeldemeni.com'

            const preference = {
                items: [{
                    id: 'franquia',
                    title: `Franquia Demeni Sites — ${credits} Créditos`,
                    description: `Plano Franqueado com ${credits} créditos para criar sites profissionais`,
                    quantity: 1,
                    currency_id: 'BRL',
                    unit_price: parseFloat(price.toFixed(2))
                }],
                payer: {
                    email: 'contato@rafaeldemeni.com'
                },
                back_urls: {
                    success: `${franchiseBaseUrl}/franquia.html?payment=success`,
                    failure: `${franchiseBaseUrl}/franquia.html?payment=failure`,
                    pending: `${franchiseBaseUrl}/franquia.html?payment=pending`
                },
                auto_return: 'approved',
                external_reference: JSON.stringify({
                    type: 'franchise',
                    referral_code: referral_code || null,
                    credits,
                    package_id,
                    discount_percent: discount_percent || 0
                }),
                notification_url: `${SUPABASE_URL}/functions/v1/mp-webhook`,
                statement_descriptor: 'DEMENI FRANQUIA',
                payment_methods: {
                    excluded_payment_types: [],
                    excluded_payment_methods: [],
                    installments: 12
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
                console.error('MP Error (franchise):', error)
                throw new Error('Mercado Pago API error')
            }

            const mpData = await mpResponse.json()

            // Log franchise payment (no user_id yet — admin creates account after)
            await supabase.from('transactions').insert({
                user_id: null,
                type: 'franchise_purchase',
                amount: credits,
                description: `Franquia: ${credits} créditos${referral_code ? ` (ref: ${referral_code})` : ''}`,
                payment_id: mpData.id,
                payment_status: 'pending',
                price_paid: price,
                metadata: {
                    package_id,
                    discount_percent: discount_percent || 0,
                    referral_code: referral_code || null,
                    is_franchise: true
                }
            })

            return new Response(
                JSON.stringify({
                    preference_id: mpData.id,
                    init_point: mpData.init_point,
                    sandbox_init_point: mpData.sandbox_init_point
                }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200
                }
            )
        }

        // ========== NORMAL CREDIT PURCHASE (authenticated) ==========
        if (!package_id || !credits || !price || !user_id) {
            throw new Error('Missing required fields')
        }

        const origin = req.headers.get('origin') || 'https://rafaeldemeni.com'

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
                success: `${origin}/demeni-sites/app.html?payment=success`,
                failure: `${origin}/demeni-sites/app.html?payment=failure`,
                pending: `${origin}/demeni-sites/app.html?payment=pending`
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
                excluded_payment_methods: [],
                installments: 12
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
                init_point: mpData.init_point,
                sandbox_init_point: mpData.sandbox_init_point
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
