(function () {
    'use strict';

    // === SOCIAL PLATFORMS (mirror from hero-editor) ===
    const PLATFORMS = {
        instagram: { icon: 'fab fa-instagram', baseUrl: 'https://instagram.com/' },
        linkedin: { icon: 'fab fa-linkedin-in', baseUrl: 'https://linkedin.com/in/' },
        facebook: { icon: 'fab fa-facebook-f', baseUrl: 'https://facebook.com/' },
        tiktok: { icon: 'fab fa-tiktok', baseUrl: 'https://tiktok.com/@' },
        twitter: { icon: 'fab fa-x-twitter', baseUrl: 'https://x.com/' },
        youtube: { icon: 'fab fa-youtube', baseUrl: 'https://youtube.com/@' },
        whatsapp: { icon: 'fab fa-whatsapp', baseUrl: 'https://wa.me/' },
        telegram: { icon: 'fab fa-telegram-plane', baseUrl: 'https://t.me/' },
        github: { icon: 'fab fa-github', baseUrl: 'https://github.com/' },
        spotify: { icon: 'fab fa-spotify', baseUrl: 'https://open.spotify.com/user/' },
        pinterest: { icon: 'fab fa-pinterest-p', baseUrl: 'https://pinterest.com/' },
        custom: { icon: 'fas fa-link', baseUrl: '' }
    };

    function getSocialUrl(social) {
        const p = PLATFORMS[social.platform] || PLATFORMS.custom;
        if (social.customUrl) return social.customUrl;
        return p.baseUrl + (social.username || '');
    }

    /**
     * D1 Preview Renderer — Completo
     * Renderiza: BG (3 modos) + fade + overlay + avatar + textos + CTA + links + sociais + card + salvar + whatsapp + footer
     */
    function renderPreviewD1New(container, state) {
        if (!container || !state) return;

        const profile = state.profile || {};
        const adj = state?.d2Adjustments?.hero || {};

        // === BG ===
        const bgImage = adj.bgImage;
        const bgColor = adj.bgColor || '#1a1a2e';
        const bgFitMode = adj.bgFitMode || 'fill';
        const bgZoom = adj.bgImageZoom || 100;
        const bgPosX = adj.bgImagePosX ?? 50;
        const bgPosY = adj.bgImagePosY ?? 50;
        const bgBlur = adj.bgBlur ?? 0;
        const bgFadeEnabled = adj.bgFadeEnabled ?? false;
        const bgFadeSide = adj.bgFadeSide || 'bottom';
        const bgFadeIntensity = adj.bgFadeIntensity ?? 50;
        const bgFadePosition = adj.bgFadePosition ?? 60;
        const bgFadeSmoothness = adj.bgFadeSmoothness ?? 50;
        const overlay = adj.overlay || {};
        const overlayEnabled = overlay.enabled ?? false;
        const overlayColor = overlay.color || '#000000';
        const overlayOpacity = overlay.opacity ?? 70;

        // === Profile ===
        const avatar = profile.avatar;
        const name = profile.name || 'Meu Negócio';
        const subtitle = profile.subtitle || '';
        const description = profile.description || '';
        const descEnabled = profile.descriptionEnabled !== false; // default true
        const ns = profile.nameStyle || {};
        const ss = profile.subtitleStyle || {};
        const ds = profile.descriptionStyle || {};
        const avatarSize = profile.avatarSize || 120;
        const avatarBorder = profile.avatarBorder || 3;
        const avatarBorderColor = profile.avatarBorderColor || '#ffffff';
        const avatarZoom = profile.avatarZoom ?? 100;
        const avatarPosX = profile.avatarPosX ?? 50;
        const avatarPosY = profile.avatarPosY ?? 50;

        // === Spacing ===
        const spacing = state.spacing || {};
        const topPadding = spacing.topPadding ?? 40;
        const afterAvatar = spacing.afterAvatar ?? 16;
        const afterName = spacing.afterName ?? 6;
        const afterSubtitle = spacing.afterSubtitle ?? 10;
        const afterDescription = spacing.afterDescription ?? 20;
        const sectionGap = spacing.sectionGap ?? 20;
        const contentPadding = spacing.contentPadding ?? 16;
        const bottomPadding = spacing.bottomPadding ?? 24;

        // === Other blocks ===
        const ctaButton = state.ctaButton || {};
        const links = state.links || [];
        const linksLayout = state.linksLayout || 'grid';
        const linksStyle = state.linksStyle || 'border';
        const linksIconSize = state.linksIconSize ?? 20;
        const linksLabelSize = state.linksLabelSize ?? 10;
        const linksLabelColor = state.linksLabelColor || '#ffffff';
        const socialLinks = state.socialLinks || [];
        const featuredCard = state.featuredCard || {};
        const saveContact = state.saveContact || {};
        const whatsappFloat = state.whatsappFloat || {};
        const footer = state.footer || {};
        const fontFamily = state.fontFamily || 'Montserrat';

        // ===== BUILD =====
        let html = '';

        // --- BG layer (with mode support) ---
        let bgStyle = `position:absolute;top:0;left:0;right:0;bottom:0;z-index:0;background-color:${bgColor};`;
        if (bgImage) {
            if (bgFitMode === 'fill') {
                bgStyle += `background-image:url('${bgImage}');background-size:cover;background-position:${bgPosX}% ${bgPosY}%;background-repeat:no-repeat;`;
            } else if (bgFitMode === 'stretch') {
                bgStyle += `background-image:url('${bgImage}');background-size:100% 100%;background-position:center;background-repeat:no-repeat;`;
            } else {
                // custom mode
                bgStyle += `background-image:url('${bgImage}');background-size:${bgZoom}%;background-position:${bgPosX}% ${bgPosY}%;background-repeat:no-repeat;`;
            }
        }
        // --- Apply fade mask directly on BG layer (makes the image itself dissolve) ---
        if (bgImage && bgFadeEnabled) {
            const start = 100 - bgFadePosition;
            const edgeOpacity = 1 - (bgFadeIntensity / 100);
            // Fade length: 5% (sharp) to 90% (very gradual), controlled by Suavidade
            const fadeLength = 5 + (bgFadeSmoothness / 100) * 85;
            const end = Math.min(100, start + fadeLength);
            const mid = start + (end - start) * 0.5;
            const midOp = (1 + edgeOpacity) / 2;

            let mask;
            if (bgFadeSide === 'bottom') {
                mask = `linear-gradient(to bottom, black 0%, black ${start}%, rgba(0,0,0,${midOp.toFixed(2)}) ${mid.toFixed(1)}%, rgba(0,0,0,${edgeOpacity}) ${end.toFixed(1)}%, rgba(0,0,0,${edgeOpacity}) 100%)`;
            } else if (bgFadeSide === 'top') {
                mask = `linear-gradient(to top, black 0%, black ${start}%, rgba(0,0,0,${midOp.toFixed(2)}) ${mid.toFixed(1)}%, rgba(0,0,0,${edgeOpacity}) ${end.toFixed(1)}%, rgba(0,0,0,${edgeOpacity}) 100%)`;
            } else if (bgFadeSide === 'both') {
                const h = Math.round(start / 2);
                mask = `linear-gradient(to bottom, rgba(0,0,0,${edgeOpacity}) 0%, black ${h}%, black ${100 - h}%, rgba(0,0,0,${edgeOpacity}) 100%)`;
            } else {
                mask = `radial-gradient(ellipse at center, black ${start}%, rgba(0,0,0,${edgeOpacity}) ${end.toFixed(1)}%)`;
            }
            bgStyle += `-webkit-mask-image:${mask};mask-image:${mask};`;
        }
        if (bgBlur > 0) {
            bgStyle += `filter:blur(${bgBlur}px);transform:scale(1.05);`;
        }
        html += `<div style="${bgStyle}"></div>`;

        // --- Color overlay (only when enabled via toggle) ---
        if (overlayEnabled && overlayOpacity > 0) {
            const r = parseInt(overlayColor.slice(1, 3), 16);
            const g = parseInt(overlayColor.slice(3, 5), 16);
            const b = parseInt(overlayColor.slice(5, 7), 16);
            html += `<div style="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(${r},${g},${b},${overlayOpacity / 100});z-index:1;pointer-events:none;"></div>`;
        }

        // --- Content ---
        html += `<div style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;min-height:100%;padding:${topPadding}px ${contentPadding}px ${bottomPadding}px;box-sizing:border-box;font-family:'${fontFamily}',sans-serif;gap:${sectionGap}px;">`;

        // --- Avatar ---
        const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        if (avatar) {
            html += `<div style="width:${avatarSize}px;height:${avatarSize}px;border-radius:50%;border:${avatarBorder}px solid ${avatarBorderColor};overflow:hidden;margin:0 auto ${afterAvatar}px;box-shadow:0 4px 20px rgba(0,0,0,0.3);background-image:url('${avatar}');background-size:${avatarZoom}%;background-position:${avatarPosX}% ${avatarPosY}%;background-repeat:no-repeat;background-color:#2a2a3a;"></div>`;
        } else {
            html += `<div style="width:${avatarSize}px;height:${avatarSize}px;border-radius:50%;border:${avatarBorder}px solid ${avatarBorderColor};background:linear-gradient(135deg,#5167E7,#7B2FF7);display:flex;align-items:center;justify-content:center;margin:0 auto ${afterAvatar}px;box-shadow:0 4px 20px rgba(0,0,0,0.3);">
                <span style="font-size:${Math.round(avatarSize * 0.35)}px;font-weight:700;color:#fff;font-family:'${fontFamily}',sans-serif;">${initials}</span></div>`;
        }

        // --- Name ---
        html += `<h1 style="font-size:${ns.size || 28}px;font-weight:${ns.weight || 700};color:${ns.color || '#fff'};margin:0 0 ${afterName}px;text-align:center;line-height:1.2;font-family:'${fontFamily}',sans-serif;">${name}</h1>`;

        // --- Subtitle ---
        if (subtitle) {
            html += `<p style="font-size:${ss.size || 16}px;font-weight:${ss.weight || 400};color:${ss.color || 'rgba(255,255,255,0.85)'};margin:0 0 ${afterSubtitle}px;text-align:center;line-height:1.3;letter-spacing:1px;text-transform:uppercase;font-family:'${fontFamily}',sans-serif;">${subtitle}</p>`;
        }

        // --- Description (conditional) ---
        if (descEnabled && description) {
            html += `<p style="font-size:${ds.size || 14}px;font-weight:${ds.weight || 300};color:${ds.color || 'rgba(255,255,255,0.7)'};margin:0 0 ${afterDescription}px;text-align:center;line-height:1.5;max-width:300px;font-family:'${fontFamily}',sans-serif;">${description}</p>`;
        }

        // --- CTA Button ---
        if (ctaButton.enabled !== false && ctaButton.text) {
            let ctaStyle = `display:flex;align-items:center;justify-content:space-between;width:100%;max-width:300px;padding:14px 20px;border-radius:10px;text-decoration:none;font-size:${ctaButton.fontSize || 12}px;font-weight:600;letter-spacing:1px;text-transform:uppercase;box-sizing:border-box;cursor:pointer;transition:0.2s;`;
            const ctaColor = ctaButton.color || '#fff';
            const ctaBgColor = ctaButton.bgColor || '#7B2FF7';
            if (ctaButton.style === 'solid') {
                ctaStyle += `background:${ctaBgColor};color:${ctaColor};border:none;`;
            } else if (ctaButton.style === 'glass') {
                ctaStyle += `background:rgba(255,255,255,0.08);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:${ctaColor};border:1px solid rgba(255,255,255,0.15);`;
            } else {
                ctaStyle += `background:transparent;color:${ctaColor};border:1px solid rgba(255,255,255,0.3);`;
            }
            html += `<a href="${ctaButton.url || '#'}" target="_blank" style="${ctaStyle}">
                <span>${ctaButton.text}</span><i class="fas fa-chevron-right" style="font-size:10px;opacity:0.6;"></i></a>`;
        }

        // --- Featured Card ---
        if (featuredCard.enabled !== false && (featuredCard.title || featuredCard.image)) {
            const gi = featuredCard.gradientIntensity ?? 80;
            const fcTitleSize = featuredCard.titleSize || 14;
            const fcTitleColor = featuredCard.titleColor || '#fff';
            const fcSubSize = featuredCard.subtitleSize || 11;
            const fcSubColor = featuredCard.subtitleColor || 'rgba(255,255,255,0.7)';
            const fcZoom = featuredCard.imageZoom ?? 100;
            const fcPosX = featuredCard.imagePosX ?? 50;
            const fcPosY = featuredCard.imagePosY ?? 50;
            html += `<div style="width:100%;max-width:300px;border-radius:14px;overflow:hidden;position:relative;min-height:140px;${featuredCard.image ? `background-image:url('${featuredCard.image}');background-size:${fcZoom}%;background-position:${fcPosX}% ${fcPosY}%;background-repeat:no-repeat;background-color:#2a2a3a;` : 'background:#2a2a3a;'}">
                <div style="position:absolute;bottom:0;left:0;right:0;padding:16px;background:linear-gradient(to top,rgba(0,0,0,${gi / 100}) 0%,transparent 100%);">
                    ${featuredCard.title ? `<h3 style="color:${fcTitleColor};font-size:${fcTitleSize}px;font-weight:700;margin:0 0 4px;">${featuredCard.title}</h3>` : ''}
                    ${featuredCard.subtitle ? `<p style="color:${fcSubColor};font-size:${fcSubSize}px;margin:0 0 8px;line-height:1.4;">${featuredCard.subtitle}</p>` : ''}
                    ${featuredCard.buttonText ? `<a href="${featuredCard.buttonUrl || '#'}" target="_blank" style="color:#FFD700;font-size:11px;font-weight:600;text-decoration:none;display:flex;align-items:center;gap:6px;">${featuredCard.buttonText} <i class="fas fa-arrow-right" style="font-size:10px;"></i></a>` : ''}
                </div>
            </div>`;
        }

        // --- Links Grid/List ---
        if (links.length > 0) {
            const isGrid = linksLayout === 'grid';
            html += `<div style="width:100%;max-width:300px;display:${isGrid ? 'grid' : 'flex'};${isGrid ? 'grid-template-columns:1fr 1fr;' : 'flex-direction:column;'}gap:8px;">`;
            links.forEach(link => {
                let btnStyle = `display:flex;${isGrid ? 'flex-direction:column;align-items:center;justify-content:center;min-height:90px;' : 'flex-direction:row;align-items:center;justify-content:flex-start;'}gap:${isGrid ? '10' : '12'}px;padding:${isGrid ? '20px 8px' : '14px 16px'};border-radius:10px;text-decoration:none;cursor:pointer;transition:0.2s;`;
                if (linksStyle === 'solid') {
                    btnStyle += 'background:rgba(255,255,255,0.12);color:#fff;border:none;';
                } else if (linksStyle === 'glass') {
                    btnStyle += 'background:rgba(255,255,255,0.06);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:#fff;border:1px solid rgba(255,255,255,0.1);';
                } else {
                    btnStyle += 'background:transparent;color:#fff;border:1px solid rgba(255,255,255,0.2);';
                }
                html += `<a href="${link.url || '#'}" target="_blank" style="${btnStyle}">
                    <i class="${link.icon}" style="font-size:${linksIconSize}px;color:${link.iconColor || '#fff'};"></i>
                    ${link.label ? `<span style="font-size:${linksLabelSize}px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;color:${linksLabelColor};">${link.label}</span>` : ''}
                </a>`;
            });
            html += `</div>`;
        }

        // --- Social Links ---
        if (socialLinks.length > 0) {
            html += `<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">`;
            socialLinks.forEach(social => {
                const p = PLATFORMS[social.platform] || PLATFORMS.custom;
                const url = getSocialUrl(social);
                const icon = social.customIcon || p.icon;
                html += `<a href="${url}" target="_blank" style="width:50px;height:50px;border-radius:10px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;text-decoration:none;color:#fff;font-size:18px;transition:0.2s;">
                    <i class="${icon}"></i></a>`;
            });
            html += `</div>`;
        }

        // --- Save Contact Button ---
        if (saveContact.enabled !== false && saveContact.buttonText) {
            const scFontSize = saveContact.fontSize || 12;
            html += `<button onclick="window._d1SaveVCard && window._d1SaveVCard()" style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;max-width:300px;padding:14px 20px;border-radius:10px;border:none;background:linear-gradient(135deg,#DAA520,#FFD700);color:#000;font-size:${scFontSize}px;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer;box-sizing:border-box;">
                <i class="fas fa-address-book"></i> ${saveContact.buttonText}</button>`;
        }

        // --- Footer ---
        const footerName = footer.name || name;
        const footNameSize = footer.nameSize || 9;
        const footNameColor = footer.nameColor || 'rgba(255,255,255,0.35)';
        html += `<div style="margin-top:auto;padding-top:20px;text-align:center;width:100%;">
            <p style="font-size:${footNameSize}px;color:${footNameColor};letter-spacing:1px;text-transform:uppercase;margin:0 0 4px;">© ${new Date().getFullYear()} ${footerName}.</p>
            ${footer.showBranding !== false ? `<a href="https://sites.rafaeldemeni.com" target="_blank" style="font-size:8px;color:rgba(255,255,255,0.25);text-decoration:none;display:flex;align-items:center;justify-content:center;gap:4px;"><i class="fas fa-bolt" style="font-size:7px;"></i> feito com ❤ por Demeni Sites</a>` : ''}
        </div>`;

        html += `</div>`; // close content div

        // --- WhatsApp Float ---
        if (whatsappFloat.enabled) {
            const waUrl = whatsappFloat.phone ? `https://wa.me/${whatsappFloat.phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappFloat.message || '')}` : '#';
            html += `<a href="${waUrl}" target="_blank" style="position:absolute;bottom:12px;left:12px;z-index:50;display:flex;align-items:center;gap:8px;text-decoration:none;">
                <div style="width:40px;height:40px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(37,211,102,0.4);">
                    <i class="fab fa-whatsapp" style="color:#fff;font-size:20px;"></i></div>
                ${whatsappFloat.showBubbleText ? `<div style="background:rgba(0,0,0,0.7);border-left:3px solid #25D366;padding:6px 12px;border-radius:6px;">
                    <span style="font-size:8px;color:#25D366;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;display:block;">ONLINE</span>
                    <span style="font-size:10px;color:#fff;font-weight:500;">${whatsappFloat.bubbleText || 'Fale Comigo Agora!'}</span></div>` : ''}
            </a>`;
        }

        // --- Assemble ---
        const fontImport = fontFamily !== 'Montserrat' ? `@import url('https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@300;400;600;700;800&display=swap');` : '';
        container.innerHTML = `<style>${fontImport}</style><div style="position:relative;width:100%;min-height:100%;font-family:'${fontFamily}',sans-serif;background-color:${bgColor};">${html}</div>`;

        // --- vCard download function ---
        window._d1SaveVCard = function () {
            const sc = saveContact;
            const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${sc.fullName || name}\nORG:${sc.company || ''}\nTITLE:${sc.role || ''}\nTEL:${sc.phone || ''}\nEMAIL:${sc.email || ''}\nEND:VCARD`;
            const blob = new Blob([vcard], { type: 'text/vcard' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${(sc.fullName || name).replace(/\s+/g, '_')}.vcf`;
            a.click();
        };
    }

    window.renderPreviewD1New = renderPreviewD1New;
    console.log('[D1 Preview] Module loaded');
})();