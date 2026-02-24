/* ===========================
   DEMENI SITES - DASHBOARD JS
   =========================== */

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupNavigation();
    setupMobileMenu();
    setupButtons();
    setupSupportForm();

    // Load data
    refreshUserCard();
    refreshCredits();
    loadProjects();
    initSortDropdown();
    loadPackages();
    loadTransactions();
    loadNotifications();

    // Restore previous state (persist across page reloads)
    restoreNavigationState();
}

/**
 * Restore navigation state from sessionStorage
 * This ensures user stays in the editor after page reload
 */
function restoreNavigationState() {
    const savedPage = sessionStorage.getItem('demeni_currentPage');
    const savedProjectId = sessionStorage.getItem('demeni_currentProjectId');

    if (savedPage && savedPage !== 'projects') {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            // If we're restoring to an editor page with a project ID, set it first
            if (savedProjectId && (savedPage === 'editor-d2' || savedPage === 'editor-d1')) {
                UserData.setCurrentProject(savedProjectId);
                console.log('[Persistence] Restoring project:', savedProjectId);
            }

            navigateTo(savedPage);
            console.log('[Persistence] Restored to page:', savedPage);
        }, 100);
    }
}

/**
 * Save current navigation state to sessionStorage
 * @param {string} page - The current page name
 * @param {string} projectId - Optional project ID being edited
 */
function saveNavigationState(page, projectId = null) {
    sessionStorage.setItem('demeni_currentPage', page);
    if (projectId) {
        sessionStorage.setItem('demeni_currentProjectId', projectId);
    }
}

// ========== NAVIGATION ==========
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-page]');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateTo(page);
        });
    });
}

function navigateTo(page) {
    // Special case: "new" opens modal instead of navigating to a page
    if (page === 'new') {
        createNewProject();
        return;
    }

    // Thumbnail capture removed — now only captured on Publish/Update (thumbnail.js)

    // Update nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

    // Update pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`)?.classList.add('active');

    // Update title
    const titles = {
        home: 'Página Inicial',
        projects: 'Meus Projetos',
        wallet: 'Minha Carteira',
        lessons: 'Aulas',
        affiliates: 'Afiliados',
        help: 'Ajuda',
        'editor-d2': 'Editor D-2',
        'editor-d1': 'Editor D-1'
    };
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = titles[page] || 'Dashboard';

    // Toggle header mode (credits vs editor buttons)
    const isEditorPage = page === 'editor-d2' || page === 'editor-d1';
    toggleHeaderMode(isEditorPage);

    // Toggle sort dropdown (visible only on projects page)
    const sortDropdown = document.getElementById('sort-dropdown-header');
    if (sortDropdown) {
        sortDropdown.style.display = page === 'projects' ? '' : 'none';
    }

    // "Novo Projeto" always visible in sidebar (removed conditional hide)

    // Save navigation state for persistence across page reloads
    saveNavigationState(page);

    // Initialize editors when navigating
    if (page === 'editor-d2') {
        initEditorD2().catch(err => {
            console.error('[Editor D2] ❌ Falha na inicialização:', err);
        });
        // Ensure publish button state is correct after full editor init
        setTimeout(() => {
            const pid = UserData.getCurrentProjectId();
            if (pid) updateHeaderPublishButton(pid);
        }, 500);
    }
    if (page === 'editor-d1') {
        initEditorD1();
    }
    if (page === 'affiliates') {
        initAffiliatePage();
    }

    // Close mobile menu
    document.getElementById('sidebar').classList.remove('open');
}

/**
 * Toggle header between normal mode and editor mode
 * Shows/hides editor-specific elements (project name, Preview/Publicar buttons)
 * Credits are ALWAYS visible per user requirement
 * @param {boolean} editorMode - true to show editor elements, false to hide them
 */
function toggleHeaderMode(editorMode) {
    const editorElements = document.querySelectorAll('.editor-only');
    const normalElements = document.querySelectorAll('.normal-only');

    editorElements.forEach(el => {
        el.style.display = editorMode ? 'flex' : 'none';
    });

    normalElements.forEach(el => {
        el.style.display = editorMode ? 'none' : 'flex';
    });
}

// ========== MOBILE MENU ==========
function setupMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
}

// ========== BUTTONS ==========
function setupButtons() {
    document.getElementById('btn-new-project')?.addEventListener('click', createNewProject);
    document.getElementById('btn-first-project')?.addEventListener('click', createNewProject);
}

// ========== USER CARD ==========
function refreshUserCard() {
    const user = UserData.getUser();
    const stats = XPSystem.getStats();

    // Update sidebar footer avatar
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    if (sidebarAvatar) {
        if (user.avatar) {
            sidebarAvatar.src = user.avatar;
        } else {
            // Generate initials avatar from user name
            const avatarName = encodeURIComponent(user.name || 'User');
            sidebarAvatar.src = `https://ui-avatars.com/api/?name=${avatarName}&background=D4AF37&color=000&size=80`;
        }
    }

    // Update avatar border with patente class
    if (sidebarAvatar) {
        sidebarAvatar.className = 'sidebar-avatar';
        if (stats.patente.id !== 'default') {
            sidebarAvatar.classList.add(stats.patente.id);
        }
    }

    // Update drawer user info
    const drawerName = document.getElementById('drawer-user-name');
    if (drawerName) drawerName.textContent = user.name || 'Usuário';

    const drawerLevel = document.getElementById('drawer-level-tag');
    if (drawerLevel) drawerLevel.textContent = `Nível ${stats.level} · ${stats.patente.name}`;

    const drawerXpProgress = document.getElementById('drawer-xp-progress');
    if (drawerXpProgress) drawerXpProgress.style.width = `${stats.progress.percentage}%`;

    const drawerXpText = document.getElementById('drawer-xp-text');
    if (drawerXpText) {
        drawerXpText.textContent = `${XPSystem.formatXP(stats.xp)} / ${XPSystem.formatXP(XPSystem.getXPForLevel(stats.level + 1))} XP`;
    }
}

// ========== CREDITS ==========
function refreshCredits() {
    const credits = Credits.getCredits();
    const formatted = Credits.formatCredits(credits);

    const badgeEl = document.getElementById('credits-badge');
    if (badgeEl) badgeEl.textContent = formatted;
    document.getElementById('header-credits').textContent = formatted;
    document.getElementById('wallet-balance').textContent = formatted;

    // Discount badge (gamificação)
    renderDiscountBadge();
}

function renderDiscountBadge() {
    const container = document.getElementById('discount-badge');
    if (!container || !window.XPSystem) return;

    const stats = XPSystem.getStats();
    const freeLeft = window.Credits ? Credits.getRemainingFreePublishes() : 0;
    const hex = stats.patente.hex;
    const gradient = stats.patente.gradient;
    const nextName = stats.nextPatente ? stats.nextPatente.name : 'Máximo';
    const nextHex = stats.nextPatente ? stats.nextPatente.hex : hex;
    const pct = stats.progress.percentage;

    // Apply patente gradient as solid background
    container.style.cssText = `
        display: block;
        padding: 14px 16px;
        margin-top: 4px;
        background: ${gradient};
        border: none;
        border-radius: 12px;
    `;

    container.innerHTML = `
        <!-- Header: Patente + Level -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-size: 13px; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 0.5px;">${stats.patente.name}</span>
            <span style="font-size: 12px; color: rgba(255,255,255,0.8);">Nível ${stats.level}</span>
        </div>

        <!-- Metrics Row -->
        <div style="display: flex; gap: 8px; margin-bottom: 10px;">
            <div style="flex: 1; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 8px 10px; text-align: center;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.65); margin-bottom: 2px;">Custo/site</div>
                <div style="font-size: 15px; font-weight: 700; color: #fff;">${stats.sitePrice} cr</div>
            </div>
            <div style="flex: 1; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 8px 10px; text-align: center;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.65); margin-bottom: 2px;">Grátis hoje</div>
                <div style="font-size: 15px; font-weight: 700; color: #fff;">${freeLeft}</div>
            </div>
            ${stats.discount > 0 ? `
            <div style="flex: 1; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 8px 10px; text-align: center;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.65); margin-bottom: 2px;">Desconto</div>
                <div style="font-size: 15px; font-weight: 700; color: #fff;">${stats.discount}%</div>
            </div>` : ''}
        </div>

        <!-- Progress Bar -->
        <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 10px; color: rgba(255,255,255,0.8);">${pct}% para ${nextName}</span>
                <span style="font-size: 10px; color: #fff; font-weight: 600;">▸ ${nextName}</span>
            </div>
            <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.6); border-radius: 3px; overflow: hidden;">
                <div style="width: ${pct}%; height: 100%; background: ${hex}; border-radius: 3px; transition: width 0.5s ease;"></div>
            </div>
        </div>
    `;
}

// ========== MODEL CONFIG (shared by all card renderers) ==========
const MODEL_CONFIG = {
    'd1': { name: 'D-1', icon: 'fa-link', color: '#9333ea', bgColor: 'rgba(147, 51, 234, 0.15)' },
    'd2': { name: 'D-2', icon: 'fa-store', color: '#0ea5e9', bgColor: 'rgba(14, 165, 233, 0.15)' },
    'prime': { name: 'D-3', icon: 'fa-utensils', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' }
};

// ========== PROJECTS ==========
// Current sort mode (persisted in session)
let _projectSortMode = sessionStorage.getItem('demeni-sort-mode') || 'recent';
// How many cards are currently visible per section (progressive +4)
const _visibleCount = { d1: 4, d2: 4, prime: 4 };
// Cached sorted lists per model (avoids re-sorting on "ver mais")
let _projectCache = { d1: [], d2: [], prime: [] };
const CARDS_PER_BATCH = 4;

// Sort dropdown setup (called once on init)
function initSortDropdown() {
    const btn = document.getElementById('btn-sort-projects');
    const options = document.getElementById('sort-options');
    if (!btn || !options) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        options.classList.toggle('open');
    });

    document.addEventListener('click', () => options.classList.remove('open'));

    options.querySelectorAll('.sort-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            const mode = opt.dataset.sort;
            _projectSortMode = mode;
            sessionStorage.setItem('demeni-sort-mode', mode);

            document.getElementById('sort-label').textContent = opt.textContent.trim();
            options.querySelectorAll('.sort-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            options.classList.remove('open');

            // Reset visible counts and re-render
            Object.keys(_visibleCount).forEach(k => _visibleCount[k] = CARDS_PER_BATCH);
            loadProjects();
        });
    });

    // "ver mais" — event delegation (buttons survive re-renders)
    document.getElementById('page-projects')?.addEventListener('click', (e) => {
        const seeMoreBtn = e.target.closest('.btn-see-more');
        if (!seeMoreBtn) return;

        const model = seeMoreBtn.dataset.model;
        if (!model) return;

        const total = _projectCache[model]?.length || 0;
        const currentlyVisible = _visibleCount[model] || CARDS_PER_BATCH;

        if (currentlyVisible >= total) {
            // Collapse back to 4
            _visibleCount[model] = CARDS_PER_BATCH;
            loadProjects();
            return;
        }

        // Show next batch (+4) progressively
        const newLimit = Math.min(currentlyVisible + CARDS_PER_BATCH, total);
        _visibleCount[model] = newLimit;
        _appendNextBatch(model, currentlyVisible, newLimit);

        // Update button text
        if (newLimit >= total) {
            seeMoreBtn.textContent = 'ver menos';
        }
    });
}

/**
 * Append the next batch of cards to a section grid (no re-render of existing).
 * Cards appear with staggered fade-in animation.
 */
