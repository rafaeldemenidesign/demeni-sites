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
                container.appendChild(C.createSelect({
                    label: 'Modo',
                    value: window.d2State.get(`${this.basePath}.favicon.mode`, 'auto'),
                    options: [
                        { value: 'auto', label: 'Automático (iniciais)' },
                        { value: 'upload', label: 'Upload de imagem' }
                    ],
                    path: `${this.basePath}.favicon.mode`
                }));

                // Container dinâmico que muda conforme o modo
                const dynamicContainer = document.createElement('div');
                dynamicContainer.id = 'pwa-mode-controls';
                container.appendChild(dynamicContainer);

                // Renderiza controles do modo atual
                this._renderModeControls(dynamicContainer);

                // Quando o modo muda, re-renderiza os controles dinâmicos
                const unsubscribe = window.d2State.subscribe((change) => {
                    if (change.path === `${this.basePath}.favicon.mode`) {
                        this._renderModeControls(dynamicContainer);
                    }
                });

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
     * Renderiza controles dinâmicos baseado no modo (auto/upload)
     */
    _renderModeControls(container) {
        const C = window.D2Controls;
        const mode = window.d2State.get(`${this.basePath}.favicon.mode`, 'auto');

        // Limpa o container
        container.innerHTML = '';

        if (mode === 'upload') {
            // === UPLOAD MODE ===
            // Área de upload personalizada com preview
            const uploadWrapper = document.createElement('div');
            uploadWrapper.style.cssText = 'margin-top: 12px;';

            const currentImage = window.d2State.get(`${this.basePath}.favicon.image`, '');

            // Preview + botão de upload
            const previewArea = document.createElement('div');
            previewArea.style.cssText = 'display: flex; align-items: center; gap: 16px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 12px; cursor: pointer; border: 2px dashed var(--border); transition: border-color 0.2s;';

            const previewImg = document.createElement('div');
            previewImg.style.cssText = 'width: 64px; height: 64px; border-radius: 14px; overflow: hidden; flex-shrink: 0; background: var(--bg-sidebar); display: flex; align-items: center; justify-content: center;';

            if (currentImage) {
                previewImg.innerHTML = `<img src="${currentImage}" style="width:100%;height:100%;object-fit:cover;">`;
            } else {
                previewImg.innerHTML = `<i class="fas fa-image" style="font-size:24px;opacity:0.3;"></i>`;
            }

            const uploadText = document.createElement('div');
            uploadText.innerHTML = `
                <div style="font-size:13px;font-weight:500;color:var(--text-primary);">
                    ${currentImage ? 'Trocar imagem' : 'Clique para adicionar'}
                </div>
                <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">
                    PNG ou JPG, recomendado 512×512
                </div>
            `;

            previewArea.appendChild(previewImg);
            previewArea.appendChild(uploadText);

            // Input file oculto
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/png,image/jpeg,image/webp';
            fileInput.style.display = 'none';

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (ev) => {
                    const dataUrl = ev.target.result;
                    window.d2State.set(`${this.basePath}.favicon.image`, dataUrl);
                    // Re-render
                    this._renderModeControls(container);
                };
                reader.readAsDataURL(file);
            });

            previewArea.addEventListener('click', () => fileInput.click());

            previewArea.addEventListener('mouseenter', () => {
                previewArea.style.borderColor = 'var(--accent)';
            });
            previewArea.addEventListener('mouseleave', () => {
                previewArea.style.borderColor = 'var(--border)';
            });

            uploadWrapper.appendChild(previewArea);
            uploadWrapper.appendChild(fileInput);

            // Botão remover (se tem imagem)
            if (currentImage) {
                const removeBtn = document.createElement('button');
                removeBtn.style.cssText = 'margin-top: 8px; padding: 6px 12px; background: none; border: 1px solid var(--danger, #ef4444); color: var(--danger, #ef4444); border-radius: 8px; font-size: 12px; cursor: pointer; transition: background 0.2s;';
                removeBtn.innerHTML = '<i class="fas fa-trash" style="margin-right:4px;"></i> Remover imagem';
                removeBtn.addEventListener('click', () => {
                    window.d2State.set(`${this.basePath}.favicon.image`, null);
                    this._renderModeControls(container);
                });
                removeBtn.addEventListener('mouseenter', () => {
                    removeBtn.style.background = 'rgba(239, 68, 68, 0.1)';
                });
                removeBtn.addEventListener('mouseleave', () => {
                    removeBtn.style.background = 'none';
                });
                uploadWrapper.appendChild(removeBtn);
            }

            container.appendChild(uploadWrapper);

        } else {
            // === AUTO MODE ===
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

        // Mini preview (sempre visível)
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

        // Renderiza o mini preview
        this._renderFaviconPreview(previewCanvas);

        // Atualiza preview quando cores/shape mudam (auto mode)
        if (mode === 'auto') {
            const paths = [
                `${this.basePath}.favicon.bgColor`,
                `${this.basePath}.favicon.textColor`,
                `${this.basePath}.favicon.shape`
            ];
            window.d2State.subscribe((change) => {
                if (paths.includes(change.path)) {
                    this._renderFaviconPreview(previewCanvas);
                }
            });
        }
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
            } else {
                // Placeholder
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, 60, 60);
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.beginPath();
                ctx.roundRect(0, 0, 60, 60, 12);
                ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.font = '20px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('?', 30, 30);
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
