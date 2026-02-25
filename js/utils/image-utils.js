/* ============================================
   IMAGE UTILS — Demeni Sites
   Utilitário centralizado para compressão e
   conversão de imagens em WebP
   ============================================ */

/**
 * Comprime e converte uma imagem para WebP.
 * Redimensiona proporcionalmente se exceder maxWidth.
 * 
 * @param {File|Blob} file - Arquivo de imagem
 * @param {Object} [options] - Opções de compressão
 * @param {number} [options.maxWidth=1200] - Largura máxima em px
 * @param {number} [options.quality=0.80] - Qualidade WebP (0-1)
 * @param {boolean} [options.preserveTransparency=false] - Manter transparência (usa PNG se true e WebP falhar)
 * @returns {Promise<{dataUrl: string, originalSize: number, compressedSize: number, width: number, height: number}>}
 */
async function compressImage(file, options = {}) {
    const {
        maxWidth = 1200,
        quality = 0.80,
        preserveTransparency = false
    } = options;

    const originalSize = file.size;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                // Calcula dimensões proporcionais
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height / width) * maxWidth);
                    width = maxWidth;
                }

                // Cria canvas e desenha
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                // Fundo branco se NÃO preservar transparência (evita fundo preto em JPEGs)
                if (!preserveTransparency) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, width, height);
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Tenta WebP primeiro
                let dataUrl;
                try {
                    dataUrl = canvas.toDataURL('image/webp', quality);
                    // Verifica se o browser realmente suporta WebP
                    if (!dataUrl.startsWith('data:image/webp')) {
                        throw new Error('WebP not supported');
                    }
                } catch {
                    // Fallback: PNG se precisa de transparência, senão JPEG
                    if (preserveTransparency) {
                        dataUrl = canvas.toDataURL('image/png');
                    } else {
                        dataUrl = canvas.toDataURL('image/jpeg', quality);
                    }
                }

                // Calcula tamanho comprimido (base64 → bytes)
                const compressedSize = Math.round((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75);

                console.log(
                    `[Image Utils] Comprimido: ${(originalSize / 1024).toFixed(0)}KB → ${(compressedSize / 1024).toFixed(0)}KB ` +
                    `(${Math.round((1 - compressedSize / originalSize) * 100)}% menor) | ${width}x${height}px`
                );

                resolve({
                    dataUrl,
                    originalSize,
                    compressedSize,
                    width,
                    height
                });
            };

            img.onerror = () => reject(new Error('[Image Utils] Falha ao carregar imagem'));
            img.src = e.target.result;
        };

        reader.onerror = () => reject(new Error('[Image Utils] Falha ao ler arquivo'));
        reader.readAsDataURL(file);
    });
}

/**
 * Atalho: comprime e retorna apenas o data URL (mais comum)
 * @param {File|Blob} file 
 * @param {Object} [options]
 * @returns {Promise<string>} data URL em WebP
 */
async function compressImageToDataUrl(file, options = {}) {
    const result = await compressImage(file, options);
    return result.dataUrl;
}

/**
 * Preset para ícones/favicons (512px max, alta qualidade)
 */
async function compressIcon(file) {
    return compressImageToDataUrl(file, {
        maxWidth: 512,
        quality: 0.90,
        preserveTransparency: true
    });
}

/**
 * Preset para avatares (256px max)
 */
async function compressAvatar(file) {
    return compressImageToDataUrl(file, {
        maxWidth: 256,
        quality: 0.85
    });
}

/**
 * Preset para imagens de produto/portfólio (800px max)
 */
async function compressProductImage(file) {
    return compressImageToDataUrl(file, {
        maxWidth: 800,
        quality: 0.80
    });
}

/**
 * Preset para banners/hero (1400px max, qualidade alta)
 */
async function compressBannerImage(file) {
    return compressImageToDataUrl(file, {
        maxWidth: 1400,
        quality: 0.85
    });
}

// Exporta globalmente
window.ImageUtils = {
    compressImage,
    compressImageToDataUrl,
    compressIcon,
    compressAvatar,
    compressProductImage,
    compressBannerImage
};

console.log('[Image Utils] Module loaded');