function _appendNextBatch(model, fromIndex, toIndex) {
    const grid = document.getElementById(`grid-${model}`);
    if (!grid) return;

    const items = _projectCache[model] || [];
    const batch = items.slice(fromIndex, toIndex);

    batch.forEach((project, i) => {
        const cardHTML = renderProjectCard(project, true); // lazy=true
        const temp = document.createElement('div');
        temp.innerHTML = cardHTML.trim();
        const card = temp.firstElementChild;
        if (!card) return;

        // Start hidden, fade in with stagger
        card.style.opacity = '0';
        card.style.transform = 'translateY(12px)';
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        grid.appendChild(card);

        // Trigger fade-in on next frame with stagger delay
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            // Load lazy image after fade starts
            const img = card.querySelector('img[data-src]');
            if (img) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        }, i * 100);
    });
}

function _sortProjects(projects) {
    switch (_projectSortMode) {
        case 'online':
            return projects.sort((a, b) => {
                if (a.published && !b.published) return -1;
                if (!a.published && b.published) return 1;
                return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
            });
        case 'alpha':
            return projects.sort((a, b) => {
                const nameA = (a.name || '').toLowerCase();
                const nameB = (b.name || '').toLowerCase();
                return nameA.localeCompare(nameB, 'pt-BR');
            });
        case 'recent':
        default:
            return projects.sort((a, b) => {
                return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
            });
    }
}

async function loadProjects() {
    // Sync from cloud first (if available)
    if (window.SupabaseClient && SupabaseClient.isConfigured()) {
        await UserData.syncFromCloud();
    }
    const allProjects = UserData.getProjects();
    const empty = document.getElementById('empty-projects');

    if (allProjects.length === 0) {
        ['d1', 'd2', 'prime'].forEach(m => {
            const s = document.getElementById(`section-${m}`);
            const g = document.getElementById(`grid-${m}`);
            const sm = document.getElementById(`see-more-${m}`);
            if (s) s.style.display = 'none';
            if (g) g.style.display = 'none';
            if (sm) sm.style.display = 'none';
        });
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';

    // Group by model type and cache sorted lists
    _projectCache = {
        d1: _sortProjects([...allProjects.filter(p => !p.modelType || p.modelType === 'd1')]),
        d2: _sortProjects([...allProjects.filter(p => p.modelType === 'd2')]),
        prime: _sortProjects([...allProjects.filter(p => p.modelType === 'prime')])
    };

    // Render each section
    Object.keys(_projectCache).forEach(model => {
        const section = document.getElementById(`section-${model}`);
        const grid = document.getElementById(`grid-${model}`);
        const seeMore = document.getElementById(`see-more-${model}`);
        const counter = document.getElementById(`count-${model}`);
        const items = _projectCache[model];

        if (!section || !grid) return;

        if (items.length === 0) {
            section.style.display = 'none';
            grid.style.display = 'none';
            if (seeMore) seeMore.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        grid.style.display = 'grid';
        if (counter) counter.textContent = items.length;

        // Show only up to _visibleCount
        const limit = Math.min(_visibleCount[model], items.length);
        const firstBatch = items.slice(0, Math.min(CARDS_PER_BATCH, limit));
        const restBatch = items.slice(CARDS_PER_BATCH, limit);

        // First 4: images loaded immediately (priority)
        grid.innerHTML = firstBatch.map(p => renderProjectCard(p, false)).join('');

        // Already expanded beyond 4: render with lazy images
        if (restBatch.length > 0) {
            restBatch.forEach(p => {
                grid.insertAdjacentHTML('beforeend', renderProjectCard(p, true));
            });
            // Load their images after a short delay
            setTimeout(() => {
                grid.querySelectorAll('img[data-src]').forEach(img => {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                });
            }, 150);
        }

        // Show/hide "ver mais" button
        if (seeMore) {
            seeMore.style.display = items.length > CARDS_PER_BATCH ? 'flex' : 'none';
            const btn = seeMore.querySelector('.btn-see-more');
            if (btn) {
                btn.textContent = limit >= items.length ? 'ver menos' : 'ver mais deste modelo';
            }
        }
    });
}

// Unified card renderer for all projects (published + drafts)
// If lazy=true, images use data-src (loaded when card becomes visible)
function renderProjectCard(project, lazy) {
    const hasThumbnail = !!project.thumbnail;
    const previewImage = project.thumbnail
        || project.data?.style?.bgImage
        || project.data?.profile?.avatar
        || 'https://ui-avatars.com/api/?name=Site&background=666&color=fff';
    const previewClass = (hasThumbnail || project.data?.style?.bgImage) ? 'project-thumbnail' : '';
    const displayName = project.name || project.data?.profile?.name || 'Novo Site';
    const thumbnailStyle = hasThumbnail
        ? 'style="object-fit: cover; object-position: top center; width: 100%; height: 100%; position: absolute; top: 0; left: 0; border: none; border-radius: 20px; margin: 0; box-shadow: none; z-index: 1;"'
        : '';
    const modelType = project.modelType || 'd1';
    const model = MODEL_CONFIG[modelType] || MODEL_CONFIG['d1'];
    const isPublished = project.published;

    // Lazy: use transparent 1px gif as placeholder, load real image later
    const imgAttr = lazy
        ? `data-src="${previewImage}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"`
        : `src="${previewImage}"`;

    const activeBadge = isPublished
        ? `<span class="project-status published"><i class="fas fa-check-circle"></i> Ativo</span>`
        : '';

    const publishedActions = isPublished
        ? `<button class="btn-secondary" onclick="copyProjectLink('${project.publishedUrl}')" title="Copiar link">
               <i class="fas fa-copy"></i>
           </button>
           <a href="${project.publishedUrl}" target="_blank" class="btn-secondary" title="Abrir site">
               <i class="fas fa-external-link-alt"></i>
           </a>
           <button class="btn-secondary btn-deactivate" onclick="deactivateProject('${project.id}')" title="Desativar site">
               <i class="fas fa-power-off"></i>
           </button>
           <button class="btn-secondary btn-change-url" onclick="showChangeSubdomainModal('${project.id}')" title="Alterar URL (10 créditos)">
               <i class="fas fa-link"></i>
           </button>`
        : `<button class="btn-action duplicate" onclick="duplicateProject('${project.id}')" title="Duplicar">
               <i class="fas fa-copy"></i>
           </button>
           <button class="btn-action publish" onclick="showPublishModal('${project.id}')">
               <i class="fas fa-rocket"></i> Publicar
           </button>`;

    return `
    <div class="project-card ${isPublished ? 'published' : 'draft'} model-${modelType}" data-id="${project.id}">
        <div class="project-preview">
            <img ${imgAttr} alt="${displayName}" class="${previewClass}" ${thumbnailStyle}>
            ${activeBadge}
            <button class="btn-delete-project" onclick="deleteProjectConfirm('${project.id}')" title="Excluir">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="project-info">
            <h3 class="project-name">${displayName}</h3>
            <p class="project-date">${isPublished ? (project.publishedUrl || '') : formatDate(project.updatedAt)}</p>
            <div class="project-actions">
                <button class="btn-action" onclick="editProject('${project.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                ${publishedActions}
            </div>
        </div>
    </div>
    `;
}

function createNewProject() {
    // Open model selection modal
    showModelSelectionModal();
}

function showModelSelectionModal() {
    const modal = document.getElementById('modal-model-selection');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModelSelectionModal() {
    const modal = document.getElementById('modal-model-selection');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function selectModel(modelType) {
    // Model costs (D-1=40, D-2=60, D-3=80)
    const modelCosts = {
        'd1': 40,
        'd2': 60,
        'prime': 80
    };

    // Create project with model type
    const project = await UserData.createProject('Novo Site');
    project.modelType = modelType;
    project.publishCost = modelCosts[modelType] || 40;
    UserData.updateProject(project.id, { modelType, publishCost: modelCosts[modelType] || 40 });
    UserData.setCurrentProject(project.id);

    closeModelSelectionModal();

    // Redirect based on model type
    if (modelType === 'd2') {
        // D-2: Navigate to integrated editor page
        navigateTo('editor-d2');
    } else {
        // D-1: Navigate to embedded editor section
        navigateTo('editor-d1');
    }
}

// Expose functions
window.showModelSelectionModal = showModelSelectionModal;
window.closeModelSelectionModal = closeModelSelectionModal;
window.selectModel = selectModel;

function editProject(id) {
    const project = UserData.getProject(id);
    UserData.setCurrentProject(id);

    // Redirect based on model type
    const modelType = project?.modelType || 'd1';
    const targetPage = modelType === 'd2' ? 'editor-d2' : 'editor-d1';

    navigateTo(targetPage);

    // Save project ID for persistence across page reloads
    saveNavigationState(targetPage, id);
}

async function duplicateProject(id) {
    const original = UserData.getProject(id);
    if (!original) {
        showNotification('❌ Projeto não encontrado', 'error');
        return;
    }

    // Create a new project with copied data
    const newProject = await UserData.createProject(original.name + ' (Cópia)');

    // Copy all project data
    newProject.data = JSON.parse(JSON.stringify(original.data));
    newProject.modelType = original.modelType;
    newProject.publishCost = original.publishCost;
    newProject.thumbnail = original.thumbnail;

    // Save the updated project
    UserData.updateProject(newProject.id, {
        data: newProject.data,
        modelType: newProject.modelType,
        publishCost: newProject.publishCost,
        thumbnail: newProject.thumbnail,
        name: newProject.name
    });

    showNotification('✅ Projeto duplicado com sucesso!');

    // Set as current and open in editor
    UserData.setCurrentProject(newProject.id);

    // Navigate to editor based on model type
    const modelType = newProject.modelType || 'd1';
    const targetPage = modelType === 'd2' ? 'editor-d2' : 'editor-d1';
    navigateTo(targetPage);
    saveNavigationState(targetPage, newProject.id);
}

// ========== PUBLISH MODAL ==========
async function showPublishModal(projectId) {
    // THUMBNAIL: Capture BEFORE opening modal while preview is fully visible
    if (window.ThumbnailCapture) {
        await ThumbnailCapture.capture(projectId);
    }

    const project = UserData.getProject(projectId);
    const projectName = project?.name || window.d2State?.get('projectName') || 'Novo Site';
    const currentCredits = Credits.getCredits();
    const siteCost = window.XPSystem ? XPSystem.getCurrentSitePrice() : 40;
    const hasEnough = currentCredits >= siteCost;
    const isUpdate = !!project?.published;
    const existingSubdomain = project?.subdomain || (project?.publishedUrl ? extractSubdomain(project.publishedUrl) : '');
    const suggestedSlug = existingSubdomain || projectName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 30);

    const modalTitle = isUpdate ? 'Atualizar Site' : 'Publicar Site';
    const modalIcon = isUpdate ? 'fa-sync-alt' : 'fa-rocket';
    const confirmLabel = isUpdate ? `Atualizar gratuitamente` : `Publicar por ${siteCost} créditos`;
    const confirmIcon = isUpdate ? 'fa-sync-alt' : 'fa-rocket';

    // Remove existing modal
    document.querySelector('.publish-modal-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.className = 'publish-modal-overlay';
    overlay.innerHTML = `
        <div class="publish-modal-backdrop"></div>
        <div class="publish-modal-content">
            <div class="publish-modal-header">
                <h3><i class="fas ${modalIcon}"></i> ${modalTitle}</h3>
                <button class="publish-modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="publish-modal-body">
                <div class="publish-project-name">
                    <i class="fas fa-globe"></i> ${projectName}
                </div>

                <label class="publish-label">Subdomínio do seu site</label>
                <div class="publish-domain-input">
                    <input type="text" id="publish-subdomain" value="${suggestedSlug}" placeholder="meu-site" maxlength="30" ${isUpdate ? 'readonly style="opacity:0.7;cursor:not-allowed"' : ''} />
                    <span class="publish-domain-suffix">.rafaeldemeni.com</span>
                </div>
                <p class="publish-domain-hint">${isUpdate ? 'Subdomínio não pode ser alterado após publicação' : 'Apenas letras minúsculas, números e hífens'}</p>

                ${isUpdate ? `
                <div class="publish-cost-box has-credits">
                    <div class="publish-cost-row">
                        <span>Atualização</span>
                        <span class="publish-cost-value" style="color:#00b894;"><i class="fas fa-check-circle"></i> Gratuita</span>
                    </div>
                    <div class="publish-cost-row">
                        <span>URL do site</span>
                        <span class="publish-balance-value" style="font-size:12px;">${suggestedSlug}.rafaeldemeni.com</span>
                    </div>
                </div>
                ` : `
                <div class="publish-cost-box ${hasEnough ? 'has-credits' : 'no-credits'}">
                    <div class="publish-cost-row">
                        <span>Custo de publicação</span>
                        <span class="publish-cost-value"><i class="fas fa-coins"></i> ${siteCost} créditos</span>
                    </div>
                    <div class="publish-cost-row">
                        <span>Seu saldo atual</span>
                        <span class="publish-balance-value">${currentCredits} créditos</span>
                    </div>
                    <hr>
                    <div class="publish-cost-row publish-cost-remaining">
                        <span>Saldo após publicação</span>
                        <span>${hasEnough ? (currentCredits - siteCost) + ' créditos' : '<span style="color:#e74c3c">Insuficiente</span>'}</span>
                    </div>
                </div>

                ${!hasEnough ? `
                    <div class="publish-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        Você não tem créditos suficientes. Adquira mais créditos para publicar.
                    </div>
                ` : ''}
                `}
            </div>
            <div class="publish-modal-footer">
                <button class="publish-btn-cancel">Cancelar</button>
                ${(isUpdate || hasEnough)
            ? `<button class="publish-btn-confirm"><i class="fas ${confirmIcon}"></i> ${confirmLabel}</button>`
            : `<button class="publish-btn-buy" onclick="navigateTo('carteira')"><i class="fas fa-shopping-cart"></i> Comprar Créditos</button>`
        }
            </div>
        </div>
    `;

    // Styles are in app.css (publish-modal-* classes)
    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => overlay.classList.add('visible'));

    // Sanitize subdomain input (only if not update mode)
    const subdomainInput = overlay.querySelector('#publish-subdomain');
    if (!isUpdate) {
        subdomainInput.addEventListener('input', () => {
            subdomainInput.value = subdomainInput.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        });
    }

    // Close handlers
    const closeModal = () => {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 200);
    };
    overlay.querySelector('.publish-modal-backdrop').addEventListener('click', closeModal);
    overlay.querySelector('.publish-modal-close').addEventListener('click', closeModal);

    // Cancel
    overlay.querySelector('.publish-btn-cancel').addEventListener('click', closeModal);

    // Confirm publish/update
    const confirmBtn = overlay.querySelector('.publish-btn-confirm');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            const subdomain = subdomainInput.value.trim();
            if (!subdomain) {
                showNotification('⚠️ Digite um subdomínio');
                subdomainInput.focus();
                return;
            }
            closeModal();
            // Set subdomain in state
            if (window.d2State) {
                window.d2State.set('subdomain', subdomain);
            }
            // Store subdomain on project
            UserData.updateProject(projectId, { subdomain: subdomain });

            if (isUpdate) {
                // Free update — update project data + deploy updated HTML
                const publishedUrl = `https://${subdomain}.rafaeldemeni.com`;
                UserData.publishProject(projectId, publishedUrl);

                // Deploy updated HTML to Supabase
                const state = window.d2State ? window.d2State.getState() : null;
                const pName = window.d2State?.get('projectName') || projectName;
                const htmlContent = await generatePublishableHTML(state, pName);
                if (htmlContent && window.SupabaseClient?.isConfigured()) {
                    SupabaseClient.publishSite(projectId, subdomain, htmlContent).then(({ error }) => {
                        if (error) console.error('❌ [Update] Deploy error:', error);
                        else console.log('✅ [Update] Site updated:', publishedUrl);
                    });
                }

                showPublishSuccess(publishedUrl);
                updateHeaderPublishButton(projectId);
                loadProjects();
            } else {
                publishProject(projectId, subdomain);
            }
        });
    }
}

