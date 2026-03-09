(function () {
    'use strict';

    /**
     * D1 Edit Panel
     * Navega entre 4 seções: Perfil, Aparência, Conteúdo, PWA/SEO
     */
    class D1EditPanel {
        constructor(containerElement) {
            this.container = containerElement;
            this.currentSection = null;

            // Editores disponíveis no D-1
            this.editors = {
                hero: () => new window.D1HeroEditor().render(),
                aparencia: () => new window.D1AparenciaEditor().render(),
                conteudo: () => new window.D1ConteudoEditor().render(),
                pwa: () => new window.D1PWAEditor().render()
            };

            // Títulos e ícones para cada seção
            this.sectionMeta = {
                hero: { title: 'Perfil', icon: 'fa-user-circle' },
                aparencia: { title: 'Aparência', icon: 'fa-palette' },
                conteudo: { title: 'Conteúdo', icon: 'fa-layer-group' },
                pwa: { title: 'PWA / Favicon / SEO', icon: 'fa-cog' }
            };

            this.bindEvents();
            this.render('hero');
        }

        bindEvents() {
            // Subscribe para mudanças no state (re-render on project switch)
            window.d1State.subscribe((change) => {
                if (change.path === '*' && this.currentSection) {
                    this.render(this.currentSection);
                }
            });

            // Escuta evento de seleção de seção
            document.addEventListener('d2:section-selected', (e) => {
                const sectionId = e.detail?.sectionId;
                if (sectionId && this.editors[sectionId]) {
                    this.render(sectionId);
                }
            });
        }

        render(sectionId) {
            this.currentSection = sectionId || 'hero';
            const meta = this.sectionMeta[this.currentSection] || this.sectionMeta.hero;

            this.container.innerHTML = `
            <div class="panel-header">
                <h2 class="panel-title"><i class="fas ${meta.icon}"></i> ${meta.title}</h2>
            </div>
            <div class="panel-content" id="panel-content-d1"></div>
        `;

            const contentContainer = this.container.querySelector('#panel-content-d1');
            const editorBuilder = this.editors[this.currentSection];

            if (editorBuilder) {
                const editorContent = editorBuilder();
                if (editorContent instanceof DocumentFragment || editorContent instanceof HTMLElement) {
                    contentContainer.appendChild(editorContent);
                }
            }
        }
    }

    window.D1EditPanel = D1EditPanel;
    console.log('[D1 Edit Panel] Module loaded');

})();