/* ============================================
   EDITOR D2 - FOOTER EDITOR
   Painel de edição da seção Footer
   ============================================ */

/**
 * D2 Footer Editor Component
 * Gera os controles para editar a seção Footer
 */
class D2FooterEditor {
    constructor() {
        this.basePath = 'd2Adjustments.footer';
    }

    /**
     * Renderiza todos os controles do Footer
     * @returns {DocumentFragment}
     */
    render() {
        const fragment = document.createDocumentFragment();
        const C = window.D2Controls;

        // ===== SEÇÃO GERAL =====
        const sectionGroup = C.createGroupExpander(
            { title: 'Seção', icon: 'fa-layer-group', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor de fundo',
                        value: window.d2State.get(`${this.basePath}.bgColor`, '#1a365d'),
                        path: `${this.basePath}.bgColor`
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Espaçamento',
                        value: window.d2State.get(`${this.basePath}.sectionSpacing`, 40),
                        min: 20, max: 80, step: 5, unit: 'px',
                        path: `${this.basePath}.sectionSpacing`
                    })
                );

                container.appendChild(
                    C.createSelect({
                        label: 'Tipo de fundo',
                        value: window.d2State.get(`${this.basePath}.bgType`, 'solid'),
                        options: [
                            { value: 'solid', label: 'Cor Sólida' },
                            { value: 'gradient', label: 'Degradê' }
                        ],
                        path: `${this.basePath}.bgType`
                    })
                );

                // Presets de degradê (quando tipo = gradient)
                if (window.d2State.get(`${this.basePath}.bgType`, 'solid') === 'gradient') {
                    const label = document.createElement('div');
                    label.style.cssText = 'font-size: 11px; opacity: 0.6; margin-top: 8px;';
                    label.textContent = 'Escolha o degradê:';
                    container.appendChild(label);
                    container.appendChild(C.createGradientPresets({
                        value: window.d2State.get(`${this.basePath}.bgGradient`, 'linear-gradient(135deg, #1a365d 0%, #2d3a81 50%, #0d1b36 100%)'),
                        path: `${this.basePath}.bgGradient`
                    }));
                }

