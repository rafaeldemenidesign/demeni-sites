/* ===========================
   DEMENI SITES - SUPABASE CLIENT
   Database and Auth configuration
   =========================== */

// Supabase Configuration
// Project: demeni-sites (São Paulo)
const SUPABASE_CONFIG = {
    url: 'https://aeyxdqggngapczohqvbo.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFleXhkcWdnbmdhcGN6b2hxdmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMTc3MTcsImV4cCI6MjA4NDU5MzcxN30.eq9Feo9dj6T1KUO-F4AN7j4x7HECb8f0B9WddFLD9C4'
};

// Initialize Supabase Client
const SupabaseClient = (function () {
    let supabase = null;

    function init() {
        if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL') {
            console.warn('⚠️ Supabase not configured. Using localStorage fallback.');
            return false;
        }

        // Load Supabase from CDN if not loaded
        if (typeof window.supabase === 'undefined') {
            console.error('Supabase library not loaded. Add the CDN script.');
            return false;
        }

        supabase = window.supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );

        console.log('✅ Supabase initialized');
        return true;
    }

    // ========== AUTH METHODS ==========
    async function signUp(email, password, name) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name: name }
            }
        });

        if (!error && data.user) {
            // Create user profile in database
            await createUserProfile(data.user.id, email, name);
        }

        return { data, error };
    }

    async function signIn(email, password) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        return { data, error };
    }

    async function signOut() {
        if (!supabase) return { error: { message: 'Supabase not configured' } };

        const { error } = await supabase.auth.signOut();
        return { error };
    }

    async function getSession() {
        if (!supabase) return null;

        const { data: { session } } = await supabase.auth.getSession();
        return session;
    }

    async function getUser() {
        if (!supabase) return null;

        const { data: { user } } = await supabase.auth.getUser();
        return user;
    }

    // ========== USER PROFILE ==========
    async function createUserProfile(userId, email, name) {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                email: email,
                name: name,
                credits: 0,
                xp: 0,
                level: 1,
                border_color: 'default'
            });

        return { data, error };
    }

    async function getUserProfile(userId) {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        return { data, error };
    }

    async function updateUserProfile(userId, updates) {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);

        return { data, error };
    }

    // ========== PROJECTS ==========
    async function getProjects(userId) {
        if (!supabase) return { data: [], error: null };

        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        return { data: data || [], error };
    }

    async function createProject(userId, name) {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('projects')
            .insert({
                user_id: userId,
                name: name,
                data: {},
                published: false
            })
            .select()
            .single();

        return { data, error };
    }

    async function updateProject(projectId, updates) {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('projects')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', projectId);

        return { data, error };
    }

    async function deleteProject(projectId) {
        if (!supabase) return null;

        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId);

        return { error };
    }

    // ========== PUBLISH SITE ==========
    async function publishSite(projectId, slug) {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('projects')
            .update({
                published: true,
                slug: slug,
                published_url: `https://${slug}.rafaeldemeni.com`,
                published_at: new Date().toISOString()
            })
            .eq('id', projectId);

        return { data, error };
    }

    async function getPublishedSite(slug) {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('slug', slug)
            .eq('published', true)
            .single();

        return { data, error };
    }

    // ========== UTILITY ==========
    function isConfigured() {
        return SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL';
    }

    // ========== PUBLIC API ==========
    return {
        init,
        isConfigured,

        // Auth
        signUp,
        signIn,
        signOut,
        getSession,
        getUser,

        // Profile
        getUserProfile,
        updateUserProfile,

        // Projects
        getProjects,
        createProject,
        updateProject,
        deleteProject,

        // Publish
        publishSite,
        getPublishedSite
    };
})();

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => {
    SupabaseClient.init();
});

// Make available globally
window.SupabaseClient = SupabaseClient;
