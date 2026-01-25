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
    document.getElementById('border-tag').textContent = stats.patente.name;

    // Update avatar border with patente class
    const avatarWrapper = document.querySelector('.user-avatar');
    avatarWrapper.className = 'user-avatar';
    if (stats.patente.id !== 'default') {
        avatarWrapper.classList.add(stats.patente.id);
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
    const activeGrid = document.getElementById('active-projects-grid');
    const draftGrid = document.getElementById('draft-projects-grid');
    const activeSection = document.getElementById('active-section');
    const draftsSection = document.getElementById('drafts-section');
    const empty = document.getElementById('empty-projects');

    // Separar publicados e rascunhos
    const published = projects.filter(p => p.published);
    const drafts = projects.filter(p => !p.published);

    // Atualizar contadores
    document.getElementById('active-count').textContent = published.length;
    document.getElementById('drafts-count').textContent = drafts.length;

    if (projects.length === 0) {
        activeSection.style.display = 'none';
        draftsSection.style.display = 'none';
        activeGrid.style.display = 'none';
        draftGrid.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';

    // Mostrar/esconder seções conforme necessário
    activeSection.style.display = published.length > 0 ? 'block' : 'none';
    activeGrid.style.display = published.length > 0 ? 'grid' : 'none';
    draftsSection.style.display = drafts.length > 0 ? 'block' : 'none';
    draftGrid.style.display = drafts.length > 0 ? 'grid' : 'none';

    // Renderizar sites ativos (com botão copiar link)
    activeGrid.innerHTML = published.map(project => `
        <div class="project-card published" data-id="${project.id}">
            <div class="project-preview">
                <img src="${project.data?.profile?.avatar || 'https://ui-avatars.com/api/?name=Site&background=D4AF37&color=000'}" alt="${project.name}">
                <span class="project-status published">
                    <i class="fas fa-check-circle"></i> Ativo
                </span>
            </div>
            <div class="project-info">
                <h3 class="project-name">${project.name}</h3>
                <p class="project-url">${project.publishedUrl || ''}</p>
                <div class="project-actions">
                    <button class="btn-secondary" onclick="editProject('${project.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-secondary" onclick="copyProjectLink('${project.publishedUrl}')" title="Copiar link">
                        <i class="fas fa-copy"></i>
                    </button>
                    <a href="${project.publishedUrl}" target="_blank" class="btn-secondary">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
        </div>
    `).join('');

    // Renderizar rascunhos (sem badge pois já está na seção de rascunhos)
    draftGrid.innerHTML = drafts.map(project => {
        // Use thumbnail if available, otherwise fallback to avatar
        const previewImage = project.thumbnail
            || project.data?.profile?.avatar
            || 'https://ui-avatars.com/api/?name=Site&background=666&color=fff';
        const previewClass = project.thumbnail ? 'project-thumbnail' : '';

        // Use profile name if available, otherwise project name
        const displayName = project.data?.profile?.name || project.name || 'Novo Site';

        return `
        <div class="project-card draft" data-id="${project.id}">
            <div class="project-preview">
                <img src="${previewImage}" alt="${displayName}" class="${previewClass}">
                <button class="btn-delete-project" onclick="deleteProjectConfirm('${project.id}')" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="project-info">
                <h3 class="project-name">${displayName}</h3>
                <p class="project-date">${formatDate(project.updatedAt)}</p>
                <div class="project-actions">
                    <button class="btn-action" onclick="editProject('${project.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-action publish" onclick="publishProject('${project.id}')">
                        <i class="fas fa-rocket"></i> Publicar
                    </button>
                </div>
            </div>
        </div>
    `}).join('');
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

function selectModel(modelType) {
    // Model costs
    const modelCosts = {
        'modelo-1': 40,
        'modelo-2': 60,
        'modelo-3': 80
    };

    // Create project with model type
    const project = UserData.createProject('Novo Site');
    project.modelType = modelType;
    project.publishCost = modelCosts[modelType];
    UserData.updateProject(project.id, { modelType, publishCost: modelCosts[modelType] });
    UserData.setCurrentProject(project.id);

    closeModelSelectionModal();

    // Redirect to editor
    window.location.href = 'editor.html';
}

// Expose functions
window.showModelSelectionModal = showModelSelectionModal;
window.closeModelSelectionModal = closeModelSelectionModal;
window.selectModel = selectModel;

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
                </div>

                <button class="btn-buy-clicksign" onclick="buyPackageMP('${pkg.id}')">
                    <i class="fab fa-pix"></i> Comprar
                </button>

                ${pkg.description ? `<p class="pkg-description">${pkg.description}</p>` : ''}

                <ul class="pkg-features">
                    ${featuresHTML}
                </ul>
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
function deleteProjectConfirm(id) {
    const project = UserData.getProject(id);
    if (!project) return;

    if (confirm(`Tem certeza que deseja excluir "${project.name}"? Esta ação não pode ser desfeita.`)) {
        UserData.deleteProject(id);
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

// Expose functions globally
window.editProject = editProject;
window.publishProject = publishProject;
window.copyProjectLink = copyProjectLink;
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
