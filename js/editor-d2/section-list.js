/* ============================================
   EDITOR D2 - SECTION LIST
   Lista de seções com drag & drop
   ============================================ */

/**
 * D2 Section List Component
 * Gerencia a lista de seções do site (coluna 2)
 */
class D2SectionList {
    constructor(containerElement) {
        this.container = containerElement;
        this.draggedItem = null;

        this.render();
        this.bindEvents();
    }

    /**
     * Renderiza a lista de seções
     */
    render() {
        const sections = window.d2State.get('d2Sections', []);
        const selectedSection = window.d2State.get('selectedSection', 'hero');

        let html = '';

        sections.forEach((section, index) => {
            const isSelected = section.id === selectedSection;
            const isLocked = section.locked;
            const isDisabled = !section.enabled;

            html += `
                <div class="section-card ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''} ${isDisabled ? 'disabled' : ''}"
                     data-section-id="${section.id}"
                     data-index="${index}"
                     ${!isLocked ? 'draggable="true"' : ''}>
                    
                    ${!isLocked ? `<i class="fas fa-grip-vertical drag-handle"></i>` : ''}
                    
                    <div class="section-icon">
                        <i class="fas ${section.icon}"></i>
                    </div>
                    
                    <div class="section-info">
                        <div class="section-name">${section.name}</div>
                        <div class="section-status">${section.enabled ? 'Visível' : 'Oculto'}</div>
                    </div>
                    
                    ${isLocked ?
                    `<i class="fas fa-lock lock-icon" title="Seção fixa"></i>` :
                    `<div class="section-actions">
                            <button class="btn-section-action toggle" title="Alternar visibilidade">
                                <i class="fas ${section.enabled ? 'fa-eye' : 'fa-eye-slash'}"></i>
                            </button>
                            <button class="btn-section-action delete" title="Remover seção">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>`
                }
                </div>
            `;
        });

        this.container.innerHTML = html;
    }

    /**
     * Vincula os eventos de interação
     */
    bindEvents() {
        // Clique para selecionar seção
        this.container.addEventListener('click', (e) => {
            const card = e.target.closest('.section-card');
            if (!card) return;

            // Verifica se clicou em um botão de ação
            const actionBtn = e.target.closest('.btn-section-action');
            if (actionBtn) {
                e.stopPropagation();
                this.handleAction(actionBtn, card);
                return;
            }

            // Seleciona a seção
            const sectionId = card.dataset.sectionId;
            window.d2State.selectSection(sectionId);
            this.render();

            // Dispara evento para atualizar o painel de edição
            document.dispatchEvent(new CustomEvent('d2:section-selected', {
                detail: { sectionId }
            }));
        });

        // Drag & Drop
        this.container.addEventListener('dragstart', (e) => this.handleDragStart(e));
        this.container.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.container.addEventListener('dragenter', (e) => this.handleDragEnter(e));
        this.container.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.container.addEventListener('drop', (e) => this.handleDrop(e));
        this.container.addEventListener('dragend', (e) => this.handleDragEnd(e));

        // Subscribe para mudanças no state
        window.d2State.subscribe((change) => {
            if (change.path === 'd2Sections' || change.path === 'selectedSection' || change.path === '*') {
                this.render();
            }
        });
    }

    /**
     * Trata ações nos botões das seções
     */
    handleAction(button, card) {
        const sectionId = card.dataset.sectionId;

        if (button.classList.contains('toggle')) {
            // Toggle visibilidade
            window.d2State.toggleSectionVisibility(sectionId);
            this.render();
        } else if (button.classList.contains('delete')) {
            // Remover seção
            const sections = window.d2State.get('d2Sections', []);
            const section = sections.find(s => s.id === sectionId);
            if (section && confirm(`Deseja remover a seção "${section.name}"?`)) {
                window.d2State.removeSection(sectionId);
                this.render();

                // Dispara evento para atualizar o painel de edição
                document.dispatchEvent(new CustomEvent('d2:section-selected', {
                    detail: { sectionId: 'hero' }
                }));
            }
        }
    }

    /**
     * Drag Start
     */
    handleDragStart(e) {
        const card = e.target.closest('.section-card');
        if (!card || card.classList.contains('locked')) {
            e.preventDefault();
            return;
        }

        this.draggedItem = card;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.dataset.sectionId);
    }

    /**
     * Drag Over
     */
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    /**
     * Drag Enter
     */
    handleDragEnter(e) {
        const card = e.target.closest('.section-card');
        if (card && card !== this.draggedItem && !card.classList.contains('locked')) {
            card.classList.add('drag-over');
        }
    }

    /**
     * Drag Leave
     */
    handleDragLeave(e) {
        const card = e.target.closest('.section-card');
        if (card) {
            card.classList.remove('drag-over');
        }
    }

    /**
     * Drop
     */
    handleDrop(e) {
        e.preventDefault();

        const targetCard = e.target.closest('.section-card');
        if (!targetCard || targetCard === this.draggedItem || targetCard.classList.contains('locked')) {
            return;
        }

        const fromIndex = parseInt(this.draggedItem.dataset.index);
        const toIndex = parseInt(targetCard.dataset.index);

        // Não permite mover para posição de seções bloqueadas
        const sections = window.d2State.get('d2Sections', []);
        if (sections[toIndex].locked) return;

        window.d2State.reorderSections(fromIndex, toIndex);

        targetCard.classList.remove('drag-over');
    }

    /**
     * Drag End
     */
    handleDragEnd(e) {
        const card = e.target.closest('.section-card');
        if (card) {
            card.classList.remove('dragging');
        }

        // Remove drag-over de todos os cards
        this.container.querySelectorAll('.section-card').forEach(c => {
            c.classList.remove('drag-over');
        });

        this.draggedItem = null;
    }
}

// Exporta globalmente
window.D2SectionList = D2SectionList;

console.log('[D2 Section List] Module loaded');
