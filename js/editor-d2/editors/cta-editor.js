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
        const bgGroup = C.createGroupExpander(
            { title: 'Fundo da Seção', icon: 'fa-fill-drip', expanded: true },
            () => {
                const container = document.createElement('div');
                const dividerStyle = 'font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; margin: 16px 0 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);';

                const bgMode = window.d2State.get(`${this.basePath}.bgMode`, 'image');

                // Mode toggle buttons
                const modeDiv = document.createElement('div');
                modeDiv.style.cssText = 'display: flex; gap: 4px; margin-bottom: 12px;';
                modeDiv.innerHTML = `
                    <button class="mode-btn ${bgMode === 'color' ? 'active' : ''}" data-mode="color" style="flex:1;padding:8px;border:1px solid rgba(255,255,255,0.2);border-radius:6px;background:${bgMode === 'color' ? 'rgba(255,255,255,0.15)' : 'transparent'};color:inherit;cursor:pointer;font-size:12px;">
                        <i class="fas fa-palette"></i> Cor
                    </button>
                    <button class="mode-btn ${bgMode === 'image' ? 'active' : ''}" data-mode="image" style="flex:1;padding:8px;border:1px solid rgba(255,255,255,0.2);border-radius:6px;background:${bgMode === 'image' ? 'rgba(255,255,255,0.15)' : 'transparent'};color:inherit;cursor:pointer;font-size:12px;">
                        <i class="fas fa-image"></i> Imagem
                    </button>
                `;
                modeDiv.querySelectorAll('.mode-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        window.d2State.set(`${this.basePath}.bgMode`, btn.dataset.mode);
                        document.dispatchEvent(new CustomEvent('d2:section-selected', {
                            detail: { sectionId: 'cta' }
                        }));
                    });
                });
                container.appendChild(modeDiv);

                if (bgMode === 'color') {
                    // ── COLOR MODE ──
                    container.appendChild(C.createColorPicker({
                        label: 'Cor principal',
                        value: window.d2State.get(`${this.basePath}.bgColor`, '#1a365d'),
                        path: `${this.basePath}.bgColor`
                    }));

                    container.appendChild(C.createToggle({
                        label: 'Ativar degradê',
                        value: window.d2State.get(`${this.basePath}.bgGradient`, false),
                        path: `${this.basePath}.bgGradient`
                    }));

                    if (window.d2State.get(`${this.basePath}.bgGradient`, false)) {
                        container.appendChild(C.createColorPicker({
                            label: 'Cor 2',
                            value: window.d2State.get(`${this.basePath}.bgColor2`, '#0d1b2a'),
                            path: `${this.basePath}.bgColor2`
                        }));
                        container.appendChild(C.createToggle({
                            label: 'Inverter direção',
                            value: window.d2State.get(`${this.basePath}.bgGradientInvert`, false),
                            path: `${this.basePath}.bgGradientInvert`
                        }));
                    }
                } else {
                    // ── IMAGE MODE ──
                    container.appendChild(C.createImagePicker({
                        label: 'Imagem de fundo',
                        value: window.d2State.get(`${this.basePath}.bgImage`, null),
                        path: `${this.basePath}.bgImage`,
                        aspect: '16/9'
                    }));

                    container.appendChild(C.createSlider({
                        label: 'Desfoque',
                        value: window.d2State.get(`${this.basePath}.bgImageBlur`, 0),
                        min: 0, max: 20, step: 1, unit: 'px',
                        path: `${this.basePath}.bgImageBlur`
                    }));
                    container.appendChild(C.createSlider({
                        label: 'Zoom',
                        value: window.d2State.get(`${this.basePath}.bgImageZoom`, 100),
                        min: 100, max: 300, step: 5, unit: '%',
                        path: `${this.basePath}.bgImageZoom`
                    }));
                    container.appendChild(C.createSlider({
                        label: 'Horizontal',
                        value: window.d2State.get(`${this.basePath}.bgImagePosX`, 50),
                        min: 0, max: 100, step: 1, unit: '%',
                        path: `${this.basePath}.bgImagePosX`
                    }));
                    container.appendChild(C.createSlider({
                        label: 'Vertical',
                        value: window.d2State.get(`${this.basePath}.bgImagePosY`, 0),
                        min: 0, max: 100, step: 1, unit: '%',
                        path: `${this.basePath}.bgImagePosY`
                    }));

                    const overlayDiv = document.createElement('div');
                    overlayDiv.style.cssText = dividerStyle;
                    overlayDiv.textContent = 'Sobreposição';
                    container.appendChild(overlayDiv);

                    container.appendChild(C.createToggle({
                        label: 'Ativar overlay',
                        value: window.d2State.get(`${this.basePath}.bgOverlay`, true),
                        path: `${this.basePath}.bgOverlay`
                    }));

                    if (window.d2State.get(`${this.basePath}.bgOverlay`, true)) {
                        container.appendChild(C.createSelect({
                            label: 'Tipo de overlay',
                            value: window.d2State.get(`${this.basePath}.bgOverlayType`, 'solid'),
                            path: `${this.basePath}.bgOverlayType`,
                            options: [
                                { value: 'solid', label: 'Cor chapada' },
                                { value: 'gradient', label: 'Degradê cor-cor' },
                                { value: 'gradientTransparent', label: 'Degradê → Transparente' }
                            ]
                        }));

                        container.appendChild(C.createColorPicker({
                            label: 'Cor do overlay',
                            value: window.d2State.get(`${this.basePath}.bgOverlayColor`, '#000000'),
                            path: `${this.basePath}.bgOverlayColor`
                        }));

                        const overlayType = window.d2State.get(`${this.basePath}.bgOverlayType`, 'solid');
                        if (overlayType === 'gradient') {
                            container.appendChild(C.createColorPicker({
                                label: 'Cor 2 do overlay',
                                value: window.d2State.get(`${this.basePath}.bgOverlayColor2`, '#000000'),
                                path: `${this.basePath}.bgOverlayColor2`
                            }));
                        }

                        container.appendChild(C.createSlider({
                            label: 'Opacidade',
                            value: window.d2State.get(`${this.basePath}.bgOverlayOpacity`, 50),
                            min: 0, max: 100, step: 5, unit: '%',
                            path: `${this.basePath}.bgOverlayOpacity`
                        }));

                        if (overlayType !== 'solid') {
                            container.appendChild(C.createToggle({
                                label: 'Inverter direção',
                                value: window.d2State.get(`${this.basePath}.bgOverlayInvert`, false),
                                path: `${this.basePath}.bgOverlayInvert`
                            }));
                            container.appendChild(C.createSlider({
                                label: 'Posição',
                                value: window.d2State.get(`${this.basePath}.bgOverlayPosition`, 50),
                                min: 0, max: 100, step: 5, unit: '%',
                                path: `${this.basePath}.bgOverlayPosition`
                            }));
                            container.appendChild(C.createSlider({
                                label: 'Suavidade',
                                value: window.d2State.get(`${this.basePath}.bgOverlaySpread`, 80),
                                min: 10, max: 100, step: 5, unit: '%',
                                path: `${this.basePath}.bgOverlaySpread`
                            }));
                        }
                    }
                }

                // Height
                const spDiv = document.createElement('div');
                spDiv.style.cssText = dividerStyle;
                spDiv.textContent = 'Layout';
                container.appendChild(spDiv);

                container.appendChild(C.createSlider({
                    label: 'Altura da seção',
                    value: window.d2State.get(`${this.basePath}.height`, 250),
                    min: 150, max: 400, step: 25, unit: 'px',
                    path: `${this.basePath}.height`
                }));

                return container;
            }
        );
        fragment.appendChild(bgGroup);

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
