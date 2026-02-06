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
            { title: 'Logo', icon: 'fa-image', expanded: true },
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

                return container;
            }
        );
        fragment.appendChild(logoGroup);

        // ===== LAYOUT DO HEADER =====
        const layoutGroup = C.createGroupExpander(
            { title: 'Layout', icon: 'fa-arrows-alt-v', expanded: true },
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

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor de fundo',
                        value: window.d2State.get(`${this.basePath}.bgColor`, '#2d2d2d'),
                        path: `${this.basePath}.bgColor`
                    })
                );

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor do texto/ícones',
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

        return fragment;
    }
}

// Exporta globalmente
window.D2HeaderEditor = D2HeaderEditor;

console.log('[D2 Header Editor] Module loaded');
