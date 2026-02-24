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

    // 🛡️ V1 FIX: Salvar dados pendentes no localStorage ao fechar a aba
    // (IndexedDB é async e pode não completar; localStorage é síncrono e confiável)
    window.addEventListener('beforeunload', () => {
        const pendingIds = Object.keys(_pendingCloudSaves);
        if (pendingIds.length === 0) return;
        console.log(`🛡️ beforeunload: salvando ${pendingIds.length} projeto(s) pendente(s) no localStorage`);
        for (const projectId of pendingIds) {
            clearTimeout(_pendingCloudSaves[projectId]);
            delete _pendingCloudSaves[projectId];
            try {
                // Salvar dados do cache no localStorage como fallback seguro
                if (_dataCache[projectId]) {
                    localStorage.setItem(`demeni-proj-data-${projectId}`, JSON.stringify(_dataCache[projectId]));
                    console.log(`🛡️ Dados de ${projectId.substring(0, 8)} salvos no localStorage`);
                }
            } catch (e) {
                console.error('❌ beforeunload save failed:', e);
            }
        }
    });

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

    // ========== IndexedDB for bulky project data (50MB+ limit) ==========
    const IDB_NAME = 'demeni-sites-db';
    const IDB_VERSION = 1;
    const IDB_STORE = 'project-data';
    let _dbPromise = null;

    function _getDB() {
        if (_dbPromise) return _dbPromise;
        _dbPromise = new Promise((resolve, reject) => {
            try {
                const req = indexedDB.open(IDB_NAME, IDB_VERSION);
                req.onupgradeneeded = () => {
                    const db = req.result;
                    if (!db.objectStoreNames.contains(IDB_STORE)) {
                        db.createObjectStore(IDB_STORE);
                    }
                };
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => {
                    console.error('IndexedDB open error:', req.error);
                    _dbPromise = null;
                    reject(req.error);
                };
            } catch (e) {
                _dbPromise = null;
                reject(e);
            }
        });
        return _dbPromise;
    }

    async function idbSave(key, data) {
        try {
            const db = await _getDB();
            return new Promise((resolve) => {
                const tx = db.transaction(IDB_STORE, 'readwrite');
                tx.objectStore(IDB_STORE).put(data, key);
                tx.oncomplete = () => resolve(true);
                tx.onerror = () => {
                    console.error('IndexedDB save error:', tx.error);
                    resolve(false);
                };
            });
        } catch (e) {
            console.error('IndexedDB save exception:', e);
            return false;
        }
    }

    async function idbLoad(key) {
        try {
            const db = await _getDB();
            return new Promise((resolve) => {
                const tx = db.transaction(IDB_STORE, 'readonly');
                const req = tx.objectStore(IDB_STORE).get(key);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => {
                    console.error('IndexedDB load error:', req.error);
                    resolve(null);
                };
            });
        } catch (e) {
            console.error('IndexedDB load exception:', e);
            return null;
        }
    }

    async function idbDelete(key) {
        try {
            const db = await _getDB();
            return new Promise((resolve) => {
                const tx = db.transaction(IDB_STORE, 'readwrite');
                tx.objectStore(IDB_STORE).delete(key);
                tx.oncomplete = () => resolve(true);
                tx.onerror = () => resolve(false);
            });
        } catch (e) { return false; }
    }

    // Sync wrapper: saves to IndexedDB AND keeps in-memory cache for sync access
    const _dataCache = {};

    async function saveProjectData(projectId, data, { force = false } = {}) {
        // 🛡️ Proteção 3: Anti-downgrade — verificar se dados novos são piores
        const existingData = _dataCache[projectId];
        if (!force && existingData && typeof existingData === 'object') {
            const existingSize = JSON.stringify(existingData).length;
            const newSize = JSON.stringify(data).length;
            const existingKeys = Object.keys(existingData).length;
            const newKeys = Object.keys(data).length;

            // Se dados novos são muito menores (< 60% do tamanho), é provável downgrade
            if (existingSize > 500 && newSize < existingSize * 0.6) {
                console.warn(`🛡️ Anti-downgrade: bloqueando save de ${projectId.substring(0, 8)} — existente=${existingSize}B/${existingKeys}keys, novo=${newSize}B/${newKeys}keys`);
                return false;
            }
        }

        // 🛡️ Backup: salvar versão anterior antes de sobrescrever
        if (existingData && typeof existingData === 'object' && Object.keys(existingData).length > 5) {
            await idbSave(`proj-backup-${projectId}`, existingData);
        }

        _dataCache[projectId] = data;
        const ok = await idbSave(`proj-data-${projectId}`, data);
        if (!ok) {
            console.warn('⚠️ IndexedDB save failed for', projectId.substring(0, 8));
            save(`demeni-proj-data-${projectId}`, data);
        }
        return ok;
    }

    function loadProjectDataSync(projectId) {
        // Check in-memory cache first
        if (_dataCache[projectId]) return _dataCache[projectId];
        // Fallback to localStorage
        const lsData = load(`demeni-proj-data-${projectId}`);
        if (lsData) {
            _dataCache[projectId] = lsData;
            return lsData;
        }
        // Trigger background IndexedDB load for future sync access
        loadProjectData(projectId).then(data => {
            if (data) console.log('📦 Loaded from IndexedDB into cache:', projectId.substring(0, 8));
        });
        return null;
    }

    async function loadProjectData(projectId) {
        // Check in-memory cache first
        if (_dataCache[projectId]) return _dataCache[projectId];
        // Try IndexedDB
        const idbData = await idbLoad(`proj-data-${projectId}`);
        if (idbData) {
            _dataCache[projectId] = idbData;
            return idbData;
        }
        // Fallback to localStorage
        const lsData = load(`demeni-proj-data-${projectId}`);
        if (lsData) {
            _dataCache[projectId] = lsData;
            // Migrate to IndexedDB
            idbSave(`proj-data-${projectId}`, lsData);
            return lsData;
        }
        return null;
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

            // 🛡️ Proteção 1: Cloud sync inteligente — comparar qualidade dos dados
            const metadataOnly = [];
            for (const p of merged) {
                if (p.data && typeof p.data === 'object' && Object.keys(p.data).length > 0) {
                    const cloudSize = JSON.stringify(p.data).length;
                    const localData = await idbLoad(`proj-data-${p.id}`);
                    const localSize = localData ? JSON.stringify(localData).length : 0;

                    if (localSize > 0 && localSize >= cloudSize) {
                        console.log(`🛡️ Sync: mantendo local de ${p.id.substring(0, 8)} (local=${localSize}B >= cloud=${cloudSize}B)`);
                    } else if (cloudSize > 50) {
                        // 🛡️ V2 FIX: Só aceitar dados do cloud se ele realmente tem conteúdo substancial
                        await saveProjectData(p.id, p.data, { force: true });
                    } else {
                        console.warn(`🛡️ V2: Bloqueando sync de dados vazios do cloud para ${p.id.substring(0, 8)} (cloudSize=${cloudSize}B)`);
                    }
                    const { data, ...meta } = p;
                    metadataOnly.push(meta);
                } else {
                    metadataOnly.push(p);
                }
            }

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

        // Pass 3: Migrate embedded data to IndexedDB (one-time)
        let dataMigrated = false;
        projects.forEach(p => {
            if (p.data && typeof p.data === 'object' && Object.keys(p.data).length > 0) {
                saveProjectData(p.id, p.data);
                delete p.data;
                dataMigrated = true;
            }
        });
        if (dataMigrated) {
            console.log('📦 Migrated project data to IndexedDB');
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

    // Get single project (SYNC — reads from cache + IndexedDB cache)
    function getProject(projectId) {
        const projects = getProjects();
        const project = projects.find(p => p.id === projectId) || null;
        if (!project) return null;

        // Load data from IndexedDB/cache if not already present
        if (!project.data || Object.keys(project.data).length === 0) {
            const storedData = loadProjectDataSync(projectId);
            if (storedData) {
                project.data = storedData;
            }
        }
        return project;
    }

    // 🛡️ Proteção 2: Async version — SEMPRE tenta IndexedDB primeiro
    async function getProjectAsync(projectId) {
        const projects = getProjects();
        const project = projects.find(p => p.id === projectId) || null;
        if (!project) return null;

        // IndexedDB é a fonte de verdade para dados de projeto
        const storedData = await loadProjectData(projectId);
        if (storedData && Object.keys(storedData).length > 0) {
            // Usar IndexedDB se mais rico que project.data embutido
            const storedSize = JSON.stringify(storedData).length;
            const embeddedSize = project.data ? JSON.stringify(project.data).length : 0;
            if (storedSize >= embeddedSize) {
                project.data = storedData;
            }
        } else if (!project.data || Object.keys(project.data).length === 0) {
            console.log('[UserData] Sem dados para projeto', projectId.substring(0, 8));
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

                    // Store data in IndexedDB and save metadata to projects array
                    saveProjectData(cloudProject.id, cloudProject.data);
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

        // Fallback: local only - store data in IndexedDB
        saveProjectData(newProject.id, newProject.data);
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

        // Save data to IndexedDB (never in main array)
        if (updates.data) {
            // 🛡️ V4 FIX: Catch async errors and fallback to localStorage
            saveProjectData(projectId, updates.data).catch(e => {
                console.error('❌ CRITICAL: IndexedDB save failed, using localStorage fallback:', e);
                save(`demeni-proj-data-${projectId}`, updates.data);
            });
            const updatesWithoutData = { ...updates };
            delete updatesWithoutData.data;
            projects[index] = {
                ...projects[index],
                ...updatesWithoutData,
                updatedAt: new Date().toISOString()
            };
        } else {
            projects[index] = {
                ...projects[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
        }

        // Save metadata (lightweight, no bulky data)
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
        // Clean up separate data key (IndexedDB + localStorage + cache)
        idbDelete(`proj-data-${projectId}`);
        delete _dataCache[projectId];
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

    // Preload all project data from IndexedDB into _dataCache (call on startup)
    async function preloadCache() {
        const projects = getProjects();
        let loaded = 0;
        for (const p of projects) {
            if (!_dataCache[p.id]) {
                const data = await idbLoad(`proj-data-${p.id}`);
                if (data) {
                    _dataCache[p.id] = data;
                    loaded++;
                }
            }
        }
        if (loaded > 0) console.log(`📦 Preloaded ${loaded} project(s) from IndexedDB into cache`);
        return loaded;
    }

    // 🛡️ Proteção 5: Export completo de todos os projetos para backup
    async function exportAllProjects() {
        const projects = getProjects();
        const fullExport = {};
        let count = 0;
        for (const p of projects) {
            const data = await loadProjectData(p.id);
            if (data && Object.keys(data).length > 0) {
                fullExport[p.id] = {
                    id: p.id,
                    name: p.name,
                    data: data,
                    updatedAt: p.updatedAt,
                    exportedAt: new Date().toISOString()
                };
                count++;
            }
        }
        console.log(`📦 Exportados ${count} projetos com dados`);

        // Auto-download JSON
        const blob = new Blob([JSON.stringify(fullExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `demeni-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        return fullExport;
    }

    // 🛡️ V5 FIX: Import completo de projetos (partner de exportAllProjects)
    async function importAllProjects(exportData) {
        if (!exportData || typeof exportData !== 'object') {
            console.error('❌ importAllProjects: dados inválidos');
            return 0;
        }
        let count = 0;
        const projects = getProjects();
        for (const [projectId, entry] of Object.entries(exportData)) {
            if (!entry.data || !entry.id) continue;
            // Save project data to IndexedDB
            await saveProjectData(entry.id, entry.data, { force: true });
            // Add to projects list if not already there
            if (!projects.find(p => p.id === entry.id)) {
                projects.unshift({
                    id: entry.id,
                    name: entry.name || 'Projeto Importado',
                    updatedAt: entry.updatedAt || new Date().toISOString()
                });
            }
            count++;
        }
        save(_scopedKey(KEYS.PROJECTS), projects);
        console.log(`📦 Importados ${count} projetos com dados`);
        return count;
    }

    // ========== CHECKPOINT SYSTEM ==========

    // Save a checkpoint (snapshot) of the current project data
    async function saveCheckpoint(projectId) {
        const data = await loadProjectData(projectId);
        if (!data || Object.keys(data).length === 0) {
            console.warn('⚠️ Checkpoint: sem dados para salvar');
            return false;
        }
        // Store checkpoint with timestamp
        const checkpoint = {
            data: JSON.parse(JSON.stringify(data)), // deep clone
            savedAt: new Date().toISOString(),
            size: JSON.stringify(data).length
        };
        const ok = await idbSave(`proj-checkpoint-${projectId}`, checkpoint);
        if (ok) {
            console.log(`📌 Checkpoint salvo para ${projectId.substring(0, 8)} (${checkpoint.size}B)`);
        }
        return ok;
    }

    // Load the last checkpoint for a project
    async function loadCheckpoint(projectId) {
        const checkpoint = await idbLoad(`proj-checkpoint-${projectId}`);
        return checkpoint || null;
    }

    // Restore project to last checkpoint
    async function restoreCheckpoint(projectId) {
        const checkpoint = await loadCheckpoint(projectId);
        if (!checkpoint || !checkpoint.data) {
            console.warn('⚠️ Nenhum checkpoint encontrado para restaurar');
            return false;
        }
        // Save current as backup before restoring
        const currentData = await loadProjectData(projectId);
        if (currentData) {
            await idbSave(`proj-pre-restore-${projectId}`, currentData);
        }
        // Restore checkpoint data
        await saveProjectData(projectId, checkpoint.data, { force: true });
        // Update metadata timestamp
        const projects = getProjects();
        const idx = projects.findIndex(p => p.id === projectId);
        if (idx !== -1) {
            projects[idx].updatedAt = new Date().toISOString();
            save(_scopedKey(KEYS.PROJECTS), projects);
        }
        // Push restored data to cloud
        _scheduleCloudSave(projectId);
        console.log(`📌 Projeto ${projectId.substring(0, 8)} restaurado do checkpoint (${checkpoint.savedAt})`);
        return true;
    }

    // Check if a checkpoint exists
    async function hasCheckpoint(projectId) {
        const checkpoint = await idbLoad(`proj-checkpoint-${projectId}`);
        return checkpoint ? { exists: true, savedAt: checkpoint.savedAt, size: checkpoint.size } : { exists: false };
    }

    // Explicit save: flush to IndexedDB + cloud immediately (for Save button)
    async function explicitSave(projectId) {
        const project = getProject(projectId);
        if (!project) return false;

        // Ensure data is in IndexedDB
        const data = await loadProjectData(projectId);
        if (data) {
            await saveProjectData(projectId, data, { force: true });
        }

        // Flush to cloud immediately (cancel any pending debounce)
        if (_isCloudAvailable()) {
            if (_pendingCloudSaves[projectId]) {
                clearTimeout(_pendingCloudSaves[projectId]);
                delete _pendingCloudSaves[projectId];
            }
            try {
                const supabaseData = toSupabase(project);
                const { id, user_id, ...updates } = supabaseData;
                await SupabaseClient.updateProject(projectId, updates);
                console.log(`💾 Explicit save: projeto "${project.name}" salvo no cloud`);
            } catch (e) {
                console.error('❌ Explicit cloud save failed:', e);
                return false;
            }
        }

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
        getProjectAsync,
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
        preloadCache,

        // 🛡️ Proteção 4: API expandida para recovery
        saveProjectData,
        loadProjectData,
        exportAllProjects,
        importAllProjects,

        // 💾 Save + Checkpoint
        explicitSave,
        saveCheckpoint,
        loadCheckpoint,
        restoreCheckpoint,
        hasCheckpoint,

        // Helpers
        generateUUID,
        createDefaultProject
    };
})();

// Make available globally
window.UserData = UserData;
