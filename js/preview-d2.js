/* ===========================
   DEMENI SITES - PREVIEW D2
   Renderiza o layout-d2 com valores dinâmicos do editor
   TODOS os controles linkados ao preview
   =========================== */

/**
 * Render D2 Preview - Renderiza preview com valores do state
 * @param {HTMLElement} frame - The preview frame element (#preview-frame)  
 * @param {Object} state - Editor state object
 */
function renderPreviewD2New(frame, state) {
    // BASE URL para assets do layout-d2
    const baseUrl = 'http://localhost:8081';

    // Adjustments values from state
    const adj = state?.d2Adjustments || {};

    // Helper to get nested value with default
    const get = (path, defaultVal) => {
        return path.split('.').reduce((o, k) => o?.[k], adj) ?? defaultVal;
    };

    // Helper: converte hex para rgba com opacidade
    const hexToRgba = (hex, alpha = 1) => {
        const h = hex.replace('#', '');
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Get sections configuration (order and visibility)
    const sections = state?.d2Sections || [
        { id: 'hero', enabled: true },
        { id: 'categorias', enabled: true },
        { id: 'produtos', enabled: true },
        { id: 'feedbacks', enabled: true },
        { id: 'cta', enabled: true },
        { id: 'footer', enabled: true }
    ];

    // Helper to check if section is enabled
    const isSectionEnabled = (sectionId) => {
        const section = sections.find(s => s.id === sectionId);
        return section ? section.enabled : true;
    };

    /**
     * Computa background style, overlay CSS e blur para qualquer seção.
     * @param {string} key - chave da seção (ex: 'feedbacks', 'cta', 'categorias', 'produtos')
     * @param {Object} defaults - valores padrão customizados por seção
     * @returns {{ bgStyle, overlayCSS, bgMode, bgImage, bgImageBlur, bgImagePosX, bgImagePosY, bgSize }}
     */
    function computeSectionBg(key, defaults = {}) {
        const d = {
            bgMode: 'color', bgColor: '#ffffff', bgColor2: '#d0d0d0',
            bgGradient: false, bgGradientInvert: false, bgImage: null,
            bgOverlay: false, bgOverlayType: 'solid', bgOverlayColor: '#000000',
            bgOverlayColor2: '#000000', bgOverlayOpacity: 50, bgOverlayInvert: false,
            bgOverlayPosition: 50, bgOverlaySpread: 80,
            bgImageBlur: 0, bgImageZoom: 100, bgImagePosX: 50, bgImagePosY: 0,
            ...defaults
        };

        const bgMode = get(`${key}.bgMode`, d.bgMode);
        const bgColor = get(`${key}.bgColor`, d.bgColor);
        const bgColor2 = get(`${key}.bgColor2`, d.bgColor2);
        const bgGradient = get(`${key}.bgGradient`, d.bgGradient);
        const bgGradientInvert = get(`${key}.bgGradientInvert`, d.bgGradientInvert);
        const bgImage = get(`${key}.bgImage`, d.bgImage) || d.bgImageFallback || null;
        const bgOverlay = get(`${key}.bgOverlay`, d.bgOverlay);
        const bgOverlayType = get(`${key}.bgOverlayType`, d.bgOverlayType);
        const bgOverlayColor = get(`${key}.bgOverlayColor`, d.bgOverlayColor);
        const bgOverlayColor2 = get(`${key}.bgOverlayColor2`, d.bgOverlayColor2);
        const bgOverlayOpacity = get(`${key}.bgOverlayOpacity`, d.bgOverlayOpacity);
        const bgOverlayInvert = get(`${key}.bgOverlayInvert`, d.bgOverlayInvert);
        const bgOverlayPosition = get(`${key}.bgOverlayPosition`, d.bgOverlayPosition);
        const bgOverlaySpread = get(`${key}.bgOverlaySpread`, d.bgOverlaySpread);
        const bgImageBlur = get(`${key}.bgImageBlur`, d.bgImageBlur);
        const bgImageZoom = get(`${key}.bgImageZoom`, d.bgImageZoom);
        const bgImagePosX = get(`${key}.bgImagePosX`, d.bgImagePosX);
        const bgImagePosY = get(`${key}.bgImagePosY`, d.bgImagePosY);

        const bgSize = bgImageZoom === 100 ? 'cover' : `${bgImageZoom}%`;

        // Compute background style
        let bgStyle;
        if (bgMode === 'image' && bgImage) {
            bgStyle = `url('${bgImage}') ${bgImagePosX}% ${bgImagePosY}% / ${bgSize} no-repeat`;
        } else if (bgGradient) {
            const c1 = bgGradientInvert ? bgColor2 : bgColor;
            const c2 = bgGradientInvert ? bgColor : bgColor2;
            bgStyle = `linear-gradient(to bottom, ${c1}, ${c2})`;
        } else {
            bgStyle = bgColor;
        }

        // Compute overlay CSS
        let overlayCSS = 'display: none;';
        if (bgMode === 'image' && bgImage && bgOverlay) {
            const op = bgOverlayOpacity / 100;
            const dir = bgOverlayInvert ? 'to top' : 'to bottom';
            const halfSpread = bgOverlaySpread / 2;
            const startFade = Math.max(0, bgOverlayPosition - halfSpread);
            const endFade = Math.min(100, bgOverlayPosition + halfSpread);

            if (bgOverlayType === 'solid') {
                overlayCSS = `background: ${hexToRgba(bgOverlayColor, op)};`;
            } else if (bgOverlayType === 'gradient') {
                const c1 = hexToRgba(bgOverlayColor, op);
                const c2 = hexToRgba(bgOverlayColor2, op);
                overlayCSS = `background: linear-gradient(${dir}, ${c1} ${startFade}%, ${c2} ${endFade}%);`;
            } else {
                const c1 = hexToRgba(bgOverlayColor, op);
                overlayCSS = `background: linear-gradient(${dir}, ${c1} ${startFade}%, transparent ${endFade}%);`;
            }
        }

        return { bgStyle, overlayCSS, bgMode, bgImage, bgImageBlur, bgImagePosX, bgImagePosY, bgSize };
    }

    /**
     * Computa a linha decorativa no topo de uma seção.
     * @param {string} key - chave da seção (ex: 'categorias')
     * @returns {{ enabled, css, html }}
     */
    function computeTopLine(key) {
        const enabled = get(`${key}.topLine.enabled`, false);
        if (!enabled) return { enabled: false, css: '', html: '' };

        const height = get(`${key}.topLine.height`, 3);
        const bgType = get(`${key}.topLine.bgType`, 'gradient');
        const bgColor = get(`${key}.topLine.bgColor`, '#5167E7');
        const bgGradient = get(`${key}.topLine.bgGradient`, 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)');
        const bg = bgType === 'gradient' ? bgGradient : bgColor;
        const cls = `d2-topline-${key}`;

        return {
            enabled: true,
            css: `.${cls} { height: ${height}px; background: ${bg}; width: 100%; margin: 0; flex-shrink: 0; }`,
            html: `<div class="${cls}"></div>`
        };
    }

    // =============================================
    // HEADER - Valores do State
    // =============================================
    const headerLogoSize = get('header.logo.size', 28);
    const headerLogoColor = get('header.logo.color', '#ffffff');
    const headerLogoPosition = get('header.logoPosition', 'left');
    const headerHeight = get('header.height', 80);
    const headerAutoHide = get('header.autoHide', false);
    const headerBgColor = get('header.bgColor', '#2d2d2d');
    const headerBgType = get('header.bgType', 'solid');
    const headerBgGradient = get('header.bgGradient', 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)');
    const headerBgGradientOrientation = get('header.bgGradientOrientation', 'horizontal');
    const headerBgGradientInvert = get('header.bgGradientInvert', false);
    const headerBgGlass = get('header.bgGlass', false);
    const headerBgGlassBlur = get('header.bgGlassBlur', 10);
    const headerBgImage = get('header.bgImage', null);
    const headerBgImageSizeH = get('header.bgImageSizeH', 100);
    const headerBgImageSizeV = get('header.bgImageSizeV', 100);
    const headerBgImageZoom = get('header.bgImageZoom', 100);
    const headerTextColor = get('header.textColor', '#ffffff');

    // Compute header background
    let headerBackground;
    if (headerBgType === 'gradient') {
        // Re-orient gradient from the stored value
        let gradStr = headerBgGradient;
        if (headerBgGradientOrientation === 'vertical') {
            gradStr = gradStr.replace(/\d+deg/, headerBgGradientInvert ? '0deg' : '180deg');
        } else {
            gradStr = gradStr.replace(/\d+deg/, headerBgGradientInvert ? '315deg' : '135deg');
        }
        headerBackground = gradStr;
    } else if (headerBgType === 'image' && headerBgImage) {
        headerBackground = `url('${headerBgImage}') center / cover no-repeat`;
    } else if (headerBgType === 'glass') {
        headerBackground = `${hexToRgba(headerBgColor, 0.3)}`;
    } else {
        headerBackground = headerBgColor;
    }
    const sidebarBgColor = get('header.sidebar.bgColor', '#1a1a1a');
    const sidebarTextColor = get('header.sidebar.textColor', '#ffffff');
    const sidebarAccentColor = get('header.sidebar.accentColor', '#e67e22');
    const sidebarWidth = get('header.sidebar.width', 280);
    const sidebarFontSize = get('header.sidebar.fontSize', 15);
    const sidebarIconSize = get('header.sidebar.iconSize', 16);
    const sidebarItemPadding = get('header.sidebar.itemPadding', 14);
    const sidebarBorderWidth = get('header.sidebar.borderWidth', 3);
    const sidebarShowSeparators = get('header.sidebar.showSeparators', false);

    // Seções habilitadas para o menu lateral (sem footer)
    const enabledSections = sections.filter(s => s.enabled && s.id !== 'footer');

    // =============================================
    // HERO - TODOS os valores dinâmicos
    // =============================================
    const heroSectionHeight = get('hero.sectionHeight', 100);
    const heroTextPosition = get('hero.textPosition', 'center');
    const heroContentPadding = get('hero.contentPadding', 60);
    // _REMOVED_ = usuário removeu explicitamente, usar null
    const rawHeroBg = get('hero.bgImage', null);
    const heroBgImage = rawHeroBg === '_REMOVED_' ? null : (rawHeroBg || 'hero-bg.webp');
    const heroBgColor = get('hero.bgColor', '#1a1a2e');
    const heroBgPositionX = get('hero.bgPositionX', 50);
    const heroBgPositionY = get('hero.bgPositionY', 50);
    const heroBgZoom = get('hero.bgZoom', 100);
    const heroGradientEnd = get('hero.gradient.colorEnd', '#0a0a0a');
    const heroGradientIntensity = get('hero.gradient.intensity', 60);
    const heroGradientPosition = get('hero.gradient.position', 50);
    const heroScrollIndicatorEnabled = get('hero.scrollIndicator.enabled', true);
    const heroScrollIndicatorColor = get('hero.scrollIndicator.color', '#ffffff');
    const heroScrollIndicatorPadding = get('hero.scrollIndicator.paddingBottom', 20);

    // Título
    const heroTitleText = get('hero.title.text', '') || state?.profile?.name || 'Seu Nome';
    const heroTitleSize = get('hero.title.size', 56);
    const heroTitleSpacing = get('hero.title.spacing', 4);
    const heroTitleWeight = get('hero.title.weight', 400);
    const heroTitleColor = get('hero.title.color', '#ffffff');
    const heroTitleFont = get('hero.title.font', 'Liebling');
    const heroTitleGradientEnabled = get('hero.title.textGradient.enabled', false);
    const heroTitleGradient = get('hero.title.textGradient.gradient', 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)');

    // Helper: gera CSS para texto gradiente
    function textGradientCSS(enabled, gradient) {
        if (!enabled) return '';
        return `background: ${gradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`;
    }

    // Subtítulo
    const heroSubtitleText = get('hero.subtitle.text', '') || state?.profile?.role || 'Sua Profissão';
    const heroSubtitleSize = get('hero.subtitle.size', 22);
    const heroSubtitleSpacing = get('hero.subtitle.spacing', 32);
    const heroSubtitleWeight = get('hero.subtitle.weight', 300);
    const heroSubtitleColor = get('hero.subtitle.color', '#ffffff');
    const heroSubtitleFont = get('hero.subtitle.font', 'Liebling');

    // Botão CTA
    const heroBtnText = get('hero.btn.text', 'QUERO SABER MAIS');
    const heroBtnLink = get('hero.btn.link', '#');
    const heroBtnFontSize = get('hero.btn.textStyle.size', 16);
    const heroBtnFontColor = get('hero.btn.textStyle.color', '#ffffff');
    const heroBtnFontWeight = get('hero.btn.textStyle.weight', 400);
    const heroBtnBgType = get('hero.btn.bgType', 'gradient');
    const heroBtnBgColor = get('hero.btn.bgColor', '#5167E7');
    const heroBtnBgGradient = get('hero.btn.bgGradient', 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)');
    const heroBtnBorderRadius = get('hero.btn.borderRadius', 30);
    const heroBtnPaddingV = get('hero.btn.paddingInner.vertical', 12);
    const heroBtnPaddingH = get('hero.btn.paddingInner.horizontal', 40);

    // Background do botão (solid ou gradient)
    const heroBtnBackground = heroBtnBgType === 'gradient' ? heroBtnBgGradient : heroBtnBgColor;
    const heroBtnHoverAnimation = get('hero.btn.hoverAnimation', true);

    // =============================================
    // CATEGORIAS - Valores dinâmicos
    // =============================================
    const categoriasBg = computeSectionBg('categorias', { bgColor: '#ffffff' });
    const categoriasTopLine = computeTopLine('categorias');
    const categoriasSpacing = get('categorias.sectionSpacing', 40);
    const categoriasColumns = get('categorias.columnsPerRow', 4);
    const categoriaIconSize = get('categorias.icon.size', 55);
    const categoriaIconRadius = get('categorias.icon.radius', 16);
    const categoriaIconColor = get('categorias.icon.color', '#333333');
    const categoriaIconBgColor = get('categorias.icon.bgColor', '#f5f5f5');
    const categoriaLabelSize = get('categorias.label.size', 10);
    const categoriaLabelColor = get('categorias.label.color', '#222222');
    const categoriaLabelWeight = get('categorias.label.weight', 500);
    const categoriasItems = get('categorias.items', [
        { id: 1, label: 'PRODUTOS', icon: 'fa-box-open' },
        { id: 2, label: 'SERVIÇOS', icon: 'fa-concierge-bell' },
        { id: 3, label: 'EDUCAÇÃO', icon: 'fa-graduation-cap' },
        { id: 4, label: 'SOBRE', icon: 'fa-info-circle' }
    ]);
    const categoriasSectionTitle = get('categorias.sectionTitle.text', 'Categorias');
    const categoriasSectionTitleSize = get('categorias.sectionTitle.size', 28);
    const categoriasSectionTitleColor = get('categorias.sectionTitle.color', '#333333');
    const categoriasSectionTitleEnabled = get('categorias.sectionTitle.enabled', false);
    const categoriasTitlePaddingTop = get('categorias.sectionTitle.paddingTop', 0);
    const categoriasTitleGap = get('categorias.sectionTitle.gap', 6);
    const categoriasTitlePaddingBottom = get('categorias.sectionTitle.paddingBottom', 16);
    const categoriasSectionSubtitle = get('categorias.sectionSubtitle.text', 'Encontre o que precisa');
    const categoriasSectionSubtitleSize = get('categorias.sectionSubtitle.size', 14);
    const categoriasSectionSubtitleColor = get('categorias.sectionSubtitle.color', '#666666');
    const categoriasSectionSubtitleEnabled = get('categorias.sectionSubtitle.enabled', false);
    const categoriasTitleWeight = get('categorias.sectionTitle.weight', 400);
    const categoriasTitleGradientEnabled = get('categorias.sectionTitle.textGradient.enabled', false);
    const categoriasTitleGradient = get('categorias.sectionTitle.textGradient.gradient', 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 50%, #2D3A81 100%)');
    const categoriasSubtitleWeight = get('categorias.sectionSubtitle.weight', 400);

    // =============================================
    // PRODUTOS - Valores dinâmicos
    // =============================================
    const produtosBg = computeSectionBg('produtos', { bgColor: '#1a365d', bgColor2: '#0d1b36' });
    const produtosTopLine = computeTopLine('produtos');
    const produtosSpacing = get('produtos.sectionSpacing', 30);
    const produtosSectionTitle = get('produtos.sectionTitle.text', 'Produtos Demeni');
    const produtosSectionTitleSize = get('produtos.sectionTitle.size', 36);
    const produtosSectionTitleColor = get('produtos.sectionTitle.color', '#ffffff');
    const produtosSectionTitleEnabled = get('produtos.sectionTitle.enabled', true);
    const produtosTitlePaddingTop = get('produtos.sectionTitle.paddingTop', 0);
    const produtosTitleGap = get('produtos.sectionTitle.gap', 6);
    const produtosTitlePaddingBottom = get('produtos.sectionTitle.paddingBottom', 24);
    const produtosSectionSubtitle = get('produtos.sectionSubtitle.text', 'Confira nossos destaques');
    const produtosSectionSubtitleSize = get('produtos.sectionSubtitle.size', 14);
    const produtosSectionSubtitleColor = get('produtos.sectionSubtitle.color', 'rgba(255,255,255,0.7)');
    const produtosSectionSubtitleEnabled = get('produtos.sectionSubtitle.enabled', false);
    const produtosTitleWeight = get('produtos.sectionTitle.weight', 400);
    const produtosTitleGradientEnabled = get('produtos.sectionTitle.textGradient.enabled', false);
    const produtosTitleGradient = get('produtos.sectionTitle.textGradient.gradient', 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 50%, #2D3A81 100%)');
    const produtosSubtitleWeight = get('produtos.sectionSubtitle.weight', 400);
    const produtosGridGap = get('produtos.gridGap', 16);
    const produtosGridColumns = get('produtos.gridColumns', 2);
    const produtosSectionPaddingH = get('produtos.sectionPaddingH', 32);
    const produtoCardPadding = get('produtos.card.padding', 6);
    const produtoCardBgColor = get('produtos.card.bgColor', '#ffffff');
    const produtoCardRadius = get('produtos.card.borderRadius', 20);
    const produtoCardBorderEnabled = get('produtos.card.borderEnabled', false);
    const produtoCardBorderWidth = get('produtos.card.borderWidth', 1);
    const produtoCardBorderColor = get('produtos.card.borderColor', '#e0e0e0');
    const produtoTitleSize = get('produtos.title.size', 15);
    const produtoTitleWeight = get('produtos.title.weight', 500);
    const produtoTitleColor = get('produtos.title.color', '#333333');
    const produtoPrecoSize = get('produtos.preco.size', 16);
    const produtoPrecoWeight = get('produtos.preco.weight', 800);
    const produtoPrecoColor = get('produtos.preco.color', '#333333');
    const produtoPrecoCurrencyStyle = get('produtos.preco.currencyStyle', 'normal');
    const produtoBtnSize = get('produtos.btn.size', 13);
    const produtoBtnBgColor = get('produtos.btn.bgColor', '#25D366');
    const produtoBtnColor = get('produtos.btn.color', '#ffffff');
    const produtoBtnRadius = get('produtos.btn.borderRadius', 20);
    const produtoBtnPaddingH = get('produtos.btn.paddingH', 14);
    const produtoBtnPaddingV = get('produtos.btn.paddingV', 6);
    const produtoBtnMarginTop = get('produtos.btn.marginTop', 0);

    // =============================================
    // FEEDBACKS - Valores dinâmicos
    // =============================================
    const feedbacksBg = computeSectionBg('feedbacks', { bgColor: '#e8e8e8', bgColor2: '#d0d0d0' });
    const feedbacksTopLine = computeTopLine('feedbacks');
    const feedbacksSpacing = get('feedbacks.sectionSpacing', 30);
    const feedbacksSectionTitle = get('feedbacks.sectionTitle.text', 'O que estão dizendo?');
    const feedbacksSectionTitleSize = get('feedbacks.sectionTitle.size', 28);
    const feedbacksSectionTitleColor = get('feedbacks.sectionTitle.color', '#333333');
    const feedbacksSectionTitleEnabled = get('feedbacks.sectionTitle.enabled', true);
    const feedbacksTitlePaddingTop = get('feedbacks.sectionTitle.paddingTop', 0);
    const feedbacksTitleGap = get('feedbacks.sectionTitle.gap', 6);
    const feedbacksTitlePaddingBottom = get('feedbacks.sectionTitle.paddingBottom', 24);
    const feedbacksSectionSubtitle = get('feedbacks.sectionSubtitle.text', 'Depoimentos de nossos clientes');
    const feedbacksSectionSubtitleSize = get('feedbacks.sectionSubtitle.size', 14);
    const feedbacksSectionSubtitleColor = get('feedbacks.sectionSubtitle.color', '#666666');
    const feedbacksSectionSubtitleEnabled = get('feedbacks.sectionSubtitle.enabled', false);
    const feedbacksTitleWeight = get('feedbacks.sectionTitle.weight', 400);
    const feedbacksTitleGradientEnabled = get('feedbacks.sectionTitle.textGradient.enabled', false);
    const feedbacksTitleGradient = get('feedbacks.sectionTitle.textGradient.gradient', 'linear-gradient(135deg, #5167E7 0%, #A3B1FE 50%, #2D3A81 100%)');
    const feedbacksSubtitleWeight = get('feedbacks.sectionSubtitle.weight', 400);
    const feedbackAvatarSize = get('feedbacks.avatar.size', 60);
    const feedbackAvatarRadius = get('feedbacks.avatar.radius', 8);
    const feedbackNameSize = get('feedbacks.name.size', 16);
    const feedbackNameWeight = get('feedbacks.name.weight', 500);
    const feedbackNameColor = get('feedbacks.name.color', '#1a365d');
    const feedbackTextSize = get('feedbacks.text.size', 13);
    const feedbackTextWeight = get('feedbacks.text.weight', 400);
    const feedbackTextColor = get('feedbacks.text.color', '#666666');
    const feedbackCardBgColor = get('feedbacks.card.bgColor', '#f5f5f5');
    const feedbackCardRadius = get('feedbacks.card.borderRadius', 12);
    const feedbackCardGlass = get('feedbacks.card.glass', false);
    const feedbackCardGlassBlur = get('feedbacks.card.glassBlur', 10);
    const feedbackCardBorderEnabled = get('feedbacks.card.borderEnabled', false);
    const feedbackCardBorderWidth = get('feedbacks.card.borderWidth', 1);
    const feedbackCardBorderColor = get('feedbacks.card.borderColor', '#e0e0e0');
    const feedbackCardAnimation = get('feedbacks.cardAnimation', true);
    const feedbackBottomCtaEnabled = get('feedbacks.bottomCta.enabled', false);
    const feedbackBottomCtaText = get('feedbacks.bottomCta.text', 'Faça parte dos nossos clientes satisfeitos!');
    const feedbackBottomCtaSize = get('feedbacks.bottomCta.size', 16);
    const feedbackBottomCtaWeight = get('feedbacks.bottomCta.weight', 400);
    const feedbackBottomCtaColor = get('feedbacks.bottomCta.color', '#333333');
    const feedbackBottomCtaPaddingTop = get('feedbacks.bottomCta.paddingTop', 20);
    const feedbackBottomCtaPaddingBottom = get('feedbacks.bottomCta.paddingBottom', 20);

    // =============================================
    // CTA SECUNDÁRIO - Valores dinâmicos
    // =============================================
    const ctaBg = computeSectionBg('cta', {
        bgMode: 'image', bgColor: '#1a365d', bgColor2: '#0d1b2a',
        bgOverlay: true, bgImageFallback: heroBgImage
    });
    const ctaTopLine = computeTopLine('cta');
    const ctaHeight = get('cta.height', 250);
    const ctaTitleText = get('cta.title.text', '') || heroTitleText;
    const ctaTitleSize = get('cta.title.size', 52);
    const ctaTitleWeight = get('cta.title.weight', 400);
    const ctaTitleColor = get('cta.title.color', '#ffffff');
    const ctaSubtitleText = get('cta.subtitle.text', '') || heroSubtitleText;
    const ctaSubtitleSize = get('cta.subtitle.size', 22);
    const ctaSubtitleWeight = get('cta.subtitle.weight', 400);
    const ctaSubtitleColor = get('cta.subtitle.color', '#ffffff');
    const ctaSubtitleOpacity = get('cta.subtitle.opacity', 0.8);
    const ctaBtnText = get('cta.btn.text', heroBtnText);
    const ctaBtnLink = get('cta.btn.link', heroBtnLink);
    const ctaBtnBgType = get('cta.btn.bgType', 'gradient');
    const ctaBtnBgGradient = get('cta.btn.bgGradient', heroBtnBgGradient);
    const ctaBtnRadius = get('cta.btn.borderRadius', 30);
    const ctaBtnHoverAnimation = get('cta.btn.hoverAnimation', true);

    // =============================================
    // FOOTER - Valores dinâmicos
    // =============================================
    const footerBgColor = get('footer.bgColor', '#1a365d');
    const footerBgType = get('footer.bgType', 'solid');
    const footerBgGradient = get('footer.bgGradient', 'linear-gradient(135deg, #1a365d 0%, #2d3a81 50%, #0d1b36 100%)');
    const footerBackground = footerBgType === 'gradient' ? footerBgGradient : footerBgColor;
    const footerTopLine = computeTopLine('footer');
    const footerSpacing = get('footer.sectionSpacing', 40);
    const footerLogoSize = get('footer.logo.size', 28);
    const footerLogoOpacity = get('footer.logo.opacity', 0.8);
    const footerLogoColor = get('footer.logo.color', 'white');
    const footerTitleText = get('footer.title.text', 'Invista no seu negócio!');
    const footerTitleSize = get('footer.title.size', 24);
    const footerTitleColor = get('footer.title.color', '#ffffff');
    const footerSubtitleText = get('footer.subtitle.text', '');
    const footerSubtitleSize = get('footer.subtitle.size', 14);
    const footerSubtitleOpacity = get('footer.subtitle.opacity', 0.6);
    const footerInfoEmail = get('footer.info.email', '');
    const footerInfoPhone = get('footer.info.phone', '');
    const footerInfoCnpj = get('footer.info.cnpj', '');
    const footerTextSize = get('footer.info.size', 13);
    const footerTextOpacity = get('footer.info.opacity', 0.8);
    const footerSocialSize = get('footer.social.size', 28);
    const footerSocialGap = get('footer.social.gap', 12);
    const footerSocialInstagram = get('footer.social.instagram', '');
    const footerSocialFacebook = get('footer.social.facebook', '');
    const footerSocialWhatsapp = get('footer.social.whatsapp', '');

    // =============================================
    // PWA / FAVICON — para export/publish
    // =============================================
    const pwaFaviconMode = get('pwa.favicon.mode', 'auto');
    const pwaFaviconImage = get('pwa.favicon.image', null);
    const pwaFaviconBgColor = get('pwa.favicon.bgColor', '#1a365d');
    const pwaFaviconTextColor = get('pwa.favicon.textColor', '#ffffff');
    const pwaFaviconShape = get('pwa.favicon.shape', 'circle');
    const pwaThemeColor = get('pwa.themeColor', '#1a365d');
    const pwaAppName = get('pwa.appName', '') || heroTitleText;

    // Gera favicon data URL para uso no export
    let pwaFaviconDataUrl = null;
    if (window.PWAUtils) {
        if (pwaFaviconMode === 'upload' && pwaFaviconImage) {
            pwaFaviconDataUrl = pwaFaviconImage;
        } else {
            pwaFaviconDataUrl = window.PWAUtils.generateFavicon(
                heroTitleText, pwaFaviconBgColor, pwaFaviconTextColor, pwaFaviconShape
            );
        }
    }

    // Armazena dados PWA no state para o export usar
    if (window.d2State) {
        window.d2State._pwaExportData = {
            faviconDataUrl: pwaFaviconDataUrl,
            themeColor: pwaThemeColor,
            appName: pwaAppName,
            manifest: window.PWAUtils ? window.PWAUtils.generateManifest({
                name: pwaAppName,
                themeColor: pwaThemeColor,
                bgColor: pwaFaviconBgColor
            }) : null
        };
    }

    // CSS + HTML para renderizar DENTRO de uma div
    // Nota: Usamos o seletor do container (#preview-frame) em vez de body
    const fullHtml = `
        <style>
            /* ========================================
               LAYOUT D-2 - CSS COMPLETO (layout-d2.css)
               Adaptado para renderização em div
               ======================================== */
            
            /* FONTE LIEBLING */
            @font-face {
                font-family: 'Liebling';
                src: url('${baseUrl}/Liebling.otf') format('opentype');
                font-weight: 400;
            }
            @font-face {
                font-family: 'Liebling';
                src: url('${baseUrl}/Liebling Light.otf') format('opentype');
                font-weight: 300;
            }
            @font-face {
                font-family: 'Liebling';
                src: url('${baseUrl}/Liebling Medium.otf') format('opentype');
                font-weight: 500;
            }
            @font-face {
                font-family: 'Liebling';
                src: url('${baseUrl}/Liebling Bold.otf') format('opentype');
                font-weight: 700;
            }
            @font-face {
                font-family: 'Liebling';
                src: url('${baseUrl}/Liebling Black.otf') format('opentype');
                font-weight: 900;
            }
            
            /* Container do preview - substitui body */
            .d2-preview-container {
                font-family: 'Liebling', 'Georgia', serif;
                background: #0a0a0a;
                color: #fff;
                margin: 0;
                padding: 0;
                min-height: 100%;
                position: relative;
                overflow: hidden;
            }
            
            .d2-preview-container * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            /* HEADER */
            .d2-header {
                height: ${headerHeight}px;
                display: flex;
                justify-content: ${headerLogoPosition === 'center' ? 'center' : 'space-between'};
                align-items: center;
                background: ${headerBackground};
                margin: 0;
                padding: 0 20px;
                ${headerLogoPosition === 'right' ? 'flex-direction: row-reverse;' : ''}
                ${headerBgType === 'glass' ? `backdrop-filter: blur(${headerBgGlassBlur}px); -webkit-backdrop-filter: blur(${headerBgGlassBlur}px);` : ''}
                ${(headerAutoHide || headerBgType === 'glass') ? `position: absolute; top: 0; left: 0; right: 0; z-index: 100; transition: transform 0.3s ease;` : (headerLogoPosition === 'center' ? 'position: relative;' : '')}
            }
            ${headerAutoHide ? `.d2-header.header-hidden { transform: translateY(-100%); }` : ''}
            .d2-header .logo img {
                max-height: ${headerLogoSize}px;
                width: auto;
                filter: ${headerLogoColor === 'white' ? 'brightness(0) invert(1)' : headerLogoColor === 'black' ? 'brightness(0)' : 'none'};
            }
            .d2-header .menu-btn {
                background: none;
                border: none;
                color: ${headerTextColor};
                font-size: 24px;
                cursor: pointer;
                ${headerLogoPosition === 'center' ? 'position: absolute; right: 24px;' : ''}
            }

            /* SIDEBAR */
            .d2-sidebar-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                opacity: 0;
                visibility: hidden;
                z-index: 998;
                transition: opacity 0.3s, visibility 0.3s;
            }
            .d2-sidebar-overlay.open {
                opacity: 1;
                visibility: visible;
            }
            .d2-sidebar {
                position: absolute;
                top: 0;
                ${headerLogoPosition === 'right' ? 'left: 0;' : 'right: 0;'}
                width: ${sidebarWidth}px;
                height: 100%;
                background: ${sidebarBgColor};
                z-index: 999;
                transform: translateX(${headerLogoPosition === 'right' ? '-100%' : '100%'});
                transition: transform 0.3s ease;
                padding: ${headerHeight + 20}px 0 20px;
                box-shadow: ${headerLogoPosition === 'right' ? '4px 0' : '-4px 0'} 20px rgba(0,0,0,0.3);
                overflow-y: auto;
            }
            .d2-sidebar.open {
                transform: translateX(0);
            }
            .d2-sidebar .sidebar-close {
                position: absolute;
                top: 20px;
                ${headerLogoPosition === 'right' ? 'right: 20px;' : 'left: 20px;'}
                color: ${sidebarTextColor};
                font-size: 28px;
                cursor: pointer;
                background: none;
                border: none;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            .d2-sidebar .sidebar-close:hover {
                opacity: 1;
            }
            .d2-sidebar .sidebar-title {
                padding: 0 24px 16px;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: ${sidebarTextColor};
                opacity: 0.4;
            }
            .d2-sidebar .sidebar-item {
                display: flex;
                align-items: center;
                gap: 14px;
                padding: ${sidebarItemPadding}px 24px;
                color: ${sidebarTextColor};
                cursor: pointer;
                transition: background 0.2s, color 0.2s;
                text-decoration: none;
                font-size: ${sidebarFontSize}px;
                border-${headerLogoPosition === 'right' ? 'left' : 'right'}: ${sidebarBorderWidth}px solid transparent;
                ${sidebarShowSeparators ? `border-bottom: 1px solid rgba(255,255,255,0.08);` : ''}
            }
            .d2-sidebar .sidebar-item:hover {
                background: rgba(255,255,255,0.08);
                color: ${sidebarAccentColor};
                border-${headerLogoPosition === 'right' ? 'left' : 'right'}-color: ${sidebarAccentColor};
            }
            .d2-sidebar .sidebar-item i {
                width: 20px;
                text-align: center;
                font-size: ${sidebarIconSize}px;
                opacity: 0.8;
            }

            /* HERO */
            .d2-hero {
                background-color: ${heroBgColor};
                height: ${heroSectionHeight}vh;
                min-height: 300px;
                position: relative;
                display: flex;
                align-items: ${heroTextPosition === 'top' ? 'flex-start' : heroTextPosition === 'center' ? 'center' : 'flex-end'};
                justify-content: center;
                padding: ${heroTextPosition === 'top' ? '80px 0 ' + heroContentPadding + 'px' : heroTextPosition === 'center' ? '60px 0' : '60px 0 ' + heroContentPadding + 'px'};
                overflow: hidden;
                margin: 0;
            }
            .d2-hero .hero-bg {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            }
            .d2-hero .hero-bg .hero-bg-image {
                width: 100%;
                height: 100%;
                background-size: cover;
                background-position: ${heroBgPositionX}% ${heroBgPositionY}%;
                background-repeat: no-repeat;
                transform: scale(${heroBgZoom / 100});
                transform-origin: ${heroBgPositionX}% ${heroBgPositionY}%;
            }
            .d2-hero .hero-gradient {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: ${100 - heroGradientPosition}%;
                background: linear-gradient(to top, ${heroGradientEnd} 0%, ${hexToRgba(heroGradientEnd, heroGradientIntensity / 100)} 50%, ${hexToRgba(heroGradientEnd, 0)} 100%);
                z-index: 2;
            }
            .d2-hero .scroll-indicator {
                position: absolute;
                bottom: ${heroScrollIndicatorPadding}px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10;
                color: ${heroScrollIndicatorColor};
                font-size: 24px;
                animation: bounce 2s infinite;
                opacity: 0.8;
            }
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
                40% { transform: translateX(-50%) translateY(-10px); }
                60% { transform: translateX(-50%) translateY(-5px); }
            }
            .d2-hero .hero-content {
                position: relative;
                z-index: 3;
                text-align: center;
            }
            .d2-hero h1 {
                font-size: ${heroTitleSize}px;
                font-weight: ${heroTitleWeight};
                font-family: '${heroTitleFont}', serif;
                color: ${heroTitleColor};
                margin-bottom: ${heroTitleSpacing}px;
                ${textGradientCSS(heroTitleGradientEnabled, heroTitleGradient)}
            }
            .d2-hero .subtitle {
                font-size: ${heroSubtitleSize}px;
                font-weight: ${heroSubtitleWeight};
                font-family: '${heroSubtitleFont}', serif;
                color: ${heroSubtitleColor};
                margin-bottom: ${heroSubtitleSpacing}px;
                opacity: 0.9;
            }
            .d2-cta-btn {
                display: inline-block;
                padding: ${heroBtnPaddingV}px ${heroBtnPaddingH}px;
                background: ${heroBtnBackground};
                border: none;
                color: ${heroBtnFontColor};
                text-decoration: none;
                font-family: 'Liebling', serif;
                font-size: ${heroBtnFontSize}px;
                font-weight: ${heroBtnFontWeight};
                letter-spacing: 1px;
                border-radius: ${heroBtnBorderRadius}px;
                box-shadow: 0 4px 15px ${hexToRgba(heroBtnBgColor, 0.4)};
                transition: ${heroBtnHoverAnimation ? 'transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease' : 'none'};
                cursor: pointer;
            }
            ${heroBtnHoverAnimation ? `
            .d2-hero .d2-cta-btn:hover {
                transform: scale(1.06);
                filter: brightness(1.15);
                box-shadow: 0 0 12px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.2);
            }` : ''}

            /* CATEGORIAS */
            .d2-categorias {
                padding: ${categoriasSpacing}px 20px;
                text-align: center;
                ${categoriasBg.bgMode === 'image' && categoriasBg.bgImage && categoriasBg.bgImageBlur > 0
            ? 'background: transparent;'
            : `background: ${categoriasBg.bgStyle};`}
                color: #333;
                overflow: hidden;
                margin: 0;
                position: relative;
            }
            ${categoriasBg.bgMode === 'image' && categoriasBg.bgImage && categoriasBg.bgImageBlur > 0 ? `
            .d2-categorias::after {
                content: '';
                position: absolute;
                inset: -${categoriasBg.bgImageBlur * 2}px;
                background: url('${categoriasBg.bgImage}') ${categoriasBg.bgImagePosX}% ${categoriasBg.bgImagePosY}% / ${categoriasBg.bgSize} no-repeat;
                filter: blur(${categoriasBg.bgImageBlur}px);
                z-index: 0;
            }` : ''}
            .d2-categorias::before {
                content: '';
                position: absolute;
                inset: 0;
                ${categoriasBg.overlayCSS}
                pointer-events: none;
                z-index: 1;
            }
            .d2-categorias > * {
                position: relative;
                z-index: 2;
            }
            .d2-categorias h2 {
                font-family: 'Liebling', serif;
                font-size: ${categoriasSectionTitleSize}px;
                font-weight: ${categoriasTitleWeight};
                margin-top: ${categoriasTitlePaddingTop}px;
                margin-bottom: ${categoriasTitleGap}px;
                color: ${categoriasSectionTitleColor};
                ${textGradientCSS(categoriasTitleGradientEnabled, categoriasTitleGradient)}
            }
            .d2-categorias .section-subtitle {
                font-size: ${categoriasSectionSubtitleSize}px;
                color: ${categoriasSectionSubtitleColor};
                margin-bottom: ${categoriasTitlePaddingBottom}px;
                font-weight: ${categoriasSubtitleWeight};
                opacity: 0.8;
            }
            .d2-categorias-grid {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 12px 8px;
            }
            .d2-categoria-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-decoration: none;
                color: #333;
                flex: 0 0 calc(${100 / categoriasColumns}% - 6px);
                min-width: 0;
            }
            .d2-categoria-icon {
                width: ${categoriaIconSize}px;
                height: ${categoriaIconSize}px;
                border-radius: ${categoriaIconRadius}px;
                background: ${categoriaIconBgColor};
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 6px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            .d2-categoria-icon i {
                font-size: ${Math.round(categoriaIconSize * 0.4)}px;
                color: ${categoriaIconColor};
            }
            .d2-categoria-icon img {
                width: ${Math.round(categoriaIconSize * 0.45)}px;
                height: ${Math.round(categoriaIconSize * 0.45)}px;
                object-fit: contain;
            }
            .d2-categoria-item span {
                font-size: ${categoriaLabelSize}px;
                letter-spacing: 0.5px;
                color: ${categoriaLabelColor};
                font-weight: ${categoriaLabelWeight};
                text-align: center;
                line-height: 1.2;
                word-break: break-word;
                max-width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            /* PRODUTOS */
            .d2-produtos {
                padding: ${produtosSpacing}px ${produtosSectionPaddingH}px;
                text-align: center;
                ${produtosBg.bgMode === 'image' && produtosBg.bgImage && produtosBg.bgImageBlur > 0
            ? 'background: transparent;'
            : `background: ${produtosBg.bgStyle};`}
                margin: 0;
                position: relative;
                overflow: hidden;
            }
            ${produtosBg.bgMode === 'image' && produtosBg.bgImage && produtosBg.bgImageBlur > 0 ? `
            .d2-produtos::after {
                content: '';
                position: absolute;
                inset: -${produtosBg.bgImageBlur * 2}px;
                background: url('${produtosBg.bgImage}') ${produtosBg.bgImagePosX}% ${produtosBg.bgImagePosY}% / ${produtosBg.bgSize} no-repeat;
                filter: blur(${produtosBg.bgImageBlur}px);
                z-index: 0;
            }` : ''}
            .d2-produtos::before {
                content: '';
                position: absolute;
                inset: 0;
                ${produtosBg.overlayCSS}
                pointer-events: none;
                z-index: 1;
            }
            .d2-produtos > * {
                position: relative;
                z-index: 2;
            }
            .d2-produtos .d2-section-label {
                color: rgba(255, 255, 255, 0.5);
            }
            .d2-produtos h2 {
                font-family: 'Liebling', serif;
                font-size: ${produtosSectionTitleSize}px;
                font-weight: ${produtosTitleWeight};
                margin-top: ${produtosTitlePaddingTop}px;
                margin-bottom: ${produtosTitleGap}px;
                color: ${produtosSectionTitleColor};
                ${textGradientCSS(produtosTitleGradientEnabled, produtosTitleGradient)}
            }
            .d2-produtos .section-subtitle {
                font-size: ${produtosSectionSubtitleSize}px;
                color: ${produtosSectionSubtitleColor};
                margin-bottom: ${produtosTitlePaddingBottom}px;
                font-weight: ${produtosSubtitleWeight};
                opacity: 0.8;
            }
            .d2-produtos-grid {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: ${produtosGridGap}px;
                padding: 0;
                max-width: 100%;
            }
            .d2-produto-card {
                background: ${produtoCardBgColor};
                border-radius: ${produtoCardRadius}px;
                text-decoration: none;
                color: #333;
                display: flex;
                flex-direction: column;
                padding: ${produtoCardPadding}px;
                width: calc(${100 / produtosGridColumns}% - ${produtosGridGap}px);
                min-width: 100px;
                flex-shrink: 0;
                box-sizing: border-box;
                ${produtoCardBorderEnabled ? `border: ${produtoCardBorderWidth}px solid ${produtoCardBorderColor};` : ''}
            }
            .d2-produto-img {
                width: 100%;
                aspect-ratio: 4 / 3;
                overflow: hidden;
                border-radius: ${Math.max(produtoCardRadius - produtoCardPadding, 0)}px;
            }
            .d2-produto-img img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .d2-produto-card h3 {
                font-size: ${produtoTitleSize}px;
                font-weight: ${produtoTitleWeight};
                padding: 8px 6px 2px;
                margin: 0;
                line-height: 1.2;
                text-align: left;
                color: ${produtoTitleColor};
            }
            .d2-produto-footer {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                padding: 4px 6px 6px;
                margin-top: auto;
                gap: 8px;
            }
            .d2-preco {
                font-size: ${produtoPrecoSize}px;
                font-weight: ${produtoPrecoWeight};
                color: ${produtoPrecoColor};
                display: inline-flex;
                align-items: baseline;
                white-space: nowrap;
            }
            .d2-preco .currency {
                font-size: ${Math.round(produtoPrecoSize * 0.55)}px;
                margin-right: 1px;
                font-weight: ${produtoPrecoWeight};
            }
            .d2-preco .cents {
                font-size: ${Math.round(produtoPrecoSize * 0.55)}px;
                font-weight: ${produtoPrecoWeight};
            }
            .d2-produto-btn {
                display: inline-block;
                padding: ${produtoBtnPaddingV}px ${produtoBtnPaddingH}px;
                background: ${produtoBtnBgColor};
                color: ${produtoBtnColor};
                font-size: ${produtoBtnSize}px;
                font-weight: 600;
                border-radius: ${produtoBtnRadius}px;
                text-transform: lowercase;
                white-space: nowrap;
                transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease;
                cursor: pointer;
            }
            .d2-produto-btn:hover {
                transform: scale(1.06);
                filter: brightness(1.15);
                box-shadow: 0 0 12px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.2);
            }

            /* FEEDBACKS */
            .d2-feedbacks {
                padding: ${feedbacksSpacing}px 32px;
                text-align: center;
                ${feedbacksBg.bgMode === 'image' && feedbacksBg.bgImage && feedbacksBg.bgImageBlur > 0
            ? 'background: transparent;'
            : `background: ${feedbacksBg.bgStyle};`}
                color: #333;
                margin: 0;
                position: relative;
                overflow: hidden;
            }
            ${feedbacksBg.bgMode === 'image' && feedbacksBg.bgImage && feedbacksBg.bgImageBlur > 0 ? `
            .d2-feedbacks::after {
                content: '';
                position: absolute;
                inset: -${feedbacksBg.bgImageBlur * 2}px;
                background: url('${feedbacksBg.bgImage}') ${feedbacksBg.bgImagePosX}% ${feedbacksBg.bgImagePosY}% / ${feedbacksBg.bgSize} no-repeat;
                filter: blur(${feedbacksBg.bgImageBlur}px);
                z-index: 0;
            }` : ''}
            .d2-feedbacks::before {
                content: '';
                position: absolute;
                inset: 0;
                ${feedbacksBg.overlayCSS}
                pointer-events: none;
                z-index: 1;
            }
            .d2-feedbacks > * {
                position: relative;
                z-index: 2;
            }
            .d2-feedbacks .d2-section-label {
                color: rgba(0, 0, 0, 0.4);
            }
            .d2-feedbacks h2 {
                font-size: ${feedbacksSectionTitleSize}px;
                font-weight: ${feedbacksTitleWeight};
                margin-top: ${feedbacksTitlePaddingTop}px;
                margin-bottom: ${feedbacksTitleGap}px;
                color: ${feedbacksSectionTitleColor};
                ${textGradientCSS(feedbacksTitleGradientEnabled, feedbacksTitleGradient)}
            }
            .d2-feedbacks .section-subtitle {
                font-size: ${feedbacksSectionSubtitleSize}px;
                color: ${feedbacksSectionSubtitleColor};
                margin-bottom: ${feedbacksTitlePaddingBottom}px;
                font-weight: ${feedbacksSubtitleWeight};
                opacity: 0.8;
            }
            .d2-feedbacks-list {
                display: flex;
                flex-direction: column;
                gap: 16px;
                padding: 0;
            }
            .d2-feedback-card {
                display: flex;
                gap: 14px;
                background: ${feedbackCardGlass
            ? 'rgba(255, 255, 255, 0.15)'
            : feedbackCardBgColor};
                padding: 16px;
                border-radius: ${feedbackCardRadius}px;
                text-align: left;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                cursor: default;
                ${feedbackCardGlass
            ? `backdrop-filter: blur(${feedbackCardGlassBlur}px);
                       -webkit-backdrop-filter: blur(${feedbackCardGlassBlur}px);
                       border: 1px solid rgba(255, 255, 255, 0.2);`
            : ''}
                ${!feedbackCardGlass && feedbackCardBorderEnabled
            ? `border: ${feedbackCardBorderWidth}px solid ${feedbackCardBorderColor};`
            : ''}
            }
            ${feedbackCardAnimation ? `
            .d2-feedback-card:hover {
                transform: translateY(-6px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            }` : ''}
            .d2-feedback-avatar {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .d2-feedback-content {
                flex: 1;
            }
            .d2-feedback-name {
                color: ${feedbackNameColor};
                font-weight: ${feedbackNameWeight};
                font-size: ${feedbackNameSize}px;
                text-decoration: none;
                display: block;
                margin-bottom: 6px;
            }
            .d2-feedback-content p {
                font-size: ${feedbackTextSize}px;
                line-height: 1.3;
                color: ${feedbackTextColor};
                font-weight: ${feedbackTextWeight};
            }
            .d2-feedbacks-cta {
                padding-top: ${feedbackBottomCtaPaddingTop}px;
                padding-bottom: ${feedbackBottomCtaPaddingBottom}px;
                font-size: ${feedbackBottomCtaSize}px;
                font-weight: ${feedbackBottomCtaWeight};
                color: ${feedbackBottomCtaColor};
                text-align: center;
            }

            /* CTA SECUNDÁRIO */
            .d2-cta-secundario {
                height: ${ctaHeight}px;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                overflow: hidden;
                margin: 0;
                ${ctaBg.bgMode === 'image' && ctaBg.bgImage && ctaBg.bgImageBlur > 0
            ? 'background: transparent;'
            : `background: ${ctaBg.bgStyle};`}
            }
            ${ctaBg.bgMode === 'image' && ctaBg.bgImage && ctaBg.bgImageBlur > 0 ? `
            .d2-cta-secundario::after {
                content: '';
                position: absolute;
                inset: -${ctaBg.bgImageBlur * 2}px;
                background: url('${ctaBg.bgImage}') ${ctaBg.bgImagePosX}% ${ctaBg.bgImagePosY}% / ${ctaBg.bgSize} no-repeat;
                filter: blur(${ctaBg.bgImageBlur}px);
                z-index: 0;
            }` : ''}
            .d2-cta-secundario::before {
                content: '';
                position: absolute;
                inset: 0;
                ${ctaBg.overlayCSS}
                pointer-events: none;
                z-index: 1;
            }
            .d2-cta-secundario > * {
                position: relative;
                z-index: 2;
            }
            .d2-cta-secundario .cta-content {
                padding: 30px 20px;
            }
            .d2-cta-secundario h2 {
                font-size: ${ctaTitleSize}px;
                font-weight: ${ctaTitleWeight};
                color: ${ctaTitleColor};
                margin-bottom: 4px;
            }
            .d2-cta-secundario p {
                font-size: ${ctaSubtitleSize}px;
                font-weight: ${ctaSubtitleWeight};
                color: ${ctaSubtitleColor};
                opacity: ${ctaSubtitleOpacity};
                margin-bottom: 20px;
            }
            .d2-cta-secundario .d2-cta-btn {
                border-radius: ${ctaBtnRadius}px;
                ${ctaBtnHoverAnimation ? 'transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease;' : ''}
            }
            ${ctaBtnHoverAnimation ? `
            .d2-cta-secundario .d2-cta-btn:hover {
                transform: scale(1.06);
                filter: brightness(1.15);
                box-shadow: 0 0 12px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.2);
            }` : ''}

            /* FOOTER */
            .d2-footer {
                padding: ${footerSpacing}px 32px;
                background: ${footerBackground};
                text-align: left;
                margin: 0;
            }
            .d2-footer h3 {
                font-family: 'Liebling', serif;
                font-size: ${footerTitleSize}px;
                font-weight: 400;
                color: ${footerTitleColor};
                margin-bottom: 6px;
            }
            .d2-footer-subtitle {
                font-size: ${footerSubtitleSize}px;
                opacity: ${footerSubtitleOpacity};
                margin-bottom: 20px;
            }
            .d2-footer-info {
                font-size: ${footerTextSize}px;
                line-height: 1.8;
                opacity: ${footerTextOpacity};
                margin-bottom: 20px;
            }
            .d2-footer-info strong {
                opacity: 0.6;
            }
            .d2-footer-bottom {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 16px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            .d2-footer-logo img {
                height: ${footerLogoSize}px;
                width: auto;
                opacity: ${footerLogoOpacity};
                filter: ${footerLogoColor === 'white' ? 'brightness(0) invert(1)' : footerLogoColor === 'black' ? 'brightness(0)' : 'none'};
            }
            .d2-footer-social {
                display: flex;
                gap: ${footerSocialGap}px;
                align-items: center;
            }
            .d2-social-btn {
                width: ${footerSocialSize}px;
                height: ${footerSocialSize}px;
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                text-decoration: none;
            }
            .d2-social-btn.instagram {
                background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
            }
            .d2-social-btn.facebook {
                background: #1877F2;
                overflow: hidden;
            }
            .d2-social-btn.whatsapp {
                background: #25D366;
            }
            .d2-social-btn svg {
                width: 26px;
                height: 26px;
            }
            .d2-social-btn.instagram svg {
                width: 20px;
                height: 20px;
            }
            .d2-social-btn.facebook svg {
                transform: translateY(3px);
            }

            /* TOP LINES */
            ${categoriasTopLine.css}
            ${produtosTopLine.css}
            ${feedbacksTopLine.css}
            ${ctaTopLine.css}
            ${footerTopLine.css}
        </style>

        <div class="d2-preview-container">
            <!-- HEADER -->
            <header class="d2-header">
                <div class="logo">
                    <img src="${state?.profile?.logo || baseUrl + '/Logo-Tipográfica-Demeni.png'}" alt="Logo">
                </div>
                <button class="menu-btn" onclick="var s=this.closest('.d2-preview-container');s.querySelector('.d2-sidebar').classList.add('open');s.querySelector('.d2-sidebar-overlay').classList.add('open')">☰</button>
            </header>

            <!-- SIDEBAR OVERLAY -->
            <div class="d2-sidebar-overlay" onclick="var s=this.closest('.d2-preview-container');s.querySelector('.d2-sidebar').classList.remove('open');this.classList.remove('open')"></div>
            <nav class="d2-sidebar">
                <button class="sidebar-close" onclick="var s=this.closest('.d2-preview-container');s.querySelector('.d2-sidebar').classList.remove('open');s.querySelector('.d2-sidebar-overlay').classList.remove('open')">&times;</button>
                <div class="sidebar-title">Menu</div>
                ${enabledSections.map(s => `
                <a class="sidebar-item" onclick="var c=this.closest('.d2-preview-container');c.querySelector('.d2-sidebar').classList.remove('open');c.querySelector('.d2-sidebar-overlay').classList.remove('open');var target=c.querySelector('#section-${s.id}');if(target)target.scrollIntoView({behavior:'smooth',block:'start'})">
                    <i class="fas ${s.icon || 'fa-circle'}"></i>
                    <span>${s.name}</span>
                </a>`).join('')}
            </nav>

            <!-- HERO -->
            <section class="d2-hero" id="section-hero">
                <div class="hero-bg">
                    ${heroBgImage ? `<div class="hero-bg-image" style="background-image: url('${heroBgImage}')"></div>` : ''}
                </div>
                <div class="hero-gradient"></div>
                <div class="hero-content">
                    <h1>${heroTitleText}</h1>
                    <p class="subtitle">${heroSubtitleText}</p>
                    <a href="${heroBtnLink}" class="d2-cta-btn">${heroBtnText}</a>
                </div>
                ${heroScrollIndicatorEnabled ? `<div class="scroll-indicator"><i class="fas fa-chevron-down"></i></div>` : ''}
            </section>

            <!-- CATEGORIAS -->
            ${isSectionEnabled('categorias') ? `
            ${categoriasTopLine.html}
            <section class="d2-categorias" id="section-categorias">
                ${categoriasSectionTitleEnabled ? `<h2>${categoriasSectionTitle}</h2>` : ''}
                ${categoriasSectionSubtitleEnabled ? `<p class="section-subtitle">${categoriasSectionSubtitle}</p>` : ''}
                <div class="d2-categorias-grid">
                    ${categoriasItems.map(cat => {
                const isFa = cat.icon?.startsWith('fa-');
                const isUrl = cat.icon?.startsWith('http') || cat.icon?.startsWith('data:');
                const iconHtml = isFa
                    ? `<i class="fas ${cat.icon}"></i>`
                    : `<img src="${isUrl ? cat.icon : baseUrl + '/' + cat.icon}" alt="${cat.label}">`;
                return `
                    <a href="${cat.link || '#'}" class="d2-categoria-item">
                        <div class="d2-categoria-icon">
                            ${iconHtml}
                        </div>
                        <span>${cat.label}</span>
                    </a>`;
            }).join('')}
                </div>
            </section>
            ` : ''}

            <!-- PRODUTOS (Dinâmico) -->
            ${isSectionEnabled('produtos') ? `
            ${produtosTopLine.html}
            <section class="d2-produtos" id="section-produtos">
                ${produtosSectionTitleEnabled ? `<h2>${produtosSectionTitle}</h2>` : ''}
                ${produtosSectionSubtitleEnabled ? `<p class="section-subtitle">${produtosSectionSubtitle}</p>` : ''}
                <div class="d2-produtos-grid">
                    ${(state?.d2Products || []).map(p => {
                const rawPrice = p.price || 'R$ 0,00';
                let priceHtml;
                if (produtoPrecoCurrencyStyle === 'small') {
                    const match = rawPrice.match(/R\$\s*([\d.]+),(\d{2})/);
                    if (match) {
                        priceHtml = `<span class="currency">R$</span><span class="value">${match[1]}</span><span class="cents">,${match[2]}</span>`;
                    } else {
                        priceHtml = rawPrice;
                    }
                } else {
                    priceHtml = rawPrice;
                }
                return `
                    <a href="${p.link || '#'}" class="d2-produto-card" ${p.link ? 'target="_blank"' : ''}>
                        <div class="d2-produto-img">
                            <img src="${p.image || baseUrl + '/produto.webp'}" alt="${p.title || 'Produto'}">
                        </div>
                        <h3>${p.title || 'Nome do Produto'}</h3>
                        <div class="d2-produto-footer">
                            <span class="d2-preco">${priceHtml}</span>
                            <span class="d2-produto-btn">Comprar</span>
                        </div>
                    </a>`;
            }).join('')}
                </div>
            </section>
            ` : ''}

            <!-- FEEDBACKS (Dinâmico) -->
            ${isSectionEnabled('feedbacks') ? `
            ${feedbacksTopLine.html}
            <section class="d2-feedbacks" id="section-feedbacks">
                ${feedbacksSectionTitleEnabled ? `<h2>${feedbacksSectionTitle}</h2>` : ''}
                ${feedbacksSectionSubtitleEnabled ? `<p class="section-subtitle">${feedbacksSectionSubtitle}</p>` : ''}
                <div class="d2-feedbacks-list">
                    ${(state?.d2Feedbacks || []).map(f => {
                const aZoom = (f.avatarZoom || 100) / 100;
                const aPosX = f.avatarPosX ?? 50;
                const aPosY = f.avatarPosY ?? 50;
                return `
                    <div class="d2-feedback-card">
                        <div style="width:${feedbackAvatarSize}px;height:${feedbackAvatarSize}px;border-radius:${feedbackAvatarRadius}px;overflow:hidden;flex-shrink:0;">
                            <img src="${f.avatar || baseUrl + '/avatar.webp'}" alt="${f.name || 'Cliente'}" class="d2-feedback-avatar" style="object-position:${aPosX}% ${aPosY}%;transform:scale(${aZoom});">
                        </div>
                        <div class="d2-feedback-content">
                            ${f.link ? `<a href="${f.link}" class="d2-feedback-name" target="_blank">${f.name || 'Nome do Cliente'}</a>` : `<span class="d2-feedback-name">${f.name || 'Nome do Cliente'}</span>`}
                            <p>${f.text || 'Texto do depoimento aqui...'}</p>
                        </div>
                    </div>`;
            }).join('')}
                </div>
                ${feedbackBottomCtaEnabled ? `<p class="d2-feedbacks-cta">${feedbackBottomCtaText}</p>` : ''}
            </section>
            ` : ''}

            <!-- CTA SECUNDÁRIO -->
            ${isSectionEnabled('cta') ? `
            ${ctaTopLine.html}
            <section class="d2-cta-secundario" id="section-cta">
                <div class="cta-content">
                    <h2>${ctaTitleText}</h2>
                    <p>${ctaSubtitleText}</p>
                    <a href="${ctaBtnLink}" class="d2-cta-btn">${ctaBtnText}</a>
                </div>
            </section>
            ` : ''}

            <!-- FOOTER -->
            ${footerTopLine.html}
            <footer class="d2-footer">
                <h3>${footerTitleText}</h3>
                ${footerSubtitleText ? `<p class="d2-footer-subtitle">${footerSubtitleText}</p>` : ''}
                <div class="d2-footer-info">
                    ${footerInfoEmail ? `<p><strong>Email:</strong> ${footerInfoEmail}</p>` : ''}
                    ${footerInfoPhone ? `<p><strong>Telefone/Whatsapp:</strong> ${footerInfoPhone}</p>` : ''}
                    ${footerInfoCnpj ? `<p><strong>CNPJ:</strong> ${footerInfoCnpj}</p>` : ''}
                </div>
                <div class="d2-footer-bottom">
                    <div class="d2-footer-logo">
                        <img src="${state?.profile?.logo || baseUrl + '/Logo-Tipográfica-Demeni.png'}" alt="Logo">
                    </div>
                    <div class="d2-footer-social">
                        ${footerSocialInstagram ? `
                        <a href="${footerSocialInstagram}" class="d2-social-btn instagram" target="_blank">
                            <svg viewBox="0 0 24 24" fill="white">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                        </a>` : ''}
                        ${footerSocialFacebook ? `
                        <a href="${footerSocialFacebook}" class="d2-social-btn facebook" target="_blank">
                            <svg viewBox="0 0 24 24" fill="white">
                                <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                            </svg>
                        </a>` : ''}
                        ${footerSocialWhatsapp ? `
                        <a href="https://wa.me/${footerSocialWhatsapp.replace(/\D/g, '')}" class="d2-social-btn whatsapp" target="_blank">
                            <svg viewBox="0 0 24 24" fill="white">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                            </svg>
                        </a>` : ''}
                    </div>
                </div>
            </footer>
        </div>
    `;

    frame.innerHTML = fullHtml;

    // Header auto-hide scroll listener
    if (headerAutoHide) {
        const header = frame.querySelector('.d2-header');
        const scrollParent = frame.closest('[style*="overflow"]') || frame.parentElement;
        if (header && scrollParent) {
            let lastScrollY = 0;
            scrollParent.addEventListener('scroll', () => {
                const currentScrollY = scrollParent.scrollTop;
                if (currentScrollY > lastScrollY && currentScrollY > headerHeight) {
                    header.classList.add('header-hidden');
                } else {
                    header.classList.remove('header-hidden');
                }
                lastScrollY = currentScrollY;
            }, { passive: true });
        }
    }

    console.log('[Preview D2] Layout completo renderizado');
}

// Export render function globally
window.renderPreviewD2New = renderPreviewD2New;

console.log('[Preview D2] Module loaded - Layout D2 Completo');