/**
 * Extract subdomain from a published URL like https://meunome.rafaeldemeni.com
 */
function extractSubdomain(url) {
    if (!url) return '';
    try {
        const hostname = new URL(url).hostname;
        const parts = hostname.split('.');
        if (parts.length >= 3) return parts[0];
        return '';
    } catch {
        return '';
    }
}

/**
 * Show success overlay after publishing with link to view site
 */
function showPublishSuccess(publishedUrl) {
    document.querySelector('.publish-success-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.className = 'publish-success-overlay';
    overlay.innerHTML = `
        <div class="publish-modal-backdrop"></div>
        <div class="publish-success-content">
            <div class="publish-success-icon"><i class="fas fa-check-circle"></i></div>
            <div class="publish-success-title">Site publicado com sucesso!</div>
            <div class="publish-success-url">${publishedUrl}</div>
            <div class="publish-success-actions">
                <a href="${publishedUrl}" target="_blank" class="publish-success-view">
                    <i class="fas fa-external-link-alt"></i> Ver Site Online
                </a>
                <button class="publish-success-copy" id="btn-copy-published-url">
                    <i class="fas fa-copy"></i> Copiar Link
                </button>
            </div>
            <button class="publish-success-close" id="btn-close-success">Fechar</button>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .publish-success-overlay { position:fixed; top:0; left:0; right:0; bottom:0; z-index:10001; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .3s; }
        .publish-success-overlay.visible { opacity:1; }
        .publish-success-overlay .publish-modal-backdrop { position:absolute; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); }
        .publish-success-content { position:relative; background:#fff; border-radius:16px; width:400px; max-width:90vw; box-shadow:0 20px 60px rgba(0,0,0,0.3); overflow:hidden; text-align:center; padding:32px 24px; transform:scale(0.9); transition:transform .3s ease; }
        .publish-success-overlay.visible .publish-success-content { transform:scale(1); }
        .publish-success-icon { font-size:48px; color:#00b894; margin-bottom:16px; }
        .publish-success-title { font-size:20px; font-weight:700; color:#2d3436; margin-bottom:8px; }
        .publish-success-url { font-size:14px; color:#6c5ce7; font-weight:600; margin-bottom:20px; word-break:break-all; background:#f8f9fa; padding:10px 14px; border-radius:8px; border:1px solid #dfe6e9; }
        .publish-success-actions { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }
        .publish-success-actions a, .publish-success-actions button { padding:10px 20px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:6px; transition:all .2s; }
        .publish-success-view { background:linear-gradient(135deg,#6c5ce7,#a29bfe); color:#fff; border:none; }
        .publish-success-view:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(108,92,231,0.4); }
        .publish-success-copy { background:#f8f9fa; color:#2d3436; border:1px solid #dfe6e9; }
        .publish-success-copy:hover { background:#eee; }
        .publish-success-close { background:none; border:none; color:#636e72; cursor:pointer; font-size:13px; margin-top:16px; padding:6px 12px; }
        .publish-success-close:hover { color:#2d3436; }
    `;
    overlay.appendChild(style);
    document.body.appendChild(overlay);

    // Bind events via JS (not inline onclick, avoids quoting issues)
    overlay.querySelector('#btn-copy-published-url').addEventListener('click', function () {
        navigator.clipboard.writeText(publishedUrl);
        this.innerHTML = '<i class="fas fa-check"></i> Copiado!';
    });
    overlay.querySelector('#btn-close-success').addEventListener('click', () => overlay.remove());
    overlay.querySelector('.publish-modal-backdrop').addEventListener('click', () => overlay.remove());

    setTimeout(() => overlay.classList.add('visible'), 50);
}

/**
 * Update header publish button to show "Atualizar" when project is already published.
 * Uses the same pill style as the "+ Comprar" button.
 */
function updateHeaderPublishButton(projectId) {
    const btn = document.getElementById('btn-publish-header');
    if (!btn) {
        console.log('[Publish] btn-publish-header not found in DOM');
        return;
    }

    const project = UserData.getProject(projectId);
    console.log('[Publish] updateHeaderPublishButton:', projectId?.slice(0, 8), 'published:', project?.published, 'url:', project?.publishedUrl);
    if (project?.published) {
        btn.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar';
        btn.className = 'btn-topup-pill';
    } else {
        btn.innerHTML = '<i class="fas fa-bolt"></i> Publicar';
        btn.className = 'btn-primary';
    }
}

/**
 * Resizes an image data URL to a max size suitable for PWA icons.
 * Returns a promise that resolves to a smaller data URL.
 */
function resizeImageForPWA(dataUrl, maxSize = 192) {
    return new Promise((resolve) => {
        // If it's not a data URL or already small, return as-is
        if (!dataUrl || !dataUrl.startsWith('data:') || dataUrl.length < 50000) {
            resolve(dataUrl);
            return;
        }
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = maxSize;
            canvas.height = maxSize;
            const ctx = canvas.getContext('2d');
            // Draw image scaled to fit in square
            const size = Math.min(img.width, img.height);
            const sx = (img.width - size) / 2;
            const sy = (img.height - size) / 2;
            ctx.drawImage(img, sx, sy, size, size, 0, 0, maxSize, maxSize);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = function () {
            console.warn('⚠️ Failed to resize favicon, using original');
            resolve(dataUrl);
        };
        img.src = dataUrl;
    });
}

/**
 * Generates a self-contained HTML document from the D2 editor state.
 * This HTML is what gets served at subdomain.rafaeldemeni.com
 */
async function generatePublishableHTML(state, projectName) {
    // Render the D2 preview into a temporary container
    const tempFrame = document.createElement('div');
    if (window.renderPreviewD2New) {
        window.renderPreviewD2New(tempFrame, state);
    } else {
        console.error('[Publish] renderPreviewD2New not available');
        return null;
    }

    const rawHTML = tempFrame.innerHTML;

    // SEO fields — use custom values from editor, with intelligent fallbacks
    const pwaState = state?.d2Adjustments?.pwa || state?.pwa || {};
    const seo = pwaState.seo || {};
    const seoTitle = seo.title || projectName || 'Meu Site';
    const seoDescription = seo.description || state?.heroDescription || state?.profileBio || `${projectName} - Criado com Demeni Sites`;
    // OG Image: custom upload > hero background > null
    const heroBgImage = state?.d2Adjustments?.hero?.bgImage || '';
    let ogImageUrl = seo.ogImage || (heroBgImage && heroBgImage !== 'img/hero-bg.webp' ? heroBgImage : '');

    // Data URIs can't be loaded by WhatsApp/Facebook crawlers — upload to Supabase Storage
    if (ogImageUrl && ogImageUrl.startsWith('data:') && window.SupabaseClient?.uploadOgImage) {
        const slug = state?.subdomain || window.d2State?.get('subdomain') || '';
        if (slug) {
            const publicUrl = await window.SupabaseClient.uploadOgImage(slug, ogImageUrl);
            if (publicUrl) ogImageUrl = publicUrl;
            else ogImageUrl = ''; // Don't include a data URI in og:image
        } else {
            ogImageUrl = ''; // No slug, can't upload — skip og:image
        }
    }

    // Favicon & PWA — use editor settings from state.pwa.* or d2State._pwaExportData
    let pwaExport = window.d2State?._pwaExportData || null;

    // If no cached export data (e.g. we're on the dashboard), generate from state directly
    if (!pwaExport && window.PWAUtils && state) {
        const pwaState = state.d2Adjustments?.pwa || state.pwa || {};
        const fav = pwaState.favicon || {};
        const faviconMode = fav.mode || 'auto';
        const faviconBgColor = fav.bgColor || '#1a365d';
        const faviconTextColor = fav.textColor || '#ffffff';
        const faviconShape = fav.shape || 'circle';
        const faviconImage = fav.image || null;
        const pwaThemeColor = pwaState.themeColor || faviconBgColor;
        const pwaAppName = pwaState.appName || projectName || 'Meu Site';
        // hero.title can be an object {text, color, font, ...} — extract the text string
        const heroTitleRaw = state.heroTitle || state.d2Adjustments?.hero?.title || projectName || 'Meu Site';
        const heroTitle = typeof heroTitleRaw === 'object' ? (heroTitleRaw.text || projectName || 'Meu Site') : heroTitleRaw;

        let faviconDataUrl;
        if (faviconMode === 'upload' && faviconImage) {
            faviconDataUrl = faviconImage;
        } else {
            faviconDataUrl = window.PWAUtils.generateFavicon(heroTitle, faviconBgColor, faviconTextColor, faviconShape);
        }

        pwaExport = {
            faviconDataUrl,
            themeColor: pwaThemeColor,
            appName: pwaAppName
        };
    }

    // Resize favicon to 192x192 if it's too large (uploaded images can be several MB)
    let faviconUrl = pwaExport?.faviconDataUrl || 'https://sites.rafaeldemeni.com/img/favicon.png';
    if (faviconUrl.length > 50000) {
        console.log(`🔄 Resizing favicon from ${(faviconUrl.length / 1024).toFixed(0)}KB...`);
        faviconUrl = await resizeImageForPWA(faviconUrl, 192);
        console.log(`✅ Favicon resized to ${(faviconUrl.length / 1024).toFixed(0)}KB`);
    }
    const themeColor = pwaExport?.themeColor || '#6c5ce7';
    const appName = pwaExport?.appName || projectName || 'Meu Site';

    // Build PWA manifest as inline data URI
    // Note: start_url must be '/' (absolute) because data URI manifests can't resolve relative URLs
    const pwaManifest = JSON.stringify({
        name: appName,
        short_name: appName.substring(0, 12),
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0f',
        theme_color: themeColor,
        icons: [
            { src: faviconUrl, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
            { src: faviconUrl, sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
    });
    const manifestDataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(pwaManifest);

    // Post-process: convert viewport units (vh/vw) to fixed pixel values
    // This ensures the published site looks identical to the phone preview
    // Lookahead ensures we only match CSS units, not text inside URLs or other strings
    const PHONE_W = 375;
    const PHONE_H = 812;
    const siteHTML = rawHTML.replace(/(\d+(?:\.\d+)?)vh(?=[;\s,\)!}\:])/g, (_, val) => {
        return Math.round(parseFloat(val) * PHONE_H / 100) + 'px';
    }).replace(/(\d+(?:\.\d+)?)vw(?=[;\s,\)!}\:])/g, (_, val) => {
        return Math.round(parseFloat(val) * PHONE_W / 100) + 'px';
    });
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${seoTitle}</title>
    <meta name="description" content="${seoDescription}">
    <meta name="generator" content="Demeni Sites">
    <meta name="theme-color" content="${themeColor}">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="${appName}">
    <meta property="og:title" content="${seoTitle}">
    <meta property="og:description" content="${seoDescription}">
    <meta property="og:type" content="website">
    ${ogImageUrl ? `<meta property="og:image" content="${ogImageUrl}">` : ''}
    <link rel="icon" type="image/png" href="${faviconUrl}">
    <link rel="apple-touch-icon" href="${faviconUrl}">
    <link rel="manifest" href="${manifestDataUri}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Outfit:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Bebas+Neue&family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; overflow: hidden; background: #0a0a0f; }
        body {
            display: flex;
            justify-content: center;
            align-items: flex-start;
        }
        .site-wrapper {
            width: 100%;
            min-height: 100vh;
            position: relative;
            overflow-y: auto;
            overflow-x: hidden;
        }
        /* Desktop/Tablet: fixed phone-sized container with dynamic scale */
        @media (min-width: 481px) {
            body { align-items: flex-start; padding-top: 0; }
            .site-wrapper {
                width: 375px;
                height: 812px;
                min-height: 812px;
                max-height: 812px;
                border-radius: 20px;
                box-shadow: 0 0 80px rgba(0,0,0,0.6);
                /* Scale set dynamically by JS below */
            }
        }
        /* Mobile: natural full-screen */
        @media (max-width: 480px) {
            html, body { overflow: visible; height: auto; }
            .site-wrapper {
                width: 100%;
                min-height: 100vh;
                overflow-y: visible;
            }
        }
        /* Hide scrollbar inside phone frame on desktop */
        @media (min-width: 481px) {
            .site-wrapper::-webkit-scrollbar { width: 0; background: transparent; }
            .site-wrapper { scrollbar-width: none; -ms-overflow-style: none; }
        }
    </style>
</head>
<body>
    <div class="site-wrapper">
        ${siteHTML}
    </div>
    <script>
        // Dynamic phone-viewport scaling for desktop
        (function(){
            if (window.innerWidth <= 480) return;
            var wrapper = document.querySelector('.site-wrapper');
            function fitToScreen() {
                if (window.innerWidth <= 480) {
                    wrapper.style.transform = '';
                    wrapper.style.margin = '';
                    return;
                }
                var PHONE_W = 375, PHONE_H = 812;
                var vw = window.innerWidth, vh = window.innerHeight;
                // Scale based on viewport width — phone can extend beyond viewport height
                var scale = Math.min((vw * 0.3) / PHONE_W, 2.0);
                wrapper.style.transform = 'scale(' + scale + ')';
                wrapper.style.transformOrigin = 'top center';
                // Center vertically with margin
                var scaledH = PHONE_H * scale;
                var topMargin = Math.max(0, (vh - scaledH) / 2);
                wrapper.style.marginTop = topMargin + 'px';
            }
            fitToScreen();
            window.addEventListener('resize', fitToScreen);
        })();
        // Watermark — Powered by Demeni Sites
        (function(){
            var w=document.createElement('div');
            w.style.cssText='position:fixed;bottom:8px;left:50%;transform:translateX(-50%);font-size:11px;color:rgba(255,255,255,0.4);font-family:sans-serif;z-index:9999;pointer-events:auto;';
            w.innerHTML='Criado com <a href="https://sites.rafaeldemeni.com" target="_blank" style="color:rgba(255,255,255,0.6);text-decoration:none;">Demeni Sites</a>';
            document.body.appendChild(w);
        })();

        // Force favicon — document.write() doesn't always re-process <link> tags
        (function(){
            var faviconHref='${faviconUrl}';
            if(!faviconHref)return;
            // Remove any existing favicon links
            var existing=document.querySelectorAll('link[rel="icon"],link[rel="shortcut icon"]');
            existing.forEach(function(el){el.remove()});
            // Create new favicon link
            var link=document.createElement('link');
            link.rel='icon';
            link.type='image/png';
            link.href=faviconHref;
            document.head.appendChild(link);
            // Also set apple-touch-icon
            var apple=document.createElement('link');
            apple.rel='apple-touch-icon';
            apple.href=faviconHref;
            document.head.appendChild(apple);
        })();

        // PWA: register minimal service worker (via blob) to enable install prompt
        (function(){
            if('serviceWorker' in navigator){
                var swCode='self.addEventListener("fetch",function(e){e.respondWith(fetch(e.request))});';
                var blob=new Blob([swCode],{type:'application/javascript'});
                navigator.serviceWorker.register(URL.createObjectURL(blob),{scope:'/'}).catch(function(){});
            }
        })();

        // PWA Install Banner — mobile only
        (function(){
            var deferredPrompt=null;
            var themeColor='${themeColor}';
            var appName='${appName}';
            var faviconUrl='${faviconUrl}';

            window.addEventListener('beforeinstallprompt',function(e){
                e.preventDefault();
                deferredPrompt=e;
                showInstallBanner();
            });

            function showInstallBanner(){
                if(document.querySelector('.pwa-install-banner'))return;
                var banner=document.createElement('div');
                banner.className='pwa-install-banner';
                banner.innerHTML='\
                    <div style="display:flex;align-items:center;gap:12px;flex:1">\
                        <div style="width:44px;height:44px;border-radius:12px;background:'+themeColor+';display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden">\
                            <img src="'+faviconUrl+'" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'">\
                        </div>\
                        <div style="flex:1">\
                            <div style="font-weight:700;font-size:14px;color:#fff">'+appName+'</div>\
                            <div style="font-size:12px;color:rgba(255,255,255,0.7)">Adicionar à tela inicial</div>\
                        </div>\
                    </div>\
                    <button id="pwa-install-btn" style="background:#fff;color:'+themeColor+';border:none;padding:8px 18px;border-radius:20px;font-weight:700;font-size:13px;cursor:pointer;white-space:nowrap">Instalar</button>\
                    <button id="pwa-dismiss-btn" style="background:none;border:none;color:rgba(255,255,255,0.5);font-size:18px;cursor:pointer;padding:4px 8px;margin-left:4px">&times;</button>\
                ';
                banner.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:10000;background:linear-gradient(135deg,'+themeColor+','+themeColor+'dd);backdrop-filter:blur(10px);padding:14px 16px;display:flex;align-items:center;gap:8px;font-family:sans-serif;box-shadow:0 -4px 20px rgba(0,0,0,0.3);animation:pwa-slide-up .4s ease';
                document.body.appendChild(banner);

                // Add animation keyframes
                var style=document.createElement('style');
                style.textContent='@keyframes pwa-slide-up{from{transform:translateY(100%)}to{transform:translateY(0)}}';
                document.head.appendChild(style);

                document.getElementById('pwa-install-btn').addEventListener('click',function(){
                    if(deferredPrompt){
                        deferredPrompt.prompt();
                        deferredPrompt.userChoice.then(function(r){
                            deferredPrompt=null;
                            banner.remove();
                        });
                    }
                });
                document.getElementById('pwa-dismiss-btn').addEventListener('click',function(){
                    banner.style.transform='translateY(100%)';
                    banner.style.transition='transform .3s ease';
                    setTimeout(function(){banner.remove()},300);
                });
            }

            // Fallback for iOS (no beforeinstallprompt)
            if(/iPhone|iPad|iPod/.test(navigator.userAgent)&&!navigator.standalone&&!window.matchMedia('(display-mode:standalone)').matches){
                setTimeout(function(){
                    if(document.querySelector('.pwa-install-banner'))return;
                    var banner=document.createElement('div');
                    banner.className='pwa-install-banner';
                    banner.innerHTML='\
                        <div style="display:flex;align-items:center;gap:12px;flex:1">\
                            <div style="width:44px;height:44px;border-radius:12px;background:'+themeColor+';display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden">\
                                <img src="'+faviconUrl+'" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'">\
                            </div>\
                            <div style="flex:1">\
                                <div style="font-weight:700;font-size:14px;color:#fff">'+appName+'</div>\
                                <div style="font-size:12px;color:rgba(255,255,255,0.7)">Toque em <strong>Compartilhar</strong> ➜ <strong>Adicionar à Tela</strong></div>\
                            </div>\
                        </div>\
                        <button id="pwa-dismiss-btn" style="background:none;border:none;color:rgba(255,255,255,0.5);font-size:18px;cursor:pointer;padding:4px 8px">&times;</button>\
                    ';
                    banner.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:10000;background:linear-gradient(135deg,'+themeColor+','+themeColor+'dd);backdrop-filter:blur(10px);padding:14px 16px;display:flex;align-items:center;gap:8px;font-family:sans-serif;box-shadow:0 -4px 20px rgba(0,0,0,0.3);animation:pwa-slide-up .4s ease';
                    var style=document.createElement('style');
                    style.textContent='@keyframes pwa-slide-up{from{transform:translateY(100%)}to{transform:translateY(0)}}';
                    document.head.appendChild(style);
                    document.body.appendChild(banner);
                    document.getElementById('pwa-dismiss-btn').addEventListener('click',function(){
                        banner.style.transform='translateY(100%)';
                        banner.style.transition='transform .3s ease';
                        setTimeout(function(){banner.remove()},300);
                    });
                },2000);
            }
        })();
    </script>
</body>
</html>`;
}

async function publishProject(id, subdomain) {
    // Get subdomain from param, d2State, or project
    if (!subdomain && window.d2State) subdomain = window.d2State.get('subdomain');
    if (!subdomain) {
        const project = UserData.getProject(id);
        subdomain = project?.subdomain;
    }

    // NOTE: Thumbnail was already captured in showPublishModal BEFORE the modal opened

    const result = Credits.attemptPublish(id, subdomain);

    if (result.success) {
        // Generate HTML from editor preview
        const state = window.d2State ? window.d2State.getState() : null;
        const projectName = window.d2State?.get('projectName') || UserData.getProject(id)?.name || 'Meu Site';
        const htmlContent = await generatePublishableHTML(state, projectName);

        if (htmlContent && window.SupabaseClient?.isConfigured()) {
            try {
                console.log('📤 [Publish] Uploading site to Supabase...', subdomain);
                const { data, error } = await SupabaseClient.publishSite(id, subdomain, htmlContent);
                if (error) {
                    console.error('❌ [Publish] Supabase error:', error);
                    showNotification(`⚠️ Site salvo localmente mas falhou no deploy: ${error.message}`);
                } else {
                    console.log('✅ [Publish] Site deployed successfully:', `https://${subdomain}.rafaeldemeni.com`);
                }
            } catch (e) {
                console.error('❌ [Publish] Deploy exception:', e);
            }
        }

        // Show success with URL
        showPublishSuccess(result.publishedUrl);
        // Update header button to "Atualizar" style
        updateHeaderPublishButton(id);
        loadProjects();
        refreshCredits();
    } else if (result.action === 'buy_credits') {
        // Need credits
        showBuyModal('credits', result);
    } else if (result.action === 'daily_fee') {
        // Show daily fee warning
        showNotification(`⚠️ ${result.message}`);
    }
}

