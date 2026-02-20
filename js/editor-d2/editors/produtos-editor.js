/* ============================================
   EDITOR D2 - PRODUTOS EDITOR
   Painel de edição da seção Produtos
   ============================================ */

/**
 * D2 Produtos Editor Component
 * Gera os controles para editar a seção Produtos
 */
class D2ProdutosEditor {
    constructor() {
        this.basePath = 'd2Adjustments.produtos';
    }

    /**
     * Renderiza todos os controles do Produtos
     * @returns {DocumentFragment}
     */
    render() {
        const fragment = document.createDocumentFragment();
        const C = window.D2Controls;

        // ===== FUNDO DA SEÇÃO =====
        const bgGroup = C.createBgSection({
            basePath: this.basePath,
            defaults: { bgColor: '#1a365d', bgColor2: '#0d1b36', sectionSpacing: 30 }
        });
        fragment.appendChild(bgGroup);

        // ===== LINHA DECORATIVA =====
        fragment.appendChild(C.createTopLineSection({ basePath: this.basePath }));

        // ===== TÍTULO DA SEÇÃO =====
        const titleGroup = C.createGroupExpander(
            { title: 'Título da Seção', icon: 'fa-heading', expanded: false },
            () => {
                const container = document.createElement('div');
                const dividerStyle = 'font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; margin: 16px 0 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);';

                // ── TÍTULO ──
                container.appendChild(C.createToggle({
                    label: 'Mostrar título',
                    value: window.d2State.get(`${this.basePath}.sectionTitle.enabled`, true),
                    path: `${this.basePath}.sectionTitle.enabled`
                }));
                container.appendChild(C.createTextInput({
                    label: 'Texto',
                    value: window.d2State.get(`${this.basePath}.sectionTitle.text`, 'Produtos Demeni'),
                    placeholder: 'Ex: Nossos Produtos',
                    path: `${this.basePath}.sectionTitle.text`
                }));
                container.appendChild(C.createSlider({
                    label: 'Tamanho',
                    value: window.d2State.get(`${this.basePath}.sectionTitle.size`, 36),
                    min: 16, max: 60, step: 1, unit: 'px',
                    path: `${this.basePath}.sectionTitle.size`
                }));
                container.appendChild(C.createWeightSelector({
                    label: 'Peso',
                    value: window.d2State.get(`${this.basePath}.sectionTitle.weight`, 400),
                    path: `${this.basePath}.sectionTitle.weight`
                }));
                container.appendChild(C.createColorPicker({
                    label: 'Cor',
                    value: window.d2State.get(`${this.basePath}.sectionTitle.color`, '#ffffff'),
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
                    value: window.d2State.get(`${this.basePath}.sectionSubtitle.enabled`, false),
                    path: `${this.basePath}.sectionSubtitle.enabled`
                }));
                container.appendChild(C.createTextInput({
                    label: 'Texto',
                    value: window.d2State.get(`${this.basePath}.sectionSubtitle.text`, 'Confira nossos destaques'),
                    placeholder: 'Ex: Os mais vendidos',
                    path: `${this.basePath}.sectionSubtitle.text`
                }));
                container.appendChild(C.createSlider({
                    label: 'Tamanho',
                    value: window.d2State.get(`${this.basePath}.sectionSubtitle.size`, 14),
                    min: 10, max: 24, step: 1, unit: 'px',
                    path: `${this.basePath}.sectionSubtitle.size`
                }));
                container.appendChild(C.createWeightSelector({
                    label: 'Peso',
                    value: window.d2State.get(`${this.basePath}.sectionSubtitle.weight`, 400),
                    path: `${this.basePath}.sectionSubtitle.weight`
                }));
                container.appendChild(C.createColorPicker({
                    label: 'Cor',
                    value: window.d2State.get(`${this.basePath}.sectionSubtitle.color`, 'rgba(255,255,255,0.7)'),
                    path: `${this.basePath}.sectionSubtitle.color`
                }));

                // ── ESPAÇAMENTO ──
                const spDiv = document.createElement('div');
                spDiv.style.cssText = dividerStyle;
                spDiv.textContent = 'Espaçamento';
                container.appendChild(spDiv);

                container.appendChild(C.createSlider({
                    label: 'Acima do título',
                    value: window.d2State.get(`${this.basePath}.sectionTitle.paddingTop`, 0),
                    min: 0, max: 40, step: 2, unit: 'px',
                    path: `${this.basePath}.sectionTitle.paddingTop`
                }));
                container.appendChild(C.createSlider({
                    label: 'Entre título e subtítulo',
                    value: window.d2State.get(`${this.basePath}.sectionTitle.gap`, 6),
                    min: 0, max: 30, step: 2, unit: 'px',
                    path: `${this.basePath}.sectionTitle.gap`
                }));
                container.appendChild(C.createSlider({
                    label: 'Abaixo do subtítulo',
                    value: window.d2State.get(`${this.basePath}.sectionTitle.paddingBottom`, 24),
                    min: 0, max: 40, step: 2, unit: 'px',
                    path: `${this.basePath}.sectionTitle.paddingBottom`
                }));

                return container;
            }
        );
        fragment.appendChild(titleGroup);

        // ===== GRID DE CARDS =====
        const gridGroup = C.createGroupExpander(
            { title: 'Layout do Grid', icon: 'fa-th-large', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createSlider({
                    label: 'Colunas por linha',
                    value: window.d2State.get(`${this.basePath}.gridColumns`, 2),
                    min: 1, max: 4, step: 1, unit: '',
                    path: `${this.basePath}.gridColumns`
                }));

                container.appendChild(C.createSlider({
                    label: 'Respiro lateral',
                    value: window.d2State.get(`${this.basePath}.sectionPaddingH`, 32),
                    min: 8, max: 60, step: 2, unit: 'px',
                    path: `${this.basePath}.sectionPaddingH`
                }));

                container.appendChild(C.createSlider({
                    label: 'Espaço entre cards',
                    value: window.d2State.get(`${this.basePath}.gridGap`, 16),
                    min: 4, max: 32, step: 2, unit: 'px',
                    path: `${this.basePath}.gridGap`
                }));

                container.appendChild(C.createSlider({
                    label: 'Margem interna do card',
                    value: window.d2State.get(`${this.basePath}.card.padding`, 6),
                    min: 0, max: 16, step: 1, unit: 'px',
                    path: `${this.basePath}.card.padding`
                }));

                return container;
            }
        );
        fragment.appendChild(gridGroup);

