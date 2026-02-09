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
     * Cria um Font Picker
     * @param {Object} options - { label, value, path }
     */
    createFontPicker(options) {
        const fonts = [
            { value: 'Liebling', label: 'Liebling' },
            { value: 'Montserrat', label: 'Montserrat' },
            { value: 'Inter', label: 'Inter' },
            { value: 'Poppins', label: 'Poppins' },
            { value: 'Roboto', label: 'Roboto' },
            { value: 'Playfair Display', label: 'Playfair Display' }
        ];

        return this.createSelect({ ...options, options: fonts });
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
    }
};

console.log('[D2 Controls] Module loaded');
