/* ============================================
   EDITOR D2 - PWA / FAVICON EDITOR
   Painel de configuração de ícone e PWA
   ============================================ */

/**
 * D2 PWA Editor Component
 * Controles de favicon, manifest e PWA
 */
class D2PWAEditor {
    constructor() {
        this.basePath = 'd2Adjustments.pwa';
    }

    /**
     * Renderiza os controles PWA/Favicon
     * @returns {DocumentFragment}
     */
    render() {
        const fragment = document.createDocumentFragment();
        const C = window.D2Controls;

        // ===== FAVICON =====
        const faviconGroup = C.createGroupExpander(
            { title: 'Ícone do Site (Favicon)', icon: 'fa-palette', expanded: true },
            () => {
                const container = document.createElement('div');

                // Mode: auto or upload
                const mode = window.d2State.get(`${this.basePath}.favicon.mode`, 'auto');

                container.appendChild(C.createSelect({
                    label: 'Modo',
                    value: mode,
                    options: [
                        { value: 'auto', label: 'Automático (iniciais)' },
                        { value: 'upload', label: 'Upload de imagem' }
                    ],
                    path: `${this.basePath}.favicon.mode`
                }));

                if (mode === 'upload') {
                    // Upload mode
                    container.appendChild(C.createImagePicker({
                        label: 'Imagem do favicon',
                        value: window.d2State.get(`${this.basePath}.favicon.image`, ''),
                        path: `${this.basePath}.favicon.image`,
                        aspect: '1/1',
                        compact: true
                    }));
                } else {
                    // Auto mode — color pickers and shape
                    container.appendChild(C.createColorPicker({
                        label: 'Cor de fundo',
                        value: window.d2State.get(`${this.basePath}.favicon.bgColor`, '#1a365d'),
                        path: `${this.basePath}.favicon.bgColor`
                    }));

                    container.appendChild(C.createColorPicker({
                        label: 'Cor do texto',
                        value: window.d2State.get(`${this.basePath}.favicon.textColor`, '#ffffff'),
                        path: `${this.basePath}.favicon.textColor`
                    }));

                    container.appendChild(C.createSelect({
                        label: 'Formato',
                        value: window.d2State.get(`${this.basePath}.favicon.shape`, 'circle'),
                        options: [
                            { value: 'circle', label: 'Círculo' },
                            { value: 'rounded-square', label: 'Quadrado arredondado' }
                        ],
                        path: `${this.basePath}.favicon.shape`
                    }));
                }

                // Mini preview (60x60)
                const previewWrapper = document.createElement('div');
                previewWrapper.style.cssText = 'display: flex; align-items: center; gap: 12px; margin-top: 16px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 10px;';

                const previewCanvas = document.createElement('canvas');
                previewCanvas.width = 60;
                previewCanvas.height = 60;
                previewCanvas.style.cssText = 'border-radius: 12px; flex-shrink: 0;';
                previewWrapper.appendChild(previewCanvas);

                const previewLabel = document.createElement('span');
                previewLabel.style.cssText = 'font-size: 12px; color: var(--text-secondary); opacity: 0.7;';
                previewLabel.textContent = 'Preview do ícone';
                previewWrapper.appendChild(previewLabel);

                container.appendChild(previewWrapper);

                // Render preview
                this._renderFaviconPreview(previewCanvas);

                return container;
            }
        );
        fragment.appendChild(faviconGroup);

        // ===== PWA CONFIG =====
        const pwaGroup = C.createGroupExpander(
            { title: 'Configuração PWA', icon: 'fa-mobile-alt', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createTextInput({
                    label: 'Nome do App',
                    value: window.d2State.get(`${this.basePath}.appName`, ''),
                    placeholder: 'Usa o título do site se vazio',
                    path: `${this.basePath}.appName`
                }));

                container.appendChild(C.createColorPicker({
                    label: 'Cor da barra do navegador',
                    value: window.d2State.get(`${this.basePath}.themeColor`, '#1a365d'),
                    path: `${this.basePath}.themeColor`
                }));

                // Info box
                const infoBox = document.createElement('div');
                infoBox.style.cssText = 'margin-top: 12px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; font-size: 12px; color: var(--text-secondary); line-height: 1.5;';
                infoBox.innerHTML = `
                    <i class="fas fa-info-circle" style="color: var(--accent); margin-right: 4px;"></i>
                    Quando o cliente adicionar o site à tela inicial do celular, ele abrirá como um app, sem a barra do navegador.
                `;
                container.appendChild(infoBox);

                return container;
            }
        );
        fragment.appendChild(pwaGroup);

        return fragment;
    }

    /**
     * Renderiza o preview do favicon no canvas 60x60
     */
    _renderFaviconPreview(canvas) {
        const mode = window.d2State.get(`${this.basePath}.favicon.mode`, 'auto');

        if (mode === 'upload') {
            const image = window.d2State.get(`${this.basePath}.favicon.image`, '');
            if (image) {
                const img = new Image();
                img.onload = () => {
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, 60, 60);
                    ctx.beginPath();
                    ctx.roundRect(0, 0, 60, 60, 12);
                    ctx.clip();
                    ctx.drawImage(img, 0, 0, 60, 60);
                };
                img.src = image;
            }
        } else {
            // Auto mode
            const heroTitle = window.d2State.get('d2Adjustments.hero.title.text', 'Demeni Sites');
            const bgColor = window.d2State.get(`${this.basePath}.favicon.bgColor`, '#1a365d');
            const textColor = window.d2State.get(`${this.basePath}.favicon.textColor`, '#ffffff');
            const shape = window.d2State.get(`${this.basePath}.favicon.shape`, 'circle');

            if (window.PWAUtils) {
                const dataUrl = window.PWAUtils.generateFavicon(heroTitle, bgColor, textColor, shape, 60);
                const img = new Image();
                img.onload = () => {
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, 60, 60);
                    ctx.drawImage(img, 0, 0);
                };
                img.src = dataUrl;
            }
        }
    }
}

// Export
window.D2PWAEditor = D2PWAEditor;

console.log('[D2 PWA Editor] Module loaded');
