/* ===========================
   DEMENI SITES - CREDITS MODULE
   Manages credits, purchases, and transactions
   =========================== */

const Credits = (function () {
    // ========== PRICING ==========
    const PRICING = {

        // Cost per site (in credits) - uses XPSystem.getCurrentSitePrice() at runtime
        SITE_COST: 40,

        // Credit packages
        PACKAGES: [
            { id: 'basic', price: 100, credits: 100, bonus: 0, label: 'Básico' },
            { id: 'silver', price: 200, credits: 250, bonus: 50, label: 'Prata' },
            { id: 'gold', price: 400, credits: 500, bonus: 0, label: 'Ouro' },
            { id: 'diamond', price: 600, credits: 1000, bonus: 400, label: 'Diamante' }
        ],

        // Kiwify links - TODO: Update with real package links when created
        KIWIFY_LINKS: {
            first: 'https://pay.kiwify.com.br/DzGxIEZ',
            basic: 'https://pay.kiwify.com.br/DzGxIEZ',
            silver: 'https://pay.kiwify.com.br/DzGxIEZ',
            gold: 'https://pay.kiwify.com.br/DzGxIEZ',
            diamond: 'https://pay.kiwify.com.br/DzGxIEZ'
        }
    };

    // ========== DAILY PUBLISH LIMITS ==========
    const DAILY_FREE_LIMIT = 10;
    const DAILY_TIERS = [
        { from: 1, to: 10, fee: 0 },      // 1º-10º site: grátis
        { from: 11, to: 20, fee: 10 },    // 11º ao 20º: R$10
        { from: 21, to: Infinity, fee: 15 } // 21º+: R$15
    ];

    function _getUserId() {
        return window.UserData?.getUser()?.id || 'default';
    }

    function getTodayPublishes() {
        const today = new Date().toISOString().slice(0, 10);
        const key = `demeni-publishes-${_getUserId()}-${today}`;
        return parseInt(localStorage.getItem(key) || '0');
    }

    function incrementTodayPublishes() {
        const today = new Date().toISOString().slice(0, 10);
        const key = `demeni-publishes-${_getUserId()}-${today}`;
        localStorage.setItem(key, getTodayPublishes() + 1);
    }

    function getExtraFee() {
        const count = getTodayPublishes() + 1; // próximo site
        for (const tier of DAILY_TIERS) {
            if (count >= tier.from && count <= tier.to) {
                return tier.fee;
            }
        }
        return 15; // fallback
    }

    function getRemainingFreePublishes() {
        return Math.max(0, DAILY_FREE_LIMIT - getTodayPublishes());
    }

    // ========== STORAGE KEY ==========
    const TRANSACTIONS_KEY = 'demeni-transactions';

    // ========== GET/SET CREDITS ==========
    function getCredits() {
        const user = UserData.getUser();
        return user.credits || 0;
    }

    function setCredits(amount) {
        UserData.updateUser({ credits: amount });
        return amount;
    }

    function addCredits(amount, source = 'purchase') {
        const current = getCredits();
        const newBalance = current + amount;
        setCredits(newBalance);

        // Log transaction
        logTransaction({
            type: 'credit',
            amount: amount,
            source: source,
            balance: newBalance
        });

        // Calculate XP (handled by XP module if loaded)
        if (window.XPSystem && source === 'purchase') {
            const xpGained = XPSystem.calculateXPFromCredits(amount);
            XPSystem.addXP(xpGained);
        }

        return newBalance;
    }

    function deductCredits(amount, reason = 'publish') {
        const current = getCredits();

        if (current < amount) {
            return { success: false, message: 'Créditos insuficientes', balance: current };
        }

        const newBalance = current - amount;
        setCredits(newBalance);

        // Log transaction
        logTransaction({
            type: 'debit',
            amount: amount,
            reason: reason,
            balance: newBalance
        });

        return { success: true, balance: newBalance };
    }

    // ========== CHECKS ==========
    function hasCredits(amount) {
        return getCredits() >= amount;
    }

    function canPublish() {
        const cost = window.XPSystem ? XPSystem.getCurrentSitePrice() : PRICING.SITE_COST;
        return hasCredits(cost);
    }

    function isFirstPurchase() {
        return false; // Legacy — entry is now via Starter Pack or credit packages
    }

    // ========== TRANSACTIONS ==========
    function getTransactions() {
        try {
            const data = localStorage.getItem(TRANSACTIONS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    function logTransaction(transaction) {
        const transactions = getTransactions();
        transactions.unshift({
            ...transaction,
            id: Date.now(),
            timestamp: new Date().toISOString()
        });

        // Keep only last 100 transactions
        if (transactions.length > 100) {
            transactions.pop();
        }

        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    }

    // ========== PUBLISH FLOW ==========
    function attemptPublish(projectId, subdomain) {
        // Users enter via Starter Pack (R$1) or credit packages

        // Custo dinâmico por patente
        const siteCost = window.XPSystem ? XPSystem.getCurrentSitePrice() : PRICING.SITE_COST;

        // Check credits
        if (!hasCredits(siteCost)) {
            return {
                success: false,
                action: 'buy_credits',
                required: siteCost,
                current: getCredits(),
                packages: PRICING.PACKAGES,
                message: 'Créditos insuficientes. Adquira mais créditos para publicar.'
            };
        }

        // Check daily fee
        const extraFee = getExtraFee();
        if (extraFee > 0) {
            return {
                success: false,
                action: 'daily_fee',
                fee: extraFee,
                siteCost: siteCost,
                todayCount: getTodayPublishes(),
                message: `Você já publicou ${getTodayPublishes()} site(s) hoje. Taxa extra de R$${extraFee}.`
            };
        }

        // Deduct and publish
        const result = deductCredits(siteCost, 'publish');

        if (result.success) {
            const publishedUrl = subdomain ? `https://${subdomain}.rafaeldemeni.com` : `https://demeni.bio/${projectId.slice(0, 8)}`;
            UserData.publishProject(projectId, publishedUrl);

            // Incrementar contador diário
            incrementTodayPublishes();

            // XP por publicação
            if (window.XPSystem) {
                XPSystem.addXP(XPSystem.CONFIG.XP_PER_PUBLISH);
            }

            return {
                success: true,
                action: 'published',
                balance: result.balance,
                xpGained: window.XPSystem ? XPSystem.CONFIG.XP_PER_PUBLISH : 0,
                publishedUrl: publishedUrl,
                message: 'Site publicado com sucesso!'
            };
        }

        return result;
    }

    /**
     * Confirma publicação com taxa extra (chamado após modal de confirmação)
     */
    function confirmPublishWithFee(projectId, subdomain) {
        const siteCost = window.XPSystem ? XPSystem.getCurrentSitePrice() : PRICING.SITE_COST;

        if (!hasCredits(siteCost)) {
            return { success: false, action: 'buy_credits', message: 'Créditos insuficientes.' };
        }

        // Deduct and publish (user already confirmed fee payment)
        const result = deductCredits(siteCost, 'publish');

        if (result.success) {
            const publishedUrl = subdomain ? `https://${subdomain}.rafaeldemeni.com` : `https://demeni.bio/${projectId.slice(0, 8)}`;
            UserData.publishProject(projectId, publishedUrl);
            incrementTodayPublishes();

            if (window.XPSystem) {
                XPSystem.addXP(XPSystem.CONFIG.XP_PER_PUBLISH);
            }

            return {
                success: true,
                action: 'published',
                balance: result.balance,
                xpGained: window.XPSystem ? XPSystem.CONFIG.XP_PER_PUBLISH : 0,
                publishedUrl: publishedUrl,
                message: 'Site publicado com sucesso!'
            };
        }

        return result;
    }

    // ========== PACKAGE INFO ==========
    function getPackages() {
        return PRICING.PACKAGES;
    }

    function getPackage(id) {
        return PRICING.PACKAGES.find(p => p.id === id);
    }

    function getPackageLink(id) {
        return PRICING.KIWIFY_LINKS[id] || PRICING.KIWIFY_LINKS.basic;
    }

    function getSiteCost() {
        return window.XPSystem ? XPSystem.getCurrentSitePrice() : PRICING.SITE_COST;
    }

    function getFirstSitePrice() {
        return 0; // Legacy — no longer used
    }

    // ========== SIMULATE PURCHASE (for testing) ==========
    function simulatePurchase(packageId) {
        const pkg = getPackage(packageId);
        if (!pkg) return { success: false, message: 'Pacote inválido' };

        const totalCredits = pkg.credits + pkg.bonus;
        addCredits(totalCredits, 'purchase');

        return {
            success: true,
            credits: totalCredits,
            balance: getCredits(),
            message: `Compra simulada! +${totalCredits} créditos`
        };
    }

    // ========== FORMAT HELPERS ==========
    function formatCredits(amount) {
        return amount.toLocaleString('pt-BR');
    }

    function formatPrice(amount) {
        return `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;
    }

    // ========== PUBLIC API ==========
    return {
        // Credits management
        getCredits,
        addCredits,
        deductCredits,
        hasCredits,
        canPublish,

        // Purchase flow
        isFirstPurchase,
        attemptPublish,
        confirmPublishWithFee,

        // Daily limits
        getTodayPublishes,
        getExtraFee,
        getRemainingFreePublishes,

        // Packages
        getPackages,
        getPackage,
        getPackageLink,
        getSiteCost,
        getFirstSitePrice,

        // Transactions
        getTransactions,

        // Testing
        simulatePurchase,

        // Formatting
        formatCredits,
        formatPrice,

        // Direct access to pricing
        PRICING
    };
})();

// Make available globally
window.Credits = Credits;
