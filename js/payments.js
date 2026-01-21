/* ===========================
   DEMENI SITES - PAYMENTS MODULE
   Mercado Pago Integration
   =========================== */

const Payments = (function () {
    // Mercado Pago Public Key (replace with yours)
    // Get from: https://www.mercadopago.com.br/developers/panel/app
    const MP_PUBLIC_KEY = 'APP_USR-a3a0d7e7-0cdd-4f62-b526-c2e535838a4b';

    // API endpoint for creating preferences (will be Supabase Edge Function)
    const API_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:54321/functions/v1'  // Supabase local
        : 'https://aeyxdqggngapczohqvbo.supabase.co/functions/v1';

    let mp = null;
    let packages = [];
    let userDiscount = 0;

    // ========== INITIALIZE ==========
    async function init() {
        // Load Mercado Pago SDK
        if (!window.MercadoPago && MP_PUBLIC_KEY !== 'YOUR_MP_PUBLIC_KEY') {
            await loadMPSDK();
            mp = new MercadoPago(MP_PUBLIC_KEY);
        }

        // Load packages and user discount
        await loadPackages();
        await loadUserDiscount();

        console.log('💳 Payments initialized');
    }

    function loadMPSDK() {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://sdk.mercadopago.com/js/v2';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    // ========== PACKAGES ==========
    async function loadPackages() {
        if (!window.SupabaseClient || !SupabaseClient.isConfigured()) {
            // Fallback packages
            packages = [
                { id: '1', name: 'Starter', credits: 50, price: 9.90, bonus_credits: 0 },
                { id: '2', name: 'Popular', credits: 150, price: 24.90, bonus_credits: 15 },
                { id: '3', name: 'Pro', credits: 500, price: 69.90, bonus_credits: 75 },
                { id: '4', name: 'Business', credits: 1500, price: 179.90, bonus_credits: 300 }
            ];
            return packages;
        }

        const { data, error } = await SupabaseClient.getClient()
            .from('credit_packages')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');

        if (data) packages = data;
        return packages;
    }

    async function loadUserDiscount() {
        const user = Auth.getCurrentUser();
        if (!user) {
            userDiscount = 0;
            return;
        }

        // Calculate discount based on level
        const level = user.level || 1;
        const discountTiers = [
            { minLevel: 50, discount: 20 },
            { minLevel: 20, discount: 15 },
            { minLevel: 10, discount: 10 },
            { minLevel: 5, discount: 5 },
            { minLevel: 1, discount: 0 }
        ];

        for (const tier of discountTiers) {
            if (level >= tier.minLevel) {
                userDiscount = tier.discount;
                break;
            }
        }
    }

    function getPackages() {
        return packages.map(pkg => ({
            ...pkg,
            originalPrice: pkg.price,
            finalPrice: calculateFinalPrice(pkg.price),
            discountPercent: userDiscount,
            totalCredits: pkg.credits + (pkg.bonus_credits || 0)
        }));
    }

    function calculateFinalPrice(basePrice) {
        return basePrice * (1 - userDiscount / 100);
    }

    // ========== CHECKOUT ==========
    async function createCheckout(packageId) {
        const pkg = packages.find(p => p.id === packageId);
        if (!pkg) throw new Error('Pacote não encontrado');

        const user = Auth.getCurrentUser();
        if (!user) throw new Error('Usuário não autenticado');

        const finalPrice = calculateFinalPrice(pkg.price);
        const totalCredits = pkg.credits + (pkg.bonus_credits || 0);

        // Create preference via Edge Function
        const response = await fetch(`${API_URL}/create-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await getAuthToken()}`
            },
            body: JSON.stringify({
                package_id: packageId,
                package_name: pkg.name,
                credits: totalCredits,
                price: finalPrice,
                user_id: user.id,
                user_email: user.email,
                discount_percent: userDiscount
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao criar checkout');
        }

        const data = await response.json();
        return data;
    }

    async function getAuthToken() {
        if (window.SupabaseClient) {
            const session = await SupabaseClient.getSession();
            return session?.access_token || '';
        }
        return '';
    }

    // ========== OPEN CHECKOUT MODAL ==========
    async function openCheckout(packageId) {
        try {
            showLoading(true);
            const checkout = await createCheckout(packageId);

            if (checkout.init_point) {
                // Redirect to Mercado Pago checkout
                window.location.href = checkout.init_point;
            } else if (checkout.preference_id && mp) {
                // Use embedded checkout
                mp.checkout({
                    preference: { id: checkout.preference_id },
                    render: { container: '#mp-checkout', label: 'Pagar' }
                });
            }
        } catch (error) {
            console.error('Checkout error:', error);
            showNotification('Erro ao processar pagamento', 'error');
        } finally {
            showLoading(false);
        }
    }

    // ========== TRANSACTION HISTORY ==========
    async function getTransactions(limit = 20) {
        if (!window.SupabaseClient || !SupabaseClient.isConfigured()) {
            return [];
        }

        const user = Auth.getCurrentUser();
        if (!user) return [];

        const { data } = await SupabaseClient.getClient()
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        return data || [];
    }

    // ========== UI HELPERS ==========
    function showLoading(show) {
        // Can be customized
        const loader = document.getElementById('payment-loader');
        if (loader) loader.style.display = show ? 'flex' : 'none';
    }

    function showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    // ========== RENDER PACKAGES UI ==========
    function renderPackagesUI(containerId = 'packages-container') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const pkgs = getPackages();

        container.innerHTML = pkgs.map((pkg, index) => `
            <div class="credit-package ${index === 1 ? 'popular' : ''}" data-package-id="${pkg.id}">
                ${index === 1 ? '<span class="package-badge">Mais Popular</span>' : ''}
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
                <button class="btn-buy" onclick="Payments.openCheckout('${pkg.id}')">
                    <i class="fab fa-pix"></i> Comprar
                </button>
            </div>
        `).join('');
    }

    // ========== PUBLIC API ==========
    return {
        init,
        getPackages,
        openCheckout,
        getTransactions,
        renderPackagesUI,
        getUserDiscount: () => userDiscount
    };
})();

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => Payments.init(), 500);
});

window.Payments = Payments;
