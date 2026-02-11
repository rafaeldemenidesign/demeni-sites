/* ============================================
   EDITOR D2 - CTA EDITOR
   Painel de edição da seção CTA Secundário
   ============================================ */

/**
 * D2 CTA Editor Component
 * Gera os controles para editar a seção CTA secundário
 */
class D2CTAEditor {
    constructor() {
        this.basePath = 'd2Adjustments.cta';
    }

    /**
     * Renderiza todos os controles do CTA
     * @returns {DocumentFragment}
     */
    render() {
        const fragment = document.createDocumentFragment();
        const C = window.D2Controls;

        // ===== FUNDO DA SEÇÃO =====
        const bgGroup = C.createBgSection({
            basePath: this.basePath,
            defaults: { bgMode: 'image', bgColor: '#1a365d', bgColor2: '#0d1b2a', bgOverlay: true }
        });
        fragment.appendChild(bgGroup);

        // ===== LINHA DECORATIVA =====
        fragment.appendChild(C.createTopLineSection({ basePath: this.basePath }));

        // ===== LAYOUT =====
        const layoutGroup = C.createGroupExpander(
            { title: 'Layout', icon: 'fa-expand-alt', expanded: false },
            () => {
                const container = document.createElement('div');
                container.appendChild(C.createSlider({
                    label: 'Altura da seção',
                    value: window.d2State.get(`${this.basePath}.height`, 250),
                    min: 150, max: 400, step: 25, unit: 'px',
                    path: `${this.basePath}.height`
                }));
                return container;
            }
        );
        fragment.appendChild(layoutGroup);

        // ===== TÍTULO =====
        const titleGroup = C.createGroupExpander(
            { title: 'Título', icon: 'fa-heading', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createTextInput({
                    label: 'Texto do título',
                    value: window.d2State.get(`${this.basePath}.title.text`, ''),
                    placeholder: 'Deixe vazio para usar o nome do perfil',
                    path: `${this.basePath}.title.text`
                }));

                container.appendChild(C.createSlider({
                    label: 'Tamanho',
                    value: window.d2State.get(`${this.basePath}.title.size`, 52),
                    min: 28, max: 72, step: 2, unit: 'px',
                    path: `${this.basePath}.title.size`
                }));

                container.appendChild(C.createWeightSelector({
                    label: 'Peso',
                    value: window.d2State.get(`${this.basePath}.title.weight`, 400),
                    path: `${this.basePath}.title.weight`
                }));

                container.appendChild(C.createColorPicker({
                    label: 'Cor',
                    value: window.d2State.get(`${this.basePath}.title.color`, '#ffffff'),
                    path: `${this.basePath}.title.color`
                }));

                return container;
            }
        );
        fragment.appendChild(titleGroup);

        // ===== SUBTÍTULO =====
        const subtitleGroup = C.createGroupExpander(
            { title: 'Subtítulo', icon: 'fa-font', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createTextInput({
                    label: 'Texto do subtítulo',
                    value: window.d2State.get(`${this.basePath}.subtitle.text`, ''),
                    placeholder: 'Deixe vazio para usar a profissão',
                    path: `${this.basePath}.subtitle.text`
                }));

                container.appendChild(C.createSlider({
                    label: 'Tamanho',
                    value: window.d2State.get(`${this.basePath}.subtitle.size`, 20),
                    min: 14, max: 36, step: 1, unit: 'px',
                    path: `${this.basePath}.subtitle.size`
                }));

                container.appendChild(C.createWeightSelector({
                    label: 'Peso',
                    value: window.d2State.get(`${this.basePath}.subtitle.weight`, 400),
                    path: `${this.basePath}.subtitle.weight`
                }));

                container.appendChild(C.createColorPicker({
                    label: 'Cor',
                    value: window.d2State.get(`${this.basePath}.subtitle.color`, '#ffffff'),
                    path: `${this.basePath}.subtitle.color`
                }));

                container.appendChild(C.createSlider({
                    label: 'Opacidade',
                    value: window.d2State.get(`${this.basePath}.subtitle.opacity`, 0.8) * 100,
                    min: 30, max: 100, step: 5, unit: '%',
                    path: `${this.basePath}.subtitle.opacity`
                }));

                return container;
            }
        );
        fragment.appendChild(subtitleGroup);

        // ===== BOTÃO CTA =====
        const btnGroup = C.createGroupExpander(
            { title: 'Botão CTA', icon: 'fa-mouse-pointer', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createTextInput({
                    label: 'Texto do botão',
                    value: window.d2State.get(`${this.basePath}.btn.text`, 'QUERO SABER MAIS'),
                    placeholder: 'Ex: FALE COMIGO',
                    path: `${this.basePath}.btn.text`
                }));

                container.appendChild(C.createTextInput({
                    label: 'Link do botão',
                    value: window.d2State.get(`${this.basePath}.btn.link`, '#'),
                    placeholder: 'https://...',
                    path: `${this.basePath}.btn.link`
                }));

                container.appendChild(C.createColorPicker({
                    label: 'Cor de fundo',
                    value: window.d2State.get(`${this.basePath}.btn.bgColor`, '#5167E7'),
                    path: `${this.basePath}.btn.bgColor`
                }));

                container.appendChild(C.createSlider({
                    label: 'Arredondamento',
                    value: window.d2State.get(`${this.basePath}.btn.borderRadius`, 30),
                    min: 0, max: 50, step: 2, unit: 'px',
                    path: `${this.basePath}.btn.borderRadius`
                }));

                container.appendChild(C.createToggle({
                    label: 'Animação ao passar o mouse',
                    value: window.d2State.get(`${this.basePath}.btn.hoverAnimation`, true),
                    path: `${this.basePath}.btn.hoverAnimation`
                }));

                return container;
            }
        );
        fragment.appendChild(btnGroup);

        return fragment;
    }
}

// Exporta globalmente
window.D2CTAEditor = D2CTAEditor;

console.log('[D2 CTA Editor] Module loaded');