        // ===== ESTILO DOS CARDS =====
        const cardGroup = C.createGroupExpander(
            { title: 'Estilo dos Cards', icon: 'fa-square', expanded: false },
            () => {
                const container = document.createElement('div');
                const dividerStyle = 'font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; margin: 16px 0 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);';

                container.appendChild(C.createColorPicker({
                    label: 'Cor de fundo',
                    value: window.d2State.get(`${this.basePath}.card.bgColor`, '#ffffff'),
                    path: `${this.basePath}.card.bgColor`
                }));

                container.appendChild(C.createSlider({
                    label: 'Arredondamento',
                    value: window.d2State.get(`${this.basePath}.card.borderRadius`, 20),
                    min: 0, max: 40, step: 2, unit: 'px',
                    path: `${this.basePath}.card.borderRadius`
                }));

                // ── BORDA ──
                const borderDiv = document.createElement('div');
                borderDiv.style.cssText = dividerStyle;
                borderDiv.textContent = 'Borda';
                container.appendChild(borderDiv);

                container.appendChild(C.createToggle({
                    label: 'Mostrar borda',
                    value: window.d2State.get(`${this.basePath}.card.borderEnabled`, false),
                    path: `${this.basePath}.card.borderEnabled`
                }));
                container.appendChild(C.createSlider({
                    label: 'Espessura',
                    value: window.d2State.get(`${this.basePath}.card.borderWidth`, 1),
                    min: 1, max: 5, step: 1, unit: 'px',
                    path: `${this.basePath}.card.borderWidth`
                }));
                container.appendChild(C.createColorPicker({
                    label: 'Cor da borda',
                    value: window.d2State.get(`${this.basePath}.card.borderColor`, '#e0e0e0'),
                    path: `${this.basePath}.card.borderColor`
                }));

                return container;
            }
        );
        fragment.appendChild(cardGroup);