                return container;
            }
        );
        fragment.appendChild(sectionGroup);

        // ===== LINHA DECORATIVA =====
        fragment.appendChild(C.createTopLineSection({ basePath: this.basePath }));

        // ===== LOGO =====
        const logoGroup = C.createGroupExpander(
            { title: 'Logo', icon: 'fa-image', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createSlider({
                        label: 'Tamanho',
                        value: window.d2State.get(`${this.basePath}.logo.size`, 28),
                        min: 16, max: 60, step: 2, unit: 'px',
                        path: `${this.basePath}.logo.size`
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Opacidade',
                        value: window.d2State.get(`${this.basePath}.logo.opacity`, 0.8) * 100,
                        min: 30, max: 100, step: 5, unit: '%',
                        path: `${this.basePath}.logo.opacity`
                    })
                );

                container.appendChild(
                    C.createSelect({
                        label: 'Cor do logo',
                        value: window.d2State.get(`${this.basePath}.logo.color`, 'white'),
                        options: [
                            { value: 'white', label: 'Branco' },
                            { value: 'black', label: 'Preto' },
                            { value: 'original', label: 'Original' }
                        ],
                        path: `${this.basePath}.logo.color`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(logoGroup);

        // ===== TÍTULO =====
        const titleGroup = C.createGroupExpander(
            { title: 'Título', icon: 'fa-heading', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createTextInput({
                        label: 'Texto do título',
                        value: window.d2State.get(`${this.basePath}.title.text`, 'Invista no seu negócio!'),
                        placeholder: 'Ex: Entre em contato!',
                        path: `${this.basePath}.title.text`
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Tamanho da fonte',
                        value: window.d2State.get(`${this.basePath}.title.size`, 24),
                        min: 16, max: 40, step: 2, unit: 'px',
                        path: `${this.basePath}.title.size`
                    })
                );

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor do texto',
                        value: window.d2State.get(`${this.basePath}.title.color`, '#ffffff'),
                        path: `${this.basePath}.title.color`
                    })
                );

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
                        label: 'Texto',
                        value: window.d2State.get(`${this.basePath}.subtitle.text`, ''),
                        placeholder: 'Ex: Rafael Demeni - Campina Grande',
                        path: `${this.basePath}.subtitle.text`
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Tamanho da fonte',
                        value: window.d2State.get(`${this.basePath}.subtitle.size`, 14),
                        min: 10, max: 20, step: 1, unit: 'px',
                        path: `${this.basePath}.subtitle.size`
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Opacidade',
                        value: window.d2State.get(`${this.basePath}.subtitle.opacity`, 0.6) * 100,
                        min: 30, max: 100, step: 5, unit: '%',
                        path: `${this.basePath}.subtitle.opacity`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(subtitleGroup);

        // ===== INFORMAÇÕES DE CONTATO =====
        const infoGroup = C.createGroupExpander(
            { title: 'Informações de Contato', icon: 'fa-info-circle', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createTextInput({
                        label: 'Email',
                        value: window.d2State.get(`${this.basePath}.info.email`, ''),
                        placeholder: 'contato@exemplo.com',
                        path: `${this.basePath}.info.email`
                    })
                );

                container.appendChild(
                    C.createTextInput({
                        label: 'Telefone',
                        value: window.d2State.get(`${this.basePath}.info.phone`, ''),
                        placeholder: '(00) 00000-0000',
                        path: `${this.basePath}.info.phone`
                    })
                );

                container.appendChild(
                    C.createTextInput({
                        label: 'CNPJ',
                        value: window.d2State.get(`${this.basePath}.info.cnpj`, ''),
                        placeholder: 'XX.XXX.XXX/0001-XX',
                        path: `${this.basePath}.info.cnpj`
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Tamanho da fonte',
                        value: window.d2State.get(`${this.basePath}.info.size`, 13),
                        min: 10, max: 18, step: 1, unit: 'px',
                        path: `${this.basePath}.info.size`
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Opacidade',
                        value: window.d2State.get(`${this.basePath}.info.opacity`, 0.8) * 100,
                        min: 30, max: 100, step: 5, unit: '%',
                        path: `${this.basePath}.info.opacity`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(infoGroup);

        // ===== REDES SOCIAIS =====
        const socialGroup = C.createGroupExpander(
            { title: 'Redes Sociais', icon: 'fa-share-alt', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createSlider({
                        label: 'Tamanho dos ícones',
                        value: window.d2State.get(`${this.basePath}.social.size`, 36),
                        min: 24, max: 56, step: 4, unit: 'px',
                        path: `${this.basePath}.social.size`
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Espaçamento entre ícones',
                        value: window.d2State.get(`${this.basePath}.social.gap`, 8),
                        min: 4, max: 20, step: 2, unit: 'px',
                        path: `${this.basePath}.social.gap`
                    })
                );

                container.appendChild(
                    C.createTextInput({
                        label: 'Instagram',
                        value: window.d2State.get(`${this.basePath}.social.instagram`, ''),
                        placeholder: 'https://instagram.com/usuario',
                        path: `${this.basePath}.social.instagram`
                    })
                );

                container.appendChild(
                    C.createTextInput({
                        label: 'Facebook',
                        value: window.d2State.get(`${this.basePath}.social.facebook`, ''),
                        placeholder: 'https://facebook.com/usuario',
                        path: `${this.basePath}.social.facebook`
                    })
                );

                container.appendChild(
                    C.createTextInput({
                        label: 'WhatsApp',
                        value: window.d2State.get(`${this.basePath}.social.whatsapp`, ''),
                        placeholder: '5583999999999',
                        path: `${this.basePath}.social.whatsapp`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(socialGroup);

        return fragment;
    }
}

// Exporta globalmente
window.D2FooterEditor = D2FooterEditor;

console.log('[D2 Footer Editor] Module loaded');
