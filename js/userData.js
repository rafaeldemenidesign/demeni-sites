/* ===========================
   DEMENI SITES - USER DATA MODULE
   Manages user data, projects, and storage
   User-scoped: each user gets isolated data
   Cloud-synced via Supabase
   =========================== */

const UserData = (function () {
    // ========== STORAGE KEYS ==========
    const KEYS = {
        USER: 'demeni-user',
        PROJECTS: 'demeni-projects',
        SESSION: 'demeni-session'
    };

    // Debounce timer for cloud saves
    const _pendingCloudSaves = {};
    const CLOUD_SAVE_DELAY = 3000; // 3 seconds

    // Current user ID for scoped storage
    let _currentUserId = null;

    // Auto-initialize from existing session (prevents race condition with auth.init)
    try {
        const savedUser = localStorage.getItem('demeni-current-user');
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            if (parsed && parsed.id) {
                _currentUserId = parsed.id;
                console.log('✅ UserData: auto-scoped to user', _currentUserId.substring(0, 8) + '...');
            }
        }
    } catch (e) { /* ignore */ }

    // Set the active user ID (called on login/init)
    function setUserId(userId) {
        _currentUserId = userId;
        // Migrate old unscoped data if exists
        _migrateUnscopedData(userId);
    }

    // Get scoped key for storage
    function _scopedKey(baseKey) {
        if (_currentUserId) {
            return `${baseKey}-${_currentUserId}`;
        }
        return baseKey;
    }

    // Migrate old unscoped data to user-scoped keys (one-time)
    function _migrateUnscopedData(userId) {
        const oldProjects = localStorage.getItem(KEYS.PROJECTS);
        const newKey = `${KEYS.PROJECTS}-${userId}`;
        const alreadyMigrated = localStorage.getItem(newKey);

        if (oldProjects && !alreadyMigrated) {
            // Check if this is the user who owns the old data
            const oldUser = localStorage.getItem(KEYS.USER);
            if (oldUser) {
                try {
                    const parsed = JSON.parse(oldUser);
                    if (parsed.id === userId || parsed.email) {
                        localStorage.setItem(newKey, oldProjects);
                        console.log('✅ Migrated projects to user-scoped key');
                    }
                } catch (e) { /* ignore */ }
            }
        }
    }

    // ========== DEFAULT USER STRUCTURE ==========
    const createDefaultUser = (email = null) => ({
        id: generateUUID(),
        email: email,
        name: 'Novo Usuário',
        avatar: null,
        credits: 0,
        xp: 0,
        level: 1,
        borderColor: 'default',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    });

    // ========== DEFAULT PROJECT STRUCTURE ==========
    const createDefaultProject = (name = 'Meu Site') => ({
        id: generateUUID(),
        name: name,
        data: {
            profile: {
                name: 'Seu Nome',
                role: 'Sua Profissão',
                bio: 'Uma breve descrição sobre você.',
                avatar: 'https://ui-avatars.com/api/?name=User&background=D4AF37&color=000&size=200&bold=true',
                whatsapp: ''
            },
            links: [
                { id: 1, label: 'Instagram', url: '', icon: 'instagram' },
                { id: 2, label: 'WhatsApp', url: '', icon: 'whatsapp' },
                { id: 3, label: 'E-mail', url: '', icon: 'envelope' },
                { id: 4, label: 'Site', url: '', icon: 'globe' }
            ],
            style: {
                accentColor: '#D4AF37',
                bgColor: '#FFFFFF',
                bgImage: null,
                buttonStyle: 'glass'
            }
        },
        published: false,
        publishedUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    // ========== UUID GENERATOR ==========
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // ========== STORAGE HELPERS ==========
    function save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Storage save error:', e);
            return false;
        }
    }

    function load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage load error:', e);
            return null;
        }
    }

    // ========== FIELD MAPPING (camelCase ↔ snake_case) ==========
    function toSupabase(localProject) {
        return {
            id: localProject.id,
            user_id: _currentUserId,
            name: localProject.name,
            slug: localProject.slug || null,
            data: localProject.data || {},
            published: localProject.published || false,
            published_url: localProject.publishedUrl || null,
            published_at: localProject.publishedAt || null,
            updated_at: new Date().toISOString()
        };
    }

    function fromSupabase(row) {
        return {
            id: row.id,
            name: row.name,
            slug: row.slug,
            data: row.data || {},
            published: row.published || false,
            publishedUrl: row.published_url,
            publishedAt: row.published_at,
            modelType: row.data?.modelType || 'd2',
            publishCost: row.data?.publishCost || 40,
            thumbnail: row.data?.thumbnail || null,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    // ========== SUPABASE HELPERS ==========
    function _isCloudAvailable() {
        return window.SupabaseClient && SupabaseClient.isConfigured() && _currentUserId;
    }

    // Sync all projects from Supabase to localStorage (smart merge)
    async function syncFromCloud() {
        if (!_isCloudAvailable()) return false;

        try {
            const { data, error } = await SupabaseClient.getProjects(_currentUserId);
            if (error) {
                console.error('❌ Cloud sync error:', error.message);
                return false;
            }

            const cloudProjects = (data || []).map(fromSupabase);
            const localProjects = getProjects();

            // Smart merge: for each project, keep the version with the newest updatedAt
            const mergedMap = new Map();

            // Start with cloud projects
            cloudProjects.forEach(cp => mergedMap.set(cp.id, cp));

            // Merge local projects — local wins if newer
            localProjects.forEach(lp => {
                const cp = mergedMap.get(lp.id);
                if (!cp) {
                    // Local-only project (not yet in cloud), keep it
                    mergedMap.set(lp.id, lp);
                } else {
                    // Both exist — compare timestamps
                    const localTime = new Date(lp.updatedAt || 0).getTime();
                    const cloudTime = new Date(cp.updatedAt || 0).getTime();
                    if (localTime > cloudTime) {
                        // Local is newer, keep local version
                        mergedMap.set(lp.id, lp);
                    }
                    // Otherwise cloud version (already in map) wins
                }
            });

            const merged = Array.from(mergedMap.values());
            save(_scopedKey(KEYS.PROJECTS), merged);
            console.log(`☁️ Synced ${cloudProjects.length} projects from cloud (merged with ${localProjects.length} local)`);
            return true;
        } catch (e) {
            console.error('❌ Cloud sync exception:', e);
            return false;
        }
    }

    // Debounced cloud save for a specific project
    function _scheduleCloudSave(projectId) {
        if (!_isCloudAvailable()) return;

        // Cancel previous pending save for this project
        if (_pendingCloudSaves[projectId]) {
            clearTimeout(_pendingCloudSaves[projectId]);
        }

        _pendingCloudSaves[projectId] = setTimeout(async () => {
            delete _pendingCloudSaves[projectId];
            const project = getProject(projectId);
            if (!project) return;

            try {
                const supabaseData = toSupabase(project);
                // Remove id and user_id from updates (they're the key)
                const { id, user_id, ...updates } = supabaseData;
                await SupabaseClient.updateProject(projectId, updates);
                console.log(`☁️ Saved project "${project.name}" to cloud`);
            } catch (e) {
                console.error('❌ Cloud save failed for project:', projectId, e);
            }
        }, CLOUD_SAVE_DELAY);
    }

    // ========== USER METHODS ==========
    function getUser() {
        let user = load(KEYS.USER);
        if (!user) {
            user = createDefaultUser();
            save(KEYS.USER, user);
        }
        return user;
    }

    function updateUser(updates) {
        const user = getUser();
        Object.assign(user, updates);
        save(KEYS.USER, user);
        return user;
    }

    function setUserEmail(email) {
        return updateUser({ email: email });
    }

    function isLoggedIn() {
        const user = getUser();
        return user && user.email !== null;
    }

    // ========== PROJECT METHODS ==========

    // Get projects from cache (sync). Call syncFromCloud() first to refresh.
    function getProjects() {
        let projects = load(_scopedKey(KEYS.PROJECTS));
        if (!projects) {
            projects = [];
            save(_scopedKey(KEYS.PROJECTS), projects);
        }
        return projects;
    }

    // Async version: syncs from cloud first, then returns
    async function getProjectsAsync() {
        if (_isCloudAvailable()) {
            await syncFromCloud();
        }
        return getProjects();
    }

    // Get single project (SYNC — reads from cache)
    function getProject(projectId) {
        const projects = getProjects();
        return projects.find(p => p.id === projectId) || null;
    }

    // Create project (async — creates in cloud + local)
    async function createProject(name = 'Meu Site') {
        const newProject = createDefaultProject(name);

        // Try cloud first
        if (_isCloudAvailable()) {
            try {
                const { data, error } = await SupabaseClient.createProject(_currentUserId, name);
                if (!error && data) {
                    // Use the Supabase-generated ID and merge
                    const cloudProject = fromSupabase(data);
                    cloudProject.data = newProject.data; // Keep default data structure

                    // Save locally with cloud ID
                    const projects = getProjects();
                    projects.unshift(cloudProject);
                    save(_scopedKey(KEYS.PROJECTS), projects);

                    // Also push the full data to cloud
                    _scheduleCloudSave(cloudProject.id);

                    console.log(`☁️ Project "${name}" created in cloud`);
                    return cloudProject;
                }
                console.warn('⚠️ Cloud create failed, falling back to local:', error?.message);
            } catch (e) {
                console.warn('⚠️ Cloud create exception, falling back to local:', e.message);
            }
        }

        // Fallback: local only
        const projects = getProjects();
        projects.unshift(newProject);
        save(_scopedKey(KEYS.PROJECTS), projects);
        return newProject;
    }

    // Update project — local IMMEDIATE + cloud DEBOUNCED
    function updateProject(projectId, updates) {
        const projects = getProjects();
        const index = projects.findIndex(p => p.id === projectId);

        if (index === -1) return null;

        projects[index] = {
            ...projects[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        // Save local immediately
        save(_scopedKey(KEYS.PROJECTS), projects);

        // Schedule cloud save (debounced 3s)
        _scheduleCloudSave(projectId);

        return projects[index];
    }

    function updateProjectData(projectId, data) {
        return updateProject(projectId, { data: data });
    }

    // Delete project (async — deletes from cloud + local)
    async function deleteProject(projectId) {
        // Delete locally first for instant feedback
        let projects = getProjects();
        projects = projects.filter(p => p.id !== projectId);
        save(_scopedKey(KEYS.PROJECTS), projects);

        // Cancel any pending cloud saves
        if (_pendingCloudSaves[projectId]) {
            clearTimeout(_pendingCloudSaves[projectId]);
            delete _pendingCloudSaves[projectId];
        }

        // Delete from cloud
        if (_isCloudAvailable()) {
            try {
                await SupabaseClient.deleteProject(projectId);
                console.log(`☁️ Project deleted from cloud`);
            } catch (e) {
                console.warn('⚠️ Cloud delete failed:', e.message);
            }
        }

        return true;
    }

    function publishProject(projectId, url) {
        const result = updateProject(projectId, {
            published: true,
            publishedUrl: url
        });

        // CRITICAL: Save to cloud IMMEDIATELY (bypass debounce)
        // This prevents losing published state if user reloads before debounce fires
        if (_isCloudAvailable() && result) {
            // Cancel any pending debounced save
            if (_pendingCloudSaves[projectId]) {
                clearTimeout(_pendingCloudSaves[projectId]);
                delete _pendingCloudSaves[projectId];
            }
            // Save immediately
            const supabaseData = toSupabase(result);
            const { id, user_id, ...updates } = supabaseData;
            SupabaseClient.updateProject(projectId, updates)
                .then(() => console.log('☁️ Published state saved to cloud immediately'))
                .catch(e => console.error('❌ Failed to save published state to cloud:', e));
        }

        return result;
    }

    function unpublishProject(projectId) {
        return updateProject(projectId, {
            published: false,
            publishedUrl: null
        });
    }

    // ========== CURRENT PROJECT (Session) ==========
    function setCurrentProject(projectId) {
        sessionStorage.setItem('demeni-current-project', projectId);
    }

    function getCurrentProjectId() {
        return sessionStorage.getItem('demeni-current-project');
    }

    function getCurrentProject() {
        const id = getCurrentProjectId();
        return id ? getProject(id) : null;
    }

    // ========== UTILITY METHODS ==========
    function getProjectCount() {
        return getProjects().length;
    }

    function getPublishedProjects() {
        return getProjects().filter(p => p.published);
    }

    function clearAllData() {
        localStorage.removeItem(KEYS.USER);
        localStorage.removeItem(_scopedKey(KEYS.PROJECTS));
        sessionStorage.removeItem('demeni-current-project');
    }

    // ========== EXPORT DATA (for backup) ==========
    function exportData() {
        return {
            user: getUser(),
            projects: getProjects(),
            exportedAt: new Date().toISOString()
        };
    }

    function importData(data) {
        if (data.user) save(KEYS.USER, data.user);
        if (data.projects) save(_scopedKey(KEYS.PROJECTS), data.projects);
        return true;
    }

    // ========== PUBLIC API ==========
    return {
        // User
        setUserId,
        getUser,
        updateUser,
        setUserEmail,
        isLoggedIn,

        // Projects
        getProjects,
        getProjectsAsync,
        getProject,
        createProject,
        updateProject,
        updateProjectData,
        deleteProject,
        publishProject,
        unpublishProject,
        syncFromCloud,

        // Current Project
        setCurrentProject,
        getCurrentProjectId,
        getCurrentProject,

        // Utilities
        getProjectCount,
        getPublishedProjects,
        clearAllData,
        exportData,
        importData,

        // Helpers
        generateUUID,
        createDefaultProject
    };
})();

// Make available globally
window.UserData = UserData;
