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

        // ===== SEÇÃO GERAL =====
        const sectionGroup = C.createGroupExpander(
            { title: 'Seção', icon: 'fa-layer-group', expanded: true },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor de fundo',
                        value: window.d2State.get(`${this.basePath}.bgColor`, '#1a365d'),
                        path: `${this.basePath}.bgColor`
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Espaçamento da seção',
                        value: window.d2State.get(`${this.basePath}.sectionSpacing`, 30),
                        min: 20, max: 80, step: 5, unit: 'px',
                        path: `${this.basePath}.sectionSpacing`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(sectionGroup);

        // ===== TÍTULO DA SEÇÃO =====
        const titleGroup = C.createGroupExpander(
            { title: 'Título da Seção', icon: 'fa-heading', expanded: true },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createTextInput({
                        label: 'Texto do título',
                        value: window.d2State.get(`${this.basePath}.sectionTitle.text`, 'Produtos Demeni'),
                        placeholder: 'Ex: Nossos Produtos',
                        path: `${this.basePath}.sectionTitle.text`
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Tamanho da fonte',
                        value: window.d2State.get(`${this.basePath}.sectionTitle.size`, 36),
                        min: 20, max: 60, step: 2, unit: 'px',
                        path: `${this.basePath}.sectionTitle.size`
                    })
                );

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor do título',
                        value: window.d2State.get(`${this.basePath}.sectionTitle.color`, '#ffffff'),
                        path: `${this.basePath}.sectionTitle.color`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(titleGroup);

        // ===== GRID DE CARDS =====
        const gridGroup = C.createGroupExpander(
            { title: 'Layout do Grid', icon: 'fa-th-large', expanded: true },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createSlider({
                        label: 'Espaçamento entre cards',
                        value: window.d2State.get(`${this.basePath}.gridGap`, 16),
                        min: 8, max: 32, step: 2, unit: 'px',
                        path: `${this.basePath}.gridGap`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(gridGroup);

        // ===== ESTILO DOS CARDS =====
        const cardGroup = C.createGroupExpander(
            { title: 'Estilo dos Cards', icon: 'fa-square', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor de fundo',
                        value: window.d2State.get(`${this.basePath}.card.bgColor`, '#ffffff'),
                        path: `${this.basePath}.card.bgColor`
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Arredondamento',
                        value: window.d2State.get(`${this.basePath}.card.borderRadius`, 20),
                        min: 0, max: 40, step: 2, unit: 'px',
                        path: `${this.basePath}.card.borderRadius`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(cardGroup);

        // ===== TÍTULO DO PRODUTO =====
        const prodTitleGroup = C.createGroupExpander(
            { title: 'Título do Produto', icon: 'fa-font', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createSlider({
                        label: 'Tamanho da fonte',
                        value: window.d2State.get(`${this.basePath}.title.size`, 15),
                        min: 10, max: 24, step: 1, unit: 'px',
                        path: `${this.basePath}.title.size`
                    })
                );

                container.appendChild(
                    C.createWeightSelector({
                        label: 'Peso da fonte',
                        value: window.d2State.get(`${this.basePath}.title.weight`, 500),
                        path: `${this.basePath}.title.weight`
                    })
                );

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor do texto',
                        value: window.d2State.get(`${this.basePath}.title.color`, '#333333'),
                        path: `${this.basePath}.title.color`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(prodTitleGroup);

        // ===== PREÇO =====
        const priceGroup = C.createGroupExpander(
            { title: 'Preço', icon: 'fa-dollar-sign', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createSlider({
                        label: 'Tamanho da fonte',
                        value: window.d2State.get(`${this.basePath}.preco.size`, 16),
                        min: 12, max: 28, step: 1, unit: 'px',
                        path: `${this.basePath}.preco.size`
                    })
                );

                container.appendChild(
                    C.createWeightSelector({
                        label: 'Peso da fonte',
                        value: window.d2State.get(`${this.basePath}.preco.weight`, 800),
                        path: `${this.basePath}.preco.weight`
                    })
                );

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor do texto',
                        value: window.d2State.get(`${this.basePath}.preco.color`, '#333333'),
                        path: `${this.basePath}.preco.color`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(priceGroup);

        // ===== BOTÃO COMPRAR =====
        const btnGroup = C.createGroupExpander(
            { title: 'Botão Comprar', icon: 'fa-shopping-cart', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createSlider({
                        label: 'Tamanho da fonte',
                        value: window.d2State.get(`${this.basePath}.btn.size`, 13),
                        min: 10, max: 18, step: 1, unit: 'px',
                        path: `${this.basePath}.btn.size`
                    })
                );

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor de fundo',
                        value: window.d2State.get(`${this.basePath}.btn.bgColor`, '#25D366'),
                        path: `${this.basePath}.btn.bgColor`
                    })
                );

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor do texto',
                        value: window.d2State.get(`${this.basePath}.btn.color`, '#ffffff'),
                        path: `${this.basePath}.btn.color`
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Arredondamento',
                        value: window.d2State.get(`${this.basePath}.btn.borderRadius`, 20),
                        min: 0, max: 30, step: 2, unit: 'px',
                        path: `${this.basePath}.btn.borderRadius`
                    })
                );

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
                                        aspect: '4/3'
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
                        link: ''
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
