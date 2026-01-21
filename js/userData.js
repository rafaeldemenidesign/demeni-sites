/* ===========================
   DEMENI SITES - USER DATA MODULE
   Manages user data, projects, and storage
   =========================== */

const UserData = (function () {
    // ========== STORAGE KEYS ==========
    const KEYS = {
        USER: 'demeni-user',
        PROJECTS: 'demeni-projects',
        SESSION: 'demeni-session'
    };

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
                bgColor: '#000000',
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
    function getProjects() {
        let projects = load(KEYS.PROJECTS);
        if (!projects) {
            projects = [];
            save(KEYS.PROJECTS, projects);
        }
        return projects;
    }

    function getProject(projectId) {
        const projects = getProjects();
        return projects.find(p => p.id === projectId) || null;
    }

    function createProject(name = 'Meu Site') {
        const projects = getProjects();
        const newProject = createDefaultProject(name);
        projects.push(newProject);
        save(KEYS.PROJECTS, projects);
        return newProject;
    }

    function updateProject(projectId, updates) {
        const projects = getProjects();
        const index = projects.findIndex(p => p.id === projectId);

        if (index === -1) return null;

        projects[index] = {
            ...projects[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        save(KEYS.PROJECTS, projects);
        return projects[index];
    }

    function updateProjectData(projectId, data) {
        return updateProject(projectId, { data: data });
    }

    function deleteProject(projectId) {
        let projects = getProjects();
        projects = projects.filter(p => p.id !== projectId);
        save(KEYS.PROJECTS, projects);
        return true;
    }

    function publishProject(projectId, url) {
        return updateProject(projectId, {
            published: true,
            publishedUrl: url
        });
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
        localStorage.removeItem(KEYS.PROJECTS);
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
        if (data.projects) save(KEYS.PROJECTS, data.projects);
        return true;
    }

    // ========== PUBLIC API ==========
    return {
        // User
        getUser,
        updateUser,
        setUserEmail,
        isLoggedIn,

        // Projects
        getProjects,
        getProject,
        createProject,
        updateProject,
        updateProjectData,
        deleteProject,
        publishProject,
        unpublishProject,

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
