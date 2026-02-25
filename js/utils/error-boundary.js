/* ============================================
   ERROR BOUNDARY — Demeni Sites
   Captura erros globais e evita crash total
   ============================================ */

/**
 * Global Error Boundary
 * Previne que erros JS derrubem a interface inteira.
 * Exibe overlay de recuperação ao invés de tela branca.
 */
const ErrorBoundary = {
    _errorCount: 0,
    _maxErrors: 5,
    _errorLog: [],

    /**
     * Inicializa captura global de erros
     */
    init() {
        // Captura erros não tratados
        window.addEventListener('error', (event) => {
            this._handleError({
                type: 'error',
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                col: event.colno,
                stack: event.error?.stack
            });
        });

        // Captura rejeições de Promise não tratadas
        window.addEventListener('unhandledrejection', (event) => {
            this._handleError({
                type: 'promise',
                message: event.reason?.message || String(event.reason),
                stack: event.reason?.stack
            });
            // Previne log no console (já tratamos)
            event.preventDefault();
        });

        console.log('[Error Boundary] Initialized');
    },

    /**
     * Trata um erro capturado
     */
    _handleError(errorInfo) {
        this._errorCount++;
        this._errorLog.push({
            ...errorInfo,
            timestamp: new Date().toISOString()
        });

        // Mantém apenas os últimos 20 erros
        if (this._errorLog.length > 20) {
            this._errorLog = this._errorLog.slice(-20);
        }

        console.error('[Error Boundary]', errorInfo.message);

        // Se muitos erros seguidos, mostra overlay de recuperação
        if (this._errorCount >= this._maxErrors) {
            this._showRecoveryOverlay();
        }
    },

    /**
     * Exibe overlay de recuperação que não derruba a interface
     */
    _showRecoveryOverlay() {
        // Evita duplicar overlays
        if (document.getElementById('error-recovery-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'error-recovery-overlay';
        overlay.style.cssText = `
            position: fixed; inset: 0; z-index: 99999;
            background: rgba(10, 10, 20, 0.92);
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(8px);
        `;

        overlay.innerHTML = `
            <div style="
                background: #1e1e2e; border-radius: 20px; padding: 40px;
                max-width: 420px; width: 90%; text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                border: 1px solid rgba(255,255,255,0.1);
            ">
                <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                <h2 style="color: #fff; font-size: 20px; margin-bottom: 8px; font-weight: 600;">
                    Algo deu errado
                </h2>
                <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                    Ocorreu um erro inesperado. Seus dados foram salvos automaticamente.
                </p>
                <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="ErrorBoundary.dismissOverlay()" style="
                        padding: 10px 24px; border-radius: 10px;
                        border: 1px solid rgba(255,255,255,0.2);
                        background: transparent; color: #fff;
                        font-size: 14px; cursor: pointer;
                        transition: background 0.2s;
                    " onmouseenter="this.style.background='rgba(255,255,255,0.1)'"
                       onmouseleave="this.style.background='transparent'">
                        Ignorar
                    </button>
                    <button onclick="ErrorBoundary.tryRecover()" style="
                        padding: 10px 24px; border-radius: 10px;
                        border: none; background: #5167E7; color: #fff;
                        font-size: 14px; cursor: pointer; font-weight: 500;
                        transition: opacity 0.2s;
                    " onmouseenter="this.style.opacity='0.85'"
                       onmouseleave="this.style.opacity='1'">
                        Recuperar
                    </button>
                    <button onclick="location.reload()" style="
                        padding: 10px 24px; border-radius: 10px;
                        border: 1px solid rgba(239,68,68,0.5);
                        background: transparent; color: #ef4444;
                        font-size: 14px; cursor: pointer;
                        transition: background 0.2s;
                    " onmouseenter="this.style.background='rgba(239,68,68,0.1)'"
                       onmouseleave="this.style.background='transparent'">
                        Recarregar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    /**
     * Fecha o overlay e reseta o contador
     */
    dismissOverlay() {
        const overlay = document.getElementById('error-recovery-overlay');
        if (overlay) overlay.remove();
        this._errorCount = 0;
    },

    /**
     * Tenta recuperar do checkpoint (async — IndexedDB)
     */
    async tryRecover() {
        if (window.d2State && await window.d2State.hasRecoveryCheckpoint()) {
            await window.d2State.restoreFromCheckpoint();
        }
        this.dismissOverlay();
    },

    /**
     * Retorna log de erros para debug
     */
    getErrorLog() {
        return this._errorLog;
    }
};

// Auto-init
ErrorBoundary.init();

// Exporta globalmente
window.ErrorBoundary = ErrorBoundary;
