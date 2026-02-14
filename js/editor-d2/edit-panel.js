/* ============================================
   EDITOR D2 - EDIT PANEL
   Painel de edição central (coluna 3)
   ============================================ */

/**
 * D2 Edit Panel Component
 * Gerencia a exibição dos controles de edição por seção
 */
class D2EditPanel {
    constructor(containerElement) {
        this.container = containerElement;
        this.currentSection = null;

        // Mapeamento de editores por seção - usa classes dedicadas
        this.editors = {
            hero: () => new window.D2HeroEditor().render(),
            categorias: () => new window.D2CategoriasEditor().render(),
            produtos: () => new window.D2ProdutosEditor().render(),
            feedbacks: () => new window.D2FeedbacksEditor().render(),
            cta: () => new window.D2CTAEditor().render(),
            footer: () => new window.D2FooterEditor().render(),
            pwa: () => new window.D2PWAEditor().render()
        };

        this.bindEvents();
        this.render(window.d2State.get('selectedSection', 'hero'));
    }

    /**
     * Vincula eventos
     */
    bindEvents() {
        // Escuta seleção de seção
        document.addEventListener('d2:section-selected', (e) => {
            this.render(e.detail.sectionId);
        });

        // Subscribe para mudanças no state
        window.d2State.subscribe((change) => {
            if (change.path === 'selectedSection') {
                this.render(change.newValue);
            }
        });
    }

