(function () {
    'use strict';

    /**
     * D1 Section List
     * Lista de seções clicáveis — Perfil + PWA/SEO
     */
    class D1SectionList {
        constructor(containerElement) {
            this.container = containerElement;
            this.render();

            // Re-render quando a seção selecionada mudar
            document.addEventListener('d2:section-selected', () => {
                this.render();
            });
        }

        render() {
            const sections = window.d1State.get('d2Sections', []);
            const selectedSection = window.d1State.get('selectedSection', 'hero');

            let html = '';
            sections.forEach((section) => {
                const isSelected = section.id === selectedSection;
                html += `
                <div class="section-card ${isSelected ? 'selected' : ''}"
                     data-section-id="${section.id}"
                     style="cursor:pointer;">
                    <div class="section-icon">
                        <i class="fas ${section.icon}"></i>
                    </div>
                    <div class="section-info">
                        <div class="section-name">${section.name}</div>
                        <div class="section-status">${section.id === 'hero' ? 'Seção principal' : 'Configurações'}</div>
                    </div>
                    <i class="fas fa-lock lock-icon" title="Seção fixa"></i>
                </div>
            `;
            });

            this.container.innerHTML = html;

            // Bind click events
            this.container.querySelectorAll('.section-card').forEach((card) => {
                card.addEventListener('click', () => {
                    const sectionId = card.dataset.sectionId;
                    window.d1State.set('selectedSection', sectionId);
                    document.dispatchEvent(new CustomEvent('d2:section-selected', {
                        detail: { sectionId }
                    }));
                });
            });
        }
    }

    window.D1SectionList = D1SectionList;
    console.log('[D1 Section List] Module loaded');

})();