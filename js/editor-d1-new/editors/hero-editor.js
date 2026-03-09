(function () {
    'use strict';

    /**
     * D1 Perfil Editor
     * Avatar, textos (nome/subtítulo + descrição com toggle), tipografia
     * Usa D1Controls (estilo D-2 com GroupExpanders)
     */
    class D1PerfilEditor {
        constructor() {
            this.basePath = 'd2Adjustments.hero';
        }

        render() {
            const frag = document.createDocumentFragment();
            const C = window.D1Controls;
            const s = window.d1State;
            if (!C || !s) return frag;

            // ===== AVATAR =====
            frag.appendChild(C.createGroupExpander({ title: 'Foto de Perfil', icon: 'fa-camera', expanded: true }, () => {
                const f = document.createDocumentFragment();
                f.appendChild(C.createImagePicker({ label: 'Foto de Perfil', value: s.get('profile.avatar'), path: 'profile.avatar', aspect: '3/1', compact: false }));
                f.appendChild(C.createSlider({ label: 'Tamanho do Avatar', value: s.get('profile.avatarSize', 120), min: 60, max: 200, step: 1, unit: 'px', path: 'profile.avatarSize' }));
                f.appendChild(C.createSlider({ label: 'Zoom da Foto', value: s.get('profile.avatarZoom', 100), min: 100, max: 300, step: 1, unit: '%', path: 'profile.avatarZoom' }));
                f.appendChild(C.createSlider({ label: 'Posição X', value: s.get('profile.avatarPosX', 50), min: 0, max: 100, step: 1, unit: '%', path: 'profile.avatarPosX' }));
                f.appendChild(C.createSlider({ label: 'Posição Y', value: s.get('profile.avatarPosY', 50), min: 0, max: 100, step: 1, unit: '%', path: 'profile.avatarPosY' }));
                f.appendChild(C.createSlider({ label: 'Borda', value: s.get('profile.avatarBorder', 3), min: 0, max: 10, step: 1, unit: 'px', path: 'profile.avatarBorder' }));
                f.appendChild(C.createColorPicker({ label: 'Cor da Borda', value: s.get('profile.avatarBorderColor', '#ffffff'), path: 'profile.avatarBorderColor' }));
                return f;
            }));

            // ===== TIPOGRAFIA =====
            frag.appendChild(C.createGroupExpander({ title: 'Tipografia', icon: 'fa-font', expanded: false }, () => {
                const f = document.createDocumentFragment();
                f.appendChild(C.createFontPicker({ label: 'Fonte Global', value: s.get('fontFamily', 'Montserrat'), path: 'fontFamily' }));
                return f;
            }));

            // ===== NOME =====
            frag.appendChild(C.createGroupExpander({ title: 'Nome', icon: 'fa-heading', expanded: true }, () => {
                const f = document.createDocumentFragment();
                f.appendChild(C.createTextInput({ label: 'Nome', value: s.get('profile.name', ''), placeholder: 'Nome do negócio', path: 'profile.name' }));
                f.appendChild(C.createSlider({ label: 'Tamanho', value: s.get('profile.nameStyle.size', 28), min: 14, max: 64, step: 1, unit: 'px', path: 'profile.nameStyle.size' }));
                f.appendChild(C.createColorPicker({ label: 'Cor', value: s.get('profile.nameStyle.color', '#ffffff'), path: 'profile.nameStyle.color' }));
                f.appendChild(C.createWeightSelector({ label: 'Peso', value: s.get('profile.nameStyle.weight', 700), path: 'profile.nameStyle.weight' }));
                return f;
            }));

            // ===== SUBTÍTULO + DESCRIÇÃO (com toggle) =====
            frag.appendChild(C.createGroupExpander({ title: 'Subtítulo', icon: 'fa-text-height', expanded: false }, () => {
                const f = document.createDocumentFragment();
                f.appendChild(C.createTextInput({ label: 'Subtítulo', value: s.get('profile.subtitle', ''), placeholder: 'Cargo ou slogan', path: 'profile.subtitle' }));
                f.appendChild(C.createSlider({ label: 'Tamanho', value: s.get('profile.subtitleStyle.size', 16), min: 10, max: 40, step: 1, unit: 'px', path: 'profile.subtitleStyle.size' }));
                f.appendChild(C.createColorPicker({ label: 'Cor', value: s.get('profile.subtitleStyle.color', 'rgba(255,255,255,0.85)'), path: 'profile.subtitleStyle.color' }));
                f.appendChild(C.createWeightSelector({ label: 'Peso', value: s.get('profile.subtitleStyle.weight', 400), path: 'profile.subtitleStyle.weight' }));

                // --- Divider ---
                const divider = document.createElement('hr');
                divider.style.cssText = 'border:none;border-top:1px solid var(--d2-border, #e0e0e0);margin:16px 0;';
                f.appendChild(divider);

                // --- Toggle Descrição ---
                const descToggle = C.createToggle({ label: 'Mostrar Descrição', value: s.get('profile.descriptionEnabled', true), path: 'profile.descriptionEnabled' });
                f.appendChild(descToggle);

                // --- Descrição fields (only when enabled) ---
                if (s.get('profile.descriptionEnabled', true)) {
                    f.appendChild(C.createTextArea({ label: 'Descrição', value: s.get('profile.description', ''), placeholder: 'Conte sobre seu negócio...', path: 'profile.description', rows: 2 }));
                    f.appendChild(C.createSlider({ label: 'Tamanho', value: s.get('profile.descriptionStyle.size', 14), min: 10, max: 30, step: 1, unit: 'px', path: 'profile.descriptionStyle.size' }));
                    f.appendChild(C.createColorPicker({ label: 'Cor', value: s.get('profile.descriptionStyle.color', 'rgba(255,255,255,0.7)'), path: 'profile.descriptionStyle.color' }));
                    f.appendChild(C.createWeightSelector({ label: 'Peso', value: s.get('profile.descriptionStyle.weight', 300), path: 'profile.descriptionStyle.weight' }));
                }

                // Re-render when toggle changes
                const _subKey = '__d1DescToggleSub';
                if (!window[_subKey]) {
                    window[_subKey] = true;
                    s.subscribe(({ path }) => {
                        if (path === 'profile.descriptionEnabled') {
                            document.dispatchEvent(new CustomEvent('d2:section-selected', { detail: { sectionId: 'hero' } }));
                        }
                    });
                }

                return f;
            }));

            return frag;
        }
    }

    window.D1HeroEditor = D1PerfilEditor;
    console.log('[D1 Perfil Editor] Module loaded');
})();