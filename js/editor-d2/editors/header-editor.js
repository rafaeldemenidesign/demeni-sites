/* ============================================
   EDITOR D2 - HEADER EDITOR
   Painel de edição da seção Header
   ============================================ */

/**
 * D2 Header Editor Component
 * Gera os controles para editar o Header
 */
class D2HeaderEditor {
    constructor() {
        this.basePath = 'd2Adjustments.header';
    }

    /**
     * Renderiza todos os controles do Header
     * @returns {DocumentFragment}
     */
    render() {
        const fragment = document.createDocumentFragment();
        const C = window.D2Controls;

        // ===== LOGO =====
        const logoGroup = C.createGroupExpander(
            { title: 'Logo', icon: 'fa-image', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createImagePicker({
                        label: 'Imagem do logo',
                        value: window.d2State.get('profile.logo'),
                        path: 'profile.logo',
                        aspect: 'auto'
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Tamanho do logo',
                        value: window.d2State.get(`${this.basePath}.logo.size`, 28),
                        min: 16, max: 60, step: 2, unit: 'px',
                        path: `${this.basePath}.logo.size`
                    })
                );

                container.appendChild(
                    C.createSelect({
                        label: 'Posição do logo',
                        value: window.d2State.get(`${this.basePath}.logoPosition`, 'left'),
                        options: [
                            { value: 'left', label: 'Esquerda' },
                            { value: 'center', label: 'Centro' },
                            { value: 'right', label: 'Direita' }
                        ],
                        path: `${this.basePath}.logoPosition`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(logoGroup);

        // ===== LAYOUT DO HEADER =====
        const layoutGroup = C.createGroupExpander(
            { title: 'Layout', icon: 'fa-arrows-alt-v', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createSlider({
                        label: 'Altura do header',
                        value: window.d2State.get(`${this.basePath}.height`, 80),
                        min: 50, max: 120, step: 5, unit: 'px',
                        path: `${this.basePath}.height`
                    })
                );

                // === Tipo de fundo (Sólido / Degradê) ===
                const currentBgType = window.d2State.get(`${this.basePath}.bgType`, 'solid');

                container.appendChild(
                    C.createSelect({
                        label: 'Tipo de fundo',
                        value: currentBgType,
                        options: [
                            { value: 'solid', label: 'Sólido' },
                            { value: 'gradient', label: 'Degradê' }
                        ],
                        path: `${this.basePath}.bgType`
                    })
                );

                // === Cor sólida (visível quando bgType = solid) ===
                const solidColorEl = C.createColorPicker({
                    label: 'Cor de fundo',
                    value: window.d2State.get(`${this.basePath}.bgColor`, '#2d2d2d'),
                    path: `${this.basePath}.bgColor`
                });
                solidColorEl.dataset.headerBgControl = 'solid';
                if (currentBgType !== 'solid') solidColorEl.style.display = 'none';
                container.appendChild(solidColorEl);

                // === Gradient presets (visível quando bgType = gradient) ===
                const gradientWrapper = document.createElement('div');
                gradientWrapper.dataset.headerBgControl = 'gradient';
                if (currentBgType !== 'gradient') gradientWrapper.style.display = 'none';

                // Label
                const gradLabel = document.createElement('label');
                gradLabel.className = 'control-label';
                gradLabel.textContent = 'Degradê';
                gradLabel.style.cssText = 'font-size: 12px; color: var(--d2-text-secondary); margin-bottom: 6px; display: block;';
                gradientWrapper.appendChild(gradLabel);

                // Presets grid
                gradientWrapper.appendChild(
                    C.createGradientPresets({
                        value: window.d2State.get(`${this.basePath}.bgGradient`, 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)'),
                        path: `${this.basePath}.bgGradient`
                    })
                );

                // Orientation selector
                gradientWrapper.appendChild(
                    C.createSelect({
                        label: 'Orientação',
                        value: window.d2State.get(`${this.basePath}.bgGradientOrientation`, 'horizontal'),
                        options: [
                            { value: 'horizontal', label: 'Diagonal ↘' },
                            { value: 'vertical', label: 'Vertical ↓' }
                        ],
                        path: `${this.basePath}.bgGradientOrientation`
                    })
                );

                // Invert toggle
                gradientWrapper.appendChild(
                    C.createToggle({
                        label: 'Inverter direção',
                        value: window.d2State.get(`${this.basePath}.bgGradientInvert`, false),
                        path: `${this.basePath}.bgGradientInvert`
                    })
                );

                container.appendChild(gradientWrapper);

                // === Toggle visibility on bgType change ===
                window.d2State.subscribe(({ path }) => {
                    if (path === `${this.basePath}.bgType`) {
                        const newType = window.d2State.get(`${this.basePath}.bgType`, 'solid');
                        solidColorEl.style.display = newType === 'solid' ? '' : 'none';
                        gradientWrapper.style.display = newType === 'gradient' ? '' : 'none';
                    }
                });

                // === Cor do ícone ☰ (menu hamburger) ===
                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor do ícone ☰ menu',
                        value: window.d2State.get(`${this.basePath}.textColor`, '#ffffff'),
                        path: `${this.basePath}.textColor`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(layoutGroup);

        // ===== INFORMAÇÕES DA MARCA =====
        const brandGroup = C.createGroupExpander(
            { title: 'Informações da Marca', icon: 'fa-store', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createTextInput({
                        label: 'Nome da marca',
                        value: window.d2State.get('profile.name', ''),
                        placeholder: 'Ex: Minha Loja',
                        path: 'profile.name'
                    })
                );

                container.appendChild(
                    C.createTextInput({
                        label: 'Descrição/Tagline',
                        value: window.d2State.get('profile.role', ''),
                        placeholder: 'Ex: Sua melhor opção',
                        path: 'profile.role'
                    })
                );

                return container;
            }
        );
        fragment.appendChild(brandGroup);

        // ===== MENU LATERAL (SIDEBAR) =====
        const sidebarGroup = C.createGroupExpander(
            { title: 'Menu Lateral', icon: 'fa-bars', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor de fundo',
                        value: window.d2State.get(`${this.basePath}.sidebar.bgColor`, '#1a1a1a'),
                        path: `${this.basePath}.sidebar.bgColor`
                    })
                );

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor do texto',
                        value: window.d2State.get(`${this.basePath}.sidebar.textColor`, '#ffffff'),
                        path: `${this.basePath}.sidebar.textColor`
                    })
                );

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor de destaque',
                        value: window.d2State.get(`${this.basePath}.sidebar.accentColor`, '#e67e22'),
                        path: `${this.basePath}.sidebar.accentColor`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(sidebarGroup);

        return fragment;
    }
}

// Exporta globalmente
window.D2HeaderEditor = D2HeaderEditor;

console.log('[D2 Header Editor] Module loaded');
