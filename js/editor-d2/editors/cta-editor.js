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
        const replicateHero = window.d2State.get(`${this.basePath}.replicateHero`, true);
        const divStyle = 'font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; margin: 16px 0 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);';

        // ===== MODO: REPLICAR HERO / PERSONALIZADO =====
        const modeGroup = C.createGroupExpander(
            { title: 'Modo da Seção', icon: 'fa-copy', expanded: true },
            () => {
                const container = document.createElement('div');

                // Toggle visual
                const toggleDiv = document.createElement('div');
                toggleDiv.className = 'control-item';
                const makeBtn = (mode, icon, label, isActive) => {
                    const btn = document.createElement('button');
                    btn.textContent = label;
                    btn.dataset.mode = mode;
                    btn.style.cssText = `flex:1;padding:10px 8px;border:1px solid rgba(255,255,255,${isActive ? '0.4' : '0.15'});border-radius:8px;background:${isActive ? 'rgba(255,255,255,0.15)' : 'transparent'};color:inherit;cursor:pointer;font-size:12px;font-weight:${isActive ? '600' : '400'};transition:all 0.2s;`;
                    btn.addEventListener('click', () => {
                        window.d2State.set(`${this.basePath}.replicateHero`, mode === 'hero');
                        document.dispatchEvent(new CustomEvent('d2:section-selected', {
                            detail: { sectionId: 'cta' }
                        }));
                    });
                    return btn;
                };

                const lbl = document.createElement('label');
                lbl.textContent = 'Conteúdo da seção';
                toggleDiv.appendChild(lbl);

                const btnWrap = document.createElement('div');
                btnWrap.style.cssText = 'display:flex;gap:6px;margin-top:8px;';
                btnWrap.appendChild(makeBtn('hero', 'fa-link', '🔗 Replicar Hero', replicateHero));
                btnWrap.appendChild(makeBtn('custom', 'fa-sliders-h', '✏️ Personalizado', !replicateHero));
                toggleDiv.appendChild(btnWrap);

                container.appendChild(toggleDiv);

                // Info text
                const info = document.createElement('div');
                info.style.cssText = 'font-size: 11px; opacity: 0.5; padding: 8px 0 4px; line-height: 1.4;';
                info.textContent = replicateHero
                    ? 'Título, subtítulo, botão e fundo replicam o Hero automaticamente. Ajuste apenas o padding no Fundo da Seção.'
                    : 'Personalize cada elemento da seção CTA individualmente.';
                container.appendChild(info);

                return container;
            }
        );
        fragment.appendChild(modeGroup);

        // ===== FUNDO DA SEÇÃO =====
        const bgGroup = C.createBgSection({
            basePath: this.basePath,
            defaults: {
                bgMode: replicateHero ? 'image' : 'image',
                bgColor: '#1a365d',
                bgColor2: '#0d1b2a',
                bgOverlay: true,
                paddingTop: 40,
                paddingBottom: 40
            }
        });
        fragment.appendChild(bgGroup);

        // ===== LINHA DECORATIVA =====
        fragment.appendChild(C.createTopLineSection({ basePath: this.basePath }));

        // Se replicar hero, só precisa de padding e bg (já no createBgSection)
        if (replicateHero) {
            // Texto e link do botão opcionais (override)
            const overrideGroup = C.createGroupExpander(
                { title: 'Ajustes Opcionais', icon: 'fa-pen', expanded: false },
                () => {
                    const container = document.createElement('div');

                    const tip = document.createElement('div');
                    tip.style.cssText = 'font-size: 11px; opacity: 0.5; line-height: 1.4; margin-bottom: 12px;';
                    tip.textContent = 'Deixe em branco para usar os mesmos valores do Hero.';
                    container.appendChild(tip);

                    container.appendChild(C.createTextInput({
                        label: 'Título (override)',
                        value: window.d2State.get(`${this.basePath}.title.text`, ''),
                        placeholder: 'Deixe vazio = título do Hero',
                        path: `${this.basePath}.title.text`
                    }));

                    container.appendChild(C.createTextInput({
                        label: 'Subtítulo (override)',
                        value: window.d2State.get(`${this.basePath}.subtitle.text`, ''),
                        placeholder: 'Deixe vazio = subtítulo do Hero',
                        path: `${this.basePath}.subtitle.text`
                    }));

                    container.appendChild(C.createTextInput({
                        label: 'Texto do botão (override)',
                        value: window.d2State.get(`${this.basePath}.btn.text`, ''),
                        placeholder: 'Deixe vazio = texto do Hero',
                        path: `${this.basePath}.btn.text`
                    }));

                    container.appendChild(C.createTextInput({
                        label: 'Link do botão (override)',
                        value: window.d2State.get(`${this.basePath}.btn.link`, ''),
                        placeholder: 'Deixe vazio = link do Hero',
                        path: `${this.basePath}.btn.link`
                    }));

                    return container;
                }
            );
            fragment.appendChild(overrideGroup);

        } else {
            // ===== MODO PERSONALIZADO: controles completos =====

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

                    container.appendChild(C.createSlider({
                        label: 'Espaço abaixo',
                        value: window.d2State.get(`${this.basePath}.title.marginBottom`, 8),
                        min: 0, max: 40, step: 1, unit: 'px',
                        path: `${this.basePath}.title.marginBottom`
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

                    container.appendChild(C.createSlider({
                        label: 'Espaço abaixo',
                        value: window.d2State.get(`${this.basePath}.subtitle.marginBottom`, 20),
                        min: 0, max: 60, step: 1, unit: 'px',
                        path: `${this.basePath}.subtitle.marginBottom`
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
                        value: window.d2State.get(`${this.basePath}.btn.text`, ''),
                        placeholder: 'Ex: FALE COMIGO',
                        path: `${this.basePath}.btn.text`
                    }));

                    container.appendChild(C.createTextInput({
                        label: 'Link do botão',
                        value: window.d2State.get(`${this.basePath}.btn.link`, ''),
                        placeholder: 'https://...',
                        path: `${this.basePath}.btn.link`
                    }));

                    // Tipografia
                    const textDiv = document.createElement('div');
                    textDiv.style.cssText = divStyle;
                    textDiv.textContent = 'Tipografia';
                    container.appendChild(textDiv);

                    container.appendChild(C.createSlider({
                        label: 'Tamanho da fonte',
                        value: window.d2State.get(`${this.basePath}.btn.textStyle.size`, 16),
                        min: 10, max: 28, step: 1, unit: 'px',
                        path: `${this.basePath}.btn.textStyle.size`
                    }));

                    container.appendChild(C.createWeightSelector({
                        label: 'Peso da fonte',
                        value: window.d2State.get(`${this.basePath}.btn.textStyle.weight`, 600),
                        path: `${this.basePath}.btn.textStyle.weight`
                    }));

                    container.appendChild(C.createColorPicker({
                        label: 'Cor do texto',
                        value: window.d2State.get(`${this.basePath}.btn.textStyle.color`, '#ffffff'),
                        path: `${this.basePath}.btn.textStyle.color`
                    }));

                    // Aparência
                    const bgDiv = document.createElement('div');
                    bgDiv.style.cssText = divStyle;
                    bgDiv.textContent = 'Aparência';
                    container.appendChild(bgDiv);

                    const currentBgType = window.d2State.get(`${this.basePath}.btn.bgType`, 'solid');

                    container.appendChild(C.createSelect({
                        label: 'Tipo de fundo',
                        value: currentBgType,
                        options: [
                            { value: 'solid', label: 'Cor chapada' },
                            { value: 'gradient', label: 'Degradê' }
                        ],
                        path: `${this.basePath}.btn.bgType`
                    }));

                    // Cor sólida (condicional)
                    const solidColorEl = C.createColorPicker({
                        label: 'Cor de fundo',
                        value: window.d2State.get(`${this.basePath}.btn.bgColor`, '#5167E7'),
                        path: `${this.basePath}.btn.bgColor`
                    });
                    solidColorEl.dataset.ctaBtnBgControl = 'solid';
                    if (currentBgType !== 'solid') solidColorEl.style.display = 'none';
                    container.appendChild(solidColorEl);

                    // Degradê presets (condicional)
                    const gradientWrapper = document.createElement('div');
                    gradientWrapper.dataset.ctaBtnBgControl = 'gradient';
                    if (currentBgType !== 'gradient') gradientWrapper.style.display = 'none';

                    const gradLabel = document.createElement('label');
                    gradLabel.className = 'control-label';
                    gradLabel.textContent = 'Degradê';
                    gradLabel.style.cssText = 'font-size: 12px; color: var(--d2-text-secondary); margin-bottom: 6px; display: block;';
                    gradientWrapper.appendChild(gradLabel);

                    gradientWrapper.appendChild(
                        C.createGradientPresets({
                            value: window.d2State.get(`${this.basePath}.btn.bgGradient`, 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'),
                            path: `${this.basePath}.btn.bgGradient`
                        })
                    );
                    container.appendChild(gradientWrapper);

                    // Toggle visibility on bgType change
                    window.d2State.subscribe(({ path }) => {
                        if (path === `${this.basePath}.btn.bgType`) {
                            const newType = window.d2State.get(`${this.basePath}.btn.bgType`, 'solid');
                            solidColorEl.style.display = newType === 'solid' ? '' : 'none';
                            gradientWrapper.style.display = newType === 'gradient' ? '' : 'none';
                        }
                    });

                    container.appendChild(C.createSlider({
                        label: 'Arredondamento',
                        value: window.d2State.get(`${this.basePath}.btn.borderRadius`, 30),
                        min: 0, max: 50, step: 2, unit: 'px',
                        path: `${this.basePath}.btn.borderRadius`
                    }));

                    // Tamanho
                    const padDiv = document.createElement('div');
                    padDiv.style.cssText = divStyle;
                    padDiv.textContent = 'Tamanho';
                    container.appendChild(padDiv);

                    container.appendChild(C.createSlider({
                        label: 'Padding vertical',
                        value: window.d2State.get(`${this.basePath}.btn.paddingInner.vertical`, 12),
                        min: 4, max: 24, step: 2, unit: 'px',
                        path: `${this.basePath}.btn.paddingInner.vertical`
                    }));

                    container.appendChild(C.createSlider({
                        label: 'Padding horizontal',
                        value: window.d2State.get(`${this.basePath}.btn.paddingInner.horizontal`, 40),
                        min: 16, max: 80, step: 4, unit: 'px',
                        path: `${this.basePath}.btn.paddingInner.horizontal`
                    }));

                    // Hover
                    container.appendChild(C.createToggle({
                        label: 'Animação ao passar o mouse',
                        value: window.d2State.get(`${this.basePath}.btn.hoverAnimation`, true),
                        path: `${this.basePath}.btn.hoverAnimation`
                    }));

                    return container;
                }
            );
            fragment.appendChild(btnGroup);
        }

        return fragment;
    }
}

// Exporta globalmente
window.D2CTAEditor = D2CTAEditor;

console.log('[D2 CTA Editor] Module loaded');