// ========== PACKAGES - ESTILO CLICKSIGN ==========
async function loadPackages() {
    const grid = document.getElementById('packages-grid');
    if (!grid) return;

    // Show loading state
    grid.innerHTML = '<p style="text-align: center; color: var(--text-muted);"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>';

    // Wait for Payments module to be ready AND have packages loaded
    let attempts = 0;
    let pkgs = [];
    while (attempts < 30) {
        if (window.Payments && typeof Payments.getPackages === 'function') {
            pkgs = Payments.getPackages();
            if (pkgs && pkgs.length > 0) break;
        }
        await new Promise(resolve => setTimeout(resolve, 200));
        attempts++;
    }

    if (pkgs && pkgs.length > 0) {
        const CREDITS_PER_SITE = 40;

        grid.innerHTML = pkgs.map((pkg) => {
            const isFeatured = pkg.is_featured || pkg.id === 'plus';
            const isPromo = pkg.is_promotional;
            const totalCredits = pkg.totalCredits || (pkg.credits + (pkg.bonus_credits || 0));
            const bonusCredits = pkg.bonus_credits || 0;
            const sitesCount = Math.floor(totalCredits / CREDITS_PER_SITE);
            const icon = pkg.icon || 'fa-box';
            const features = pkg.features || [];

            // Card classes
            const cardClasses = [
                'credit-package-clicksign',
                isFeatured ? 'featured' : '',
                isPromo ? 'promo' : ''
            ].filter(Boolean).join(' ');

            // Build features list
            const featuresHTML = features.map(f =>
                `<li><i class="fas fa-check"></i> ${f}</li>`
            ).join('');

            return `
            <div class="${cardClasses}" data-package-id="${pkg.id}">
                ${isFeatured ? '<div class="featured-badge">Destaque</div>' : ''}
                
                <div class="pkg-header">
                    <i class="fas ${icon} pkg-icon"></i>
                    <h3 class="pkg-name">${pkg.name}</h3>
                </div>

                <div class="pkg-price">
                    <span class="price-currency">R$</span>
                    <span class="price-value">${Math.floor(pkg.finalPrice)}</span>
                </div>

                <div class="pkg-sites">
                    <select class="sites-select" disabled>
                        <option>${sitesCount}</option>
                    </select>
                    <span class="sites-label">Sites para criar</span>
                </div>

                <div class="pkg-credits">
                    <span class="credits-total">${totalCredits} créditos</span>
                    ${bonusCredits > 0 ? `<span class="credits-bonus">+${bonusCredits} bônus inclusos</span>` : ''}
                    ${pkg.description ? `<span class="credits-bonus">${pkg.description}</span>` : ''}
                </div>

                <button class="btn-buy-clicksign" onclick="buyPackageMP('${pkg.id}')">
                    <i class="fab fa-pix"></i> Comprar
                </button>

                ${featuresHTML ? `<ul class="pkg-features">${featuresHTML}</ul>` : ''}
            </div>
        `}).join('');
    } else {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Erro ao carregar pacotes. Recarregue a página.</p>';
    }
}

