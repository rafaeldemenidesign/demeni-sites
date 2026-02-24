/* ===========================
   DEMENI SITES - AFFILIATES MODULE
   Sistema de Afiliados
   =========================== */

const Affiliates = (function () {
    // ========== AFFILIATE COMMISSION TIERS ==========
    // Estrutura escalável: quando o preço de entrada subir, a comissão acompanha
    const AFFILIATE_TIERS = [
        { entryPrice: 400, commission: 50, discount: 0.10 },  // Atual
        { entryPrice: 800, commission: 100, discount: 0.10 },
        { entryPrice: 1200, commission: 150, discount: 0.10 },
        { entryPrice: 1600, commission: 200, discount: 0.10 },
        { entryPrice: 2000, commission: 250, discount: 0.10 }
    ];

    // Tier ativo (alterar index quando mudar o preço de entrada)
    let _activeTierIndex = 0;

    function getActiveTier() {
        return AFFILIATE_TIERS[_activeTierIndex] || AFFILIATE_TIERS[0];
    }

    function setActiveTierByPrice(price) {
        const idx = AFFILIATE_TIERS.findIndex(t => t.entryPrice === price);
        if (idx >= 0) _activeTierIndex = idx;
    }

    function _supabase() {
        return SupabaseClient.getClient();
    }

    // ========== GET CURRENT USER AFFILIATE ==========
    async function getMyAffiliate() {
        try {
            const { data: { user } } = await _supabase().auth.getUser();
            if (!user) return null;

            const { data, error } = await _supabase()
                .from('affiliates')
                .select('*')
                .eq('user_id', user.id)
                .eq('type', 'demeni')
                .maybeSingle();

            if (error) throw error;

            // If affiliate exists, return it
            if (data) return data;

            // Auto-create affiliate record for this user
            return await _createAffiliateForUser(user);
        } catch (e) {
            console.error('Error getting affiliate:', e);
            return null;
        }
    }

    // Auto-create affiliate record with unique referral code
    async function _createAffiliateForUser(user) {
        try {
            // Get user profile for name
            const { data: profile } = await _supabase()
                .from('profiles')
                .select('name')
                .eq('id', user.id)
                .maybeSingle();

            // Generate code: first 4 chars of name (uppercase) + 4 random digits
            const baseName = (profile?.name || user.email?.split('@')[0] || 'USER')
                .replace(/[^a-zA-Z]/g, '')
                .toUpperCase()
                .slice(0, 4);
            const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digits
            const referralCode = `${baseName}${randomSuffix}`;

            const { data: newAffiliate, error } = await _supabase()
                .from('affiliates')
                .insert({
                    user_id: user.id,
                    referral_code: referralCode,
                    type: 'demeni',
                    total_referrals: 0,
                    total_earned: 0
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating affiliate:', error);
                return null;
            }

            console.log('✅ Affiliate auto-created:', referralCode);
            return newAffiliate;
        } catch (e) {
            console.error('Error auto-creating affiliate:', e);
            return null;
        }
    }

    // ========== GET REFERRAL CODE ==========
    async function getMyReferralCode() {
        const affiliate = await getMyAffiliate();
        return affiliate?.referral_code || null;
    }

    // ========== GET REFERRAL LINK ==========
    async function getReferralLink() {
        const code = await getMyReferralCode();
        if (!code) return null;

        // Use production URL for sharing (not localhost)
        const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? window.location.origin
            : 'https://sites.rafaeldemeni.com';
        return `${baseUrl}/franquia.html?ref=${code}`;
    }

    // ========== GET MY REFERRALS (people I referred) ==========
    async function getMyReferrals() {
        try {
            const affiliate = await getMyAffiliate();
            if (!affiliate) return [];

            const { data, error } = await _supabase()
                .from('referrals')
                .select(`
                    *,
                    referred_user:profiles!referrals_referred_user_id_fkey(name, email)
                `)
                .eq('affiliate_id', affiliate.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('Error getting referrals:', e);
            return [];
        }
    }

    // ========== GET MY STATS ==========
    async function getMyStats() {
        try {
            const affiliate = await getMyAffiliate();
            if (!affiliate) return null;

            const referrals = await getMyReferrals();

            return {
                referralCode: affiliate.referral_code,
                totalReferrals: affiliate.total_referrals,
                totalEarned: affiliate.total_earned,
                pendingReferrals: referrals.filter(r => r.status === 'pending').length,
                convertedReferrals: referrals.filter(r => r.status === 'converted').length,
                paidReferrals: referrals.filter(r => r.status === 'paid').length
            };
        } catch (e) {
            console.error('Error getting stats:', e);
            return null;
        }
    }

    // ========== SAVE REFERRAL CODE FROM URL ==========
    function saveReferralFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');

        if (refCode) {
            localStorage.setItem('demeni_referral_code', refCode);
            console.log('Referral code saved:', refCode);
            return refCode;
        }
        return null;
    }

    // ========== GET SAVED REFERRAL CODE ==========
    function getSavedReferralCode() {
        return localStorage.getItem('demeni_referral_code');
    }

    // ========== CLEAR SAVED REFERRAL CODE ==========
    function clearSavedReferralCode() {
        localStorage.removeItem('demeni_referral_code');
    }

    // ========== REGISTER REFERRAL ON SIGNUP ==========
    async function registerReferralOnSignup(newUserId) {
        try {
            const refCode = getSavedReferralCode();
            if (!refCode) return null;

            // Find the affiliate with this code
            const { data: affiliate, error: affError } = await _supabase()
                .from('affiliates')
                .select('id, user_id')
                .eq('referral_code', refCode)
                .single();

            if (affError || !affiliate) {
                console.log('Referral code not found:', refCode);
                clearSavedReferralCode();
                return null;
            }

            // Don't allow self-referral
            if (affiliate.user_id === newUserId) {
                console.log('Self-referral not allowed');
                clearSavedReferralCode();
                return null;
            }

            // Update profile with referred_by
            const { error: profileError } = await _supabase()
                .from('profiles')
                .update({ referred_by: affiliate.id })
                .eq('id', newUserId);

            if (profileError) throw profileError;

            // Create pending referral record
            const { data: referral, error: refError } = await _supabase()
                .from('referrals')
                .insert({
                    affiliate_id: affiliate.id,
                    referred_user_id: newUserId,
                    status: 'pending'
                })
                .select()
                .single();

            if (refError) throw refError;

            clearSavedReferralCode();
            console.log('Referral registered successfully');
            return referral;
        } catch (e) {
            console.error('Error registering referral:', e);
            return null;
        }
    }

    // ========== FRANCHISEE AFFILIATES (people who affiliate for me) ==========

    // Get my affiliate config
    async function getMyAffiliateConfig() {
        try {
            const { data: { user } } = await _supabase().auth.getUser();
            if (!user) return null;

            const { data, error } = await _supabase()
                .from('affiliate_configs')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
            return data;
        } catch (e) {
            console.error('Error getting affiliate config:', e);
            return null;
        }
    }

    // Create or update affiliate config
    async function saveAffiliateConfig(config) {
        try {
            const { data: { user } } = await _supabase().auth.getUser();
            if (!user) return null;

            const { data, error } = await _supabase()
                .from('affiliate_configs')
                .upsert({
                    user_id: user.id,
                    ...config,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (e) {
            console.error('Error saving affiliate config:', e);
            return null;
        }
    }

    // Get my franchisee affiliates (people who affiliate for me)
    async function getMyFranchiseeAffiliates() {
        try {
            const { data: { user } } = await _supabase().auth.getUser();
            if (!user) return [];

            const { data, error } = await _supabase()
                .from('affiliates')
                .select(`
                    *,
                    user:profiles!affiliates_user_id_fkey(name, email)
                `)
                .eq('parent_user_id', user.id)
                .eq('type', 'franchisee')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('Error getting franchisee affiliates:', e);
            return [];
        }
    }

    // Add a franchisee affiliate
    async function addFranchiseeAffiliate(name, email) {
        try {
            const { data: { user } } = await _supabase().auth.getUser();
            if (!user) return null;

            // Generate referral code for this affiliate
            const code = `${name.split(' ')[0].toUpperCase().slice(0, 4)}${Math.floor(Math.random() * 10000)}`;

            const { data, error } = await _supabase()
                .from('affiliates')
                .insert({
                    user_id: user.id, // The affiliate record belongs to current user
                    parent_user_id: user.id,
                    referral_code: code,
                    type: 'franchisee'
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (e) {
            console.error('Error adding franchisee affiliate:', e);
            return null;
        }
    }

    // ========== COPY TO CLIPBOARD ==========
    async function copyReferralLink() {
        const link = await getReferralLink();
        if (link) {
            await navigator.clipboard.writeText(link);
            return true;
        }
        return false;
    }

    // ========== PUBLIC API ==========
    return {
        // Demeni Affiliates (Franqueado → Franqueado)
        getMyAffiliate,
        getMyReferralCode,
        getReferralLink,
        getMyReferrals,
        getMyStats,
        copyReferralLink,

        // Referral Tracking
        saveReferralFromUrl,
        getSavedReferralCode,
        clearSavedReferralCode,
        registerReferralOnSignup,

        // Commission Tiers
        getActiveTier,
        setActiveTierByPrice,
        AFFILIATE_TIERS
    };
})();

// Make available globally
window.Affiliates = Affiliates;

// Auto-save referral code from URL on page load
document.addEventListener('DOMContentLoaded', function () {
    Affiliates.saveReferralFromUrl();
});
