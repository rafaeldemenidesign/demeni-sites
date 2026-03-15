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
                container.appendChild(C.createTextSpacingControls(`${this.basePath}.sectionTitle`));

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
                container.appendChild(C.createTextGradientControls({ basePath: `${this.basePath}.sectionSubtitle` }));
                container.appendChild(C.createTextSpacingControls(`${this.basePath}.sectionSubtitle`));

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

                container.appendChild(C.createSlider({
                    label: 'Altura da imagem',
                    value: window.d2State.get(`${this.basePath}.card.imageHeight`, 75),
                    min: 40, max: 130, step: 5, unit: '%',
                    path: `${this.basePath}.card.imageHeight`
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

        // ===== CARROSSEL =====
        const carouselGroup = C.createGroupExpander(
            { title: 'Carrossel', icon: 'fa-images', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createToggle({
                    label: 'Autoplay',
                    value: window.d2State.get(`${this.basePath}.carousel.autoplay`, true),
                    path: `${this.basePath}.carousel.autoplay`
                }));
                container.appendChild(C.createSlider({
                    label: 'Intervalo (segundos)',
                    value: window.d2State.get(`${this.basePath}.carousel.interval`, 3),
                    min: 1, max: 10, step: 0.5, unit: 's',
                    path: `${this.basePath}.carousel.interval`
                }));
                container.appendChild(C.createToggle({
                    label: 'Setas de navegação',
                    value: window.d2State.get(`${this.basePath}.carousel.arrows`, true),
                    path: `${this.basePath}.carousel.arrows`
                }));
                container.appendChild(C.createToggle({
                    label: 'Bolinhas (dots)',
                    value: window.d2State.get(`${this.basePath}.carousel.dots`, true),
                    path: `${this.basePath}.carousel.dots`
                }));

                return container;
            }
        );
        fragment.appendChild(carouselGroup);

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

                container.appendChild(C.createFontPicker({
                    label: 'Família da fonte',
                    value: window.d2State.get(`${this.basePath}.title.font`, ''),
                    path: `${this.basePath}.title.font`
                }));

                container.appendChild(C.createTextSpacingControls(`${this.basePath}.title`));

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

                container.appendChild(C.createTextSpacingControls(`${this.basePath}.preco`, { lineHeight: 1.2 }));

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

                container.appendChild(C.createFontPicker({
                    label: 'Família da fonte',
                    value: window.d2State.get(`${this.basePath}.btn.font`, ''),
                    path: `${this.basePath}.btn.font`
                }));

                container.appendChild(C.createTextSpacingControls(`${this.basePath}.btn`, { lineHeight: 1.2, letterSpacing: 0 }));

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

                                // ── Imagens do Produto (Carrossel) ──
                                const imagesDiv = document.createElement('div');
                                imagesDiv.style.cssText = 'font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; margin: 12px 0 8px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);';
                                imagesDiv.textContent = 'Imagens (até 5)';
                                itemContainer.appendChild(imagesDiv);

                                // Migrate: single image → images array
                                let images = product.images || [];
                                if (images.length === 0 && product.image) {
                                    images = [product.image];
                                    window.d2State.set(`d2Products.${index}.images`, images);
                                }

                                // Thumbnail strip
                                const strip = document.createElement('div');
                                strip.style.cssText = 'display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;';

                                images.forEach((img, imgIdx) => {
                                    const thumb = document.createElement('div');
                                    thumb.style.cssText = 'width: 60px; height: 60px; border-radius: 8px; overflow: hidden; position: relative; border: 1px solid rgba(255,255,255,0.15); cursor: pointer;';
                                    thumb.innerHTML = `
                                        <img src="${img}" style="width:100%;height:100%;object-fit:cover;">
                                        <button style="position:absolute;top:2px;right:2px;width:18px;height:18px;border-radius:50%;background:rgba(0,0,0,0.7);color:#fff;border:none;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;line-height:1;" title="Remover">×</button>
                                    `;
                                    // Delete button
                                    thumb.querySelector('button').addEventListener('click', (e) => {
                                        e.stopPropagation();
                                        const prods = [...(window.d2State.get('d2Products') || [])];
                                        const currentImgs = [...(prods[index].images || [])];
                                        const currentSettings = [...(prods[index].imageSettings || [])];
                                        currentImgs.splice(imgIdx, 1);
                                        currentSettings.splice(imgIdx, 1);
                                        prods[index] = { ...prods[index], images: currentImgs, imageSettings: currentSettings, image: currentImgs[0] || null };
                                        window.d2State.set('d2Products', prods);
                                    });
                                    // Click thumbnail → open edit modal
                                    thumb.addEventListener('click', (e) => {
                                        if (e.target.tagName === 'BUTTON') return;
                                        e.stopPropagation();
                                        this._openImageEditModal(index, imgIdx, img, thumb);
                                    });
                                    strip.appendChild(thumb);
                                });

                                // Add button (if < 5 images)
                                if (images.length < 5) {
                                    const addThumb = document.createElement('div');
                                    addThumb.style.cssText = 'width: 60px; height: 60px; border-radius: 8px; border: 2px dashed rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 20px; opacity: 0.5; transition: opacity 0.2s;';
                                    addThumb.textContent = '+';
                                    addThumb.addEventListener('mouseenter', () => addThumb.style.opacity = '1');
                                    addThumb.addEventListener('mouseleave', () => addThumb.style.opacity = '0.5');

                                    const fileInput = document.createElement('input');
                                    fileInput.type = 'file';
                                    fileInput.accept = 'image/*';
                                    fileInput.style.display = 'none';
                                    fileInput.addEventListener('change', async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        try {
                                            const compressor = window.ImageUtils ? window.ImageUtils.compressProductImage : C.convertToWebP.bind(C);
                                            const webpDataUrl = await compressor(file);
                                            const prods = [...(window.d2State.get('d2Products') || [])];
                                            const currentImgs = [...(prods[index].images || [])];
                                            if (currentImgs.length >= 5) return; // Max 5 images
                                            currentImgs.push(webpDataUrl);
                                            prods[index] = { ...prods[index], images: currentImgs, image: currentImgs[0] };
                                            window.d2State.set('d2Products', prods);
                                        } catch (err) {
                                            console.error('[Produtos] Error adding image:', err);
                                        }
                                    });
                                    addThumb.addEventListener('click', () => fileInput.click());
                                    addThumb.appendChild(fileInput);
                                    strip.appendChild(addThumb);
                                }

                                itemContainer.appendChild(strip);



                                // ── Botão individual ──
                                const btnDiv = document.createElement('div');
                                btnDiv.style.cssText = 'font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; margin: 12px 0 8px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);';
                                btnDiv.textContent = 'Botão';
                                itemContainer.appendChild(btnDiv);

                                itemContainer.appendChild(
                                    C.createTextInput({
                                        label: 'Texto do botão',
                                        value: product.btnText || '',
                                        placeholder: window.d2State.get(`${this.basePath}.btn.text`, 'Comprar'),
                                        path: `d2Products.${index}.btnText`
                                    })
                                );

                                itemContainer.appendChild(
                                    C.createColorPicker({
                                        label: 'Cor do botão',
                                        value: product.btnBgColor || window.d2State.get(`${this.basePath}.btn.bgColor`, '#25D366'),
                                        path: `d2Products.${index}.btnBgColor`
                                    })
                                );

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

                // Re-render panel when product image changes (show/hide zoom/position controls)
                // Guard: subscribe only once globally to prevent listener accumulation
                if (!window.__d2ProductImageSubActive) {
                    window.__d2ProductImageSubActive = true;
                    window.d2State.subscribe(({ path }) => {
                        if (/^d2Products\.\d+\.image$/.test(path)) {
                            document.dispatchEvent(new CustomEvent('d2:section-selected', {
                                detail: { sectionId: 'produtos' }
                            }));
                        }
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

    /**
     * Opens a mini-modal for editing individual image zoom/position
     */
    _openImageEditModal(productIndex, imageIndex, imageSrc, anchorEl) {
        // Remove any existing modal
        document.querySelector('.d2-img-edit-modal-overlay')?.remove();

        const C = window.D2Controls;
        const product = (window.d2State.get('d2Products') || [])[productIndex];
        if (!product) return;

        const settings = (product.imageSettings || [])[imageIndex] || {};
        const zoom = settings.zoom || product.imageZoom || 100;
        const posX = settings.posX ?? product.imagePosX ?? 50;
        const posY = settings.posY ?? product.imagePosY ?? 50;

        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'd2-img-edit-modal-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;';

        // Modal
        const modal = document.createElement('div');
        modal.style.cssText = 'background:#1e1e2e;border-radius:16px;padding:20px;width:320px;max-width:90vw;box-shadow:0 20px 60px rgba(0,0,0,0.5);';

        // Preview image
        const previewWrap = document.createElement('div');
        previewWrap.style.cssText = 'width:100%;aspect-ratio:4/3;border-radius:10px;overflow:hidden;margin-bottom:16px;position:relative;';
        const previewImg = document.createElement('img');
        previewImg.src = imageSrc;
        previewImg.style.cssText = `width:100%;height:100%;object-fit:cover;object-position:${posX}% ${posY}%;transform:scale(${zoom / 100});transform-origin:${posX}% ${posY}%;`;
        previewWrap.appendChild(previewImg);

        // Title
        const title = document.createElement('div');
        title.style.cssText = 'font-size:14px;font-weight:600;color:#fff;margin-bottom:12px;text-align:center;';
        title.textContent = `Imagem ${imageIndex + 1}`;

        modal.appendChild(title);
        modal.appendChild(previewWrap);

        // Helper to update settings
        const updateSetting = (key, val) => {
            const prods = [...(window.d2State.get('d2Products') || [])];
            const settingsArr = [...(prods[productIndex].imageSettings || [])];
            // Ensure array is long enough
            while (settingsArr.length <= imageIndex) settingsArr.push({});
            settingsArr[imageIndex] = { ...settingsArr[imageIndex], [key]: val };
            prods[productIndex] = { ...prods[productIndex], imageSettings: settingsArr };
            // Also update legacy fields if it's image 0
            if (imageIndex === 0) {
                if (key === 'zoom') prods[productIndex].imageZoom = val;
                if (key === 'posX') prods[productIndex].imagePosX = val;
                if (key === 'posY') prods[productIndex].imagePosY = val;
            }
            window.d2State.set('d2Products', prods);

            // Update preview image
            const s = settingsArr[imageIndex];
            const z = (s.zoom || 100) / 100;
            const px = s.posX ?? 50;
            const py = s.posY ?? 50;
            previewImg.style.objectPosition = `${px}% ${py}%`;
            previewImg.style.transform = `scale(${z})`;
            previewImg.style.transformOrigin = `${px}% ${py}%`;
        };

        // Zoom slider
        modal.appendChild(C.createSlider({
            label: 'Zoom',
            value: zoom,
            min: 100, max: 200, step: 5, unit: '%',
            path: `__temp_img_zoom`,
            onChange: (v) => updateSetting('zoom', v)
        }));

        // Horizontal slider
        modal.appendChild(C.createSlider({
            label: 'Horizontal',
            value: posX,
            min: 0, max: 100, step: 1, unit: '%',
            path: `__temp_img_posX`,
            onChange: (v) => updateSetting('posX', v)
        }));

        // Vertical slider
        modal.appendChild(C.createSlider({
            label: 'Vertical',
            value: posY,
            min: 0, max: 100, step: 1, unit: '%',
            path: `__temp_img_posY`,
            onChange: (v) => updateSetting('posY', v)
        }));

        // Since createSlider saves to path via d2State, we need manual event listeners
        // to also call updateSetting. Override the slider inputs.
        setTimeout(() => {
            modal.querySelectorAll('input[type="range"]').forEach((slider, i) => {
                slider.addEventListener('input', () => {
                    const val = parseFloat(slider.value);
                    if (i === 0) updateSetting('zoom', val);
                    else if (i === 1) updateSetting('posX', val);
                    else if (i === 2) updateSetting('posY', val);
                });
            });
        }, 50);

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.style.cssText = 'width:100%;padding:10px;background:linear-gradient(135deg,#6c5ce7,#a29bfe);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;margin-top:12px;';
        closeBtn.textContent = 'Fechar';
        closeBtn.addEventListener('click', () => {
            overlay.remove();
            // Re-render the section to update the panel
            document.dispatchEvent(new CustomEvent('d2:section-selected', {
                detail: { sectionId: 'produtos' }
            }));
        });
        modal.appendChild(closeBtn);

        overlay.appendChild(modal);
        // Close on backdrop click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                document.dispatchEvent(new CustomEvent('d2:section-selected', {
                    detail: { sectionId: 'produtos' }
                }));
            }
        });

        document.body.appendChild(overlay);
    }
}

// Exporta globalmente
window.D2ProdutosEditor = D2ProdutosEditor;

console.log('[D2 Produtos Editor] Module loaded');
