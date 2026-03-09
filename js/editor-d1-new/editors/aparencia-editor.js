(function () {
    'use strict';

    /**
     * D1 Aparência Editor
     * Imagem de fundo (3 modos), overlay, espaçamentos granulares, footer
     * Usa D1Controls (estilo D-2 com GroupExpanders)
     */
    class D1AparenciaEditor {
        constructor() {
            this.basePath = 'd2Adjustments.hero';
        }

        render() {
            const frag = document.createDocumentFragment();
            const C = window.D1Controls;
            const s = window.d1State;
            if (!C || !s) return frag;
            const bp = this.basePath;

            // ===== IMAGEM DE FUNDO (3 MODOS) =====
            frag.appendChild(C.createGroupExpander({ title: 'Imagem de Fundo', icon: 'fa-image', expanded: true }, () => {
                const f = document.createDocumentFragment();

                // Image upload
                f.appendChild(C.createImagePicker({ label: 'Imagem', value: s.get(`${bp}.bgImage`), path: `${bp}.bgImage`, aspect: '3/1' }));

                // Cor de fundo (sempre visível — complementa a imagem)
                f.appendChild(C.createColorPicker({ label: 'Cor de Fundo', value: s.get(`${bp}.bgColor`, '#1a1a2e'), path: `${bp}.bgColor` }));

                // Modo de exibição da imagem
                const bgMode = s.get(`${bp}.bgFitMode`, 'fill');
                f.appendChild(C.createSelect({
                    label: 'Modo da Imagem',
                    options: [
                        { value: 'fill', label: 'Preencher (cover)' },
                        { value: 'stretch', label: 'Esticar (stretch)' },
                        { value: 'custom', label: 'Personalizar + Cor' }
                    ],
                    value: bgMode,
                    path: `${bp}.bgFitMode`
                }));

                // --- Controls per mode ---
                if (bgMode === 'fill') {
                    f.appendChild(C.createSlider({ label: 'Posição Lateral', value: s.get(`${bp}.bgImagePosX`, 50), min: 0, max: 100, step: 1, unit: '%', path: `${bp}.bgImagePosX` }));
                    f.appendChild(C.createSlider({ label: 'Posição Vertical', value: s.get(`${bp}.bgImagePosY`, 50), min: 0, max: 100, step: 1, unit: '%', path: `${bp}.bgImagePosY` }));
                } else if (bgMode === 'stretch') {
                    const msg = document.createElement('p');
                    msg.textContent = 'A imagem será esticada para preencher toda a tela.';
                    msg.style.cssText = 'font-size:12px;color:var(--d2-text-muted, #888);margin:8px 0;font-style:italic;';
                    f.appendChild(msg);
                } else if (bgMode === 'custom') {
                    f.appendChild(C.createSlider({ label: 'Zoom', value: s.get(`${bp}.bgImageZoom`, 100), min: 30, max: 200, step: 1, unit: '%', path: `${bp}.bgImageZoom` }));
                    f.appendChild(C.createSlider({ label: 'Posição X', value: s.get(`${bp}.bgImagePosX`, 50), min: 0, max: 100, step: 1, unit: '%', path: `${bp}.bgImagePosX` }));
                    f.appendChild(C.createSlider({ label: 'Posição Y', value: s.get(`${bp}.bgImagePosY`, 50), min: 0, max: 100, step: 1, unit: '%', path: `${bp}.bgImagePosY` }));
                }

                // --- DEGRADÊ (available in ALL modes) ---
                const fadeDivider = document.createElement('div');
                fadeDivider.style.cssText = 'font-size:11px;text-transform:uppercase;letter-spacing:1px;opacity:0.5;margin:16px 0 8px;padding-top:12px;border-top:1px solid var(--d2-border,#e0e0e0);';
                fadeDivider.textContent = 'Degradê';
                f.appendChild(fadeDivider);

                f.appendChild(C.createToggle({ label: 'Ativar Degradê', value: s.get(`${bp}.bgFadeEnabled`, false), path: `${bp}.bgFadeEnabled` }));

                if (s.get(`${bp}.bgFadeEnabled`, false)) {
                    f.appendChild(C.createSelect({
                        label: 'Direção',
                        options: [
                            { value: 'bottom', label: 'Inferior → Cima' },
                            { value: 'top', label: 'Superior → Baixo' },
                            { value: 'both', label: 'Superior + Inferior' },
                            { value: 'all', label: 'Todas as Bordas' }
                        ],
                        value: s.get(`${bp}.bgFadeSide`, 'bottom'),
                        path: `${bp}.bgFadeSide`
                    }));
                    f.appendChild(C.createSlider({ label: 'Posição do Degradê', value: s.get(`${bp}.bgFadePosition`, 60), min: 10, max: 100, step: 1, unit: '%', path: `${bp}.bgFadePosition` }));
                    f.appendChild(C.createSlider({ label: 'Intensidade', value: s.get(`${bp}.bgFadeIntensity`, 50), min: 10, max: 100, step: 5, unit: '%', path: `${bp}.bgFadeIntensity` }));
                    f.appendChild(C.createSlider({ label: 'Suavidade', value: s.get(`${bp}.bgFadeSmoothness`, 50), min: 5, max: 100, step: 5, unit: '%', path: `${bp}.bgFadeSmoothness` }));
                }

                // Desfoque (always available)
                f.appendChild(C.createSlider({ label: 'Desfoque', value: s.get(`${bp}.bgBlur`, 0), min: 0, max: 20, step: 1, unit: 'px', path: `${bp}.bgBlur` }));

                // Re-render when mode or fade toggle changes
                const _subKey = '__d1BgModeSub';
                if (!window[_subKey]) {
                    window[_subKey] = true;
                    s.subscribe(({ path }) => {
                        if (path === `${bp}.bgFitMode` || path === `${bp}.bgFadeEnabled` || path === `${bp}.overlay.enabled`) {
                            document.dispatchEvent(new CustomEvent('d2:section-selected', { detail: { sectionId: 'aparencia' } }));
                        }
                    });
                }

                return f;
            }));

            // ===== SOBREPOSIÇÃO =====
            frag.appendChild(C.createGroupExpander({ title: 'Sobreposição (Overlay)', icon: 'fa-adjust', expanded: false }, () => {
                const f = document.createDocumentFragment();
                f.appendChild(C.createToggle({ label: 'Ativar Sobreposição', value: s.get(`${bp}.overlay.enabled`, false), path: `${bp}.overlay.enabled` }));
                if (s.get(`${bp}.overlay.enabled`, false)) {
                    f.appendChild(C.createColorPicker({ label: 'Cor', value: s.get(`${bp}.overlay.color`, '#000000'), path: `${bp}.overlay.color` }));
                    f.appendChild(C.createSlider({ label: 'Opacidade', value: s.get(`${bp}.overlay.opacity`, 70), min: 0, max: 100, step: 1, unit: '%', path: `${bp}.overlay.opacity` }));
                }
                return f;
            }));

            // ===== ESPAÇAMENTO GRANULAR =====
            frag.appendChild(C.createGroupExpander({ title: 'Espaçamento', icon: 'fa-arrows-alt-v', expanded: false }, () => {
                const f = document.createDocumentFragment();
                f.appendChild(C.createSlider({ label: 'Margem Superior', value: s.get('spacing.topPadding', 40), min: 0, max: 100, step: 2, unit: 'px', path: 'spacing.topPadding' }));
                f.appendChild(C.createSlider({ label: 'Depois do Avatar', value: s.get('spacing.afterAvatar', 16), min: 0, max: 60, step: 2, unit: 'px', path: 'spacing.afterAvatar' }));
                f.appendChild(C.createSlider({ label: 'Depois do Nome', value: s.get('spacing.afterName', 6), min: 0, max: 40, step: 2, unit: 'px', path: 'spacing.afterName' }));
                f.appendChild(C.createSlider({ label: 'Depois do Subtítulo', value: s.get('spacing.afterSubtitle', 10), min: 0, max: 40, step: 2, unit: 'px', path: 'spacing.afterSubtitle' }));
                f.appendChild(C.createSlider({ label: 'Depois da Descrição', value: s.get('spacing.afterDescription', 20), min: 0, max: 60, step: 2, unit: 'px', path: 'spacing.afterDescription' }));
                f.appendChild(C.createSlider({ label: 'Gap entre Blocos', value: s.get('spacing.sectionGap', 20), min: 0, max: 60, step: 2, unit: 'px', path: 'spacing.sectionGap' }));
                f.appendChild(C.createSlider({ label: 'Padding Lateral', value: s.get('spacing.contentPadding', 16), min: 8, max: 40, step: 2, unit: 'px', path: 'spacing.contentPadding' }));
                f.appendChild(C.createSlider({ label: 'Margem Inferior', value: s.get('spacing.bottomPadding', 24), min: 0, max: 80, step: 2, unit: 'px', path: 'spacing.bottomPadding' }));
                return f;
            }));

            // ===== RODAPÉ =====
            frag.appendChild(C.createGroupExpander({ title: 'Rodapé', icon: 'fa-copyright', expanded: false }, () => {
                const f = document.createDocumentFragment();
                f.appendChild(C.createTextInput({ label: 'Seu Nome', value: s.get('footer.name', ''), placeholder: 'Nome para o copyright', path: 'footer.name' }));
                f.appendChild(C.createSlider({ label: 'Tamanho do Texto', value: s.get('footer.nameSize', 9), min: 7, max: 16, step: 1, unit: 'px', path: 'footer.nameSize' }));
                f.appendChild(C.createColorPicker({ label: 'Cor do Texto', value: s.get('footer.nameColor', 'rgba(255,255,255,0.35)'), path: 'footer.nameColor' }));
                f.appendChild(C.createToggle({ label: 'Mostrar "feito por Demeni Sites"', value: s.get('footer.showBranding', true), path: 'footer.showBranding' }));
                return f;
            }));

            return frag;
        }
    }

    window.D1AparenciaEditor = D1AparenciaEditor;
    console.log('[D1 Aparência Editor] Module loaded');
})();
