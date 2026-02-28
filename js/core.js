/* ===========================
   DEMENI CORE — AGENCY ROUTER
   Role-based navigation + page management
   =========================== */

const Core = (function () {
    // ========== ROLE MENU CONFIG ==========
    const ROLE_MENUS = {
        admin: [
            {
                section: 'Principal', items: [
                    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
                    { id: 'pipeline', icon: 'fa-columns', label: 'Pipeline' },
                ]
            },
            {
                section: 'Vendas', items: [
                    { id: 'orders', icon: 'fa-file-invoice', label: 'Pedidos' },
                    { id: 'goals', icon: 'fa-bullseye', label: 'Metas' },
                ]
            },
            {
                section: 'Produção', items: [
                    { id: 'queue', icon: 'fa-paint-brush', label: 'Fila de Produção' },
                    { id: 'criar-site', icon: 'fa-magic', label: 'Criar Site', href: 'app.html' },
                ]
            },
            {
                section: 'Suporte', items: [
                    { id: 'clients', icon: 'fa-headset', label: 'Clientes' },
                ]
            },
            {
                section: 'Marketing', items: [
                    { id: 'calendar', icon: 'fa-calendar-alt', label: 'Calendário' },
                    { id: 'metrics', icon: 'fa-chart-line', label: 'Métricas' },
                ]
            },
            {
                section: 'Gestão', items: [
                    { id: 'team', icon: 'fa-users', label: 'Equipe' },
                    { id: 'financial', icon: 'fa-wallet', label: 'Financeiro' },
                    { id: 'settings', icon: 'fa-cog', label: 'Configurações' },
                ]
            },
        ],
        gestora: [
            {
                section: 'Principal', items: [
                    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
                    { id: 'pipeline', icon: 'fa-columns', label: 'Pipeline' },
                ]
            },
            {
                section: 'Gestão', items: [
                    { id: 'team', icon: 'fa-users', label: 'Equipe' },
                    { id: 'financial', icon: 'fa-wallet', label: 'Financeiro' },
                    { id: 'metrics', icon: 'fa-chart-line', label: 'Métricas' },
                    { id: 'clients', icon: 'fa-headset', label: 'Clientes' },
                ]
            },
        ],
        vendedor: [
            {
                section: 'Principal', items: [
                    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
                    { id: 'orders', icon: 'fa-file-invoice', label: 'Pedidos' },
                    { id: 'pipeline', icon: 'fa-columns', label: 'Pipeline' },
                    { id: 'goals', icon: 'fa-bullseye', label: 'Minhas Metas' },
                    { id: 'settings', icon: 'fa-cog', label: 'Configurações' },
                ]
            },
        ],
        criadora: [
            {
                section: 'Produção', items: [
                    { id: 'queue', icon: 'fa-paint-brush', label: 'Minha Fila' },
                    { id: 'pipeline', icon: 'fa-columns', label: 'Pipeline' },
                    { id: 'metrics', icon: 'fa-chart-line', label: 'Meu Histórico' },
                    { id: 'criar-site', icon: 'fa-magic', label: 'Criar Site', href: 'app.html' },
                    { id: 'settings', icon: 'fa-cog', label: 'Configurações' },
                ]
            },
        ],
        suporte: [
            {
                section: 'Atendimento', items: [
                    { id: 'clients', icon: 'fa-headset', label: 'Clientes Ativos' },
                    { id: 'pipeline', icon: 'fa-columns', label: 'Pipeline' },
                    { id: 'leads', icon: 'fa-user-plus', label: 'Leads' },
                    { id: 'goals', icon: 'fa-bullseye', label: 'Minhas Metas' },
                    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Visão Geral' },
                    { id: 'settings', icon: 'fa-cog', label: 'Configurações' },
                ]
            },
        ],
        social_media: [
            {
                section: 'Marketing', items: [
                    { id: 'calendar', icon: 'fa-calendar-alt', label: 'Calendário' },
                    { id: 'metrics', icon: 'fa-chart-line', label: 'Métricas' },
                    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Visão Geral' },
                    { id: 'settings', icon: 'fa-cog', label: 'Configurações' },
                ]
            },
        ],
    };

    // ========== PAGE TITLES ==========
    const PAGE_TITLES = {
        dashboard: 'Dashboard',
        pipeline: 'Pipeline de Pedidos',
        leads: 'Pedidos',
        orders: 'Pedidos',
        queue: 'Fila de Produção',
        clients: 'Clientes Ativos',
        calendar: 'Calendário de Conteúdo',
        team: 'Equipe',
        metrics: 'Métricas',
        goals: 'Metas',
        financial: 'Financeiro',
        settings: 'Configurações',
    };

    // ========== KANBAN COLUMNS ==========
    const KANBAN_COLUMNS = [
        { id: 'lead', label: 'Lead', color: '#6b7280' },
        { id: 'negotiation', label: 'Negociação', color: '#3b82f6' },
        { id: 'briefing', label: 'Briefing', color: '#06b6d4' },
        { id: 'production', label: 'Produção', color: '#f97316' },
        { id: 'review', label: 'Revisão', color: '#eab308' },
        { id: 'completed', label: 'Concluído', color: '#10b981' },
    ];

    // ========== ROLE LABELS ==========
    const ROLE_LABELS = {
        admin: 'Administrador',
        vendedor: 'Vendedor',
        social_media: 'Social Media',
        criadora: 'Criadora',
        suporte: 'Suporte',
        gestora: 'Gestora',
    };

    let currentUser = null;
    let currentRole = 'admin';
    let currentPage = 'dashboard';
    let orders = [];

    // ========== INIT ==========
    async function init() {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocal) console.log('[Core] 🔧 Running locally');

        // Check if user is already logged in
        const session = Auth.getSession();
        if (session && Auth.isLoggedIn()) {
            await onLoginSuccess();
        } else {
            // No session — show login page
            document.getElementById('login-page').style.display = 'flex';
        }

        // Bind events
        bindEvents();
    }

    function bindEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }

        // Logout
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.addEventListener('click', handleLogout);
        }

        // Mobile menu toggle
        const btnToggle = document.getElementById('btn-menu-toggle');
        if (btnToggle) {
            btnToggle.addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('open');
            });
        }

        // New order
        const btnNewOrder = document.getElementById('btn-new-order');
        if (btnNewOrder) {
            btnNewOrder.addEventListener('click', () => openModal('modal-new-order'));
        }

        // Save order
        const btnSaveOrder = document.getElementById('btn-save-order');
        if (btnSaveOrder) {
            btnSaveOrder.addEventListener('click', handleNewOrder);
        }

        // Close sidebar on content click (mobile)
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar.classList.contains('open') && !sidebar.contains(e.target) &&
                e.target.id !== 'btn-menu-toggle') {
                sidebar.classList.remove('open');
            }
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+K = Search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                openSearch();
            }
            // Ctrl+N = New order
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                openModal('modal-new-order');
            }
            // Escape = close search
            if (e.key === 'Escape') {
                const search = document.getElementById('modal-global-search');
                if (search) search.remove();
            }
        });
    }

    // ========== AUTH ==========
    async function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');
        const btn = document.getElementById('btn-login');

        errorEl.style.display = 'none';
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';

        try {
            const result = await Auth.login(email, password);
            if (result.error) throw new Error(result.error);
            await onLoginSuccess();
        } catch (err) {
            errorEl.textContent = err.message || 'Email ou senha incorretos';
            errorEl.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
        }
    }

    async function onLoginSuccess() {
        currentUser = Auth.getCurrentUser();
        if (!currentUser) return;

        // Get role from profile (Supabase)
        currentRole = await fetchUserRole() || 'criadora';

        // Show app shell
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('app-shell').style.display = 'flex';

        // Update UI
        updateUserInfo();
        buildSidebar();
        navigate(getDefaultPage());
        initKanban();
        loadOrders();
    }

    async function fetchUserRole() {
        try {
            if (typeof SupabaseClient !== 'undefined' && SupabaseClient.getClient()) {
                const supabase = SupabaseClient.getClient();
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role, is_admin')
                    .eq('id', currentUser.id)
                    .single();

                if (!error && data) {
                    // Fallback: if role column doesn't exist yet, use is_admin
                    if (data.role) return data.role;
                    if (data.is_admin) return 'admin';
                }
            }
        } catch (e) {
            console.warn('[Core] Could not fetch role, defaulting:', e.message);
        }
        return 'admin'; // Default to admin for Rafael (solo mode)
    }

    async function handleLogout() {
        await Auth.logout();
        currentUser = null;
        currentRole = 'admin';
        document.getElementById('app-shell').style.display = 'none';
        document.getElementById('login-page').style.display = 'flex';
        document.getElementById('login-form').reset();
    }

    // ========== SIDEBAR ==========
    function buildSidebar() {
        const nav = document.getElementById('sidebar-nav');
        const menus = ROLE_MENUS[currentRole] || ROLE_MENUS.criadora;

        nav.innerHTML = menus.map(section => `
            <div class="nav-section">
                <div class="nav-section-title">${section.section}</div>
                ${section.items.map(item => item.href
            ? `<a class="nav-item" href="${item.href}" target="_blank" style="text-decoration:none;color:inherit;display:flex;align-items:center;gap:10px;">
                        <i class="fas ${item.icon}"></i>
                        <span>${item.label}</span>
                        <i class="fas fa-external-link-alt" style="margin-left:auto;font-size:9px;opacity:0.4;"></i>
                    </a>`
            : `<button class="nav-item" data-page="${item.id}" onclick="Core.navigate('${item.id}')">
                        <i class="fas ${item.icon}"></i>
                        <span>${item.label}</span>
                    </button>`
        ).join('')}
            </div>
        `).join('');

        // Highlight current page
        updateActiveNav();
    }

    function updateActiveNav() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === currentPage);
        });
    }

    function updateUserInfo() {
        if (!currentUser) return;

        const name = currentUser.name || currentUser.email?.split('@')[0] || 'Usuário';
        const initial = name.charAt(0).toUpperCase();

        document.getElementById('user-name').textContent = name;
        document.getElementById('user-avatar').textContent = initial;

        const roleEl = document.getElementById('user-role');
        roleEl.textContent = ROLE_LABELS[currentRole] || currentRole;
        roleEl.dataset.role = currentRole;
    }

    // ========== GLOBAL SEARCH (Ctrl+K) ==========
    function openSearch() {
        const existing = document.getElementById('modal-global-search');
        if (existing) { existing.remove(); return; }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'modal-global-search';
        modal.style.cssText = 'z-index:9999;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);';
        modal.innerHTML = `
            <div style="background:var(--bg-card);border-radius:16px;max-width:560px;width:90%;margin:80px auto;
                box-shadow:0 25px 60px rgba(0,0,0,0.4);border:1px solid var(--border-card);overflow:hidden;">
                <div style="padding:16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border-card);">
                    <i class="fas fa-search" style="color:var(--brand-light);font-size:18px;"></i>
                    <input type="text" id="global-search-input" placeholder="Pesquisar pedidos, clientes, leads..."
                        style="flex:1;background:transparent;border:none;outline:none;font-size:16px;color:var(--text-primary);font-family:inherit;"
                        autocomplete="off">
                    <kbd style="font-size:10px;background:var(--bg-sidebar);padding:3px 8px;border-radius:4px;color:var(--text-muted);border:1px solid var(--border-card);">ESC</kbd>
                </div>
                <div id="global-search-results" style="max-height:380px;overflow-y:auto;padding:8px;"></div>
                <div style="padding:8px 16px;font-size:11px;color:var(--text-muted);border-top:1px solid var(--border-card);display:flex;gap:16px;">
                    <span><kbd style="font-size:9px;background:var(--bg-sidebar);padding:2px 5px;border-radius:3px;">↵</kbd> abrir</span>
                    <span><kbd style="font-size:9px;background:var(--bg-sidebar);padding:2px 5px;border-radius:3px;">Ctrl+K</kbd> buscar</span>
                    <span><kbd style="font-size:9px;background:var(--bg-sidebar);padding:2px 5px;border-radius:3px;">Ctrl+N</kbd> novo pedido</span>
                </div>
            </div>
        `;
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        document.body.appendChild(modal);

        const input = document.getElementById('global-search-input');
        input.focus();

        // Live search
        input.addEventListener('input', () => {
            const q = input.value.toLowerCase().trim();
            const results = document.getElementById('global-search-results');

            if (q.length < 2) {
                results.innerHTML = `<div style="padding:32px;text-align:center;color:var(--text-muted);font-size:13px;">
                    <i class="fas fa-search" style="font-size:24px;opacity:0.3;display:block;margin-bottom:8px;"></i>
                    Digite pelo menos 2 caracteres
                </div>`;
                return;
            }

            const matches = orders.filter(o =>
                (o.client_name || '').toLowerCase().includes(q) ||
                (o.client_phone || '').includes(q) ||
                (o.client_instagram || '').toLowerCase().includes(q) ||
                (o.product_type || '').toLowerCase().includes(q) ||
                (o.status || '').toLowerCase().includes(q) ||
                (o.source || '').toLowerCase().includes(q) ||
                (o.notes || '').toLowerCase().includes(q)
            ).slice(0, 8);

            if (matches.length === 0) {
                results.innerHTML = `<div style="padding:32px;text-align:center;color:var(--text-muted);font-size:13px;">
                    Nenhum resultado para "<strong>${q}</strong>"
                </div>`;
                return;
            }

            results.innerHTML = matches.map(o => `
                <div onclick="document.getElementById('modal-global-search').remove(); Core.openOrderDetail('${o.id}');"
                    style="padding:12px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;
                    transition:background 0.15s;" onmouseover="this.style.background='var(--bg-sidebar)'" onmouseout="this.style.background='transparent'">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:36px;height:36px;border-radius:8px;background:var(--brand-gradient);
                            display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;">
                            ${(o.client_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style="font-weight:600;font-size:13px;">${o.client_name}</div>
                            <div style="font-size:11px;color:var(--text-muted);">
                                ${(o.product_type || '').toUpperCase()} · ${o.client_phone || ''}
                            </div>
                        </div>
                    </div>
                    <span class="status-badge ${o.status}" style="font-size:10px;">${getStatusLabel(o.status)}</span>
                </div>
            `).join('');
        });

        // Enter to open first result
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const first = document.querySelector('#global-search-results > div[onclick]');
                if (first) first.click();
            }
        });
    }

    // ========== NAVIGATION ==========
    function navigate(pageId) {
        if (!PAGE_TITLES[pageId]) return;

        currentPage = pageId;

        // Hide all pages, show target
        document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(`page-${pageId}`);
        if (target) target.classList.add('active');

        // Update header
        document.getElementById('page-title').textContent = PAGE_TITLES[pageId];

        // Update nav
        updateActiveNav();

        // Close mobile sidebar
        document.getElementById('sidebar').classList.remove('open');

        // Show/hide "New Order" button based on page
        const btnNew = document.getElementById('btn-new-order');
        if (btnNew) {
            const showNew = ['dashboard', 'pipeline', 'leads'].includes(pageId) &&
                ['admin', 'vendedor', 'gestora'].includes(currentRole);
            btnNew.style.display = showNew ? 'flex' : 'none';
        }

        // Show sort toggle only on pipeline
        const btnSort = document.getElementById('btn-kanban-sort');
        if (btnSort) btnSort.style.display = pageId === 'pipeline' ? 'flex' : 'none';

        // Show PDF report button only on financial
        const btnPdf = document.getElementById('btn-pdf-report');
        if (btnPdf) btnPdf.style.display = pageId === 'financial' ? 'flex' : 'none';
    }

    function getDefaultPage() {
        switch (currentRole) {
            case 'admin':
            case 'gestora':
                return 'dashboard';
            case 'vendedor':
                return 'leads';
            case 'criadora':
                return 'queue';
            case 'suporte':
                return 'clients';
            case 'social_media':
                return 'calendar';
            default:
                return 'dashboard';
        }
    }

    // ========== KANBAN ==========
    let kanbanSortMode = 'manual'; // 'manual' or 'deadline'

    function toggleKanbanSort() {
        kanbanSortMode = kanbanSortMode === 'manual' ? 'deadline' : 'manual';
        const btn = document.getElementById('btn-kanban-sort');
        if (btn) {
            btn.innerHTML = kanbanSortMode === 'manual'
                ? '<i class="fas fa-hand-pointer"></i> Manual'
                : '<i class="fas fa-calendar-alt"></i> Prazo';
        }
        renderKanbanCards();
        toast(kanbanSortMode === 'manual' ? 'Ordenação manual' : 'Ordenação por prazo', 'info');
    }

    function initKanban() {
        const board = document.getElementById('kanban-board');
        if (!board) return;

        board.innerHTML = KANBAN_COLUMNS.map(col => `
            <div class="kanban-column" data-status="${col.id}">
                <div class="kanban-column-header">
                    <span class="kanban-column-title">
                        <span class="dot" style="background:${col.color}"></span>
                        ${col.label}
                    </span>
                    <span class="kanban-count" data-count="${col.id}">0</span>
                </div>
                <div class="kanban-cards" data-status="${col.id}"
                     ondragover="Core.handleDragOver(event)"
                     ondrop="Core.handleDrop(event, '${col.id}')">
                </div>
            </div>
        `).join('');
    }

    function renderKanbanCards() {
        // Clear all columns
        KANBAN_COLUMNS.forEach(col => {
            const container = document.querySelector(`.kanban-cards[data-status="${col.id}"]`);
            if (container) container.innerHTML = '';
        });

        // Place cards sorted by current mode
        let sorted;
        if (kanbanSortMode === 'deadline') {
            sorted = [...orders].sort((a, b) => {
                const getDeadline = (o) => {
                    if (o.deadline) return new Date(o.deadline).getTime();
                    const d = new Date(o.created_at); d.setDate(d.getDate() + 7);
                    return d.getTime();
                };
                return getDeadline(a) - getDeadline(b);
            });
        } else {
            sorted = [...orders].sort((a, b) => (a.sort_order || 9999) - (b.sort_order || 9999));
        }
        sorted.forEach(order => {
            const container = document.querySelector(`.kanban-cards[data-status="${order.status}"]`);
            if (!container) return;

            const card = document.createElement('div');
            card.className = 'kanban-card';
            card.draggable = true;
            card.dataset.orderId = order.id;
            card.ondragstart = (e) => handleDragStart(e, order.id);
            card.ondragend = (e) => handleDragEnd(e);
            card.onclick = () => openOrderDetail(order.id);
            card.style.cursor = 'pointer';

            // Deadline display (default 7 days from creation if not set)
            let deadlineDate;
            if (order.deadline) {
                deadlineDate = new Date(order.deadline);
            } else {
                deadlineDate = new Date(order.created_at);
                deadlineDate.setDate(deadlineDate.getDate() + 7);
            }
            const now = new Date();
            const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
            const dlColor = diffDays < 0 ? '#ef4444' : diffDays <= 3 ? '#eab308' : '#10b981';
            const dlIcon = diffDays < 0 ? 'fa-exclamation-triangle' : 'fa-calendar-check';
            const dateHTML = `<div class="kanban-card-meta" style="color:${dlColor};"><i class="fas ${dlIcon}"></i> ${formatDate(deadlineDate.toISOString())}</div>`;

            // Thumbnail + badges
            const imgs = (order.attachments || []).filter(a => a.type === 'image');
            const links = (order.attachments || []).filter(a => a.type === 'link');
            const attachCount = (order.attachments || []).length;
            const thumbHTML = imgs.length > 0 ? `<img class="kanban-card-thumb" src="${imgs[0].url}" alt="">` : '';
            const checkPct = getChecklistProgress(order);

            card.innerHTML = `
                ${thumbHTML}
                <div class="kanban-card-title">${order.client_name}</div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                    <span class="kanban-card-product">${order.product_type?.toUpperCase() || 'D-2'}</span>
                    ${order.price ? `<span style="font-size:12px;color:var(--text-muted);">R$ ${parseFloat(order.price).toFixed(0)}</span>` : ''}
                </div>
                ${dateHTML}
                <div class="kanban-card-badges">
                    ${attachCount > 0 ? `<span><i class="fas fa-paperclip"></i>${attachCount}</span>` : ''}
                    ${links.length > 0 ? `<span><i class="fas fa-link"></i>${links.length}</span>` : ''}
                    ${checkPct > 0 ? `<span class="badge-check"><i class="fas fa-check-circle"></i>${checkPct}%</span>` : ''}
                </div>
                ${checkPct > 0 ? `<div class="checklist-progress"><div class="checklist-progress-bar" style="width:${checkPct}%"></div></div>` : ''}
            `;

            container.appendChild(card);
        });

        // Update counts
        KANBAN_COLUMNS.forEach(col => {
            const count = orders.filter(o => o.status === col.id).length;
            const el = document.querySelector(`[data-count="${col.id}"]`);
            if (el) el.textContent = count;
        });
    }

    // ========== DRAG & DROP ==========
    let draggedOrderId = null;

    function handleDragStart(e, orderId) {
        draggedOrderId = orderId;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
        document.querySelectorAll('.kanban-drop-indicator').forEach(el => el.remove());
        if (draggedOrderId) {
            // Dropped outside a column — reset
            draggedOrderId = null;
            renderKanbanCards();
            toast('Mova para dentro de alguma coluna', 'info');
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // Show drop indicator between cards
        const container = e.target.closest('.kanban-cards');
        if (!container) return;
        // Remove old indicators
        document.querySelectorAll('.kanban-drop-indicator').forEach(el => el.remove());

        const cards = [...container.querySelectorAll('.kanban-card:not(.dragging)')];
        const indicator = document.createElement('div');
        indicator.className = 'kanban-drop-indicator';
        indicator.style.cssText = 'height:3px;background:var(--brand-primary);border-radius:2px;margin:4px 0;transition:opacity 0.15s;';

        let insertBefore = null;
        for (const card of cards) {
            const rect = card.getBoundingClientRect();
            if (e.clientY < rect.top + rect.height / 2) {
                insertBefore = card;
                break;
            }
        }
        if (insertBefore) {
            container.insertBefore(indicator, insertBefore);
        } else {
            container.appendChild(indicator);
        }
    }

    async function handleDrop(e, newStatus) {
        e.preventDefault();
        if (!draggedOrderId) return;
        const movedId = draggedOrderId;
        draggedOrderId = null;

        // Remove indicators and dragging class
        document.querySelectorAll('.kanban-drop-indicator').forEach(el => el.remove());
        document.querySelectorAll('.kanban-card.dragging').forEach(c => c.classList.remove('dragging'));

        // Calculate sort position from mouse Y
        const container = e.target.closest('.kanban-cards');
        let newSortOrder = 0;
        if (container) {
            const cards = [...container.querySelectorAll('.kanban-card')];
            const cardIds = cards.map(c => c.dataset.orderId).filter(id => id !== movedId);
            let insertIdx = cardIds.length; // default: end
            for (let i = 0; i < cards.length; i++) {
                if (cards[i].dataset.orderId === movedId) continue;
                const rect = cards[i].getBoundingClientRect();
                if (e.clientY < rect.top + rect.height / 2) {
                    insertIdx = cardIds.indexOf(cards[i].dataset.orderId);
                    break;
                }
            }
            // Reassign sort_order for all cards in the target column
            const columnOrders = orders.filter(o => o.status === newStatus && o.id !== movedId)
                .sort((a, b) => (a.sort_order || 9999) - (b.sort_order || 9999));
            columnOrders.splice(insertIdx, 0, { id: movedId }); // placeholder
            columnOrders.forEach((o, i) => {
                const real = orders.find(r => r.id === o.id);
                if (real) real.sort_order = i;
            });
        }

        // Update order
        const order = orders.find(o => o.id === movedId);
        if (order) {
            const prevStatus = order.status;
            order.status = newStatus;
            order.updated_at = new Date().toISOString();

            if (newStatus === 'completed') order.completed_at = new Date().toISOString();

            // Log activity
            if (prevStatus !== newStatus) {
                if (!order.activity_log) order.activity_log = [];
                order.activity_log.push({
                    from: prevStatus,
                    to: newStatus,
                    at: new Date().toISOString(),
                    by: currentUser?.name || 'Sistema'
                });
            }
        }
        saveOrdersLocal();
        if (order) saveToSheet(order, 'status_' + newStatus);

        // Update Supabase
        try {
            if (typeof SupabaseClient !== 'undefined' && SupabaseClient.getClient()) {
                await SupabaseClient.getClient()
                    .from('orders')
                    .update({
                        status: newStatus,
                        updated_at: new Date().toISOString(),
                        completed_at: order?.completed_at,
                    })
                    .eq('id', movedId);
            }
        } catch (err) {
            console.error('[Core] Error updating order:', err);
        }

        renderAll();
        toast('Pedido movido!', 'success');

        // Auto-prompt payment when entering Briefing (1st payment)
        if (order && newStatus === 'briefing') {
            setTimeout(() => openPaymentModal(movedId), 400);
        }
    }

    // ========== ORDERS ==========
    async function loadOrders() {
        try {
            if (typeof SupabaseClient !== 'undefined' && SupabaseClient.getClient()) {
                const supabase = SupabaseClient.getClient();
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    orders = data;
                }
            }
        } catch (e) {
            console.warn('[Core] Could not load orders:', e.message);
        }

        // Also check localStorage fallback
        if (orders.length === 0) {
            orders = JSON.parse(localStorage.getItem('demeni-orders') || '[]');
        }

        renderAll();
    }

    async function handleNewOrder() {
        const clientName = document.getElementById('order-client-name').value.trim();
        const clientPhone = document.getElementById('order-client-phone').value.trim();
        const clientEmail = document.getElementById('order-client-email')?.value.trim() || '';
        const clientInstagram = document.getElementById('order-client-instagram').value.trim();
        const clientCity = document.getElementById('order-client-city')?.value.trim() || '';
        const productType = document.getElementById('order-product').value;
        const price = parseFloat(document.getElementById('order-price').value) || 0;
        const source = document.getElementById('order-source').value;
        const notes = document.getElementById('order-notes').value.trim();

        if (!clientName) return toast('Nome do cliente é obrigatório', 'error');
        if (!productType) return toast('Selecione o produto', 'error');

        const order = {
            id: crypto.randomUUID(),
            tracking_token: crypto.randomUUID().replace(/-/g, '').substring(0, 16),
            client_name: clientName,
            client_phone: clientPhone,
            client_email: clientEmail,
            client_instagram: clientInstagram,
            client_city: clientCity,
            product_type: productType,
            price: price,
            source: source,
            status: 'lead',
            notes: notes,
            briefing: {
                business_type: document.getElementById('order-business-type')?.value.trim() || '',
                color1: document.getElementById('order-color1')?.value || '',
                color2: document.getElementById('order-color2')?.value || '',
                colors_text: document.getElementById('order-colors-text')?.value.trim() || '',
                slogan: document.getElementById('order-slogan')?.value.trim() || '',
                about: document.getElementById('order-about')?.value.trim() || '',
                services: document.getElementById('order-services')?.value.trim() || '',
                references: document.getElementById('order-references')?.value.trim() || '',
            },
            vendedor_id: currentUser?.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        // Save to Supabase
        try {
            if (typeof SupabaseClient !== 'undefined' && SupabaseClient.getClient()) {
                const { data, error } = await SupabaseClient.getClient()
                    .from('orders')
                    .insert(order)
                    .select()
                    .single();

                if (!error && data) {
                    order.id = data.id;
                    order.tracking_token = data.tracking_token;
                }
            }
        } catch (e) {
            console.warn('[Core] Supabase insert failed, saving locally:', e.message);
        }

        // Save locally as fallback
        orders.unshift(order);
        localStorage.setItem('demeni-orders', JSON.stringify(orders));

        // Reset form and close
        document.getElementById('form-new-order').reset();
        closeModal('modal-new-order');

        renderAll();
        toast(`Pedido criado! Código: ${order.tracking_token}`, 'success');

        // Backup to Google Sheets
        saveToSheet(order, 'novo_pedido');
    }

    let dashboardSort = 'original';
    let dashboardPeriod = 30;
    let dashboardExpanded = false;

    function cycleDashboardSort() {
        const modes = ['original', 'asc', 'desc'];
        const labels = { original: '<i class="fas fa-sort"></i> Original', asc: '<i class="fas fa-sort-amount-up"></i> Crescente', desc: '<i class="fas fa-sort-amount-down"></i> Decrescente' };
        dashboardSort = modes[(modes.indexOf(dashboardSort) + 1) % 3];
        const btn = document.getElementById('btn-dashboard-sort');
        if (btn) btn.innerHTML = labels[dashboardSort];
        renderRecentOrders();
    }

    function setDashboardPeriod(days) {
        dashboardPeriod = days;
        dashboardExpanded = false;
        // Update pills
        document.querySelectorAll('.period-pill').forEach(btn => {
            const d = parseInt(btn.textContent);
            btn.className = d === days ? 'btn btn-sm btn-primary period-pill active' : 'btn btn-sm btn-secondary period-pill';
        });
        renderRecentOrders();
        updateKPIs();
        const lbl = document.getElementById('kpi-orders-label');
        if (lbl) lbl.textContent = `Pedidos (${days} dias)`;
    }

    function toggleVerMais() {
        dashboardExpanded = !dashboardExpanded;
        const btn = document.getElementById('btn-ver-mais');
        if (btn) btn.innerHTML = dashboardExpanded
            ? '<i class="fas fa-chevron-up"></i> Ver Menos'
            : '<i class="fas fa-chevron-down"></i> Ver Mais';
        renderRecentOrders();
    }

    function getFilteredOrders() {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - dashboardPeriod);
        return orders.filter(o => new Date(o.created_at) >= cutoff);
    }

    function renderRecentOrders() {
        const tbody = document.getElementById('recent-orders-body');
        if (!tbody) return;

        const statusOrder = KANBAN_COLUMNS.map(c => c.id);
        let list = getFilteredOrders();

        if (dashboardSort === 'asc') {
            list.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));
        } else if (dashboardSort === 'desc') {
            list.sort((a, b) => statusOrder.indexOf(b.status) - statusOrder.indexOf(a.status));
        }

        const showAll = dashboardExpanded;
        const display = showAll ? list : list.slice(0, 10);

        // Show/hide Ver Mais button
        const wrap = document.getElementById('btn-ver-mais-wrap');
        if (wrap) wrap.style.display = list.length > 10 ? 'block' : 'none';

        if (display.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:40px;">
                Nenhum pedido nos últimos ${dashboardPeriod} dias.
            </td></tr>`;
            return;
        }

        tbody.innerHTML = display.map(order => `
            <tr>
                <td><strong>${order.client_name}</strong></td>
                <td><span class="kanban-card-product">${order.product_type?.toUpperCase() || '?'}</span></td>
                <td><span class="status-badge ${order.status}">${getStatusLabel(order.status)}</span></td>
                <td style="color:var(--text-muted);font-size:13px;">${order.vendedor_id === currentUser?.id ? 'Você' : '-'}</td>
                <td style="color:var(--text-muted);font-size:13px;">${formatDate(order.created_at)}</td>
            </tr>
        `).join('');
    }

    function updateKPIs() {
        const periodOrders = getFilteredOrders();

        const completed = periodOrders.filter(o => o.status === 'completed');
        const inProd = orders.filter(o => ['production', 'review', 'briefing'].includes(o.status));
        const revenue = completed.reduce((sum, o) => sum + (parseFloat(o.price) || 0), 0);

        setKPI('kpi-orders', periodOrders.length);
        setKPI('kpi-completed', completed.length);
        setKPI('kpi-production', inProd.length);
        setKPI('kpi-revenue', `R$ ${revenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`);
    }

    function setKPI(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    // ========== MODALS ==========
    function openModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('active');
    }

    function closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('active');
    }

    // ========== TOAST ==========
    function toast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
        container.appendChild(t);

        setTimeout(() => {
            t.style.opacity = '0';
            t.style.transform = 'translateX(100px)';
            setTimeout(() => t.remove(), 300);
        }, 3000);
    }

    // ========== LEADS PANEL (Vendedor) ==========
    function renderLeads() {
        const tbody = document.getElementById('leads-body');
        if (!tbody) return;

        const salesStatuses = ['lead', 'negotiation', 'lost'];
        const myLeads = orders.filter(o => salesStatuses.includes(o.status));

        if (myLeads.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:40px;">
                <i class="fas fa-user-plus" style="font-size:32px;opacity:0.3;display:block;margin-bottom:12px;"></i>
                Nenhum lead. Clique em "Novo Pedido" para adicionar!
            </td></tr>`;
            return;
        }

        tbody.innerHTML = myLeads.map(o => `
            <tr>
                <td><strong>${o.client_name}</strong>${o.client_instagram ? `<br><span style="font-size:11px;color:var(--text-muted);">${o.client_instagram}</span>` : ''}</td>
                <td style="font-size:13px;">${o.client_phone || '-'}</td>
                <td><span class="status-badge ${o.status}">${getStatusLabel(o.status)}</span></td>
                <td><span class="kanban-card-product">${(o.product_type || '').toUpperCase()}</span></td>
                <td style="font-size:13px;">R$ ${parseFloat(o.price || 0).toFixed(0)}</td>
                <td>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        ${o.status !== 'completed' && o.status !== 'lost' ? `
                            <button class="btn btn-sm btn-primary" onclick="Core.advanceLead('${o.id}')" title="Avançar">
                                <i class="fas fa-arrow-right"></i>
                            </button>` : ''}
                        ${o.tracking_token ? `
                            <button class="btn btn-sm btn-secondary" onclick="Core.copyTracking('${o.tracking_token}')" title="Copiar código de rastreio" style="border-color:var(--status-briefing);color:var(--status-briefing);">
                                <i class="fas fa-copy"></i>
                            </button>` : ''}
                        ${o.status !== 'lost' ? `
                            <button class="btn btn-sm btn-secondary" onclick="Core.loseLead('${o.id}')" title="Perdido" style="border-color:var(--status-lost);color:var(--status-lost);">
                                <i class="fas fa-times"></i>
                            </button>` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function advanceLead(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const flow = ['lead', 'negotiation', 'briefing', 'production', 'review', 'completed'];
        const idx = flow.indexOf(order.status);
        if (idx < flow.length - 1) {
            const prev = order.status;
            order.status = flow[idx + 1];
            order.updated_at = new Date().toISOString();
            if (order.status === 'completed') order.converted_at = new Date().toISOString();
            if (!order.activity_log) order.activity_log = [];
            order.activity_log.push({ from: prev, to: order.status, at: new Date().toISOString(), by: currentUser?.name || 'Sistema' });
            saveOrdersLocal();
            renderAll();
            toast(`${order.client_name} → ${getStatusLabel(order.status)}`, 'success');
            saveToSheet(order, 'status_' + order.status);
        }
    }

    function loseLead(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        order.status = 'lost';
        order.updated_at = new Date().toISOString();
        saveOrdersLocal();
        renderAll();
        toast(`${order.client_name} — Perdido`, 'error');
        saveToSheet(order, 'perdido');
    }

    // ========== QUEUE PANEL (Criadora) ==========
    let queueTimerInterval = null;

    function formatTimer(ms) {
        const totalSec = Math.floor(ms / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
        return `${m}m ${String(s).padStart(2, '0')}s`;
    }

    function renderQueue() {
        const container = document.getElementById('queue-list');
        if (!container) return;

        if (queueTimerInterval) { clearInterval(queueTimerInterval); queueTimerInterval = null; }

        const queueStatuses = ['briefing', 'production', 'review'];
        const myQueue = orders.filter(o => queueStatuses.includes(o.status));

        if (myQueue.length === 0) {
            container.innerHTML = `<div class="empty-state">
                <i class="fas fa-paint-brush"></i>
                <h3>Fila vazia</h3>
                <p>Quando novos briefings chegarem, eles aparecerão aqui.</p>
            </div>`;
            return;
        }

        container.innerHTML = myQueue.map(o => {
            const isProduction = o.status === 'production';
            const hasTimer = isProduction && o.timer_started_at;
            const accumulated = o.production_time_ms || 0;
            const timerHTML = hasTimer ? `
                <div style="display:flex;align-items:center;gap:6px;margin-top:8px;padding:8px 12px;
                    background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.2);border-radius:8px;">
                    <i class="fas fa-stopwatch" style="color:#f97316;"></i>
                    <span class="timer-display" data-started="${o.timer_started_at}" data-accumulated="${accumulated}"
                        style="font-family:monospace;font-size:14px;font-weight:700;color:#f97316;">00m 00s</span>
                    <span style="font-size:10px;color:var(--text-muted);margin-left:auto;">em produção</span>
                </div>` : accumulated > 0 ? `
                <div style="display:flex;align-items:center;gap:6px;margin-top:8px;font-size:12px;color:var(--text-muted);">
                    <i class="fas fa-clock"></i> Tempo acumulado: ${formatTimer(accumulated)}
                </div>` : '';

            const briefing = o.briefing;
            const briefingPreview = briefing && briefing.business_type ? `
                <div style="display:flex;align-items:center;gap:6px;margin-top:6px;font-size:11px;color:var(--text-muted);">
                    <i class="fas fa-building"></i> ${briefing.business_type}
                    ${briefing.color1 ? `<span style="width:12px;height:12px;border-radius:3px;background:${briefing.color1};display:inline-block;"></span>` : ''}
                    ${briefing.color2 ? `<span style="width:12px;height:12px;border-radius:3px;background:${briefing.color2};display:inline-block;"></span>` : ''}
                </div>` : '';

            return `
            <div class="card" style="margin-bottom:12px;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                    <div>
                        <h4 style="margin-bottom:4px;">${o.client_name}</h4>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span class="kanban-card-product">${(o.product_type || '').toUpperCase()}</span>
                            <span class="status-badge ${o.status}">${getStatusLabel(o.status)}</span>
                            <span style="font-size:12px;color:var(--text-muted);">${formatDate(o.created_at)}</span>
                        </div>
                        ${briefingPreview}
                    </div>
                    <div style="display:flex;gap:8px;">
                        ${o.status === 'briefing' ? `
                            <button class="btn btn-sm btn-primary" onclick="Core.startProduction('${o.id}')">
                                <i class="fas fa-play"></i> Iniciar
                            </button>` : ''}
                        ${o.status === 'production' ? `
                            <button class="btn btn-sm btn-primary" onclick="Core.sendForApproval('${o.id}')">
                                <i class="fas fa-paper-plane"></i> Enviar p/ Aprovação
                            </button>` : ''}
                        ${o.status === 'review' ? `
                            <button class="btn btn-sm btn-primary" onclick="Core.sendForApproval('${o.id}')">
                                <i class="fas fa-redo"></i> Reenviar
                            </button>` : ''}
                    </div>
                </div>
                ${timerHTML}
                ${o.notes ? `<p style="margin-top:10px;font-size:13px;color:var(--text-secondary);border-top:1px solid var(--border-card);padding-top:10px;"><i class="fas fa-sticky-note" style="margin-right:6px;"></i>${o.notes}</p>` : ''}
            </div>`;
        }).join('');

        // Start ticking timers
        const timerEls = container.querySelectorAll('.timer-display');
        if (timerEls.length > 0) {
            const tick = () => {
                timerEls.forEach(el => {
                    const started = new Date(el.dataset.started).getTime();
                    const acc = parseInt(el.dataset.accumulated) || 0;
                    const elapsed = acc + (Date.now() - started);
                    el.textContent = formatTimer(elapsed);
                });
            };
            tick();
            queueTimerInterval = setInterval(tick, 1000);
        }
    }

    function startProduction(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (order) order.timer_started_at = new Date().toISOString();
        updateOrderStatus(orderId, 'production');
        toast('Produção iniciada! ⏱️ Timer ativado.', 'success');
    }

    function sendForApproval(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (order && order.timer_started_at) {
            const elapsed = Date.now() - new Date(order.timer_started_at).getTime();
            order.production_time_ms = (order.production_time_ms || 0) + elapsed;
            order.timer_started_at = null;
        }
        updateOrderStatus(orderId, 'review');
        toast('Enviado para aprovação!', 'info');
    }

    // ========== CLIENTS PANEL (Suporte) ==========
    function renderClients() {
        const tbody = document.getElementById('clients-body');
        if (!tbody) return;

        const activeStatuses = ['briefing', 'production', 'review'];
        const activeClients = orders.filter(o => activeStatuses.includes(o.status));

        if (activeClients.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:40px;">
                <i class="fas fa-headset" style="font-size:32px;opacity:0.3;display:block;margin-bottom:12px;"></i>
                Nenhum cliente ativo
            </td></tr>`;
            return;
        }

        tbody.innerHTML = activeClients.map(o => `
            <tr>
                <td><strong>${o.client_name}</strong></td>
                <td>
                    ${o.client_phone ? `<a href="https://wa.me/55${o.client_phone.replace(/\D/g, '')}" target="_blank" style="color:var(--status-completed);">
                        <i class="fab fa-whatsapp"></i> ${o.client_phone}
                    </a>` : '-'}
                </td>
                <td><span class="status-badge ${o.status}">${getStatusLabel(o.status)}</span></td>
                <td>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        ${o.client_phone ? `
                            <button class="btn btn-sm btn-secondary" onclick="Core.sendWaToClient('${o.id}')" style="color:#25d366;border-color:#25d36644;" title="Enviar mensagem via WhatsApp">
                                <i class="fab fa-whatsapp"></i> Enviar
                            </button>` : ''}
                        ${o.status === 'briefing' ? `
                            <button class="btn btn-sm btn-primary" onclick="Core.moveToBriefing('${o.id}')">
                                <i class="fas fa-clipboard-list"></i> Briefing
                            </button>` : ''}
                        ${o.status === 'review' ? `
                            <button class="btn btn-sm btn-primary" onclick="Core.approveOrder('${o.id}')" style="background:linear-gradient(135deg,#10b981,#34d399);">
                                <i class="fas fa-check"></i> Aprovar
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="Core.requestAdjustments('${o.id}')">
                                <i class="fas fa-edit"></i> Ajustes
                            </button>` : ''}
                        ${o.status === 'completed' ? `
                            <button class="btn btn-sm btn-primary" onclick="Core.completeOrder('${o.id}')" style="background:linear-gradient(135deg,#10b981,#059669);">
                                <i class="fas fa-flag-checkered"></i> Concluir
                            </button>` : ''}
                    </div>
                </td>
            </tr>
        `).join('');

        renderWaTemplates();
    }

    // ========== WHATSAPP TEMPLATES ==========
    const WA_TEMPLATES = [
        {
            id: 'first_contact', section: '🟢 Primeiro Contato',
            icon: 'fa-comment-dots', color: '#10b981',
            title: 'Boas-vindas',
            message: `Oi {nome}! 🧡 Tudo bem?\n\nA Demeni cria sites profissionais pra pequenos negócios. R$ 250, sem mensalidade, pronto em 24h.\n\nComo posso te ajudar?\n1️⃣ Quero meu site! 🚀\n2️⃣ Quero indicar pessoas 🎁\n3️⃣ Vim por indicação 🎟️\n4️⃣ Como funciona? 🤔`
        },
        {
            id: 'briefing', section: '📋 Briefing',
            icon: 'fa-clipboard-list', color: '#06b6d4',
            title: 'Coleta de Briefing',
            message: `Bora montar seu site, {nome}! 🚀\n\nMe responde essas perguntas rápidas:\n1. Qual o nome do seu negócio?\n2. O que você faz?\n3. Serviços/produtos com preço?\n4. Tem ponto físico? Qual endereço?\n5. Instagram?\n6. Cor preferida pro site?\n7. Botão principal: WhatsApp, Instagram, Ligar ou Mapa?\n\nDepois manda a logo e fotos do negócio! 📸\n\n— Equipe Demeni 🧡`
        },
        {
            id: 'briefing_done', section: '📋 Briefing',
            icon: 'fa-check-circle', color: '#22c55e',
            title: 'Briefing Completo',
            message: `Briefing completo, {nome}! 🎉 Tudo certo?\n\nSe sim, vamos pro pagamento! 😊\nSe quiser corrigir algo, me avisa.`
        },
        {
            id: 'payment', section: '💰 Pagamento',
            icon: 'fa-credit-card', color: '#8b5cf6',
            title: 'Pedir Pagamento',
            message: `{nome}, vamos fechar! 💰\n\nR$ 250 — PIX ou cartão\n📌 Sem mensalidade\n🔑 Chaveiro NFC incluso\n\nTem código de indicação? Se sim, manda que aplico o desconto! 😊`
        },
        {
            id: 'payment_confirmed', section: '💰 Pagamento',
            icon: 'fa-check-double', color: '#10b981',
            title: 'Pagamento Confirmado',
            message: `Confirmado, {nome}! 🎉\n\nBem-vindo(a) à Demeni! Seu site já entrou em produção 🎨\n⏰ Em até 24h envio o preview pra você aprovar!\n\n🔗 Acompanhe:\n{link_status}\n\n— Equipe Demeni 🧡`
        },
        {
            id: 'followup', section: '💰 Pagamento',
            icon: 'fa-clock', color: '#06b6d4',
            title: 'Follow-up (não pagou)',
            message: `{nome}, ficou alguma dúvida? 😊\nSeu briefing tá salvo! Quando quiser finalizar, só pagar e em 24h tá pronto!`
        },
        {
            id: 'update', section: '🎨 Produção',
            icon: 'fa-sync-alt', color: '#3b82f6',
            title: 'Atualização',
            message: `Olá {nome}! 😊\n\nAtualização do seu site:\n📌 Status: Em Produção\n🎨 Estamos caprichando!\n\n🔗 Acompanhe:\n{link_status}\n\nQualquer dúvida, é só chamar.\n\n— Equipe Demeni 🧡`
        },
        {
            id: 'review', section: '🎨 Produção',
            icon: 'fa-eye', color: '#d4a05a',
            title: 'Preview/Aprovação',
            message: `{nome}, olha o seu site! 🚀\n\n👁️ [LINK DO PREVIEW]\n\nTá do jeito que você queria?\n✅ Perfeito — publica!\n✏️ Quero mudar algo\n\n— Equipe Demeni 🧡`
        },
        {
            id: 'alt_1', section: '🎨 Produção',
            icon: 'fa-pen', color: '#f97316',
            title: 'Alteração 1 (de 3)',
            message: `Sem problema, {nome}! 😊\n\n💡 Dica: peça TUDO que quer mudar de uma vez, assim aproveita melhor suas 3 alterações!\n\nMe conta tudo 👇`
        },
        {
            id: 'alt_2', section: '🎨 Produção',
            icon: 'fa-pen', color: '#f97316',
            title: 'Alteração 2 (de 3)',
            message: `Anotado, {nome}! ✅\n\nDepois dessa tem mais UMA alteração. Aproveita e pede tudo que falta!`
        },
        {
            id: 'alt_3', section: '🎨 Produção',
            icon: 'fa-pen', color: '#ef4444',
            title: 'Alteração 3 (última)',
            message: `{nome}, essa é a ÚLTIMA alteração inclusa! Capricha no pedido 👇`
        },
        {
            id: 'alt_ended', section: '🎨 Produção',
            icon: 'fa-lock', color: '#6b7280',
            title: 'Alterações Esgotadas',
            message: `{nome}, suas alterações inclusas acabaram! 😊\nMas você não fica na mão.\n\n💰 Por R$ 100 você ganha mais 3 alterações.\nOu se quiser repaginar o site todo, R$ 100 também!\n\nInteressou?`
        },
        {
            id: 'delivery', section: '🎉 Entrega',
            icon: 'fa-gift', color: '#f59e0b',
            title: 'Site no Ar',
            message: `{nome}, SEU SITE TÁ NO AR! 🎉🚀\n\n🔗 [LINK DO SITE]\n🔑 Chaveiro NFC a caminho!\n📌 Sem mensalidade — pra sempre! 💪\n\nFoi um prazer! Conte sempre com a gente.\n\n— Equipe Demeni 🧡`
        },
        {
            id: 'rating', section: '🎉 Entrega',
            icon: 'fa-star', color: '#eab308',
            title: 'Avaliação',
            message: `{nome}, de 1 a 5, como foi sua experiência com a Demeni? 🧡`
        },
        {
            id: 'referral', section: '🎁 Indicação',
            icon: 'fa-gift', color: '#7c3aed',
            title: 'Código de Indicação',
            message: `🧡 Que bom que gostou, {nome}!\n\nSeu código de indicação:\n🎟️ [CÓDIGO]\n\nCada pessoa que usar ganha 10% de desconto!\nE pra cada venda, você acumula 15% de desconto!\n7 indicações = site GRÁTIS! 🆓\n\n📊 Acompanhe: indicacoes.demeni.com`
        },
        {
            id: 'indicacao_explicar', section: '🎁 Indicação',
            icon: 'fa-bullhorn', color: '#7c3aed',
            title: 'Explicar Programa',
            message: `{nome}, programa de indicação Demeni! 🎁\n\nCada pessoa que comprar com seu código te dá 15% de desconto!\n7 indicações = site GRÁTIS! 🆓\nSeu indicado ganha 10% de desconto!\n\n⚠️ Quem indica não pode usar código de outra pessoa.\n\nQuer participar?`
        },
        {
            id: 'indicacao_converteu', section: '🎁 Indicação',
            icon: 'fa-bell', color: '#10b981',
            title: 'Indicação Converteu',
            message: `🎉 {nome}, alguém comprou com seu código!\nSeu desconto aumentou! 📊 Confira: indicacoes.demeni.com`
        },
        {
            id: 'postsale_30d', section: '🔄 Pós-venda',
            icon: 'fa-heart', color: '#ec4899',
            title: '30 dias',
            message: `{nome}! 1 mês de site no ar! Tudo bem? 🧡\nPrecisa de alguma coisa?`
        },
        {
            id: 'postsale_repaginar', section: '🔄 Pós-venda',
            icon: 'fa-palette', color: '#8b5cf6',
            title: 'Repaginar (60d)',
            message: `{nome}, que tal renovar o visual do site? 🎨\nR$ 100 com 3 alterações! E se tiver indicações, desconto extra!`
        },
        {
            id: 'lead_frio', section: '🔄 Pós-venda',
            icon: 'fa-snowflake', color: '#6b7280',
            title: 'Lead Frio',
            message: `{nome}, lembra do site profissional? R$ 250, sem mensalidade, pronto em 24h 😊\nAinda tô aqui se precisar!`
        }
    ];

    function renderWaTemplates() {
        const container = document.getElementById('wa-templates');
        if (!container) return;

        // Group templates by section
        const sections = [];
        const sectionMap = {};
        WA_TEMPLATES.forEach(t => {
            const sec = t.section || 'Outros';
            if (!sectionMap[sec]) {
                sectionMap[sec] = [];
                sections.push(sec);
            }
            sectionMap[sec].push(t);
        });

        container.innerHTML = sections.map(sec => `
            <div style="margin-bottom:12px;">
                <div style="font-size:12px;font-weight:700;color:var(--text-muted);padding:8px 0;border-bottom:1px solid var(--border-card);margin-bottom:8px;">${sec}</div>
                <div style="display:flex;flex-direction:column;gap:6px;">
                    ${sectionMap[sec].map(t => `
                        <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border-card);border-radius:8px;padding:10px 12px;display:flex;align-items:center;gap:10px;cursor:pointer;" onmouseenter="this.style.borderColor='${t.color}44'" onmouseleave="this.style.borderColor='var(--border-card)'">
                            <div style="width:28px;height:28px;border-radius:6px;background:${t.color}22;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                                <i class="fas ${t.icon}" style="color:${t.color};font-size:12px;"></i>
                            </div>
                            <span style="font-size:13px;font-weight:600;flex:1;">${t.title}</span>
                            <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();Core.copyWaTemplate('${t.id}')" style="padding:4px 8px;font-size:11px;">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();Core.previewWaTemplate('${t.id}')" style="padding:4px 8px;font-size:11px;">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    function copyWaTemplate(templateId, clientName) {
        const t = WA_TEMPLATES.find(x => x.id === templateId);
        if (!t) return;
        let msg = t.message.replace(/\{nome\}/g, clientName || '[Nome do Cliente]');

        // Replace tracking link placeholder with actual tracking URL
        if (msg.includes('{link_status}')) {
            const orders = JSON.parse(localStorage.getItem('demeni_orders') || '[]');
            const clientOrder = orders.find(o => o.client === clientName && o.tracking_token);
            if (clientOrder) {
                const trackingUrl = `https://core.rafaeldemeni.com/tracking.html?t=${clientOrder.tracking_token}`;
                msg = msg.replace(/\{link_status\}/g, trackingUrl);
            } else {
                msg = msg.replace(/\{link_status\}/g, '[link de acompanhamento]');
            }
        }

        navigator.clipboard.writeText(msg).then(() => {
            toast('Mensagem copiada! Cole no WhatsApp.', 'success');
        }).catch(() => {
            toast('Erro ao copiar', 'error');
        });
    }

    function previewWaTemplate(templateId) {
        const t = WA_TEMPLATES.find(x => x.id === templateId);
        if (!t) return;
        const existing = document.getElementById('modal-wa-preview');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'modal-wa-preview';
        modal.innerHTML = `
            <div class="modal" style="max-width:400px;">
                <div class="modal-header">
                    <h3 class="modal-title"><i class="fab fa-whatsapp" style="color:#25d366;margin-right:8px;"></i>${t.title}</h3>
                    <button class="modal-close" onclick="document.getElementById('modal-wa-preview').remove()">&times;</button>
                </div>
                <div class="modal-body" style="padding:16px;">
                    <div style="background:#0b141a;border-radius:12px;padding:16px;font-size:13px;color:#e9edef;white-space:pre-line;line-height:1.6;font-family:inherit;">${t.message}</div>
                    <div class="form-group" style="margin-top:12px;">
                        <label class="form-label">Nome do cliente (substituir {nome})</label>
                        <input type="text" class="form-input" id="wa-client-name" placeholder="Ex: Maria">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary btn-sm" onclick="document.getElementById('modal-wa-preview').remove()">Fechar</button>
                    <button class="btn btn-primary btn-sm" onclick="Core.copyWaTemplate('${t.id}', document.getElementById('wa-client-name').value)" style="background:#25d366;">
                        <i class="fas fa-copy"></i> Copiar com Nome
                    </button>
                </div>
            </div>
        `;
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        document.body.appendChild(modal);
    }

    function sendWaToClient(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (!order || !order.client_phone) {
            toast('Cliente sem telefone cadastrado', 'error');
            return;
        }

        // Auto-select template based on status
        const statusTemplateMap = {
            converted: 'welcome', briefing: 'welcome',
            production: 'update', adjustments: 'update',
            approval: 'review',
            delivered: 'delivery', completed: 'delivery',
        };
        const defaultTemplateId = statusTemplateMap[order.status] || 'update';

        const existing = document.getElementById('modal-wa-send');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'modal-wa-send';
        modal.innerHTML = `
            <div class="modal" style="max-width:440px;">
                <div class="modal-header">
                    <h3 class="modal-title"><i class="fab fa-whatsapp" style="color:#25d366;margin-right:8px;"></i>Enviar para ${order.client_name}</h3>
                    <button class="modal-close" onclick="document.getElementById('modal-wa-send').remove()">&times;</button>
                </div>
                <div class="modal-body" style="padding:16px;">
                    <div class="form-group">
                        <label class="form-label">Template</label>
                        <select class="form-input" id="wa-send-template" onchange="Core.updateWaSendPreview()">
                            ${WA_TEMPLATES.map(t => `<option value="${t.id}" ${t.id === defaultTemplateId ? 'selected' : ''}>${t.title}</option>`).join('')}
                        </select>
                    </div>
                    <div id="wa-send-preview" style="background:#0b141a;border-radius:12px;padding:14px;font-size:12px;color:#e9edef;white-space:pre-line;line-height:1.5;max-height:200px;overflow-y:auto;margin-bottom:12px;"></div>
                    <div style="font-size:11px;color:var(--text-muted);">
                        <i class="fas fa-phone"></i> ${order.client_phone}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary btn-sm" onclick="document.getElementById('modal-wa-send').remove()">Cancelar</button>
                    <button class="btn btn-primary btn-sm" id="wa-send-btn" style="background:#25d366;">
                        <i class="fab fa-whatsapp"></i> Abrir WhatsApp
                    </button>
                </div>
            </div>
        `;
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        document.body.appendChild(modal);

        // Set up preview and send
        const phone = order.client_phone.replace(/\D/g, '');
        const updatePreview = () => {
            const tid = document.getElementById('wa-send-template').value;
            const t = WA_TEMPLATES.find(x => x.id === tid);
            if (!t) return;
            const msg = t.message.replace(/\{nome\}/g, order.client_name);
            document.getElementById('wa-send-preview').textContent = msg;
            document.getElementById('wa-send-btn').onclick = () => {
                window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                document.getElementById('modal-wa-send').remove();
                toast('WhatsApp aberto!', 'success');
            };
        };
        updatePreview();
        window.Core.updateWaSendPreview = updatePreview;
    }

    function moveToBriefing(orderId) {
        updateOrderStatus(orderId, 'briefing');
        toast('Briefing iniciado!', 'info');
    }

    function approveOrder(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.delivered_at = new Date().toISOString();
        }
        updateOrderStatus(orderId, 'completed');
        toast('Site aprovado e entregue!', 'success');
    }

    function requestAdjustments(orderId) {
        updateOrderStatus(orderId, 'review');
        toast('Ajustes solicitados', 'info');
    }

    function completeOrder(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.completed_at = new Date().toISOString();
        }
        updateOrderStatus(orderId, 'completed');
        toast('Pedido concluído!', 'success');
    }

    // ========== TEAM PANEL (Admin/Gestora) ==========
    function renderTeam() {
        const tbody = document.getElementById('team-body');
        if (!tbody) return;

        // Mock team for now (will come from Supabase profiles later)
        const team = [
            { name: 'Rafael', role: 'admin', email: 'rafael@demeni.com', online: true },
        ];

        tbody.innerHTML = team.map(m => `
            <tr>
                <td>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:32px;height:32px;border-radius:50%;background:var(--brand-gradient);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:white;">
                            ${m.name.charAt(0)}
                        </div>
                        <strong>${m.name}</strong>
                    </div>
                </td>
                <td><span class="user-role" data-role="${m.role}" style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${ROLE_LABELS[m.role] || m.role}</span></td>
                <td style="font-size:13px;color:var(--text-muted);">${m.email}</td>
                <td><span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;color:${m.online ? 'var(--status-completed)' : 'var(--text-muted)'};"><span style="width:6px;height:6px;border-radius:50%;background:${m.online ? 'var(--status-completed)' : 'var(--text-muted)'}"></span> ${m.online ? 'Online' : 'Offline'}</span></td>
                <td><button class="btn btn-sm btn-secondary"><i class="fas fa-ellipsis-h"></i></button></td>
            </tr>
        `).join('');

        renderLeaderboard();
        renderPerformance();
    }

    // ========== PERFORMANCE MONITOR ==========
    function renderPerformance() {
        const container = document.getElementById('performance-monitor');
        if (!container) return;

        const now = new Date();
        const TARGET_SALES = getSetting('sales_target', 50);
        const MIN_PCT = 60; // Below 60% = critical
        const RECOVERY_MONTHS = 3;

        // Get saved performance history
        let history = JSON.parse(localStorage.getItem('demeni-performance') || '{}');

        // Build members from orders data (unique vendedor_ids)
        const members = {};
        orders.forEach(o => {
            if (o.vendedor_id && o.vendedor_name) {
                if (!members[o.vendedor_id]) {
                    members[o.vendedor_id] = { id: o.vendedor_id, name: o.vendedor_name, role: 'vendedor' };
                }
            }
        });

        // Calculate this month's performance for each member
        const convertedStatuses = ['briefing', 'production', 'review', 'completed'];
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        Object.values(members).forEach(m => {
            const mOrders = orders.filter(o => {
                const d = new Date(o.created_at);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && o.vendedor_id === m.id;
            });
            const sales = mOrders.filter(o => convertedStatuses.includes(o.status)).length;
            const pct = Math.round((sales / TARGET_SALES) * 100);

            // Save to history
            if (!history[m.id]) history[m.id] = { name: m.name, months: {} };
            history[m.id].name = m.name;
            history[m.id].months[monthKey] = { sales, target: TARGET_SALES, pct };
        });

        localStorage.setItem('demeni-performance', JSON.stringify(history));

        // Render
        const entries = Object.entries(history);
        if (entries.length === 0) {
            container.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px;">Nenhum vendedor registrado ainda</div>';
            return;
        }

        // Get last 3 months keys
        const monthKeys = [];
        for (let i = 0; i < RECOVERY_MONTHS; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }
        const monthLabels = monthKeys.map(k => {
            const [y, m] = k.split('-');
            return new Date(y, m - 1).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
        });

        container.innerHTML = entries.map(([id, data]) => {
            const currentMonth = data.months[monthKey] || { sales: 0, pct: 0 };

            // Count consecutive months below target (excluding current)
            let belowCount = 0;
            for (let i = 1; i < RECOVERY_MONTHS; i++) {
                const mk = monthKeys[i];
                const m = data.months[mk];
                if (m && m.pct < 100) belowCount++;
            }

            // Determine status
            let status, statusColor, statusIcon, statusLabel;
            if (currentMonth.pct >= 100) {
                status = 'ok'; statusColor = '#10b981'; statusIcon = 'fa-check-circle'; statusLabel = '✅ Dentro da Meta';
            } else if (currentMonth.pct >= MIN_PCT) {
                const remaining = RECOVERY_MONTHS - belowCount;
                status = 'recovery'; statusColor = '#eab308'; statusIcon = 'fa-exclamation-circle';
                statusLabel = `⚠️ Recuperação (${remaining} mês${remaining !== 1 ? 'es' : ''} restante${remaining !== 1 ? 's' : ''})`;
            } else {
                status = 'critical'; statusColor = '#ef4444'; statusIcon = 'fa-times-circle';
                statusLabel = '🔴 Abaixo do Mínimo — Situação Crítica';
            }

            // Mini bars for last 3 months
            const bars = monthKeys.map((mk, i) => {
                const m = data.months[mk];
                const pct = m ? Math.min(m.pct, 100) : 0;
                const barColor = pct >= 100 ? '#10b981' : pct >= MIN_PCT ? '#eab308' : '#ef4444';
                return `<div style="flex:1;text-align:center;">
                    <div style="font-size:9px;color:var(--text-muted);margin-bottom:2px;">${monthLabels[i]}</div>
                    <div style="height:24px;background:var(--bg-sidebar);border-radius:4px;overflow:hidden;position:relative;">
                        <div style="position:absolute;left:0;top:0;bottom:0;width:${pct}%;background:${barColor};border-radius:4px;transition:width 0.5s;"></div>
                    </div>
                    <div style="font-size:10px;font-weight:700;color:${barColor};margin-top:2px;">${m ? m.sales : 0}/${TARGET_SALES}</div>
                </div>`;
            }).join('');

            return `
            <div style="padding:14px;border-bottom:1px solid var(--border-card);${status === 'critical' ? 'background:rgba(239,68,68,0.04);' : ''}">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:36px;height:36px;border-radius:50%;background:var(--brand-gradient);
                            display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:white;">
                            ${data.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style="font-weight:700;font-size:14px;">${data.name}</div>
                            <div style="font-size:11px;color:${statusColor};font-weight:600;">
                                <i class="fas ${statusIcon}" style="margin-right:4px;"></i>${statusLabel}
                            </div>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:22px;font-weight:800;color:${statusColor};">${currentMonth.pct}%</div>
                        <div style="font-size:10px;color:var(--text-muted);">da meta</div>
                    </div>
                </div>
                <div style="display:flex;gap:8px;">${bars}</div>
                <!-- Progress bar -->
                <div style="margin-top:8px;height:6px;background:var(--bg-sidebar);border-radius:3px;overflow:hidden;">
                    <div style="height:100%;width:${Math.min(currentMonth.pct, 100)}%;background:${statusColor};border-radius:3px;transition:width 0.5s;"></div>
                </div>
            </div>`;
        }).join('');
    }

    function renderLeaderboard() {
        const container = document.getElementById('leaderboard');
        if (!container) return;

        const now = new Date();
        const convertedStatuses = ['briefing', 'production', 'review', 'completed'];
        const monthOrders = orders.filter(o => {
            const d = new Date(o.created_at);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        // Group by vendedor
        const sellers = {};
        monthOrders.forEach(o => {
            const vid = o.vendedor_id || 'unknown';
            const vname = o.vendedor_name || 'Sem vendedor';
            if (!sellers[vid]) sellers[vid] = { name: vname, leads: 0, sales: 0, revenue: 0 };
            sellers[vid].leads++;
            if (convertedStatuses.includes(o.status)) {
                sellers[vid].sales++;
                sellers[vid].revenue += parseFloat(o.price) || 0;
            }
        });

        const ranked = Object.values(sellers)
            .filter(s => s.leads > 0)
            .sort((a, b) => b.sales - a.sales || b.revenue - a.revenue);

        if (ranked.length === 0) {
            container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px;">Sem dados de vendas este mês</div>';
            return;
        }

        const medals = ['🥇', '🥈', '🥉'];
        container.innerHTML = ranked.map((s, i) => {
            const rate = s.leads > 0 ? Math.round((s.sales / s.leads) * 100) : 0;
            const rateColor = rate >= 50 ? '#10b981' : rate >= 25 ? '#eab308' : '#ef4444';
            return `
            <div style="display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid var(--border-card);
                ${i === 0 ? 'background:rgba(234,179,8,0.05);' : ''}">
                <div style="font-size:${i < 3 ? '22px' : '14px'};width:32px;text-align:center;font-weight:800;color:var(--text-muted);">
                    ${i < 3 ? medals[i] : `${i + 1}º`}
                </div>
                <div style="width:36px;height:36px;border-radius:50%;background:var(--brand-gradient);display:flex;
                    align-items:center;justify-content:center;font-weight:700;font-size:14px;color:white;">
                    ${s.name.charAt(0).toUpperCase()}
                </div>
                <div style="flex:1;">
                    <div style="font-weight:600;font-size:14px;">${s.name}</div>
                    <div style="font-size:11px;color:var(--text-muted);">
                        ${s.sales} vendas · R$ ${s.revenue.toLocaleString('pt-BR')} · taxa <span style="color:${rateColor};font-weight:700;">${rate}%</span>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:18px;font-weight:800;color:var(--text-primary);">${s.sales}</div>
                    <div style="font-size:10px;color:var(--text-muted);">vendas</div>
                </div>
            </div>`;
        }).join('');
    }

    // ========== SHARED HELPERS ==========
    function updateOrderStatus(orderId, newStatus) {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            const oldStatus = order.status;
            order.status = newStatus;
            order.updated_at = new Date().toISOString();
            // Activity log
            if (!order.activity_log) order.activity_log = [];
            order.activity_log.push({
                action: 'status_change',
                from: oldStatus,
                to: newStatus,
                by: currentUser?.name || currentUser?.email || 'Sistema',
                at: new Date().toISOString()
            });
        }
        saveOrdersLocal();
        renderAll();
    }

    function saveOrdersLocal() {
        localStorage.setItem('demeni-orders', JSON.stringify(orders));
    }

    // ========== GOOGLE SHEETS BACKUP ==========
    function saveToSheet(order, action) {
        const sheetsUrl = localStorage.getItem('demeni-sheets-url');
        if (!sheetsUrl) return;

        // Send each field as individual URL param (avoids JSON encoding issues)
        const fields = {
            action: action || 'update',
            client_name: order.client_name || '',
            client_phone: order.client_phone || '',
            client_email: order.client_email || '',
            client_instagram: order.client_instagram || '',
            client_city: order.client_city || '',
            product_type: order.product_type || '',
            price: order.price || '',
            source: order.source || '',
            status: order.status || '',
            referral_code: order.referral_code || '',
            site_url: order.site_url || '',
            tracking_token: order.tracking_token || '',
            notes: (order.notes || '').substring(0, 200),
            loss_reason: order.loss_reason || '',
        };

        try {
            const params = Object.entries(fields)
                .map(([k, v]) => k + '=' + encodeURIComponent(v))
                .join('&');
            const img = new Image();
            img.src = sheetsUrl + '?' + params;
        } catch (err) {
            console.warn('[Sheets] Backup failed:', err.message);
        }
    }

    // ========== ATTACHMENTS & CHECKLIST ==========
    const DEFAULT_CHECKLIST = [
        { key: 'logo', label: '📷 Logo / imagem recebida' },
        { key: 'colors', label: '🎨 Cores definidas' },
        { key: 'texts', label: '📝 Textos e conteúdos prontos' },
        { key: 'refs', label: '🔗 Referências visuais OK' },
        { key: 'approval', label: '✅ Aprovação do cliente' },
    ];

    function getChecklist(order) {
        if (!order.checklist) order.checklist = {};
        return DEFAULT_CHECKLIST.map(item => ({
            ...item,
            done: !!order.checklist[item.key],
        }));
    }

    function getChecklistProgress(order) {
        if (!order.checklist) return 0;
        const done = DEFAULT_CHECKLIST.filter(i => order.checklist[i.key]).length;
        return Math.round((done / DEFAULT_CHECKLIST.length) * 100);
    }

    function toggleChecklistItem(orderId, key) {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        if (!order.checklist) order.checklist = {};
        order.checklist[key] = !order.checklist[key];
        saveOrdersLocal();
        // Re-render the detail modal
        const modal = document.getElementById('modal-order-detail');
        if (modal) { modal.remove(); openOrderDetail(orderId); }
        renderKanbanCards();
    }

    function compressImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX = 600;
                    let w = img.width, h = img.height;
                    if (w > MAX) { h = h * (MAX / w); w = MAX; }
                    if (h > MAX) { w = w * (MAX / h); h = MAX; }
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL('image/webp', 0.6));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function addAttachment(orderId) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.onchange = async () => {
            const order = orders.find(o => o.id === orderId);
            if (!order) return;
            if (!order.attachments) order.attachments = [];

            for (const file of input.files) {
                const base64 = await compressImage(file);
                order.attachments.push({
                    type: 'image',
                    url: base64,
                    name: file.name,
                    added_at: new Date().toISOString(),
                });
            }
            saveOrdersLocal();
            toast(`${input.files.length} imagem(ns) anexada(s)`, 'success');
            // Re-render
            const modal = document.getElementById('modal-order-detail');
            if (modal) { modal.remove(); openOrderDetail(orderId); }
            renderKanbanCards();
        };
        input.click();
    }

    function addLinkAttachment(orderId) {
        const url = prompt('Cole o link (Google Drive, referência, etc.):');
        if (!url || !url.trim()) return;
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        if (!order.attachments) order.attachments = [];
        const name = prompt('Nome do link (opcional):', '') || url.substring(0, 40);
        order.attachments.push({
            type: 'link',
            url: url.trim(),
            name: name,
            added_at: new Date().toISOString(),
        });
        saveOrdersLocal();
        toast('Link adicionado!', 'success');
        const modal = document.getElementById('modal-order-detail');
        if (modal) { modal.remove(); openOrderDetail(orderId); }
    }

    function removeAttachment(orderId, index) {
        const order = orders.find(o => o.id === orderId);
        if (!order || !order.attachments) return;
        if (!confirm('Remover este anexo?')) return;
        order.attachments.splice(index, 1);
        saveOrdersLocal();
        const modal = document.getElementById('modal-order-detail');
        if (modal) { modal.remove(); openOrderDetail(orderId); }
        renderKanbanCards();
    }

    function openLightbox(src) {
        const overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.innerHTML = `
            <span class="lightbox-close">&times;</span>
            <img src="${src}" alt="Anexo">
        `;
        overlay.addEventListener('click', () => overlay.remove());
        document.body.appendChild(overlay);
    }

    function saveIntegrationSettings() {
        const url = document.getElementById('cfg-sheets-url')?.value.trim() || '';
        if (url) localStorage.setItem('demeni-sheets-url', url);
        else localStorage.removeItem('demeni-sheets-url');
        toast('Integrações salvas!', 'success');
    }

    function loadIntegrationSettings() {
        const url = localStorage.getItem('demeni-sheets-url') || '';
        const el = document.getElementById('cfg-sheets-url');
        if (el) el.value = url;
    }

    // ========== ORDERS PAGE ==========
    let ordersTab = 'active';

    function switchOrderTab(tab) {
        ordersTab = tab;
        const tabs = ['all', 'presale', 'active', 'completed'];
        tabs.forEach(t => {
            const btn = document.getElementById('tab-orders-' + t);
            if (btn) btn.className = t === tab ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
        });
        renderOrders();
    }

    function renderOrders() {
        const body = document.getElementById('orders-table-body');
        if (!body) return;
        const sourceLabels = { instagram: '📱 Insta', facebook: '📘 FB', ads_meta: '📢 Meta', ads_google: '🔍 Google', indicacao: '🤝 Indicação', rua: '🚶 Rua', whatsapp: '💬 WhatsApp', influencer: '⭐ Influencer', site: '🌐 Site', outro: '📎 Outro' };
        const presaleStatuses = ['lead', 'negotiation'];
        const completedStatuses = ['completed', 'lost'];
        const productionStatuses = ['briefing', 'production', 'review'];
        let filtered;
        if (ordersTab === 'presale') {
            filtered = orders.filter(o => presaleStatuses.includes(o.status));
        } else if (ordersTab === 'active') {
            filtered = orders.filter(o => productionStatuses.includes(o.status));
        } else if (ordersTab === 'completed') {
            filtered = orders.filter(o => completedStatuses.includes(o.status));
        } else {
            filtered = orders;
        }

        if (filtered.length === 0) {
            body.innerHTML = `<tr><td colspan="7" class="empty-state" style="padding:40px;"><i class="fas fa-file-invoice"></i><br>Nenhum pedido nesta categoria</td></tr>`;
            return;
        }
        body.innerHTML = filtered.map(o => `
            <tr style="cursor:pointer;" onclick="Core.openOrderDetail('${o.id}')">
                <td><strong>${o.client_name}</strong></td>
                <td><span class="kanban-card-product">${(o.product_type || '').toUpperCase()}</span></td>
                <td>R$ ${parseFloat(o.price || 0).toFixed(0)}</td>
                <td><span class="status-badge ${o.status}">${getStatusLabel(o.status)}</span></td>
                <td style="font-size:12px;">${sourceLabels[o.source] || o.source || '—'}</td>
                <td style="font-size:12px;color:var(--text-muted);">${formatDate(o.created_at)}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();Core.editOrder('${o.id}')" style="font-size:11px;padding:4px 10px;">
                        <i class="fas fa-pen"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    function editOrder(orderId) {
        // Close existing order detail modal if open
        const existingDetail = document.getElementById('modal-order-detail');
        if (existingDetail) existingDetail.remove();

        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const statuses = ['lead', 'negotiation', 'briefing', 'production', 'review', 'completed', 'lost'];
        const products = [{ v: 'd1', l: 'D-1 — Card Digital' }, { v: 'd2', l: 'D-2 — Landing Page Mobile' }, { v: 'd3', l: 'D-3 — Cardápio/Loja' }, { v: 'prime', l: 'Prime-D — Página/Site' }, { v: 'ecommerce', l: 'E-commerce' }, { v: 'saas', l: 'SaaS' }];
        const sources = [{ v: '', l: 'Não informado' }, { v: 'instagram', l: '📱 Instagram' }, { v: 'facebook', l: '📘 Facebook' }, { v: 'ads_meta', l: '📢 Anúncio Meta' }, { v: 'ads_google', l: '🔍 Google Ads' }, { v: 'indicacao', l: '🤝 Indicação' }, { v: 'rua', l: '🚶 Rua' }, { v: 'whatsapp', l: '💬 WhatsApp' }, { v: 'influencer', l: '⭐ Influenciador' }, { v: 'site', l: '🌐 Site' }, { v: 'outro', l: '📎 Outro' }];

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'modal-edit-order';
        modal.innerHTML = `
            <div class="modal" style="max-width:520px;">
                <div class="modal-header">
                    <h3 class="modal-title">Editar Pedido</h3>
                    <button class="modal-close" onclick="document.getElementById('modal-edit-order').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">Nome do Cliente</label>
                        <input class="form-input" id="edit-name" value="${order.client_name || ''}">
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div class="form-group">
                            <label class="form-label">WhatsApp</label>
                            <input class="form-input" id="edit-phone" value="${order.client_phone || ''}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Instagram</label>
                            <input class="form-input" id="edit-instagram" value="${order.client_instagram || ''}">
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div class="form-group">
                            <label class="form-label">Produto</label>
                            <select class="form-select" id="edit-product">
                                ${products.map(p => `<option value="${p.v}" ${order.product_type === p.v ? 'selected' : ''}>${p.l}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Valor (R$)</label>
                            <input type="number" class="form-input" id="edit-price" value="${order.price || 0}" step="0.01" min="0">
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div class="form-group">
                            <label class="form-label">Status</label>
                            <select class="form-select" id="edit-status">
                                ${statuses.map(s => `<option value="${s}" ${order.status === s ? 'selected' : ''}>${getStatusLabel(s)}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Origem</label>
                            <select class="form-select" id="edit-source">
                                ${sources.map(s => `<option value="${s.v}" ${order.source === s.v ? 'selected' : ''}>${s.l}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Prazo de Entrega</label>
                        <input type="date" class="form-input" id="edit-deadline" value="${order.deadline ? order.deadline.split('T')[0] : ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Observações</label>
                        <textarea class="form-textarea" id="edit-notes" style="min-height:60px;">${order.notes || ''}</textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary btn-sm" onclick="document.getElementById('modal-edit-order').remove()">Cancelar</button>
                    <button class="btn btn-primary btn-sm" onclick="Core.saveEditOrder('${order.id}')"><i class="fas fa-check"></i> Salvar</button>
                </div>
            </div>
        `;
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        document.body.appendChild(modal);
    }

    function saveEditOrder(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        order.client_name = document.getElementById('edit-name').value.trim();
        order.client_phone = document.getElementById('edit-phone').value.trim();
        order.client_instagram = document.getElementById('edit-instagram').value.trim();
        order.product_type = document.getElementById('edit-product').value;
        order.price = parseFloat(document.getElementById('edit-price').value) || 0;
        order.status = document.getElementById('edit-status').value;
        order.source = document.getElementById('edit-source').value;
        order.notes = document.getElementById('edit-notes').value.trim();
        const deadlineVal = document.getElementById('edit-deadline').value;
        order.deadline = deadlineVal ? new Date(deadlineVal + 'T23:59:59').toISOString() : '';
        order.updated_at = new Date().toISOString();
        saveOrdersLocal();
        renderAll();
        document.getElementById('modal-edit-order').remove();
        toast('Pedido atualizado!', 'success');
    }

    function renderAll() {
        // Migrate old statuses to new 6-column flow
        const statusMap = { contacted: 'negotiation', meeting: 'negotiation', proposal: 'negotiation', converted: 'briefing', approval: 'review', adjustments: 'review', delivered: 'completed' };
        let migrated = false;
        orders.forEach(o => { if (statusMap[o.status]) { o.status = statusMap[o.status]; migrated = true; } });
        if (migrated) saveOrdersLocal();

        renderKanbanCards();
        renderRecentOrders();
        renderOrders();
        renderQueue();
        renderClients();
        renderTeam();
        updateKPIs();
        updateMetrics();
        renderCalendar();
        // Settings counts
        const oc = document.getElementById('settings-orders-count');
        const pc = document.getElementById('settings-posts-count');
        if (oc) oc.textContent = orders.length;
        if (pc) pc.textContent = posts.length;
        // Financial
        updateFinancial();
        loadIntegrationSettings();
        renderGoals();
        renderAlerts();
        loadFinancialSettings();
    }

    // ========== ALERTAS ==========
    function renderAlerts() {
        const container = document.getElementById('dashboard-alerts');
        if (!container) return;

        const alerts = [];
        const now = new Date();

        // 1. Overdue orders (active orders past deadline)
        const activeStatuses = ['briefing', 'production', 'review'];
        const activeOrders = orders.filter(o => activeStatuses.includes(o.status));
        activeOrders.forEach(o => {
            let dl;
            if (o.deadline) {
                dl = new Date(o.deadline);
            } else {
                dl = new Date(o.created_at);
                dl.setDate(dl.getDate() + 7);
            }
            const diffDays = Math.ceil((dl - now) / (1000 * 60 * 60 * 24));
            if (diffDays < 0) {
                alerts.push({
                    type: 'danger',
                    icon: 'fa-exclamation-triangle',
                    text: `<strong>${o.client_name}</strong> está ${Math.abs(diffDays)} dia${Math.abs(diffDays) > 1 ? 's' : ''} atrasado — ${getStatusLabel(o.status)}`
                });
            } else if (diffDays <= 2) {
                alerts.push({
                    type: 'warning',
                    icon: 'fa-clock',
                    text: `<strong>${o.client_name}</strong> vence em ${diffDays} dia${diffDays !== 1 ? 's' : ''} — ${getStatusLabel(o.status)}`
                });
            }
        });

        // 2. Overloaded creators (3+ active orders)
        const creatorLoad = {};
        activeOrders.forEach(o => {
            const creator = o.criadora_id || 'Não atribuído';
            creatorLoad[creator] = (creatorLoad[creator] || 0) + 1;
        });
        Object.entries(creatorLoad).forEach(([id, count]) => {
            if (count >= 3) {
                alerts.push({
                    type: 'warning',
                    icon: 'fa-user-clock',
                    text: `Criadora com <strong>${count} pedidos ativos</strong> — considere redistribuir`
                });
            }
        });

        // 3. Follow-up suggestions (leads/contacted not updated in 3+ days)
        const followupStatuses = ['lead', 'negotiation'];
        orders.filter(o => followupStatuses.includes(o.status)).forEach(o => {
            const lastUpdate = new Date(o.updated_at || o.created_at);
            const daysSince = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
            if (daysSince >= 3) {
                alerts.push({
                    type: 'info',
                    icon: 'fa-phone-alt',
                    text: `<strong>${o.client_name}</strong> sem contato há ${daysSince} dias — fazer follow-up`,
                    orderId: o.id
                });
            }
        });

        if (alerts.length === 0) {
            container.style.display = 'none';
            return;
        }

        const colors = {
            danger: { bg: 'rgba(239,68,68,0.1)', border: '#ef4444', color: '#ef4444' },
            warning: { bg: 'rgba(234,179,8,0.1)', border: '#eab308', color: '#eab308' },
            info: { bg: 'rgba(59,130,246,0.1)', border: '#3b82f6', color: '#3b82f6' }
        };

        container.style.display = 'block';
        container.innerHTML = alerts.map(a => {
            const c = colors[a.type];
            return `<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;
                background:${c.bg};border-left:3px solid ${c.border};border-radius:8px;margin-bottom:6px;font-size:13px;">
                <i class="fas ${a.icon}" style="color:${c.color};"></i>
                <span>${a.text}</span>
            </div>`;
        }).join('');
    }

    // ========== METAS DO VENDEDOR ==========
    function getSetting(key, defaultVal) {
        const s = JSON.parse(localStorage.getItem('demeni-financial-settings') || '{}');
        return s[key] !== undefined ? s[key] : defaultVal;
    }


    function renderGoals() {
        if (!document.getElementById('goals-target')) return;

        const now = new Date();
        const thisMonth = orders.filter(o => {
            const d = new Date(o.created_at);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        // Sales = orders past lead stage (converted+)
        const convertedStatuses = ['briefing', 'production', 'review', 'completed'];
        const allSales = thisMonth.filter(o => convertedStatuses.includes(o.status));

        // Role-based attribution
        const trafficSources = ['instagram', 'facebook', 'ads_meta', 'ads_google', 'site'];
        let mySales, roleLabel;

        if (currentRole === 'suporte') {
            mySales = allSales.filter(o => trafficSources.includes(o.source));
            roleLabel = 'Suporte';
        } else {
            // Vendedor & Admin: only sales THEY registered
            mySales = allSales.filter(o => o.vendedor_id === currentUser?.id);
            roleLabel = currentRole === 'admin' ? 'Admin' : 'Vendedor';
        }

        const salesCount = mySales.length;
        // Commission = 5% on what was ACTUALLY PAID (suporte gets no commission)
        const totalPaid = mySales.reduce((s, o) => s + getOrderPaid(o), 0);
        const totalValue = mySales.reduce((s, o) => s + (parseFloat(o.price) || 0), 0);
        const COMMISSION_RATE = currentRole === 'suporte' ? 0 : getSetting('commission_rate', 5) / 100;
        const commission = Math.round(totalPaid * COMMISSION_RATE);

        // Conversion rate
        const totalLeads = thisMonth.length;
        const convRate = totalLeads > 0 ? Math.round((salesCount / totalLeads) * 100) : 0;

        // Progress
        const SALES_TARGET = getSetting('sales_target', 50);
        const pct = Math.min(Math.round((salesCount / SALES_TARGET) * 100), 100);

        // Update KPIs
        document.getElementById('goals-target').textContent = `${salesCount} / ${SALES_TARGET}`;
        document.getElementById('goals-commission').textContent = `R$ ${commission.toLocaleString('pt-BR')}`;
        document.getElementById('goals-conversion').textContent = `${convRate}%`;

        // Progress bar
        const bar = document.getElementById('goals-progress-bar');
        const barText = document.getElementById('goals-bar-text');
        const label = document.getElementById('goals-progress-label');
        const targetLabel = document.getElementById('goals-target-label');
        if (bar) bar.style.width = `${pct}%`;
        if (barText) barText.textContent = pct > 10 ? `${salesCount} vendas` : '';
        if (label) label.textContent = `${pct}%`;
        if (targetLabel) targetLabel.textContent = `Meta: ${SALES_TARGET} vendas`;

        // Weekly history
        const tbody = document.getElementById('goals-weekly-body');
        if (!tbody) return;

        // Group sales by week number of the month
        const weeks = {};
        mySales.forEach(o => {
            const d = new Date(o.created_at);
            const weekNum = Math.ceil(d.getDate() / 7);
            const key = `Semana ${weekNum}`;
            if (!weeks[key]) weeks[key] = { count: 0, value: 0, paid: 0 };
            weeks[key].count++;
            weeks[key].value += parseFloat(o.price) || 0;
            weeks[key].paid += getOrderPaid(o);
        });

        const weekKeys = Object.keys(weeks);
        if (weekKeys.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:30px;">
                Nenhuma venda neste mês ainda.
            </td></tr>`;
            return;
        }

        tbody.innerHTML = weekKeys.map(w => {
            const wk = weeks[w];
            const wkComm = Math.round(wk.paid * (getSetting('commission_rate', 5) / 100));
            return `<tr>
                <td><strong>${w}</strong></td>
                <td>${wk.count}</td>
                <td style="color:var(--text-secondary);">R$ ${wk.value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</td>
                <td style="color:#10b981;font-weight:600;">R$ ${wkComm.toLocaleString('pt-BR')}</td>
            </tr>`;
        }).join('');
    }

    // ========== FINANCIAL ==========
    // Financial settings read from localStorage
    function getFinancialSettings() {
        const salVendedor = getSetting('salary_vendedor', 1000);
        const salSuporte = getSetting('salary_suporte', 1500);
        const salCriadora = getSetting('salary_criadora', 1000);
        const salSocialMedia = getSetting('salary_social_media', 1500);
        const commRate = getSetting('commission_rate', 15) / 100;
        const commCap = getSetting('commission_cap', 10000);
        const bonusSite = getSetting('bonus_site', 3);
        const costKeychain = getSetting('cost_keychain', 12);
        const salGestora = getSetting('salary_gestora', 1500);
        const gestoraPct = getSetting('gestora_pct', 8) / 100;
        const infraCosts = 3;
        const fixedCosts = salVendedor + salSuporte + salCriadora + salSocialMedia + salGestora + infraCosts;
        return { salVendedor, salSuporte, salCriadora, salSocialMedia, commRate, commCap, bonusSite, costKeychain, salGestora, gestoraPct, infraCosts, fixedCosts };
    }

    function saveFinancialSettings() {
        const val = (id, def) => {
            const v = parseFloat(document.getElementById(id)?.value);
            return isNaN(v) ? def : v;
        };
        const settings = {
            salary_vendedor: val('cfg-salary-vendedor', 1000),
            salary_suporte: val('cfg-salary-suporte', 1500),
            salary_criadora: val('cfg-salary-criadora', 1000),
            salary_social_media: val('cfg-salary-social-media', 1500),
            commission_rate: val('cfg-commission-rate', 15),
            commission_cap: val('cfg-commission-cap', 10000),
            bonus_site: val('cfg-bonus-site', 3),
            cost_keychain: val('cfg-cost-keychain', 12),
            salary_gestora: val('cfg-salary-gestora', 1500),
            gestora_pct: val('cfg-gestora-pct', 8),
            sales_target: val('cfg-sales-target', 50),
        };
        localStorage.setItem('demeni-financial-settings', JSON.stringify(settings));
        renderAll();
        toast('Configurações financeiras salvas!', 'success');
    }

    function loadFinancialSettings() {
        const el = (id, key, def) => {
            const input = document.getElementById(id);
            if (input) input.value = getSetting(key, def);
        };
        el('cfg-salary-vendedor', 'salary_vendedor', 1000);
        el('cfg-salary-suporte', 'salary_suporte', 1500);
        el('cfg-salary-criadora', 'salary_criadora', 1000);
        el('cfg-salary-social-media', 'salary_social_media', 1500);
        el('cfg-commission-rate', 'commission_rate', 15);
        el('cfg-commission-cap', 'commission_cap', 10000);
        el('cfg-bonus-site', 'bonus_site', 3);
        el('cfg-cost-keychain', 'cost_keychain', 12);
        el('cfg-salary-gestora', 'salary_gestora', 1500);
        el('cfg-gestora-pct', 'gestora_pct', 8);
        el('cfg-sales-target', 'sales_target', 50);
    }

    function updateFinancial() {
        if (!document.getElementById('fin-revenue')) return;

        // Render dynamic costs table
        const costsTbody = document.getElementById('fin-costs-tbody');
        if (costsTbody) {
            const fin = getFinancialSettings();
            const fmtC = v => `R$ ${v.toLocaleString('pt-BR')}`;
            const equipe = [
                { name: 'Vendedor (fixo)', val: fin.salVendedor, obs: `Comissão ${Math.round(fin.commRate * 100)}% · Teto R$${fin.commCap.toLocaleString('pt-BR')}` },
                { name: 'Suporte', val: fin.salSuporte, obs: 'Fixo' },
                { name: 'Criadora (fixo)', val: fin.salCriadora, obs: `+ R$${fin.bonusSite}/site` },
                { name: 'Social Media', val: fin.salSocialMedia, obs: 'Fixo' },
                { name: 'Gestora (fixo)', val: fin.salGestora, obs: `+ ${Math.round(fin.gestoraPct * 100)}% do lucro` },
            ].filter(e => e.val > 0);

            const infra = [
                { name: 'Supabase', val: 0, obs: 'Free tier' },
                { name: 'Domínio', val: 3, obs: '~R$36/ano' },
                { name: 'Figma', val: 0, obs: 'Free tier' },
            ];

            const infraTotal = infra.reduce((s, i) => s + i.val, 0);
            const equipeTotal = equipe.reduce((s, e) => s + e.val, 0);
            const totalFixos = equipeTotal + infraTotal;

            let rows = '';
            if (equipe.length > 0) {
                rows += equipe.map((e, i) => `
                    <tr ${i === 0 ? 'style="border-top:2px solid rgba(196,127,59,0.2);"' : ''}>
                        ${i === 0 ? `<td rowspan="${equipe.length}" style="font-weight:700;color:var(--brand-light);vertical-align:top;">👥 Equipe</td>` : ''}
                        <td>${e.name}</td>
                        <td>${fmtC(e.val)}</td>
                        <td style="font-size:11px;color:var(--text-muted);">${e.obs}</td>
                    </tr>`).join('');
            } else {
                rows += `<tr style="border-top:2px solid rgba(196,127,59,0.2);">
                    <td style="font-weight:700;color:var(--brand-light);">👥 Equipe</td>
                    <td colspan="2" style="color:var(--text-muted);font-size:12px;">Nenhum salário configurado</td>
                    <td></td>
                </tr>`;
            }

            rows += infra.map((e, i) => `
                <tr ${i === 0 ? 'style="border-top:2px solid rgba(6,182,212,0.2);"' : ''}>
                    ${i === 0 ? `<td rowspan="${infra.length}" style="font-weight:700;color:#06b6d4;vertical-align:top;">🔧 Infra</td>` : ''}
                    <td>${e.name}</td>
                    <td>${e.val > 0 ? fmtC(e.val) : 'R$ 0'}</td>
                    <td style="font-size:11px;color:var(--text-muted);">${e.obs}</td>
                </tr>`).join('');

            costsTbody.innerHTML = rows;

            const totalEl = document.getElementById('fin-total-costs');
            if (totalEl) totalEl.textContent = fmtC(totalFixos);
        }

        const now = new Date();
        const monthOrders = orders.filter(o => {
            const d = new Date(o.created_at);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        const delivered = monthOrders.filter(o => o.status === 'completed');
        const converted = monthOrders.filter(o => o.status !== 'lead' && o.status !== 'negotiation' && o.status !== 'lost');

        // Revenue = sum of actual payments received this month
        const revenue = orders.reduce((sum, o) => {
            if (!o.payments) return sum;
            return sum + o.payments
                .filter(p => { const d = new Date(p.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
                .reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
        }, 0);

        // Draw-against-commission with cap: vendedor gets max(fixo, min(comissão, teto))
        const fin = getFinancialSettings();
        const vendorCommissionBruta = Math.round(revenue * fin.commRate);
        const vendorCommissionCapped = Math.min(vendorCommissionBruta, fin.commCap);
        const vendorPay = Math.max(fin.salVendedor, vendorCommissionCapped);
        const vendorExtra = vendorPay - fin.salVendedor;
        const criadoraBonus = delivered.length * fin.bonusSite;
        const keychainCosts = delivered.length * fin.costKeychain;
        const baseCosts = fin.fixedCosts + vendorExtra + criadoraBonus + keychainCosts;
        // Gestora: fixo já incluído em fixedCosts, + % do lucro antes da gestora
        const profitBeforeGestora = revenue - baseCosts;
        const gestoraBonus = Math.max(0, Math.round(profitBeforeGestora * fin.gestoraPct));
        const totalCosts = baseCosts + gestoraBonus;
        const profit = revenue - totalCosts;
        const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

        const fmt = (v) => `R$ ${Math.abs(v).toLocaleString('pt-BR')}`;

        // KPIs
        setKPI('fin-revenue', fmt(revenue));

        // Receivable = total sold but not yet paid
        const receivable = converted.reduce((sum, o) => {
            const price = parseFloat(o.price) || 0;
            const paid = getOrderPaid(o);
            return sum + Math.max(price - paid, 0);
        }, 0);
        setKPI('fin-receivable', fmt(receivable));

        setKPI('fin-costs', fmt(totalCosts));
        setKPI('fin-profit', (profit >= 0 ? '' : '- ') + fmt(profit));
        setKPI('fin-margin', margin + '%');

        // BATTLE BAR — proportional: green = revenue, red = costs, both always visible
        const barTotal = revenue + totalCosts || 1;
        const greenPct = (revenue / barTotal) * 100;
        const costPct = (totalCosts / barTotal) * 100;
        const battleGreen = document.getElementById('fin-battle-green');
        const battleRevLabel = document.getElementById('fin-battle-revenue-label');
        const battleCostLabel = document.getElementById('fin-battle-cost-label');
        const battleLabel = document.getElementById('fin-battle-label');
        const battlePct = document.getElementById('fin-battle-percent');
        if (battleGreen) battleGreen.style.width = greenPct + '%';
        if (battleRevLabel) battleRevLabel.textContent = fmt(revenue);
        if (battleCostLabel) battleCostLabel.textContent = fmt(totalCosts);
        if (battleLabel) {
            const costPctOfRevenue = revenue > 0 ? Math.round((totalCosts / revenue) * 100) : 100;
            if (revenue >= totalCosts) {
                battleLabel.textContent = `Custos = ${costPctOfRevenue}% da receita`;
                battleLabel.style.color = '#10b981';
            } else {
                battleLabel.textContent = `Faltam ${fmt(totalCosts - revenue)} pra cobrir`;
                battleLabel.style.color = '#ef4444';
            }
        }
        if (battlePct) battlePct.textContent = Math.round(greenPct) + '% vs ' + Math.round(costPct) + '%';

        // PROFIT DISTRIBUTION SLICES
        const distribProfit = Math.max(profit, 0);
        setKPI('fin-dist-total', fmt(distribProfit));
        const slices = document.querySelectorAll('.fin-slice');
        slices.forEach(slice => {
            const pct = parseInt(slice.dataset.pct) || 0;
            const sliceVal = Math.round(distribProfit * pct / 100);
            const valEl = slice.querySelector('.fin-slice-val');
            const barEl = slice.querySelector('.fin-slice-bar');
            if (valEl) valEl.textContent = fmt(sliceVal);
            if (barEl) barEl.style.width = (distribProfit > 0 ? pct : 0) + '%';
        });

        // ROI by area (distribution-based)
        const roiAreas = [
            { prefix: 'roi-mkt', pct: 15 },
            { prefix: 'roi-ads', pct: 10 },
            { prefix: 'roi-ux', pct: 15 },
            { prefix: 'roi-grow', pct: 15 },
        ];
        roiAreas.forEach(area => {
            const invested = Math.round(distribProfit * area.pct / 100);
            setKPI(area.prefix + '-invest', fmt(invested));
        });

        // Commissions
        setKPI('fin-commission-vendedor', fmt(vendorCommission));
        setKPI('fin-commission-base', converted.length);
        setKPI('fin-bonus-criadora', fmt(criadoraBonus));
        setKPI('fin-bonus-sites', delivered.length);
        setKPI('fin-total-all', fmt(totalCosts));
    }

    // ========== PDF REPORT ==========
    function generateReport() {
        const now = new Date();
        const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const fin = getFinancialSettings();

        // Collect data
        const monthOrders = orders.filter(o => {
            const d = new Date(o.created_at);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        const convertedStatuses = ['briefing', 'production', 'review', 'completed'];
        const converted = monthOrders.filter(o => convertedStatuses.includes(o.status));
        const delivered = monthOrders.filter(o => o.status === 'completed');
        const lost = monthOrders.filter(o => o.status === 'lost');

        const revenue = orders.reduce((sum, o) => {
            if (!o.payments) return sum;
            return sum + o.payments
                .filter(p => { const d = new Date(p.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
                .reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
        }, 0);

        const vendorComm = Math.round(revenue * fin.commRate);
        const criadoraBonus = delivered.length * fin.bonusSite;
        const totalCosts = fin.fixedCosts + vendorComm + criadoraBonus;
        const profit = revenue - totalCosts;
        const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
        const fmt = v => `R$ ${Math.abs(v).toLocaleString('pt-BR')}`;

        // Campaign data
        const sourceLabels = {
            instagram: 'Instagram', facebook: 'Facebook', ads_meta: 'Ads Meta',
            ads_google: 'Google Ads', site: 'Site', indicacao: 'Indicação',
            whatsapp: 'WhatsApp', outro: 'Outro'
        };
        const sources = {};
        orders.forEach(o => {
            const src = o.source || 'outro';
            if (!sources[src]) sources[src] = { leads: 0, conv: 0, rev: 0 };
            sources[src].leads++;
            if (convertedStatuses.includes(o.status)) {
                sources[src].conv++;
                sources[src].rev += parseFloat(o.price) || 0;
            }
        });

        const campaignRows = Object.entries(sources)
            .sort((a, b) => b[1].rev - a[1].rev)
            .map(([src, d]) => `<tr>
                <td>${sourceLabels[src] || src}</td>
                <td>${d.leads}</td><td>${d.conv}</td>
                <td>${d.leads > 0 ? Math.round((d.conv / d.leads) * 100) : 0}%</td>
                <td>${fmt(d.rev)}</td>
            </tr>`).join('');

        // Orders summary
        const orderRows = converted.slice(0, 20).map(o => `<tr>
            <td>${o.client_name}</td>
            <td>${(o.product_type || '').toUpperCase()}</td>
            <td>${fmt(parseFloat(o.price) || 0)}</td>
            <td>${fmt(getOrderPaid(o))}</td>
            <td>${o.production_time_ms ? formatTimer(o.production_time_ms) : '—'}</td>
        </tr>`).join('');

        // Build HTML
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
        <title>Relatório Demeni — ${monthName}</title>
        <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a2e; padding: 40px; background: #fff; }
            h1 { font-size: 24px; color: #c47f3b; margin-bottom: 4px; }
            h2 { font-size: 16px; color: #c47f3b; margin: 24px 0 12px; border-bottom: 2px solid #c47f3b22; padding-bottom: 4px; }
            .subtitle { font-size: 14px; color: #666; margin-bottom: 24px; }
            .kpis { display:grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
            .kpi { background: #f8f9fa; border-radius: 8px; padding: 16px; text-align: center; border: 1px solid #e9ecef; }
            .kpi-val { font-size: 22px; font-weight: 800; color: #1a1a2e; }
            .kpi-lbl { font-size: 11px; color: #888; text-transform: uppercase; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
            th { background: #f8f9fa; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #666; border-bottom: 2px solid #e9ecef; }
            td { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; }
            .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e9ecef; font-size: 11px; color: #999; text-align: center; }
            .green { color: #10b981; } .red { color: #ef4444; }
            @media print { body { padding: 20px; } }
        </style></head><body>
        <h1>📊 Relatório Mensal — Demeni</h1>
        <div class="subtitle">${monthName.charAt(0).toUpperCase() + monthName.slice(1)} · Gerado em ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>

        <div class="kpis">
            <div class="kpi"><div class="kpi-val green">${fmt(revenue)}</div><div class="kpi-lbl">Receita Bruta</div></div>
            <div class="kpi"><div class="kpi-val red">${fmt(totalCosts)}</div><div class="kpi-lbl">Custos Totais</div></div>
            <div class="kpi"><div class="kpi-val" style="color:${profit >= 0 ? '#10b981' : '#ef4444'}">${profit >= 0 ? '' : '-'}${fmt(profit)}</div><div class="kpi-lbl">Lucro Líquido</div></div>
            <div class="kpi"><div class="kpi-val">${margin}%</div><div class="kpi-lbl">Margem</div></div>
        </div>

        <h2>💰 Distribuição de Custos</h2>
        <table>
            <tr><th>Item</th><th>Valor</th></tr>
            <tr><td>Salário Vendedor</td><td>${fmt(fin.salVendedor)}</td></tr>
            <tr><td>Salário Suporte</td><td>${fmt(fin.salSuporte)}</td></tr>
            <tr><td>Salário Criadora</td><td>${fmt(fin.salCriadora)}</td></tr>
            <tr><td>Custos Operacionais</td><td>R$ 995</td></tr>
            <tr><td>Comissão Vendedor (${Math.round(fin.commRate * 100)}%)</td><td>${fmt(vendorComm)}</td></tr>
            <tr><td>Bônus Criadora (${delivered.length} sites × R$ ${fin.bonusSite})</td><td>${fmt(criadoraBonus)}</td></tr>
            <tr style="font-weight:700;border-top:2px solid #1a1a2e;"><td>TOTAL</td><td>${fmt(totalCosts)}</td></tr>
        </table>

        <h2>📊 Performance por Fonte</h2>
        <table>
            <tr><th>Fonte</th><th>Leads</th><th>Conversões</th><th>Taxa</th><th>Receita</th></tr>
            ${campaignRows || '<tr><td colspan="5" style="text-align:center;color:#999;">Sem dados</td></tr>'}
        </table>

        <h2>📋 Resumo de Pedidos (${converted.length} vendas)</h2>
        <table>
            <tr><th>Cliente</th><th>Produto</th><th>Valor</th><th>Pago</th><th>Tempo Prod.</th></tr>
            ${orderRows || '<tr><td colspan="5" style="text-align:center;color:#999;">Sem pedidos</td></tr>'}
        </table>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px;">
            <div class="kpi"><div class="kpi-val">${monthOrders.length}</div><div class="kpi-lbl">Total Leads</div></div>
            <div class="kpi"><div class="kpi-val green">${converted.length}</div><div class="kpi-lbl">Conversões</div></div>
            <div class="kpi"><div class="kpi-val red">${lost.length}</div><div class="kpi-lbl">Perdidos</div></div>
        </div>

        <div class="footer">
            Demeni Sites — Relatório gerado automaticamente pelo Demeni Core<br>
            © ${now.getFullYear()} Demeni · Todos os direitos reservados
        </div>
        </body></html>`;

        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        setTimeout(() => win.print(), 500);
        toast('Relatório gerado! Use Ctrl+P para salvar como PDF.', 'success');
    }

    // ========== METRICS ==========
    function updateMetrics() {
        const delivered = orders.filter(o => o.status === 'completed');
        const lost = orders.filter(o => o.status === 'lost');
        const totalOrders = orders.filter(o => o.status !== 'lost');
        const allWithPrice = delivered.filter(o => parseFloat(o.price) > 0);

        // Total sites
        setKPI('kpi-total-sites', delivered.length);

        // Conversion rate: delivered / (delivered + lost)
        const totalLeads = delivered.length + lost.length;
        const convRate = totalLeads > 0 ? Math.round((delivered.length / totalLeads) * 100) : 0;
        setKPI('kpi-conversion', convRate + '%');

        // Average delivery time (created_at → completed_at or delivered_at)
        const times = delivered.map(o => {
            const start = new Date(o.created_at);
            const end = new Date(o.completed_at || o.delivered_at || o.updated_at);
            return (end - start) / (1000 * 60 * 60 * 24); // days
        }).filter(t => t > 0);
        const avgTime = times.length > 0 ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1) : '-';
        setKPI('kpi-avg-time', avgTime === '-' ? '-' : avgTime + 'd');

        // Total revenue
        const totalRevenue = allWithPrice.reduce((sum, o) => sum + parseFloat(o.price), 0);
        setKPI('kpi-total-revenue', `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`);

        // Lost count
        setKPI('kpi-lost-count', lost.length);

        // Average ticket
        const avgTicket = allWithPrice.length > 0 ? Math.round(totalRevenue / allWithPrice.length) : 0;
        setKPI('kpi-avg-ticket', `R$ ${avgTicket}`);

        // Product performance table
        renderProductMetrics();
        renderCampaigns();
    }

    function renderProductMetrics() {
        const tbody = document.getElementById('metrics-product-body');
        if (!tbody) return;

        const products = ['d1', 'd2', 'd3', 'prime', 'ecommerce', 'saas'];
        const productLabels = { d1: 'D-1', d2: 'D-2', d3: 'D-3', prime: 'Prime-D', ecommerce: 'E-commerce', saas: 'SaaS' };

        const rows = products.map(p => {
            const pOrders = orders.filter(o => o.product_type === p);
            if (pOrders.length === 0) return null;

            const pDelivered = pOrders.filter(o => o.status === 'completed');
            const pLost = pOrders.filter(o => o.status === 'lost');
            const pRevenue = pDelivered.reduce((sum, o) => sum + (parseFloat(o.price) || 0), 0);

            const pTimes = pDelivered.map(o => {
                const s = new Date(o.created_at);
                const e = new Date(o.completed_at || o.delivered_at || o.updated_at);
                return (e - s) / (1000 * 60 * 60 * 24);
            }).filter(t => t > 0);
            const pAvg = pTimes.length > 0 ? (pTimes.reduce((a, b) => a + b, 0) / pTimes.length).toFixed(1) + 'd' : '-';

            return `<tr>
                <td><span class="kanban-card-product">${productLabels[p]}</span></td>
                <td>${pOrders.length}</td>
                <td style="color:var(--status-completed);">${pDelivered.length}</td>
                <td style="color:var(--status-lost);">${pLost.length}</td>
                <td>R$ ${pRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</td>
                <td>${pAvg}</td>
            </tr>`;
        }).filter(Boolean);

        if (rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:30px;">
                Dados aparecerão conforme pedidos forem concluídos
            </td></tr>`;
        } else {
            tbody.innerHTML = rows.join('');
        }
    }

    function renderCampaigns() {
        const tbody = document.getElementById('campaigns-body');
        if (!tbody) return;

        const sourceLabels = {
            instagram: { label: 'Instagram', icon: 'fab fa-instagram', color: '#e4405f' },
            facebook: { label: 'Facebook', icon: 'fab fa-facebook', color: '#1877f2' },
            ads_meta: { label: 'Ads Meta', icon: 'fas fa-ad', color: '#0668e1' },
            ads_google: { label: 'Google Ads', icon: 'fab fa-google', color: '#4285f4' },
            site: { label: 'Site Orgânico', icon: 'fas fa-globe', color: '#10b981' },
            indicacao: { label: 'Indicação', icon: 'fas fa-user-friends', color: '#d4a05a' },
            whatsapp: { label: 'WhatsApp', icon: 'fab fa-whatsapp', color: '#25d366' },
            outro: { label: 'Outro', icon: 'fas fa-ellipsis-h', color: '#6b7280' },
        };

        const convertedStatuses = ['briefing', 'production', 'review', 'completed'];
        const sources = {};

        orders.forEach(o => {
            const src = o.source || 'outro';
            if (!sources[src]) sources[src] = { leads: 0, converted: 0, revenue: 0 };
            sources[src].leads++;
            if (convertedStatuses.includes(o.status)) {
                sources[src].converted++;
                sources[src].revenue += parseFloat(o.price) || 0;
            }
        });

        const rows = Object.entries(sources)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .map(([src, data]) => {
                const s = sourceLabels[src] || sourceLabels.outro;
                const rate = data.leads > 0 ? Math.round((data.converted / data.leads) * 100) : 0;
                const ticket = data.converted > 0 ? Math.round(data.revenue / data.converted) : 0;
                const rateColor = rate >= 50 ? '#10b981' : rate >= 25 ? '#eab308' : '#ef4444';
                return `<tr>
                    <td><div style="display:flex;align-items:center;gap:8px;">
                        <i class="${s.icon}" style="color:${s.color};font-size:16px;"></i>
                        <span style="font-weight:600;">${s.label}</span>
                    </div></td>
                    <td>${data.leads}</td>
                    <td style="color:var(--status-completed);font-weight:600;">${data.converted}</td>
                    <td><span style="color:${rateColor};font-weight:700;">${rate}%</span></td>
                    <td>R$ ${data.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</td>
                    <td>R$ ${ticket.toLocaleString('pt-BR')}</td>
                </tr>`;
            });

        if (rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:30px;">Nenhum dado de campanha ainda</td></tr>`;
        } else {
            tbody.innerHTML = rows.join('');
        }
    }

    function getStatusLabel(status) {
        const labels = {
            lead: 'Lead', negotiation: 'Negociação', briefing: 'Briefing',
            production: 'Produção', review: 'Revisão',
            completed: 'Concluído', lost: 'Perdido',
            // Legacy (pedidos antigos)
            contacted: 'Contatado', meeting: 'Reunião', proposal: 'Proposta',
            converted: 'Convertido', approval: 'Aprovação', adjustments: 'Ajustes',
            delivered: 'Entregue'
        };
        return labels[status] || status;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    }
    // ========== SOCIAL MEDIA CALENDAR ==========
    let posts = JSON.parse(localStorage.getItem('demeni-posts') || '[]');
    let calendarWeekOffset = 0;
    let calendarMonthOffset = 0;
    let calendarDayOffset = 0;
    let calendarView = 'week'; // 'month' | 'week' | 'day'

    function setCalendarView(view) {
        calendarView = view;
        document.querySelectorAll('.cal-view-tab').forEach(btn => {
            const v = btn.textContent.trim().toLowerCase();
            const isActive = (v.includes('mês') && view === 'month') ||
                (v.includes('semana') && view === 'week') ||
                (v.includes('dia') && view === 'day');
            btn.className = isActive ? 'btn btn-sm btn-primary cal-view-tab active' : 'btn btn-sm btn-secondary cal-view-tab';
        });
        renderCalendar();
    }

    function getWeekDates(offset) {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + (offset * 7));
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            dates.push(d);
        }
        return dates;
    }

    const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const PLATFORM_ICONS = {
        instagram: 'fab fa-instagram', facebook: 'fab fa-facebook',
        tiktok: 'fab fa-tiktok', linkedin: 'fab fa-linkedin', stories: 'fas fa-mobile-alt'
    };
    const PLATFORM_COLORS = {
        instagram: '#E1306C', facebook: '#1877F2', tiktok: '#00f2ea', linkedin: '#0A66C2', stories: '#FF6B35'
    };

    function renderPostCard(p) {
        return `<div style="background:${PLATFORM_COLORS[p.platform] || '#c47f3b'}22;
            border-left:3px solid ${PLATFORM_COLORS[p.platform] || '#c47f3b'};
            border-radius:6px;padding:6px 8px;margin-bottom:4px;cursor:pointer;"
            title="${p.caption || p.type}" onclick="event.stopPropagation();Core.openPostActions('${p.id}')">
            <div style="font-size:10px;display:flex;align-items:center;gap:4px;">
                <i class="${PLATFORM_ICONS[p.platform] || 'fas fa-share'}" style="color:${PLATFORM_COLORS[p.platform]};"></i>
                <span style="color:var(--text-secondary);">${p.type}</span>
            </div>
        </div>`;
    }

    function openPostActions(postId) {
        const p = posts.find(x => x.id === postId);
        if (!p) return;
        const existing = document.getElementById('modal-post-actions');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'modal-post-actions';
        modal.innerHTML = `
            <div class="modal" style="max-width:340px;">
                <div class="modal-header">
                    <h3 class="modal-title" style="font-size:15px;">${p.caption || p.type}</h3>
                    <button class="modal-close" onclick="document.getElementById('modal-post-actions').remove()">&times;</button>
                </div>
                <div class="modal-body" style="padding:16px;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
                        <div style="width:36px;height:36px;border-radius:8px;background:${PLATFORM_COLORS[p.platform]}22;display:flex;align-items:center;justify-content:center;">
                            <i class="${PLATFORM_ICONS[p.platform]}" style="color:${PLATFORM_COLORS[p.platform]};font-size:16px;"></i>
                        </div>
                        <div>
                            <div style="font-size:12px;color:var(--text-muted);text-transform:capitalize;">${p.platform} · ${p.type}</div>
                            <div style="font-size:12px;color:var(--text-muted);">${new Date(p.date + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</div>
                        </div>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:8px;">
                        <button class="btn btn-sm btn-secondary" onclick="Core.editPost('${p.id}')" style="width:100%;justify-content:center;">
                            <i class="fas fa-pen"></i> Editar Post
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="Core.duplicatePost('${p.id}')" style="width:100%;justify-content:center;">
                            <i class="fas fa-copy"></i> Duplicar Post
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="Core.deletePost('${p.id}')" style="width:100%;justify-content:center;border-color:var(--status-lost);color:var(--status-lost);">
                            <i class="fas fa-trash"></i> Excluir Post
                        </button>
                    </div>
                </div>
            </div>
        `;
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        document.body.appendChild(modal);
    }

    function editPost(postId) {
        const p = posts.find(x => x.id === postId);
        if (!p) return;
        document.getElementById('modal-post-actions')?.remove();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'modal-edit-post';
        modal.innerHTML = `
            <div class="modal" style="max-width:420px;">
                <div class="modal-header">
                    <h3 class="modal-title">Editar Post</h3>
                    <button class="modal-close" onclick="document.getElementById('modal-edit-post').remove()">&times;</button>
                </div>
                <div class="modal-body" style="padding:16px;">
                    <div class="form-group">
                        <label class="form-label">Data</label>
                        <input type="date" class="form-input" id="edit-post-date" value="${p.date}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Plataforma</label>
                        <select class="form-select" id="edit-post-platform">
                            ${Object.keys(PLATFORM_ICONS).map(k => `<option value="${k}" ${k === p.platform ? 'selected' : ''}>${k.charAt(0).toUpperCase() + k.slice(1)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" id="edit-post-type">
                            ${['Feed', 'Reels', 'Stories', 'Carrossel', 'Vídeo', 'Outro'].map(t => `<option value="${t}" ${t === p.type ? 'selected' : ''}>${t}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Legenda / Descrição</label>
                        <textarea class="form-textarea" id="edit-post-caption" rows="3">${p.caption || ''}</textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary btn-sm" onclick="document.getElementById('modal-edit-post').remove()">Cancelar</button>
                    <button class="btn btn-primary btn-sm" onclick="Core.saveEditPost('${postId}')"><i class="fas fa-check"></i> Salvar</button>
                </div>
            </div>
        `;
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        document.body.appendChild(modal);
    }

    function saveEditPost(postId) {
        const p = posts.find(x => x.id === postId);
        if (!p) return;
        p.date = document.getElementById('edit-post-date').value;
        p.platform = document.getElementById('edit-post-platform').value;
        p.type = document.getElementById('edit-post-type').value;
        p.caption = document.getElementById('edit-post-caption').value.trim();
        localStorage.setItem('demeni-posts', JSON.stringify(posts));
        document.getElementById('modal-edit-post').remove();
        renderCalendar();
        toast('Post atualizado!', 'success');
    }

    function duplicatePost(postId) {
        const p = posts.find(x => x.id === postId);
        if (!p) return;
        const newDate = new Date(p.date + 'T12:00');
        newDate.setDate(newDate.getDate() + 1);
        posts.push({
            ...p,
            id: crypto.randomUUID(),
            date: newDate.toISOString().split('T')[0],
            created_at: new Date().toISOString()
        });
        localStorage.setItem('demeni-posts', JSON.stringify(posts));
        document.getElementById('modal-post-actions')?.remove();
        renderCalendar();
        toast('Post duplicado para o dia seguinte!', 'success');
    }

    function renderCalendar() {
        const grid = document.getElementById('calendar-grid');
        const label = document.getElementById('calendar-week-label');
        if (!grid) return;

        const today = new Date().toDateString();

        if (calendarView === 'month') {
            renderCalendarMonth(grid, label, today);
        } else if (calendarView === 'day') {
            renderCalendarDay(grid, label, today);
        } else {
            renderCalendarWeek(grid, label, today);
        }

        renderPostsList();
    }

    function renderCalendarWeek(grid, label, today) {
        grid.style.gridTemplateColumns = 'repeat(7,1fr)';
        const weekDates = getWeekDates(calendarWeekOffset);
        const startStr = weekDates[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        const endStr = weekDates[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        if (label) label.textContent = `${startStr} — ${endStr}`;

        grid.innerHTML = weekDates.map((date, i) => {
            const dateStr = date.toISOString().split('T')[0];
            const isToday = date.toDateString() === today;
            const dayPosts = posts.filter(p => p.date === dateStr);
            return `
                <div style="background:${isToday ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.02)'};
                    border:1px solid ${isToday ? 'rgba(124,58,237,0.3)' : 'var(--border-card)'};
                    border-radius:12px;padding:12px;min-height:120px;">
                    <div style="text-align:center;margin-bottom:8px;">
                        <div style="font-size:11px;color:var(--text-muted);font-weight:600;">${WEEKDAYS[i]}</div>
                        <div style="font-size:18px;font-weight:700;${isToday ? 'color:var(--brand-light);' : ''}">${date.getDate()}</div>
                    </div>
                    ${dayPosts.length > 0 ? dayPosts.map(p => renderPostCard(p)).join('') : `
                        <div style="text-align:center;padding:12px 0;color:var(--text-muted);font-size:11px;opacity:0.5;">—</div>
                    `}
                </div>
            `;
        }).join('');
    }

    function renderCalendarMonth(grid, label, today) {
        grid.style.gridTemplateColumns = 'repeat(7,1fr)';
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + calendarMonthOffset;
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const monthName = firstDay.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        if (label) label.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

        // Day headers
        let html = WEEKDAYS.map(d => `<div style="text-align:center;font-size:11px;font-weight:600;color:var(--text-muted);padding:6px 0;">${d}</div>`).join('');

        // Offset for first day (Monday=0)
        let startOff = firstDay.getDay() - 1;
        if (startOff < 0) startOff = 6;
        for (let i = 0; i < startOff; i++) {
            html += `<div style="min-height:60px;"></div>`;
        }

        // Days
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const dateObj = new Date(year, month, d);
            const dateStr = dateObj.toISOString().split('T')[0];
            const isToday = dateObj.toDateString() === today;
            const dayPosts = posts.filter(p => p.date === dateStr);
            const dots = dayPosts.slice(0, 3).map(p => `<span style="width:6px;height:6px;border-radius:50%;background:${PLATFORM_COLORS[p.platform] || '#c47f3b'};display:inline-block;"></span>`).join('');

            html += `
                <div style="background:${isToday ? 'rgba(196,127,59,0.12)' : 'rgba(255,255,255,0.02)'};
                    border:1px solid ${isToday ? 'rgba(196,127,59,0.3)' : 'var(--border-card)'};
                    border-radius:8px;padding:6px;min-height:60px;cursor:pointer;"
                    onclick="Core.setCalendarView('day');Core.calendarGoToDate('${dateStr}')">
                    <div style="font-size:13px;font-weight:${isToday ? '700' : '500'};${isToday ? 'color:var(--brand-light);' : ''}">${d}</div>
                    <div style="display:flex;gap:3px;margin-top:4px;flex-wrap:wrap;">${dots}</div>
                    ${dayPosts.length > 3 ? `<div style="font-size:9px;color:var(--text-muted);">+${dayPosts.length - 3}</div>` : ''}
                </div>
            `;
        }
        grid.innerHTML = html;
    }

    function renderCalendarDay(grid, label, today) {
        grid.style.gridTemplateColumns = '1fr';
        const now = new Date();
        const dayDate = new Date(now);
        dayDate.setDate(now.getDate() + calendarDayOffset);
        const dateStr = dayDate.toISOString().split('T')[0];
        const isToday = dayDate.toDateString() === today;

        const dayLabel = dayDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
        if (label) label.textContent = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1);

        const dayPosts = posts.filter(p => p.date === dateStr);

        if (dayPosts.length === 0) {
            grid.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);">
                <i class="fas fa-calendar-day" style="font-size:32px;margin-bottom:12px;opacity:0.3;display:block;"></i>
                Nenhum post agendado para este dia.
            </div>`;
            return;
        }

        grid.innerHTML = dayPosts.map(p => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:16px;
                background:rgba(255,255,255,0.02);border:1px solid var(--border-card);border-radius:12px;margin-bottom:8px;">
                <div style="display:flex;align-items:center;gap:14px;">
                    <div style="width:42px;height:42px;border-radius:10px;background:${PLATFORM_COLORS[p.platform]}22;
                        display:flex;align-items:center;justify-content:center;">
                        <i class="${PLATFORM_ICONS[p.platform]}" style="color:${PLATFORM_COLORS[p.platform]};font-size:18px;"></i>
                    </div>
                    <div>
                        <div style="font-weight:600;font-size:14px;">${p.caption || p.type}</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">
                            <span style="text-transform:capitalize;">${p.platform}</span> · ${p.type}
                        </div>
                    </div>
                </div>
                <div style="display:flex;gap:6px;">
                    <button class="btn btn-sm btn-secondary" onclick="Core.editPost('${p.id}')" title="Editar"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-sm btn-secondary" onclick="Core.duplicatePost('${p.id}')" title="Duplicar"><i class="fas fa-copy"></i></button>
                    <button class="btn btn-sm btn-secondary" onclick="Core.deletePost('${p.id}')" title="Excluir" style="border-color:var(--status-lost);color:var(--status-lost);"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }

    function calendarGoToDate(dateStr) {
        const target = new Date(dateStr + 'T12:00');
        const now = new Date();
        const diffDays = Math.round((target - now) / (1000 * 60 * 60 * 24));
        calendarDayOffset = diffDays;
        renderCalendar();
    }

    function calendarPrev() {
        if (calendarView === 'month') calendarMonthOffset--;
        else if (calendarView === 'day') calendarDayOffset--;
        else calendarWeekOffset--;
        renderCalendar();
    }

    function calendarNext() {
        if (calendarView === 'month') calendarMonthOffset++;
        else if (calendarView === 'day') calendarDayOffset++;
        else calendarWeekOffset++;
        renderCalendar();
    }
    function renderPostsList() {
        const container = document.getElementById('posts-list');
        if (!container) return;

        const upcoming = posts
            .filter(p => new Date(p.date) >= new Date(new Date().toDateString()))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (upcoming.length === 0) {
            container.innerHTML = `<div class="empty-state">
                <i class="fas fa-image"></i>
                <h3>Nenhum post agendado</h3>
                <p>Clique em "Novo Post" para planejar conteúdo.</p>
            </div>`;
            return;
        }

        container.innerHTML = upcoming.map(p => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:14px;border-bottom:1px solid var(--border-card);">
                <div style="display:flex;align-items:center;gap:14px;">
                    <div style="width:36px;height:36px;border-radius:10px;background:${PLATFORM_COLORS[p.platform]}22;
                        display:flex;align-items:center;justify-content:center;">
                        <i class="${PLATFORM_ICONS[p.platform]}" style="color:${PLATFORM_COLORS[p.platform]};font-size:16px;"></i>
                    </div>
                    <div>
                        <div style="font-size:13px;font-weight:600;">${p.caption || p.type}</div>
                        <div style="font-size:11px;color:var(--text-muted);">
                            ${new Date(p.date + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                            · <span style="text-transform:capitalize;">${p.platform}</span>
                            · ${p.type}
                        </div>
                    </div>
                </div>
                <div style="display:flex;gap:6px;">
                    <button class="btn btn-sm btn-secondary" onclick="Core.editPost('${p.id}')" title="Editar"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-sm btn-secondary" onclick="Core.duplicatePost('${p.id}')" title="Duplicar"><i class="fas fa-copy"></i></button>
                    <button class="btn btn-sm btn-secondary" onclick="Core.deletePost('${p.id}')" title="Excluir" style="border-color:var(--status-lost);color:var(--status-lost);"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }

    function savePost() {
        const date = document.getElementById('post-date').value;
        const checkboxes = document.querySelectorAll('#post-platforms input[type="checkbox"]:checked');
        const platforms = Array.from(checkboxes).map(cb => cb.value);
        const type = document.getElementById('post-type').value;
        const caption = document.getElementById('post-caption').value.trim();

        if (!date) return toast('Selecione a data', 'error');
        if (platforms.length === 0) return toast('Selecione pelo menos uma plataforma', 'error');

        // Create one post per selected platform
        platforms.forEach(platform => {
            posts.push({
                id: crypto.randomUUID(),
                date,
                platform,
                type,
                caption,
                created_at: new Date().toISOString()
            });
        });

        localStorage.setItem('demeni-posts', JSON.stringify(posts));
        document.getElementById('form-new-post').reset();
        closeModal('modal-new-post');
        renderCalendar();
        toast(`Post agendado em ${platforms.length} plataforma${platforms.length > 1 ? 's' : ''}!`, 'success');
    }

    function deletePost(postId) {
        if (!confirm('Remover este post?')) return;
        posts = posts.filter(p => p.id !== postId);
        localStorage.setItem('demeni-posts', JSON.stringify(posts));
        renderCalendar();
        toast('Post removido', 'info');
    }

    // ========== INIT ON LOAD ==========
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => init(), 200);

        // Kanban scroll: arrows + wheel + ctrl-drag
        setTimeout(() => {
            const board = document.getElementById('kanban-board');
            if (!board) return;
            const btnL = document.getElementById('kanban-scroll-left');
            const btnR = document.getElementById('kanban-scroll-right');

            function updateArrows() {
                if (!btnL || !btnR) return;
                btnL.style.display = board.scrollLeft > 10 ? 'flex' : 'none';
                btnR.style.display = board.scrollLeft < (board.scrollWidth - board.clientWidth - 10) ? 'flex' : 'none';
            }
            board.addEventListener('scroll', updateArrows);
            setTimeout(updateArrows, 600);

            // CTRL+drag to scroll
            let ctrlHeld = false, isDown = false, startX, scrollL;
            document.addEventListener('keydown', (e) => { if (e.key === 'Control') { ctrlHeld = true; board.style.cursor = 'grab'; } });
            document.addEventListener('keyup', (e) => { if (e.key === 'Control') { ctrlHeld = false; isDown = false; board.style.cursor = ''; } });
            board.addEventListener('mousedown', (e) => { if (!ctrlHeld) return; isDown = true; board.style.cursor = 'grabbing'; startX = e.pageX; scrollL = board.scrollLeft; e.preventDefault(); });
            board.addEventListener('mouseup', () => { isDown = false; if (ctrlHeld) board.style.cursor = 'grab'; });
            board.addEventListener('mouseleave', () => { isDown = false; });
            board.addEventListener('mousemove', (e) => { if (!isDown || !ctrlHeld) return; e.preventDefault(); board.scrollLeft = scrollL - (e.pageX - startX); });
        }, 500);
    });

    // ========== PAYMENTS ==========
    function getOrderPaid(order) {
        if (!order.payments || !order.payments.length) return 0;
        return order.payments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    }

    // ========== ORDER DETAIL ==========
    function openOrderDetail(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const sourceLabels = { instagram: '📱 Instagram', facebook: '📘 Facebook', ads_meta: '📢 Anúncio Meta', ads_google: '🔍 Google Ads', indicacao: '🤝 Indicação', rua: '🚶 Rua', whatsapp: '💬 WhatsApp', influencer: '⭐ Influenciador', site: '🌐 Site', outro: '📎 Outro' };
        const methodLabels = { pix: '⚡ PIX', cartao: '💳 Cartão', dinheiro: '💵 Dinheiro', boleto: '📄 Boleto', transferencia: '🏦 Transferência' };

        const paid = getOrderPaid(order);
        const price = parseFloat(order.price) || 0;
        const remaining = Math.max(price - paid, 0);
        const paidPct = price > 0 ? Math.min((paid / price) * 100, 100) : 0;
        const paymentColor = paid >= price ? '#10b981' : paid > 0 ? '#eab308' : '#ef4444';

        const paymentHistory = (order.payments || []).map(p => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:rgba(16,185,129,0.05);border-radius:6px;font-size:12px;">
                <span>${methodLabels[p.method] || p.method} ${p.notes ? '· ' + p.notes : ''}</span>
                <span style="font-weight:700;color:#10b981;">R$ ${parseFloat(p.amount).toFixed(0)}</span>
            </div>
        `).join('') || '<div style="font-size:12px;color:var(--text-muted);text-align:center;padding:8px;">Nenhum pagamento registrado</div>';

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'modal-order-detail';
        modal.innerHTML = `
            <div class="modal" style="max-width:520px;">
                <div class="modal-header">
                    <h3 class="modal-title">${order.client_name}</h3>
                    <button class="modal-close" onclick="document.getElementById('modal-order-detail').remove()">&times;</button>
                </div>
                <div class="modal-body" style="padding:20px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
                        <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border-card);border-radius:8px;padding:12px;">
                            <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;">Produto</div>
                            <div style="font-size:16px;font-weight:700;margin-top:2px;">${(order.product_type || '').toUpperCase()}</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border-card);border-radius:8px;padding:12px;">
                            <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;">Status</div>
                            <div style="margin-top:4px;"><span class="status-badge ${order.status}">${getStatusLabel(order.status)}</span></div>
                        </div>
                    </div>

                    <!-- Payment Section -->
                    <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border-card);border-radius:10px;padding:14px;margin-bottom:16px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                            <span style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:600;">💰 Pagamento</span>
                            <span style="font-size:13px;font-weight:700;color:${paymentColor};">R$ ${paid} / R$ ${price}</span>
                        </div>
                        <div style="height:8px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden;margin-bottom:8px;">
                            <div style="height:100%;width:${paidPct}%;background:${paymentColor};border-radius:4px;transition:width 0.4s;"></div>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;margin-bottom:10px;">
                            <span style="color:var(--text-muted);">${paid >= price ? '✅ Pago completo' : remaining > 0 ? `Faltam R$ ${remaining}` : ''}</span>
                            <span style="color:var(--text-muted);">${Math.round(paidPct)}%</span>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:10px;">
                            ${paymentHistory}
                        </div>
                        ${paid < price ? `<button class="btn btn-sm btn-primary" onclick="Core.openPaymentModal('${order.id}')" style="width:100%;justify-content:center;background:linear-gradient(135deg,#10b981,#059669);">
                            <i class="fas fa-plus"></i> Registrar Pagamento
                        </button>` : ''}
                    </div>

                    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
                        <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-muted);"><i class="fas fa-tag"></i> Origem: ${sourceLabels[order.source] || order.source || '—'}</div>
                        ${order.client_phone ? `<div style="display:flex;align-items:center;gap:8px;font-size:13px;"><i class="fab fa-whatsapp" style="color:#25d366;"></i> <a href="https://wa.me/55${order.client_phone.replace(/\D/g, '')}" target="_blank" style="color:var(--text-secondary);">${order.client_phone}</a></div>` : ''}
                        ${order.client_instagram ? `<div style="display:flex;align-items:center;gap:8px;font-size:13px;"><i class="fab fa-instagram" style="color:#e4405f;"></i> ${order.client_instagram}</div>` : ''}
                        <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-muted);"><i class="fas fa-calendar"></i> ${formatDate(order.created_at)}</div>
                        ${order.production_time_ms ? `<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#f97316;"><i class="fas fa-stopwatch"></i> Tempo de produção: ${formatTimer(order.production_time_ms)}</div>` : ''}
                    </div>
                    ${order.notes ? `<div style="background:rgba(255,255,255,0.02);border:1px solid var(--border-card);border-radius:8px;padding:12px;font-size:13px;color:var(--text-secondary);margin-bottom:12px;"><strong style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">Notas</strong><br>${order.notes}</div>` : ''}
                    ${order.briefing && (order.briefing.business_type || order.briefing.slogan || order.briefing.about) ? `
                    <div style="background:rgba(124,58,237,0.05);border:1px solid rgba(124,58,237,0.2);border-radius:10px;padding:14px;font-size:13px;">
                        <div style="font-size:11px;color:var(--brand-light);text-transform:uppercase;font-weight:700;margin-bottom:8px;">🎨 Briefing</div>
                        ${order.briefing.business_type ? `<div style="margin-bottom:6px;"><strong>Negócio:</strong> ${order.briefing.business_type}</div>` : ''}
                        ${order.briefing.color1 ? `<div style="margin-bottom:6px;display:flex;align-items:center;gap:6px;"><strong>Cores:</strong> <span style="width:18px;height:18px;border-radius:4px;background:${order.briefing.color1};display:inline-block;"></span> <span style="width:18px;height:18px;border-radius:4px;background:${order.briefing.color2};display:inline-block;"></span> ${order.briefing.colors_text || ''}</div>` : ''}
                        ${order.briefing.slogan ? `<div style="margin-bottom:6px;"><strong>Slogan:</strong> <em>"${order.briefing.slogan}"</em></div>` : ''}
                        ${order.briefing.about ? `<div style="margin-bottom:6px;"><strong>Sobre:</strong> ${order.briefing.about}</div>` : ''}
                        ${order.briefing.services ? `<div style="margin-bottom:6px;"><strong>Serviços:</strong> ${order.briefing.services}</div>` : ''}
                        ${order.briefing.references ? `<div><strong>Referências:</strong> ${order.briefing.references}</div>` : ''}
                    </div>` : ''}
                    ${(() => {
                // ATTACHMENTS SECTION
                const attachments = order.attachments || [];
                const images = attachments.filter(a => a.type === 'image');
                const links = attachments.filter(a => a.type === 'link');
                return `
                        <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border-card);border-radius:10px;padding:14px;margin-bottom:12px;margin-top:12px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                                <span style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:700;">📎 Anexos (${attachments.length})</span>
                                <div style="display:flex;gap:4px;">
                                    <button class="btn btn-sm" onclick="event.stopPropagation();Core.addAttachment('${order.id}')" style="font-size:11px;padding:4px 8px;">
                                        <i class="fas fa-image"></i> Imagem
                                    </button>
                                    <button class="btn btn-sm" onclick="event.stopPropagation();Core.addLinkAttachment('${order.id}')" style="font-size:11px;padding:4px 8px;">
                                        <i class="fas fa-link"></i> Link
                                    </button>
                                </div>
                            </div>
                            ${images.length > 0 ? `<div class="attach-grid">
                                ${images.map((img, i) => {
                    const idx = attachments.indexOf(img);
                    return `<div style="position:relative;">
                                        <img class="attach-thumb" src="${img.url}" onclick="event.stopPropagation();Core.openLightbox('${img.url.replace(/'/g, "\\'")}')" title="${img.name}">
                                        <span onclick="event.stopPropagation();Core.removeAttachment('${order.id}',${idx})" style="position:absolute;top:2px;right:4px;cursor:pointer;font-size:14px;color:#ef4444;opacity:0.7;background:rgba(0,0,0,0.6);border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;" title="Remover">&times;</span>
                                    </div>`;
                }).join('')}
                            </div>` : ''}
                            ${links.length > 0 ? `<div style="display:flex;flex-direction:column;gap:4px;${images.length > 0 ? 'margin-top:8px;' : ''}">
                                ${links.map((lnk, i) => {
                    const idx = attachments.indexOf(lnk);
                    return `<div style="display:flex;align-items:center;gap:6px;">
                                        <a href="${lnk.url}" target="_blank" class="attach-link" style="flex:1;" onclick="event.stopPropagation();">
                                            <i class="fas fa-external-link-alt"></i> ${lnk.name}
                                        </a>
                                        <span onclick="event.stopPropagation();Core.removeAttachment('${order.id}',${idx})" style="cursor:pointer;color:#ef4444;opacity:0.6;font-size:14px;" title="Remover">&times;</span>
                                    </div>`;
                }).join('')}
                            </div>` : ''}
                            ${attachments.length === 0 ? '<div style="font-size:12px;color:var(--text-muted);text-align:center;padding:8px;">Nenhum anexo</div>' : ''}
                        </div>`;
            })()}
                    ${(() => {
                // CHECKLIST SECTION
                const items = getChecklist(order);
                const pct = getChecklistProgress(order);
                return `
                        <div style="background:rgba(16,185,129,0.03);border:1px solid rgba(16,185,129,0.15);border-radius:10px;padding:14px;margin-bottom:12px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                                <span style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:700;">✅ Checklist do Briefing</span>
                                <span style="font-size:12px;font-weight:700;color:#10b981;">${pct}%</span>
                            </div>
                            <div class="checklist-progress" style="margin-bottom:10px;">
                                <div class="checklist-progress-bar" style="width:${pct}%"></div>
                            </div>
                            ${items.map(item => `
                                <div class="checklist-item ${item.done ? 'done' : ''}" onclick="event.stopPropagation();Core.toggleChecklistItem('${order.id}','${item.key}')">
                                    <i class="fas ${item.done ? 'fa-check-square' : 'fa-square'}"></i>
                                    <span>${item.label}</span>
                                </div>
                            `).join('')}
                        </div>`;
            })()}
                    ${order.activity_log && order.activity_log.length > 0 ? `
                    <div style="margin-top:12px;">
                        <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:700;margin-bottom:8px;">📜 Histórico</div>
                        <div style="max-height:180px;overflow-y:auto;font-size:12px;">
                            ${order.activity_log.slice(-10).reverse().map(a => `
                                <div style="display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid var(--border-card);">
                                    <i class="fas fa-circle" style="font-size:5px;margin-top:6px;color:var(--brand-light);"></i>
                                    <div>
                                        <span style="font-weight:600;">${getStatusLabel(a.from)}</span>
                                        <i class="fas fa-arrow-right" style="font-size:8px;color:var(--text-muted);margin:0 4px;"></i>
                                        <span class="status-badge ${a.to}" style="font-size:10px;">${getStatusLabel(a.to)}</span>
                                        <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">
                                            ${new Date(a.at).toLocaleDateString('pt-BR')} ${new Date(a.at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · ${a.by}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>` : ''}
                </div >
    <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('modal-order-detail').remove()">Fechar</button>
        <button class="btn btn-primary btn-sm" onclick="Core.editOrder('${order.id}')"><i class="fas fa-pen"></i> Editar</button>
    </div>
            </div >
    `;
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        document.body.appendChild(modal);
    }

    function openPaymentModal(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        const price = parseFloat(order.price) || 0;
        const paid = getOrderPaid(order);
        const remaining = Math.max(price - paid, 0);
        const halfVal = Math.round(price / 2);
        const suggestedAmount = paid === 0 ? halfVal : remaining;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'modal-payment';
        modal.style.zIndex = '1001';
        modal.innerHTML = `
    < div class="modal" style = "max-width:400px;" >
                <div class="modal-header">
                    <h3 class="modal-title">Registrar Pagamento</h3>
                    <button class="modal-close" onclick="document.getElementById('modal-payment').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom:16px;padding:10px;background:rgba(16,185,129,0.06);border-radius:8px;font-size:13px;">
                        <strong>${order.client_name}</strong> · R$ ${paid} de R$ ${price} pago
                        ${remaining > 0 ? ` · Faltam R$ ${remaining}` : ''}
                    </div>
                    <div class="form-group">
                        <label class="form-label">Valor (R$)</label>
                        <input type="number" class="form-input" id="pay-amount" value="${suggestedAmount}" step="0.01" min="0">
                        ${paid === 0 && price > 0 ? `<div style="display:flex;gap:6px;margin-top:6px;">
                            <button class="btn btn-sm btn-secondary" onclick="document.getElementById('pay-amount').value=${halfVal}" style="font-size:11px;">50% (R$ ${halfVal})</button>
                            <button class="btn btn-sm btn-secondary" onclick="document.getElementById('pay-amount').value=${price}" style="font-size:11px;">100% (R$ ${price})</button>
                        </div>` : ''}
                    </div>
                    <div class="form-group">
                        <label class="form-label">Forma de Pagamento</label>
                        <select class="form-select" id="pay-method" onchange="document.getElementById('pay-link-group').style.display=this.value==='mercadopago'?'block':'none'">
                            <option value="pix">⚡ PIX</option>
                            <option value="cartao">💳 Cartão</option>
                            <option value="dinheiro">💵 Dinheiro</option>
                            <option value="boleto">📄 Boleto</option>
                            <option value="transferencia">🏦 Transferência</option>
                            <option value="mercadopago">💙 Mercado Pago</option>
                        </select>
                    </div>
                    <div class="form-group" id="pay-link-group" style="display:none;">
                        <label class="form-label">Link de Pagamento</label>
                        <input class="form-input" id="pay-link" placeholder="https://mpago.la/..." value="${order.payment_link || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Observação (opcional)</label>
                        <input class="form-input" id="pay-notes" placeholder="Ex: 1ª parcela, entrada...">
                    </div>
                    ${order.client_phone ? `
                    <button class="btn btn-sm btn-secondary" onclick="Core.sendPaymentLink('${order.id}')" style="width:100%;justify-content:center;margin-bottom:8px;color:#25d366;border-color:#25d36644;">
                        <i class="fab fa-whatsapp"></i> Enviar cobrança via WhatsApp
                    </button>` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary btn-sm" onclick="document.getElementById('modal-payment').remove()">Cancelar</button>
                    <button class="btn btn-primary btn-sm" onclick="Core.savePayment('${order.id}')" style="background:linear-gradient(135deg,#10b981,#059669);"><i class="fas fa-check"></i> Confirmar</button>
                </div>
            </div >
    `;
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        document.body.appendChild(modal);
    }

    // Show/hide link field for Mercado Pago — called after modal open
    // (toggle is handled via inline event since modal is dynamic)

    function sendPaymentLink(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (!order || !order.client_phone) return;

        const amount = document.getElementById('pay-amount')?.value || '';
        const link = document.getElementById('pay-link')?.value || order.payment_link || '';
        const phone = order.client_phone.replace(/\D/g, '');

        if (link) {
            order.payment_link = link;
            saveOrdersLocal();
        }

        const msg = `Olá ${order.client_name} ! 😊\n\nSeguem os dados para pagamento: \n\n💰 Valor: R$ ${amount} \n${link ? `\n🔗 Link de pagamento:\n${link}\n` : ''} \nQualquer dúvida, estou à disposição!\n\n— Equipe Demeni 💜`;

        window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, '_blank');
        toast('WhatsApp aberto com link de pagamento!', 'success');
    }

    function savePayment(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        const amount = parseFloat(document.getElementById('pay-amount').value);
        const method = document.getElementById('pay-method').value;
        const notes = document.getElementById('pay-notes').value.trim();
        if (!amount || amount <= 0) return toast('Informe o valor', 'error');
        if (!order.payments) order.payments = [];
        const link = document.getElementById('pay-link')?.value || '';
        if (link) order.payment_link = link;
        order.payments.push({ amount, method, notes, date: new Date().toISOString() });
        order.updated_at = new Date().toISOString();
        saveOrdersLocal();
        document.getElementById('modal-payment').remove();
        document.getElementById('modal-order-detail')?.remove();
        openOrderDetail(orderId); // reopen with updated payments
        renderAll();
        toast(`Pagamento de R$ ${amount} registrado!`, 'success');
    }

    // ========== PUBLIC API ==========
    return {
        navigate,
        openModal,
        closeModal,
        openOrderDetail,
        addAttachment,
        addLinkAttachment,
        removeAttachment,
        toggleChecklistItem,
        openLightbox,
        editOrder,
        saveEditOrder,
        switchOrderTab,
        openPaymentModal,
        savePayment,
        openNewLead: () => openModal('modal-new-order'),
        handleDragOver,
        handleDrop,
        toggleKanbanSort,
        cycleDashboardSort,
        setDashboardPeriod,
        toggleVerMais,
        toast,
        // Panel actions
        advanceLead,
        loseLead,
        startProduction,
        sendForApproval,
        moveToBriefing,
        approveOrder,
        requestAdjustments,
        completeOrder,
        copyTracking: (token) => {
            navigator.clipboard.writeText(token).then(() => {
                toast(`Código copiado: ${token}`, 'success');
            }).catch(() => {
                prompt('Copie o código:', token);
            });
        },
        // Calendar
        calendarPrev,
        calendarNext,
        setCalendarView,
        calendarGoToDate,
        savePost,
        deletePost,
        openPostActions,
        editPost,
        saveEditPost,
        duplicatePost,
        // WhatsApp Templates
        copyWaTemplate,
        previewWaTemplate,
        sendWaToClient,
        updateWaSendPreview: () => { },
        // Financial Settings
        saveFinancialSettings,
        saveIntegrationSettings,
        generateReport,
        sendPaymentLink,
        // Settings
        exportData: () => {
            const data = {
                orders,
                posts,
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `demeni-core-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast('Dados exportados!', 'success');
        },
        clearLocalData: () => {
            if (!confirm('Limpar todos os dados locais? (Dados no Supabase permanecem)')) return;
            localStorage.removeItem('demeni-orders');
            localStorage.removeItem('demeni-posts');
            orders = [];
            posts = [];
            renderAll();
            toast('Cache local limpo!', 'info');
        },
        seedOrders: (count = 60) => {
            const fNames = ['João', 'Maria', 'Carlos', 'Ana', 'Pedro', 'Lucas', 'Juliana', 'Bruno', 'Fernanda', 'Rafael', 'Larissa', 'Thiago', 'Camila', 'Diego', 'Patrícia', 'Anderson', 'Gabriela', 'Marcos', 'Beatriz', 'Leandro', 'Silvana', 'Roberto', 'Letícia', 'Gustavo', 'Adriana', 'Felipe', 'Renata', 'Matheus', 'Cristiane', 'Leonardo', 'Sandra', 'Daniel', 'Mariana', 'Paulo', 'Vanessa', 'Eduardo', 'Aline', 'Alexandre', 'Tatiana', 'Ricardo', 'Claudia', 'Fabrício', 'Priscila', 'Hugo', 'Michele', 'Vicente', 'Carla', 'Ronaldo', 'Luciana', 'Renan', 'Simone', 'Igor', 'Elisa', 'Maurício', 'Natália', 'Jonas', 'Débora', 'Otávio', 'Helena', 'Willian'];
            const lNames = ['Silva', 'Santos', 'Oliveira', 'Costa', 'Souza', 'Pereira', 'Lima', 'Ferreira', 'Rodrigues', 'Almeida', 'Nascimento', 'Araújo', 'Melo', 'Barbosa', 'Ribeiro', 'Cardoso', 'Gomes', 'Lopes', 'Moreira', 'Martins'];
            const srcs = ['instagram', 'facebook', 'ads_meta', 'indicacao', 'rua', 'whatsapp', 'influencer', 'site', 'ads_google', 'outro'];
            const sts = ['lead', 'negotiation', 'briefing', 'production', 'review', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed'];
            const methods = ['pix', 'pix', 'pix', 'cartao', 'dinheiro'];
            for (let i = 0; i < count; i++) {
                const isD1 = Math.random() < 0.4;
                const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * 28));
                const price = isD1 ? 150 : 250;
                const half = Math.round(price / 2);
                const status = sts[Math.floor(Math.random() * sts.length)];
                const method = methods[Math.floor(Math.random() * methods.length)];

                // Generate payments based on status
                let payments = [];
                const paidStatuses = ['briefing', 'production', 'review', 'completed'];
                const fullPaidStatuses = ['completed'];
                if (paidStatuses.includes(status)) {
                    payments.push({ amount: half, method, notes: 'Entrada 50%', date: d.toISOString() });
                    if (fullPaidStatuses.includes(status)) {
                        const d2 = new Date(d); d2.setDate(d2.getDate() + Math.floor(Math.random() * 10) + 3);
                        payments.push({ amount: price - half, method, notes: '2ª parcela', date: d2.toISOString() });
                    }
                }

                orders.push({
                    id: crypto.randomUUID(),
                    tracking_token: crypto.randomUUID().replace(/-/g, '').substring(0, 16),
                    client_name: fNames[i % fNames.length] + ' ' + lNames[Math.floor(Math.random() * lNames.length)],
                    client_phone: '(83) 9 ' + String(Math.floor(Math.random() * 9000) + 1000) + '-' + String(Math.floor(Math.random() * 9000) + 1000),
                    client_email: '',
                    client_instagram: '@' + fNames[i % fNames.length].toLowerCase(),
                    product_type: isD1 ? 'd1' : 'd2',
                    price: price,
                    source: srcs[Math.floor(Math.random() * srcs.length)],
                    status: status,
                    payments: payments,
                    notes: '',
                    vendedor_id: null,
                    created_at: d.toISOString(),
                    updated_at: d.toISOString(),
                });
            }
            saveOrdersLocal();
            renderAll();
            toast(`${count} pedidos gerados com pagamentos!`, 'success');
        },
    };
})();

window.Core = Core;
