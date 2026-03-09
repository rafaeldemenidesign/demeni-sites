/* ============================================
   EDITOR D1 - STATE MANAGER
   Gerenciador de estado centralizado para o EDITOR D1
   ============================================ */

/**
 * D2 Editor State Manager
 * Gerencia todo o estado do editor e notifica listeners de mudanças
 */
class D1StateManager {
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
            console.warn('[D1 State] ⚠️ Crash detectado na sessão anterior — checkpoint disponível');
        }

        // Marca editor como ativo (será limpo no beforeunload)
        this._setupCrashDetection();

        // Inicializa IndexedDB para checkpoints
        this._initCheckpointDB();

        console.log('[D1 State Manager] Initialized');
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
            console.log('[D1 State] ✅ Checkpoint IndexedDB inicializado');

            // Migrar checkpoint antigo do localStorage (se existir)
            this._migrateLocalStorageCheckpoint();
        } catch (e) {
            console.warn('[D1 State] ⚠️ IndexedDB para checkpoints falhou:', e.message);
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
                console.log('[D1 State] 📦 Checkpoint migrado de localStorage → IndexedDB');
            }
        } catch (e) {
            console.warn('[D1 State] Falha ao migrar checkpoint:', e.message);
        }
    }

    /**
     * 🛡️ Salva dados no IndexedDB de checkpoints
     */
    async _idbSaveCheckpoint(key, data) {
        if (!this._checkpointDb) {
            console.warn('[D1 State] Checkpoint DB não disponível');
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
            console.warn('[D1 State] Falha ao salvar no IndexedDB:', e.message);
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
            console.warn('[D1 State] Falha ao ler IndexedDB:', e.message);
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
            console.warn('[D1 State] Falha ao deletar IndexedDB:', e.message);
        }
    }

    /**
     * Retorna o estado padrão para um novo projeto D1
     */
    getDefaultState() {
        return {
            projectId: null,
            projectName: 'Novo Projeto D1',
            projectStatus: 'draft',
            selectedSection: 'hero',
            spacing: { sectionGap: 20, contentPadding: 16 },
            profile: {
                avatar: null,
                name: 'Meu Negócio',
                subtitle: 'Seu slogan aqui',
                description: 'Uma breve descrição do seu negócio.',
                nameStyle: { size: 28, weight: 700, color: '#ffffff', font: 'Montserrat' },
                subtitleStyle: { size: 16, weight: 400, color: 'rgba(255,255,255,0.85)', font: 'Montserrat' },
                descriptionStyle: { size: 14, weight: 300, color: 'rgba(255,255,255,0.7)', font: 'Montserrat' },
                avatarSize: 120,
                avatarBorder: 3,
                avatarBorderColor: '#ffffff',
                avatarZoom: 100,
                avatarPosX: 50,
                avatarPosY: 50
            },
            d2Sections: [
                { id: 'hero', name: 'Perfil', icon: 'fa-user-circle', enabled: true, locked: true },
                { id: 'aparencia', name: 'Aparência', icon: 'fa-palette', enabled: true, locked: true },
                { id: 'conteudo', name: 'Conteúdo', icon: 'fa-layer-group', enabled: true, locked: true },
                { id: 'pwa', name: 'PWA / SEO', icon: 'fa-cog', enabled: true, locked: true }
            ],
            d2Adjustments: {
                hero: {
                    bgImage: null,
                    bgColor: '#1a1a2e',
                    bgFixed: true,
                    bgImageZoom: 100,
                    bgImagePosX: 50,
                    bgImagePosY: 50,
                    gradient: {
                        enabled: true,
                        intensity: 70,
                        position: 30,
                        colorStart: 'transparent',
                        colorMid: 'rgba(10,10,10,0.5)',
                        colorEnd: 'rgba(10,10,10,0.85)'
                    },
                    bgBlur: 0,
                    overlay: { color: '#000000', opacity: 70 },
                    scrollIndicator: { enabled: false, color: '#ffffff' }
                },
                pwa: {
                    seo: {
                        title: '',
                        description: '',
                        ogImage: ''
                    },
                    favicon: {
                        mode: 'auto',
                        image: '',
                        bgColor: '#1a365d',
                        textColor: '#ffffff',
                        shape: 'circle'
                    },
                    appName: '',
                    themeColor: '#1a365d'
                }
            },
            links: [
                { id: 1, label: 'WhatsApp', url: '', icon: 'fab fa-whatsapp', iconColor: '#25D366' },
                { id: 2, label: 'Localização', url: '', icon: 'fas fa-map-marker-alt', iconColor: '#EA4335' },
                { id: 3, label: 'E-mail', url: '', icon: 'fas fa-envelope', iconColor: '#4285F4' },
                { id: 4, label: 'YouTube', url: '', icon: 'fab fa-youtube', iconColor: '#FF0000' }
            ],
            linksLayout: 'grid',
            linksStyle: 'border',
            linksColumns: 2,
            linksLabelSize: 10,
            linksLabelColor: '#ffffff',
            linksIconSize: 24,
            socialLinks: [
                { id: 1, platform: 'instagram', username: '', customUrl: '', customIcon: null },
                { id: 2, platform: 'linkedin', username: '', customUrl: '', customIcon: null }
            ],
            ctaButton: {
                enabled: true,
                text: 'AGENDE UMA REUNIÃO',
                url: '',
                style: 'glass',
                fontSize: 12,
                color: '#ffffff'
            },
            featuredCard: {
                enabled: true,
                image: null,
                imageZoom: 100,
                imagePosX: 50,
                imagePosY: 50,
                title: 'Destaque',
                subtitle: 'Descrição do destaque',
                buttonText: 'Saiba Mais',
                buttonUrl: '',
                gradientColor: 'rgba(0,0,0,0.7)',
                gradientIntensity: 80,
                titleSize: 14,
                subtitleSize: 11,
                titleColor: '#ffffff',
                subtitleColor: 'rgba(255,255,255,0.7)'
            },
            saveContact: {
                enabled: true,
                buttonText: 'SALVAR NA AGENDA',
                fullName: '',
                phone: '',
                email: '',
                company: '',
                role: '',
                fontSize: 12
            },
            whatsappFloat: {
                enabled: false,
                phone: '',
                message: 'Olá! Vi seu site e gostaria de saber mais.',
                showBubbleText: true,
                bubbleText: 'Fale Comigo Agora!'
            },
            footer: {
                name: '',
                showBranding: true,
                nameSize: 9,
                nameColor: 'rgba(255,255,255,0.35)'
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
                console.log(`[D1 State] 📌 Checkpoint salvo no IndexedDB (${(size / 1024).toFixed(1)}KB)`);
            }
        } catch (e) {
            console.warn('[D1 State] Falha ao salvar checkpoint:', e.message);
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
                console.warn('[D1 State] ⚠️ Checkpoint expirado (> 24h) — ignorando');
                await this.clearCheckpoint();
                return false;
            }

            this.loadState(data.state);
            console.log('[D1 State] ✅ Restaurado do checkpoint de', new Date(data.timestamp).toLocaleString());

            // Limpa crash flag
            this._crashDetected = false;
            return true;
        } catch (e) {
            console.error('[D1 State] Falha ao restaurar checkpoint:', e);
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
                console.error('[D1 State Manager] Error in listener:', error);
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
            console.warn('[D1 State] ⛔ Save bloqueado — dados ainda não carregados do IndexedDB');
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
            console.warn('[D1 State Manager] UserData not available');
            return;
        }

        // 🛡️ Proteção dupla: recusar save se dados não foram carregados
        if (!this._dataLoaded) {
            console.warn('[D1 State] ⛔ saveToStorage bloqueado — _dataLoaded = false');
            return;
        }

        const projectId = UserData.getCurrentProjectId();
        if (!projectId) {
            console.warn('[D1 State Manager] No current project to save');
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
                console.warn(`[D1 State] ⚠️ Estado grande: ${size.mb}MB (${size.imageCount} imagens) — considere otimizar`);
            }
        }

        console.log('[D1 State Manager] Auto-saved to storage');

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
        const frame = document.getElementById('preview-frame-d1-new');
        if (frame && typeof window.renderPreviewD1New === 'function') {
            window.renderPreviewD1New(frame, this.state);
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
                console.warn(`[D1 State Manager] Seção ${sectionType} já existe`);
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

        console.log(`[D1 State Manager] Seção ${sectionType} adicionada (id: ${sectionId})`);
        return newSection;
    }

    /**
     * Remove uma seção
     */
    removeSection(sectionId) {
        const section = this.state.d2Sections.find(s => s.id === sectionId);
        if (!section || section.locked) {
            console.warn(`[D1 State Manager] Não é possível remover seção ${sectionId}`);
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

        console.log(`[D1 State Manager] Seção ${sectionId} removida`);
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
            console.warn('[D1 State] ⚠️ Tentou carregar estado vazio — ignorando para proteger dados');
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
                console.warn(`[D1 State Manager] ${repairs.length} reparo(s) aplicado(s) ao carregar`);
            }
        }

        // Migração: garante que seções novas existam (ex: PWA)
        this._migrateSections();

        // 🛡️ Desbloqueia save — dados reais foram carregados
        this._dataLoaded = true;

        this.notifyListeners('*', this.state, null);
        this.updatePreview();

        console.log('[D1 State Manager] ✅ State loaded — save desbloqueado');
    }

    /**
     * Migração de seções: adiciona seções padrão que faltam no state salvo
     */
    _migrateSections() {
        const defaults = this.getDefaultState();
        const defaultSections = defaults.d2Sections || [];

        // Guard: filtra qualquer null/undefined no array
        this.state.d2Sections = (this.state.d2Sections || []).filter(s => s && s.id);
        const currentSections = this.state.d2Sections;

        defaultSections.forEach(defSection => {
            const exists = currentSections.some(s => s.id === defSection.id);
            if (!exists) {
                currentSections.push(defSection);
                console.log(`[D1 State Manager] Migrated section: ${defSection.id}`);
            }
        });

        // Migra d2Adjustments defaults (ex: pwa) para projetos existentes
        if (!this.state.d2Adjustments) this.state.d2Adjustments = {};
        const defaultAdj = defaults.d2Adjustments || {};
        for (const key in defaultAdj) {
            if (!this.state.d2Adjustments[key]) {
                this.state.d2Adjustments[key] = JSON.parse(JSON.stringify(defaultAdj[key]));
                console.log(`[D1 State Manager] Migrated d2Adjustments.${key}`);
            }
        }

        // Migração de fonte: Liebling → Montserrat
        this._migrateFonts(this.state);

        // Migração de links: corrige ícones sem prefixo FA e adiciona iconColor
        this._migrateLinks();
    }

    /**
     * Migração de links: garante que cada link tenha ícone com prefixo FA e iconColor
     */
    _migrateLinks() {
        const links = this.state.links;
        if (!Array.isArray(links)) return;

        // Mapa de fallback: icon sem prefixo → classe FA completa + cor
        const ICON_MAP = {
            'instagram': { fa: 'fab fa-instagram', color: '#E4405F' },
            'whatsapp': { fa: 'fab fa-whatsapp', color: '#25D366' },
            'facebook': { fa: 'fab fa-facebook-f', color: '#1877F2' },
            'youtube': { fa: 'fab fa-youtube', color: '#FF0000' },
            'tiktok': { fa: 'fab fa-tiktok', color: '#000000' },
            'twitter': { fa: 'fab fa-x-twitter', color: '#000000' },
            'linkedin': { fa: 'fab fa-linkedin-in', color: '#0A66C2' },
            'telegram': { fa: 'fab fa-telegram-plane', color: '#0088cc' },
            'github': { fa: 'fab fa-github', color: '#333333' },
            'spotify': { fa: 'fab fa-spotify', color: '#1DB954' },
            'pinterest': { fa: 'fab fa-pinterest-p', color: '#E60023' },
            'envelope': { fa: 'fas fa-envelope', color: '#4285F4' },
            'phone': { fa: 'fas fa-phone', color: '#34A853' },
            'map-marker-alt': { fa: 'fas fa-map-marker-alt', color: '#EA4335' },
            'globe': { fa: 'fas fa-globe', color: '#4285F4' },
            'link': { fa: 'fas fa-link', color: '#7B2FF7' },
            'shopping-bag': { fa: 'fas fa-shopping-bag', color: '#FF6F00' },
            'store': { fa: 'fas fa-store', color: '#FF6F00' },
            'calendar-alt': { fa: 'fas fa-calendar-alt', color: '#7B2FF7' },
            'video': { fa: 'fas fa-video', color: '#FF0000' },
        };

        let migrated = false;
        links.forEach(link => {
            if (!link.icon || (!link.icon.startsWith('fa') && !link.icon.startsWith('fas ') && !link.icon.startsWith('fab ') && !link.icon.startsWith('far '))) {
                // Icon sem prefixo FA — tenta mapear
                const key = (link.icon || 'link').replace(/^fa[sb]?\s+fa-/, '');
                const mapped = ICON_MAP[key];
                if (mapped) {
                    link.icon = mapped.fa;
                    if (!link.iconColor) link.iconColor = mapped.color;
                    migrated = true;
                } else {
                    // Fallback genérico
                    link.icon = 'fas fa-link';
                    if (!link.iconColor) link.iconColor = '#7B2FF7';
                    migrated = true;
                }
            }
            // Garante que iconColor existe
            if (!link.iconColor) {
                const iconName = link.icon.replace(/^fa[sb]\s+fa-/, '');
                const mapped = ICON_MAP[iconName];
                link.iconColor = mapped ? mapped.color : '#7B2FF7';
                migrated = true;
            }
        });

        if (migrated) {
            console.log('[D1 State Manager] Migrated links icons/colors');
        }
    }

    /**
         * Migra fontes legadas (Liebling) para Montserrat em todo o state
         */
    _migrateFonts(obj) {
        if (!obj || typeof obj !== 'object') return;

        for (const key in obj) {
            if (key === 'font' && obj[key] === 'Liebling') {
                obj[key] = 'Montserrat';
                console.log('[D1 State Manager] Font migrated: Liebling → Montserrat');
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

        console.log('[D1 State Manager] State reset');
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
window.d1State = new D1StateManager();

console.log('[D1 State Manager] Module loaded');
