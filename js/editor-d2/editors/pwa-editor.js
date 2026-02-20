/* ============================================
   EDITOR D2 - PWA / FAVICON / SEO EDITOR
   Painel de configuração de ícone, PWA e SEO
   ============================================ */

/**
 * D2 PWA Editor Component
 * Controles de favicon, manifest, PWA e SEO/OG
 */
class D2PWAEditor {
    constructor() {
        this.basePath = 'd2Adjustments.pwa';
    }

    /**
     * Renderiza os controles PWA/Favicon/SEO
     * @returns {DocumentFragment}
     */
    render() {
        const fragment = document.createDocumentFragment();
        const C = window.D2Controls;

        // ===== SEO & COMPARTILHAMENTO =====
        const seoGroup = C.createGroupExpander(
            { title: 'SEO & Compartilhamento', icon: 'fa-share-alt', expanded: false },
            () => {
                const container = document.createElement('div');

                // Info box
                const infoBox = document.createElement('div');
                infoBox.style.cssText = 'margin-bottom: 12px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; font-size: 12px; color: var(--text-secondary); line-height: 1.5;';
                infoBox.innerHTML = `
                    <i class="fas fa-info-circle" style="color: var(--accent); margin-right: 4px;"></i>
                    Controla como seu site aparece quando compartilhado no WhatsApp, Instagram, Facebook e buscadores.
                `;
                container.appendChild(infoBox);

                container.appendChild(C.createTextInput({
                    label: 'Título do site (SEO)',
                    value: window.d2State.get(`${this.basePath}.seo.title`, ''),
                    placeholder: 'Usa o nome do projeto se vazio',
                    path: `${this.basePath}.seo.title`
                }));

                container.appendChild(C.createTextArea({
                    label: 'Descrição',
                    value: window.d2State.get(`${this.basePath}.seo.description`, ''),
                    placeholder: 'Descreva seu site em 1-2 frases',
                    path: `${this.basePath}.seo.description`,
                    rows: 3
                }));

                // OG Image section
                const ogImageLabel = document.createElement('label');
                ogImageLabel.style.cssText = 'display: block; margin-top: 12px; margin-bottom: 6px; font-size: 12px; color: var(--text-secondary);';
                ogImageLabel.textContent = 'Imagem de compartilhamento';
                container.appendChild(ogImageLabel);

                const ogImageHelp = document.createElement('div');
                ogImageHelp.style.cssText = 'font-size: 11px; color: var(--text-secondary); opacity: 0.6; margin-bottom: 8px;';
                ogImageHelp.textContent = 'Imagem que aparece no preview do link. Se vazio, usa a imagem de fundo da hero.';
                container.appendChild(ogImageHelp);

                // OG Image picker with hero bg fallback preview
                const ogImage = window.d2State.get(`${this.basePath}.seo.ogImage`, '');
                const heroBg = window.d2State.get('d2Adjustments.hero.bgImage', '');
                const displayImage = ogImage || heroBg;

                const ogPreview = document.createElement('div');
                ogPreview.style.cssText = 'display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 10px; cursor: pointer; border: 2px dashed var(--border); transition: border-color 0.2s;';

                const ogThumb = document.createElement('div');
                ogThumb.style.cssText = 'width: 80px; height: 42px; border-radius: 6px; overflow: hidden; flex-shrink: 0; background: var(--bg-sidebar); display: flex; align-items: center; justify-content: center;';

                if (displayImage && displayImage !== 'img/hero-bg.webp') {
                    ogThumb.innerHTML = `<img src="${displayImage}" style="width:100%;height:100%;object-fit:cover;">`;
                } else {
                    ogThumb.innerHTML = `<i class="fas fa-image" style="font-size:18px;opacity:0.3;"></i>`;
                }

                const ogText = document.createElement('div');
                ogText.innerHTML = `
                    <div style="font-size:12px;font-weight:500;color:var(--text-primary);">
                        ${ogImage ? 'Trocar imagem' : (heroBg && heroBg !== 'img/hero-bg.webp' ? 'Usando hero (automático)' : 'Clique para adicionar')}
                    </div>
                    <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">
                        Recomendado 1200×630px
                    </div>
                `;

                ogPreview.appendChild(ogThumb);
                ogPreview.appendChild(ogText);

                // File input for OG image
                const ogFileInput = document.createElement('input');
                ogFileInput.type = 'file';
                ogFileInput.accept = 'image/*';
                ogFileInput.style.display = 'none';

                ogFileInput.addEventListener('change', async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    try {
                        const dataUrl = await this._convertAndResize(file, 1200, 0.85);
                        window.d2State.set(`${this.basePath}.seo.ogImage`, dataUrl);
                        document.dispatchEvent(new CustomEvent('d2:section-selected', {
                            detail: { sectionId: 'pwa' }
                        }));
                    } catch (err) {
                        console.error('Erro ao processar imagem OG:', err);
                    }
                });

                ogPreview.addEventListener('click', () => ogFileInput.click());
                ogPreview.addEventListener('mouseenter', () => { ogPreview.style.borderColor = 'var(--accent)'; });
                ogPreview.addEventListener('mouseleave', () => { ogPreview.style.borderColor = 'var(--border)'; });

                container.appendChild(ogPreview);
                container.appendChild(ogFileInput);

                // Remove OG image button (if custom set)
                if (ogImage) {
                    const removeOgBtn = document.createElement('button');
                    removeOgBtn.style.cssText = 'margin-top: 6px; padding: 4px 10px; background: none; border: 1px solid var(--danger, #ef4444); color: var(--danger, #ef4444); border-radius: 6px; font-size: 11px; cursor: pointer;';
                    removeOgBtn.innerHTML = '<i class="fas fa-times" style="margin-right:4px;"></i>Usar hero automático';
                    removeOgBtn.addEventListener('click', () => {
                        window.d2State.set(`${this.basePath}.seo.ogImage`, null);
                        document.dispatchEvent(new CustomEvent('d2:section-selected', {
                            detail: { sectionId: 'pwa' }
                        }));
                    });
                    container.appendChild(removeOgBtn);
                }

                return container;
            }
        );
        fragment.appendChild(seoGroup);