        // ===== TÍTULO DO PRODUTO =====
        const prodTitleGroup = C.createGroupExpander(
            { title: 'Título do Produto', icon: 'fa-font', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createSlider({
                    label: 'Tamanho da fonte',
                    value: window.d2State.get(`${this.basePath}.title.size`, 15),
                    min: 10, max: 24, step: 1, unit: 'px',
                    path: `${this.basePath}.title.size`
                }));

                container.appendChild(C.createWeightSelector({
                    label: 'Peso da fonte',
                    value: window.d2State.get(`${this.basePath}.title.weight`, 500),
                    path: `${this.basePath}.title.weight`
                }));

                container.appendChild(C.createColorPicker({
                    label: 'Cor do texto',
                    value: window.d2State.get(`${this.basePath}.title.color`, '#333333'),
                    path: `${this.basePath}.title.color`
                }));

                return container;
            }
        );
        fragment.appendChild(prodTitleGroup);

        // ===== PREÇO =====
        const priceGroup = C.createGroupExpander(
            { title: 'Preço', icon: 'fa-dollar-sign', expanded: false },
            () => {
                const container = document.createElement('div');

                // Estilo do R$
                const styleSelector = document.createElement('div');
                styleSelector.className = 'control-item';
                const currentStyle = window.d2State.get(`${this.basePath}.preco.currencyStyle`, 'normal');
                const activeBg = 'rgba(100,100,255,0.15)';
                const inactiveBg = 'transparent';
                const btnBase = 'flex: 1; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 700; color: inherit; transition: all 0.2s;';
                styleSelector.innerHTML = `
                    <label>Estilo do R$</label>
                    <div style="display: flex; gap: 8px; margin-top: 6px;">
                        <button class="currency-style-btn ${currentStyle === 'normal' ? 'active' : ''}" data-style="normal"
                            style="${btnBase} border: 2px solid ${currentStyle === 'normal' ? '#6366f1' : 'rgba(0,0,0,0.15)'}; background: ${currentStyle === 'normal' ? activeBg : inactiveBg};">
                            R$ 99,90
                        </button>
                        <button class="currency-style-btn ${currentStyle === 'small' ? 'active' : ''}" data-style="small"
                            style="${btnBase} border: 2px solid ${currentStyle === 'small' ? '#6366f1' : 'rgba(0,0,0,0.15)'}; background: ${currentStyle === 'small' ? activeBg : inactiveBg};">
                            <span style="font-size: 9px; vertical-align: super;">R$</span>99<span style="font-size: 9px; vertical-align: super;">,90</span>
                        </button>
                    </div>
                `;
                styleSelector.querySelectorAll('.currency-style-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const style = btn.dataset.style;
                        window.d2State.set(`${this.basePath}.preco.currencyStyle`, style);
                        styleSelector.querySelectorAll('.currency-style-btn').forEach(b => {
                            const isActive = b.dataset.style === style;
                            b.style.background = isActive ? activeBg : inactiveBg;
                            b.style.borderColor = isActive ? '#6366f1' : 'rgba(0,0,0,0.15)';
                            b.classList.toggle('active', isActive);
                        });
                    });
                });
                container.appendChild(styleSelector);

                container.appendChild(C.createSlider({
                    label: 'Tamanho da fonte',
                    value: window.d2State.get(`${this.basePath}.preco.size`, 16),
                    min: 12, max: 28, step: 1, unit: 'px',
                    path: `${this.basePath}.preco.size`
                }));

                container.appendChild(C.createWeightSelector({
                    label: 'Peso da fonte',
                    value: window.d2State.get(`${this.basePath}.preco.weight`, 800),
                    path: `${this.basePath}.preco.weight`
                }));

                container.appendChild(C.createColorPicker({
                    label: 'Cor do texto',
                    value: window.d2State.get(`${this.basePath}.preco.color`, '#333333'),
                    path: `${this.basePath}.preco.color`
                }));

                return container;
            }
        );
        fragment.appendChild(priceGroup);

        // ===== BOTÃO COMPRAR =====
        const btnGroup = C.createGroupExpander(
            { title: 'Botão Comprar', icon: 'fa-shopping-cart', expanded: false },
            () => {
                const container = document.createElement('div');
                const dividerStyle = 'font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; margin: 16px 0 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);';

                container.appendChild(C.createTextInput({
                    label: 'Texto do botão',
                    value: window.d2State.get(`${this.basePath}.btn.text`, 'Comprar'),
                    placeholder: 'Ex: Comprar, Ver mais...',
                    path: `${this.basePath}.btn.text`
                }));

                container.appendChild(C.createSlider({
                    label: 'Tamanho da fonte',
                    value: window.d2State.get(`${this.basePath}.btn.size`, 13),
                    min: 10, max: 18, step: 1, unit: 'px',
                    path: `${this.basePath}.btn.size`
                }));

                container.appendChild(C.createWeightSelector({
                    label: 'Peso da fonte',
                    value: window.d2State.get(`${this.basePath}.btn.weight`, 600),
                    path: `${this.basePath}.btn.weight`
                }));

                container.appendChild(C.createColorPicker({
                    label: 'Cor do texto',
                    value: window.d2State.get(`${this.basePath}.btn.color`, '#ffffff'),
                    path: `${this.basePath}.btn.color`
                }));

                // ── COR DE FUNDO ──
                const bgDiv = document.createElement('div');
                bgDiv.style.cssText = dividerStyle;
                bgDiv.textContent = 'Cor de fundo';
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

                // Cor sólida
                const solidColorEl = C.createColorPicker({
                    label: 'Cor de fundo',
                    value: window.d2State.get(`${this.basePath}.btn.bgColor`, '#25D366'),
                    path: `${this.basePath}.btn.bgColor`
                });
                solidColorEl.dataset.btnBgControl = 'solid';
                if (currentBgType !== 'solid') solidColorEl.style.display = 'none';
                container.appendChild(solidColorEl);

                // Degradê presets
                const gradientWrapper = document.createElement('div');
                gradientWrapper.dataset.btnBgControl = 'gradient';
                if (currentBgType !== 'gradient') gradientWrapper.style.display = 'none';

                const gradLabel = document.createElement('label');
                gradLabel.className = 'control-label';
                gradLabel.textContent = 'Degradê';
                gradLabel.style.cssText = 'font-size: 12px; color: var(--d2-text-secondary); margin-bottom: 6px; display: block;';
                gradientWrapper.appendChild(gradLabel);

                gradientWrapper.appendChild(
                    C.createGradientPresets({
                        value: window.d2State.get(`${this.basePath}.btn.bgGradient`, 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)'),
                        path: `${this.basePath}.btn.bgGradient`
                    })
                );
                container.appendChild(gradientWrapper);

                // Toggle visibility
                window.d2State.subscribe(({ path }) => {
                    if (path === `${this.basePath}.btn.bgType`) {
                        const newType = window.d2State.get(`${this.basePath}.btn.bgType`, 'solid');
                        solidColorEl.style.display = newType === 'solid' ? '' : 'none';
                        gradientWrapper.style.display = newType === 'gradient' ? '' : 'none';
                    }
                });

                container.appendChild(C.createSlider({
                    label: 'Arredondamento',
                    value: window.d2State.get(`${this.basePath}.btn.borderRadius`, 20),
                    min: 0, max: 30, step: 2, unit: 'px',
                    path: `${this.basePath}.btn.borderRadius`
                }));

                // ── ESPAÇAMENTO ──
                const spacingDiv = document.createElement('div');
                spacingDiv.style.cssText = dividerStyle;
                spacingDiv.textContent = 'Espaçamento';
                container.appendChild(spacingDiv);

                container.appendChild(C.createSlider({
                    label: 'Padding horizontal',
                    value: window.d2State.get(`${this.basePath}.btn.paddingH`, 14),
                    min: 6, max: 30, step: 2, unit: 'px',
                    path: `${this.basePath}.btn.paddingH`
                }));

                container.appendChild(C.createSlider({
                    label: 'Padding vertical',
                    value: window.d2State.get(`${this.basePath}.btn.paddingV`, 6),
                    min: 4, max: 20, step: 2, unit: 'px',
                    path: `${this.basePath}.btn.paddingV`
                }));



                return container;
            }
        );
        fragment.appendChild(btnGroup);

        // ===== LISTA DE PRODUTOS =====
        const productsGroup = C.createGroupExpander(
            { title: 'Gerenciar Produtos', icon: 'fa-list', expanded: false },
            () => {
                const container = document.createElement('div');
                const products = window.d2State.get('d2Products', []);

                if (products.length === 0) {
                    container.innerHTML = `
                        <div class="empty-items">
                            <i class="fas fa-box-open"></i>
                            <span>Nenhum produto cadastrado</span>
                        </div>
                    `;
                } else {
                    products.forEach((product, index) => {
                        const itemGroup = C.createGroupExpander(
                            { title: `${index + 1}. ${product.title || 'Produto'}`, expanded: false, nested: true },
                            () => {
                                const itemContainer = document.createElement('div');

                                itemContainer.appendChild(
                                    C.createTextInput({
                                        label: 'Nome do produto',
                                        value: product.title || '',
                                        placeholder: 'Ex: Produto Premium',
                                        path: `d2Products.${index}.title`
                                    })
                                );

                                itemContainer.appendChild(
                                    C.createTextInput({
                                        label: 'Preço',
                                        value: product.price || '',
                                        placeholder: 'Ex: R$ 99,90',
                                        path: `d2Products.${index}.price`
                                    })
                                );

                                itemContainer.appendChild(
                                    C.createTextInput({
                                        label: 'Link',
                                        value: product.link || '',
                                        placeholder: 'https://...',
                                        path: `d2Products.${index}.link`
                                    })
                                );

                                itemContainer.appendChild(
                                    C.createImagePicker({
                                        label: 'Imagem',
                                        value: product.image || '',
                                        path: `d2Products.${index}.image`,
                                        compact: true
                                    })
                                );

                                // Ajuste da imagem (only if image exists)
                                if (product.image) {
                                    const posDiv = document.createElement('div');
                                    posDiv.style.cssText = 'font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; margin: 12px 0 8px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);';
                                    posDiv.textContent = 'Ajuste da Foto';
                                    itemContainer.appendChild(posDiv);

                                    itemContainer.appendChild(
                                        C.createSlider({
                                            label: 'Zoom',
                                            value: product.imageZoom || 100,
                                            min: 100, max: 200, step: 5, unit: '%',
                                            path: `d2Products.${index}.imageZoom`
                                        })
                                    );
                                    itemContainer.appendChild(
                                        C.createSlider({
                                            label: 'Horizontal',
                                            value: product.imagePosX ?? 50,
                                            min: 0, max: 100, step: 1, unit: '%',
                                            path: `d2Products.${index}.imagePosX`
                                        })
                                    );
                                    itemContainer.appendChild(
                                        C.createSlider({
                                            label: 'Vertical',
                                            value: product.imagePosY ?? 50,
                                            min: 0, max: 100, step: 1, unit: '%',
                                            path: `d2Products.${index}.imagePosY`
                                        })
                                    );
                                }

                                // Botão de remover
                                const deleteBtn = document.createElement('button');
                                deleteBtn.className = 'btn-delete-item';
                                deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Remover Produto';
                                deleteBtn.addEventListener('click', () => {
                                    if (confirm(`Remover produto "${product.title}"?`)) {
                                        window.d2State.removeProduct(product.id);
                                        document.dispatchEvent(new CustomEvent('d2:section-selected', {
                                            detail: { sectionId: 'produtos' }
                                        }));
                                    }
                                });
                                itemContainer.appendChild(deleteBtn);

                                return itemContainer;
                            }
                        );
                        container.appendChild(itemGroup);
                    });
                }

                // Botão adicionar produto
                const addBtn = document.createElement('button');
                addBtn.className = 'btn-add-item';
                addBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Produto';
                addBtn.onclick = () => {
                    const products = window.d2State.get('d2Products', []);
                    products.push({
                        id: Date.now(),
                        title: 'Novo Produto',
                        price: 'R$ 0,00',
                        image: '',
                        link: '',
                        imageZoom: 100,
                        imagePosX: 50,
                        imagePosY: 50
                    });
                    window.d2State.set('d2Products', products);
                    // Força re-render do painel
                    document.dispatchEvent(new CustomEvent('d2:section-selected', {
                        detail: { sectionId: 'produtos' }
                    }));
                };
                container.appendChild(addBtn);

                return container;
            }
        );
        fragment.appendChild(productsGroup);

        return fragment;
    }
}

// Exporta globalmente
window.D2ProdutosEditor = D2ProdutosEditor;

console.log('[D2 Produtos Editor] Module loaded');
