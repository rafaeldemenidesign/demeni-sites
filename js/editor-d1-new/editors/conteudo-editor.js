(function () {
    'use strict';

    // === LINK ICON PRESETS ===
    const LINK_ICONS = [
        { icon: 'fas fa-link', label: 'Link' },
        { icon: 'fab fa-whatsapp', label: 'WhatsApp' },
        { icon: 'fas fa-phone', label: 'Telefone' },
        { icon: 'fas fa-envelope', label: 'E-mail' },
        { icon: 'fas fa-map-marker-alt', label: 'Local' },
        { icon: 'fas fa-globe', label: 'Site' },
        { icon: 'fas fa-shopping-bag', label: 'Loja' },
        { icon: 'fas fa-store', label: 'Store' },
        { icon: 'fas fa-calendar-alt', label: 'Agenda' },
        { icon: 'fas fa-file-alt', label: 'Documento' },
        { icon: 'fas fa-headset', label: 'Suporte' },
        { icon: 'fas fa-users', label: 'Equipe' },
        { icon: 'fas fa-briefcase', label: 'Portfólio' },
        { icon: 'fas fa-camera', label: 'Fotos' },
        { icon: 'fas fa-video', label: 'Vídeo' },
        { icon: 'fas fa-music', label: 'Música' },
        { icon: 'fas fa-utensils', label: 'Comida' },
        { icon: 'fas fa-heart', label: 'Favorito' },
        { icon: 'fas fa-star', label: 'Destaque' },
        { icon: 'fas fa-bolt', label: 'Rápido' }
    ];

    // === SOCIAL PLATFORM PRESETS ===
    const SOCIAL_PLATFORMS = {
        instagram: { label: 'Instagram', icon: 'fab fa-instagram', baseUrl: 'https://instagram.com/', placeholder: '@usuario' },
        linkedin: { label: 'LinkedIn', icon: 'fab fa-linkedin-in', baseUrl: 'https://linkedin.com/in/', placeholder: 'usuario' },
        facebook: { label: 'Facebook', icon: 'fab fa-facebook-f', baseUrl: 'https://facebook.com/', placeholder: 'usuario' },
        tiktok: { label: 'TikTok', icon: 'fab fa-tiktok', baseUrl: 'https://tiktok.com/@', placeholder: '@usuario' },
        twitter: { label: 'X (Twitter)', icon: 'fab fa-x-twitter', baseUrl: 'https://x.com/', placeholder: '@usuario' },
        youtube: { label: 'YouTube', icon: 'fab fa-youtube', baseUrl: 'https://youtube.com/@', placeholder: '@canal' },
        whatsapp: { label: 'WhatsApp', icon: 'fab fa-whatsapp', baseUrl: 'https://wa.me/', placeholder: '5500000000000' },
        telegram: { label: 'Telegram', icon: 'fab fa-telegram-plane', baseUrl: 'https://t.me/', placeholder: 'usuario' },
        github: { label: 'GitHub', icon: 'fab fa-github', baseUrl: 'https://github.com/', placeholder: 'usuario' },
        spotify: { label: 'Spotify', icon: 'fab fa-spotify', baseUrl: 'https://open.spotify.com/user/', placeholder: 'id' },
        pinterest: { label: 'Pinterest', icon: 'fab fa-pinterest-p', baseUrl: 'https://pinterest.com/', placeholder: 'usuario' },
        custom: { label: 'Personalizado', icon: 'fas fa-link', baseUrl: '', placeholder: 'https://...' }
    };

    /**
     * D1 Conteúdo Editor
     * Botão CTA, links, redes sociais, card destaque, salvar contato, whatsapp
     * Usa D1Controls (estilo D-2 com GroupExpanders)
     */
    class D1ConteudoEditor {
        render() {
            const frag = document.createDocumentFragment();
            const C = window.D1Controls;
            const s = window.d1State;
            if (!C || !s) return frag;

            // ===== BOTÃO CTA =====
            frag.appendChild(C.createGroupExpander({ title: 'Botão CTA', icon: 'fa-bullhorn', expanded: true }, () => {
                const f = document.createDocumentFragment();
                f.appendChild(C.createToggle({ label: 'Ativar CTA', value: s.get('ctaButton.enabled', true), path: 'ctaButton.enabled' }));
                f.appendChild(C.createTextInput({ label: 'Texto do Botão', value: s.get('ctaButton.text', ''), placeholder: 'AGENDE UMA REUNIÃO', path: 'ctaButton.text' }));
                f.appendChild(C.createTextInput({ label: 'Link / URL', value: s.get('ctaButton.url', ''), placeholder: 'https://wa.me/5500000000000', path: 'ctaButton.url' }));
                f.appendChild(C.createSelect({
                    label: 'Estilo', options: [
                        { value: 'glass', label: 'Glass (vidro)' },
                        { value: 'border', label: 'Borda (vazado)' },
                        { value: 'solid', label: 'Sólido (cheio)' }
                    ], value: s.get('ctaButton.style', 'glass'), path: 'ctaButton.style'
                }));
                f.appendChild(C.createSlider({ label: 'Tamanho da Fonte', value: s.get('ctaButton.fontSize', 12), min: 8, max: 24, step: 1, unit: 'px', path: 'ctaButton.fontSize' }));
                f.appendChild(C.createColorPicker({ label: 'Cor do Texto', value: s.get('ctaButton.color', '#ffffff'), path: 'ctaButton.color' }));
                f.appendChild(C.createColorPicker({ label: 'Cor de Fundo', value: s.get('ctaButton.bgColor', '#7B2FF7'), path: 'ctaButton.bgColor' }));
                return f;
            }));

            // ===== LINKS DE CONTATO =====
            frag.appendChild(C.createGroupExpander({ title: 'Links de Contato', icon: 'fa-th-large', expanded: false }, () => {
                const f = document.createDocumentFragment();

                // Configuração de layout
                f.appendChild(C.createSelect({
                    label: 'Layout', options: [
                        { value: 'grid', label: 'Grid (2 colunas)' },
                        { value: 'list', label: 'Lista (1 coluna)' }
                    ], value: s.get('linksLayout', 'grid'), path: 'linksLayout'
                }));
                f.appendChild(C.createSelect({
                    label: 'Estilo dos Botões', options: [
                        { value: 'border', label: 'Borda (vazado)' },
                        { value: 'solid', label: 'Sólido (cheio)' },
                        { value: 'glass', label: 'Glass (vidro)' }
                    ], value: s.get('linksStyle', 'border'), path: 'linksStyle'
                }));
                f.appendChild(C.createSlider({ label: 'Tamanho do Ícone', value: s.get('linksIconSize', 20), min: 12, max: 36, step: 1, unit: 'px', path: 'linksIconSize' }));
                f.appendChild(C.createSlider({ label: 'Tamanho do Texto', value: s.get('linksLabelSize', 10), min: 8, max: 18, step: 1, unit: 'px', path: 'linksLabelSize' }));
                f.appendChild(C.createColorPicker({ label: 'Cor do Texto', value: s.get('linksLabelColor', '#ffffff'), path: 'linksLabelColor' }));

                // Lista de links individuais
                const links = s.get('links', []);
                const container = document.createElement('div');
                container.style.cssText = 'margin-top:12px;';

                links.forEach((link, idx) => {
                    const card = document.createElement('div');
                    card.style.cssText = 'background:var(--d2-group-content-bg, #f8f8f8);border:1px solid var(--d2-border, #e0e0e0);border-radius:8px;padding:12px;margin-bottom:8px;';

                    // Card header
                    const header = document.createElement('div');
                    header.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;';
                    header.innerHTML = `
                        <i class="${link.icon}" style="color:${link.iconColor || '#7B2FF7'};font-size:16px;"></i>
                        <span style="color:var(--d2-text, #333);font-size:13px;font-weight:500;flex:1;">${link.label}</span>
                        <button data-del="${idx}" style="background:none;border:none;color:#e53e3e;cursor:pointer;font-size:12px;padding:4px;"><i class="fas fa-trash"></i></button>
                    `;
                    card.appendChild(header);

                    // Icon picker grid
                    card.appendChild(this._createIconPicker(link.icon || 'fas fa-link', v => {
                        const l = s.get('links', []); l[idx].icon = v; s.set('links', l);
                    }));

                    // Icon color
                    const iconColorPicker = C.createColorPicker({ label: 'Cor do Ícone', value: link.iconColor || '#7B2FF7', path: null });
                    const iconColorInput = iconColorPicker.querySelector('input[type="color"]');
                    const iconHexInput = iconColorPicker.querySelector('.color-hex-input');
                    if (iconColorInput) {
                        iconColorInput.addEventListener('input', (e) => {
                            const l = s.get('links', []); l[idx].iconColor = e.target.value; s.set('links', l);
                        });
                    }
                    if (iconHexInput) {
                        iconHexInput.addEventListener('input', (e) => {
                            const l = s.get('links', []); l[idx].iconColor = e.target.value; s.set('links', l);
                        });
                    }
                    card.appendChild(iconColorPicker);

                    // Label input
                    const labelInput = C.createTextInput({ label: 'Label', value: link.label, placeholder: 'WhatsApp', path: null });
                    labelInput.querySelector('input')?.addEventListener('input', (e) => {
                        const l = s.get('links', []); l[idx].label = e.target.value; s.set('links', l);
                    });
                    card.appendChild(labelInput);

                    // URL input
                    const urlInput = C.createTextInput({ label: 'URL', value: link.url, placeholder: 'https://...', path: null });
                    urlInput.querySelector('input')?.addEventListener('input', (e) => {
                        const l = s.get('links', []); l[idx].url = e.target.value; s.set('links', l);
                    });
                    card.appendChild(urlInput);

                    // Delete handler
                    card.querySelector(`[data-del="${idx}"]`).addEventListener('click', () => {
                        const l = s.get('links', []); l.splice(idx, 1); s.set('links', l);
                        document.dispatchEvent(new CustomEvent('d2:section-selected', { detail: { sectionId: 'conteudo' } }));
                    });

                    container.appendChild(card);
                });

                // Add button
                const addBtn = document.createElement('button');
                addBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Link';
                addBtn.style.cssText = 'display:flex;align-items:center;gap:8px;width:100%;padding:10px;background:transparent;border:1px dashed var(--d2-border, #ccc);border-radius:8px;color:#7B2FF7;font-size:13px;cursor:pointer;justify-content:center;font-family:inherit;';
                addBtn.addEventListener('click', () => {
                    const l = s.get('links', []);
                    l.push({ id: Date.now(), label: 'Novo Link', url: '', icon: 'fas fa-link', iconColor: '#7B2FF7' });
                    s.set('links', l);
                    document.dispatchEvent(new CustomEvent('d2:section-selected', { detail: { sectionId: 'conteudo' } }));
                });
                container.appendChild(addBtn);
                f.appendChild(container);
                return f;
            }));

            // ===== REDES SOCIAIS =====
            frag.appendChild(C.createGroupExpander({ title: 'Redes Sociais', icon: 'fa-share-alt', expanded: false }, () => {
                const f = document.createDocumentFragment();
                const socials = s.get('socialLinks', []);
                const container = document.createElement('div');

                socials.forEach((social, idx) => {
                    const platform = SOCIAL_PLATFORMS[social.platform] || SOCIAL_PLATFORMS.custom;
                    const card = document.createElement('div');
                    card.style.cssText = 'background:var(--d2-group-content-bg, #f8f8f8);border:1px solid var(--d2-border, #e0e0e0);border-radius:8px;padding:12px;margin-bottom:8px;';

                    // Plataforma select
                    const platSelect = C.createSelect({ label: 'Plataforma', options: Object.entries(SOCIAL_PLATFORMS).map(([k, v]) => ({ value: k, label: v.label })), value: social.platform, path: null });
                    platSelect.querySelector('select')?.addEventListener('change', (e) => {
                        const sl = s.get('socialLinks', []); sl[idx].platform = e.target.value; s.set('socialLinks', sl);
                    });
                    card.appendChild(platSelect);

                    // Username
                    const userInput = C.createTextInput({ label: 'Usuário / Número', value: social.username, placeholder: platform.placeholder, path: null });
                    userInput.querySelector('input')?.addEventListener('input', (e) => {
                        const sl = s.get('socialLinks', []); sl[idx].username = e.target.value; s.set('socialLinks', sl);
                    });
                    card.appendChild(userInput);

                    // Custom URL
                    const urlInput = C.createTextInput({ label: 'URL Personalizada (opcional)', value: social.customUrl, placeholder: 'Deixe vazio para gerar automaticamente', path: null });
                    urlInput.querySelector('input')?.addEventListener('input', (e) => {
                        const sl = s.get('socialLinks', []); sl[idx].customUrl = e.target.value; s.set('socialLinks', sl);
                    });
                    card.appendChild(urlInput);

                    // Delete
                    const delBtn = document.createElement('button');
                    delBtn.innerHTML = '<i class="fas fa-trash"></i> Remover';
                    delBtn.style.cssText = 'display:block;margin:8px auto 0;background:rgba(229,62,62,0.08);color:#e53e3e;border:1px solid rgba(229,62,62,0.2);border-radius:6px;padding:6px 14px;font-size:12px;cursor:pointer;font-family:inherit;';
                    delBtn.addEventListener('click', () => {
                        const sl = s.get('socialLinks', []); sl.splice(idx, 1); s.set('socialLinks', sl);
                        document.dispatchEvent(new CustomEvent('d2:section-selected', { detail: { sectionId: 'conteudo' } }));
                    });
                    card.appendChild(delBtn);
                    container.appendChild(card);
                });

                // Add social
                const addBtn = document.createElement('button');
                addBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Rede';
                addBtn.style.cssText = 'display:flex;align-items:center;gap:8px;width:100%;padding:10px;background:transparent;border:1px dashed var(--d2-border, #ccc);border-radius:8px;color:#7B2FF7;font-size:13px;cursor:pointer;justify-content:center;font-family:inherit;';
                addBtn.addEventListener('click', () => {
                    const sl = s.get('socialLinks', []);
                    sl.push({ id: Date.now(), platform: 'instagram', username: '', customUrl: '', customIcon: null });
                    s.set('socialLinks', sl);
                    document.dispatchEvent(new CustomEvent('d2:section-selected', { detail: { sectionId: 'conteudo' } }));
                });
                container.appendChild(addBtn);
                f.appendChild(container);
                return f;
            }));

            // ===== CARD DESTAQUE =====
            frag.appendChild(C.createGroupExpander({ title: 'Card Destaque', icon: 'fa-star', expanded: false }, () => {
                const f = document.createDocumentFragment();
                f.appendChild(C.createToggle({ label: 'Ativar Card', value: s.get('featuredCard.enabled', true), path: 'featuredCard.enabled' }));
                f.appendChild(C.createImagePicker({ label: 'Imagem do Card', value: s.get('featuredCard.image'), path: 'featuredCard.image' }));
                f.appendChild(C.createSlider({ label: 'Zoom da Imagem', value: s.get('featuredCard.imageZoom', 100), min: 100, max: 300, step: 1, unit: '%', path: 'featuredCard.imageZoom' }));
                f.appendChild(C.createSlider({ label: 'Posição X', value: s.get('featuredCard.imagePosX', 50), min: 0, max: 100, step: 1, unit: '%', path: 'featuredCard.imagePosX' }));
                f.appendChild(C.createSlider({ label: 'Posição Y', value: s.get('featuredCard.imagePosY', 50), min: 0, max: 100, step: 1, unit: '%', path: 'featuredCard.imagePosY' }));
                f.appendChild(C.createTextInput({ label: 'Título', value: s.get('featuredCard.title', ''), placeholder: 'Destaque', path: 'featuredCard.title' }));
                f.appendChild(C.createSlider({ label: 'Tamanho do Título', value: s.get('featuredCard.titleSize', 14), min: 10, max: 28, step: 1, unit: 'px', path: 'featuredCard.titleSize' }));
                f.appendChild(C.createColorPicker({ label: 'Cor do Título', value: s.get('featuredCard.titleColor', '#ffffff'), path: 'featuredCard.titleColor' }));
                f.appendChild(C.createTextInput({ label: 'Subtítulo', value: s.get('featuredCard.subtitle', ''), placeholder: 'Descrição', path: 'featuredCard.subtitle' }));
                f.appendChild(C.createSlider({ label: 'Tamanho do Subtítulo', value: s.get('featuredCard.subtitleSize', 11), min: 8, max: 20, step: 1, unit: 'px', path: 'featuredCard.subtitleSize' }));
                f.appendChild(C.createColorPicker({ label: 'Cor do Subtítulo', value: s.get('featuredCard.subtitleColor', 'rgba(255,255,255,0.7)'), path: 'featuredCard.subtitleColor' }));
                f.appendChild(C.createTextInput({ label: 'Texto do Botão', value: s.get('featuredCard.buttonText', ''), placeholder: 'Saiba Mais', path: 'featuredCard.buttonText' }));
                f.appendChild(C.createTextInput({ label: 'Link do Botão', value: s.get('featuredCard.buttonUrl', ''), placeholder: 'https://...', path: 'featuredCard.buttonUrl' }));
                f.appendChild(C.createSlider({ label: 'Intensidade do Gradiente', value: s.get('featuredCard.gradientIntensity', 80), min: 0, max: 100, step: 1, unit: '%', path: 'featuredCard.gradientIntensity' }));
                return f;
            }));

            // ===== SALVAR CONTATO =====
            frag.appendChild(C.createGroupExpander({ title: 'Salvar Contato', icon: 'fa-address-card', expanded: false }, () => {
                const f = document.createDocumentFragment();
                f.appendChild(C.createToggle({ label: 'Ativar Botão', value: s.get('saveContact.enabled', true), path: 'saveContact.enabled' }));
                f.appendChild(C.createTextInput({ label: 'Texto do Botão', value: s.get('saveContact.buttonText', ''), placeholder: 'SALVAR NA AGENDA', path: 'saveContact.buttonText' }));
                f.appendChild(C.createSlider({ label: 'Tamanho da Fonte', value: s.get('saveContact.fontSize', 12), min: 8, max: 20, step: 1, unit: 'px', path: 'saveContact.fontSize' }));
                f.appendChild(C.createTextInput({ label: 'Nome Completo', value: s.get('saveContact.fullName', ''), placeholder: 'João da Silva', path: 'saveContact.fullName' }));
                f.appendChild(C.createTextInput({ label: 'Telefone', value: s.get('saveContact.phone', ''), placeholder: '+55 00 00000-0000', path: 'saveContact.phone' }));
                f.appendChild(C.createTextInput({ label: 'E-mail', value: s.get('saveContact.email', ''), placeholder: 'email@exemplo.com', path: 'saveContact.email' }));
                f.appendChild(C.createTextInput({ label: 'Empresa', value: s.get('saveContact.company', ''), placeholder: 'Nome da empresa', path: 'saveContact.company' }));
                f.appendChild(C.createTextInput({ label: 'Cargo', value: s.get('saveContact.role', ''), placeholder: 'Gerente de Operações', path: 'saveContact.role' }));
                return f;
            }));

            // ===== WHATSAPP FLUTUANTE =====
            frag.appendChild(C.createGroupExpander({ title: 'WhatsApp Flutuante', icon: 'fa-comment-dots', expanded: false }, () => {
                const f = document.createDocumentFragment();
                f.appendChild(C.createToggle({ label: 'Ativar Bubble', value: s.get('whatsappFloat.enabled', false), path: 'whatsappFloat.enabled' }));
                f.appendChild(C.createTextInput({ label: 'Número WhatsApp', value: s.get('whatsappFloat.phone', ''), placeholder: '5500000000000', path: 'whatsappFloat.phone' }));
                f.appendChild(C.createTextInput({ label: 'Mensagem Padrão', value: s.get('whatsappFloat.message', ''), placeholder: 'Olá! Vi seu site...', path: 'whatsappFloat.message' }));
                f.appendChild(C.createToggle({ label: 'Mostrar Texto ao Lado', value: s.get('whatsappFloat.showBubbleText', true), path: 'whatsappFloat.showBubbleText' }));
                f.appendChild(C.createTextInput({ label: 'Texto da Bubble', value: s.get('whatsappFloat.bubbleText', ''), placeholder: 'Fale Comigo Agora!', path: 'whatsappFloat.bubbleText' }));
                return f;
            }));

            return frag;
        }

        /**
         * Icon picker — collapsed by default (shows current icon + "Trocar" button)
         */
        _createIconPicker(currentIcon, onChange) {
            const w = document.createElement('div');
            w.style.cssText = 'margin-bottom:12px;';
            const lbl = document.createElement('label');
            lbl.style.cssText = 'font-size:12px;color:var(--d2-text-muted, #888);margin-bottom:8px;display:block;';
            lbl.textContent = 'Ícone';
            w.appendChild(lbl);

            // Current icon display + toggle button
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;';
            const preview = document.createElement('span');
            preview.style.cssText = 'width:36px;height:36px;border-radius:8px;border:2px solid #7B2FF7;background:rgba(123,47,247,0.1);color:#7B2FF7;display:flex;align-items:center;justify-content:center;font-size:16px;';
            preview.innerHTML = `<i class="${currentIcon}"></i>`;
            const toggleBtn = document.createElement('button');
            toggleBtn.style.cssText = 'padding:4px 12px;border-radius:6px;border:1px solid var(--d2-border, #ddd);background:var(--d2-group-content-bg, #fff);color:var(--d2-text-muted, #888);cursor:pointer;font-size:12px;transition:0.2s;';
            toggleBtn.textContent = 'Trocar ícone';
            row.appendChild(preview);
            row.appendChild(toggleBtn);
            w.appendChild(row);

            // Collapsible grid (hidden by default)
            const grid = document.createElement('div');
            grid.style.cssText = 'display:none;grid-template-columns:repeat(6,1fr);gap:4px;';
            LINK_ICONS.forEach(item => {
                const btn = document.createElement('button');
                const isActive = item.icon === currentIcon;
                btn.style.cssText = `width:100%;aspect-ratio:1;border-radius:8px;border:1px solid ${isActive ? '#7B2FF7' : 'var(--d2-border, #ddd)'};background:${isActive ? 'rgba(123,47,247,0.1)' : 'var(--d2-group-content-bg, #fff)'};color:${isActive ? '#7B2FF7' : 'var(--d2-text-muted, #888)'};cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;transition:0.2s;`;
                btn.innerHTML = `<i class="${item.icon}"></i>`;
                btn.title = item.label;
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    grid.querySelectorAll('button').forEach(b => {
                        b.style.borderColor = 'var(--d2-border, #ddd)';
                        b.style.background = 'var(--d2-group-content-bg, #fff)';
                        b.style.color = 'var(--d2-text-muted, #888)';
                    });
                    btn.style.borderColor = '#7B2FF7';
                    btn.style.background = 'rgba(123,47,247,0.1)';
                    btn.style.color = '#7B2FF7';
                    preview.innerHTML = `<i class="${item.icon}"></i>`;
                    grid.style.display = 'none';
                    toggleBtn.textContent = 'Trocar ícone';
                    onChange(item.icon);
                });
                grid.appendChild(btn);
            });
            w.appendChild(grid);

            // Toggle grid visibility
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const open = grid.style.display === 'none';
                grid.style.display = open ? 'grid' : 'none';
                toggleBtn.textContent = open ? 'Fechar' : 'Trocar ícone';
            });

            return w;
        }
    }

    window.D1ConteudoEditor = D1ConteudoEditor;
    console.log('[D1 Conteúdo Editor] Module loaded');
})();
