/* ============================================
   EDITOR D2 - STATE MANAGER
   Gerenciador de estado centralizado para o Editor D2
   ============================================ */

/**
 * D2 Editor State Manager
 * Gerencia todo o estado do editor e notifica listeners de mudanças
 */
class D2StateManager {
    constructor() {
        // Estado inicial do editor
        this.state = this.getDefaultState();

        // Listeners para mudanças de estado
        this.listeners = new Set();

        // 🛡️ Proteção: bloqueia save até loadState() carregar dados reais
        this._dataLoaded = false;

        // Debounce para preview
        this.previewDebounceTimer = null;
        this.previewDebounceMs = 50;

        // 🛡️ Checkpoint / Recovery — agora via IndexedDB (sem limite de tamanho)
        this._checkpointDbName = 'demeni_checkpoints';
        this._checkpointStoreName = 'checkpoints';
        this._checkpointKey = 'last_checkpoint';
        this._crashFlagKey = 'demeni_d2_editorActive';
        this._checkpointDb = null; // Será inicializado async

        // Detecta crash na sessão anterior
        this._crashDetected = localStorage.getItem(this._crashFlagKey) === 'true';
        if (this._crashDetected) {
            console.warn('[D2 State] ⚠️ Crash detectado na sessão anterior — checkpoint disponível');
        }

        // Marca editor como ativo (será limpo no beforeunload)
        this._setupCrashDetection();

        // Inicializa IndexedDB para checkpoints
        this._initCheckpointDB();

        console.log('[D2 State Manager] Initialized');
    }

