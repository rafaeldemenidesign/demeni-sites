/* ===========================
   DEMENI SITES - DASHBOARD JS
   =========================== */

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupNavigation();
    setupMobileMenu();
    setupButtons();

    // Load data
    refreshUserCard();
    refreshCredits();
    loadProjects();
    loadPackages();
    loadTransactions();
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
    // Update nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

    // Update pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`)?.classList.add('active');

    // Update title
    const titles = {
        projects: 'Meus Projetos',
        new: 'Novo Projeto',
        wallet: 'Minha Carteira',
        lessons: 'Aulas',
        help: 'Ajuda'
    };
    document.getElementById('page-title').textContent = titles[page] || 'Dashboard';

    // Special actions
    if (page === 'new') {
        createNewProject();
    }

    // Close mobile menu
    document.getElementById('sidebar').classList.remove('open');
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

    // Update avatar
    if (user.avatar) {
        document.getElementById('user-avatar').src = user.avatar;
    }

    // Update name
    document.getElementById('user-name').textContent = user.name || 'Usuário';

    // Update level with pulse animation
    const levelBadge = document.getElementById('level-badge');
    const previousLevel = parseInt(levelBadge.textContent) || 0;
    levelBadge.textContent = stats.level;

    // Pulse animation if level changed
    if (previousLevel > 0 && previousLevel !== stats.level) {
        levelBadge.classList.add('pulse');
        setTimeout(() => levelBadge.classList.remove('pulse'), 600);
    }

    document.getElementById('level-tag').textContent = `Nível ${stats.level}`;
    document.getElementById('border-tag').textContent = stats.border.name;

    // Update avatar border
    const avatarWrapper = document.querySelector('.user-avatar');
    avatarWrapper.className = 'user-avatar';
    if (stats.border.color !== 'default') {
        avatarWrapper.classList.add(stats.border.color);
    }

    // Update XP bar
    document.getElementById('xp-progress').style.width = `${stats.progress.percentage}%`;
    document.getElementById('xp-text').textContent =
        `${XPSystem.formatXP(stats.xp)} / ${XPSystem.formatXP(XPSystem.getXPForLevel(stats.level + 1))} XP`;
}

// ========== CREDITS ==========
function refreshCredits() {
    const credits = Credits.getCredits();
    const formatted = Credits.formatCredits(credits);

    document.getElementById('credits-badge').textContent = formatted;
    document.getElementById('header-credits').textContent = formatted;
    document.getElementById('wallet-balance').textContent = formatted;
}

