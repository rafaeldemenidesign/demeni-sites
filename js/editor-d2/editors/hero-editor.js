/* ============================================
   EDITOR D2 - HERO EDITOR
   Painel de edição da seção Hero
   ============================================ */

/**
 * Presets de cores para botões com degradê
 */
const BUTTON_COLOR_PRESETS = {
    blue: {
        label: 'Azul',
        gradient: 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)',
        solid: '#5167E7'
    },
    yellow: {
        label: 'Amarelo',
        gradient: 'linear-gradient(135deg, #F5A623 0%, #FFCD4D 33%, #E89B1C 66%, #8B5A00 100%)',
        solid: '#F5A623'
    },
    red: {
        label: 'Vermelho',
        gradient: 'linear-gradient(135deg, #E74C3C 0%, #FF7675 33%, #D63031 66%, #8B2121 100%)',
        solid: '#E74C3C'
    },
    green: {
        label: 'Verde',
        gradient: 'linear-gradient(135deg, #27AE60 0%, #6FCF97 33%, #219653 66%, #145A36 100%)',
        solid: '#27AE60'
    },
    pink: {
        label: 'Rosa',
        gradient: 'linear-gradient(135deg, #E91E8C 0%, #FF6EB4 33%, #C71585 66%, #8B1162 100%)',
        solid: '#E91E8C'
    },
    purple: {
        label: 'Roxo',
        gradient: 'linear-gradient(135deg, #9B59B6 0%, #BB8FCE 33%, #8E44AD 66%, #5C2D7C 100%)',
        solid: '#9B59B6'
    },
    gray: {
        label: 'Cinza',
        gradient: 'linear-gradient(135deg, #7F8C8D 0%, #B2BEC3 33%, #636E72 66%, #2D3436 100%)',
        solid: '#7F8C8D'
    },
    black: {
        label: 'Preto',
        gradient: 'linear-gradient(135deg, #2C3E50 0%, #4A6572 33%, #1A252F 66%, #0A0F14 100%)',
        solid: '#2C3E50'
    },
    offwhite: {
        label: 'Off-white',
        gradient: 'linear-gradient(135deg, #F5F5F5 0%, #FFFFFF 33%, #E0E0E0 66%, #BDBDBD 100%)',
        solid: '#F5F5F5',
        textColor: '#333333'
    },
    orange: {
        label: 'Laranja',
        gradient: 'linear-gradient(135deg, #E67E22 0%, #F39C12 33%, #D35400 66%, #8B4513 100%)',
        solid: '#E67E22'
    },
    brown: {
        label: 'Marrom',
        gradient: 'linear-gradient(135deg, #795548 0%, #A1887F 33%, #5D4037 66%, #3E2723 100%)',
        solid: '#795548'
    }
};

/**
 * D2 Hero Editor Component
 * Gera os controles para editar a seção Hero
 */
class D2HeroEditor {
    constructor() {
        this.basePath = 'd2Adjustments.hero';
    }

