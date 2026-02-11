/* ============================================
   PWA UTILITIES
   Geração de favicon e manifest.json
   ============================================ */

/**
 * Extrai iniciais de um nome, ignorando palavras comuns
 * "Barbearia do João" → "BJ"
 * "Casa de Carnes Premium" → "CC"
 */
function getInitials(text) {
    if (!text) return 'DS';
    const ignore = ['de', 'do', 'da', 'dos', 'das', 'e', 'a', 'o', 'os', 'as', 'um', 'uma', 'no', 'na', 'em', 'por', 'para', 'com'];
    const words = text.trim().split(/\s+/).filter(w => !ignore.includes(w.toLowerCase()));
    if (words.length === 0) return text.charAt(0).toUpperCase();
    return words.slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

/**
 * Gera um favicon como PNG base64 usando Canvas
 * @param {string} text    - Texto do qual extrair iniciais
 * @param {string} bgColor - Cor de fundo (#hex)
 * @param {string} textColor - Cor do texto (#hex)
 * @param {string} shape   - 'circle' ou 'rounded-square'
 * @param {number} size    - Tamanho em pixels (default 512)
 * @returns {string} Data URL (image/png)
 */
function generateFavicon(text, bgColor = '#1a365d', textColor = '#ffffff', shape = 'circle', size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Background shape
    ctx.fillStyle = bgColor;
    if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
    } else {
        const r = size * 0.18;
        ctx.beginPath();
        ctx.roundRect(0, 0, size, size, r);
        ctx.fill();
    }

    // Initials text
    const initials = getInitials(text);
    ctx.fillStyle = textColor;
    ctx.font = `bold ${size * 0.38}px 'Inter', 'Segoe UI', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, size / 2, size / 2 + size * 0.02);

    return canvas.toDataURL('image/png');
}

/**
 * Gera os dados do manifest.json para PWA
 */
function generateManifest(options = {}) {
    const {
        name = 'Meu Site',
        shortName = '',
        themeColor = '#1a365d',
        bgColor = '#ffffff',
        display = 'standalone',
        startUrl = '/'
    } = options;

    return {
        name: name,
        short_name: shortName || name.substring(0, 12),
        start_url: startUrl,
        display: display,
        background_color: bgColor,
        theme_color: themeColor,
        icons: [
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
    };
}

// Export
window.PWAUtils = { getInitials, generateFavicon, generateManifest };

console.log('[PWA Utils] Module loaded');
