/* ===========================
   DEMENI SITES - ROUTER
   Roteamento de subdomínios para sites publicados
   =========================== */

const SiteRouter = (function () {
    const MAIN_DOMAIN = 'rafaeldemeni.com';
    const PLATFORM_SUBDOMAINS = ['www', 'sites', 'demeni-sites', 'localhost'];

    /**
     * Verifica se é um subdomínio de cliente (não a plataforma)
     * @returns {string|null} Slug do cliente ou null se for plataforma
     */
    function getClientSubdomain() {
        const hostname = window.location.hostname;

        // Localhost - não rotear
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return null;
        }

        // Vercel preview URLs - não rotear
        if (hostname.includes('vercel.app')) {
            return null;
        }

        // Extrair subdomínio
        const parts = hostname.split('.');
        if (parts.length < 2) return null;

        const subdomain = parts[0].toLowerCase();

        // Se for subdomínio da plataforma, não rotear
        if (PLATFORM_SUBDOMAINS.includes(subdomain)) {
            return null;
        }

        // É um subdomínio de cliente!
        return subdomain;
    }

    /**
     * Carrega site do cliente baseado no slug
     * @param {string} slug - Slug do site (ex: "pizzaria-jb")
     */
    async function loadClientSite(slug) {
        console.log(`🌐 Loading client site: ${slug}`);

        try {
            // Buscar site no Supabase
            if (window.SupabaseClient && SupabaseClient.isConfigured()) {
                const { data: site, error } = await SupabaseClient.getClient()
                    .from('projects')
                    .select('*')
                    .eq('slug', slug)
                    .eq('published', true)
                    .single();

                if (error || !site) {
                    console.error('Site not found:', slug);
                    showNotFoundPage(slug);
                    return;
                }

                // Renderizar o site do cliente
                renderClientSite(site);
            } else {
                // Fallback: buscar no localStorage (dev)
                const projects = JSON.parse(localStorage.getItem('demeni_projects') || '[]');
                const site = projects.find(p => p.slug === slug && p.published);

                if (!site) {
                    showNotFoundPage(slug);
                    return;
                }

                renderClientSite(site);
            }
        } catch (err) {
            console.error('Error loading site:', err);
            showNotFoundPage(slug);
        }
    }

    /**
     * Renderiza o site do cliente (substitui a página inteira)
     * @param {object} site - Dados do projeto
     */
    function renderClientSite(site) {
        const siteData = site.data || {};
        const profile = siteData.profile || {};
        const theme = siteData.theme || {};

        // Template do site link-na-bio
        document.documentElement.innerHTML = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${site.name || 'Site'}</title>
                <meta name="description" content="${profile.bio || ''}">
                <link rel="icon" href="${profile.avatar || ''}">
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Montserrat', sans-serif;
                        min-height: 100vh;
                        background: ${theme.backgroundColor || '#1a1a2e'};
                        color: ${theme.textColor || '#fff'};
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 40px 20px;
                    }
                    .profile-photo {
                        width: 120px;
                        height: 120px;
                        border-radius: 50%;
                        border: 4px solid ${theme.accentColor || '#D4AF37'};
                        object-fit: cover;
                        margin-bottom: 16px;
                    }
                    .profile-name {
                        font-size: 1.5rem;
                        font-weight: 700;
                        margin-bottom: 8px;
                    }
                    .profile-bio {
                        font-size: 0.9rem;
                        opacity: 0.8;
                        text-align: center;
                        max-width: 400px;
                        margin-bottom: 32px;
                    }
                    .links-container {
                        width: 100%;
                        max-width: 400px;
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                    }
                    .link-item {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 12px;
                        padding: 16px 24px;
                        background: ${theme.buttonColor || 'rgba(255,255,255,0.1)'};
                        border-radius: ${theme.buttonRadius || '12'}px;
                        text-decoration: none;
                        color: ${theme.textColor || '#fff'};
                        font-weight: 600;
                        transition: all 0.2s;
                    }
                    .link-item:hover {
                        transform: translateY(-2px);
                        opacity: 0.9;
                    }
                    .watermark {
                        margin-top: auto;
                        padding-top: 40px;
                        font-size: 0.75rem;
                        opacity: 0.5;
                    }
                    .watermark a {
                        color: inherit;
                        text-decoration: none;
                    }
                    .watermark a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                ${profile.avatar ? `<img src="${profile.avatar}" alt="${profile.name}" class="profile-photo">` : ''}
                <h1 class="profile-name">${profile.name || site.name}</h1>
                ${profile.bio ? `<p class="profile-bio">${profile.bio}</p>` : ''}
                <div class="links-container">
                    ${(siteData.links || []).map(link => `
                        <a href="${link.url}" target="_blank" class="link-item">
                            ${link.icon ? `<i class="${link.icon}"></i>` : ''}
                            ${link.title}
                        </a>
                    `).join('')}
                </div>
                <div class="watermark">
                    Criado com <a href="https://sites.rafaeldemeni.com" target="_blank">Demeni Sites</a>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Mostra página de site não encontrado
     * @param {string} slug 
     */
    function showNotFoundPage(slug) {
        document.body.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: 'Montserrat', sans-serif; background: #1a1a2e; color: #fff; text-align: center; padding: 20px;">
                <h1 style="font-size: 4rem; margin-bottom: 16px;">404</h1>
                <p style="font-size: 1.2rem; opacity: 0.8; margin-bottom: 32px;">Site "${slug}" não encontrado</p>
                <a href="https://sites.rafaeldemeni.com" style="padding: 12px 24px; background: #1B97C0; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">Criar meu site</a>
            </div>
        `;
    }

    /**
     * Inicializa o router - chama no início da página
     */
    function init() {
        const clientSlug = getClientSubdomain();

        if (clientSlug) {
            // É um site de cliente - carregar
            loadClientSite(clientSlug);
            return true; // Indica que está roteando
        }

        return false; // Não é roteamento, continue com a página normal
    }

    return {
        init,
        getClientSubdomain,
        loadClientSite
    };
})();

// Auto-init quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    SiteRouter.init();
});

window.SiteRouter = SiteRouter;