    /**
     * Renderiza todos os controles do Hero
     * @returns {DocumentFragment}
     */
    render() {
        const fragment = document.createDocumentFragment();
        const C = window.D2Controls;

        // ===== TAMANHO DA SEÇÃO =====
        const sectionGroup = C.createGroupExpander(
            { title: 'Tamanho da Seção', icon: 'fa-expand-arrows-alt', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createSlider({
                        label: 'Altura da seção',
                        value: window.d2State.get(`${this.basePath}.sectionHeight`, 56),
                        min: 40, max: 72, step: 2, unit: 'vh',
                        path: `${this.basePath}.sectionHeight`
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Padding do conteúdo (baixo)',
                        value: window.d2State.get(`${this.basePath}.contentPadding`, 60),
                        min: 20, max: 150, step: 10, unit: 'px',
                        path: `${this.basePath}.contentPadding`
                    })
                );

                container.appendChild(
                    C.createSelect({
                        label: 'Posição vertical do texto',
                        value: window.d2State.get(`${this.basePath}.textPosition`, 'bottom'),
                        options: [
                            { value: 'top', label: 'Topo' },
                            { value: 'center', label: 'Centro' },
                            { value: 'bottom', label: 'Rodapé' }
                        ],
                        path: `${this.basePath}.textPosition`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(sectionGroup);

        // ===== HEADER / LOGO =====
        const headerGroup = C.createGroupExpander(
            { title: 'Header & Logo', icon: 'fa-crown', expanded: true },
            () => {
                const container = document.createElement('div');

                // === MINI PREVIEW DO HEADER ===
                const headerPreview = this.createHeaderMiniPreview();
                container.appendChild(headerPreview);

                container.appendChild(
                    C.createSelect({
                        label: 'Posição do logo',
                        value: window.d2State.get('d2Adjustments.header.logoPosition', 'left'),
                        options: [
                            { value: 'left', label: 'Esquerda' },
                            { value: 'center', label: 'Centro' },
                            { value: 'right', label: 'Direita' }
                        ],
                        path: 'd2Adjustments.header.logoPosition'
                    })
                );

                container.appendChild(
                    C.createSelect({
                        label: 'Cor do logo',
                        value: window.d2State.get('d2Adjustments.header.logo.color', 'white'),
                        options: [
                            { value: 'white', label: 'Branco' },
                            { value: 'black', label: 'Preto' },
                            { value: 'original', label: 'Original' }
                        ],
                        path: 'd2Adjustments.header.logo.color'
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Tamanho do logo',
                        value: window.d2State.get('d2Adjustments.header.logo.size', 28),
                        min: 16, max: 60, step: 2, unit: 'px',
                        path: 'd2Adjustments.header.logo.size'
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Altura do header',
                        value: window.d2State.get('d2Adjustments.header.height', 80),
                        min: 50, max: 120, step: 5, unit: 'px',
                        path: 'd2Adjustments.header.height'
                    })
                );

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor de fundo',
                        value: window.d2State.get('d2Adjustments.header.bgColor', '#2d2d2d'),
                        path: 'd2Adjustments.header.bgColor'
                    })
                );

                container.appendChild(
                    C.createSelect({
                        label: 'Tipo de fundo',
                        value: window.d2State.get('d2Adjustments.header.bgType', 'solid'),
                        options: [
                            { value: 'solid', label: 'Cor Sólida' },
                            { value: 'gradient', label: 'Degradê' },
                            { value: 'glass', label: 'Glass (transparente)' }
                        ],
                        path: 'd2Adjustments.header.bgType'
                    })
                );

                const currentBgType = window.d2State.get('d2Adjustments.header.bgType', 'solid');

                // Controles de degradê (só quando bgType = gradient)
                if (currentBgType === 'gradient') {
                    container.appendChild(
                        C.createToggle({
                            label: 'Inverter degradê',
                            value: window.d2State.get('d2Adjustments.header.bgGradientInvert', false),
                            path: 'd2Adjustments.header.bgGradientInvert'
                        })
                    );
                    const label = document.createElement('div');
                    label.style.cssText = 'font-size: 11px; opacity: 0.6; margin-top: 8px;';
                    label.textContent = 'Escolha o degradê:';
                    container.appendChild(label);
                    container.appendChild(C.createGradientPresets({
                        value: window.d2State.get('d2Adjustments.header.bgGradient', 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)'),
                        path: 'd2Adjustments.header.bgGradient'
                    }));
                }

                // Controle de blur (só quando bgType = glass)
                if (currentBgType === 'glass') {
                    container.appendChild(
                        C.createSlider({
                            label: 'Blur do glass',
                            value: window.d2State.get('d2Adjustments.header.bgGlassBlur', 10),
                            min: 2, max: 30, step: 2, unit: 'px',
                            path: 'd2Adjustments.header.bgGlassBlur'
                        })
                    );
                }

                container.appendChild(C.createDivider());

                container.appendChild(
                    C.createToggle({
                        label: 'Esconder ao rolar',
                        value: window.d2State.get('d2Adjustments.header.autoHide', false),
                        path: 'd2Adjustments.header.autoHide'
                    })
                );

                return container;
            }
        );
        fragment.appendChild(headerGroup);

        // ===== MENU LATERAL (SIDEBAR) =====
        const sidebarMenuGroup = C.createGroupExpander(
            { title: 'Menu Lateral', icon: 'fa-bars', expanded: false },
            () => {
                const container = document.createElement('div');

                // --- Cor do ícone ☰ na header ---
                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor do ícone ☰ menu',
                        value: window.d2State.get('d2Adjustments.header.textColor', '#ffffff'),
                        path: 'd2Adjustments.header.textColor'
                    })
                );

                // --- Cores ---
                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor de fundo',
                        value: window.d2State.get('d2Adjustments.header.sidebar.bgColor', '#1a1a1a'),
                        path: 'd2Adjustments.header.sidebar.bgColor'
                    })
                );

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor do texto',
                        value: window.d2State.get('d2Adjustments.header.sidebar.textColor', '#ffffff'),
                        path: 'd2Adjustments.header.sidebar.textColor'
                    })
                );

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor de destaque',
                        value: window.d2State.get('d2Adjustments.header.sidebar.accentColor', '#e67e22'),
                        path: 'd2Adjustments.header.sidebar.accentColor'
                    })
                );

                // --- Dimensões ---
                container.appendChild(
                    C.createSlider({
                        label: 'Largura do menu',
                        value: window.d2State.get('d2Adjustments.header.sidebar.width', 280),
                        min: 200, max: 360, step: 10, unit: 'px',
                        path: 'd2Adjustments.header.sidebar.width'
                    })
                );

                // --- Tipografia ---
                container.appendChild(
                    C.createSlider({
                        label: 'Tamanho da fonte',
                        value: window.d2State.get('d2Adjustments.header.sidebar.fontSize', 15),
                        min: 12, max: 22, step: 1, unit: 'px',
                        path: 'd2Adjustments.header.sidebar.fontSize'
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Tamanho do ícone',
                        value: window.d2State.get('d2Adjustments.header.sidebar.iconSize', 16),
                        min: 12, max: 24, step: 1, unit: 'px',
                        path: 'd2Adjustments.header.sidebar.iconSize'
                    })
                );

                // --- Espaçamento ---
                container.appendChild(
                    C.createSlider({
                        label: 'Espaçamento dos itens',
                        value: window.d2State.get('d2Adjustments.header.sidebar.itemPadding', 14),
                        min: 8, max: 24, step: 2, unit: 'px',
                        path: 'd2Adjustments.header.sidebar.itemPadding'
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Borda de destaque',
                        value: window.d2State.get('d2Adjustments.header.sidebar.borderWidth', 3),
                        min: 0, max: 6, step: 1, unit: 'px',
                        path: 'd2Adjustments.header.sidebar.borderWidth'
                    })
                );

                // --- Extras ---
                container.appendChild(
                    C.createToggle({
                        label: 'Separadores entre itens',
                        value: window.d2State.get('d2Adjustments.header.sidebar.showSeparators', false),
                        path: 'd2Adjustments.header.sidebar.showSeparators'
                    })
                );

                // --- Nomes das seções no menu ---
                const namesTitle = document.createElement('div');
                namesTitle.style.cssText = 'font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; margin: 16px 0 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);';
                namesTitle.textContent = 'Nomes das seções';
                container.appendChild(namesTitle);

                const currentSections = window.d2State.get('d2Sections', []);
                currentSections.filter(s => s.id !== 'footer').forEach((section, index) => {
                    const input = document.createElement('div');
                    input.className = 'control-item';

                    const label = document.createElement('label');
                    label.className = 'control-label';
                    label.textContent = section.id.charAt(0).toUpperCase() + section.id.slice(1);

                    const field = document.createElement('input');
                    field.type = 'text';
                    field.className = 'control-input';
                    field.value = section.name || '';
                    field.placeholder = section.id;
                    field.addEventListener('input', (e) => {
                        const sections = [...window.d2State.get('d2Sections', [])];
                        const idx = sections.findIndex(s => s.id === section.id);
                        if (idx !== -1) {
                            sections[idx] = { ...sections[idx], name: e.target.value };
                            window.d2State.set('d2Sections', sections);
                        }
                    });

                    input.appendChild(label);
                    input.appendChild(field);
                    container.appendChild(input);
                });

                return container;
            }
        );
        fragment.appendChild(sidebarMenuGroup);

        // ===== IMAGEM DE FUNDO =====
        const bgImageGroup = C.createGroupExpander(
            { title: 'Imagem de Fundo', icon: 'fa-image', expanded: true },
            () => {
                const container = document.createElement('div');

                // Mini preview da imagem de fundo
                const bgPreview = this.createBgImageMiniPreview();
                container.appendChild(bgPreview);

                // Sliders de posição e zoom (só aparecem quando tem imagem)
                const positionControls = document.createElement('div');
                positionControls.className = 'bg-position-controls';
                positionControls.id = 'bg-position-controls';

                // Slider Posição Horizontal
                positionControls.appendChild(
                    C.createSlider({
                        label: 'Posição Horizontal',
                        value: window.d2State.get(`${this.basePath}.bgPositionX`, 50),
                        min: 0,
                        max: 100,
                        step: 1,
                        unit: '%',
                        path: `${this.basePath}.bgPositionX`
                    })
                );

                // Slider Posição Vertical
                positionControls.appendChild(
                    C.createSlider({
                        label: 'Posição Vertical',
                        value: window.d2State.get(`${this.basePath}.bgPositionY`, 50),
                        min: 0,
                        max: 100,
                        step: 1,
                        unit: '%',
                        path: `${this.basePath}.bgPositionY`
                    })
                );

                // Slider Zoom
                positionControls.appendChild(
                    C.createSlider({
                        label: 'Zoom',
                        value: window.d2State.get(`${this.basePath}.bgZoom`, 100),
                        min: 100,
                        max: 200,
                        step: 5,
                        unit: '%',
                        path: `${this.basePath}.bgZoom`
                    })
                );

                container.appendChild(positionControls);

                // Color picker para quando não há imagem
                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor de fundo (sem imagem)',
                        value: window.d2State.get(`${this.basePath}.bgColor`, '#1a1a2e'),
                        path: `${this.basePath}.bgColor`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(bgImageGroup);

        // ===== DEGRADÊ OVERLAY =====
        const gradientGroup = C.createGroupExpander(
            { title: 'Degradê Overlay', icon: 'fa-adjust', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createSlider({
                        label: 'Intensidade',
                        value: window.d2State.get(`${this.basePath}.gradient.intensity`, 60),
                        min: 0, max: 100, step: 5, unit: '%',
                        path: `${this.basePath}.gradient.intensity`
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Posição (do topo)',
                        value: window.d2State.get(`${this.basePath}.gradient.position`, 50),
                        min: 0, max: 100, step: 5, unit: '%',
                        path: `${this.basePath}.gradient.position`
                    })
                );

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor final (base)',
                        value: window.d2State.get(`${this.basePath}.gradient.colorEnd`, '#0a0a0a'),
                        path: `${this.basePath}.gradient.colorEnd`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(gradientGroup);

        // ===== SETA DE SCROLL =====
        const scrollGroup = C.createGroupExpander(
            { title: 'Seta de Scroll', icon: 'fa-chevron-down', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createToggle({
                        label: 'Mostrar seta',
                        value: window.d2State.get(`${this.basePath}.scrollIndicator.enabled`, true),
                        path: `${this.basePath}.scrollIndicator.enabled`
                    })
                );

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor da seta',
                        value: window.d2State.get(`${this.basePath}.scrollIndicator.color`, '#ffffff'),
                        path: `${this.basePath}.scrollIndicator.color`
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Distância do fundo',
                        value: window.d2State.get(`${this.basePath}.scrollIndicator.paddingBottom`, 20),
                        min: 0, max: 80, step: 2, unit: 'px',
                        path: `${this.basePath}.scrollIndicator.paddingBottom`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(scrollGroup);

        // ===== TÍTULO =====
        const titleGroup = C.createGroupExpander(
            { title: 'Título', icon: 'fa-heading', expanded: true },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createTextInput({
                        label: 'Texto do título',
                        value: window.d2State.get(`${this.basePath}.title.text`) || window.d2State.get('profile.name', ''),
                        placeholder: 'Ex: Seu Nome',
                        path: `${this.basePath}.title.text`
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Tamanho da fonte',
                        value: window.d2State.get(`${this.basePath}.title.size`, 56),
                        min: 24,
                        max: 96,
                        step: 2,
                        unit: 'px',
                        path: `${this.basePath}.title.size`
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Espaçamento inferior',
                        value: window.d2State.get(`${this.basePath}.title.spacing`, 4),
                        min: 0,
                        max: 32,
                        step: 1,
                        unit: 'px',
                        path: `${this.basePath}.title.spacing`
                    })
                );

                container.appendChild(
                    C.createWeightSelector({
                        label: 'Peso da fonte',
                        value: window.d2State.get(`${this.basePath}.title.weight`, 400),
                        path: `${this.basePath}.title.weight`
                    })
                );

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor do texto',
                        value: window.d2State.get(`${this.basePath}.title.color`, '#ffffff'),
                        path: `${this.basePath}.title.color`
                    })
                );

                container.appendChild(
                    C.createFontPicker({
                        label: 'Família da fonte',
                        value: window.d2State.get(`${this.basePath}.title.font`, 'Montserrat'),
                        path: `${this.basePath}.title.font`
                    })
                );

                // Texto gradiente
                container.appendChild(C.createTextGradientControls({ basePath: `${this.basePath}.title` }));

                return container;
            }
        );
        fragment.appendChild(titleGroup);

        // ===== SUBTÍTULO =====
        const subtitleGroup = C.createGroupExpander(
            { title: 'Subtítulo', icon: 'fa-font', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createTextInput({
                        label: 'Texto do subtítulo',
                        value: window.d2State.get(`${this.basePath}.subtitle.text`) || window.d2State.get('profile.role', ''),
                        placeholder: 'Ex: Sua Profissão',
                        path: `${this.basePath}.subtitle.text`
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Tamanho da fonte',
                        value: window.d2State.get(`${this.basePath}.subtitle.size`, 22),
                        min: 12,
                        max: 48,
                        step: 1,
                        unit: 'px',
                        path: `${this.basePath}.subtitle.size`
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Espaçamento inferior',
                        value: window.d2State.get(`${this.basePath}.subtitle.spacing`, 32),
                        min: 0,
                        max: 64,
                        step: 2,
                        unit: 'px',
                        path: `${this.basePath}.subtitle.spacing`
                    })
                );

                container.appendChild(
                    C.createWeightSelector({
                        label: 'Peso da fonte',
                        value: window.d2State.get(`${this.basePath}.subtitle.weight`, 300),
                        path: `${this.basePath}.subtitle.weight`
                    })
                );

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor do texto',
                        value: window.d2State.get(`${this.basePath}.subtitle.color`, '#ffffff'),
                        path: `${this.basePath}.subtitle.color`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(subtitleGroup);

        // ===== BOTÃO CTA =====
        const btnGroup = C.createGroupExpander(
            { title: 'Botão CTA', icon: 'fa-mouse-pointer', expanded: false },
            () => {
                const container = document.createElement('div');

                // Texto do botão
                const textGroup = C.createGroupExpander(
                    { title: 'Texto do Botão', expanded: true, nested: true },
                    () => {
                        const inner = document.createElement('div');

                        inner.appendChild(
                            C.createTextInput({
                                label: 'Texto',
                                value: window.d2State.get(`${this.basePath}.btn.text`, 'QUERO SABER MAIS'),
                                placeholder: 'Ex: VER PRODUTOS',
                                path: `${this.basePath}.btn.text`
                            })
                        );

                        inner.appendChild(
                            C.createSlider({
                                label: 'Tamanho da fonte',
                                value: window.d2State.get(`${this.basePath}.btn.textStyle.size`, 16),
                                min: 10,
                                max: 24,
                                step: 1,
                                unit: 'px',
                                path: `${this.basePath}.btn.textStyle.size`
                            })
                        );

                        inner.appendChild(
                            C.createWeightSelector({
                                label: 'Peso do texto',
                                value: window.d2State.get(`${this.basePath}.btn.textStyle.weight`, 600),
                                path: `${this.basePath}.btn.textStyle.weight`
                            })
                        );

                        inner.appendChild(
                            C.createColorPicker({
                                label: 'Cor do texto',
                                value: window.d2State.get(`${this.basePath}.btn.textStyle.color`, '#ffffff'),
                                path: `${this.basePath}.btn.textStyle.color`
                            })
                        );

                        return inner;
                    }
                );
                container.appendChild(textGroup);

                // Aparência do botão
                const appearanceGroup = C.createGroupExpander(
                    { title: 'Cor do Botão', expanded: true, nested: true },
                    () => {
                        const inner = document.createElement('div');

                        // Tipo de fundo
                        inner.appendChild(
                            C.createSelect({
                                label: 'Tipo de fundo',
                                value: window.d2State.get(`${this.basePath}.btn.bgType`, 'gradient'),
                                options: [
                                    { value: 'gradient', label: 'Degradê' },
                                    { value: 'solid', label: 'Cor chapada' }
                                ],
                                path: `${this.basePath}.btn.bgType`
                            })
                        );

                        // Paleta de cores (10 cores)
                        inner.appendChild(
                            this.createColorPresetPicker()
                        );

                        return inner;
                    }
                );
                container.appendChild(appearanceGroup);

                // Tamanho e forma
                const sizeGroup = C.createGroupExpander(
                    { title: 'Tamanho e Forma', expanded: false, nested: true },
                    () => {
                        const inner = document.createElement('div');

                        inner.appendChild(
                            C.createSlider({
                                label: 'Arredondamento',
                                value: window.d2State.get(`${this.basePath}.btn.borderRadius`, 30),
                                min: 0,
                                max: 50,
                                step: 2,
                                unit: 'px',
                                path: `${this.basePath}.btn.borderRadius`
                            })
                        );

                        inner.appendChild(
                            C.createSlider({
                                label: 'Padding Vertical',
                                value: window.d2State.get(`${this.basePath}.btn.paddingInner.vertical`, 12),
                                min: 4,
                                max: 32,
                                step: 2,
                                unit: 'px',
                                path: `${this.basePath}.btn.paddingInner.vertical`
                            })
                        );

                        inner.appendChild(
                            C.createSlider({
                                label: 'Padding Horizontal',
                                value: window.d2State.get(`${this.basePath}.btn.paddingInner.horizontal`, 40),
                                min: 8,
                                max: 80,
                                step: 4,
                                unit: 'px',
                                path: `${this.basePath}.btn.paddingInner.horizontal`
                            })
                        );

                        return inner;
                    }
                );
                container.appendChild(sizeGroup);

                // Animação hover
                container.appendChild(
                    C.createToggle({
                        label: 'Animação ao passar o mouse',
                        value: window.d2State.get(`${this.basePath}.btn.hoverAnimation`, true),
                        path: `${this.basePath}.btn.hoverAnimation`
                    })
                );

                // Link do botão
                container.appendChild(
                    C.createTextInput({
                        label: 'Link do botão',
                        value: window.d2State.get(`${this.basePath}.btn.link`, '#'),
                        placeholder: 'https://...',
                        path: `${this.basePath}.btn.link`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(btnGroup);

        return fragment;
    }

    /**
     * Cria mini preview do header com logo na posição e cor correta
     */
    createHeaderMiniPreview() {
        const container = document.createElement('div');
        container.className = 'control-item header-mini-preview-container';

        const label = document.createElement('label');
        label.textContent = 'Logo';
        container.appendChild(label);

        // Wrapper do preview
        const previewWrapper = document.createElement('div');
        previewWrapper.className = 'header-mini-preview';
        previewWrapper.id = 'header-mini-preview';

        // Atualiza o preview inicialmente
        this.updateHeaderMiniPreview(previewWrapper);

        // Input de arquivo oculto
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.id = 'logo-file-input';

        // Clica no preview para fazer upload
        previewWrapper.addEventListener('click', () => {
            fileInput.click();
        });

        // Processa o upload
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Mostra loading
            previewWrapper.style.opacity = '0.5';

            // Converte para WebP se possível
            try {
                const dataUrl = await this.processImageFile(file);
                window.d2State.set('profile.logo', dataUrl);
            } catch (err) {
                console.error('Erro ao processar imagem:', err);
                // Fallback: usa FileReader básico
                const reader = new FileReader();
                reader.onload = (e) => {
                    window.d2State.set('profile.logo', e.target.result);
                };
                reader.readAsDataURL(file);
            }

            previewWrapper.style.opacity = '1';
        });

        container.appendChild(previewWrapper);
        container.appendChild(fileInput);

        // Botão de remover
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn-remove-logo';
        removeBtn.innerHTML = '<i class="fa fa-times"></i>';
        removeBtn.title = 'Remover logo';
        removeBtn.onclick = (e) => {
            e.stopPropagation();
            window.d2State.set('profile.logo', '');
        };
        previewWrapper.appendChild(removeBtn);

        // Subscribe para atualizações do logo e posição
        window.d2State.subscribe(({ path }) => {
            if (path.includes('profile.logo') || path.includes('header.logoPosition')) {
                this.updateHeaderMiniPreview(previewWrapper);
            }
        });

        return container;
    }

    /**
     * Atualiza o mini preview do header (fundo cinza, logo preto, com posição)
     */
    updateHeaderMiniPreview(wrapper) {
        const logo = window.d2State.get('profile.logo', '');
        const position = window.d2State.get('d2Adjustments.header.logoPosition', 'left');

        // Aplica posição do logo
        let justifyContent = 'flex-start';
        if (position === 'center') justifyContent = 'center';
        if (position === 'right') justifyContent = 'flex-end';
        wrapper.style.justifyContent = justifyContent;

        // Atualiza ou cria a imagem do logo
        let logoImg = wrapper.querySelector('.header-preview-logo');

        if (logo) {
            if (!logoImg) {
                logoImg = document.createElement('img');
                logoImg.className = 'header-preview-logo';
                wrapper.insertBefore(logoImg, wrapper.firstChild);
            }
            logoImg.src = logo;

            // Remove placeholder se existir
            const placeholder = wrapper.querySelector('.header-preview-placeholder');
            if (placeholder) placeholder.remove();
        } else {
            if (logoImg) logoImg.remove();

            // Placeholder se não tem logo
            let placeholder = wrapper.querySelector('.header-preview-placeholder');
            if (!placeholder) {
                placeholder = document.createElement('div');
                placeholder.className = 'header-preview-placeholder';
                placeholder.innerHTML = '<i class="fa fa-upload"></i><span>Clique para adicionar logo</span>';
                wrapper.insertBefore(placeholder, wrapper.firstChild);
            }
        }
    }

    /**
     * Cria mini preview da imagem de fundo com botões editar/excluir
     */
    createBgImageMiniPreview() {
        console.log('[Hero Editor] createBgImageMiniPreview called');
        const container = document.createElement('div');
        container.className = 'control-item bg-image-preview-container';

        const label = document.createElement('label');
        label.textContent = 'Imagem de fundo';
        container.appendChild(label);

        // Wrapper do preview
        const previewWrapper = document.createElement('div');
        previewWrapper.className = 'bg-image-mini-preview';
        previewWrapper.id = 'bg-image-mini-preview';

        // Input de arquivo oculto
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.id = 'bg-image-file-input';

        // Atualiza o preview inicialmente
        this.updateBgImageMiniPreview(previewWrapper, fileInput);

        container.appendChild(previewWrapper);
        container.appendChild(fileInput);

        // Subscribe para atualizações
        window.d2State.subscribe(({ path }) => {
            if (path.includes('.bgImage') || path.includes('.bgPositionX') ||
                path.includes('.bgPositionY') || path.includes('.bgZoom')) {
                this.updateBgImageMiniPreview(previewWrapper, fileInput);
            }
        });

        return container;
    }

    /**
     * Atualiza o mini preview da imagem de fundo
     */
    updateBgImageMiniPreview(wrapper, fileInput) {
        // Lógica:
        // - '_REMOVED_' → Usuário removeu explicitamente, mostra placeholder
        // - falsy (null, undefined, '', 'null') → Usa default do template
        // - 'url...' → Imagem customizada
        const rawValue = window.d2State.get(`${this.basePath}.bgImage`);
        const wasRemoved = rawValue === '_REMOVED_';
        const bgImage = wasRemoved ? '' : (rawValue && rawValue !== 'null' ? rawValue : 'hero-bg.webp');

        console.log('[Hero Editor] BG Image:', bgImage, 'Raw:', rawValue, 'Removed:', wasRemoved);

        wrapper.innerHTML = ''; // Limpa

        if (bgImage) { // Tem imagem para mostrar
            // Pega valores de posição e zoom
            const posX = window.d2State.get(`${this.basePath}.bgPositionX`, 50);
            const posY = window.d2State.get(`${this.basePath}.bgPositionY`, 50);
            const zoom = window.d2State.get(`${this.basePath}.bgZoom`, 100);

            // Tem imagem - mostra thumbnail com botões
            const thumb = document.createElement('div');
            thumb.className = 'bg-thumb';
            thumb.style.backgroundImage = `url(${bgImage})`;
            thumb.style.backgroundPosition = `${posX}% ${posY}%`;
            thumb.style.backgroundSize = `${zoom}%`;

            const actions = document.createElement('div');
            actions.className = 'bg-actions';

            // Botão editar (trocar imagem)
            const editBtn = document.createElement('button');
            editBtn.className = 'bg-action-btn';
            editBtn.innerHTML = '<i class="fa fa-pencil"></i>';
            editBtn.title = 'Trocar imagem';
            editBtn.onclick = (e) => {
                e.stopPropagation();
                fileInput.click();
            };

            // Botão excluir
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'bg-action-btn bg-action-delete';
            deleteBtn.innerHTML = '<i class="fa fa-trash"></i>';
            deleteBtn.title = 'Remover imagem';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                window.d2State.set(`${this.basePath}.bgImage`, '_REMOVED_'); // Marcador especial
            };

            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            thumb.appendChild(actions);
            wrapper.appendChild(thumb);

            // Info text
            const info = document.createElement('span');
            info.className = 'bg-info';
            info.textContent = 'Imagem adicionada';
            wrapper.appendChild(info);
        } else {
            // Sem imagem - mostra placeholder para upload
            wrapper.classList.add('empty');
            wrapper.innerHTML = `
                <div class="bg-placeholder">
                    <i class="fa fa-image"></i>
                    <span>Clique para adicionar imagem</span>
                </div>
            `;
            wrapper.onclick = () => fileInput.click();
        }

        // Handler do file input
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            wrapper.style.opacity = '0.5';
            try {
                const dataUrl = await this.processImageFile(file);
                window.d2State.set(`${this.basePath}.bgImage`, dataUrl);
            } catch (err) {
                console.error('Erro ao processar imagem:', err);
            }
            wrapper.style.opacity = '1';
            fileInput.value = ''; // Reset para permitir reupload do mesmo arquivo
        };

        // Remove classe empty se tem imagem
        if (bgImage) {
            wrapper.classList.remove('empty');
            wrapper.onclick = null;
        }
    }

    /**
     * Processa arquivo de imagem e converte para WebP
     */
    async processImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    // Tenta converter para WebP
                    try {
                        const webpData = canvas.toDataURL('image/webp', 0.85);
                        resolve(webpData);
                    } catch {
                        resolve(e.target.result); // Fallback para original
                    }
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Cria o seletor visual de cores preset para o botão
     */
    createColorPresetPicker() {
        const container = document.createElement('div');
        container.className = 'control-item';

        const currentPreset = window.d2State.get(`${this.basePath}.btn.bgPreset`, 'blue');
        const currentCustomColor = window.d2State.get(`${this.basePath}.btn.bgColor`, '#5167E7');

        container.innerHTML = `
            <label>Paleta de cores</label>
            <div class="color-preset-grid compact">
                ${Object.entries(BUTTON_COLOR_PRESETS).map(([key, preset]) => `
                    <button 
                        class="color-preset-btn ${key === currentPreset ? 'active' : ''}" 
                        data-preset="${key}"
                        style="background: ${preset.gradient}"
                        title="${preset.label}"
                    ></button>
                `).join('')}
            </div>
            <div class="custom-color-row">
                <span>Cor personalizada:</span>
                <input type="color" class="custom-color-picker" value="${currentCustomColor}" title="Clique para escolher uma cor">
            </div>
        `;

        // Event listeners para os botões de preset
        const buttons = container.querySelectorAll('.color-preset-btn');
        const customColorPicker = container.querySelector('.custom-color-picker');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const presetKey = btn.dataset.preset;
                const preset = BUTTON_COLOR_PRESETS[presetKey];

                // Remove active de todos e adiciona ao clicado
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Atualiza o estado
                window.d2State.set(`${this.basePath}.btn.bgPreset`, presetKey);
                window.d2State.set(`${this.basePath}.btn.bgGradient`, preset.gradient);
                window.d2State.set(`${this.basePath}.btn.bgColor`, preset.solid);

                // Atualiza o color picker custom também
                customColorPicker.value = preset.solid;

                // Se for off-white, muda a cor do texto
                if (preset.textColor) {
                    window.d2State.set(`${this.basePath}.btn.textStyle.color`, preset.textColor);
                }
            });
        });

        // Event listener para color picker personalizado
        customColorPicker.addEventListener('input', (e) => {
            const color = e.target.value;

            // Remove active de todos os presets
            buttons.forEach(b => b.classList.remove('active'));

            // Atualiza o estado para cor sólida
            window.d2State.set(`${this.basePath}.btn.bgPreset`, 'custom');
            window.d2State.set(`${this.basePath}.btn.bgColor`, color);
            window.d2State.set(`${this.basePath}.btn.bgGradient`, color);
        });

        return container;
    }
}

// Exporta globalmente
window.D2HeroEditor = D2HeroEditor;
window.BUTTON_COLOR_PRESETS = BUTTON_COLOR_PRESETS;

console.log('[D2 Hero Editor] Module loaded');
