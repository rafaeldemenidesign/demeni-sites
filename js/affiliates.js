/* ===========================
   DEMENI SITES - AFFILIATES MODULE
   Sistema de Afiliados
   =========================== */

const Affiliates = (function () {
    // ========== API ENDPOINTS ==========
    const SUPABASE_URL = window.SUPABASE_URL || localStorage.getItem('supabase_url');
    const SUPABASE_KEY = window.SUPABASE_ANON_KEY || localStorage.getItem('supabase_key');

    // ========== GET CURRENT USER AFFILIATE ==========
    async function getMyAffiliate() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('affiliates')
                .select('*')
                .eq('user_id', user.id)
                .eq('type', 'demeni')
                .single();

            if (error) throw error;
            return data;
        } catch (e) {
            console.error('Error getting affiliate:', e);
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

        const baseUrl = window.location.origin;
        return `${baseUrl}/index.html?ref=${code}`;
    }

    // ========== GET MY REFERRALS (people I referred) ==========
    async function getMyReferrals() {
        try {
            const affiliate = await getMyAffiliate();
            if (!affiliate) return [];

            const { data, error } = await supabase
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
            const { data: affiliate, error: affError } = await supabase
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
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ referred_by: affiliate.id })
                .eq('id', newUserId);

            if (profileError) throw profileError;

            // Create pending referral record
            const { data: referral, error: refError } = await supabase
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
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
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
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
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
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
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
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            // Generate referral code for this affiliate
            const code = `${name.split(' ')[0].toUpperCase().slice(0, 4)}${Math.floor(Math.random() * 10000)}`;

            const { data, error } = await supabase
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
        // Demeni Affiliates (I refer franchisees)
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

        // Franchisee Affiliates (others refer clients for me)
        getMyAffiliateConfig,
        saveAffiliateConfig,
        getMyFranchiseeAffiliates,
        addFranchiseeAffiliate
    };
})();

// Make available globally
window.Affiliates = Affiliates;

// Auto-save referral code from URL on page load
document.addEventListener('DOMContentLoaded', function () {
    Affiliates.saveReferralFromUrl();
});
