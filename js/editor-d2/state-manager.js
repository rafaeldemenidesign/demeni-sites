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

        // Debounce para preview
        this.previewDebounceTimer = null;
        this.previewDebounceMs = 50;

        console.log('[D2 State Manager] Initialized');
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
                name: 'TechCell Store',
                role: 'Loja de Celulares e Acessórios',
                logo: null
            },

            // Ordem e visibilidade das seções
            d2Sections: [
                { id: 'hero', name: 'Hero', icon: 'fa-image', enabled: true, locked: true },
                { id: 'categorias', name: 'Categorias', icon: 'fa-th-large', enabled: true, locked: false },
                { id: 'produtos', name: 'Produtos', icon: 'fa-shopping-bag', enabled: true, locked: false },
                { id: 'feedbacks', name: 'Feedbacks', icon: 'fa-comments', enabled: true, locked: false },
                { id: 'cta', name: 'CTA', icon: 'fa-bullhorn', enabled: true, locked: false },
                { id: 'footer', name: 'Footer', icon: 'fa-copyright', enabled: true, locked: true }
            ],

            // Produtos para a seção de produtos
            d2Products: [
                { id: 1, title: 'iPhone 15 Pro', price: 'R$ 7.499,00', image: 'http://localhost:8081/produto-1.png', link: '' },
                { id: 2, title: 'Samsung Galaxy S24', price: 'R$ 5.999,00', image: 'http://localhost:8081/produto-2.png', link: '' },
                { id: 3, title: 'Kit Acessórios', price: 'R$ 299,90', image: 'http://localhost:8081/produto-3.png', link: '' },
                { id: 4, title: 'Smartwatch Pro', price: 'R$ 1.299,00', image: 'http://localhost:8081/produto-4.png', link: '' }
            ],

            // Feedbacks/depoimentos
            d2Feedbacks: [
                { id: 1, name: 'Carla Fernandes', text: 'Comprei meu iPhone aqui e foi a melhor decisão! Atendimento excelente e preço justo.', avatar: 'http://localhost:8081/avatar-1.png', link: '' },
                { id: 2, name: 'Roberto Almeida', text: 'Troca de tela super rápida e profissional. Recomendo demais!', avatar: 'http://localhost:8081/avatar-2.png', link: '' }
            ],

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
                    bgImage: 'hero-bg.webp', // Imagem pré-carregada do template
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
                        font: 'Liebling',
                        textGradient: { enabled: false, gradient: 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)' },
                        padding: { top: 0, bottom: 0, left: 0, right: 0 }
                    },
                    subtitle: {
                        text: '',  // Se vazio, usa profile.role
                        size: 22,
                        spacing: 32,
                        weight: 300,
                        color: '#ffffff',
                        font: 'Liebling',
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
                            font: 'Liebling'
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
                    icon: { size: 80, radius: 18 },
                    label: { size: 12, weight: 500, color: '#222222' },
                    items: [
                        { id: 1, label: 'PRODUTOS', icon: 'Pen Tool.png', customIcon: null },
                        { id: 2, label: 'SERVIÇOS', icon: 'Engrenagem.png', customIcon: null },
                        { id: 3, label: 'EDUCAÇÃO', icon: 'Aulas.png', customIcon: null },
                        { id: 4, label: 'SOBRE', icon: 'Sobre.png', customIcon: null }
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
                }
            }
        };
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

        const projectId = UserData.getCurrentProjectId();
        if (!projectId) {
            console.warn('[D2 State Manager] No current project to save');
            return;
        }

        const stateData = this.exportState();
        UserData.updateProject(projectId, { data: stateData });
        console.log('[D2 State Manager] Auto-saved to storage');

        // Captura thumbnail com debounce separado (mais lento)
        this.scheduleThumbnailCapture();
    }

    /**
     * Agenda captura de thumbnail com debounce de 3s
     */
    scheduleThumbnailCapture() {
        if (this.thumbnailDebounceTimer) {
            clearTimeout(this.thumbnailDebounceTimer);
        }
        this.thumbnailDebounceTimer = setTimeout(() => {
            this.captureThumbnail();
        }, 3000); // 3s após última mudança - não impacta UX
    }

    /**
     * Captura o preview como WebP thumbnail e salva no projeto
     * Usa html2canvas para capturar e redimensiona para o aspect ratio do card
     */
    async captureThumbnail() {
        if (typeof html2canvas !== 'function') {
            console.warn('[D2 State Manager] html2canvas not loaded');
            return;
        }

        const frame = document.getElementById('preview-frame')
            || document.getElementById('preview-frame-d2');
        if (!frame) {
            console.warn('[D2 State Manager] Preview frame not found');
            return;
        }

        try {
            const srcCanvas = await html2canvas(frame, {
                scale: 1,
                useCORS: true,
                allowTaint: true,
                logging: false
            });

            // CROP: recorta para 300×580 a partir do topo (sem achatar/esticar)
            const PHONE_W = 300;
            const PHONE_H = 580;
            const outputCanvas = document.createElement('canvas');
            outputCanvas.width = PHONE_W;
            outputCanvas.height = PHONE_H;
            const ctx = outputCanvas.getContext('2d');

            // Copia só os primeiros 300×580 pixels do source (crop, não resize)
            ctx.drawImage(srcCanvas, 0, 0, PHONE_W, PHONE_H, 0, 0, PHONE_W, PHONE_H);

            const webpDataUrl = outputCanvas.toDataURL('image/webp', 0.8);

            const projectId = window.UserData?.getCurrentProjectId();
            if (projectId && webpDataUrl.length < 500000) {
                UserData.updateProject(projectId, { thumbnail: webpDataUrl });
                console.log(`[D2 State Manager] Thumbnail CROP: ${srcCanvas.width}×${srcCanvas.height} → ${PHONE_W}×${PHONE_H}, ${Math.round(webpDataUrl.length / 1024)}kb`);
            }
        } catch (err) {
            console.warn('[D2 State Manager] Thumbnail capture failed:', err.message);
        }
    }

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
        const frame = document.getElementById('preview-frame');
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
            cta: { id: 'cta', name: 'CTA', icon: 'fa-bullhorn' }
        };

        const def = sectionDefs[sectionType];
        if (!def) return null;

        // Verifica se já existe uma seção desse tipo
        const exists = this.state.d2Sections.some(s => s.id === def.id);
        if (exists) {
            console.warn(`[D2 State Manager] Seção ${sectionType} já existe`);
            return null;
        }

        // Encontra o índice do Footer (sempre deve ser o último)
        const footerIndex = this.state.d2Sections.findIndex(s => s.id === 'footer');
        const insertIndex = footerIndex !== -1 ? footerIndex : this.state.d2Sections.length;

        // Cria a nova seção
        const newSection = {
            id: def.id,
            name: def.name,
            icon: def.icon,
            enabled: true,
            locked: false
        };

        // Insere antes do Footer
        this.state.d2Sections.splice(insertIndex, 0, newSection);
        this.notifyListeners('d2Sections', this.state.d2Sections, null);
        this.schedulePreviewUpdate();

        console.log(`[D2 State Manager] Seção ${sectionType} adicionada`);
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
        // Merge com o estado padrão para garantir que todas as propriedades existam
        this.state = this.deepMerge(this.getDefaultState(), savedState);
        this.notifyListeners('*', this.state, null);
        this.updatePreview();

        console.log('[D2 State Manager] State loaded');
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
