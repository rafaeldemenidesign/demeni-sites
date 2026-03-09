(function() {
'use strict';
/* ============================================
   EDITOR D2 - CATEGORIAS EDITOR
   Painel de edição da seção Categorias
   ============================================ */

/**
 * D2 Categorias Editor Component
 * Gera os controles para editar a seção Categorias
 */
class D1CategoriasEditor {
    constructor() {
        this.basePath = 'd2Adjustments.categorias';
    }

    /**
     * Renderiza todos os controles do Categorias
     * @returns {DocumentFragment}
     */
    render() {
        const fragment = document.createDocumentFragment();
        const C = window.D1Controls;

        // ===== FUNDO DA SEÇÃO =====
        const bgGroup = C.createBgSection({
            basePath: this.basePath,
            defaults: { bgColor: '#ffffff', bgColor2: '#d0d0d0', sectionSpacing: 40 }
        });
        fragment.appendChild(bgGroup);

        // ===== LINHA DECORATIVA =====
        fragment.appendChild(C.createTopLineSection({ basePath: this.basePath }));

        // ===== LAYOUT =====
        const layoutGroup = C.createGroupExpander(
            { title: 'Layout', icon: 'fa-th-large', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createSlider({
                        label: 'Colunas por linha',
                        value: window.d1State.get(`${this.basePath}.columnsPerRow`, 4),
                        min: 2, max: 6, step: 1, unit: '',
                        path: `${this.basePath}.columnsPerRow`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(layoutGroup);

        // ===== TÍTULO DA SEÇÃO =====
        const titleGroup = C.createGroupExpander(
            { title: 'Título da Seção', icon: 'fa-heading', expanded: false },
            () => {
                const container = document.createElement('div');
                const dividerStyle = 'font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; margin: 16px 0 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);';

                // ── TÍTULO ──
                container.appendChild(C.createToggle({
                    label: 'Mostrar título',
                    value: window.d1State.get(`${this.basePath}.sectionTitle.enabled`, false),
                    path: `${this.basePath}.sectionTitle.enabled`
                }));
                container.appendChild(C.createTextInput({
                    label: 'Texto',
                    value: window.d1State.get(`${this.basePath}.sectionTitle.text`, 'Categorias'),
                    placeholder: 'Ex: Nossas Categorias',
                    path: `${this.basePath}.sectionTitle.text`
                }));
                container.appendChild(C.createSlider({
                    label: 'Tamanho',
                    value: window.d1State.get(`${this.basePath}.sectionTitle.size`, 28),
                    min: 16, max: 60, step: 1, unit: 'px',
                    path: `${this.basePath}.sectionTitle.size`
                }));
                container.appendChild(C.createWeightSelector({
                    label: 'Peso',
                    value: window.d1State.get(`${this.basePath}.sectionTitle.weight`, 400),
                    path: `${this.basePath}.sectionTitle.weight`
                }));
                container.appendChild(C.createColorPicker({
                    label: 'Cor',
                    value: window.d1State.get(`${this.basePath}.sectionTitle.color`, '#333333'),
                    path: `${this.basePath}.sectionTitle.color`
                }));
                container.appendChild(C.createTextGradientControls({ basePath: `${this.basePath}.sectionTitle` }));

                // ── SUBTÍTULO ──
                const subDiv = document.createElement('div');
                subDiv.style.cssText = dividerStyle;
                subDiv.textContent = 'Subtítulo';
                container.appendChild(subDiv);

                container.appendChild(C.createToggle({
                    label: 'Mostrar subtítulo',
                    value: window.d1State.get(`${this.basePath}.sectionSubtitle.enabled`, false),
                    path: `${this.basePath}.sectionSubtitle.enabled`
                }));
                container.appendChild(C.createTextInput({
                    label: 'Texto',
                    value: window.d1State.get(`${this.basePath}.sectionSubtitle.text`, 'Encontre o que precisa'),
                    placeholder: 'Ex: Explore nossas opções',
                    path: `${this.basePath}.sectionSubtitle.text`
                }));
                container.appendChild(C.createSlider({
                    label: 'Tamanho',
                    value: window.d1State.get(`${this.basePath}.sectionSubtitle.size`, 14),
                    min: 10, max: 24, step: 1, unit: 'px',
                    path: `${this.basePath}.sectionSubtitle.size`
                }));
                container.appendChild(C.createWeightSelector({
                    label: 'Peso',
                    value: window.d1State.get(`${this.basePath}.sectionSubtitle.weight`, 400),
                    path: `${this.basePath}.sectionSubtitle.weight`
                }));
                container.appendChild(C.createColorPicker({
                    label: 'Cor',
                    value: window.d1State.get(`${this.basePath}.sectionSubtitle.color`, '#666666'),
                    path: `${this.basePath}.sectionSubtitle.color`
                }));

                // ── ESPAÇAMENTO ──
                const spDiv = document.createElement('div');
                spDiv.style.cssText = dividerStyle;
                spDiv.textContent = 'Espaçamento';
                container.appendChild(spDiv);

                container.appendChild(C.createSlider({
                    label: 'Acima do título',
                    value: window.d1State.get(`${this.basePath}.sectionTitle.paddingTop`, 0),
                    min: 0, max: 40, step: 2, unit: 'px',
                    path: `${this.basePath}.sectionTitle.paddingTop`
                }));
                container.appendChild(C.createSlider({
                    label: 'Entre título e subtítulo',
                    value: window.d1State.get(`${this.basePath}.sectionTitle.gap`, 6),
                    min: 0, max: 30, step: 2, unit: 'px',
                    path: `${this.basePath}.sectionTitle.gap`
                }));
                container.appendChild(C.createSlider({
                    label: 'Abaixo do subtítulo',
                    value: window.d1State.get(`${this.basePath}.sectionTitle.paddingBottom`, 16),
                    min: 0, max: 40, step: 2, unit: 'px',
                    path: `${this.basePath}.sectionTitle.paddingBottom`
                }));

                return container;
            }
        );
        fragment.appendChild(titleGroup);

        // ===== ÍCONES =====
        const iconsGroup = C.createGroupExpander(
            { title: 'Containers dos Ícones', icon: 'fa-shapes', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createSlider({
                        label: 'Tamanho do container',
                        value: window.d1State.get(`${this.basePath}.icon.size`, 55),
                        min: 40, max: 80, step: 5, unit: 'px',
                        path: `${this.basePath}.icon.size`
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Arredondamento',
                        value: window.d1State.get(`${this.basePath}.icon.radius`, 18),
                        min: 0, max: 50, step: 2, unit: 'px',
                        path: `${this.basePath}.icon.radius`
                    })
                );

                // ── Tipo de fundo do ícone ──
                const currentBgType = window.d1State.get(`${this.basePath}.icon.bgType`, 'solid');

                container.appendChild(
                    C.createSelect({
                        label: 'Tipo de fundo',
                        value: currentBgType,
                        options: [
                            { value: 'solid', label: 'Cor chapada' },
                            { value: 'gradient', label: 'Degradê' }
                        ],
                        path: `${this.basePath}.icon.bgType`
                    })
                );

                // Cor sólida (condicional)
                const solidColorEl = C.createColorPicker({
                    label: 'Cor de fundo',
                    value: window.d1State.get(`${this.basePath}.icon.bgColor`, '#f5f5f5'),
                    path: `${this.basePath}.icon.bgColor`
                });
                solidColorEl.dataset.iconBgControl = 'solid';
                if (currentBgType !== 'solid') solidColorEl.style.display = 'none';
                container.appendChild(solidColorEl);

                // Degradê presets (condicional)
                const gradientWrapper = document.createElement('div');
                gradientWrapper.dataset.iconBgControl = 'gradient';
                if (currentBgType !== 'gradient') gradientWrapper.style.display = 'none';

                const gradLabel = document.createElement('label');
                gradLabel.className = 'control-label';
                gradLabel.textContent = 'Degradê';
                gradLabel.style.cssText = 'font-size: 12px; color: var(--d2-text-secondary); margin-bottom: 6px; display: block;';
                gradientWrapper.appendChild(gradLabel);

                gradientWrapper.appendChild(
                    C.createGradientPresets({
                        value: window.d1State.get(`${this.basePath}.icon.bgGradient`, 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'),
                        path: `${this.basePath}.icon.bgGradient`
                    })
                );
                container.appendChild(gradientWrapper);

                // Toggle visibility on bgType change
                window.d1State.subscribe(({ path }) => {
                    if (path === `${this.basePath}.icon.bgType`) {
                        const newType = window.d1State.get(`${this.basePath}.icon.bgType`, 'solid');
                        solidColorEl.style.display = newType === 'solid' ? '' : 'none';
                        gradientWrapper.style.display = newType === 'gradient' ? '' : 'none';
                    }
                });

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor do ícone',
                        value: window.d1State.get(`${this.basePath}.icon.color`, '#333333'),
                        path: `${this.basePath}.icon.color`
                    })
                );

                // ── Cor de ícone PNG (para imagens customizadas) ──
                container.appendChild(
                    C.createSelect({
                        label: 'Cor do ícone (PNG)',
                        value: window.d1State.get(`${this.basePath}.icon.colorMode`, 'original'),
                        options: [
                            { value: 'white', label: 'Branco' },
                            { value: 'black', label: 'Preto' },
                            { value: 'original', label: 'Original' }
                        ],
                        path: `${this.basePath}.icon.colorMode`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(iconsGroup);

        // ===== LABELS =====
        const labelsGroup = C.createGroupExpander(
            { title: 'Labels de Texto', icon: 'fa-tag', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createSlider({
                        label: 'Tamanho da fonte',
                        value: window.d1State.get(`${this.basePath}.label.size`, 10),
                        min: 8, max: 18, step: 1, unit: 'px',
                        path: `${this.basePath}.label.size`
                    })
                );

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor do texto',
                        value: window.d1State.get(`${this.basePath}.label.color`, '#222222'),
                        path: `${this.basePath}.label.color`
                    })
                );

                container.appendChild(
                    C.createWeightSelector({
                        label: 'Peso da fonte',
                        value: window.d1State.get(`${this.basePath}.label.weight`, 500),
                        path: `${this.basePath}.label.weight`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(labelsGroup);

        // ===== EDIÇÃO DE ITENS INDIVIDUAIS =====
        const itemsGroup = C.createGroupExpander(
            { title: 'Itens de Categoria', icon: 'fa-list', expanded: false },
            () => {
                const container = document.createElement('div');
                const items = window.d1State.get(`${this.basePath}.items`, []);

                if (items.length === 0) {
                    container.innerHTML = `
                        <div class="empty-items">
                            <i class="fas fa-info-circle"></i>
                            <span>Nenhum item configurado</span>
                        </div>
                    `;
                } else {
                    items.forEach((item, index) => {
                        const itemGroup = C.createGroupExpander(
                            { title: `${index + 1}. ${item.label || 'Categoria'}`, expanded: false, nested: true },
                            () => {
                                const itemContainer = document.createElement('div');

                                itemContainer.appendChild(
                                    C.createTextInput({
                                        label: 'Texto do label',
                                        value: item.label || '',
                                        placeholder: 'Ex: PRODUTOS',
                                        path: `${this.basePath}.items.${index}.label`
                                    })
                                );

                                itemContainer.appendChild(
                                    C.createTextInput({
                                        label: 'Link',
                                        value: item.link || '',
                                        placeholder: 'https://...',
                                        path: `${this.basePath}.items.${index}.link`
                                    })
                                );

                                // Seletor de ícone FontAwesome
                                const iconOptions = [
                                    { value: 'fa-box-open', label: '📦 Produtos' },
                                    { value: 'fa-concierge-bell', label: '🔔 Serviços' },
                                    { value: 'fa-graduation-cap', label: '🎓 Educação' },
                                    { value: 'fa-info-circle', label: 'ℹ️ Sobre' },
                                    { value: 'fa-shopping-cart', label: '🛒 Compras' },
                                    { value: 'fa-star', label: '⭐ Destaques' },
                                    { value: 'fa-heart', label: '❤️ Favoritos' },
                                    { value: 'fa-map-marker-alt', label: '📍 Local' },
                                    { value: 'fa-calendar', label: '📅 Agenda' },
                                    { value: 'fa-phone', label: '📱 Contato' },
                                    { value: 'fa-envelope', label: '✉️ Email' },
                                    { value: 'fa-cog', label: '⚙️ Config' },
                                    { value: 'fa-users', label: '👥 Equipe' },
                                    { value: 'fa-camera', label: '📷 Galeria' },
                                    { value: 'fa-cut', label: '✂️ Corte' },
                                    { value: 'fa-paint-brush', label: '🎨 Arte' }
                                ];

                                itemContainer.appendChild(
                                    C.createSelect({
                                        label: 'Ícone',
                                        value: item.icon || 'fa-box-open',
                                        options: iconOptions,
                                        path: `${this.basePath}.items.${index}.icon`
                                    })
                                );

                                // Upload de ícone personalizado
                                itemContainer.appendChild(
                                    C.createImagePicker({
                                        label: 'Ícone Personalizado',
                                        value: item.customIcon || '',
                                        path: `${this.basePath}.items.${index}.customIcon`,
                                        aspect: '1/1',
                                        compact: true
                                    })
                                );

                                // Ajustes do ícone personalizado (only if uploaded)
                                if (item.customIcon) {
                                    const posDiv = document.createElement('div');
                                    posDiv.style.cssText = 'font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; margin: 12px 0 8px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);';
                                    posDiv.textContent = 'Ajuste do Ícone';
                                    itemContainer.appendChild(posDiv);

                                    itemContainer.appendChild(
                                        C.createSlider({
                                            label: 'Zoom',
                                            value: item.customIconZoom || 100,
                                            min: 100, max: 200, step: 5, unit: '%',
                                            path: `${this.basePath}.items.${index}.customIconZoom`
                                        })
                                    );
                                    itemContainer.appendChild(
                                        C.createSlider({
                                            label: 'Horizontal',
                                            value: item.customIconPosX ?? 50,
                                            min: 0, max: 100, step: 1, unit: '%',
                                            path: `${this.basePath}.items.${index}.customIconPosX`
                                        })
                                    );
                                    itemContainer.appendChild(
                                        C.createSlider({
                                            label: 'Vertical',
                                            value: item.customIconPosY ?? 50,
                                            min: 0, max: 100, step: 1, unit: '%',
                                            path: `${this.basePath}.items.${index}.customIconPosY`
                                        })
                                    );
                                }

                                // Botão de remover
                                const deleteBtn = document.createElement('button');
                                deleteBtn.className = 'btn-delete-item';
                                deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Remover Categoria';
                                deleteBtn.addEventListener('click', () => {
                                    if (confirm(`Remover categoria "${item.label}"?`)) {
                                        this.removeCategory(index);
                                    }
                                });
                                itemContainer.appendChild(deleteBtn);

                                return itemContainer;
                            }
                        );
                        container.appendChild(itemGroup);
                    });
                }

                // Botão de adicionar categoria
                const addBtn = document.createElement('button');
                addBtn.className = 'btn-add-item';
                addBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Categoria';
                addBtn.addEventListener('click', () => this.addCategory());
                container.appendChild(addBtn);

                return container;
            }
        );
        fragment.appendChild(itemsGroup);

        return fragment;
    }

    /**
     * Adiciona uma nova categoria
     */
    addCategory() {
        const items = window.d1State.get(`${this.basePath}.items`, []);
        const newItem = {
            id: Date.now(),
            label: 'NOVA',
            icon: 'fa-star',
            link: ''
        };
        items.push(newItem);
        window.d1State.set(`${this.basePath}.items`, items);

        // Re-renderiza o editor
        document.dispatchEvent(new CustomEvent('d2:section-selected', {
            detail: { sectionId: 'categorias' }
        }));
    }

    /**
     * Remove uma categoria
     */
    removeCategory(index) {
        const items = window.d1State.get(`${this.basePath}.items`, []);
        items.splice(index, 1);
        window.d1State.set(`${this.basePath}.items`, items);

        // Re-renderiza o editor
        document.dispatchEvent(new CustomEvent('d2:section-selected', {
            detail: { sectionId: 'categorias' }
        }));
    }
}

// Exporta globalmente
window.D1CategoriasEditor = D1CategoriasEditor;

console.log('[D2 Categorias Editor] Module loaded');

})();