/* ===========================
   DEMENI SITES - STYLE THEMES
   Typography & spacing definitions
   =========================== */

/**
 * STYLE_THEMES
 * Defines visual styles with typography, spacing, and border-radius.
 * Colors are controlled separately by the franchisee.
 */
const STYLE_THEMES = {
    elegante: {
        id: 'elegante',
        name: 'Elegante',
        icon: 'fa-wine-glass',
        description: 'Tipografia sofisticada com espaçamento amplo',
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap',
        typography: {
            fontFamily: "'Playfair Display', Georgia, serif",
            headingWeight: 500,
            bodyWeight: 400,
            lineHeight: 1.8,
            letterSpacing: '0.02em'
        },
        spacing: {
            sectionPadding: '80px 24px',
            cardPadding: '32px',
            buttonPadding: '16px 32px',
            gap: '24px'
        },
        borderRadius: {
            button: '0px',
            card: '0px',
            image: '0px'
        }
    },
    infantil: {
        id: 'infantil',
        name: 'Infantil',
        icon: 'fa-child',
        description: 'Fonte arredondada e visual divertido',
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap',
        typography: {
            fontFamily: "'Nunito', 'Comic Sans MS', sans-serif",
            headingWeight: 700,
            bodyWeight: 600,
            lineHeight: 1.5,
            letterSpacing: '0'
        },
        spacing: {
            sectionPadding: '60px 24px',
            cardPadding: '24px',
            buttonPadding: '14px 28px',
            gap: '20px'
        },
        borderRadius: {
            button: '20px',
            card: '24px',
            image: '16px'
        }
    },
    masculino: {
        id: 'masculino',
        name: 'Masculino',
        icon: 'fa-user-tie',
        description: 'Fonte bold e visual compacto',
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&display=swap',
        typography: {
            fontFamily: "'Oswald', 'Impact', sans-serif",
            headingWeight: 600,
            bodyWeight: 400,
            lineHeight: 1.3,
            letterSpacing: '0.05em'
        },
        spacing: {
            sectionPadding: '48px 24px',
            cardPadding: '20px',
            buttonPadding: '12px 24px',
            gap: '16px'
        },
        borderRadius: {
            button: '4px',
            card: '4px',
            image: '4px'
        }
    },
    feminino: {
        id: 'feminino',
        name: 'Feminino',
        icon: 'fa-spa',
        description: 'Fonte leve e espaçamento amplo',
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap',
        typography: {
            fontFamily: "'Quicksand', 'Segoe UI', sans-serif",
            headingWeight: 500,
            bodyWeight: 400,
            lineHeight: 1.7,
            letterSpacing: '0.01em'
        },
        spacing: {
            sectionPadding: '72px 24px',
            cardPadding: '28px',
            buttonPadding: '14px 30px',
            gap: '22px'
        },
        borderRadius: {
            button: '12px',
            card: '16px',
            image: '12px'
        }
    }
};

/**
 * Get a style theme by ID
 * @param {string} themeId - Theme identifier
 * @returns {Object|null} Theme object or null if not found
 */
function getStyleTheme(themeId) {
    return STYLE_THEMES[themeId] || STYLE_THEMES.elegante;
}

/**
 * Get all available style themes
 * @returns {Array} Array of theme objects
 */
function getAllStyleThemes() {
    return Object.values(STYLE_THEMES);
}

/**
 * Apply a style theme to the preview
 * Updates CSS variables on the preview container
 * @param {string} themeId - Theme identifier
 * @param {HTMLElement} previewContainer - The preview container element
 */
function applyStyleThemeToPreview(themeId, previewContainer) {
    const theme = getStyleTheme(themeId);
    if (!theme || !previewContainer) return;

    const { typography, spacing, borderRadius } = theme;

    // Carrega a Google Font do tema
    if (theme.googleFontsUrl) {
        const linkId = `gfont-theme-${themeId}`;
        if (!document.getElementById(linkId)) {
            const link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            link.href = theme.googleFontsUrl;
            document.head.appendChild(link);
            console.log(`[StyleThemes] Google Font carregada para tema: ${theme.name}`);
        }
    }

    // Apply CSS variables
    previewContainer.style.setProperty('--theme-font-family', typography.fontFamily);
    previewContainer.style.setProperty('--theme-heading-weight', typography.headingWeight);
    previewContainer.style.setProperty('--theme-body-weight', typography.bodyWeight);
    previewContainer.style.setProperty('--theme-line-height', typography.lineHeight);
    previewContainer.style.setProperty('--theme-letter-spacing', typography.letterSpacing);

    previewContainer.style.setProperty('--theme-section-padding', spacing.sectionPadding);
    previewContainer.style.setProperty('--theme-card-padding', spacing.cardPadding);
    previewContainer.style.setProperty('--theme-button-padding', spacing.buttonPadding);
    previewContainer.style.setProperty('--theme-gap', spacing.gap);

    previewContainer.style.setProperty('--theme-button-radius', borderRadius.button);
    previewContainer.style.setProperty('--theme-card-radius', borderRadius.card);
    previewContainer.style.setProperty('--theme-image-radius', borderRadius.image);

    console.log(`[StyleThemes] Applied theme: ${theme.name}`);
}

/**
 * Generate inline CSS for published site based on theme
 * @param {string} themeId - Theme identifier
 * @returns {string} CSS string with theme variables
 */
function generateThemeCSS(themeId) {
    const theme = getStyleTheme(themeId);
    if (!theme) return '';

    const { typography, spacing, borderRadius } = theme;

    // @import da Google Font do tema para sites publicados
    const fontImport = theme.googleFontsUrl
        ? `@import url('${theme.googleFontsUrl}');`
        : '';

    return `
        ${fontImport}
        :root {
            --theme-font-family: ${typography.fontFamily};
            --theme-heading-weight: ${typography.headingWeight};
            --theme-body-weight: ${typography.bodyWeight};
            --theme-line-height: ${typography.lineHeight};
            --theme-letter-spacing: ${typography.letterSpacing};
            --theme-section-padding: ${spacing.sectionPadding};
            --theme-card-padding: ${spacing.cardPadding};
            --theme-button-padding: ${spacing.buttonPadding};
            --theme-gap: ${spacing.gap};
            --theme-button-radius: ${borderRadius.button};
            --theme-card-radius: ${borderRadius.card};
            --theme-image-radius: ${borderRadius.image};
        }
        body {
            font-family: var(--theme-font-family);
            line-height: var(--theme-line-height);
            letter-spacing: var(--theme-letter-spacing);
        }
        h1, h2, h3, h4 {
            font-weight: var(--theme-heading-weight);
        }
        p, span, li {
            font-weight: var(--theme-body-weight);
        }
        section {
            padding: var(--theme-section-padding);
        }
        .btn, button {
            padding: var(--theme-button-padding);
            border-radius: var(--theme-button-radius);
        }
        .card {
            padding: var(--theme-card-padding);
            border-radius: var(--theme-card-radius);
        }
        img {
            border-radius: var(--theme-image-radius);
        }
    `;
}

// Export for global use
window.STYLE_THEMES = STYLE_THEMES;
window.getStyleTheme = getStyleTheme;
window.getAllStyleThemes = getAllStyleThemes;
window.applyStyleThemeToPreview = applyStyleThemeToPreview;
window.generateThemeCSS = generateThemeCSS;

console.log('[StyleThemes] Style themes system initialized');
