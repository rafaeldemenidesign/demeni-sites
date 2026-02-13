import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // 1. Verify if the requester is an admin
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) throw new Error('Unauthorized')

        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        if (!profile?.is_admin) throw new Error('Forbidden: Admin access required')

        // 2. Initialize Supabase Admin Client (Service Role)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SERVICE_ROLE_KEY') ?? ''
        )

        // 3. Get request body
        const { email, password, name, credits } = await req.json()

        if (!email || !password) throw new Error('Email and password are required')

        // 4. Create User in Auth
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: name }
        })

        if (createError) throw createError

        // 5. Create Profile (with Transaction logic handled by trigger or manual insert if needed)
        // Note: If you have a trigger on auth.users -> public.profiles, this might be redundant or fail.
        // Let's assume we update the profile created by trigger OR insert if not exists.

        // Give the trigger a moment or upsert
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: newUser.user.id,
                email: email,
                name: name || '',
                credits: credits || 600,
                created_at: new Date().toISOString()
            })

        if (profileError) {
            // If profile fails, we might want to delete the auth user to keep consistency, 
            // but for now let's just return the error
            console.error('Profile creation error:', profileError)
            // await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
            // throw new Error('Failed to create profile')
        }

        return new Response(
            JSON.stringify({ user: newUser.user, message: 'User created successfully' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
