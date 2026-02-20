/* ===========================
   DEMENI SITES - THUMBNAIL CAPTURE
   Captures project preview as WebP thumbnail.
   ONLY called on Publish/Update — never realtime.
   Works for both D-1 and D-2 editors.
   =========================== */

const ThumbnailCapture = (function () {
    const PHONE_W = 300;
    const PHONE_H = 580;
    const WEBP_QUALITY = 0.85;
    const MAX_SIZE = 500000; // 500KB max

    /**
     * Capture the current editor preview as a WebP thumbnail.
     * Must be called while the editor page is VISIBLE (before hiding).
     * @param {string} projectId - The project ID to save the thumbnail for
     * @returns {Promise<boolean>} true if captured successfully
     */
    async function capture(projectId) {
        if (!projectId) {
            console.warn('[Thumbnail] No projectId provided');
            return false;
        }

        if (typeof html2canvas !== 'function') {
            console.warn('[Thumbnail] html2canvas not loaded');
            return false;
        }

        // Find the visible preview frame (D-2 or D-1)
        const frame = _findPreviewFrame();
        if (!frame) {
            console.warn('[Thumbnail] No visible preview frame found');
            return false;
        }

        // Guard: frame must be visible (display:none kills html2canvas)
        if (!frame.offsetParent && frame.offsetWidth === 0 && frame.offsetHeight === 0) {
            console.warn('[Thumbnail] Preview frame is hidden, cannot capture');
            return false;
        }

        try {
            console.log('[Thumbnail] Capturing preview...');

            const srcCanvas = await html2canvas(frame, {
                scale: 1,
                useCORS: true,
                allowTaint: true,
                logging: false
            });

            // Guard: reject blank captures
            if (srcCanvas.width < 10 || srcCanvas.height < 10) {
                console.warn('[Thumbnail] Captured canvas too small, skipping');
                return false;
            }

            // Crop to phone dimensions (top-left aligned)
            const outputCanvas = document.createElement('canvas');
            outputCanvas.width = PHONE_W;
            outputCanvas.height = PHONE_H;
            const ctx = outputCanvas.getContext('2d');
            ctx.drawImage(srcCanvas, 0, 0, PHONE_W, PHONE_H, 0, 0, PHONE_W, PHONE_H);

            const webpDataUrl = outputCanvas.toDataURL('image/webp', WEBP_QUALITY);

            // Guard: reject tiny data (blank capture = ~2-5KB)
            if (webpDataUrl.length < 5000) {
                console.warn('[Thumbnail] WebP too small, likely blank. Skipping.');
                return false;
            }

            // Guard: reject oversized data
            if (webpDataUrl.length > MAX_SIZE) {
                console.warn('[Thumbnail] WebP too large:', Math.round(webpDataUrl.length / 1024), 'KB');
                return false;
            }

            // Save to project
            if (window.UserData) {
                UserData.updateProject(projectId, { thumbnail: webpDataUrl });
                console.log(`[Thumbnail] ✅ Saved! ${srcCanvas.width}×${srcCanvas.height} → ${PHONE_W}×${PHONE_H}, ${Math.round(webpDataUrl.length / 1024)}KB`);
                return true;
            }

            return false;
        } catch (err) {
            console.error('[Thumbnail] ❌ Capture failed:', err.message);
            return false;
        }
    }

    /**
     * Find the active preview frame element.
     * Checks D-2 first, then D-1.
     */
    function _findPreviewFrame() {
        // D-2 preview frame
        const d2Frame = document.getElementById('preview-frame')
            || document.getElementById('preview-frame-d2');
        if (d2Frame && d2Frame.offsetWidth > 0) return d2Frame;

        // D-1 preview frame
        const d1Frame = document.getElementById('d1-preview-frame')
            || document.getElementById('preview-frame-d1')
            || document.querySelector('.d1-preview-container .phone-frame');
        if (d1Frame && d1Frame.offsetWidth > 0) return d1Frame;

        // Fallback: any visible preview frame
        const anyFrame = document.querySelector('[id*="preview-frame"]');
        if (anyFrame && anyFrame.offsetWidth > 0) return anyFrame;

        return null;
    }

    return { capture };
})();

window.ThumbnailCapture = ThumbnailCapture;
