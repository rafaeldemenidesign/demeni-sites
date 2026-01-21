/* ===========================
   DEMENI SITES - AUTH MODULE
   Supabase + localStorage fallback
   =========================== */

const Auth = (function () {
    // ========== STORAGE KEYS (fallback) ==========
    const KEYS = {
        USERS: 'demeni-users-db',
        SESSION: 'demeni-session',
        CURRENT_USER: 'demeni-current-user'
    };

    let useSupabase = false;

    // ========== INITIALIZE ==========
    async function init() {
        // Check if Supabase is available and configured
        if (window.SupabaseClient && SupabaseClient.isConfigured()) {
            useSupabase = true;
            console.log('✅ Auth: Using Supabase');

            // Check for existing session
            const session = await SupabaseClient.getSession();
            if (session) {
                const user = await SupabaseClient.getUser();
                if (user) {
                    await syncSupabaseUserToLocal(user);
                }
            }
        } else {
            console.log('⚠️ Auth: Using localStorage fallback');
            // Create test user if no users exist (fallback mode)
            const users = getLocalUsers();
            if (users.length === 0) {
                createTestUser();
            }
        }
    }

    // ========== REGISTER ==========
    async function register(email, password, name = '') {
        // Validate inputs
        if (!isValidEmail(email)) {
            return { success: false, error: 'Email inválido' };
        }
        if (password.length < 6) {
            return { success: false, error: 'Senha deve ter no mínimo 6 caracteres' };
        }

        if (useSupabase) {
            try {
                const { data, error } = await SupabaseClient.signUp(email, password, name || email.split('@')[0]);

                if (error) {
                    return { success: false, error: error.message };
                }

                if (data.user) {
                    await syncSupabaseUserToLocal(data.user);
                    return { success: true, user: getCurrentUser() };
                }

                return { success: true, message: 'Verifique seu email para confirmar' };
            } catch (e) {
                console.error('Supabase register error:', e);
                return { success: false, error: 'Erro ao criar conta' };
            }
        } else {
            return registerLocal(email, password, name);
        }
    }

    // ========== LOGIN ==========
    async function login(email, password) {
        if (useSupabase) {
            try {
                const { data, error } = await SupabaseClient.signIn(email, password);

                if (error) {
                    if (error.message.includes('Invalid login')) {
                        return { success: false, error: 'Email ou senha incorretos' };
                    }
                    return { success: false, error: error.message };
                }

                if (data.user) {
                    await syncSupabaseUserToLocal(data.user);
                    return { success: true, user: getCurrentUser() };
                }

                return { success: false, error: 'Erro ao fazer login' };
            } catch (e) {
                console.error('Supabase login error:', e);
                return { success: false, error: 'Erro de conexão' };
            }
        } else {
            return loginLocal(email, password);
        }
    }

    // ========== LOGOUT ==========
    async function logout() {
        if (useSupabase) {
            await SupabaseClient.signOut();
        }

        // Always clear local storage
        localStorage.removeItem(KEYS.SESSION);
        localStorage.removeItem(KEYS.CURRENT_USER);
        sessionStorage.clear();
        return true;
    }

    // ========== SESSION ==========
    async function getSession() {
        if (useSupabase) {
            return await SupabaseClient.getSession();
        }
        return getLocalSession();
    }

    function isLoggedIn() {
        // Check local cache first for speed
        const localSession = getLocalSession();
        return localSession !== null;
    }

    function getCurrentUser() {
        try {
            const data = localStorage.getItem(KEYS.CURRENT_USER);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    // ========== SYNC SUPABASE USER TO LOCAL ==========
    async function syncSupabaseUserToLocal(supabaseUser) {
        // Fetch profile from database
        const { data: profile } = await SupabaseClient.getUserProfile(supabaseUser.id);

        const user = {
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: profile?.name || supabaseUser.user_metadata?.name || 'Usuário',
            avatar: profile?.avatar || null,
            credits: profile?.credits || 0,
            xp: profile?.xp || 0,
            level: profile?.level || 1,
            borderColor: profile?.border_color || 'default'
        };

        // Save to local storage for quick access
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));

        // Create local session
        const session = {
            userId: user.id,
            email: user.email,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
        localStorage.setItem(KEYS.SESSION, JSON.stringify(session));

        // Sync with UserData module
        if (window.UserData) {
            UserData.updateUser(user);
        }

        return user;
    }

    // ========== UPDATE USER ==========
    async function updateCurrentUser(updates) {
        const currentUser = getCurrentUser();
        if (!currentUser) return null;

        if (useSupabase) {
            // Convert camelCase to snake_case for Supabase
            const supabaseUpdates = {};
            if (updates.name) supabaseUpdates.name = updates.name;
            if (updates.avatar) supabaseUpdates.avatar = updates.avatar;
            if (updates.credits !== undefined) supabaseUpdates.credits = updates.credits;
            if (updates.xp !== undefined) supabaseUpdates.xp = updates.xp;
            if (updates.level !== undefined) supabaseUpdates.level = updates.level;
            if (updates.borderColor) supabaseUpdates.border_color = updates.borderColor;

            await SupabaseClient.updateUserProfile(currentUser.id, supabaseUpdates);
        }

        // Update local cache
        const updatedUser = { ...currentUser, ...updates };
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(updatedUser));

        return updatedUser;
    }

    function syncToUserDB() {
        // Sync UserData back to auth (for backwards compatibility)
        const currentUser = getCurrentUser();
        if (!currentUser || !window.UserData) return;

        const userData = UserData.getUser();
        updateCurrentUser({
            name: userData.name,
            avatar: userData.avatar,
            credits: userData.credits,
            xp: userData.xp,
            level: userData.level,
            borderColor: userData.borderColor
        });
    }

    // ========== LOCAL FALLBACK METHODS ==========
    function getLocalUsers() {
        try {
            const data = localStorage.getItem(KEYS.USERS);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    function saveLocalUsers(users) {
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }

    function findLocalUserByEmail(email) {
        const users = getLocalUsers();
        return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    function createTestUser() {
        const testUser = {
            id: 'test-user-001',
            email: 'teste@demeni.com',
            password: hashPassword('123456'),
            name: 'Usuário Teste',
            avatar: null,
            credits: 100000,
            xp: 5000,
            level: 8,
            borderColor: 'bronze',
            createdAt: new Date().toISOString()
        };

        const users = getLocalUsers();
        users.push(testUser);
        saveLocalUsers(users);
        console.log('Test user: teste@demeni.com / 123456');
        return testUser;
    }

    function registerLocal(email, password, name) {
        if (findLocalUserByEmail(email)) {
            return { success: false, error: 'Este email já está cadastrado' };
        }

        const newUser = {
            id: generateId(),
            email: email.toLowerCase().trim(),
            password: hashPassword(password),
            name: name || email.split('@')[0],
            avatar: null,
            credits: 0,
            xp: 0,
            level: 1,
            borderColor: 'default',
            createdAt: new Date().toISOString()
        };

        const users = getLocalUsers();
        users.push(newUser);
        saveLocalUsers(users);

        createLocalSession(newUser);
        return { success: true, user: sanitizeUser(newUser) };
    }

    function loginLocal(email, password) {
        const user = findLocalUserByEmail(email);

        if (!user) {
            return { success: false, error: 'Email não encontrado' };
        }

        if (user.password !== hashPassword(password)) {
            return { success: false, error: 'Senha incorreta' };
        }

        createLocalSession(user);
        return { success: true, user: sanitizeUser(user) };
    }

    function createLocalSession(user) {
        const session = {
            userId: user.id,
            email: user.email,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };

        localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(sanitizeUser(user)));

        if (window.UserData) {
            UserData.updateUser({
                id: user.id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                credits: user.credits,
                xp: user.xp,
                level: user.level,
                borderColor: user.borderColor
            });
        }
    }

    function getLocalSession() {
        try {
            const data = localStorage.getItem(KEYS.SESSION);
            if (!data) return null;

            const session = JSON.parse(data);
            if (new Date(session.expiresAt) < new Date()) {
                logout();
                return null;
            }
            return session;
        } catch (e) {
            return null;
        }
    }

    // ========== UTILITIES ==========
    function generateId() {
        return 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    function hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'hash_' + Math.abs(hash).toString(16);
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function sanitizeUser(user) {
        const { password, ...safeUser } = user;
        return safeUser;
    }

    function isUsingSupabase() {
        return useSupabase;
    }

    // ========== INIT ON LOAD ==========
    // Use setTimeout to ensure SupabaseClient is loaded first
    setTimeout(() => init(), 100);

    // ========== PUBLIC API ==========
    return {
        // Auth
        register,
        login,
        logout,

        // Session
        isLoggedIn,
        getSession,
        getCurrentUser,

        // User management
        updateCurrentUser,
        syncToUserDB,

        // Utilities
        isValidEmail,
        isUsingSupabase
    };
})();

// Make available globally
window.Auth = Auth;