// Buy package using Mercado Pago
async function buyPackageMP(packageId) {
    if (window.Payments) {
        await Payments.openCheckout(packageId);
    } else {
        showNotification('Sistema de pagamento não disponível', 'error');
    }
}

function buyPackage(packageId) {
    const link = Credits.getPackageLink(packageId);
    window.open(link, '_blank');
}

// ========== TRANSACTIONS ==========
function loadTransactions() {
    const transactions = Credits.getTransactions();
    const list = document.getElementById('transactions-list');

    if (transactions.length === 0) {
        list.innerHTML = '<p style="padding: 20px; text-align: center; color: var(--text-muted);">Nenhuma transação ainda</p>';
        return;
    }

    list.innerHTML = transactions.slice(0, 10).map(t => `
        <div class="transaction-item">
            <div class="transaction-icon ${t.type}">
                <i class="fas ${t.type === 'credit' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
            </div>
            <div class="transaction-info">
                <h4>${t.type === 'credit' ? 'Créditos Adicionados' : 'Publicação de Site'}</h4>
                <span>${formatDate(t.timestamp)}</span>
            </div>
            <span class="transaction-amount ${t.type}">
                ${t.type === 'credit' ? '+' : '-'}${t.amount}
            </span>
        </div>
    `).join('');
}

// ========== MODALS ==========
function showBuyModal(type, data) {
    const modal = document.getElementById('modal-buy');
    const body = document.getElementById('buy-modal-body');

    if (type === 'first') {
        body.innerHTML = `
            <div style="text-align: center;">
                <h3 style="margin-bottom: 16px;">Seu primeiro site!</h3>
                <p style="color: var(--text-secondary); margin-bottom: 24px;">
                    Por apenas <strong style="color: var(--gold); font-size: 1.3rem;">R$ ${data.price}</strong> 
                    você publica seu site e tem acesso completo à plataforma.
                </p>
                <a href="${data.link}" target="_blank" class="btn-primary" style="width: 100%; justify-content: center;">
                    <i class="fab fa-pix"></i> Pagar com PIX
                </a>
                <p style="margin-top: 16px; font-size: 0.8rem; color: var(--text-muted);">
                    Pagamento único • Site vitalício
                </p>
            </div>
        `;
    } else {
        const packages = data.packages || Credits.getPackages();
        body.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <p style="color: var(--text-secondary);">
                    Você precisa de <strong>${data.required}</strong> créditos.<br>
                    Saldo atual: <strong>${data.current}</strong> créditos
                </p>
            </div>
            <div style="display: grid; gap: 12px;">
                ${packages.map(pkg => `
                    <a href="${Credits.getPackageLink(pkg.id)}" target="_blank" 
                       style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-glass); border: 1px solid var(--border); border-radius: 12px; text-decoration: none; color: var(--text-primary);">
                        <div>
                            <strong>${pkg.credits} créditos</strong>
                            ${pkg.bonus > 0 ? `<span style="color: var(--success); font-size: 0.8rem;"> +${pkg.bonus}</span>` : ''}
                        </div>
                        <span style="color: var(--gold); font-weight: 600;">${Credits.formatPrice(pkg.price)}</span>
                    </a>
                `).join('')}
            </div>
        `;
    }

    modal.classList.add('active');
}

function closeBuyModal() {
    document.getElementById('modal-buy').classList.remove('active');
}

function closeLevelUpModal() {
    document.getElementById('modal-levelup').classList.remove('active');
}

function showLevelUp(newLevel, borderName) {
    document.getElementById('levelup-text').textContent =
        `Você subiu para o Nível ${newLevel}! (${borderName})`;
    document.getElementById('modal-levelup').classList.add('active');
}

// ========== NOTIFICATIONS ==========
function showNotification(message) {
    // Simple alert for now, can be enhanced later
    alert(message);
}

// ========== UTILITIES ==========
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// ========== TESTING (DEV) ==========
function testAddCredits(amount) {
    Credits.addCredits(amount, 'test');
    refreshCredits();
    refreshUserCard();
    loadTransactions();
}

// ========== DELETE PROJECT ==========
async function deleteProjectConfirm(id) {
    const project = UserData.getProject(id);
    if (!project) return;

    if (confirm(`Tem certeza que deseja excluir "${project.name}"? Esta ação não pode ser desfeita.`)) {
        await UserData.deleteProject(id);
        loadProjects();
        showNotification('Projeto excluído com sucesso!');
    }
}

// ========== COPY PROJECT LINK ==========
function copyProjectLink(url) {
    if (!url) {
        showNotification('Link não disponível');
        return;
    }
    navigator.clipboard.writeText(url).then(() => {
        showNotification('✅ Link copiado!');
    }).catch(() => {
        showNotification('Erro ao copiar link');
    });
}

// ========== DEACTIVATE PROJECT ==========
async function deactivateProject(id) {
    const project = UserData.getProject(id);
    if (!project) return;

    // Create confirmation modal
    document.querySelector('.deactivate-modal-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.className = 'deactivate-modal-overlay';
    overlay.innerHTML = `
        <div class="publish-modal-backdrop"></div>
        <div class="publish-modal-content">
            <div class="publish-modal-header" style="background:linear-gradient(135deg,#e74c3c,#c0392b);">
                <h3><i class="fas fa-power-off"></i> Desativar Site</h3>
                <button class="publish-modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="publish-modal-body">
                <div class="publish-project-name">
                    <i class="fas fa-globe"></i> ${project.name || 'Meu Site'}
                </div>
                <div class="publish-warning" style="background:#fff3cd;border:1px solid #ffc107;margin-bottom:16px;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>
                        <strong>Atenção:</strong> O site ficará offline e não poderá mais ser acessado pela URL atual.
                        Você poderá republicá-lo depois.
                    </div>
                </div>
                <div class="publish-cost-box" style="border-color:#e74c3c;background:#fff5f5;">
                    <div class="publish-cost-row">
                        <span>URL atual</span>
                        <span style="font-size:12px;color:#636e72;">${project.publishedUrl || ''}</span>
                    </div>
                    <div class="publish-cost-row">
                        <span>Custo</span>
                        <span style="color:#00b894;font-weight:700;"><i class="fas fa-check-circle"></i> Gratuito</span>
                    </div>
                </div>
            </div>
            <div class="publish-modal-footer">
                <button class="publish-btn-cancel">Cancelar</button>
                <button class="publish-btn-confirm" style="background:linear-gradient(135deg,#e74c3c,#c0392b);">
                    <i class="fas fa-power-off"></i> Desativar
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    const closeModal = () => {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 200);
    };
    overlay.querySelector('.publish-modal-backdrop').addEventListener('click', closeModal);
    overlay.querySelector('.publish-modal-close').addEventListener('click', closeModal);
    overlay.querySelector('.publish-btn-cancel').addEventListener('click', closeModal);

    overlay.querySelector('.publish-btn-confirm').addEventListener('click', async () => {
        closeModal();

        // Unpublish locally
        UserData.unpublishProject(id);

        // Delete from Supabase hosting (if available)
        if (window.SupabaseClient?.isConfigured() && project.subdomain) {
            try {
                await SupabaseClient.unpublishSite(project.subdomain);
                console.log('✅ Site removed from hosting');
            } catch (e) {
                console.warn('⚠️ Failed to remove from hosting:', e.message);
            }
        }

        showNotification('✅ Site desativado com sucesso!');
        loadProjects();
    });
}

