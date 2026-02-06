/* ============================================
   EDITOR D2 - CATEGORIAS EDITOR
   Painel de edição da seção Categorias
   ============================================ */

/**
 * D2 Categorias Editor Component
 * Gera os controles para editar a seção Categorias
 */
class D2CategoriasEditor {
    constructor() {
        this.basePath = 'd2Adjustments.categorias';
    }

    /**
     * Renderiza todos os controles do Categorias
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
                    C.createSlider({
                        label: 'Espaçamento da seção',
                        value: window.d2State.get(`${this.basePath}.sectionSpacing`, 40),
                        min: 20, max: 80, step: 5, unit: 'px',
                        path: `${this.basePath}.sectionSpacing`
                    })
                );

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor de fundo',
                        value: window.d2State.get(`${this.basePath}.bgColor`, '#ffffff'),
                        path: `${this.basePath}.bgColor`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(sectionGroup);

        // ===== ÍCONES =====
        const iconsGroup = C.createGroupExpander(
            { title: 'Containers dos Ícones', icon: 'fa-shapes', expanded: true },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createSlider({
                        label: 'Tamanho do container',
                        value: window.d2State.get(`${this.basePath}.icon.size`, 80),
                        min: 50, max: 120, step: 5, unit: 'px',
                        path: `${this.basePath}.icon.size`
                    })
                );

                container.appendChild(
                    C.createSlider({
                        label: 'Arredondamento',
                        value: window.d2State.get(`${this.basePath}.icon.radius`, 18),
                        min: 0, max: 50, step: 2, unit: 'px',
                        path: `${this.basePath}.icon.radius`
                    })
                );

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor de fundo',
                        value: window.d2State.get(`${this.basePath}.icon.bgColor`, '#f5f5f5'),
                        path: `${this.basePath}.icon.bgColor`
                    })
                );

                return container;
            }
        );
        fragment.appendChild(iconsGroup);

        // ===== LABELS =====
        const labelsGroup = C.createGroupExpander(
            { title: 'Labels de Texto', icon: 'fa-tag', expanded: true },
            () => {
                const container = document.createElement('div');

                container.appendChild(
                    C.createSlider({
                        label: 'Tamanho da fonte',
                        value: window.d2State.get(`${this.basePath}.label.size`, 12),
                        min: 8, max: 18, step: 1, unit: 'px',
                        path: `${this.basePath}.label.size`
                    })
                );

                container.appendChild(
                    C.createColorPicker({
                        label: 'Cor do texto',
                        value: window.d2State.get(`${this.basePath}.label.color`, '#222222'),
                        path: `${this.basePath}.label.color`
                    })
                );

                container.appendChild(
                    C.createWeightSelector({
                        label: 'Peso da fonte',
                        value: window.d2State.get(`${this.basePath}.label.weight`, 500),
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
                const items = window.d2State.get(`${this.basePath}.items`, []);

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

                                // Seletor de ícone (simplificado)
                                const iconOptions = [
                                    { value: 'Pen Tool.png', label: 'Caneta' },
                                    { value: 'Engrenagem.png', label: 'Engrenagem' },
                                    { value: 'Aulas.png', label: 'Aulas' },
                                    { value: 'Sobre.png', label: 'Sobre' },
                                    { value: 'produtos.png', label: 'Produtos' },
                                    { value: 'servicos.png', label: 'Serviços' }
                                ];

                                itemContainer.appendChild(
                                    C.createSelect({
                                        label: 'Ícone',
                                        value: item.icon || 'Pen Tool.png',
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
                                        aspect: '1/1'
                                    })
                                );

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
        const items = window.d2State.get(`${this.basePath}.items`, []);
        const newItem = {
            id: Date.now(),
            label: 'NOVA CATEGORIA',
            icon: 'Pen Tool.png',
            link: ''
        };
        items.push(newItem);
        window.d2State.set(`${this.basePath}.items`, items);

        // Re-renderiza o editor
        document.dispatchEvent(new CustomEvent('d2:section-selected', {
            detail: { sectionId: 'categorias' }
        }));
    }

    /**
     * Remove uma categoria
     */
    removeCategory(index) {
        const items = window.d2State.get(`${this.basePath}.items`, []);
        items.splice(index, 1);
        window.d2State.set(`${this.basePath}.items`, items);

        // Re-renderiza o editor
        document.dispatchEvent(new CustomEvent('d2:section-selected', {
            detail: { sectionId: 'categorias' }
        }));
    }
}

// Exporta globalmente
window.D2CategoriasEditor = D2CategoriasEditor;

console.log('[D2 Categorias Editor] Module loaded');