        // ===== FAVICON =====
        const faviconGroup = C.createGroupExpander(
            { title: 'Ícone do Site (Favicon)', icon: 'fa-palette', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createSelect({
                    label: 'Modo',
                    value: window.d2State.get(`${this.basePath}.favicon.mode`, 'auto'),
                    options: [
                        { value: 'auto', label: 'Automático (iniciais)' },
                        { value: 'upload', label: 'Upload de imagem' }
                    ],
                    path: `${this.basePath}.favicon.mode`
                }));

                const dynamicContainer = document.createElement('div');
                dynamicContainer.id = 'pwa-mode-controls';
                container.appendChild(dynamicContainer);

                this._renderModeControls(dynamicContainer);

                window.d2State.subscribe((change) => {
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

        container.innerHTML = '';

        if (mode === 'upload') {
            const uploadWrapper = document.createElement('div');
            uploadWrapper.style.cssText = 'margin-top: 12px;';

            const currentImage = window.d2State.get(`${this.basePath}.favicon.image`, '');

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

            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/png,image/jpeg,image/webp';
            fileInput.style.display = 'none';

            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                try {
                    // Converte para WebP e redimensiona para 512x512
                    const dataUrl = await this._convertAndResize(file, 512, 0.90);
                    console.log(`[PWA Editor] Favicon converted: ${(dataUrl.length / 1024).toFixed(0)}KB`);
                    window.d2State.set(`${this.basePath}.favicon.image`, dataUrl);
                    this._renderModeControls(container);
                } catch (err) {
                    console.error('Erro ao processar favicon:', err);
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        window.d2State.set(`${this.basePath}.favicon.image`, ev.target.result);
                        this._renderModeControls(container);
                    };
                    reader.readAsDataURL(file);
                }
            });

            previewArea.addEventListener('click', () => fileInput.click());
            previewArea.addEventListener('mouseenter', () => { previewArea.style.borderColor = 'var(--accent)'; });
            previewArea.addEventListener('mouseleave', () => { previewArea.style.borderColor = 'var(--border)'; });

            uploadWrapper.appendChild(previewArea);
            uploadWrapper.appendChild(fileInput);

            if (currentImage) {
                const removeBtn = document.createElement('button');
                removeBtn.style.cssText = 'margin-top: 8px; padding: 6px 12px; background: none; border: 1px solid var(--danger, #ef4444); color: var(--danger, #ef4444); border-radius: 8px; font-size: 12px; cursor: pointer; transition: background 0.2s;';
                removeBtn.innerHTML = '<i class="fas fa-trash" style="margin-right:4px;"></i> Remover imagem';
                removeBtn.addEventListener('click', () => {
                    window.d2State.set(`${this.basePath}.favicon.image`, null);
                    this._renderModeControls(container);
                });
                removeBtn.addEventListener('mouseenter', () => { removeBtn.style.background = 'rgba(239, 68, 68, 0.1)'; });
                removeBtn.addEventListener('mouseleave', () => { removeBtn.style.background = 'none'; });
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

        this._renderFaviconPreview(previewCanvas);

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
     * Converte e redimensiona imagem para WebP
     */
    _convertAndResize(file, maxSize = 512, quality = 0.85) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let w = img.width;
                    let h = img.height;

                    if (w > maxSize || h > maxSize) {
                        if (w > h) {
                            h = Math.round((h / w) * maxSize);
                            w = maxSize;
                        } else {
                            w = Math.round((w / h) * maxSize);
                            h = maxSize;
                        }
                    }

                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);

                    try {
                        const webpUrl = canvas.toDataURL('image/webp', quality);
                        if (webpUrl.startsWith('data:image/webp')) {
                            resolve(webpUrl);
                        } else {
                            resolve(canvas.toDataURL('image/png'));
                        }
                    } catch {
                        resolve(canvas.toDataURL('image/png'));
                    }
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
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