    /**
     * Renderiza o painel para uma seção específica
     */
    render(sectionId) {
        this.currentSection = sectionId;

        const sections = window.d2State.get('d2Sections', []);
        const section = sections.find(s => s.id === sectionId);

        if (!section) {
            this.container.innerHTML = `
                <div class="panel-header">
                    <h2 class="panel-title"><i class="fas fa-exclamation-triangle"></i> Seção não encontrada</h2>
                </div>
                <div class="panel-content">
                    <div class="empty-state">
                        <i class="fas fa-question-circle"></i>
                        <h3>Selecione uma seção</h3>
                        <p>Clique em uma seção à esquerda para editá-la</p>
                    </div>
                </div>
            `;
            return;
        }

        // Cria o header
        this.container.innerHTML = `
            <div class="panel-header">
                <h2 class="panel-title"><i class="fas ${section.icon}"></i> ${section.name}</h2>
            </div>
            <div class="panel-content" id="panel-content"></div>
        `;

        // Obtém e renderiza o editor específico
        const contentContainer = this.container.querySelector('#panel-content');
        const editorBuilder = this.editors[sectionId];

        if (editorBuilder) {
            const editorContent = editorBuilder();
            if (editorContent instanceof DocumentFragment || editorContent instanceof HTMLElement) {
                contentContainer.appendChild(editorContent);
            } else if (typeof editorContent === 'string') {
                contentContainer.innerHTML = editorContent;
            }
        } else {
            contentContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tools"></i>
                    <h3>Em desenvolvimento</h3>
                    <p>O editor para esta seção ainda está sendo implementado</p>
                </div>
            `;
        }
    }

    // ===== EDITORES SIMPLIFICADOS PARA AS OUTRAS SEÇÕES =====

    /**
     * Editor de Categorias
     */
    renderCategoriasEditor() {
        const fragment = document.createDocumentFragment();
        const C = window.D2Controls;
        const basePath = 'd2Adjustments.categorias';

        // Espaçamento da seção
        const spacingGroup = C.createGroupExpander(
            { title: 'Espaçamento', icon: 'fa-arrows-alt-v', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createSlider({
                    label: 'Padding da seção',
                    value: window.d2State.get(`${basePath}.sectionSpacing`, 40),
                    min: 20, max: 80, step: 5, unit: 'px',
                    path: `${basePath}.sectionSpacing`
                }));

                container.appendChild(C.createColorPicker({
                    label: 'Cor de fundo',
                    value: window.d2State.get(`${basePath}.bgColor`, '#ffffff'),
                    path: `${basePath}.bgColor`
                }));

                return container;
            }
        );
        fragment.appendChild(spacingGroup);

        // Ícones
        const iconsGroup = C.createGroupExpander(
            { title: 'Ícones', icon: 'fa-shapes', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createSlider({
                    label: 'Tamanho do container',
                    value: window.d2State.get(`${basePath}.icon.size`, 80),
                    min: 50, max: 120, step: 5, unit: 'px',
                    path: `${basePath}.icon.size`
                }));

                container.appendChild(C.createSlider({
                    label: 'Arredondamento',
                    value: window.d2State.get(`${basePath}.icon.radius`, 18),
                    min: 0, max: 50, step: 2, unit: 'px',
                    path: `${basePath}.icon.radius`
                }));

                return container;
            }
        );
        fragment.appendChild(iconsGroup);

        // Labels
        const labelsGroup = C.createGroupExpander(
            { title: 'Labels', icon: 'fa-tag', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createSlider({
                    label: 'Tamanho da fonte',
                    value: window.d2State.get(`${basePath}.label.size`, 12),
                    min: 8, max: 18, step: 1, unit: 'px',
                    path: `${basePath}.label.size`
                }));

                container.appendChild(C.createColorPicker({
                    label: 'Cor do texto',
                    value: window.d2State.get(`${basePath}.label.color`, '#222222'),
                    path: `${basePath}.label.color`
                }));

                return container;
            }
        );
        fragment.appendChild(labelsGroup);

        return fragment;
    }

    /**
     * Editor de Produtos
     */
    renderProdutosEditor() {
        const fragment = document.createDocumentFragment();
        const C = window.D2Controls;
        const basePath = 'd2Adjustments.produtos';

        // Seção geral
        const sectionGroup = C.createGroupExpander(
            { title: 'Seção', icon: 'fa-layer-group', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createColorPicker({
                    label: 'Cor de fundo',
                    value: window.d2State.get(`${basePath}.bgColor`, '#1a365d'),
                    path: `${basePath}.bgColor`
                }));

                container.appendChild(C.createSlider({
                    label: 'Padding da seção',
                    value: window.d2State.get(`${basePath}.sectionSpacing`, 30),
                    min: 20, max: 80, step: 5, unit: 'px',
                    path: `${basePath}.sectionSpacing`
                }));

                container.appendChild(C.createTextInput({
                    label: 'Título da seção',
                    value: window.d2State.get(`${basePath}.sectionTitle.text`, 'Produtos Demeni'),
                    path: `${basePath}.sectionTitle.text`
                }));

                container.appendChild(C.createSlider({
                    label: 'Tamanho do título',
                    value: window.d2State.get(`${basePath}.sectionTitle.size`, 36),
                    min: 20, max: 60, step: 2, unit: 'px',
                    path: `${basePath}.sectionTitle.size`
                }));

                return container;
            }
        );
        fragment.appendChild(sectionGroup);

        // Cards
        const cardsGroup = C.createGroupExpander(
            { title: 'Cards', icon: 'fa-th-large', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createSlider({
                    label: 'Espaçamento entre cards',
                    value: window.d2State.get(`${basePath}.gridGap`, 16),
                    min: 8, max: 32, step: 2, unit: 'px',
                    path: `${basePath}.gridGap`
                }));

                container.appendChild(C.createSlider({
                    label: 'Arredondamento',
                    value: window.d2State.get(`${basePath}.card.borderRadius`, 20),
                    min: 0, max: 40, step: 2, unit: 'px',
                    path: `${basePath}.card.borderRadius`
                }));

                container.appendChild(C.createColorPicker({
                    label: 'Cor de fundo do card',
                    value: window.d2State.get(`${basePath}.card.bgColor`, '#ffffff'),
                    path: `${basePath}.card.bgColor`
                }));

                return container;
            }
        );
        fragment.appendChild(cardsGroup);

        // Tipografia
        const typoGroup = C.createGroupExpander(
            { title: 'Tipografia', icon: 'fa-font', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createSlider({
                    label: 'Tamanho do título',
                    value: window.d2State.get(`${basePath}.title.size`, 15),
                    min: 10, max: 24, step: 1, unit: 'px',
                    path: `${basePath}.title.size`
                }));

                container.appendChild(C.createSlider({
                    label: 'Tamanho do preço',
                    value: window.d2State.get(`${basePath}.preco.size`, 16),
                    min: 12, max: 24, step: 1, unit: 'px',
                    path: `${basePath}.preco.size`
                }));

                return container;
            }
        );
        fragment.appendChild(typoGroup);

        // Botão
        const btnGroup = C.createGroupExpander(
            { title: 'Botão Comprar', icon: 'fa-shopping-cart', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createSlider({
                    label: 'Tamanho da fonte',
                    value: window.d2State.get(`${basePath}.btn.size`, 13),
                    min: 10, max: 18, step: 1, unit: 'px',
                    path: `${basePath}.btn.size`
                }));

                container.appendChild(C.createColorPicker({
                    label: 'Cor de fundo',
                    value: window.d2State.get(`${basePath}.btn.bgColor`, '#25D366'),
                    path: `${basePath}.btn.bgColor`
                }));

                return container;
            }
        );
        fragment.appendChild(btnGroup);

        return fragment;
    }

    /**
     * Editor de Feedbacks
     */
    renderFeedbacksEditor() {
        const fragment = document.createDocumentFragment();
        const C = window.D2Controls;
        const basePath = 'd2Adjustments.feedbacks';

        const sectionGroup = C.createGroupExpander(
            { title: 'Seção', icon: 'fa-layer-group', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createColorPicker({
                    label: 'Cor de fundo',
                    value: window.d2State.get(`${basePath}.bgColor`, '#e8e8e8'),
                    path: `${basePath}.bgColor`
                }));

                container.appendChild(C.createSlider({
                    label: 'Padding da seção',
                    value: window.d2State.get(`${basePath}.sectionSpacing`, 30),
                    min: 20, max: 80, step: 5, unit: 'px',
                    path: `${basePath}.sectionSpacing`
                }));

                container.appendChild(C.createTextInput({
                    label: 'Título da seção',
                    value: window.d2State.get(`${basePath}.sectionTitle.text`, 'O que estão dizendo?'),
                    path: `${basePath}.sectionTitle.text`
                }));

                return container;
            }
        );
        fragment.appendChild(sectionGroup);

        const avatarGroup = C.createGroupExpander(
            { title: 'Avatar', icon: 'fa-user-circle', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createSlider({
                    label: 'Tamanho',
                    value: window.d2State.get(`${basePath}.avatar.size`, 60),
                    min: 40, max: 100, step: 5, unit: 'px',
                    path: `${basePath}.avatar.size`
                }));

                container.appendChild(C.createSlider({
                    label: 'Arredondamento',
                    value: window.d2State.get(`${basePath}.avatar.radius`, 8),
                    min: 0, max: 50, step: 2, unit: 'px',
                    path: `${basePath}.avatar.radius`
                }));

                return container;
            }
        );
        fragment.appendChild(avatarGroup);

        const typoGroup = C.createGroupExpander(
            { title: 'Tipografia', icon: 'fa-font', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createSlider({
                    label: 'Tamanho do nome',
                    value: window.d2State.get(`${basePath}.name.size`, 16),
                    min: 12, max: 24, step: 1, unit: 'px',
                    path: `${basePath}.name.size`
                }));

                container.appendChild(C.createColorPicker({
                    label: 'Cor do nome',
                    value: window.d2State.get(`${basePath}.name.color`, '#1a365d'),
                    path: `${basePath}.name.color`
                }));

                container.appendChild(C.createSlider({
                    label: 'Tamanho do texto',
                    value: window.d2State.get(`${basePath}.text.size`, 13),
                    min: 10, max: 18, step: 1, unit: 'px',
                    path: `${basePath}.text.size`
                }));

                return container;
            }
        );
        fragment.appendChild(typoGroup);

        return fragment;
    }

    /**
     * Editor do CTA Secundário
     */
    renderCTAEditor() {
        const fragment = document.createDocumentFragment();
        const C = window.D2Controls;
        const basePath = 'd2Adjustments.cta';

        const bgGroup = C.createGroupExpander(
            { title: 'Fundo', icon: 'fa-image', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createImagePicker({
                    label: 'Imagem de fundo',
                    value: window.d2State.get(`${basePath}.bgImage`),
                    path: `${basePath}.bgImage`,
                    aspect: '16/9'
                }));

                container.appendChild(C.createSlider({
                    label: 'Escurecimento',
                    value: window.d2State.get(`${basePath}.brightness`, 0.5) * 100,
                    min: 20, max: 100, step: 5, unit: '%',
                    path: `${basePath}.brightness`
                }));

                container.appendChild(C.createSlider({
                    label: 'Altura da seção',
                    value: window.d2State.get(`${basePath}.height`, 250),
                    min: 150, max: 400, step: 25, unit: 'px',
                    path: `${basePath}.height`
                }));

                return container;
            }
        );
        fragment.appendChild(bgGroup);

        const titleGroup = C.createGroupExpander(
            { title: 'Título', icon: 'fa-heading', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createTextInput({
                    label: 'Texto',
                    value: window.d2State.get(`${basePath}.title.text`) || '',
                    placeholder: 'Usa o nome do perfil se vazio',
                    path: `${basePath}.title.text`
                }));

                container.appendChild(C.createSlider({
                    label: 'Tamanho',
                    value: window.d2State.get(`${basePath}.title.size`, 52),
                    min: 28, max: 72, step: 2, unit: 'px',
                    path: `${basePath}.title.size`
                }));

                return container;
            }
        );
        fragment.appendChild(titleGroup);

        return fragment;
    }

    /**
     * Editor do Footer
     */
    renderFooterEditor() {
        const fragment = document.createDocumentFragment();
        const C = window.D2Controls;
        const basePath = 'd2Adjustments.footer';

        const sectionGroup = C.createGroupExpander(
            { title: 'Seção', icon: 'fa-layer-group', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createColorPicker({
                    label: 'Cor de fundo',
                    value: window.d2State.get(`${basePath}.bgColor`, '#1a365d'),
                    path: `${basePath}.bgColor`
                }));

                container.appendChild(C.createSlider({
                    label: 'Padding',
                    value: window.d2State.get(`${basePath}.sectionSpacing`, 40),
                    min: 20, max: 80, step: 5, unit: 'px',
                    path: `${basePath}.sectionSpacing`
                }));

                return container;
            }
        );
        fragment.appendChild(sectionGroup);

        const titleGroup = C.createGroupExpander(
            { title: 'Título', icon: 'fa-heading', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createTextInput({
                    label: 'Título',
                    value: window.d2State.get(`${basePath}.title.text`, 'Invista no seu negócio!'),
                    path: `${basePath}.title.text`
                }));

                container.appendChild(C.createSlider({
                    label: 'Tamanho',
                    value: window.d2State.get(`${basePath}.title.size`, 24),
                    min: 16, max: 40, step: 2, unit: 'px',
                    path: `${basePath}.title.size`
                }));

                return container;
            }
        );
        fragment.appendChild(titleGroup);

        const infoGroup = C.createGroupExpander(
            { title: 'Informações', icon: 'fa-info-circle', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createTextInput({
                    label: 'Email',
                    value: window.d2State.get(`${basePath}.info.email`, ''),
                    placeholder: 'contato@exemplo.com',
                    path: `${basePath}.info.email`
                }));

                container.appendChild(C.createTextInput({
                    label: 'Telefone',
                    value: window.d2State.get(`${basePath}.info.phone`, ''),
                    placeholder: '(00) 0000-0000',
                    path: `${basePath}.info.phone`
                }));

                container.appendChild(C.createTextInput({
                    label: 'CNPJ',
                    value: window.d2State.get(`${basePath}.info.cnpj`, ''),
                    placeholder: 'XX.XXX.XXX/0001-XX',
                    path: `${basePath}.info.cnpj`
                }));

                return container;
            }
        );
        fragment.appendChild(infoGroup);

        const socialGroup = C.createGroupExpander(
            { title: 'Redes Sociais', icon: 'fa-share-alt', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createSlider({
                    label: 'Tamanho dos ícones',
                    value: window.d2State.get(`${basePath}.social.size`, 36),
                    min: 24, max: 56, step: 4, unit: 'px',
                    path: `${basePath}.social.size`
                }));

                container.appendChild(C.createTextInput({
                    label: 'Instagram',
                    value: window.d2State.get(`${basePath}.social.instagram`, ''),
                    placeholder: '@usuario',
                    path: `${basePath}.social.instagram`
                }));

                container.appendChild(C.createTextInput({
                    label: 'Facebook',
                    value: window.d2State.get(`${basePath}.social.facebook`, ''),
                    placeholder: 'URL do perfil',
                    path: `${basePath}.social.facebook`
                }));

                container.appendChild(C.createTextInput({
                    label: 'WhatsApp',
                    value: window.d2State.get(`${basePath}.social.whatsapp`, ''),
                    placeholder: '5500000000000',
                    path: `${basePath}.social.whatsapp`
                }));

                return container;
            }
        );
        fragment.appendChild(socialGroup);

        return fragment;
    }
}

// Exporta globalmente
window.D2EditPanel = D2EditPanel;

console.log('[D2 Edit Panel] Module loaded');