// ========== CHANGE SUBDOMAIN MODAL ==========
function showChangeSubdomainModal(projectId) {
    const project = UserData.getProject(projectId);
    if (!project) return;

    const URL_CHANGE_COST = 10;
    const currentCredits = Credits.getCredits();
    const hasEnough = currentCredits >= URL_CHANGE_COST;
    const currentSubdomain = project.subdomain || extractSubdomain(project.publishedUrl) || '';

    document.querySelector('.change-url-modal-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.className = 'change-url-modal-overlay publish-modal-overlay';
    overlay.innerHTML = `
        <div class="publish-modal-backdrop"></div>
        <div class="publish-modal-content">
            <div class="publish-modal-header" style="background:linear-gradient(135deg,#0984e3,#74b9ff);">
                <h3><i class="fas fa-link"></i> Alterar URL</h3>
                <button class="publish-modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="publish-modal-body">
                <div class="publish-project-name">
                    <i class="fas fa-globe"></i> ${project.name || 'Meu Site'}
                </div>

                <label class="publish-label">URL atual</label>
                <div class="publish-domain-input" style="margin-bottom:12px;opacity:0.6;">
                    <input type="text" value="${currentSubdomain}" readonly style="cursor:not-allowed;" />
                    <span class="publish-domain-suffix">.rafaeldemeni.com</span>
                </div>

                <label class="publish-label">Nova URL</label>
                <div class="publish-domain-input">
                    <input type="text" id="new-subdomain-input" value="" placeholder="nova-url" maxlength="30" />
                    <span class="publish-domain-suffix">.rafaeldemeni.com</span>
                </div>
                <p class="publish-domain-hint">Apenas letras minúsculas, números e hífens</p>

                <div class="publish-cost-box ${hasEnough ? 'has-credits' : 'no-credits'}">
                    <div class="publish-cost-row">
                        <span>Custo de alteração</span>
                        <span class="publish-cost-value"><i class="fas fa-coins"></i> ${URL_CHANGE_COST} créditos</span>
                    </div>
                    <div class="publish-cost-row">
                        <span>Seu saldo atual</span>
                        <span class="publish-balance-value">${currentCredits} créditos</span>
                    </div>
                    <hr>
                    <div class="publish-cost-row publish-cost-remaining">
                        <span>Saldo após alteração</span>
                        <span>${hasEnough ? (currentCredits - URL_CHANGE_COST) + ' créditos' : '<span style="color:#e74c3c">Insuficiente</span>'}</span>
                    </div>
                </div>

                ${!hasEnough ? `
                    <div class="publish-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        Você não tem créditos suficientes para alterar a URL.
                    </div>
                ` : ''}
            </div>
            <div class="publish-modal-footer">
                <button class="publish-btn-cancel">Cancelar</button>
                ${hasEnough
            ? `<button class="publish-btn-confirm" style="background:linear-gradient(135deg,#0984e3,#74b9ff);">
                        <i class="fas fa-link"></i> Alterar URL
                       </button>`
            : `<button class="publish-btn-buy" onclick="navigateTo('carteira')"><i class="fas fa-shopping-cart"></i> Comprar Créditos</button>`
        }
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    // Sanitize input
    const newSubdomainInput = overlay.querySelector('#new-subdomain-input');
    newSubdomainInput.addEventListener('input', () => {
        newSubdomainInput.value = newSubdomainInput.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    });
    newSubdomainInput.focus();

    const closeModal = () => {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 200);
    };
    overlay.querySelector('.publish-modal-backdrop').addEventListener('click', closeModal);
    overlay.querySelector('.publish-modal-close').addEventListener('click', closeModal);
    overlay.querySelector('.publish-btn-cancel').addEventListener('click', closeModal);

    const confirmBtn = overlay.querySelector('.publish-btn-confirm');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            const newSubdomain = newSubdomainInput.value.trim();
            if (!newSubdomain) {
                showNotification('⚠️ Digite a nova URL');
                newSubdomainInput.focus();
                return;
            }
            if (newSubdomain === currentSubdomain) {
                showNotification('⚠️ A nova URL é igual à atual');
                newSubdomainInput.focus();
                return;
            }

            closeModal();

            // Deduct credits
            const deductResult = Credits.deductCredits(URL_CHANGE_COST, 'url_change');
            if (!deductResult.success) {
                showNotification('❌ Erro ao deduzir créditos');
                return;
            }

            // Update project with new subdomain & URL
            const newUrl = `https://${newSubdomain}.rafaeldemeni.com`;
            UserData.updateProject(projectId, {
                subdomain: newSubdomain,
                publishedUrl: newUrl
            });

            // Re-deploy to new subdomain (if SupabaseClient available)
            if (window.SupabaseClient?.isConfigured()) {
                try {
                    // Delete old site
                    if (currentSubdomain) {
                        await SupabaseClient.unpublishSite(currentSubdomain);
                    }

                    // Deploy to new subdomain — use project.data (stored state) instead of d2State
                    // d2State is only available in the editor; from dashboard we use saved data
                    const state = project.data || null;
                    const pName = project.name || 'Meu Site';
                    const htmlContent = await generatePublishableHTML(state, pName);
                    if (htmlContent) {
                        const { error } = await SupabaseClient.publishSite(projectId, newSubdomain, htmlContent);
                        if (error) {
                            console.error('❌ [URL Change] Deploy error:', error);
                            showNotification('⚠️ URL alterada localmente mas falhou no deploy');
                        } else {
                            console.log('✅ [URL Change] Site redeployed to:', newUrl);
                        }
                    }
                } catch (e) {
                    console.error('❌ [URL Change] Exception:', e);
                }
            }

            showNotification(`✅ URL alterada para ${newSubdomain}.rafaeldemeni.com`);
            refreshCredits();
            loadProjects();
        });
    }
}

// Expose functions globally
window.editProject = editProject;
window.publishProject = publishProject;
window.showPublishModal = showPublishModal;
window.duplicateProject = duplicateProject;
window.copyProjectLink = copyProjectLink;
window.buyPackage = buyPackage;
window.buyPackageMP = buyPackageMP;
window.deleteProjectConfirm = deleteProjectConfirm;
window.deactivateProject = deactivateProject;
window.showChangeSubdomainModal = showChangeSubdomainModal;
window.closeBuyModal = closeBuyModal;
window.closeLevelUpModal = closeLevelUpModal;
window.testAddCredits = testAddCredits;

// ========== LOGIN FUNCTIONS ==========
function checkLogin() {
    if (!Auth.isLoggedIn()) {
        showLoginModal();
        return false;
    }

    // Sync user data
    const currentUser = Auth.getCurrentUser();
    if (currentUser) {
        UserData.updateUser(currentUser);
    }

    return true;
}

function showLoginModal() {
    document.getElementById('modal-login').classList.add('active');
}

function closeLoginModal() {
    // Só permite fechar o modal se o usuário estiver autenticado
    if (Auth.isLoggedIn()) {
        document.getElementById('modal-login').classList.remove('active');
    }
}

function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('login-error').style.display = 'none';
}

async function showForgotPassword() {
    const email = document.getElementById('login-email').value;

    if (!email) {
        alert('Digite seu email primeiro para recuperar a senha.');
        document.getElementById('login-email').focus();
        return;
    }

    try {
        if (SupabaseClient && SupabaseClient.getClient()) {
            const { error } = await SupabaseClient.getClient().auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/app.html'
            });

            if (error) {
                alert('Erro: ' + error.message);
            } else {
                alert('Email de recuperação enviado! Verifique sua caixa de entrada.');
            }
        } else {
            alert('Entre em contato com o suporte: (83) 99635-3619');
        }
    } catch (e) {
        alert('Erro ao enviar email. Entre em contato com o suporte.');
    }
}

async function doLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    const loginBtn = document.querySelector('#login-form .btn-primary');

    if (!email || !password) {
        errorEl.textContent = 'Preencha todos os campos';
        errorEl.style.display = 'block';
        return;
    }

    // Show loading state
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
    errorEl.style.display = 'none';

    try {
        const result = await Auth.login(email, password);

        if (result.success) {
            closeLoginModal();
            refreshUserCard();
            refreshCredits();
            loadProjects();
            loadTransactions();
        } else {
            errorEl.textContent = result.error;
            errorEl.style.display = 'block';
        }
    } catch (e) {
        errorEl.textContent = 'Erro de conexão';
        errorEl.style.display = 'block';
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
    }
}

async function doRegister() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const errorEl = document.getElementById('register-error');
    const registerBtn = document.querySelector('#register-form .btn-primary');

    if (!email || !password) {
        errorEl.textContent = 'Preencha todos os campos';
        errorEl.style.display = 'block';
        return;
    }

    // Show loading state
    registerBtn.disabled = true;
    registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';
    errorEl.style.display = 'none';

    try {
        const result = await Auth.register(email, password, name);

        if (result.success) {
            closeLoginModal();
            refreshUserCard();
            refreshCredits();
            loadProjects();

            // Show welcome notification
            if (result.message) {
                showNotification(result.message);
            }
        } else {
            errorEl.textContent = result.error;
            errorEl.style.display = 'block';
        }
    } catch (e) {
        errorEl.textContent = 'Erro de conexão';
        errorEl.style.display = 'block';
    } finally {
        registerBtn.disabled = false;
        registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> Criar Conta';
    }
}

function doLogout() {
    Auth.logout();
    window.location.reload();
}

// ========== SETTINGS DRAWER ==========
function openSettingsDrawer() {
    document.getElementById('settings-drawer')?.classList.add('open');
    document.getElementById('settings-drawer-backdrop')?.classList.add('active');
}

function closeSettingsDrawer() {
    document.getElementById('settings-drawer')?.classList.remove('open');
    document.getElementById('settings-drawer-backdrop')?.classList.remove('active');
}

// Keep legacy names for compatibility
window.openHamburgerMenu = openSettingsDrawer;
window.closeHamburgerMenu = closeSettingsDrawer;
window.openSettingsDrawer = openSettingsDrawer;
window.closeSettingsDrawer = closeSettingsDrawer;

// Hamburger button opens drawer
document.getElementById('btn-hamburger-menu')?.addEventListener('click', () => {
    openSettingsDrawer();
});

// Close on backdrop click
document.getElementById('settings-drawer-backdrop')?.addEventListener('click', () => {
    closeSettingsDrawer();
});

// Drawer item actions
document.querySelectorAll('.settings-item[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        closeSettingsDrawer();
        switch (action) {
            case 'edit-profile':
                openEditProfileModal();
                break;
            case 'my-level':
                // TODO: open level/achievements modal
                break;
            case 'logout':
                doLogout();
                break;
        }
    });
});

// ========== TEST LOGIN ==========
function testLogin() {
    // Login with test user: teste@demeni.com / 123456
    const result = Auth.login('teste@demeni.com', '123456');
    if (result.success) {
        console.log('✅ Logged in as test user with 100k credits');
        closeLoginModal();
        refreshUserCard();
        refreshCredits();
        loadProjects();
        loadTransactions();
    } else {
        console.log('❌ Login failed:', result.error);
    }
    return result;
}

// ========== EDIT PROFILE MODAL ==========
let _pendingAvatarDataUrl = null;

