/* ============================================
   EDITOR D2 - ADD SECTION MODAL
   Modal para adicionar novas seções
   ============================================ */

/**
 * D2 Add Section Modal Component
 * Gerencia o modal de adicionar seção
 */
class D2AddSectionModal {
    constructor() {
        this.modal = null;
        this.sectionTypes = [
            { id: 'categorias', name: 'Categorias', icon: 'fa-th-large', desc: 'Grade de ícones clicáveis' },
            { id: 'produtos', name: 'Produtos', icon: 'fa-shopping-bag', desc: 'Vitrine de produtos com preços' },
            { id: 'feedbacks', name: 'Feedbacks', icon: 'fa-comments', desc: 'Depoimentos de clientes' },
            { id: 'cta', name: 'CTA Secundário', icon: 'fa-bullhorn', desc: 'Banner de chamada para ação' }
        ];
    }

    /**
     * Mostra o modal
     */
    show() {
        // Remove modal existente se houver
        this.hide();

        // Cria o modal
        this.modal = document.createElement('div');
        this.modal.className = 'add-section-modal';
        this.modal.innerHTML = this.renderContent();

        document.body.appendChild(this.modal);

        // Bind eventos
        this.bindEvents();

        // Animação de entrada
        requestAnimationFrame(() => {
            this.modal.classList.add('visible');
        });
    }

    /**
     * Esconde o modal
     */
    hide() {
        if (this.modal) {
            this.modal.classList.remove('visible');
            setTimeout(() => {
                this.modal?.remove();
                this.modal = null;
            }, 200);
        }
    }

    /**
     * Renderiza o conteúdo do modal
     */
    renderContent() {
        const existingSections = window.d2State.get('d2Sections', []).map(s => s.id);

        const availableSections = this.sectionTypes.filter(type =>
            !existingSections.includes(type.id)
        );

        let optionsHtml = '';
        if (availableSections.length === 0) {
            optionsHtml = `
                <div class="no-sections-available">
                    <i class="fas fa-check-circle"></i>
                    <p>Todas as seções já foram adicionadas!</p>
                </div>
            `;
        } else {
            optionsHtml = availableSections.map(type => `
                <button class="section-option" data-section-type="${type.id}">
                    <div class="section-option-icon">
                        <i class="fas ${type.icon}"></i>
                    </div>
                    <div class="section-option-info">
                        <span class="section-option-name">${type.name}</span>
                        <span class="section-option-desc">${type.desc}</span>
                    </div>
                    <i class="fas fa-plus section-option-add"></i>
                </button>
            `).join('');
        }

        return `
            <div class="add-section-modal-backdrop"></div>
            <div class="add-section-modal-content">
                <div class="add-section-modal-header">
                    <h3><i class="fas fa-plus-circle"></i> Adicionar Seção</h3>
                    <button class="btn-close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="add-section-modal-body">
                    ${optionsHtml}
                </div>
            </div>
        `;
    }

    /**
     * Vincula eventos
     */
    bindEvents() {
        if (!this.modal) return;

        // Fechar ao clicar no backdrop
        this.modal.querySelector('.add-section-modal-backdrop').addEventListener('click', () => {
            this.hide();
        });

        // Fechar ao clicar no botão X
        this.modal.querySelector('.btn-close-modal').addEventListener('click', () => {
            this.hide();
        });

        // Fechar com ESC
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.hide();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Clique nas opções de seção
        this.modal.querySelectorAll('.section-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const sectionType = btn.dataset.sectionType;
                this.addSection(sectionType);
            });
        });
    }

    /**
     * Adiciona a seção selecionada
     */
    addSection(sectionType) {
        const newSection = window.d2State.addSection(sectionType);
        if (newSection) {
            // Seleciona a nova seção
            window.d2State.selectSection(newSection.id);

            // Dispara evento para atualizar UI
            document.dispatchEvent(new CustomEvent('d2:section-selected', {
                detail: { sectionId: newSection.id }
            }));
        }
        this.hide();
    }
}

// Exporta globalmente
window.D2AddSectionModal = D2AddSectionModal;

console.log('[D2 Add Section Modal] Module loaded');
