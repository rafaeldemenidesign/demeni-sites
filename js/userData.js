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
        SESSION: 'demeni-session',
        DELETED_IDS: 'demeni-deleted-ids'
    };

    // Debounce timer for cloud saves
    const _pendingCloudSaves = {};
    const CLOUD_SAVE_DELAY = 3000; // 3 seconds

    // Current user ID for scoped storage
    let _currentUserId = null;

    // Tombstone helpers — track deleted project IDs to prevent cloud sync resurrection
    function _getDeletedIds() {
        try {
            return JSON.parse(localStorage.getItem(_scopedKey(KEYS.DELETED_IDS)) || '[]');
        } catch { return []; }
    }
    function _addDeletedId(id) {
        const ids = _getDeletedIds();
        if (!ids.includes(id)) {
            ids.push(id);
            localStorage.setItem(_scopedKey(KEYS.DELETED_IDS), JSON.stringify(ids));
        }
    }
    function _removeDeletedId(id) {
        const ids = _getDeletedIds().filter(x => x !== id);
        localStorage.setItem(_scopedKey(KEYS.DELETED_IDS), JSON.stringify(ids));
    }

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
        // Include thumbnail inside data JSONB so it persists in cloud
        const dataWithThumbnail = {
            ...(localProject.data || {}),
            thumbnail: localProject.thumbnail || null
        };
        return {
            id: localProject.id,
            user_id: _currentUserId,
            name: localProject.name,
            slug: localProject.slug || null,
            data: dataWithThumbnail,
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
    let _syncPromise = null;
    async function syncFromCloud() {
        if (!_isCloudAvailable()) return false;

        // Prevent concurrent syncs (race condition guard)
        if (_syncPromise) {
            console.log('☁️ Sync already in progress, waiting...');
            return _syncPromise;
        }

        _syncPromise = _doSyncFromCloud();
        try {
            return await _syncPromise;
        } finally {
            _syncPromise = null;
        }
    }

    async function _doSyncFromCloud() {

        try {
            const { data, error } = await SupabaseClient.getProjects(_currentUserId);
            if (error) {
                console.error('❌ Cloud sync error:', error.message);
                return false;
            }

            const cloudProjects = (data || []).map(fromSupabase);
            const localProjects = getProjects();

            // Tombstone filter: skip cloud projects that were deleted locally
            const deletedIds = _getDeletedIds();
            const aliveCloudProjects = [];
            const zombieIds = []; // IDs to retry cloud deletion

            cloudProjects.forEach(cp => {
                if (deletedIds.includes(cp.id)) {
                    zombieIds.push(cp.id);
                } else {
                    aliveCloudProjects.push(cp);
                }
            });

            // Retry cloud deletion for zombie projects
            if (zombieIds.length > 0) {
                console.log(`🧹 Retrying cloud delete for ${zombieIds.length} zombie project(s)`);
                for (const zid of zombieIds) {
                    try {
                        await SupabaseClient.deleteProject(zid);
                        _removeDeletedId(zid);
                        console.log(`☁️ Zombie project ${zid.substring(0, 8)} deleted from cloud`);
                    } catch (e) {
                        console.warn(`⚠️ Retry delete failed for ${zid.substring(0, 8)}:`, e.message);
                    }
                }
            }

            // Smart merge: for each project, keep the version with the newest updatedAt
            const mergedMap = new Map();

            // Start with alive cloud projects (zombies filtered out)
            aliveCloudProjects.forEach(cp => mergedMap.set(cp.id, cp));

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

            // Clear old bloated array FIRST to free localStorage space
            save(_scopedKey(KEYS.PROJECTS), []);

            // Split data into separate keys — ONLY strip if save succeeds
            const metadataOnly = merged.map(p => {
                if (p.data && typeof p.data === 'object' && Object.keys(p.data).length > 0) {
                    const saved = save(`demeni-proj-data-${p.id}`, p.data);
                    if (saved) {
                        const { data, ...meta } = p;
                        return meta;
                    }
                    console.warn(`⚠️ Failed to save data for project ${p.id.substring(0, 8)}, keeping inline`);
                    return p; // Keep data inline as fallback
                }
                return p;
            });

            save(_scopedKey(KEYS.PROJECTS), metadataOnly);
            console.log(`☁️ Synced ${aliveCloudProjects.length} projects from cloud (merged with ${localProjects.length} local, ${zombieIds.length} zombies filtered)`);
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

        // Pass 1: Dedup by ID — if multiple entries share the same ID, keep newest
        const seenById = new Map();
        projects.forEach(p => {
            const existing = seenById.get(p.id);
            if (!existing) {
                seenById.set(p.id, p);
            } else {
                const existingTime = new Date(existing.updatedAt || 0).getTime();
                const currentTime = new Date(p.updatedAt || 0).getTime();
                if (currentTime > existingTime) {
                    seenById.set(p.id, p);
                }
            }
        });

        if (seenById.size < projects.length) {
            console.warn(`⚠️ Deduped ${projects.length - seenById.size} duplicate ID(s)`);
            projects = Array.from(seenById.values());
        }

        // Pass 2: Dedup by publishedUrl — if multiple published projects share
        // the same URL (e.g. from cloud sync issues), keep the newest
        const seenByUrl = new Map();
        let urlDupes = 0;
        const dedupedProjects = [];
        projects.forEach(p => {
            if (p.published && p.publishedUrl) {
                const existing = seenByUrl.get(p.publishedUrl);
                if (!existing) {
                    seenByUrl.set(p.publishedUrl, dedupedProjects.length);
                    dedupedProjects.push(p);
                } else {
                    // Keep the one with the newest updatedAt
                    const existingProject = dedupedProjects[existing];
                    const existingTime = new Date(existingProject.updatedAt || 0).getTime();
                    const currentTime = new Date(p.updatedAt || 0).getTime();
                    if (currentTime > existingTime) {
                        dedupedProjects[existing] = p;
                    }
                    urlDupes++;
                }
            } else {
                dedupedProjects.push(p);
            }
        });

        if (urlDupes > 0) {
            console.warn(`⚠️ Deduped ${urlDupes} duplicate publishedUrl(s)`);
            projects = dedupedProjects;
        }

        // Pass 3: Migrate embedded data to separate keys (one-time)
        // SAFETY: only strip data if save to separate key succeeds
        let dataMigrated = false;
        projects.forEach(p => {
            if (p.data && typeof p.data === 'object' && Object.keys(p.data).length > 0) {
                const saved = save(`demeni-proj-data-${p.id}`, p.data);
                if (saved) {
                    delete p.data;
                    dataMigrated = true;
                } else {
                    console.warn(`⚠️ Migration: failed to save data for ${p.id.substring(0, 8)}, keeping inline`);
                }
            }
        });
        if (dataMigrated) {
            console.log('📦 Migrated project data to separate storage keys');
        }

        // Save if any deduplication or migration happened
        if (seenById.size < (load(_scopedKey(KEYS.PROJECTS)) || []).length || urlDupes > 0 || dataMigrated) {
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
    // Reassembles the full object by loading data from its separate key
    function getProject(projectId) {
        const projects = getProjects();
        const project = projects.find(p => p.id === projectId) || null;
        if (!project) return null;

        // Load data from separate key if not already present
        if (!project.data || Object.keys(project.data).length === 0) {
            const storedData = load(`demeni-proj-data-${projectId}`);
            if (storedData) {
                project.data = storedData;
            }
        }
        return project;
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

                    // Store data separately and save metadata to projects array
                    save(`demeni-proj-data-${cloudProject.id}`, cloudProject.data);
                    const projectMeta = { ...cloudProject };
                    delete projectMeta.data;

                    const projects = getProjects();
                    projects.unshift(projectMeta);
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

        // Fallback: local only - store data separately
        save(`demeni-proj-data-${newProject.id}`, newProject.data);
        const projectMeta = { ...newProject };
        delete projectMeta.data;

        const projects = getProjects();
        projects.unshift(projectMeta);
        save(_scopedKey(KEYS.PROJECTS), projects);
        return newProject;
    }

    // Update project — local IMMEDIATE + cloud DEBOUNCED
    // Stores data in a separate key to avoid localStorage quota issues
    function updateProject(projectId, updates) {
        const projects = getProjects();
        const index = projects.findIndex(p => p.id === projectId);

        if (index === -1) return null;

        // If updates contain data, try to save it separately
        if (updates.data) {
            const dataSaved = save(`demeni-proj-data-${projectId}`, updates.data);
            if (dataSaved) {
                // Success: don't store data in the main projects array
                const updatesWithoutData = { ...updates };
                delete updatesWithoutData.data;
                projects[index] = {
                    ...projects[index],
                    ...updatesWithoutData,
                    updatedAt: new Date().toISOString()
                };
            } else {
                // Fallback: keep data inline (better than losing it)
                console.warn('⚠️ Separate data save failed, keeping inline');
                projects[index] = {
                    ...projects[index],
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            projects[index] = {
                ...projects[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
        }

        // Save metadata
        save(_scopedKey(KEYS.PROJECTS), projects);

        // Schedule cloud save (debounced 3s)
        _scheduleCloudSave(projectId);

        // Return full project with data
        const fullProject = { ...projects[index] };
        if (updates.data) fullProject.data = updates.data;
        return fullProject;
    }

    function updateProjectData(projectId, data) {
        return updateProject(projectId, { data: data });
    }

    // Delete project (async — deletes from cloud + local)
    async function deleteProject(projectId) {
        // Mark as deleted FIRST (tombstone) to prevent cloud sync resurrection
        _addDeletedId(projectId);

        // Delete locally for instant feedback
        let projects = getProjects();
        projects = projects.filter(p => p.id !== projectId);
        save(_scopedKey(KEYS.PROJECTS), projects);
        // Clean up separate data key
        try { localStorage.removeItem(`demeni-proj-data-${projectId}`); } catch (e) { }

        // Cancel any pending cloud saves
        if (_pendingCloudSaves[projectId]) {
            clearTimeout(_pendingCloudSaves[projectId]);
            delete _pendingCloudSaves[projectId];
        }

        // Delete from cloud
        if (_isCloudAvailable()) {
            try {
                await SupabaseClient.deleteProject(projectId);
                _removeDeletedId(projectId); // Cloud delete succeeded, remove tombstone
                console.log(`☁️ Project deleted from cloud`);
            } catch (e) {
                console.warn('⚠️ Cloud delete failed (will retry on next sync):', e.message);
                // Tombstone stays — _doSyncFromCloud will retry
            }
        }

        return true;
    }

    function publishProject(projectId, url) {
        // Extract subdomain from URL for reliable retrieval later
        let subdomain = '';
        if (url) {
            try {
                const hostname = new URL(url).hostname;
                const parts = hostname.split('.');
                if (parts.length >= 3) subdomain = parts[0];
            } catch { /* ignore */ }
        }

        const result = updateProject(projectId, {
            published: true,
            publishedUrl: url,
            subdomain: subdomain
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
