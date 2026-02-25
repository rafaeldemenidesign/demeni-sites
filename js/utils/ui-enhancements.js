/* ============================================
   UI ENHANCEMENTS — Demeni Sites
   Skeleton loading, save indicator, exit modal
   ============================================ */

/**
 * UI Enhancement Utilities
 * Provides skeleton loading, inline save indicators,
 * and a custom exit confirmation modal.
 */
const UIEnhancements = {

    // ========== SKELETON LOADING ==========

    /**
     * Mostra skeleton loading em um container
     * @param {string|HTMLElement} target - Seletor CSS ou elemento
     * @param {number} count - Número de linhas skeleton
     */
    showSkeleton(target, count = 3) {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) return;

        const lines = Array.from({ length: count }, (_, i) => {
            const width = 60 + Math.random() * 40; // 60-100%
            return `<div class="skeleton-line" style="width:${width}%"></div>`;
        }).join('');

        el.innerHTML = `<div class="skeleton-container">${lines}</div>`;
        el.classList.add('skeleton-active');
    },

    /**
     * Remove skeleton loading de um container
     */
    hideSkeleton(target) {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) return;
        el.classList.remove('skeleton-active');
        const skeleton = el.querySelector('.skeleton-container');
        if (skeleton) skeleton.remove();
    },

    /**
     * Mostra skeleton no grid de projetos
     */
    showProjectsSkeleton(gridSelector = '#projects-grid') {
        const el = document.querySelector(gridSelector);
        if (!el) return;

        el.innerHTML = Array.from({ length: 4 }, () => `
            <div class="skeleton-card">
                <div class="skeleton-line" style="height:120px; border-radius:12px 12px 0 0;"></div>
                <div style="padding:16px;">
                    <div class="skeleton-line" style="width:70%; height:16px; margin-bottom:10px;"></div>
                    <div class="skeleton-line" style="width:50%; height:12px;"></div>
                </div>
            </div>
        `).join('');
    },

    // ========== INLINE SAVE INDICATOR ==========

    _saveIndicatorEl: null,
    _saveIndicatorTimer: null,

    /**
     * Exibe indicador "✓ Salvo" inline
     */
    showSaved() {
        if (!this._saveIndicatorEl) {
            this._saveIndicatorEl = document.createElement('div');
            this._saveIndicatorEl.id = 'inline-save-indicator';
            this._saveIndicatorEl.className = 'save-indicator';
            document.body.appendChild(this._saveIndicatorEl);
        }

        const el = this._saveIndicatorEl;
        el.textContent = '✓ Salvo';
        el.classList.add('visible');

        clearTimeout(this._saveIndicatorTimer);
        this._saveIndicatorTimer = setTimeout(() => {
            el.classList.remove('visible');
        }, 2000);
    },

    /**
     * Exibe indicador "Salvando..."
     */
    showSaving() {
        if (!this._saveIndicatorEl) {
            this._saveIndicatorEl = document.createElement('div');
            this._saveIndicatorEl.id = 'inline-save-indicator';
            this._saveIndicatorEl.className = 'save-indicator';
            document.body.appendChild(this._saveIndicatorEl);
        }

        const el = this._saveIndicatorEl;
        el.textContent = '⏳ Salvando...';
        el.classList.add('visible');
    },

    // ========== EXIT CONFIRMATION MODAL ==========

    _hasUnsavedChanges: false,
    _exitModalActive: false,

    /**
     * Marca que há alterações não salvas
     */
    markUnsaved() {
        this._hasUnsavedChanges = true;
    },

    /**
     * Marca que as alterações foram salvas
     */
    markSaved() {
        this._hasUnsavedChanges = false;
    },

    /**
     * Mostra modal de confirmação de saída (interno, não popup do browser)
     * @param {Function} onConfirm - Callback se confirmar saída
     * @param {Function} [onCancel] - Callback se cancelar
     */
    showExitConfirmation(onConfirm, onCancel) {
        if (this._exitModalActive) return;
        this._exitModalActive = true;

        const overlay = document.createElement('div');
        overlay.id = 'exit-confirm-overlay';
        overlay.style.cssText = `
            position: fixed; inset: 0; z-index: 99998;
            background: rgba(10, 10, 20, 0.85);
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(6px);
            animation: fadeIn 0.2s ease;
        `;

        overlay.innerHTML = `
            <div style="
                background: #1e1e2e; border-radius: 20px; padding: 32px;
                max-width: 380px; width: 90%; text-align: center;
                box-shadow: 0 16px 48px rgba(0,0,0,0.4);
                border: 1px solid rgba(255,255,255,0.08);
                animation: scaleIn 0.2s ease;
            ">
                <div style="font-size: 40px; margin-bottom: 12px;">📝</div>
                <h3 style="color: #fff; font-size: 18px; margin-bottom: 8px; font-weight: 600;">
                    Sair do editor?
                </h3>
                <p style="color: rgba(255,255,255,0.6); font-size: 13px; line-height: 1.5; margin-bottom: 20px;">
                    Suas alterações são salvas automaticamente, mas verifique se tudo foi salvo antes de sair.
                </p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="exit-cancel-btn" style="
                        padding: 10px 20px; border-radius: 10px;
                        border: 1px solid rgba(255,255,255,0.2);
                        background: transparent; color: #fff;
                        font-size: 13px; cursor: pointer;
                    ">Continuar editando</button>
                    <button id="exit-confirm-btn" style="
                        padding: 10px 20px; border-radius: 10px;
                        border: none; background: #ef4444; color: #fff;
                        font-size: 13px; cursor: pointer; font-weight: 500;
                    ">Sair</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const cleanup = () => {
            overlay.remove();
            this._exitModalActive = false;
        };

        document.getElementById('exit-confirm-btn').addEventListener('click', () => {
            cleanup();
            if (onConfirm) onConfirm();
        });

        document.getElementById('exit-cancel-btn').addEventListener('click', () => {
            cleanup();
            if (onCancel) onCancel();
        });

        // Fechar com ESC
        const onEsc = (e) => {
            if (e.key === 'Escape') {
                cleanup();
                if (onCancel) onCancel();
                document.removeEventListener('keydown', onEsc);
            }
        };
        document.addEventListener('keydown', onEsc);
    },

    /**
     * Injeta os estilos CSS necessários
     */
    injectStyles() {
        if (document.getElementById('ui-enhancements-css')) return;

        const style = document.createElement('style');
        style.id = 'ui-enhancements-css';
        style.textContent = `
            /* Skeleton Loading */
            .skeleton-line {
                height: 12px;
                background: linear-gradient(90deg,
                    rgba(255,255,255,0.04) 0%,
                    rgba(255,255,255,0.08) 50%,
                    rgba(255,255,255,0.04) 100%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                border-radius: 6px;
                margin-bottom: 10px;
            }

            .skeleton-card {
                background: rgba(255,255,255,0.03);
                border-radius: 16px;
                overflow: hidden;
                border: 1px solid rgba(255,255,255,0.06);
            }

            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }

            /* Save Indicator */
            .save-indicator {
                position: fixed;
                top: 16px;
                right: 16px;
                z-index: 9990;
                padding: 6px 14px;
                border-radius: 8px;
                background: rgba(34, 197, 94, 0.15);
                color: #22c55e;
                font-size: 12px;
                font-weight: 500;
                opacity: 0;
                transform: translateY(-8px);
                transition: opacity 0.3s, transform 0.3s;
                pointer-events: none;
                backdrop-filter: blur(8px);
                border: 1px solid rgba(34, 197, 94, 0.2);
            }

            .save-indicator.visible {
                opacity: 1;
                transform: translateY(0);
            }

            /* Modal animations */
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes scaleIn {
                from { opacity: 0; transform: scale(0.92); }
                to { opacity: 1; transform: scale(1); }
            }
        `;

        document.head.appendChild(style);
    }
};

// Auto-inject styles and export
UIEnhancements.injectStyles();
window.UIEnhancements = UIEnhancements;

console.log('[UI Enhancements] Module loaded');