function openEditProfileModal() {
    const user = UserData.getUser();
    document.getElementById('edit-profile-name').value = user.name || '';
    document.getElementById('edit-profile-email').value = user.email || '';
    document.getElementById('edit-profile-phone').value = user.phone || '';
    _pendingAvatarDataUrl = null;

    // Avatar preview
    const avatarPreview = document.getElementById('edit-profile-avatar-preview');
    if (avatarPreview) {
        const avatarName = encodeURIComponent(user.name || 'User');
        avatarPreview.src = user.avatar || `https://ui-avatars.com/api/?name=${avatarName}&background=D4AF37&color=000&size=120`;
    }

    // Clear password fields
    const currentPw = document.getElementById('edit-profile-current-pw');
    const newPw = document.getElementById('edit-profile-new-pw');
    if (currentPw) currentPw.value = '';
    if (newPw) newPw.value = '';

    document.getElementById('edit-profile-success').style.display = 'none';
    document.getElementById('edit-profile-error').style.display = 'none';
    document.getElementById('modal-edit-profile').classList.add('active');
}

function closeEditProfileModal() {
    document.getElementById('modal-edit-profile').classList.remove('active');
}

async function saveProfile() {
    const name = document.getElementById('edit-profile-name').value.trim();
    const phone = document.getElementById('edit-profile-phone').value.trim();
    const currentPw = document.getElementById('edit-profile-current-pw')?.value || '';
    const newPw = document.getElementById('edit-profile-new-pw')?.value || '';
    const btn = document.getElementById('btn-save-profile');
    const successEl = document.getElementById('edit-profile-success');
    const errorEl = document.getElementById('edit-profile-error');

    if (!name) {
        errorEl.textContent = 'Nome é obrigatório';
        errorEl.style.display = 'block';
        return;
    }

    // Validate password if user wants to change it
    if (newPw && newPw.length < 6) {
        errorEl.textContent = 'Nova senha deve ter no mínimo 6 caracteres';
        errorEl.style.display = 'block';
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    errorEl.style.display = 'none';

    try {
        // Update profile data
        const updates = { name, phone };
        if (_pendingAvatarDataUrl) {
            updates.avatar = _pendingAvatarDataUrl;
        }
        await Auth.updateCurrentUser(updates);
        UserData.updateUser(updates);

        // Handle password change if both fields are filled
        if (currentPw && newPw) {
            if (Auth.isUsingSupabase() && window.SupabaseClient) {
                const { error } = await SupabaseClient.getClient()
                    .auth.updateUser({ password: newPw });
                if (error) throw new Error('Erro ao alterar senha: ' + error.message);
            }
        }

        // Refresh UI
        refreshUserCard();

        successEl.style.display = 'block';
        setTimeout(() => {
            closeEditProfileModal();
        }, 1200);
    } catch (e) {
        errorEl.textContent = e.message || 'Erro ao salvar';
        errorEl.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Salvar Alterações';
    }
}

// Handle avatar image upload — opens editor
let _avatarSourceImage = null;

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione uma imagem.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            _avatarSourceImage = img;

            // Reset sliders
            document.getElementById('avatar-pan-x').value = 0;
            document.getElementById('avatar-pan-y').value = 0;
            document.getElementById('avatar-zoom').value = 100;

            // Show editor, hide preview
            document.getElementById('avatar-display').style.display = 'none';
            document.getElementById('avatar-editor').style.display = 'block';

            updateAvatarCanvas();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    event.target.value = '';
}

function updateAvatarCanvas() {
    if (!_avatarSourceImage) return;

    const canvas = document.getElementById('avatar-canvas');
    const ctx = canvas.getContext('2d');
    const size = canvas.width; // 200

    const panX = parseInt(document.getElementById('avatar-pan-x').value);
    const panY = parseInt(document.getElementById('avatar-pan-y').value);
    const zoom = parseInt(document.getElementById('avatar-zoom').value) / 100;

    ctx.clearRect(0, 0, size, size);

    // Fill background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, size, size);

    const img = _avatarSourceImage;

    // Calculate dimensions to fit image within canvas with zoom
    const scale = Math.max(size / img.width, size / img.height) * zoom;
    const drawW = img.width * scale;
    const drawH = img.height * scale;

    // Center + pan offset (pan range -100 to 100 maps proportionally)
    const maxPanX = (drawW - size) / 2;
    const maxPanY = (drawH - size) / 2;
    const offsetX = (size - drawW) / 2 + (panX / 100) * maxPanX;
    const offsetY = (size - drawH) / 2 + (panY / 100) * maxPanY;

    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
}

function confirmAvatarEdit() {
    const canvas = document.getElementById('avatar-canvas');
    _pendingAvatarDataUrl = canvas.toDataURL('image/jpeg', 0.85);

    // Update preview
    document.getElementById('edit-profile-avatar-preview').src = _pendingAvatarDataUrl;

    // Hide editor, show preview
    document.getElementById('avatar-editor').style.display = 'none';
    document.getElementById('avatar-display').style.display = 'block';
}

function cancelAvatarEdit() {
    _avatarSourceImage = null;
    document.getElementById('avatar-editor').style.display = 'none';
    document.getElementById('avatar-display').style.display = 'block';
}

// Expose edit profile functions globally
window.openEditProfileModal = openEditProfileModal;
window.closeEditProfileModal = closeEditProfileModal;
window.saveProfile = saveProfile;
window.handleAvatarUpload = handleAvatarUpload;
window.updateAvatarCanvas = updateAvatarCanvas;
window.confirmAvatarEdit = confirmAvatarEdit;
window.cancelAvatarEdit = cancelAvatarEdit;

// Expose login functions
window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;
window.showLoginForm = showLoginForm;
window.showForgotPassword = showForgotPassword;
window.doLogin = doLogin;
window.doLogout = doLogout;
window.testLogin = testLogin;

// Check login on load (add small delay for modules to load)
setTimeout(() => {
    if (!Auth.isLoggedIn()) {
        showLoginModal();
    }
}, 100);

// ========== SUPPORT FORM ==========
function setupSupportForm() {
    const form = document.getElementById('supportForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const category = document.getElementById('supportCategory').value;
        const subject = document.getElementById('supportSubject').value.trim();
        const message = document.getElementById('supportMessage').value.trim();

        if (!category || !subject || !message) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        try {
            const user = UserData.getUser();
            let saved = false;

            // Try to save to Supabase if configured
            if (window.SupabaseClient && SupabaseClient.isConfigured()) {
                const client = SupabaseClient.getClient();
                const { error } = await client
                    .from('support_tickets')
                    .insert({
                        user_id: user.id,
                        user_email: user.email,
                        user_name: user.name || 'Franqueado',
                        category: category,
                        subject: subject,
                        message: message,
                        status: 'pending',
                        created_at: new Date().toISOString()
                    });

                if (!error) {
                    saved = true;
                } else {
                    console.error('Support ticket error:', error);
                }
            }

            // Fallback: send via WhatsApp if not saved
            if (!saved) {
                const whatsappMessage = encodeURIComponent(
                    `*Suporte Demeni Sites*\n\n` +
                    `📧 ${user.email}\n` +
                    `📂 ${category}\n` +
                    `📋 ${subject}\n\n` +
                    `${message}`
                );
                window.open(`https://wa.me/5583996353619?text=${whatsappMessage}`, '_blank');
            }

            // Show success
            form.style.display = 'none';
            document.getElementById('supportSuccess').style.display = 'block';

            // Reset form after 5 seconds
            setTimeout(() => {
                form.reset();
                form.style.display = 'block';
                document.getElementById('supportSuccess').style.display = 'none';
            }, 5000);

        } catch (err) {
            console.error('Support form error:', err);
            alert('Erro ao enviar. Tente novamente ou use o WhatsApp.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Solicitação';
        }
    });
}

// ========== AFFILIATES PAGE (Franqueado → Franqueado) ==========

// Initialize affiliates page when navigated to
function initAffiliatePage() {
    loadAffiliateStats();
}

// Load affiliate stats and referral link
async function loadAffiliateStats() {
    if (!window.Affiliates) return;

    try {
        const stats = await Affiliates.getMyStats();
        document.getElementById('aff-total-referrals').textContent = stats?.totalReferrals || 0;
        document.getElementById('aff-total-earned').textContent = stats?.totalEarned || 0;
        document.getElementById('aff-pending').textContent = stats?.pendingReferrals || 0;

        const link = await Affiliates.getReferralLink();
        const linkInput = document.getElementById('aff-referral-link');
        if (linkInput) {
            linkInput.value = link || 'Erro ao gerar link. Recarregue a página.';
        }

        // Load referrals list
        const referrals = await Affiliates.getMyReferrals();
        renderReferralsList(referrals);
    } catch (e) {
        console.error('Error loading affiliate stats:', e);
        const linkInput = document.getElementById('aff-referral-link');
        if (linkInput) linkInput.value = 'Erro ao carregar. Recarregue a página.';
    }
}