// ========== PROJECTS ==========
function loadProjects() {
    const projects = UserData.getProjects();
    const grid = document.getElementById('projects-grid');
    const empty = document.getElementById('empty-projects');

    if (projects.length === 0) {
        grid.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    empty.style.display = 'none';

    grid.innerHTML = projects.map(project => `
        <div class="project-card" data-id="${project.id}">
            <div class="project-preview">
                <img src="${project.data?.profile?.avatar || 'https://ui-avatars.com/api/?name=Site&background=D4AF37&color=000'}" alt="${project.name}">
                <span class="project-status ${project.published ? 'published' : 'draft'}">
                    ${project.published ? 'Publicado' : 'Rascunho'}
                </span>
                <button class="btn-delete-project" onclick="deleteProjectConfirm('${project.id}')" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="project-info">
                <h3 class="project-name">${project.name}</h3>
                <p class="project-date">${formatDate(project.updatedAt)}</p>
                <div class="project-actions">
                    <button class="btn-secondary" onclick="editProject('${project.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    ${project.published ? `
                        <a href="${project.publishedUrl}" target="_blank" class="btn-secondary">
                            <i class="fas fa-external-link-alt"></i> Ver
                        </a>
                    ` : `
                        <button class="btn-primary" onclick="publishProject('${project.id}')">
                            <i class="fas fa-rocket"></i> Publicar
                        </button>
                    `}
                </div>
            </div>
        </div>
    `).join('');
}

function createNewProject() {
    const project = UserData.createProject('Novo Site');
    UserData.setCurrentProject(project.id);

    // Redirect to editor
    window.location.href = 'editor.html';
}

function editProject(id) {
    UserData.setCurrentProject(id);
    window.location.href = 'editor.html';
}

function publishProject(id) {
    const result = Credits.attemptPublish(id);

    if (result.success) {
        // Success
        showNotification('✅ ' + result.message);
        loadProjects();
        refreshCredits();
    } else if (result.action === 'first_purchase') {
        // First purchase - redirect to Kiwify
        showBuyModal('first', result);
    } else if (result.action === 'buy_credits') {
        // Need credits
        showBuyModal('credits', result);
    }
}

// ========== PACKAGES ==========
async function loadPackages() {
    const grid = document.getElementById('packages-grid');
    if (!grid) return;

    // Check if Payments module is available
    if (window.Payments && typeof Payments.getPackages === 'function') {
        const pkgs = Payments.getPackages();
        const discount = Payments.getUserDiscount ? Payments.getUserDiscount() : 0;

        // Show discount banner if user has a discount
        let discountBanner = '';
        if (discount > 0) {
            discountBanner = `
                <div class="discount-banner">
                    <i class="fas fa-star"></i>
                    Seu nível te dá <strong>${discount}% de desconto</strong> em todos os pacotes!
                </div>
            `;
        }

        grid.innerHTML = discountBanner + pkgs.map((pkg, i) => `
            <div class="credit-package ${i === 1 ? 'popular' : ''}" data-package-id="${pkg.id}">
                ${i === 1 ? '<span class="package-badge">Mais Popular</span>' : ''}
                <h3 class="package-name">${pkg.name}</h3>
                <div class="package-credits">
                    <span class="credits-amount">${pkg.totalCredits}</span>
                    <span class="credits-label">créditos</span>
                </div>
                ${pkg.bonus_credits > 0 ? `<div class="package-bonus">+${pkg.bonus_credits} bônus</div>` : ''}
                <div class="package-price">
                    ${pkg.discountPercent > 0 ? `
                        <span class="original-price">R$ ${pkg.originalPrice.toFixed(2)}</span>
                        <span class="discount-badge">-${pkg.discountPercent}%</span>
                    ` : ''}
                    <span class="final-price">R$ ${pkg.finalPrice.toFixed(2)}</span>
                </div>
                <button class="btn-buy" onclick="buyPackageMP('${pkg.id}')">
                    <i class="fab fa-pix"></i> Comprar
                </button>
            </div>
        `).join('');
    } else {
        // Fallback to old Credits system
        const packages = Credits.getPackages();
        grid.innerHTML = packages.map((pkg, i) => `
            <div class="package-card ${i === 1 ? 'popular' : ''}" onclick="buyPackage('${pkg.id}')">
                <p class="package-name">${pkg.label}</p>
                <p class="package-credits">${pkg.credits}</p>
                <p class="package-bonus">${pkg.bonus > 0 ? `+${pkg.bonus} bônus` : '&nbsp;'}</p>
                <p class="package-price">${Credits.formatPrice(pkg.price)}</p>
            </div>
        `).join('');
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
function deleteProjectConfirm(id) {
    const project = UserData.getProject(id);
    if (!project) return;

    if (confirm(`Tem certeza que deseja excluir "${project.name}"? Esta ação não pode ser desfeita.`)) {
        UserData.deleteProject(id);
        loadProjects();
        showNotification('Projeto excluído com sucesso!');
    }
}

// Expose functions globally
window.editProject = editProject;
window.publishProject = publishProject;
window.buyPackage = buyPackage;
window.buyPackageMP = buyPackageMP;
window.deleteProjectConfirm = deleteProjectConfirm;
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
    document.getElementById('modal-login').classList.remove('active');
}

function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-error').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('register-error').style.display = 'none';
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

// Setup logout button
document.getElementById('btn-logout')?.addEventListener('click', (e) => {
    e.preventDefault();
    doLogout();
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

// Expose login functions
window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;
window.showLoginForm = showLoginForm;
window.showRegisterForm = showRegisterForm;
window.doLogin = doLogin;
window.doRegister = doRegister;
window.doLogout = doLogout;
window.testLogin = testLogin;

// Check login on load (add small delay for modules to load)
setTimeout(() => {
    if (!Auth.isLoggedIn()) {
        showLoginModal();
    }
}, 100);