    /**
     * 🛡️ Inicializa IndexedDB dedicado para checkpoints
     * Separado do DB principal para evitar conflitos
     */
    async _initCheckpointDB() {
        try {
            const request = indexedDB.open(this._checkpointDbName, 1);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this._checkpointStoreName)) {
                    db.createObjectStore(this._checkpointStoreName);
                }
            };
            this._checkpointDb = await new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
            console.log('[D2 State] ✅ Checkpoint IndexedDB inicializado');

            // Migrar checkpoint antigo do localStorage (se existir)
            this._migrateLocalStorageCheckpoint();
        } catch (e) {
            console.warn('[D2 State] ⚠️ IndexedDB para checkpoints falhou:', e.message);
        }
    }

    /**
     * 🛡️ Migra checkpoint do localStorage para IndexedDB (one-time)
     */
    async _migrateLocalStorageCheckpoint() {
        try {
            const raw = localStorage.getItem('demeni_d2_checkpoint');
            if (!raw) return;
            const data = JSON.parse(raw);
            if (data && data.state) {
                await this._idbSaveCheckpoint(this._checkpointKey, data);
                localStorage.removeItem('demeni_d2_checkpoint');
                console.log('[D2 State] 📦 Checkpoint migrado de localStorage → IndexedDB');
            }
        } catch (e) {
            console.warn('[D2 State] Falha ao migrar checkpoint:', e.message);
        }
    }

    /**
     * 🛡️ Salva dados no IndexedDB de checkpoints
     */
    async _idbSaveCheckpoint(key, data) {
        if (!this._checkpointDb) {
            console.warn('[D2 State] Checkpoint DB não disponível');
            return false;
        }
        try {
            const tx = this._checkpointDb.transaction(this._checkpointStoreName, 'readwrite');
            const store = tx.objectStore(this._checkpointStoreName);
            store.put(data, key);
            await new Promise((resolve, reject) => {
                tx.oncomplete = resolve;
                tx.onerror = () => reject(tx.error);
            });
            return true;
        } catch (e) {
            console.warn('[D2 State] Falha ao salvar no IndexedDB:', e.message);
            return false;
        }
    }

    /**
     * 🛡️ Carrega dados do IndexedDB de checkpoints
     */
    async _idbLoadCheckpoint(key) {
        if (!this._checkpointDb) return null;
        try {
            const tx = this._checkpointDb.transaction(this._checkpointStoreName, 'readonly');
            const store = tx.objectStore(this._checkpointStoreName);
            const request = store.get(key);
            return await new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            console.warn('[D2 State] Falha ao ler IndexedDB:', e.message);
            return null;
        }
    }

    /**
     * 🛡️ Remove dados do IndexedDB de checkpoints
     */
    async _idbDeleteCheckpoint(key) {
        if (!this._checkpointDb) return;
        try {
            const tx = this._checkpointDb.transaction(this._checkpointStoreName, 'readwrite');
            const store = tx.objectStore(this._checkpointStoreName);
            store.delete(key);
            await new Promise((resolve, reject) => {
                tx.oncomplete = resolve;
                tx.onerror = () => reject(tx.error);
            });
        } catch (e) {
            console.warn('[D2 State] Falha ao deletar IndexedDB:', e.message);
        }
    }

    /**
     * Retorna o estado padrão para um novo projeto D2
     */
    getDefaultState() {
        return {
            // Metadados do projeto
            projectId: null,
            projectName: 'Novo Projeto D2',
            projectStatus: 'draft',

            // Seção selecionada no editor
            selectedSection: 'hero',

            // Dados do perfil (usados no Hero e CTA)
            profile: {
                name: 'Meu Negócio',
                role: 'Descrição do seu negócio',
                logo: null
            },

            // Ordem e visibilidade das seções
            d2Sections: [
                { id: 'hero', name: 'Hero', icon: 'fa-image', enabled: true, locked: true },
                { id: 'categorias', name: 'Categorias', icon: 'fa-th-large', enabled: true, locked: false },
                { id: 'produtos', name: 'Produtos', icon: 'fa-shopping-bag', enabled: true, locked: false },
                { id: 'feedbacks', name: 'Feedbacks', icon: 'fa-comments', enabled: true, locked: false },
                { id: 'cta', name: 'CTA', icon: 'fa-bullhorn', enabled: true, locked: false },
                { id: 'footer', name: 'Footer', icon: 'fa-copyright', enabled: true, locked: true },
                { id: 'pwa', name: 'PWA / Ícone', icon: 'fa-mobile-alt', enabled: true, locked: true }
            ],

            // Produtos para a seção de produtos
            d2Products: [
                { id: 1, title: 'Produto 1', price: 'R$ 99,90', image: '', link: '' },
                { id: 2, title: 'Produto 2', price: 'R$ 149,90', image: '', link: '' },
                { id: 3, title: 'Produto 3', price: 'R$ 199,90', image: '', link: '' },
                { id: 4, title: 'Produto 4', price: 'R$ 249,90', image: '', link: '' }
            ],

            // Feedbacks/depoimentos
            d2Feedbacks: [
                { id: 1, name: 'Cliente 1', text: 'Excelente experiência! Recomendo muito.', avatar: '', link: '' },
                { id: 2, name: 'Cliente 2', text: 'Ótimo atendimento e qualidade impecável!', avatar: '', link: '' }
            ],

            // Dados dos banners divisores (mapa por ID)
            d2Banners: {},

            // === AJUSTES VISUAIS GRANULARES ===
            d2Adjustments: {
                // Header
                header: {
                    logo: { size: 28, color: 'white' },
                    logoPosition: 'left', // 'left', 'center', 'right'
                    height: 80,
                    autoHide: false,
                    bgColor: '#2d2d2d',
                    bgType: 'solid', // 'solid', 'gradient', 'glass', 'image'
                    bgGradient: 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)',
                    bgGradientOrientation: 'horizontal', // 'horizontal', 'vertical'
                    bgGradientInvert: false,
                    bgGlass: false,
                    bgGlassBlur: 10,
                    bgImage: null,
                    bgImageSizeH: 100,
                    bgImageSizeV: 100,
                    bgImageZoom: 100,
                    textColor: '#ffffff',
                    sidebar: {
                        bgColor: '#1a1a1a',
                        textColor: '#ffffff',
                        accentColor: '#e67e22',
                        width: 280,
                        fontSize: 15,
                        iconSize: 16,
                        itemPadding: 14,
                        borderWidth: 3,
                        showSeparators: false
                    }
                },

                hero: {
                    sectionHeight: 56, // vh - altura da seção (max ~16:9)
                    contentPadding: 60, // px - padding do conteúdo (embaixo)
                    textPosition: 'bottom', // 'top', 'center', 'bottom' - posição vertical do texto
                    bgImage: 'img/hero-bg.webp', // Imagem pré-carregada do template
                    bgColor: '#1a1a2e', // Cor de fundo quando sem imagem
                    gradient: {
                        enabled: true,
                        intensity: 60, // 0-100 - intensidade do degradê
                        position: 50, // 0-100 - onde começa o degradê (% do topo)
                        colorStart: 'transparent',
                        colorMid: 'rgba(10,10,10,0.6)',
                        colorEnd: '#0a0a0a'
                    },
                    scrollIndicator: {
                        enabled: true,
                        color: '#ffffff'
                    },
                    title: {
                        text: '',
                        size: 56,
                        spacing: 4,
                        weight: 400,
                        color: '#ffffff',
                        font: 'Montserrat',
                        textGradient: { enabled: false, gradient: 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)' },
                        padding: { top: 0, bottom: 0, left: 0, right: 0 }
                    },
                    subtitle: {
                        text: '',  // Se vazio, usa profile.role
                        size: 22,
                        spacing: 32,
                        weight: 300,
                        color: '#ffffff',
                        font: 'Montserrat',
                        padding: { top: 0, bottom: 0, left: 0, right: 0 }
                    },
                    btn: {
                        text: 'QUERO SABER MAIS',
                        link: '#',
                        textStyle: {
                            size: 16,
                            spacing: 1,
                            weight: 600,
                            color: '#ffffff',
                            font: 'Montserrat'
                        },
                        paddingInner: { vertical: 12, horizontal: 40 },
                        paddingOuter: { top: 0, bottom: 0, left: 0, right: 0 },
                        bgType: 'gradient',  // 'solid' ou 'gradient'
                        bgColor: '#5167E7',
                        bgPreset: 'blue', // 'blue', 'yellow', 'red', 'green', 'pink', 'purple', 'gray', 'black', 'offwhite', 'orange', 'brown'
                        bgGradient: 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)',
                        borderColor: 'transparent',
                        borderRadius: 30,
                        hoverAnimation: true
                    }
                },

                // Categorias
                categorias: {
                    topLine: { enabled: false, height: 3, bgType: 'gradient', bgColor: '#5167E7', bgGradient: 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)' },
                    sectionSpacing: 40,
                    bgMode: 'color',
                    bgColor: '#ffffff',
                    bgColor2: '#d0d0d0',
                    bgGradient: false,
                    bgGradientInvert: false,
                    bgImage: null,
                    bgOverlay: false,
                    bgOverlayType: 'solid',
                    bgOverlayColor: '#000000',
                    bgOverlayColor2: '#000000',
                    bgOverlayOpacity: 50,
                    bgOverlayInvert: false,
                    bgOverlayPosition: 50,
                    bgOverlaySpread: 80,
                    bgImageBlur: 0,
                    bgImageZoom: 100,
                    bgImagePosX: 50,
                    bgImagePosY: 0,
                    sectionTitle: { text: 'Categorias', size: 28, color: '#333333', weight: 400, enabled: false, paddingTop: 0, gap: 6, paddingBottom: 16, textGradient: { enabled: false, gradient: 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 50%, #2D3A81 100%)' } },
                    sectionSubtitle: { text: 'Encontre o que precisa', size: 14, color: '#666666', weight: 400, enabled: false },
                    icon: { size: 80, radius: 18, color: '#333333', bgColor: '#f5f5f5' },
                    label: { size: 12, weight: 500, color: '#222222' },
                    items: [
                        { id: 1, label: 'PRODUTOS', icon: 'fa-box-open', customIcon: null },
                        { id: 2, label: 'SERVIÇOS', icon: 'fa-concierge-bell', customIcon: null },
                        { id: 3, label: 'EDUCAÇÃO', icon: 'fa-graduation-cap', customIcon: null },
                        { id: 4, label: 'SOBRE', icon: 'fa-info-circle', customIcon: null }
                    ]
                },

                // Produtos
                produtos: {
                    topLine: { enabled: false, height: 3, bgType: 'gradient', bgColor: '#5167E7', bgGradient: 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)' },
                    sectionSpacing: 30,
                    bgMode: 'color',
                    bgColor: '#1a365d',
                    bgColor2: '#0d1b36',
                    bgGradient: false,
                    bgGradientInvert: false,
                    bgImage: null,
                    bgOverlay: false,
                    bgOverlayType: 'solid',
                    bgOverlayColor: '#000000',
                    bgOverlayColor2: '#000000',
                    bgOverlayOpacity: 50,
                    bgOverlayInvert: false,
                    bgOverlayPosition: 50,
                    bgOverlaySpread: 80,
                    bgImageBlur: 0,
                    bgImageZoom: 100,
                    bgImagePosX: 50,
                    bgImagePosY: 0,
                    sectionTitle: { text: 'Produtos Demeni', size: 36, color: '#ffffff', weight: 400, enabled: true, paddingTop: 0, gap: 6, paddingBottom: 24, textGradient: { enabled: false, gradient: 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 50%, #2D3A81 100%)' } },
                    sectionSubtitle: { text: 'Confira nossos destaques', size: 14, color: 'rgba(255,255,255,0.7)', weight: 400, enabled: false },
                    gridGap: 16,
                    gridColumns: 2,
                    sectionPaddingH: 32,
                    card: {
                        bgColor: '#ffffff',
                        borderRadius: 20,
                        shadow: '0 2px 8px rgba(0,0,0,0.1)',
                        padding: 6,
                        borderEnabled: false,
                        borderWidth: 1,
                        borderColor: '#e0e0e0'
                    },
                    title: { size: 15, weight: 500, color: '#333333' },
                    preco: { size: 16, weight: 800, color: '#333333', currencyStyle: 'normal' },
                    btn: { size: 13, bgColor: '#25D366', color: '#ffffff', borderRadius: 20, paddingH: 14, paddingV: 6, marginTop: 0 }
                },

                // Feedbacks
                feedbacks: {
                    topLine: { enabled: false, height: 3, bgType: 'gradient', bgColor: '#5167E7', bgGradient: 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)' },
                    sectionSpacing: 30,
                    bgMode: 'color',
                    bgColor: '#e8e8e8',
                    bgColor2: '#d0d0d0',
                    bgGradient: false,
                    bgGradientInvert: false,
                    bgImage: null,
                    bgOverlay: false,
                    bgOverlayType: 'solid',
                    bgOverlayColor: '#000000',
                    bgOverlayColor2: '#000000',
                    bgOverlayOpacity: 50,
                    bgOverlayInvert: false,
                    bgOverlayPosition: 50,
                    bgOverlaySpread: 80,
                    bgImageBlur: 0,
                    bgImageZoom: 100,
                    bgImagePosX: 50,
                    bgImagePosY: 0,
                    sectionTitle: { text: 'O que estão dizendo?', size: 28, color: '#333333', weight: 400, enabled: true, paddingTop: 0, gap: 6, paddingBottom: 24, textGradient: { enabled: false, gradient: 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 50%, #2D3A81 100%)' } },
                    sectionSubtitle: { text: 'Depoimentos de nossos clientes', size: 14, color: '#666666', weight: 400, enabled: false },
                    avatar: { size: 60, radius: 8 },
                    name: { size: 16, weight: 500, color: '#1a365d' },
                    text: { size: 13, weight: 400, color: '#666666' },
                    card: { bgColor: '#f5f5f5', borderRadius: 12, glass: false, glassBlur: 10, borderEnabled: false, borderWidth: 1, borderColor: '#e0e0e0' },
                    cardAnimation: true,
                    bottomCta: { enabled: false, text: 'Faça parte dos nossos clientes satisfeitos!', size: 16, weight: 400, color: '#333333', paddingTop: 20, paddingBottom: 20 }
                },

                // CTA Secundário
                cta: {
                    topLine: { enabled: false, height: 3, bgType: 'gradient', bgColor: '#5167E7', bgGradient: 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)' },
                    bgMode: 'image',
                    bgColor: '#1a365d',
                    bgColor2: '#0d1b2a',
                    bgGradient: false,
                    bgGradientInvert: false,
                    bgImage: null,
                    bgImageBlur: 0,
                    bgImageZoom: 100,
                    bgImagePosX: 50,
                    bgImagePosY: 0,
                    bgOverlay: true,
                    bgOverlayType: 'solid',
                    bgOverlayColor: '#000000',
                    bgOverlayColor2: '#000000',
                    bgOverlayOpacity: 50,
                    bgOverlayInvert: false,
                    bgOverlayPosition: 50,
                    bgOverlaySpread: 80,
                    height: 250,
                    title: {
                        text: '',
                        size: 52,
                        weight: 400,
                        color: '#ffffff'
                    },
                    subtitle: {
                        text: '',
                        size: 22,
                        weight: 400,
                        color: '#ffffff',
                        opacity: 0.8
                    },
                    btn: {
                        text: 'QUERO SABER MAIS',
                        link: '#',
                        bgType: 'gradient',
                        bgGradient: 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)',
                        borderRadius: 30,
                        hoverAnimation: true
                    }
                },

                // Footer
                footer: {
                    topLine: { enabled: false, height: 3, bgType: 'gradient', bgColor: '#5167E7', bgGradient: 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)' },
                    sectionSpacing: 40,
                    bgColor: '#1a365d',
                    bgType: 'solid', // 'solid' ou 'gradient'
                    bgGradient: 'linear-gradient(135deg, #1a365d 0%, #2d3a81 50%, #0d1b36 100%)',
                    logo: { size: 28, opacity: 0.8, color: 'white' },
                    title: { text: 'Invista no seu negócio!', size: 24, color: '#ffffff' },
                    subtitle: { text: '', size: 14, opacity: 0.6 },
                    info: {
                        email: '',
                        phone: '',
                        cnpj: '',
                        size: 13,
                        opacity: 0.8
                    },
                    social: {
                        size: 28,
                        gap: 12,
                        instagram: '',
                        facebook: '',
                        whatsapp: ''
                    }
                },

                // PWA / Favicon
                pwa: {
                    favicon: {
                        mode: 'auto',       // 'auto' (iniciais) ou 'upload'
                        image: null,         // base64 ou URL se upload
                        bgColor: '#1a365d',  // fundo do ícone auto
                        textColor: '#ffffff',// texto do ícone auto
                        shape: 'circle'      // 'circle' ou 'rounded-square'
                    },
                    themeColor: '#1a365d',    // cor da barra do browser
                    appName: ''              // nome do app (default = hero title)
                }
            }
        };
    }

    /**
     * 🛡️ Configura detecção de crash via flag no localStorage
     */
    _setupCrashDetection() {
        // Marca editor como ativo
        localStorage.setItem(this._crashFlagKey, 'true');

        // Limpa flag quando o editor fecha normalmente
        window.addEventListener('beforeunload', () => {
            localStorage.removeItem(this._crashFlagKey);
        });

        // Também limpa ao navegar dentro do SPA (sair do editor)
        document.addEventListener('demeni:leaving-editor', () => {
            localStorage.removeItem(this._crashFlagKey);
        });
    }

    /**
     * 🛡️ Salva checkpoint do estado atual no IndexedDB
     * Persiste por 24h — sem limite de tamanho (suporta imagens base64)
     */
    async saveCheckpoint() {
        try {
            const data = {
                state: this.exportState(),
                timestamp: Date.now(),
                projectId: this.state.projectId
            };
            const ok = await this._idbSaveCheckpoint(this._checkpointKey, data);
            if (ok) {
                const size = JSON.stringify(data.state).length;
                console.log(`[D2 State] 📌 Checkpoint salvo no IndexedDB (${(size / 1024).toFixed(1)}KB)`);
            }
        } catch (e) {
            console.warn('[D2 State] Falha ao salvar checkpoint:', e.message);
        }
    }

    /**
     * 🛡️ Verifica se há checkpoint de recuperação disponível (async — IndexedDB)
     * @returns {Promise<boolean>}
     */
    async hasRecoveryCheckpoint() {
        try {
            const data = await this._idbLoadCheckpoint(this._checkpointKey);
            if (!data) return false;
            // Checkpoint precisa não ser muito antigo (< 24h)
            const age = Date.now() - (data.timestamp || 0);
            return age < 24 * 60 * 60 * 1000;
        } catch {
            return false;
        }
    }

    /**
     * 🛡️ Restaura estado do checkpoint (async — IndexedDB)
     * @returns {Promise<boolean>} true se restaurou com sucesso
     */
    async restoreFromCheckpoint() {
        try {
            const data = await this._idbLoadCheckpoint(this._checkpointKey);
            if (!data || !data.state) return false;

            // Validar que checkpoint não expirou (24h)
            const age = Date.now() - (data.timestamp || 0);
            if (age > 24 * 60 * 60 * 1000) {
                console.warn('[D2 State] ⚠️ Checkpoint expirado (> 24h) — ignorando');
                await this.clearCheckpoint();
                return false;
            }

            this.loadState(data.state);
            console.log('[D2 State] ✅ Restaurado do checkpoint de', new Date(data.timestamp).toLocaleString());

            // Limpa crash flag
            this._crashDetected = false;
            return true;
        } catch (e) {
            console.error('[D2 State] Falha ao restaurar checkpoint:', e);
            return false;
        }
    }

    /**
     * 🛡️ Limpa checkpoint (após recuperação ou descarte)
     */
    async clearCheckpoint() {
        await this._idbDeleteCheckpoint(this._checkpointKey);
        this._crashDetected = false;
    }

    /**
     * Obtém o estado atual
     */
    getState() {
        return this.state;
    }

    /**
     * Obtém um valor específico do estado usando caminho de string
     * Ex: get('d2Adjustments.hero.title.size') 
     */
    get(path, defaultValue = null) {
        const keys = path.split('.');
        let value = this.state;

        for (const key of keys) {
            if (value === null || value === undefined || typeof value !== 'object') {
                return defaultValue;
            }
            value = value[key];
        }

        return value !== undefined ? value : defaultValue;
    }

    /**
     * Define um valor no estado usando caminho de string
     * Ex: set('d2Adjustments.hero.title.size', 48)
     */
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let obj = this.state;

        // Navega até o objeto pai, criando objetos se necessário
        for (const key of keys) {
            if (obj[key] === undefined || obj[key] === null) {
                obj[key] = {};
            }
            obj = obj[key];
        }

        // Define o valor
        const oldValue = obj[lastKey];
        obj[lastKey] = value;

        // Notifica listeners se o valor mudou
        if (oldValue !== value) {
            this.notifyListeners(path, value, oldValue);
            this.schedulePreviewUpdate();
            this.scheduleSave();
        }

        return this;
    }

    /**
     * Atualiza múltiplos valores de uma vez
     * Ex: update({ 'd2Adjustments.hero.title.size': 48, 'd2Adjustments.hero.title.color': '#fff' })
     */
    update(updates) {
        for (const [path, value] of Object.entries(updates)) {
            this.set(path, value);
        }
        return this;
    }

    /**
     * Atualiza um objeto inteiro fazendo merge
     */
    merge(path, partialValue) {
        const currentValue = this.get(path, {});
        const newValue = { ...currentValue, ...partialValue };
        this.set(path, newValue);
        return this;
    }

    /**
     * Adiciona um listener para mudanças de estado
     */
    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    /**
     * Notifica todos os listeners sobre uma mudança
     */
    notifyListeners(path, newValue, oldValue) {
        for (const listener of this.listeners) {
            try {
                listener({ path, newValue, oldValue, state: this.state });
            } catch (error) {
                console.error('[D2 State Manager] Error in listener:', error);
            }
        }

        // Auto-save após cada mudança (com debounce)
        this.scheduleSave();
    }

    /**
     * Agenda salvamento com debounce para evitar salvamentos excessivos
     */
    scheduleSave() {
        // 🛡️ Proteção: bloqueia save se dados reais ainda não foram carregados
        if (!this._dataLoaded) {
            console.warn('[D2 State] ⛔ Save bloqueado — dados ainda não carregados do IndexedDB');
            return;
        }

        if (this.saveDebounceTimer) {
            clearTimeout(this.saveDebounceTimer);
        }

        this.saveDebounceTimer = setTimeout(() => {
            this.saveToStorage();
        }, 500); // Salva 500ms após a última mudança
    }

    /**
     * Salva o estado atual no localStorage via UserData
     */
    saveToStorage() {
        if (!window.UserData) {
            console.warn('[D2 State Manager] UserData not available');
            return;
        }

        // 🛡️ Proteção dupla: recusar save se dados não foram carregados
        if (!this._dataLoaded) {
            console.warn('[D2 State] ⛔ saveToStorage bloqueado — _dataLoaded = false');
            return;
        }

        const projectId = UserData.getCurrentProjectId();
        if (!projectId) {
            console.warn('[D2 State Manager] No current project to save');
            return;
        }

        const stateData = this.exportState();
        UserData.updateProject(projectId, { data: stateData });

        // 🛡️ Salva checkpoint para recuperação
        this.saveCheckpoint();

        // 📊 Monitor de tamanho do estado
        if (window.StateValidator) {
            const size = window.StateValidator.estimateSize(stateData);
            if (size.bytes > 3 * 1024 * 1024) {
                console.warn(`[D2 State] ⚠️ Estado grande: ${size.mb}MB (${size.imageCount} imagens) — considere otimizar`);
            }
        }

        console.log('[D2 State Manager] Auto-saved to storage');

        // ✓ Indicador visual de salvamento
        if (window.UIEnhancements) {
            window.UIEnhancements.showSaved();
            window.UIEnhancements.markSaved();
        }
    }

    // Thumbnail capture removed — now handled by ThumbnailCapture module (thumbnail.js)
    // Called only on Publish/Update, never realtime

    /**
     * Agenda atualização do preview com debounce
     */
    schedulePreviewUpdate() {
        if (this.previewDebounceTimer) {
            clearTimeout(this.previewDebounceTimer);
        }

        this.previewDebounceTimer = setTimeout(() => {
            this.updatePreview();
        }, this.previewDebounceMs);
    }

    /**
     * Atualiza o preview do site
     */
    updatePreview() {
        const frame = document.getElementById('preview-frame')
            || document.getElementById('preview-frame-d2');
        if (frame && typeof window.renderPreviewD2New === 'function') {
            window.renderPreviewD2New(frame, this.state);
        }
    }

    /**
     * Reordena as seções
     */
    reorderSections(fromIndex, toIndex) {
        const sections = [...this.state.d2Sections];
        const [moved] = sections.splice(fromIndex, 1);
        sections.splice(toIndex, 0, moved);

        this.state.d2Sections = sections;
        this.notifyListeners('d2Sections', sections, null);
        this.schedulePreviewUpdate();
    }

    /**
     * Seleciona uma seção para edição
     */
    selectSection(sectionId) {
        const oldValue = this.state.selectedSection;
        this.state.selectedSection = sectionId;
        this.notifyListeners('selectedSection', sectionId, oldValue);
    }

    /**
     * Adiciona uma nova seção
     */
    addSection(sectionType) {
        // Definições de seções disponíveis
        const sectionDefs = {
            categorias: { id: 'categorias', name: 'Categorias', icon: 'fa-th-large' },
            produtos: { id: 'produtos', name: 'Produtos', icon: 'fa-shopping-bag' },
            feedbacks: { id: 'feedbacks', name: 'Feedbacks', icon: 'fa-comments' },
            cta: { id: 'cta', name: 'CTA', icon: 'fa-bullhorn' },
            galeria: { id: 'galeria', name: 'Galeria', icon: 'fa-images' },
            video: { id: 'video', name: 'Vídeo', icon: 'fa-play-circle' },
            faq: { id: 'faq', name: 'FAQ', icon: 'fa-question-circle' },
            texto: { id: 'texto', name: 'Texto Livre', icon: 'fa-align-left' },
            banner: { id: 'banner', name: 'Banner Divisor', icon: 'fa-minus' }
        };

        const def = sectionDefs[sectionType];
        if (!def) return null;

        // Banner permite múltiplas instâncias (ID único)
        const isBanner = sectionType === 'banner';
        const sectionId = isBanner ? `banner-${Date.now()}` : def.id;

        // Verifica duplicata (exceto para banner)
        if (!isBanner) {
            const exists = this.state.d2Sections.some(s => s.id === def.id);
            if (exists) {
                console.warn(`[D2 State Manager] Seção ${sectionType} já existe`);
                return null;
            }
        }

        // Encontra o índice do Footer (sempre deve ser o último)
        const footerIndex = this.state.d2Sections.findIndex(s => s.id === 'footer');
        const insertIndex = footerIndex !== -1 ? footerIndex : this.state.d2Sections.length;

        // Cria a nova seção
        const newSection = {
            id: sectionId,
            name: isBanner ? 'Banner Divisor' : def.name,
            icon: def.icon,
            enabled: true,
            locked: false
        };

        // Inicializa dados do banner
        if (isBanner) {
            if (!this.state.d2Banners) this.state.d2Banners = {};
            this.state.d2Banners[sectionId] = {
                title: 'Título do Banner',
                subtitle: '',
                bgColor: '#1a365d',
                bgType: 'solid',
                bgGradient: 'linear-gradient(135deg, #5167E7 0%, #2D3A81 100%)',
                textColor: '#ffffff'
            };
        }

        // Insere antes do Footer
        this.state.d2Sections.splice(insertIndex, 0, newSection);
        this.notifyListeners('d2Sections', this.state.d2Sections, null);
        this.schedulePreviewUpdate();

        console.log(`[D2 State Manager] Seção ${sectionType} adicionada (id: ${sectionId})`);
        return newSection;
    }

    /**
     * Remove uma seção
     */
    removeSection(sectionId) {
        const section = this.state.d2Sections.find(s => s.id === sectionId);
        if (!section || section.locked) {
            console.warn(`[D2 State Manager] Não é possível remover seção ${sectionId}`);
            return false;
        }

        this.state.d2Sections = this.state.d2Sections.filter(s => s.id !== sectionId);

        // Limpa dados do banner se for banner
        if (sectionId.startsWith('banner-') && this.state.d2Banners) {
            delete this.state.d2Banners[sectionId];
        }

        this.notifyListeners('d2Sections', this.state.d2Sections, null);
        this.schedulePreviewUpdate();

        // Se a seção removida estava selecionada, seleciona o Hero
        if (this.state.selectedSection === sectionId) {
            this.selectSection('hero');
        }

        console.log(`[D2 State Manager] Seção ${sectionId} removida`);
        return true;
    }

    /**
     * Toggle visibilidade de uma seção
     */
    toggleSectionVisibility(sectionId) {
        const index = this.state.d2Sections.findIndex(s => s.id === sectionId);
        if (index === -1) return false;

        const section = this.state.d2Sections[index];
        if (section.locked) return false;

        this.state.d2Sections[index].enabled = !section.enabled;
        this.notifyListeners('d2Sections', this.state.d2Sections, null);
        this.schedulePreviewUpdate();

        return this.state.d2Sections[index].enabled;
    }

    /**
     * Adiciona um novo produto
     */
    addProduct(product = {}) {
        const id = Date.now();
        const newProduct = {
            id,
            title: product.title || 'Novo Produto',
            price: product.price || 'R$ 0,00',
            image: product.image || null,
            link: product.link || ''
        };

        this.state.d2Products.push(newProduct);
        this.notifyListeners('d2Products', this.state.d2Products, null);
        this.schedulePreviewUpdate();

        return newProduct;
    }

    /**
     * Remove um produto
     */
    removeProduct(productId) {
        this.state.d2Products = this.state.d2Products.filter(p => p.id !== productId);
        this.notifyListeners('d2Products', this.state.d2Products, null);
        this.schedulePreviewUpdate();
    }

    /**
     * Atualiza um produto
     */
    updateProduct(productId, updates) {
        const index = this.state.d2Products.findIndex(p => p.id === productId);
        if (index !== -1) {
            this.state.d2Products[index] = { ...this.state.d2Products[index], ...updates };
            this.notifyListeners('d2Products', this.state.d2Products, null);
            this.schedulePreviewUpdate();
        }
    }

    /**
     * Adiciona um novo feedback
     */
    addFeedback(feedback = {}) {
        const id = Date.now();
        const newFeedback = {
            id,
            name: feedback.name || 'Novo Cliente',
            text: feedback.text || 'Texto do depoimento...',
            avatar: feedback.avatar || null,
            link: feedback.link || ''
        };

        this.state.d2Feedbacks.push(newFeedback);
        this.notifyListeners('d2Feedbacks', this.state.d2Feedbacks, null);
        this.schedulePreviewUpdate();

        return newFeedback;
    }

    /**
     * Remove um feedback
     */
    removeFeedback(feedbackId) {
        this.state.d2Feedbacks = this.state.d2Feedbacks.filter(f => f.id !== feedbackId);
        this.notifyListeners('d2Feedbacks', this.state.d2Feedbacks, null);
        this.schedulePreviewUpdate();
    }

    /**
     * Atualiza um feedback
     */
    updateFeedback(feedbackId, updates) {
        const index = this.state.d2Feedbacks.findIndex(f => f.id === feedbackId);
        if (index !== -1) {
            this.state.d2Feedbacks[index] = { ...this.state.d2Feedbacks[index], ...updates };
            this.notifyListeners('d2Feedbacks', this.state.d2Feedbacks, null);
            this.schedulePreviewUpdate();
        }
    }

    /**
     * Carrega estado de um projeto existente
     */
    loadState(savedState) {
        // 🛡️ Proteção: rejeitar estado vazio/null para não sobrescrever com defaults
        if (!savedState || typeof savedState !== 'object' || Object.keys(savedState).length === 0) {
            console.warn('[D2 State] ⚠️ Tentou carregar estado vazio — ignorando para proteger dados');
            return;
        }

        // Merge com o estado padrão para garantir que todas as propriedades existam
        this.state = this.deepMerge(this.getDefaultState(), savedState);

        // 🛡️ Validação e reparo automático de estado
        if (window.StateValidator) {
            const { state: validatedState, repairs, isValid } = window.StateValidator.validate(
                this.state,
                this.getDefaultState()
            );
            this.state = validatedState;

            if (!isValid) {
                console.warn(`[D2 State Manager] ${repairs.length} reparo(s) aplicado(s) ao carregar`);
            }
        }

        // Migração: garante que seções novas existam (ex: PWA)
        this._migrateSections();

        // 🛡️ Desbloqueia save — dados reais foram carregados
        this._dataLoaded = true;

        this.notifyListeners('*', this.state, null);
        this.updatePreview();

        console.log('[D2 State Manager] ✅ State loaded — save desbloqueado');
    }

    /**
     * Migração de seções: adiciona seções padrão que faltam no state salvo
     */
    _migrateSections() {
        const defaults = this.getDefaultState();
        const defaultSections = defaults.d2Sections || [];
        const currentSections = this.state.d2Sections || [];

        defaultSections.forEach(defSection => {
            const exists = currentSections.some(s => s.id === defSection.id);
            if (!exists) {
                currentSections.push(defSection);
                console.log(`[D2 State Manager] Migrated section: ${defSection.id}`);
            }
        });

        // Migração de fonte: Liebling → Montserrat
        this._migrateFonts(this.state);
    }

    /**
     * Migra fontes legadas (Liebling) para Montserrat em todo o state
     */
    _migrateFonts(obj) {
        if (!obj || typeof obj !== 'object') return;

        for (const key in obj) {
            if (key === 'font' && obj[key] === 'Liebling') {
                obj[key] = 'Montserrat';
                console.log('[D2 State Manager] Font migrated: Liebling → Montserrat');
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                this._migrateFonts(obj[key]);
            }
        }
    }

    /**
     * Exporta o estado atual para salvamento
     */
    exportState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    /**
     * Reset para o estado padrão
     */
    reset() {
        this.state = this.getDefaultState();
        this.notifyListeners('*', this.state, null);
        this.updatePreview();

        console.log('[D2 State Manager] State reset');
    }

    /**
     * Deep merge de dois objetos
     */
    deepMerge(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (target[key] !== null && typeof target[key] === 'object' && !Array.isArray(target[key])) {
                    result[key] = this.deepMerge(target[key], source[key]);
                } else {
                    result[key] = source[key];
                }
            } else {
                result[key] = source[key];
            }
        }

        return result;
    }
}

// Exporta uma instância global
window.d2State = new D2StateManager();

console.log('[D2 State Manager] Module loaded');