// Render referrals list
function renderReferralsList(referrals) {
    const container = document.getElementById('referrals-list');
    if (!container) return;

    if (!referrals || referrals.length === 0) {
        container.innerHTML = `
            <div class="empty-state small">
                <i class="fas fa-user-plus"></i>
                <p>Nenhuma indicação ainda. Compartilhe seu link!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = referrals.map(ref => {
        const statusClass = ref.status;
        const statusText = {
            pending: 'Pendente',
            converted: 'Convertido',
            paid: 'Pago'
        }[ref.status] || ref.status;

        const name = ref.referred_user?.name || ref.referred_email || 'Usuário';
        const initial = name.charAt(0).toUpperCase();
        const date = new Date(ref.created_at).toLocaleDateString('pt-BR');
        const tier = window.Affiliates?.getActiveTier?.() || { commission: 50 };

        return `
            <div class="referral-item">
                <div class="referral-user">
                    <div class="referral-avatar">${initial}</div>
                    <div class="referral-info">
                        <h5>${name}</h5>
                        <p>${date} · R$${tier.commission}</p>
                    </div>
                </div>
                <span class="referral-status ${statusClass}">${statusText}</span>
            </div>
        `;
    }).join('');
}

// Copy affiliate link
async function copyAffiliateLink() {
    const input = document.getElementById('aff-referral-link');
    const link = input?.value;

    if (link && link !== 'Carregando...') {
        try {
            await navigator.clipboard.writeText(link);
            showNotification('✅ Link copiado!');
        } catch (e) {
            // Fallback
            input.select();
            document.execCommand('copy');
            showNotification('✅ Link copiado!');
        }
    }
}

// navigateTo override removed — affiliates + editor-d2 init now in main navigateTo()

// ========== EDITOR D2 INITIALIZATION ==========
let editorD2Initialized = false;

async function initEditorD2() {
    console.log('[Editor D2] Initializing...');

    // Check if required modules are loaded - retry with delay if not
    if (!window.d2State || !window.D2Controls || !window.renderPreviewD2New) {
        console.log('[Editor D2] Waiting for modules to load...');
        setTimeout(initEditorD2, 100);
        return;
    }

    // Get container elements
    const sectionsList = document.getElementById('sections-list-d2');
    const editPanel = document.getElementById('edit-panel-d2');
    const previewFrame = document.getElementById('preview-frame-d2');

    if (!sectionsList || !editPanel || !previewFrame) {
        console.error('[Editor D2] Container elements not found');
        return;
    }

    // ====== PRELOAD CACHE FROM INDEXEDDB ======
    await UserData.preloadCache();

    // ====== LOAD SAVED PROJECT DATA ======
    const projectId = UserData.getCurrentProjectId();
    if (projectId) {
        const project = await UserData.getProjectAsync(projectId);
        if (project && project.data) {
            console.log('[Editor D2] Loading saved project data for:', projectId);
            window.d2State.loadState(project.data);
        } else {
            console.log('[Editor D2] No saved data found, using defaults');
        }

        // Carrega nome do projeto no input do header
        if (project) {
            const projectNameInput = document.getElementById('project-name-header');
            const savedName = project.name || project.data?.projectName || 'Novo Site';
            if (projectNameInput) {
                projectNameInput.value = savedName;
            }
            // Garante que o nome está no estado do editor
            if (window.d2State) {
                window.d2State.set('projectName', savedName);
            }
            console.log('[Editor D2] Project name loaded:', savedName);

            // Update header publish button state (Publicar vs Atualizar)
            updateHeaderPublishButton(projectId);
        }
    } else {
        console.log('[Editor D2] No current project, using defaults');
    }

    // Only initialize components once
    if (!editorD2Initialized) {
        // Initialize section list
        if (window.D2SectionList) {
            new window.D2SectionList(sectionsList);
            console.log('[Editor D2] Section list initialized');
        }

        // Initialize edit panel
        if (window.D2EditPanel) {
            new window.D2EditPanel(editPanel);
            console.log('[Editor D2] Edit panel initialized');
        }

        // Subscribe state changes to update preview
        window.d2State.subscribe(() => {
            renderD2Preview();
        });

        // Set up save button
        document.getElementById('btn-save-d2')?.addEventListener('click', saveD2Project);

        // Preview button - opens full preview in new tab
        document.getElementById('btn-preview-header')?.addEventListener('click', () => {
            const projectId = UserData.getCurrentProjectId();
            if (!projectId) {
                showNotification('⚠️ Salve o projeto primeiro');
                return;
            }
            // Auto-save before preview
            saveD2Project();
            // Open preview in new tab
            const project = UserData.getProject(projectId);
            if (project?.subdomain) {
                window.open(`https://${project.subdomain}.rafaeldemeni.com`, '_blank');
            } else {
                // Generate preview HTML and open in new tab
                const previewWin = window.open('', '_blank');
                if (previewWin) {
                    const frame = document.createElement('div');
                    window.renderPreviewD2New(frame, window.d2State.getState());
                    previewWin.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Preview - ${window.d2State.get('projectName', 'Novo Site')}</title><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"><style>body{margin:0;padding:0;background:#1a1a2e;display:flex;justify-content:center;min-height:100vh}.preview-wrapper{width:100%;max-width:480px;background:#fff;min-height:100vh;box-shadow:0 0 40px rgba(0,0,0,0.4)}</style></head><body><div class="preview-wrapper">${frame.innerHTML}</div></body></html>`);
                    previewWin.document.close();
                }
            }
        });

        // Publish button - shows confirmation modal
        document.getElementById('btn-publish-header')?.addEventListener('click', () => {
            const projectId = UserData.getCurrentProjectId();
            if (!projectId) {
                showNotification('⚠️ Nenhum projeto selecionado');
                return;
            }
            // Auto-save before showing modal
            saveD2Project();
            showPublishModal(projectId);
        });

        // 💾 SAVE BUTTON — save project + create checkpoint automatically
        document.getElementById('btn-save-header')?.addEventListener('click', async () => {
            const btn = document.getElementById('btn-save-header');
            const btnCheckpoint = document.getElementById('btn-checkpoint-header');
            const projectId = UserData.getCurrentProjectId();
            if (!projectId) {
                showNotification('⚠️ Nenhum projeto selecionado');
                return;
            }

            btn.classList.add('saving');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

            try {
                // 1. Gather current D2 state into the project
                saveD2Project();
                // 2. Flush to IndexedDB + cloud
                const ok = await UserData.explicitSave(projectId);
                // 3. Create checkpoint automatically
                await UserData.saveCheckpoint(projectId);
                // 4. Capture preview thumbnail (for dashboard card)
                if (window.ThumbnailCapture) {
                    ThumbnailCapture.capture(projectId).catch(e => {
                        console.warn('[Save] Thumbnail capture failed:', e.message);
                    });
                }

                if (ok) {
                    btn.innerHTML = '<i class="fas fa-check"></i> Salvo!';
                    btn.classList.remove('saving');
                    btn.classList.add('saved');
                    btnCheckpoint.disabled = false; // Enable restore
                    showNotification('💾 Projeto salvo + checkpoint criado!');
                    setTimeout(() => {
                        btn.innerHTML = '<i class="fas fa-save"></i> Salvar';
                        btn.classList.remove('saved');
                    }, 2000);
                } else {
                    throw new Error('Save failed');
                }
            } catch (e) {
                console.error('Save failed:', e);
                btn.innerHTML = '<i class="fas fa-save"></i> Salvar';
                btn.classList.remove('saving');
                showNotification('❌ Erro ao salvar. Tente novamente.');
            }
        });

        // ⏪ CHECKPOINT BUTTON — restore to last saved point
        document.getElementById('btn-checkpoint-header')?.addEventListener('click', async () => {
            const projectId = UserData.getCurrentProjectId();
            if (!projectId) return;

            const checkpoint = await UserData.loadCheckpoint(projectId);
            if (!checkpoint) {
                showNotification('⚠️ Nenhum checkpoint encontrado. Salve primeiro.');
                return;
            }

            const savedAt = new Date(checkpoint.savedAt).toLocaleTimeString('pt-BR');
            if (!confirm(`Voltar ao último ponto salvo (${savedAt})?\n\nAs alterações feitas depois serão perdidas.`)) {
                return;
            }

            const ok = await UserData.restoreCheckpoint(projectId);
            if (ok) {
                showNotification('⏪ Projeto restaurado ao último ponto salvo!');
                // Reload editor with restored data
                const project = await UserData.getProjectAsync(projectId);
                if (project?.data && window.d2State) {
                    window.d2State.setState(project.data);
                    renderD2Preview();
                }
            } else {
                showNotification('❌ Falha ao restaurar');
            }
        });

        // Check if checkpoint already exists on editor open
        (async () => {
            const projectId = UserData.getCurrentProjectId();
            if (projectId) {
                const cp = await UserData.hasCheckpoint(projectId);
                if (cp.exists) {
                    document.getElementById('btn-checkpoint-header').disabled = false;
                }
            }
        })();

        // Add section button
        document.getElementById('btn-add-section-d2')?.addEventListener('click', () => {
            if (window.D2AddSectionModal) {
                const modal = new window.D2AddSectionModal();
                modal.show();
            }
        });

        editorD2Initialized = true;
    }

    // Render preview (always, even if already initialized)
    renderD2Preview();
    console.log('[Editor D2] Initialization complete');
}

function renderD2Preview() {
    const previewFrame = document.getElementById('preview-frame-d2');
    if (previewFrame && window.renderPreviewD2New && window.d2State) {
        window.renderPreviewD2New(previewFrame, window.d2State.getState());
    }
}

function saveD2Project() {
    const projectId = UserData.getCurrentProject();
    if (!projectId) {
        showNotification('❌ Nenhum projeto selecionado');
        return;
    }

    // Get state from d2State and save to project
    const d2Data = {
        profile: window.d2State.get('profile'),
        d2Sections: window.d2State.get('d2Sections'),
        d2Adjustments: window.d2State.get('d2Adjustments'),
        d2Products: window.d2State.get('d2Products'),
        d2Feedbacks: window.d2State.get('d2Feedbacks'),
        d2Categorias: window.d2State.get('d2Categorias'),
        d2Banners: window.d2State.get('d2Banners')
    };

    UserData.updateProject(projectId, { data: d2Data });
    showNotification('✅ Projeto salvo!');
}

window.initEditorD2 = initEditorD2;
window.saveD2Project = saveD2Project;
window.renderD2Preview = renderD2Preview;

// ========== EDITOR D1 EMBEDDED ==========

/**
 * Initialize the D-1 embedded editor
 * Delegates to the complete implementation in editor-d1-embedded.js
 */
function initEditorD1() {
    // Check if the full D1 embedded module is loaded
    if (typeof initD1Embedded === 'function') {
        initD1Embedded();
    } else {
        console.error('[D1 Editor] editor-d1-embedded.js not loaded');
    }

    // Carrega nome do projeto no input do header
    const projectId = UserData.getCurrentProjectId();
    if (projectId) {
        const project = UserData.getProject(projectId);
        if (project) {
            const projectNameInput = document.getElementById('project-name-header');
            const savedName = project.name || project.data?.projectName || 'Novo Site';
            if (projectNameInput) {
                projectNameInput.value = savedName;
            }
            console.log('[D1 Editor] Project name loaded:', savedName);
        }
    }
}

window.initEditorD1 = initEditorD1;


// ========== NOTIFICATIONS ==========
async function loadNotifications() {
    if (!window.SupabaseClient || !SupabaseClient.isConfigured()) return;

    try {
        const user = Auth.getCurrentUser();
        if (!user?.id) return;

        const { data, error } = await SupabaseClient.getClient()
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.warn('Notifications table may not exist:', error.message);
            return;
        }

        const notifications = data || [];
        const unread = notifications.filter(n => !n.read).length;

        // Update badges
        updateNotifBadges(unread);

        // Render notification list
        renderNotifications(notifications);
    } catch (e) {
        console.warn('Error loading notifications:', e);
    }
}

function updateNotifBadges(count) {
    const sidebarBadge = document.getElementById('notif-badge-menu');
    const avatarBadge = document.getElementById('notif-badge-avatar');

    if (sidebarBadge) {
        sidebarBadge.textContent = count;
        sidebarBadge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
    if (avatarBadge) {
        avatarBadge.textContent = count > 9 ? '9+' : count;
        avatarBadge.style.display = count > 0 ? 'flex' : 'none';
    }
}

function renderNotifications(notifications) {
    const container = document.getElementById('notifications-list');
    const emptyState = document.getElementById('notif-empty');
    if (!container) return;

    if (notifications.length === 0) {
        if (emptyState) emptyState.style.display = '';
        return;
    }
    if (emptyState) emptyState.style.display = 'none';

    const typeIcons = {
        credits: 'fas fa-coins',
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-triangle',
        success: 'fas fa-check-circle'
    };
    const typeColors = {
        credits: '#f59e0b',
        info: '#3b82f6',
        warning: '#ef4444',
        success: '#22c55e'
    };

    let html = '';
    for (const n of notifications) {
        const icon = typeIcons[n.type] || typeIcons.info;
        const color = typeColors[n.type] || typeColors.info;
        const timeAgo = getTimeAgo(n.created_at);
        const readStyle = n.read ? 'opacity: 0.6;' : 'border-left: 3px solid ' + color + ';';

        html += `
            <div class="notif-card" data-id="${n.id}" style="background: var(--bg-card, #1a1a2e); border-radius: 10px; padding: 14px 16px; margin-bottom: 8px; cursor: pointer; ${readStyle} transition: opacity 0.3s;" onclick="markNotifRead('${n.id}')">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                    <i class="${icon}" style="color: ${color}; font-size: 1.1rem; margin-top: 2px;"></i>
                    <div style="flex: 1;">
                        <strong style="font-size: 0.85rem; color: var(--text-primary, #fff);">${n.title}</strong>
                        <p style="font-size: 0.8rem; color: var(--text-muted, #aaa); margin: 4px 0 0;">${n.message}</p>
                        <span style="font-size: 0.7rem; color: var(--text-muted, #666);">${timeAgo}</span>
                    </div>
                    ${!n.read ? '<span style="width: 8px; height: 8px; background: ' + color + '; border-radius: 50; flex-shrink: 0; margin-top: 6px;"></span>' : ''}
                </div>
            </div>`;
    }

    container.innerHTML = html;
}

function getTimeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`;
    return date.toLocaleDateString('pt-BR');
}

async function markNotifRead(notifId) {
    const card = document.querySelector(`.notif-card[data-id="${notifId}"]`);
    if (card) {
        card.style.opacity = '0.6';
        card.style.borderLeft = 'none';
    }

    try {
        if (SupabaseClient?.isConfigured()) {
            await SupabaseClient.getClient()
                .from('notifications')
                .update({ read: true })
                .eq('id', notifId);
        }
        loadNotifications();
    } catch (e) { console.warn('Error marking notification:', e); }
}

async function markAllNotifsRead() {
    try {
        const user = Auth.getCurrentUser();
        if (!user?.id || !SupabaseClient?.isConfigured()) return;
        await SupabaseClient.getClient()
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false);
        loadNotifications();
    } catch (e) { console.warn('Error:', e); }
}

window.markNotifRead = markNotifRead;
window.markAllNotifsRead = markAllNotifsRead;

