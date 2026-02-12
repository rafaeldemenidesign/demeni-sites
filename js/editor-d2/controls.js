/* ============================================
   EDITOR D2 - CONTROLES PRIMITIVOS
   Componentes de UI reutilizáveis para o editor
   ============================================ */

/**
 * Namespace para os controles D2
 */
window.D2Controls = {
    /**
     * Cria um GroupExpander (seção colapsável)
     * @param {Object} options - { title, icon, expanded, nested }
     * @param {Function} contentBuilder - Função que retorna o conteúdo HTML
     */
    createGroupExpander(options, contentBuilder) {
        const { title, icon = '', expanded = false, nested = false } = options;

        const group = document.createElement('div');
        group.className = `control-group ${expanded ? 'expanded' : ''} ${nested ? 'nested' : ''}`;

        const header = document.createElement('div');
        header.className = 'control-group-header';
        header.innerHTML = `
            <h4>${icon ? `<i class="fas ${icon}"></i>` : ''} ${title}</h4>
            <i class="fas fa-chevron-down toggle-icon"></i>
        `;

        const body = document.createElement('div');
        body.className = 'control-group-body';

        // Adiciona conteúdo ao body
        if (typeof contentBuilder === 'function') {
            const content = contentBuilder();
            if (typeof content === 'string') {
                body.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                body.appendChild(content);
            }
        }

        // Toggle ao clicar no header
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            group.classList.toggle('expanded');
        });

        group.appendChild(header);
        group.appendChild(body);

        return group;
    },

    /**
     * Cria um TextInput
     * @param {Object} options - { label, value, placeholder, path, maxLength }
     */
    createTextInput(options) {
        const { label, value = '', placeholder = '', path, maxLength } = options;

        const container = document.createElement('div');
        container.className = 'control-item';

        container.innerHTML = `
            <label>${label}</label>
            <input 
                type="text" 
                class="control-input" 
                value="${this.escapeHtml(value)}" 
                placeholder="${placeholder}"
                ${maxLength ? `maxlength="${maxLength}"` : ''}
                data-path="${path}"
            >
        `;

        const input = container.querySelector('input');
        input.addEventListener('input', (e) => {
            if (path && window.d2State) {
                window.d2State.set(path, e.target.value);
            }
        });

        return container;
    },

    /**
     * Cria um TextArea (multi-line input)
     * @param {Object} options - { label, value, placeholder, path, rows }
     */
    createTextArea(options) {
        const { label, value = '', placeholder = '', path, rows = 3 } = options;

        const container = document.createElement('div');
        container.className = 'control-item';

        container.innerHTML = `
            <label>${label}</label>
            <textarea 
                class="control-textarea" 
                placeholder="${placeholder}"
                rows="${rows}"
                data-path="${path}"
            >${this.escapeHtml(value)}</textarea>
        `;

        const textarea = container.querySelector('textarea');
        textarea.addEventListener('input', (e) => {
            if (path && window.d2State) {
                window.d2State.set(path, e.target.value);
            }
        });

        return container;
    },

    /**
     * Cria um Slider Control
     * @param {Object} options - { label, value, min, max, step, unit, path }
     */
    createSlider(options) {
        const { label, value = 0, min = 0, max = 100, step = 1, unit = 'px', path } = options;

        const container = document.createElement('div');
        container.className = 'control-item';

        container.innerHTML = `
            <label>${label}</label>
            <div class="slider-control">
                <input 
                    type="range" 
                    class="slider-input" 
                    value="${value}" 
                    min="${min}" 
                    max="${max}" 
                    step="${step}"
                    data-path="${path}"
                >
                <span class="slider-value">${value}${unit}</span>
            </div>
        `;

        const input = container.querySelector('.slider-input');
        const valueDisplay = container.querySelector('.slider-value');

        // Atualiza o gradiente do slider
        const updateSliderGradient = () => {
            const percent = ((input.value - min) / (max - min)) * 100;
            input.style.background = `linear-gradient(to right, var(--d2-gold) ${percent}%, var(--d2-bg-control) ${percent}%)`;
        };

        updateSliderGradient();

        input.addEventListener('input', (e) => {
            valueDisplay.textContent = `${e.target.value}${unit}`;
            updateSliderGradient();

            if (path && window.d2State) {
                window.d2State.set(path, parseFloat(e.target.value));
            }
        });

        return container;
    },

    /**
     * Cria um Color Picker
     * @param {Object} options - { label, value, path, showAlpha }
     */
    createColorPicker(options) {
        const { label, value = '#ffffff', path, showAlpha = false } = options;

        const container = document.createElement('div');
        container.className = 'control-item';

        container.innerHTML = `
            <label>${label}</label>
            <div class="color-control">
                <div class="color-swatch" style="background: ${value}">
                    <input type="color" value="${value}" data-path="${path}">
                </div>
                <input type="text" class="color-hex-input" value="${value}" maxlength="7" data-path="${path}">
            </div>
        `;

        const colorInput = container.querySelector('input[type="color"]');
        const hexInput = container.querySelector('.color-hex-input');
        const swatch = container.querySelector('.color-swatch');

        colorInput.addEventListener('input', (e) => {
            const color = e.target.value;
            hexInput.value = color;
            swatch.style.background = color;

            if (path && window.d2State) {
                window.d2State.set(path, color);
            }
        });

        hexInput.addEventListener('input', (e) => {
            let color = e.target.value;
            if (!color.startsWith('#')) {
                color = '#' + color;
            }

            if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
                colorInput.value = color;
                swatch.style.background = color;

                if (path && window.d2State) {
                    window.d2State.set(path, color);
                }
            }
        });
        return container;
    },

    /**
     * Cria um Select Control
     * @param {Object} options - { label, value, options, path }
     */
    createSelect(options) {
        const { label, value = '', options: selectOptions = [], path } = options;

        const container = document.createElement('div');
        container.className = 'control-item';

        let optionsHtml = selectOptions.map(opt => {
            const optValue = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            // Use == for loose comparison to handle string/number mismatch
            return `<option value="${optValue}" ${String(optValue) === String(value) ? 'selected' : ''}>${optLabel}</option>`;
        }).join('');

        container.innerHTML = `
            <label>${label}</label>
            <select class="control-select" data-path="${path}">
                ${optionsHtml}
            </select>
        `;

        const select = container.querySelector('select');
        select.addEventListener('change', (e) => {
            if (path && window.d2State) {
                // Store as number if numeric
                const val = e.target.value;
                window.d2State.set(path, isNaN(val) ? val : Number(val));
            }
        });

        return container;
    },

    /**
     * Lista oficial de fontes da plataforma.
     * Cada estilo é uma categoria tipográfica distinta mapeada para uma Google Font.
     */
    FONT_REGISTRY: [
        { value: 'Montserrat',       label: 'Moderna',     url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap' },
        { value: 'Playfair Display', label: 'Elegante',    url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap' },
        { value: 'Nunito',           label: 'Divertida',   url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap' },
        { value: 'Oswald',           label: 'Impactante',  url: 'https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&display=swap' },
        { value: 'Quicksand',       label: 'Suave',       url: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap' },
        { value: 'Lora',            label: 'Clássica',    url: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap' }
    ],

    /**
     * Carrega uma Google Font dinamicamente injetando <link> no <head>
     * @param {string} fontName - Nome da fonte (ex: 'Playfair Display')
     */
    loadGoogleFont(fontName) {
        const font = this.FONT_REGISTRY.find(f => f.value === fontName);
        if (!font) return;

        const linkId = `gfont-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
        if (document.getElementById(linkId)) return; // já carregada

        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = font.url;
        document.head.appendChild(link);

        console.log(`[D2Controls] Google Font carregada: ${fontName}`);
    },

    /**
     * Retorna a URL do Google Fonts para uma fonte específica
     * @param {string} fontName - Nome da fonte
     * @returns {string|null} URL da fonte ou null
     */
    getGoogleFontUrl(fontName) {
        const font = this.FONT_REGISTRY.find(f => f.value === fontName);
        return font ? font.url : null;
    },

    /**
     * Cria um Font Picker com 6 estilos distintos
     * Ao selecionar, carrega a Google Font automaticamente
     * @param {Object} options - { label, value, path }
     */
    createFontPicker(options) {
        const fonts = this.FONT_REGISTRY.map(f => ({
            value: f.value,
            label: `${f.label} (${f.value})`
        }));

        // Carrega a fonte atual
        if (options.value) {
            this.loadGoogleFont(options.value);
        }

        const container = this.createSelect({ ...options, options: fonts });

        // Ao trocar a fonte, carrega ela
        const select = container.querySelector('select');
        select.addEventListener('change', (e) => {
            this.loadGoogleFont(e.target.value);
        });

        return container;
    },

    /**
     * Cria um Image Picker com conversão WebP
     * @param {Object} options - { label, value, path, aspect, compact }
     */
    createImagePicker(options) {
        const { label, value = null, path, aspect = '16/9', compact = false } = options;

        const container = document.createElement('div');
        container.className = 'control-item';

        const aspectStyle = compact ? 'aspect-ratio: 1/1; max-height: 100px;' : `aspect-ratio: ${aspect};`;

        container.innerHTML = `
            <label>${label}</label>
            <div class="image-picker ${compact ? 'compact' : ''}">
                <div class="image-preview-box ${value ? 'has-image' : ''}" style="${aspectStyle}">
                    ${value ? `
                        <img src="${value}" alt="Preview">
                        <button class="image-remove-btn" title="Remover imagem">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : `
                        <i class="fas fa-cloud-upload-alt"></i>
                        <span>Clique para enviar</span>
                    `}
                </div>
                <input type="file" accept="image/*" data-path="${path}">
            </div>
        `;

        const previewBox = container.querySelector('.image-preview-box');
        const fileInput = container.querySelector('input[type="file"]');

        // Clique para abrir seletor de arquivo
        previewBox.addEventListener('click', (e) => {
            if (e.target.closest('.image-remove-btn')) return;
            fileInput.click();
        });

        // Botão remover imagem
        const removeBtn = container.querySelector('.image-remove-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                previewBox.innerHTML = `
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Clique para enviar</span>
                `;
                previewBox.classList.remove('has-image');
                if (path && window.d2State) {
                    window.d2State.set(path, null);
                }
            });
        }

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                // Converter para WebP
                const webpDataUrl = await this.convertToWebP(file, 0.85);

                previewBox.innerHTML = `
                    <img src="${webpDataUrl}" alt="Preview">
                    <button class="image-remove-btn" title="Remover imagem">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                previewBox.classList.add('has-image');

                // Re-attach remove button listener
                const newRemoveBtn = previewBox.querySelector('.image-remove-btn');
                newRemoveBtn.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    previewBox.innerHTML = `
                        <i class="fas fa-cloud-upload-alt"></i>
                        <span>Clique para enviar</span>
                    `;
                    previewBox.classList.remove('has-image');
                    if (path && window.d2State) {
                        window.d2State.set(path, null);
                    }
                });

                if (path && window.d2State) {
                    window.d2State.set(path, webpDataUrl);
                }

                console.log('[D2 Controls] Image converted to WebP and saved');
            } catch (error) {
                console.error('[D2 Controls] Error converting image:', error);
                // Fallback: usar imagem original
                const reader = new FileReader();
                reader.onload = (event) => {
                    const imageUrl = event.target.result;
                    previewBox.innerHTML = `<img src="${imageUrl}" alt="Preview">`;
                    previewBox.classList.add('has-image');
                    if (path && window.d2State) {
                        window.d2State.set(path, imageUrl);
                    }
                };
                reader.readAsDataURL(file);
            }
        });

        return container;
    },

    /**
     * Converte imagem para WebP usando Canvas
     * @param {File} file - Arquivo de imagem
     * @param {number} quality - Qualidade (0 a 1)
     * @returns {Promise<string>} Data URL em formato WebP
     */
    async convertToWebP(file, quality = 0.85) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                // Manter dimensões originais (ou limitar a 2000px)
                const maxSize = 2000;
                let width = img.width;
                let height = img.height;

                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height = (height / width) * maxSize;
                        width = maxSize;
                    } else {
                        width = (width / height) * maxSize;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Converter para WebP
                const webpDataUrl = canvas.toDataURL('image/webp', quality);
                resolve(webpDataUrl);
            };

            img.onerror = () => reject(new Error('Failed to load image'));

            // Carregar imagem do arquivo
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    },

    /**
     * Cria um Padding Control (4 inputs: top, right, bottom, left)
     * @param {Object} options - { label, value, path }
     */
    createPaddingControl(options) {
        const { label, value = { top: 0, right: 0, bottom: 0, left: 0 }, path } = options;

        const container = document.createElement('div');
        container.className = 'control-item';

        container.innerHTML = `
            <label>${label}</label>
            <div class="padding-control">
                <div class="padding-input-group">
                    <label>Cima</label>
                    <input type="number" value="${value.top}" data-side="top" min="0">
                </div>
                <div class="padding-input-group">
                    <label>Direita</label>
                    <input type="number" value="${value.right}" data-side="right" min="0">
                </div>
                <div class="padding-input-group">
                    <label>Baixo</label>
                    <input type="number" value="${value.bottom}" data-side="bottom" min="0">
                </div>
                <div class="padding-input-group">
                    <label>Esq.</label>
                    <input type="number" value="${value.left}" data-side="left" min="0">
                </div>
            </div>
        `;

        const inputs = container.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const side = e.target.dataset.side;
                const newValue = parseInt(e.target.value) || 0;

                if (path && window.d2State) {
                    window.d2State.set(`${path}.${side}`, newValue);
                }
            });
        });

        return container;
    },

    /**
     * Cria um Weight Selector (300-900)
     * @param {Object} options - { label, value, path }
     */
    createWeightSelector(options) {
        const weights = [
            { value: 300, label: 'Light' },
            { value: 400, label: 'Normal' },
            { value: 500, label: 'Medium' },
            { value: 600, label: 'Semibold' },
            { value: 700, label: 'Bold' },
            { value: 800, label: 'Extra Bold' },
            { value: 900, label: 'Black' }
        ];

        return this.createSelect({ ...options, options: weights });
    },

    /**
     * Utilitário: escapa HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Cria uma seção de divider
     */
    createDivider() {
        const divider = document.createElement('hr');
        divider.style.cssText = 'border: none; border-top: 1px solid var(--d2-border); margin: 16px 0;';
        return divider;
    },

    /**
     * Cria um Toggle Switch (on/off)
     * @param {Object} options - { label, value, path }
     */
    createToggle(options) {
        const { label, value = false, path } = options;

        const container = document.createElement('div');
        container.className = 'control-item';

        container.innerHTML = `
            <label>${label}</label>
            <div class="toggle-control">
                <label class="toggle-switch">
                    <input type="checkbox" ${value ? 'checked' : ''} data-path="${path}">
                    <span class="toggle-slider"></span>
                </label>
                <span class="toggle-label">${value ? 'Sim' : 'Não'}</span>
            </div>
        `;

        const checkbox = container.querySelector('input[type="checkbox"]');
        const toggleLabel = container.querySelector('.toggle-label');

        checkbox.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            toggleLabel.textContent = isChecked ? 'Sim' : 'Não';

            if (path && window.d2State) {
                window.d2State.set(path, isChecked);
            }
        });

        return container;
    },

    /**
     * Cria um GroupExpander completo de "Fundo da Seção"
     * Reutilizável em qualquer editor.
     * @param {Object} options - { basePath, defaults, expanded }
     */
    createBgSection(options) {
        const C = window.D2Controls;
        const bp = options.basePath;
        const d = {
            bgMode: 'color', bgColor: '#ffffff', bgColor2: '#d0d0d0',
            bgGradient: false, bgGradientInvert: false, bgImage: null,
            bgOverlay: false, bgOverlayType: 'solid', bgOverlayColor: '#000000',
            bgOverlayColor2: '#000000', bgOverlayOpacity: 50, bgOverlayInvert: false,
            bgOverlayPosition: 50, bgOverlaySpread: 80,
            bgImageBlur: 0, bgImageZoom: 100, bgImagePosX: 50, bgImagePosY: 0,
            sectionSpacing: 30,
            ...(options.defaults || {})
        };

        return C.createGroupExpander(
            { title: 'Fundo da Seção', icon: 'fa-fill-drip', expanded: options.expanded !== false },
            () => {
                const container = document.createElement('div');
                const dividerStyle = 'font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; margin: 16px 0 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);';

                const bgMode = window.d2State.get(`${bp}.bgMode`, d.bgMode);

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
                const sectionId = bp.replace('d2Adjustments.', '');
                modeDiv.querySelectorAll('.mode-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        window.d2State.set(`${bp}.bgMode`, btn.dataset.mode);
                        document.dispatchEvent(new CustomEvent('d2:section-selected', {
                            detail: { sectionId }
                        }));
                    });
                });
                container.appendChild(modeDiv);

                if (bgMode === 'color') {
                    // ── COLOR MODE ──
                    container.appendChild(C.createColorPicker({
                        label: 'Cor principal',
                        value: window.d2State.get(`${bp}.bgColor`, d.bgColor),
                        path: `${bp}.bgColor`
                    }));

                    container.appendChild(C.createToggle({
                        label: 'Ativar degradê',
                        value: window.d2State.get(`${bp}.bgGradient`, d.bgGradient),
                        path: `${bp}.bgGradient`
                    }));

                    if (window.d2State.get(`${bp}.bgGradient`, d.bgGradient)) {
                        container.appendChild(C.createColorPicker({
                            label: 'Cor 2',
                            value: window.d2State.get(`${bp}.bgColor2`, d.bgColor2),
                            path: `${bp}.bgColor2`
                        }));
                        container.appendChild(C.createToggle({
                            label: 'Inverter direção',
                            value: window.d2State.get(`${bp}.bgGradientInvert`, d.bgGradientInvert),
                            path: `${bp}.bgGradientInvert`
                        }));
                    }
                } else {
                    // ── IMAGE MODE ──
                    container.appendChild(C.createImagePicker({
                        label: 'Imagem de fundo',
                        value: window.d2State.get(`${bp}.bgImage`, d.bgImage),
                        path: `${bp}.bgImage`,
                        aspect: '16/9'
                    }));

                    container.appendChild(C.createSlider({
                        label: 'Desfoque',
                        value: window.d2State.get(`${bp}.bgImageBlur`, d.bgImageBlur),
                        min: 0, max: 20, step: 1, unit: 'px',
                        path: `${bp}.bgImageBlur`
                    }));
                    container.appendChild(C.createSlider({
                        label: 'Zoom',
                        value: window.d2State.get(`${bp}.bgImageZoom`, d.bgImageZoom),
                        min: 100, max: 300, step: 5, unit: '%',
                        path: `${bp}.bgImageZoom`
                    }));
                    container.appendChild(C.createSlider({
                        label: 'Posição horizontal',
                        value: window.d2State.get(`${bp}.bgImagePosX`, d.bgImagePosX),
                        min: 0, max: 100, step: 5, unit: '%',
                        path: `${bp}.bgImagePosX`
                    }));
                    container.appendChild(C.createSlider({
                        label: 'Posição vertical',
                        value: window.d2State.get(`${bp}.bgImagePosY`, d.bgImagePosY),
                        min: 0, max: 100, step: 5, unit: '%',
                        path: `${bp}.bgImagePosY`
                    }));

                    // Overlay divider
                    const overlayDiv = document.createElement('div');
                    overlayDiv.style.cssText = dividerStyle;
                    overlayDiv.textContent = 'Overlay';
                    container.appendChild(overlayDiv);

                    container.appendChild(C.createToggle({
                        label: 'Ativar overlay',
                        value: window.d2State.get(`${bp}.bgOverlay`, d.bgOverlay),
                        path: `${bp}.bgOverlay`
                    }));

                    if (window.d2State.get(`${bp}.bgOverlay`, d.bgOverlay)) {
                        container.appendChild(C.createSelect({
                            label: 'Tipo',
                            value: window.d2State.get(`${bp}.bgOverlayType`, d.bgOverlayType),
                            options: [
                                { value: 'solid', label: 'Chapado' },
                                { value: 'gradient', label: 'Degradê' },
                                { value: 'gradientTransparent', label: 'Degradê → Transparente' }
                            ],
                            path: `${bp}.bgOverlayType`
                        }));
                        container.appendChild(C.createColorPicker({
                            label: 'Cor do overlay',
                            value: window.d2State.get(`${bp}.bgOverlayColor`, d.bgOverlayColor),
                            path: `${bp}.bgOverlayColor`
                        }));
                        const overlayType = window.d2State.get(`${bp}.bgOverlayType`, d.bgOverlayType);
                        if (overlayType === 'gradient') {
                            container.appendChild(C.createColorPicker({
                                label: 'Cor 2',
                                value: window.d2State.get(`${bp}.bgOverlayColor2`, d.bgOverlayColor2),
                                path: `${bp}.bgOverlayColor2`
                            }));
                        }
                        container.appendChild(C.createSlider({
                            label: 'Opacidade',
                            value: window.d2State.get(`${bp}.bgOverlayOpacity`, d.bgOverlayOpacity),
                            min: 0, max: 100, step: 5, unit: '%',
                            path: `${bp}.bgOverlayOpacity`
                        }));
                        if (overlayType !== 'solid') {
                            container.appendChild(C.createToggle({
                                label: 'Inverter',
                                value: window.d2State.get(`${bp}.bgOverlayInvert`, d.bgOverlayInvert),
                                path: `${bp}.bgOverlayInvert`
                            }));
                            container.appendChild(C.createSlider({
                                label: 'Posição',
                                value: window.d2State.get(`${bp}.bgOverlayPosition`, d.bgOverlayPosition),
                                min: 0, max: 100, step: 5, unit: '%',
                                path: `${bp}.bgOverlayPosition`
                            }));
                            container.appendChild(C.createSlider({
                                label: 'Suavidade',
                                value: window.d2State.get(`${bp}.bgOverlaySpread`, d.bgOverlaySpread),
                                min: 10, max: 100, step: 5, unit: '%',
                                path: `${bp}.bgOverlaySpread`
                            }));
                        }
                    }
                }

                // Spacing
                const spDiv = document.createElement('div');
                spDiv.style.cssText = dividerStyle;
                spDiv.textContent = 'Espaçamento';
                container.appendChild(spDiv);

                container.appendChild(C.createSlider({
                    label: 'Espaçamento da seção',
                    value: window.d2State.get(`${bp}.sectionSpacing`, d.sectionSpacing),
                    min: 20, max: 80, step: 5, unit: 'px',
                    path: `${bp}.sectionSpacing`
                }));

                return container;
            }
        );
    },

    /**
     * Presets de degradê — grid de botões visuais
     * @param {Object} options - { value, path }
     */
    createGradientPresets(options) {
        const { value, path } = options;
        const C = window.D2Controls;
        const presets = [
            { name: 'Azul Royal', css: 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 50%, #2D3A81 100%)' },
            { name: 'Dourado', css: 'linear-gradient(135deg, #F5A623 0%, #F7DC6F 50%, #D4AC0D 100%)' },
            { name: 'Sunset', css: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)' },
            { name: 'Oceano', css: 'linear-gradient(135deg, #0077B6 0%, #48CAE4 50%, #023E8A 100%)' },
            { name: 'Esmeralda', css: 'linear-gradient(135deg, #2ECC71 0%, #82E0AA 50%, #1B8C4E 100%)' },
            { name: 'Rosé', css: 'linear-gradient(135deg, #E91E63 0%, #F48FB1 50%, #880E4F 100%)' },
            { name: 'Cinza', css: 'linear-gradient(135deg, #555 0%, #999 50%, #333 100%)' },
            { name: 'Noite', css: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }
        ];

        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0;';

        presets.forEach(p => {
            const btn = document.createElement('button');
            btn.title = p.name;
            const isActive = value === p.css;
            btn.style.cssText = `
                width: 32px; height: 32px; border-radius: 50%; border: 2px solid ${isActive ? 'var(--d2-gold)' : 'rgba(255,255,255,0.15)'};
                background: ${p.css}; cursor: pointer; padding: 0; transition: border-color 0.2s, transform 0.15s;
                ${isActive ? 'transform: scale(1.15);' : ''}
            `;
            btn.addEventListener('mouseenter', () => { if (!isActive) btn.style.borderColor = 'rgba(255,255,255,0.4)'; });
            btn.addEventListener('mouseleave', () => { if (!isActive) btn.style.borderColor = 'rgba(255,255,255,0.15)'; });
            btn.addEventListener('click', () => {
                window.d2State.set(path, p.css);
            });
            wrapper.appendChild(btn);
        });

        return wrapper;
    },

    // Cria um GroupExpander de "Linha Decorativa"
    // @param {Object} options - { basePath }
    createTopLineSection(options) {
        const { basePath } = options;
        const C = window.D2Controls;
        const tlPath = `${basePath}.topLine`;

        return C.createGroupExpander(
            { title: 'Linha Decorativa', icon: 'fa-minus', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createToggle({
                    label: 'Ativar linha no topo',
                    value: window.d2State.get(`${tlPath}.enabled`, false),
                    path: `${tlPath}.enabled`
                }));

                container.appendChild(C.createSlider({
                    label: 'Altura',
                    value: window.d2State.get(`${tlPath}.height`, 3),
                    min: 1, max: 8, step: 1, unit: 'px',
                    path: `${tlPath}.height`
                }));

                container.appendChild(C.createSelect({
                    label: 'Tipo',
                    value: window.d2State.get(`${tlPath}.bgType`, 'gradient'),
                    options: [
                        { value: 'solid', label: 'Cor Sólida' },
                        { value: 'gradient', label: 'Degradê' }
                    ],
                    path: `${tlPath}.bgType`
                }));

                container.appendChild(C.createColorPicker({
                    label: 'Cor',
                    value: window.d2State.get(`${tlPath}.bgColor`, '#5167E7'),
                    path: `${tlPath}.bgColor`
                }));

                // Presets de degradê (quando tipo = gradient)
                if (window.d2State.get(`${tlPath}.bgType`, 'gradient') === 'gradient') {
                    const label = document.createElement('div');
                    label.style.cssText = 'font-size: 11px; opacity: 0.6; margin-top: 8px;';
                    label.textContent = 'Escolha o degradê:';
                    container.appendChild(label);
                    container.appendChild(C.createGradientPresets({
                        value: window.d2State.get(`${tlPath}.bgGradient`, 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)'),
                        path: `${tlPath}.bgGradient`
                    }));
                }

                return container;
            }
        );
    },

    /**
     * Controles de texto gradiente (toggle + presets)
     * @param {Object} options - { basePath: 'section.sectionTitle' ou 'hero.title' }
     */
    createTextGradientControls(options) {
        const { basePath } = options;
        const C = window.D2Controls;
        const tgPath = `${basePath}.textGradient`;
        const container = document.createElement('div');

        container.appendChild(C.createToggle({
            label: 'Texto gradiente',
            value: window.d2State.get(`${tgPath}.enabled`, false),
            path: `${tgPath}.enabled`
        }));

        // Presets de degradê (quando ativado)
        if (window.d2State.get(`${tgPath}.enabled`, false)) {
            const label = document.createElement('div');
            label.style.cssText = 'font-size: 11px; opacity: 0.6; margin-top: 8px;';
            label.textContent = 'Escolha o degradê:';
            container.appendChild(label);
            container.appendChild(C.createGradientPresets({
                value: window.d2State.get(`${tgPath}.gradient`, 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 50%, #2D3A81 100%)'),
                path: `${tgPath}.gradient`
            }));
        }

        return container;
    }
};

console.log('[D2 Controls] Module loaded');
