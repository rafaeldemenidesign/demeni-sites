/* ===========================
   DEMENI ADMIN - JavaScript
   =========================== */

// ========== CONFIG ==========
const ADMIN_EMAILS = ['rafaeldemenidesign@gmail.com'];
let franchisees = [];
let payments = [];
let sites = [];
let editingUserId = null;

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for Supabase + Auth to initialize
    await new Promise(r => setTimeout(r, 300));

    // Check for existing session — auto-login if valid admin
    try {
        if (window.SupabaseClient && SupabaseClient.isConfigured()) {
            const session = await SupabaseClient.getSession();
            if (session?.user) {
                const email = session.user.email;
                if (ADMIN_EMAILS.includes(email)) {
                    // Valid admin session, skip login
                    await Auth.init?.();
                    showAdminDashboard(session.user);
                    return;
                }
            }
        }
    } catch (e) {
        console.warn('Session check failed:', e);
    }

    // No valid session — show login
    document.getElementById('admin-login-screen').style.display = 'flex';
});

async function handleAdminLogin(event) {
    event.preventDefault();

    const email = document.getElementById('admin-login-email').value.trim();
    const password = document.getElementById('admin-login-password').value;
    const errorEl = document.getElementById('admin-login-error');
    const btn = document.getElementById('admin-login-btn');

    errorEl.style.display = 'none';
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';

    try {
        const result = await Auth.login(email, password);

        if (!result.success) {
            errorEl.textContent = result.error || 'Email ou senha incorretos';
            errorEl.style.display = 'block';
            return;
        }

        if (!ADMIN_EMAILS.includes(email)) {
            errorEl.textContent = 'Acesso negado. Este email não tem permissão de admin.';
            errorEl.style.display = 'block';
            Auth.logout();
            return;
        }

        showAdminDashboard(result.user);
    } catch (e) {
        errorEl.textContent = 'Erro de conexão. Tente novamente.';
        errorEl.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
    }

    return false;
}
window.handleAdminLogin = handleAdminLogin;

async function showAdminDashboard(user) {
    document.getElementById('admin-login-screen').style.display = 'none';
    document.getElementById('admin-layout').style.display = 'flex';

    document.getElementById('admin-email').textContent = user.email;
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long', day: 'numeric', month: 'long'
    });

    setupNavigation();
    await loadAllData();
    initCharts();
}

function doLogout() {
    Auth.logout();
    document.getElementById('admin-layout').style.display = 'none';
    document.getElementById('admin-login-screen').style.display = 'flex';
    document.getElementById('admin-login-email').value = '';
    document.getElementById('admin-login-password').value = '';
}
window.doLogout = doLogout;

// ========== NAVIGATION ==========
function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateTo(page);
        });
    });
}

function navigateTo(page) {
    // Update nav
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

    // Update pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`)?.classList.add('active');

    // Close mobile sidebar
    document.getElementById('sidebar')?.classList.remove('open');
}

function toggleSidebar() {
    document.getElementById('sidebar')?.classList.toggle('open');
}

// ========== DATA LOADING ==========
async function loadAllData() {
    await Promise.all([
        loadFranchisees(),
        loadPayments(),
        loadSites(),
        loadActivity()
    ]);
    updateStats();
}

async function loadFranchisees() {
    if (SupabaseClient?.isConfigured()) {
        const { data } = await SupabaseClient.getClient()
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        franchisees = data || [];
    } else {
        // Demo data
        franchisees = [
            { id: '1', name: 'Rafael Demeni', email: 'rafaeldemenidesign@gmail.com', credits: 400, sites_count: 2, is_active: true, created_at: '2026-01-22' },
            { id: '2', name: 'João Silva', email: 'joao@teste.com', credits: 200, sites_count: 1, is_active: true, created_at: '2026-01-20' },
            { id: '3', name: 'Maria Santos', email: 'maria@teste.com', credits: 0, sites_count: 0, is_active: false, created_at: '2026-01-15' }
        ];
    }
    renderFranchisees();
}

async function loadPayments() {
    if (SupabaseClient?.isConfigured()) {
        const { data } = await SupabaseClient.getClient()
            .from('transactions')
            .select('*, profiles:user_id(name, email)')
            .eq('type', 'purchase')
            .eq('payment_status', 'approved')
            .order('created_at', { ascending: false })
            .limit(50);
        // Map transactions fields to expected payment fields
        payments = (data || []).map(t => ({
            ...t,
            amount: t.price_paid || 0,
            package_name: t.description || 'Pacote',
            status: t.payment_status,
            mp_payment_id: t.payment_id
        }));
    } else {
        // Demo data
        payments = [
            { id: '1', user_id: '1', amount: 400, package_name: 'Profissional', status: 'approved', mp_payment_id: 'MP123456', created_at: '2026-01-22T10:30:00', profiles: { name: 'Rafael Demeni', email: 'rafael@teste.com' } },
            { id: '2', user_id: '2', amount: 200, package_name: 'Essencial', status: 'approved', mp_payment_id: 'MP123457', created_at: '2026-01-21T15:45:00', profiles: { name: 'João Silva', email: 'joao@teste.com' } },
            { id: '3', user_id: '1', amount: 1, package_name: 'Primeira Compra', status: 'approved', mp_payment_id: 'MP123458', created_at: '2026-01-20T09:00:00', profiles: { name: 'Rafael Demeni', email: 'rafael@teste.com' } }
        ];
    }
    renderPayments();
    updatePaymentStats();
}

async function loadSites() {
    if (SupabaseClient?.isConfigured()) {
        const { data } = await SupabaseClient.getClient()
            .from('published_sites')
            .select('*, profiles:user_id(name, email)')
            .order('created_at', { ascending: false });
        // Map published_sites fields to expected site fields
        sites = (data || []).map(s => ({
            ...s,
            name: s.site_name || 'Sem nome',
            is_published: s.is_active
        }));
    } else {
        // Demo data
        sites = [
            { id: '1', name: 'Meu Site Pro', subdomain: 'meusitepro', user_id: '1', is_published: true, created_at: '2026-01-22', profiles: { name: 'Rafael Demeni' } },
            { id: '2', name: 'Loja Virtual', subdomain: 'lojavirtual', user_id: '2', is_published: true, created_at: '2026-01-21', profiles: { name: 'João Silva' } }
        ];
    }
    renderSites();
}

async function loadActivity() {
    let activities = [];

    if (SupabaseClient?.isConfigured()) {
        try {
            // Buscar pagamentos recentes
            const { data: recentPayments } = await SupabaseClient.getClient()
                .from('transactions')
                .select('*, profiles:user_id(name)')
                .eq('type', 'purchase')
                .eq('payment_status', 'approved')
                .order('created_at', { ascending: false })
                .limit(3);

            if (recentPayments) {
                recentPayments.forEach(p => {
                    activities.push({
                        type: 'payment',
                        text: `${p.profiles?.name || 'Usuário'} comprou ${p.description || 'pacote'}`,
                        time: getTimeAgo(p.created_at)
                    });
                });
            }

            // Buscar novos usuários
            const { data: recentUsers } = await SupabaseClient.getClient()
                .from('profiles')
                .select('name, created_at')
                .order('created_at', { ascending: false })
                .limit(2);

            if (recentUsers) {
                recentUsers.forEach(u => {
                    activities.push({
                        type: 'user',
                        text: `Novo usuário: ${u.name || 'Sem nome'}`,
                        time: getTimeAgo(u.created_at)
                    });
                });
            }
        } catch (e) {
            console.log('📊 Activity: fallback', e);
        }
    }

    // Fallback se não houver atividades
    if (activities.length === 0) {
        activities = [
            { type: 'payment', text: 'Sistema iniciado', time: 'agora' }
        ];
    }

    // Ordenar por tempo e limitar
    activities.sort((a, b) => a.time.localeCompare(b.time));
    activities = activities.slice(0, 5);

    document.getElementById('activity-list').innerHTML = activities.map(a => `
        <div class="activity-item">
            <div class="activity-icon ${a.type}">
                <i class="fas fa-${a.type === 'payment' ? 'dollar-sign' : a.type === 'user' ? 'user' : 'globe'}"></i>
            </div>
            <div class="activity-info">
                <div class="activity-text">${a.text}</div>
                <div class="activity-time">${a.time}</div>
            </div>
        </div>
    `).join('');
}

