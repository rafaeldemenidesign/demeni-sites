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
    async function publishSite(projectId, slug, htmlContent) {
        console.log('📤 publishSite called:', { projectId, slug, htmlContentLength: htmlContent?.length });

        if (!supabase) {
            console.error('❌ Supabase not configured');
            return { error: { message: 'Supabase not configured' } };
        }

        // Get current user
        const user = await getUser();
        console.log('👤 User:', user?.id);
        if (!user) {
            console.error('❌ User not authenticated');
            return { error: { message: 'User not authenticated' } };
        }

        // Get project name from local storage
        const localProject = window.UserData?.getProject?.(projectId);
        const projectName = localProject?.name || 'Meu Site';
        const projectData = localProject?.data || {};
        console.log('📁 Project:', { projectName, hasData: !!projectData });

        // Reserved slugs protection
        const RESERVED_SLUGS = ['sites', 'site', 'app', 'admin', 'www', 'api', 'mail', 'smtp', 'ftp', 'ns1', 'ns2', 'blog', 'loja', 'store', 'dashboard', 'painel', 'login', 'auth', 'supabase'];
        if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
            return { error: { message: `O slug "${slug}" é reservado e não pode ser usado.` } };
        }

        try {
            // 🛡️ FIX: Update the EXISTING project row by ID (not upsert by slug)
            // The old .upsert(onConflict:'slug') was creating NEW rows because the
            // original project (from createProject) had slug=null, so no conflict was found.
            console.log('⏳ Updating project by ID...');
            const { data, error } = await supabase
                .from('projects')
                .update({
                    name: projectName,
                    slug: slug,
                    data: projectData,
                    html_content: htmlContent,
                    published: true,
                    published_url: `https://${slug}.rafaeldemeni.com`,
                    published_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', projectId)
                .select()
                .single();

            console.log('✅ Supabase result:', { data: !!data, error });
            return { data, error };
        } catch (e) {
            console.error('❌ Supabase exception:', e);
            return { error: { message: e.message || 'Database error' } };
        }
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

    // ========== OG IMAGE UPLOAD ==========
    /**
     * Upload a data URI image to Supabase Storage for use as og:image.
     * Returns the public URL or null on failure.
     * Bucket 'og-images' must exist in Supabase with public access.
     */
    async function uploadOgImage(slug, dataUri) {
        if (!supabase || !dataUri || !dataUri.startsWith('data:')) return null;

        try {
            // Convert data URI to Blob
            const res = await fetch(dataUri);
            const blob = await res.blob();

            // Determine extension from mime type
            const mime = blob.type || 'image/webp';
            const ext = mime.split('/')[1] || 'webp';
            const filePath = `${slug}/og-image.${ext}`;

            // Upload to Supabase Storage (upsert to overwrite on republish)
            const { data, error } = await supabase.storage
                .from('og-images')
                .upload(filePath, blob, {
                    contentType: mime,
                    upsert: true
                });

            if (error) {
                console.warn('⚠️ OG image upload failed:', error.message);
                return null;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('og-images')
                .getPublicUrl(filePath);

            console.log('✅ OG image uploaded:', urlData.publicUrl);
            return urlData.publicUrl;
        } catch (e) {
            console.warn('⚠️ OG image upload error:', e.message);
            return null;
        }
    }

    // ========== ORDER ATTACHMENTS ==========
    /**
     * Upload a file to Supabase Storage (original quality, no compression).
     * Bucket 'order-attachments' must exist with public access.
     * Returns { url, filePath } or null on failure.
     */
    async function uploadAttachment(orderId, file) {
        if (!supabase) return null;

        try {
            const timestamp = Date.now();
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const filePath = `${orderId}/${timestamp}_${safeName}`;

            const { data, error } = await supabase.storage
                .from('order-attachments')
                .upload(filePath, file, {
                    contentType: file.type,
                    upsert: false
                });

            if (error) {
                console.warn('⚠️ Attachment upload failed:', error.message);
                return null;
            }

            const { data: urlData } = supabase.storage
                .from('order-attachments')
                .getPublicUrl(filePath);

            console.log('✅ Attachment uploaded:', urlData.publicUrl);
            return { url: urlData.publicUrl, filePath };
        } catch (e) {
            console.warn('⚠️ Attachment upload error:', e.message);
            return null;
        }
    }

    /**
     * Delete a file from Supabase Storage.
     */
    async function deleteAttachment(filePath) {
        if (!supabase || !filePath) return false;

        try {
            const { error } = await supabase.storage
                .from('order-attachments')
                .remove([filePath]);

            if (error) {
                console.warn('⚠️ Attachment delete failed:', error.message);
                return false;
            }
            console.log('✅ Attachment deleted:', filePath);
            return true;
        } catch (e) {
            console.warn('⚠️ Attachment delete error:', e.message);
            return false;
        }
    }

    // ========== CHAT ==========
    async function sendMessage(channel, content) {
        if (!supabase) return null;
        const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
        if (!user) return null;
        const { data, error } = await supabase
            .from('chat_messages')
            .insert({ channel, content, sender_id: user.id })
            .select()
            .single();
        if (error) console.warn('⚠️ Send message failed:', error.message);
        return data;
    }

    async function getMessages(channel, limit = 50) {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('channel', channel)
            .order('created_at', { ascending: true })
            .limit(limit);
        if (error) {
            console.warn('⚠️ Get messages failed:', error.message);
            return [];
        }
        return data || [];
    }

    function subscribeToChannel(channel, callback) {
        if (!supabase) return null;
        return supabase
            .channel(`chat-${channel}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `channel=eq.${channel}`
            }, (payload) => {
                callback(payload.new);
            })
            .subscribe();
    }

    function unsubscribeChannel(subscription) {
        if (subscription && supabase) {
            supabase.removeChannel(subscription);
        }
    }

    async function getProfiles() {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('profiles')
            .select('id, name, email, role, avatar_url, role_label')
            .order('name');
        if (error) {
            console.warn('⚠️ Get profiles failed:', error.message);
            return [];
        }
        return data || [];
    }

    async function getCurrentUserId() {
        if (!supabase) return null;
        const { data } = await supabase.auth.getUser();
        return data?.user?.id || null;
    }

    // ========== CRM: ORDERS ==========
    async function getOrders() {
        if (!supabase) return { data: [], error: null };
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        return { data: data || [], error };
    }

    async function createOrder(orderData) {
        if (!supabase) return { data: null, error: { message: 'Not configured' } };
        const { data, error } = await supabase
            .from('orders')
            .insert(orderData)
            .select()
            .single();
        return { data, error };
    }

    async function updateOrder(orderId, updates) {
        if (!supabase) return { data: null, error: { message: 'Not configured' } };
        const { data, error } = await supabase
            .from('orders')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', orderId)
            .select()
            .single();
        return { data, error };
    }

    async function deleteOrder(orderId) {
        if (!supabase) return { error: { message: 'Not configured' } };
        const { error } = await supabase.from('orders').delete().eq('id', orderId);
        return { error };
    }

    // ========== CRM: PAYMENTS ==========
    async function addPayment(orderIdVal, payment) {
        if (!supabase) return { data: null, error: { message: 'Not configured' } };
        const { data, error } = await supabase
            .from('payments')
            .insert({ order_id: orderIdVal, ...payment })
            .select()
            .single();
        return { data, error };
    }

    async function getPayments(orderIdVal) {
        if (!supabase) return { data: [], error: null };
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('order_id', orderIdVal)
            .order('created_at', { ascending: true });
        return { data: data || [], error };
    }

    // ========== CRM: ACTIVITY LOG ==========
    async function addActivity(orderIdVal, activity) {
        if (!supabase) return { data: null, error: null };
        const { data, error } = await supabase
            .from('activity_log')
            .insert({ order_id: orderIdVal, ...activity });
        return { data, error };
    }

    async function getActivities(orderIdVal) {
        if (!supabase) return { data: [], error: null };
        const { data, error } = await supabase
            .from('activity_log')
            .select('*')
            .eq('order_id', orderIdVal)
            .order('created_at', { ascending: false })
            .limit(20);
        return { data: data || [], error };
    }

    // ========== CRM: PERFORMANCE ==========
    async function upsertPerformance(userId, monthKey, stats) {
        if (!supabase) return { data: null, error: null };
        const { data, error } = await supabase
            .from('performance_history')
            .upsert({
                user_id: userId,
                month_key: monthKey,
                ...stats,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,month_key' });
        return { data, error };
    }

    async function getPerformanceHistory(userId) {
        if (!supabase) return { data: [], error: null };
        const { data, error } = await supabase
            .from('performance_history')
            .select('*')
            .eq('user_id', userId)
            .order('month_key', { ascending: false })
            .limit(6);
        return { data: data || [], error };
    }

    // ========== CRM: SETTINGS ==========
    async function getUserSettings(userId) {
        if (!supabase) return { data: null, error: null };
        const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .single();
        return { data, error };
    }

    async function saveUserSettings(userId, settings) {
        if (!supabase) return { data: null, error: null };
        const { data, error } = await supabase
            .from('user_settings')
            .upsert({
                user_id: userId,
                ...settings,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
        return { data, error };
    }

    // ========== CRM: TEAM ==========
    async function getTeamMembers() {
        if (!supabase) return { data: [], error: null };
        const { data, error } = await supabase
            .from('profiles')
            .select('id, name, email, role, is_admin, created_at')
            .order('created_at', { ascending: true });
        return { data: data || [], error };
    }

    // ========== SYNC: localStorage → Supabase ==========
    async function syncFromLocal() {
        if (!supabase) return { success: false, message: 'Supabase not configured' };

        try {
            const user = await getUser();
            if (!user) return { success: false, message: 'Not authenticated' };

            // 1. Sync orders
            const localOrders = JSON.parse(localStorage.getItem('demeni-orders') || '[]');
            if (localOrders.length > 0) {
                for (const order of localOrders) {
                    const { payments: localPayments, activity_log: localLog, ...orderData } = order;
                    // Upsert order
                    const { data: savedOrder, error } = await supabase
                        .from('orders')
                        .upsert(orderData, { onConflict: 'id' })
                        .select()
                        .single();

                    if (!error && savedOrder) {
                        // Sync payments
                        if (localPayments && localPayments.length > 0) {
                            for (const p of localPayments) {
                                await supabase.from('payments').upsert({
                                    order_id: savedOrder.id,
                                    amount: p.amount,
                                    method: p.method,
                                    notes: p.notes,
                                    created_at: p.date
                                });
                            }
                        }
                        // Sync activity log
                        if (localLog && localLog.length > 0) {
                            for (const a of localLog) {
                                await supabase.from('activity_log').insert({
                                    order_id: savedOrder.id,
                                    action: a.action,
                                    from_status: a.from,
                                    to_status: a.to,
                                    performed_by: a.by,
                                    created_at: a.at
                                });
                            }
                        }
                    }
                }
            }

            // 2. Sync settings
            const settingsKeys = ['salary_vendedor', 'salary_suporte', 'salary_criadora', 'commission_rate', 'bonus_site', 'sales_target'];
            const settings = {};
            settingsKeys.forEach(k => {
                const v = localStorage.getItem(`demeni-${k}`);
                if (v) settings[k] = parseFloat(v);
            });
            if (Object.keys(settings).length > 0) {
                await saveUserSettings(user.id, settings);
            }

            // 3. Sync performance
            const perfData = JSON.parse(localStorage.getItem('demeni-performance') || '{}');
            for (const [uid, data] of Object.entries(perfData)) {
                for (const [monthKey, stats] of Object.entries(data.months || {})) {
                    await upsertPerformance(uid, monthKey, stats);
                }
            }

            console.log('✅ Sync from localStorage complete');
            return { success: true, message: `${localOrders.length} pedidos sincronizados` };
        } catch (e) {
            console.error('❌ Sync error:', e);
            return { success: false, message: e.message };
        }
    }

    // ========== UTILITY ==========
    function isConfigured() {
        return SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL';
    }

    function getClient() {
        return supabase;
    }

    // ========== PUBLIC API ==========
    return {
        init,
        isConfigured,
        getClient,

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
        getPublishedSite,
        uploadOgImage,
        uploadAttachment,
        deleteAttachment,

        // Chat
        sendMessage,
        getMessages,
        subscribeToChannel,
        unsubscribeChannel,
        getProfiles,
        getCurrentUserId,

        // CRM
        getOrders,
        createOrder,
        updateOrder,
        deleteOrder,
        addPayment,
        getPayments,
        addActivity,
        getActivities,
        upsertPerformance,
        getPerformanceHistory,
        getUserSettings,
        saveUserSettings,
        getTeamMembers,
        syncFromLocal
    };
})();

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => {
    SupabaseClient.init();
});

// Make available globally
window.SupabaseClient = SupabaseClient;