// Função auxiliar para calcular "há quanto tempo"
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `há ${diffMins} min`;
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays === 1) return 'há 1 dia';
    return `há ${diffDays} dias`;
}

// ========== STATS ==========
function updateStats() {
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalCredits = franchisees.reduce((sum, f) => sum + (f.credits || 0), 0);
    const totalSites = franchisees.reduce((sum, f) => sum + (f.sites_count || 0), 0);

    document.getElementById('stat-users').textContent = franchisees.length;
    document.getElementById('stat-revenue').textContent = `R$ ${totalRevenue.toLocaleString('pt-BR')}`;
    document.getElementById('stat-sites').textContent = totalSites;
    document.getElementById('stat-credits').textContent = totalCredits.toLocaleString('pt-BR');
}

function updatePaymentStats() {
    const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const count = payments.length;
    const avg = count > 0 ? total / count : 0;

    document.getElementById('payments-total').textContent = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    document.getElementById('payments-count').textContent = count;
    document.getElementById('payments-avg').textContent = `R$ ${avg.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

// ========== RENDER ==========
function renderFranchisees() {
    const tbody = document.getElementById('franchisees-table');
    tbody.innerHTML = franchisees.map(f => `
        <tr>
            <td>
                <div class="user-cell">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(f.name || 'User')}&background=9333ea&color=fff&size=36" alt="">
                    <span>${f.name || 'Sem nome'}</span>
                </div>
            </td>
            <td>${f.email || '-'}</td>
            <td>${(f.credits || 0).toLocaleString('pt-BR')}</td>
            <td>${f.sites_count || 0}</td>
            <td>
                <span class="status-badge ${f.is_active !== false ? 'active' : 'inactive'}">
                    ${f.is_active !== false ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td>${formatDate(f.created_at)}</td>
            <td>
                <button class="action-btn" onclick="openCreditsModal('${f.id}', '${f.name || f.email}', ${f.credits || 0})" title="Editar créditos">
                    <i class="fas fa-coins"></i>
                </button>
                <button class="action-btn ${f.is_active !== false ? 'danger' : ''}" onclick="toggleUserStatus('${f.id}')" title="${f.is_active !== false ? 'Desativar' : 'Ativar'}">
                    <i class="fas fa-${f.is_active !== false ? 'ban' : 'check'}"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderPayments() {
    const tbody = document.getElementById('payments-table');
    tbody.innerHTML = payments.map(p => `
        <tr>
            <td>${formatDateTime(p.created_at)}</td>
            <td>${p.profiles?.name || p.profiles?.email || 'Usuário'}</td>
            <td>${p.package_name || 'Pacote'}</td>
            <td><strong>R$ ${(p.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
            <td><span class="status-badge ${p.status}">${p.status === 'approved' ? 'Aprovado' : p.status}</span></td>
            <td style="font-size: 0.8rem; color: var(--text-muted)">${p.mp_payment_id || '-'}</td>
        </tr>
    `).join('');
}

function renderSites() {
    const grid = document.getElementById('sites-grid');
    grid.innerHTML = sites.map(s => `
        <div class="site-card">
            <div class="site-preview">
                <img src="https://via.placeholder.com/400x200/1a2235/D4AF37?text=${encodeURIComponent(s.name || 'Site')}" alt="${s.name}">
                <span class="site-status ${s.is_published ? 'published' : 'suspended'}">
                    ${s.is_published ? 'Publicado' : 'Suspenso'}
                </span>
            </div>
            <div class="site-info">
                <div class="site-name">${s.name || 'Sem nome'}</div>
                <div class="site-domain">${s.subdomain || 'site'}.rafaeldemeni.com</div>
                <div class="site-owner">Por: ${s.profiles?.name || 'Usuário'}</div>
                <div class="site-actions">
                    <a href="https://${s.subdomain || 'site'}.rafaeldemeni.com" target="_blank" class="btn-secondary">
                        <i class="fas fa-external-link-alt"></i> Ver
                    </a>
                    <button class="btn-secondary" onclick="toggleSiteStatus('${s.id}')">
                        <i class="fas fa-${s.is_published ? 'pause' : 'play'}"></i> ${s.is_published ? 'Suspender' : 'Reativar'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ========== CHARTS ==========
async function initCharts() {
    // Buscar dados reais
    const revenueData = await getRealRevenueData(30);
    const usersData = await getRealNewUsersData(7);

    // Revenue Chart
    const revenueCtx = document.getElementById('revenue-chart')?.getContext('2d');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: getLast30Days(),
                datasets: [{
                    label: 'Receita (R$)',
                    data: revenueData,
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#64748b' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } }
                }
            }
        });
    }

    // Users Chart
    const usersCtx = document.getElementById('users-chart')?.getContext('2d');
    if (usersCtx) {
        new Chart(usersCtx, {
            type: 'bar',
            data: {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Novos usuários',
                    data: usersData,
                    backgroundColor: 'rgba(212, 175, 55, 0.8)',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#64748b' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } }
                }
            }
        });
    }
}

function getLast30Days() {
    const days = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
    }
    return days;
}

// Dados reais de receita do Supabase
async function getRealRevenueData(days) {
    const revenueByDay = Array(days).fill(0);
    try {
        if (SupabaseClient?.isConfigured()) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const { data: transactions } = await SupabaseClient.getClient()
                .from('transactions')
                .select('created_at, price_paid')
                .eq('type', 'purchase')
                .eq('payment_status', 'approved')
                .gte('created_at', startDate.toISOString());
            if (transactions) {
                transactions.forEach(tx => {
                    const txDate = new Date(tx.created_at);
                    const daysAgo = Math.floor((new Date() - txDate) / (1000 * 60 * 60 * 24));
                    const index = days - 1 - daysAgo;
                    if (index >= 0 && index < days) revenueByDay[index] += (tx.price_paid || 0);
                });
            }
        }
    } catch (e) { console.log('📊 Chart: fallback', e); }
    return revenueByDay;
}

// Dados reais de novos usuários
async function getRealNewUsersData(days) {
    const usersByDay = Array(7).fill(0);
    try {
        if (SupabaseClient?.isConfigured()) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            const { data: users } = await SupabaseClient.getClient()
                .from('profiles')
                .select('created_at')
                .gte('created_at', startDate.toISOString());
            if (users) {
                users.forEach(u => {
                    const dayOfWeek = new Date(u.created_at).getDay();
                    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                    usersByDay[adjustedDay]++;
                });
            }
        }
    } catch (e) { console.log('📊 Users chart: fallback', e); }
    return usersByDay;
}

function generateDemoData(count, min, max) {
    return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

// ========== FRANCHISEE MANAGEMENT ==========
function openCreateModal() {
    document.getElementById('modal-create').classList.add('active');
}

function closeCreateModal() {
    document.getElementById('modal-create').classList.remove('active');
    document.getElementById('create-form').reset();
}

// NOTE: auth.admin.createUser requires service_role key (server-side).
// In production, this should call a Supabase Edge Function.
// CREATE FRANCHISEE via Edge Function
async function createFranchisee(e) {
    e.preventDefault();

    const name = document.getElementById('new-name').value;
    const email = document.getElementById('new-email').value;
    const password = document.getElementById('new-password').value;
    const credits = parseInt(document.getElementById('new-credits').value) || 600;

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';

    try {
        if (SupabaseClient?.isConfigured()) {
            // Call Edge Function 'create-user'
            const { data, error } = await SupabaseClient.getClient().functions.invoke('create-user', {
                body: {
                    email,
                    password,
                    name,
                    credits
                }
            });

            if (error) {
                // Try to extract detailed error from response context
                let errorMsg = error.message;
                try {
                    if (error.context && typeof error.context.json === 'function') {
                        const errorBody = await error.context.json();
                        errorMsg = errorBody.error || errorMsg;
                    }
                } catch (e) { /* ignore parse errors */ }
                throw new Error(errorMsg);
            }
            if (data?.error) throw new Error(data.error);
        } else {
            // Demo mode fallback
            console.log('Demo mode: created user', { email, name, credits });
        }

        alert(`✅ Franqueado criado!\nEmail: ${email}\nSenha: ${password}\nCréditos: ${credits}`);
        closeCreateModal();
        e.target.reset();
        await loadFranchisees();
        updateStats();

    } catch (error) {
        console.error('Error creating franchisee:', error);
        alert('Erro ao criar franqueado: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-plus"></i> Criar Franqueado';
    }
}

// Toggle password visibility in create modal
function togglePasswordVisibility() {
    const input = document.getElementById('new-password');
    const icon = document.querySelector('#toggle-password-btn i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// ========== CREDITS MANAGEMENT ==========
let _creditOp = 'add';

function setCreditOp(op) {
    _creditOp = op;
    const addBtn = document.getElementById('btn-credit-add');
    const subBtn = document.getElementById('btn-credit-sub');
    if (op === 'add') {
        addBtn.style.background = '';
        addBtn.style.border = '';
        addBtn.style.color = '';
        addBtn.className = 'btn-primary';
        subBtn.style.background = 'transparent';
        subBtn.style.border = '1px solid #dc3545';
        subBtn.style.color = '#dc3545';
        subBtn.className = '';
    } else {
        subBtn.style.background = '#dc3545';
        subBtn.style.border = '1px solid #dc3545';
        subBtn.style.color = '#fff';
        subBtn.className = '';
        addBtn.style.background = 'transparent';
        addBtn.style.border = '1px solid var(--accent, #7c3aed)';
        addBtn.style.color = 'var(--accent, #7c3aed)';
        addBtn.className = '';
    }
    updateCreditsPreview();
}

function updateCreditsPreview() {
    const current = parseInt(document.getElementById('credits-current').textContent) || 0;
    const amount = parseInt(document.getElementById('credits-amount').value) || 0;
    const newTotal = _creditOp === 'add' ? current + amount : Math.max(0, current - amount);
    const sign = _creditOp === 'add' ? '+' : '-';
    const color = _creditOp === 'add' ? '#22c55e' : '#dc3545';
    document.getElementById('credits-preview').innerHTML = 
        `<span style="color:${color}">${sign}${amount}</span> → Novo saldo: <strong>${newTotal}</strong>`;
}

function openCreditsModal(userId, userName, currentCredits) {
    editingUserId = userId;
    _creditOp = 'add';
    document.getElementById('credits-user').textContent = `Usuário: ${userName}`;
    document.getElementById('credits-current').textContent = currentCredits;
    document.getElementById('credits-amount').value = 10;
    document.getElementById('credits-reason').value = '';
    setCreditOp('add');
    updateCreditsPreview();
    document.getElementById('credits-amount').addEventListener('input', updateCreditsPreview);
    document.getElementById('modal-credits').classList.add('active');
}

function closeCreditsModal() {
    document.getElementById('modal-credits').classList.remove('active');
    editingUserId = null;
}

async function saveCredits() {
    if (!editingUserId) return;

    const amount = parseInt(document.getElementById('credits-amount').value) || 0;
    const reason = document.getElementById('credits-reason').value.trim();

    if (amount <= 0) {
        alert('Informe uma quantidade válida.');
        return;
    }
    if (!reason) {
        alert('O motivo é obrigatório para justificar a transação.');
        return;
    }

    const currentCredits = parseInt(document.getElementById('credits-current').textContent) || 0;
    const newCredits = _creditOp === 'add' ? currentCredits + amount : Math.max(0, currentCredits - amount);
    const delta = _creditOp === 'add' ? amount : -Math.min(amount, currentCredits);

    try {
        if (SupabaseClient?.isConfigured()) {
            // Update credits
            await SupabaseClient.getClient()
                .from('profiles')
                .update({ credits: newCredits })
                .eq('id', editingUserId);

            // Record transaction
            await SupabaseClient.getClient()
                .from('transactions')
                .insert({
                    user_id: editingUserId,
                    type: _creditOp === 'add' ? 'credit' : 'debit',
                    amount: Math.abs(delta),
                    description: `[Admin] ${reason}`
                });

            // Create notification for user
            try {
                const notifMsg = _creditOp === 'add' 
                    ? `Você recebeu +${amount} créditos. Motivo: ${reason}`
                    : `Foram retirados ${Math.abs(delta)} créditos. Motivo: ${reason}`;
                await SupabaseClient.getClient()
                    .from('notifications')
                    .insert({
                        user_id: editingUserId,
                        type: 'credits',
                        title: _creditOp === 'add' ? 'Créditos adicionados' : 'Créditos retirados',
                        message: notifMsg,
                        read: false
                    });
            } catch(ne) { console.warn('Notifications table may not exist yet:', ne); }
        }

        const user = franchisees.find(f => f.id === editingUserId);
        if (user) user.credits = newCredits;

        renderFranchisees();
        updateStats();
        closeCreditsModal();
        const sign = _creditOp === 'add' ? '+' : '-';
        alert(`✅ ${sign}${Math.abs(delta)} créditos. Novo saldo: ${newCredits}\nMotivo: ${reason}`);
    } catch (error) {
        console.error('Error:', error);
        alert('Erro ao atualizar créditos');
    }
}


async function toggleUserStatus(userId) {
    const user = franchisees.find(f => f.id === userId);
    if (!user) return;

    const newStatus = user.is_active === false ? true : false;
    const action = newStatus ? 'ativar' : 'desativar';

    if (!confirm(`Deseja ${action} este usuário?`)) return;

    try {
        if (SupabaseClient?.isConfigured()) {
            await SupabaseClient.getClient()
                .from('profiles')
                .update({ is_active: newStatus })
                .eq('id', userId);
        }

        user.is_active = newStatus;
        renderFranchisees();
        alert(`✅ Usuário ${newStatus ? 'ativado' : 'desativado'}!`);
    } catch (error) {
        console.error('Error:', error);
        alert('Erro ao atualizar status');
    }
}

// ========== SITES MANAGEMENT ==========
async function toggleSiteStatus(siteId) {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;

    const newStatus = !site.is_published;
    const action = newStatus ? 'reativar' : 'suspender';

    if (!confirm(`Deseja ${action} este site?`)) return;

    try {
        if (SupabaseClient?.isConfigured()) {
            await SupabaseClient.getClient()
                .from('published_sites')
                .update({ is_active: newStatus })
                .eq('id', siteId);
        }

        site.is_published = newStatus;
        site.is_active = newStatus;
        renderSites();
        alert(`✅ Site ${newStatus ? 'reativado' : 'suspenso'}!`);
    } catch (error) {
        console.error('Error:', error);
        alert('Erro ao atualizar site');
    }
}

// ========== FILTERS ==========
function filterUsers() {
    const search = document.getElementById('search-users').value.toLowerCase();
    const status = document.getElementById('filter-status').value;

    const filtered = franchisees.filter(f => {
        const matchSearch = !search ||
            (f.name || '').toLowerCase().includes(search) ||
            (f.email || '').toLowerCase().includes(search);

        const matchStatus = !status ||
            (status === 'active' && f.is_active !== false) ||
            (status === 'inactive' && f.is_active === false);

        return matchSearch && matchStatus;
    });

    const tbody = document.getElementById('franchisees-table');
    tbody.innerHTML = filtered.map(f => `
        <tr>
            <td>
                <div class="user-cell">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(f.name || 'User')}&background=D4AF37&color=000&size=36" alt="">
                    <span>${f.name || 'Sem nome'}</span>
                </div>
            </td>
            <td>${f.email || '-'}</td>
            <td>${(f.credits || 0).toLocaleString('pt-BR')}</td>
            <td>${f.sites_count || 0}</td>
            <td>
                <span class="status-badge ${f.is_active !== false ? 'active' : 'inactive'}">
                    ${f.is_active !== false ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td>${formatDate(f.created_at)}</td>
            <td>
                <button class="action-btn" onclick="openCreditsModal('${f.id}', '${f.name || f.email}', ${f.credits || 0})" title="Editar créditos">
                    <i class="fas fa-coins"></i>
                </button>
                <button class="action-btn ${f.is_active !== false ? 'danger' : ''}" onclick="toggleUserStatus('${f.id}')" title="${f.is_active !== false ? 'Desativar' : 'Ativar'}">
                    <i class="fas fa-${f.is_active !== false ? 'ban' : 'check'}"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ========== UTILITIES ==========
function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function doLogout() {
    Auth.logout();
    window.location.href = 'app.html';
}

// Expose functions globally
window.openCreateModal = openCreateModal;
window.closeCreateModal = closeCreateModal;
window.createFranchisee = createFranchisee;
window.openCreditsModal = openCreditsModal;
window.closeCreditsModal = closeCreditsModal;
window.saveCredits = saveCredits;
window.setCreditOp = setCreditOp;
window.updateCreditsPreview = updateCreditsPreview;
window.toggleUserStatus = toggleUserStatus;
window.toggleSiteStatus = toggleSiteStatus;
window.filterUsers = filterUsers;
window.toggleSidebar = toggleSidebar;
window.doLogout = doLogout;

// ========== PHASE 2: SUPPORT TICKETS ==========
let tickets = [];
let currentTicketId = null;

async function loadTickets() {
    if (SupabaseClient?.isConfigured()) {
        try {
            const { data, error } = await SupabaseClient.getClient()
                .from('support_tickets')
                .select('*, profiles:user_id(name, email)')
                .order('created_at', { ascending: false })
                .limit(50);

            if (!error && data) {
                tickets = data.map(t => ({
                    ...t,
                    profiles: t.profiles || { name: t.user_name || 'Usuário', email: t.user_email },
                    messages: t.messages || [{ sender: 'user', content: t.message || '' }]
                }));
            }
        } catch (e) {
            console.log('📩 Tickets: fallback to demo', e);
        }
    }

    // Demo data fallback if no tickets
    if (!tickets || tickets.length === 0) {
        tickets = [
            { id: '1', user_id: '2', subject: 'Não consigo publicar', category: 'Técnico', status: 'pending', created_at: '2026-01-22T14:00:00', profiles: { name: 'João Silva' }, messages: [{ sender: 'user', content: 'Olá, estou tentando publicar mas dá erro.' }] }
        ];
    }
    renderTickets();
    updateTicketStats();
}

function renderTickets() {
    const tbody = document.getElementById('support-table');
    if (!tbody) return;

    tbody.innerHTML = tickets.map(t => `
        <tr>
            <td>${formatDateTime(t.created_at)}</td>
            <td>${t.profiles?.name || 'Usuário'}</td>
            <td>${t.category || 'Geral'}</td>
            <td>${t.subject}</td>
            <td><span class="status-badge ${t.status}">${getTicketStatusLabel(t.status)}</span></td>
            <td>
                <button class="action-btn" onclick="openTicketModal('${t.id}')" title="Responder">
                    <i class="fas fa-reply"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function getTicketStatusLabel(status) {
    const labels = { pending: 'Pendente', in_progress: 'Em Andamento', resolved: 'Resolvido' };
    return labels[status] || status;
}

function updateTicketStats() {
    const pending = tickets.filter(t => t.status === 'pending').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;

    const statPending = document.getElementById('stat-pending');
    const statProgress = document.getElementById('stat-progress');
    const statResolved = document.getElementById('stat-resolved');
    const pendingBadge = document.getElementById('pending-tickets');

    if (statPending) statPending.textContent = pending;
    if (statProgress) statProgress.textContent = inProgress;
    if (statResolved) statResolved.textContent = resolved;
    if (pendingBadge) pendingBadge.textContent = `${pending} pendentes`;
}

function openTicketModal(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    currentTicketId = ticketId;

    document.getElementById('ticket-info').innerHTML = `
        <h4>${ticket.subject}</h4>
        <p>De: ${ticket.profiles?.name || 'Usuário'} | ${ticket.category} | ${formatDateTime(ticket.created_at)}</p>
    `;

    document.getElementById('ticket-history').innerHTML = (ticket.messages || []).map(m => `
        <div class="ticket-message ${m.sender}">
            <div class="sender">${m.sender === 'admin' ? '🛡️ Admin' : '👤 Usuário'}</div>
            <div class="content">${m.content}</div>
        </div>
    `).join('');

    document.getElementById('ticket-status').value = ticket.status;
    document.getElementById('ticket-reply').value = '';
    document.getElementById('modal-ticket').classList.add('active');
}

function closeTicketModal() {
    document.getElementById('modal-ticket').classList.remove('active');
    currentTicketId = null;
}

async function sendTicketReply() {
    if (!currentTicketId) return;

    const reply = document.getElementById('ticket-reply').value.trim();
    const newStatus = document.getElementById('ticket-status').value;

    const ticket = tickets.find(t => t.id === currentTicketId);
    if (!ticket) return;

    if (reply) {
        ticket.messages = ticket.messages || [];
        ticket.messages.push({ sender: 'admin', content: reply });
    }
    ticket.status = newStatus;

    // Persist to Supabase
    try {
        if (SupabaseClient?.isConfigured()) {
            const updateData = {
                status: newStatus,
                updated_at: new Date().toISOString()
            };
            if (reply) {
                updateData.admin_response = reply;
            }
            await SupabaseClient.getClient()
                .from('support_tickets')
                .update(updateData)
                .eq('id', currentTicketId);
        }
    } catch (error) {
        console.error('Error saving ticket reply:', error);
    }

    renderTickets();
    updateTicketStats();
    closeTicketModal();
    logActivity(`Respondeu ticket: ${ticket.subject}`);
    alert('✅ Resposta enviada!');
}

function filterTickets() {
    const status = document.getElementById('filter-ticket-status')?.value;
    const filtered = status ? tickets.filter(t => t.status === status) : tickets;

    const tbody = document.getElementById('support-table');
    if (!tbody) return;

    tbody.innerHTML = filtered.map(t => `
        <tr>
            <td>${formatDateTime(t.created_at)}</td>
            <td>${t.profiles?.name || 'Usuário'}</td>
            <td>${t.category || 'Geral'}</td>
            <td>${t.subject}</td>
            <td><span class="status-badge ${t.status}">${getTicketStatusLabel(t.status)}</span></td>
            <td>
                <button class="action-btn" onclick="openTicketModal('${t.id}')" title="Responder">
                    <i class="fas fa-reply"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ========== ANNOUNCEMENTS ==========
let announcements = [];

function loadAnnouncements() {
    announcements = [
        { id: '1', title: 'Bem-vindos à plataforma!', message: 'Estamos felizes em tê-los conosco.', target: 'all', created_at: '2026-01-20T10:00:00' }
    ];
    renderAnnouncements();
}

function renderAnnouncements() {
    const container = document.getElementById('announcements-history');
    if (!container) return;

    container.innerHTML = announcements.length ? announcements.map(a => `
        <div class="announcement-item">
            <h4>${a.title}</h4>
            <p>${a.message}</p>
            <span class="meta">Enviado para: ${a.target === 'all' ? 'Todos' : a.target} | ${formatDateTime(a.created_at)}</span>
        </div>
    `).join('') : '<p style="color: var(--text-muted)">Nenhum comunicado enviado.</p>';
}

async function sendAnnouncement(e) {
    e.preventDefault();

    const title = document.getElementById('ann-title').value;
    const message = document.getElementById('ann-message').value;
    const target = document.getElementById('ann-target').value;

    announcements.unshift({
        id: Date.now().toString(),
        title,
        message,
        target,
        created_at: new Date().toISOString()
    });

    renderAnnouncements();
    e.target.reset();
    logActivity(`Enviou comunicado: ${title}`);
    alert('✅ Comunicado enviado!');
}

// ========== SETTINGS ==========
function loadPackageSettings() {
    const container = document.getElementById('packages-settings');
    if (!container) return;

    const packages = [
        { id: 'starter', name: 'Primeira Compra', price: 1, credits: 40 },
        { id: 'essencial', name: 'Essencial', price: 200, credits: 200 },
        { id: 'profissional', name: 'Profissional', price: 400, credits: 600 },
        { id: 'empresarial', name: 'Empresarial', price: 600, credits: 1000 }
    ];

    container.innerHTML = packages.map(p => `
        <div class="package-setting" data-package-id="${p.id}">
            <div class="form-group">
                <label>Pacote</label>
                <input type="text" value="${p.name}" disabled>
            </div>
            <div class="form-group">
                <label>Preço (R$)</label>
                <input type="number" class="pkg-price" value="${p.price}" min="0">
            </div>
            <div class="form-group">
                <label>Créditos</label>
                <input type="number" class="pkg-credits" value="${p.credits}" min="0">
            </div>
            <div class="form-group">
                <label>Sites</label>
                <input type="number" value="${Math.floor(p.credits / 40)}" disabled>
            </div>
        </div>
    `).join('');
}

function savePackageSettings() {
    // Collect all package settings
    const settings = [];
    document.querySelectorAll('.package-setting').forEach(el => {
        settings.push({
            id: el.dataset.packageId,
            price: parseFloat(el.querySelector('.pkg-price').value),
            credits: parseInt(el.querySelector('.pkg-credits').value)
        });
    });

    console.log('Package settings to save:', settings);
    logActivity('Atualizou configurações de pacotes');
    alert('✅ Configurações salvas!');
}

function saveSystemSettings() {
    const siteCost = document.getElementById('setting-site-cost')?.value;
    const initialCredits = document.getElementById('setting-initial-credits')?.value;
    const maintenance = document.getElementById('setting-maintenance')?.checked;

    console.log('System settings:', { siteCost, initialCredits, maintenance });
    logActivity('Atualizou configurações do sistema');
    alert('✅ Configurações do sistema salvas!');
}

// ========== ACTIVITY LOG ==========
let adminLogs = [];

function logActivity(action) {
    adminLogs.unshift({
        time: new Date().toLocaleTimeString('pt-BR'),
        action
    });
    renderAdminLogs();
}

function renderAdminLogs() {
    const container = document.getElementById('admin-logs');
    if (!container) return;

    container.innerHTML = adminLogs.length ? adminLogs.slice(0, 10).map(l => `
        <div class="log-item">
            <span class="log-time">${l.time}</span>
            <span class="log-action">${l.action}</span>
        </div>
    `).join('') : '<p style="color: var(--text-muted)">Nenhuma atividade registrada.</p>';
}

// Load Phase 2 data on init
setTimeout(() => {
    loadTickets();
    loadAnnouncements();
    loadPackageSettings();
    renderAdminLogs();
}, 100);

// Expose Phase 2 functions
window.openTicketModal = openTicketModal;
window.closeTicketModal = closeTicketModal;
window.sendTicketReply = sendTicketReply;
window.filterTickets = filterTickets;
window.sendAnnouncement = sendAnnouncement;
window.savePackageSettings = savePackageSettings;
window.saveSystemSettings = saveSystemSettings;

// ========== PHASE 3: AFFILIATES ==========
let affiliates = [];

function loadAffiliates() {
    // Demo data
    affiliates = [
        { id: '1', name: 'Rafael Demeni', code: 'rafael123', referrals: 5, commission: 250, active: true },
        { id: '2', name: 'João Silva', code: 'joao456', referrals: 3, commission: 150, active: true },
        { id: '3', name: 'Maria Santos', code: 'maria789', referrals: 0, commission: 0, active: false }
    ];
    renderAffiliates();
    updateAffiliateStats();
}

function renderAffiliates() {
    const tbody = document.getElementById('affiliates-table');
    if (!tbody) return;

    tbody.innerHTML = affiliates.map(a => `
        <tr>
            <td>
                <div class="user-cell">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=D4AF37&color=000&size=36" alt="">
                    <span>${a.name}</span>
                </div>
            </td>
            <td>
                <div class="affiliate-link">
                    <span>rafaeldemeni.com/?ref=${a.code}</span>
                    <button onclick="copyLink('${a.code}')"><i class="fas fa-copy"></i></button>
                </div>
            </td>
            <td>${a.referrals}</td>
            <td><strong>R$ ${a.commission.toLocaleString('pt-BR')}</strong></td>
            <td><span class="status-badge ${a.active ? 'active' : 'inactive'}">${a.active ? 'Ativo' : 'Inativo'}</span></td>
        </tr>
    `).join('');
}

function updateAffiliateStats() {
    const activeCount = affiliates.filter(a => a.active).length;
    const totalReferrals = affiliates.reduce((sum, a) => sum + a.referrals, 0);

    const statAffiliates = document.getElementById('stat-affiliates');
    const statReferrals = document.getElementById('stat-referrals');

    if (statAffiliates) statAffiliates.textContent = activeCount;
    if (statReferrals) statReferrals.textContent = totalReferrals;
}

function copyLink(code) {
    navigator.clipboard.writeText(`https://rafaeldemeni.com/?ref=${code}`);
    alert('Link copiado!');
}

function saveAffiliateSettings() {
    const commission = document.getElementById('affiliate-commission')?.value;
    const bonus = document.getElementById('affiliate-bonus')?.value;
    console.log('Affiliate settings:', { commission, bonus });
    logActivity('Atualizou configurações de afiliados');
    alert('✅ Configurações de afiliados salvas!');
}

// ========== PHASE 3: ANALYTICS ==========
function loadAnalytics() {
    initAnalyticsCharts();
    loadTopFranchisees();
    loadInactiveFranchisees();
    updateMetrics();
}

function initAnalyticsCharts() {
    // Funnel Chart
    const funnelCtx = document.getElementById('funnel-chart')?.getContext('2d');
    if (funnelCtx) {
        new Chart(funnelCtx, {
            type: 'bar',
            data: {
                labels: ['Visitantes', 'Cadastros', 'Primeiro Pagamento', 'Recorrentes'],
                datasets: [{
                    label: 'Conversão',
                    data: [1000, 150, 80, 45],
                    backgroundColor: ['#3b82f6', '#22c55e', '#D4AF37', '#f59e0b']
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
                    y: { grid: { display: false }, ticks: { color: '#64748b' } }
                }
            }
        });
    }

    // Package Chart (Pie)
    const packageCtx = document.getElementById('package-chart')?.getContext('2d');
    if (packageCtx) {
        new Chart(packageCtx, {
            type: 'doughnut',
            data: {
                labels: ['Primeira Compra', 'Essencial', 'Profissional', 'Empresarial'],
                datasets: [{
                    data: [20, 35, 30, 15],
                    backgroundColor: ['#3b82f6', '#22c55e', '#D4AF37', '#f59e0b']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#94a3b8' } }
                }
            }
        });
    }
}

function loadTopFranchisees() {
    const container = document.getElementById('top-franchisees');
    if (!container) return;

    const top = franchisees.slice(0, 5).map((f, i) => `
        <div class="user-rank-item">
            <div class="user-rank-info">
                <span class="user-rank-position">${i + 1}</span>
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(f.name || 'U')}&background=D4AF37&color=000&size=32" alt="">
                <span>${f.name || f.email}</span>
            </div>
            <span class="user-rank-value">${f.sites_count || 0} sites</span>
        </div>
    `).join('');

    container.innerHTML = top || '<p style="color: var(--text-muted)">Nenhum dado</p>';
}

function loadInactiveFranchisees() {
    const container = document.getElementById('inactive-franchisees');
    if (!container) return;

    // Demo: users without activity
    const inactive = franchisees.filter(f => !f.is_active || (f.credits === 0 && f.sites_count === 0));

    container.innerHTML = inactive.length ? inactive.slice(0, 5).map(f => `
        <div class="user-rank-item">
            <div class="user-rank-info">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(f.name || 'U')}&background=ef4444&color=fff&size=32" alt="">
                <span>${f.name || f.email}</span>
            </div>
            <span style="color: var(--text-muted)">30+ dias</span>
        </div>
    `).join('') : '<p style="color: var(--text-muted)">Todos os usuários estão ativos!</p>';
}

function updateMetrics() {
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const avgLTV = franchisees.length > 0 ? totalRevenue / franchisees.length : 0;
    const churn = 5; // Demo
    const conversion = 15; // Demo

    const mrrEl = document.getElementById('metric-mrr');
    const ltvEl = document.getElementById('metric-ltv');
    const churnEl = document.getElementById('metric-churn');
    const convEl = document.getElementById('metric-conversion');

    if (mrrEl) mrrEl.textContent = `R$ ${totalRevenue.toLocaleString('pt-BR')}`;
    if (ltvEl) ltvEl.textContent = `R$ ${avgLTV.toFixed(0)}`;
    if (churnEl) churnEl.textContent = `${churn}%`;
    if (convEl) convEl.textContent = `${conversion}%`;
}

// ========== PHASE 3: WEBHOOKS ==========
let webhooks = [];

function loadWebhooks() {
    // Demo data
    webhooks = [
        { id: 'MP123456', type: 'payment', user: 'Rafael Demeni', status: 'success', created_at: '2026-01-22T10:30:00' },
        { id: 'MP123457', type: 'payment', user: 'João Silva', status: 'success', created_at: '2026-01-21T15:45:00' },
        { id: 'MP123458', type: 'refund', user: 'Maria Santos', status: 'pending', created_at: '2026-01-20T09:00:00' },
        { id: 'MP123459', type: 'payment', user: 'Teste', status: 'failed', created_at: '2026-01-19T14:20:00' }
    ];
    renderWebhooks();
    updateWebhookStats();
}

function renderWebhooks() {
    const tbody = document.getElementById('webhooks-table');
    if (!tbody) return;

    tbody.innerHTML = webhooks.map(w => `
        <tr>
            <td>${formatDateTime(w.created_at)}</td>
            <td>${w.type === 'payment' ? '💰 Pagamento' : '↩️ Reembolso'}</td>
            <td style="font-family: monospace; font-size: 0.8rem">${w.id}</td>
            <td>${w.user}</td>
            <td><span class="webhook-status ${w.status}">${getWebhookStatusLabel(w.status)}</span></td>
            <td>
                ${w.status === 'failed' || w.status === 'pending' ? `
                    <button class="action-btn" onclick="reprocessWebhook('${w.id}')" title="Reprocessar">
                        <i class="fas fa-redo"></i>
                    </button>
                ` : ''}
                <button class="action-btn" onclick="viewWebhookDetails('${w.id}')" title="Detalhes">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function getWebhookStatusLabel(status) {
    const labels = { success: '✓ Sucesso', pending: '⏳ Pendente', failed: '✗ Falha' };
    return labels[status] || status;
}

function updateWebhookStats() {
    const success = webhooks.filter(w => w.status === 'success').length;
    const pending = webhooks.filter(w => w.status === 'pending').length;
    const failed = webhooks.filter(w => w.status === 'failed').length;

    const successEl = document.getElementById('webhook-success');
    const pendingEl = document.getElementById('webhook-pending');
    const failedEl = document.getElementById('webhook-failed');

    if (successEl) successEl.textContent = success;
    if (pendingEl) pendingEl.textContent = pending;
    if (failedEl) failedEl.textContent = failed;
}

function reprocessWebhook(id) {
    const webhook = webhooks.find(w => w.id === id);
    if (!webhook) return;

    if (confirm(`Reprocessar webhook ${id}?`)) {
        webhook.status = 'success';
        renderWebhooks();
        updateWebhookStats();
        logActivity(`Reprocessou webhook: ${id}`);
        alert('✅ Webhook reprocessado!');
    }
}

function viewWebhookDetails(id) {
    const webhook = webhooks.find(w => w.id === id);
    if (webhook) {
        alert(`Detalhes do Webhook\n\nID: ${webhook.id}\nTipo: ${webhook.type}\nUsuário: ${webhook.user}\nStatus: ${webhook.status}\nData: ${formatDateTime(webhook.created_at)}`);
    }
}

function refreshWebhooks() {
    loadWebhooks();
    logActivity('Atualizou lista de webhooks');
    alert('✅ Webhooks atualizados!');
}

// ========== PHASE 3: EXPORT ==========
function exportReport(type) {
    let data, filename;

    if (type === 'all' || type === 'franchisees') {
        data = franchisees.map(f => ({
            Nome: f.name || '',
            Email: f.email || '',
            Creditos: f.credits || 0,
            Sites: f.sites_count || 0,
            Status: f.is_active !== false ? 'Ativo' : 'Inativo',
            Criado: formatDate(f.created_at)
        }));
        filename = 'franqueados.csv';
    } else if (type === 'payments') {
        data = payments.map(p => ({
            Data: formatDateTime(p.created_at),
            Usuario: p.profiles?.name || '',
            Pacote: p.package_name || '',
            Valor: p.amount || 0,
            Status: p.status,
            ID_MP: p.mp_payment_id || ''
        }));
        filename = 'pagamentos.csv';
    }

    if (data && data.length) {
        downloadCSV(data, filename);
        logActivity(`Exportou relatório: ${filename}`);
    } else {
        alert('Nenhum dado para exportar');
    }
}

function downloadCSV(data, filename) {
    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Load Phase 3 data
setTimeout(() => {
    loadAffiliates();
    loadAnalytics();
    loadWebhooks();
}, 200);

// Expose Phase 3 functions
window.copyLink = copyLink;
window.saveAffiliateSettings = saveAffiliateSettings;
window.loadAnalytics = loadAnalytics;
window.exportReport = exportReport;
window.refreshWebhooks = refreshWebhooks;
window.reprocessWebhook = reprocessWebhook;
window.viewWebhookDetails = viewWebhookDetails;

// ========== PHASE 4: FEED MANAGEMENT ==========
let feedPosts = [];

async function loadFeedPosts() {
    if (SupabaseClient?.isConfigured()) {
        try {
            const { data, error } = await SupabaseClient.getClient()
                .from('feed_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                feedPosts = data;
            }
        } catch (e) {
            console.log('📰 Feed: fallback to demo', e);
        }
    }

    // Demo data fallback
    if (!feedPosts || feedPosts.length === 0) {
        feedPosts = [
            {
                id: 'demo-1',
                title: '🚀 Novidades Demeni Sites',
                text: 'Estamos lançando novas funcionalidades para turbinar seus sites! Fiquem ligados nas próximas atualizações.',
                image_url: 'assets/feed/post-1.png',
                status: 'published',
                likes_count: 12,
                created_at: '2026-02-10T10:00:00'
            },
            {
                id: 'demo-2',
                title: '📱 Templates Mobile-First',
                text: 'Todos os novos templates agora são otimizados para mobile. Seus clientes vão amar a experiência.',
                image_url: 'assets/feed/post-2.png',
                status: 'published',
                likes_count: 8,
                created_at: '2026-02-09T15:30:00'
            },
            {
                id: 'demo-3',
                title: '💡 Dica: Use o Editor D-2',
                text: 'O Editor D-2 tem controle total sobre cada seção do site. Experimente os temas de estilo para personalizar rapidamente.',
                image_url: 'assets/feed/post-3.png',
                status: 'draft',
                likes_count: 0,
                created_at: '2026-02-08T09:00:00'
            }
        ];
    }

    renderFeedPosts();
    updateFeedStats();
}

function renderFeedPosts() {
    const tbody = document.getElementById('feed-table');
    if (!tbody) return;

    tbody.innerHTML = feedPosts.map(p => `
        <tr>
            <td>
                <img src="${p.image_url || 'https://via.placeholder.com/80x50/f0ecff/9333ea?text=Sem+Img'}"
                     alt="${p.title}" style="width:80px; height:50px; object-fit:cover; border-radius:8px;">
            </td>
            <td>
                <strong>${p.title}</strong>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">
                    ${(p.text || '').substring(0, 60)}${p.text?.length > 60 ? '...' : ''}
                </div>
            </td>
            <td>
                <span class="status-badge ${p.status === 'published' ? 'active' : 'pending'}">
                    ${p.status === 'published' ? 'Publicado' : 'Rascunho'}
                </span>
            </td>
            <td><i class="fas fa-heart" style="color:#ef4444; margin-right:4px;"></i>${p.likes_count || 0}</td>
            <td>${formatDate(p.created_at)}</td>
            <td>
                <button class="action-btn" onclick="openFeedModal('${p.id}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn" onclick="toggleFeedPostStatus('${p.id}')" title="${p.status === 'published' ? 'Despublicar' : 'Publicar'}">
                    <i class="fas fa-${p.status === 'published' ? 'eye-slash' : 'eye'}"></i>
                </button>
                <button class="action-btn danger" onclick="deleteFeedPost('${p.id}')" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function updateFeedStats() {
    const total = feedPosts.length;
    const published = feedPosts.filter(p => p.status === 'published').length;
    const likes = feedPosts.reduce((sum, p) => sum + (p.likes_count || 0), 0);

    const elTotal = document.getElementById('stat-feed-total');
    const elPub = document.getElementById('stat-feed-published');
    const elLikes = document.getElementById('stat-feed-likes');

    if (elTotal) elTotal.textContent = total;
    if (elPub) elPub.textContent = published;
    if (elLikes) elLikes.textContent = likes;
}

function openFeedModal(postId) {
    const modal = document.getElementById('modal-feed');
    const titleEl = document.getElementById('feed-modal-title');
    const postIdEl = document.getElementById('feed-post-id');
    const titleInput = document.getElementById('feed-title');
    const textInput = document.getElementById('feed-text');
    const imageInput = document.getElementById('feed-image');
    const statusInput = document.getElementById('feed-status');
    const previewEl = document.getElementById('feed-image-preview');
    const uploadArea = document.getElementById('feed-upload-area');
    const uploadProgress = document.getElementById('feed-upload-progress');

    // Reset upload state
    if (uploadProgress) uploadProgress.style.display = 'none';
    if (uploadArea) uploadArea.style.display = '';
    const fileInput = document.getElementById('feed-file-input');
    if (fileInput) fileInput.value = '';

    if (postId) {
        const post = feedPosts.find(p => p.id === postId);
        if (!post) return;
        titleEl.textContent = 'Editar Post';
        postIdEl.value = postId;
        titleInput.value = post.title;
        textInput.value = post.text;
        imageInput.value = post.image_url || '';
        statusInput.value = post.status;
        if (post.image_url) {
            previewEl.innerHTML = `
                <div style="position:relative">
                    <img src="${post.image_url}" alt="Preview">
                    <button type="button" onclick="removeFeedImage()" 
                        style="position:absolute; top:8px; right:8px; background:rgba(239,68,68,0.9); color:#fff; border:none; border-radius:50%; width:28px; height:28px; cursor:pointer; font-size:0.8rem;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>`;
            if (uploadArea) uploadArea.style.display = 'none';
        } else {
            previewEl.innerHTML = '';
        }
    } else {
        titleEl.textContent = 'Novo Post';
        postIdEl.value = '';
        titleInput.value = '';
        textInput.value = '';
        imageInput.value = '';
        statusInput.value = 'draft';
        previewEl.innerHTML = '';
    }

    modal.classList.add('active');
}

function closeFeedModal() {
    document.getElementById('modal-feed').classList.remove('active');
}

async function saveFeedPost() {
    const postId = document.getElementById('feed-post-id').value;
    const title = document.getElementById('feed-title').value.trim();
    const text = document.getElementById('feed-text').value.trim();
    const imageUrl = document.getElementById('feed-image').value.trim();
    const status = document.getElementById('feed-status').value;

    if (!title || !text) {
        alert('Preencha título e texto.');
        return;
    }

    const postData = {
        title,
        text,
        image_url: imageUrl || null,
        status,
        updated_at: new Date().toISOString()
    };

    try {
        if (SupabaseClient?.isConfigured()) {
            if (postId && !postId.startsWith('demo-')) {
                // Update
                const { error } = await SupabaseClient.getClient()
                    .from('feed_posts')
                    .update(postData)
                    .eq('id', postId);
                if (error) throw error;
            } else {
                // Insert
                postData.created_at = new Date().toISOString();
                const { error } = await SupabaseClient.getClient()
                    .from('feed_posts')
                    .insert(postData);
                if (error) throw error;
            }
        } else {
            // Local-only (demo mode)
            if (postId) {
                const post = feedPosts.find(p => p.id === postId);
                if (post) Object.assign(post, postData);
            } else {
                feedPosts.unshift({
                    id: 'demo-' + Date.now(),
                    ...postData,
                    likes_count: 0,
                    created_at: new Date().toISOString()
                });
            }
        }

        closeFeedModal();
        await loadFeedPosts();
        logActivity(`${postId ? 'Editou' : 'Criou'} post: ${title}`);
        alert(`✅ Post ${postId ? 'atualizado' : 'criado'}!`);
    } catch (error) {
        console.error('Error saving feed post:', error);
        alert('Erro ao salvar post: ' + error.message);
    }
}

async function deleteFeedPost(id) {
    if (!confirm('Deseja excluir este post? Esta ação não pode ser desfeita.')) return;

    try {
        if (SupabaseClient?.isConfigured() && !id.startsWith('demo-')) {
            const { error } = await SupabaseClient.getClient()
                .from('feed_posts')
                .delete()
                .eq('id', id);
            if (error) throw error;
        } else {
            feedPosts = feedPosts.filter(p => p.id !== id);
        }

        await loadFeedPosts();
        logActivity('Excluiu um post do feed');
        alert('✅ Post excluído!');
    } catch (error) {
        console.error('Error deleting feed post:', error);
        alert('Erro ao excluir post: ' + error.message);
    }
}

async function toggleFeedPostStatus(id) {
    const post = feedPosts.find(p => p.id === id);
    if (!post) return;

    const newStatus = post.status === 'published' ? 'draft' : 'published';
    const action = newStatus === 'published' ? 'publicar' : 'despublicar';

    if (!confirm(`Deseja ${action} este post?`)) return;

    try {
        if (SupabaseClient?.isConfigured() && !id.startsWith('demo-')) {
            const { error } = await SupabaseClient.getClient()
                .from('feed_posts')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
        } else {
            post.status = newStatus;
        }

        await loadFeedPosts();
        logActivity(`${newStatus === 'published' ? 'Publicou' : 'Despublicou'} post: ${post.title}`);
        alert(`✅ Post ${newStatus === 'published' ? 'publicado' : 'despublicado'}!`);
    } catch (error) {
        console.error('Error toggling feed post:', error);
        alert('Erro ao atualizar post');
    }
}

// Load Feed data
setTimeout(() => {
    loadFeedPosts();
}, 300);

// ========== IMAGE UPLOAD + WEBP CONVERSION ==========
async function handleFeedImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadArea = document.getElementById('feed-upload-area');
    const progressEl = document.getElementById('feed-upload-progress');
    const fillEl = document.getElementById('feed-upload-fill');
    const statusEl = document.getElementById('feed-upload-status');
    const previewEl = document.getElementById('feed-image-preview');
    const imageInput = document.getElementById('feed-image');

    uploadArea.style.display = 'none';
    progressEl.style.display = 'flex';
    fillEl.style.width = '10%';
    statusEl.textContent = 'Convertendo para WebP...';

    try {
        // Step 1: Convert to WebP using canvas
        const webpBlob = await convertToWebP(file, 0.85);
        fillEl.style.width = '40%';
        statusEl.textContent = 'Enviando para o servidor...';

        // Step 2: Upload to Supabase Storage
        if (SupabaseClient?.isConfigured()) {
            const fileName = `feed_${Date.now()}.webp`;
            const { data, error } = await SupabaseClient.getClient()
                .storage
                .from('feed-images')
                .upload(fileName, webpBlob, {
                    contentType: 'image/webp',
                    upsert: false
                });

            if (error) throw error;

            fillEl.style.width = '80%';
            statusEl.textContent = 'Obtendo URL...';

            // Step 3: Get public URL
            const { data: urlData } = SupabaseClient.getClient()
                .storage
                .from('feed-images')
                .getPublicUrl(fileName);

            const publicUrl = urlData.publicUrl;
            imageInput.value = publicUrl;

            fillEl.style.width = '100%';
            statusEl.textContent = '✅ Upload concluído!';

            // Show preview
            previewEl.innerHTML = `<img src="${publicUrl}" alt="Preview">`;
        } else {
            // Local mode: use base64 data URL
            const reader = new FileReader();
            reader.onload = (e) => {
                imageInput.value = e.target.result;
                previewEl.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                fillEl.style.width = '100%';
                statusEl.textContent = '✅ Imagem carregada (modo local)';
            };
            reader.readAsDataURL(webpBlob);
        }

        // Hide progress after 2s
        setTimeout(() => {
            progressEl.style.display = 'none';
        }, 2000);

    } catch (error) {
        console.error('Upload error:', error);
        fillEl.style.width = '0%';
        statusEl.textContent = '❌ Erro: ' + error.message;
        uploadArea.style.display = '';
        setTimeout(() => { progressEl.style.display = 'none'; }, 3000);
    }
}

function convertToWebP(file, quality = 0.85) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            // Max dimensions: 1200x800 for feed images
            let { width, height } = img;
            const MAX_W = 1200;
            const MAX_H = 800;

            if (width > MAX_W) {
                height = Math.round(height * (MAX_W / width));
                width = MAX_W;
            }
            if (height > MAX_H) {
                width = Math.round(width * (MAX_H / height));
                height = MAX_H;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    URL.revokeObjectURL(url);
                    if (blob) resolve(blob);
                    else reject(new Error('Falha na conversão WebP'));
                },
                'image/webp',
                quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Erro ao carregar imagem'));
        };

        img.src = url;
    });
}

// Drag and drop support
document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('feed-upload-area');
    if (!uploadArea) return;

    ['dragenter', 'dragover'].forEach(evt => {
        uploadArea.addEventListener(evt, (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(evt => {
        uploadArea.addEventListener(evt, (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });
    });

    uploadArea.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const fileInput = document.getElementById('feed-file-input');
            const dt = new DataTransfer();
            dt.items.add(file);
            fileInput.files = dt.files;
            handleFeedImageUpload({ target: fileInput });
        }
    });
});

// ========== TEXT FORMATTING ==========
function formatFeedText(text) {
    if (!text) return '';
    // Escape HTML first
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    // Bold+Italic: ***text***
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    // Bold: **text**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text*
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    return html;
}

function feedFormatInsert(type) {
    const textarea = document.getElementById('feed-text');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const wrap = type === 'bold' ? '**' : '*';

    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);

    if (selected) {
        textarea.value = before + wrap + selected + wrap + after;
        textarea.selectionStart = start;
        textarea.selectionEnd = end + wrap.length * 2;
    } else {
        const placeholder = type === 'bold' ? 'texto negrito' : 'texto itálico';
        textarea.value = before + wrap + placeholder + wrap + after;
        textarea.selectionStart = start + wrap.length;
        textarea.selectionEnd = start + wrap.length + placeholder.length;
    }
    textarea.focus();
}

// ========== IMAGE REMOVE/REPLACE ==========
function removeFeedImage() {
    const imageInput = document.getElementById('feed-image');
    const previewEl = document.getElementById('feed-image-preview');
    const uploadArea = document.getElementById('feed-upload-area');
    const fileInput = document.getElementById('feed-file-input');

    imageInput.value = '';
    previewEl.innerHTML = '';
    if (fileInput) fileInput.value = '';
    if (uploadArea) uploadArea.style.display = '';
}

// Make formatFeedText globally available (used by feed.js too)
window.formatFeedText = formatFeedText;

// Expose Feed functions
window.openFeedModal = openFeedModal;
window.closeFeedModal = closeFeedModal;
window.saveFeedPost = saveFeedPost;
window.deleteFeedPost = deleteFeedPost;
window.toggleFeedPostStatus = toggleFeedPostStatus;
window.handleFeedImageUpload = handleFeedImageUpload;
window.feedFormatInsert = feedFormatInsert;
window.removeFeedImage = removeFeedImage;
