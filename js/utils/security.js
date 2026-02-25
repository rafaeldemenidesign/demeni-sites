/* ============================================
   SECURITY MODULE — Demeni Sites
   Sanitização, rate limiting e anti-bot
   ============================================ */

/**
 * Security Module
 * Proteção client-side contra XSS, brute force e bots.
 */
const Security = (function () {

    // ========== HTML SANITIZER ==========

    /**
     * Escapa caracteres HTML perigosos em uma string
     * Previne XSS quando a string for inserida via innerHTML
     * @param {string} str - String a sanitizar
     * @returns {string} String escapada
     */
    function escapeHTML(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    /**
     * Remove tags HTML e atributos perigosos de uma string
     * Mantém texto seguro, remove qualquer tag
     * @param {string} html - String com possível HTML
     * @returns {string} Texto limpo sem tags
     */
    function stripHTML(html) {
        if (typeof html !== 'string') return '';
        // Cria um elemento temporário para extrair apenas texto
        const temp = document.createElement('div');
        temp.textContent = html; // textContent é seguro — não interpreta HTML
        return temp.textContent;
    }

    /**
     * Sanitiza um objeto de dados, escapando strings recursivamente
     * Útil para sanitizar dados antes de renderizar
     * @param {Object} obj - Objeto a sanitizar
     * @returns {Object} Objeto com strings escapadas
     */
    function sanitizeObject(obj) {
        if (typeof obj === 'string') return escapeHTML(obj);
        if (typeof obj !== 'object' || obj === null) return obj;
        if (Array.isArray(obj)) return obj.map(sanitizeObject);

        const clean = {};
        for (const [key, value] of Object.entries(obj)) {
            clean[key] = sanitizeObject(value);
        }
        return clean;
    }

    // ========== RATE LIMITER ==========

    const _rateLimits = {};

    /**
     * Verifica se uma ação excedeu o limite de tentativas
     * @param {string} key - Identificador da ação (ex: 'login', 'publish')
     * @param {number} maxAttempts - Máximo de tentativas permitidas
     * @param {number} windowMs - Janela de tempo em milissegundos
     * @returns {Object} { allowed: boolean, remaining: number, retryAfterMs: number }
     */
    function checkRateLimit(key, maxAttempts = 5, windowMs = 300000) {
        const now = Date.now();

        if (!_rateLimits[key]) {
            _rateLimits[key] = { attempts: [], blockedUntil: 0 };
        }

        const record = _rateLimits[key];

        // Se está bloqueado, verificar se o bloqueio expirou
        if (record.blockedUntil > now) {
            return {
                allowed: false,
                remaining: 0,
                retryAfterMs: record.blockedUntil - now
            };
        }

        // Limpar tentativas expiradas
        record.attempts = record.attempts.filter(t => now - t < windowMs);

        // Verificar se excedeu o limite
        if (record.attempts.length >= maxAttempts) {
            // Bloquear por windowMs adicional
            record.blockedUntil = now + windowMs;
            console.warn(`[Security] Rate limit exceeded for "${key}" — blocked for ${windowMs / 1000}s`);
            return {
                allowed: false,
                remaining: 0,
                retryAfterMs: windowMs
            };
        }

        // Registrar tentativa
        record.attempts.push(now);

        return {
            allowed: true,
            remaining: maxAttempts - record.attempts.length,
            retryAfterMs: 0
        };
    }

    /**
     * Reseta o rate limiter para uma chave
     * (usado após login bem-sucedido, por exemplo)
     */
    function resetRateLimit(key) {
        delete _rateLimits[key];
    }

    // ========== ANTI-BOT: HONEYPOT ==========

    /**
     * Injeta um campo honeypot invisível em um formulário
     * Bots preenchem todos os campos — humanos não veem este campo
     * @param {HTMLFormElement} form - Formulário alvo
     * @returns {string} ID do campo honeypot para verificação
     */
    function injectHoneypot(form) {
        if (!form || form.querySelector('[data-hp]')) return;

        const fieldId = '_hp_' + Math.random().toString(36).slice(2, 8);
        const field = document.createElement('input');
        field.type = 'text';
        field.name = fieldId;
        field.id = fieldId;
        field.setAttribute('data-hp', 'true');
        field.setAttribute('tabindex', '-1');
        field.setAttribute('autocomplete', 'off');
        field.style.cssText = `
            position: absolute !important;
            left: -9999px !important;
            top: -9999px !important;
            width: 1px !important;
            height: 1px !important;
            opacity: 0 !important;
            pointer-events: none !important;
        `;

        form.appendChild(field);
        return fieldId;
    }

    /**
     * Verifica se o honeypot foi preenchido (= é um bot)
     * @param {HTMLFormElement} form - Formulário a verificar
     * @returns {boolean} true se é suspeito de ser bot
     */
    function isHoneypotFilled(form) {
        if (!form) return false;
        const hp = form.querySelector('[data-hp]');
        return hp && hp.value && hp.value.length > 0;
    }

    // ========== ANTI-BOT: TEMPO MÍNIMO ==========

    const _formTimestamps = new WeakMap();

    /**
     * Registra quando um formulário foi exibido
     * Para medir o tempo de preenchimento (bots < 1s)
     */
    function markFormDisplayed(form) {
        if (form) _formTimestamps.set(form, Date.now());
    }

    /**
     * Verifica se o formulário foi preenchido rápido demais
     * @param {HTMLFormElement} form
     * @param {number} minMs - Tempo mínimo esperado (default: 1500ms)
     * @returns {boolean} true se foi rápido demais (suspeito de bot)
     */
    function isSubmittedTooFast(form, minMs = 1500) {
        if (!form) return false;
        const displayed = _formTimestamps.get(form);
        if (!displayed) return false;
        return (Date.now() - displayed) < minMs;
    }

    // ========== INPUT VALIDATION ==========

    /**
     * Valida formato de email
     */
    function isValidEmail(email) {
        if (typeof email !== 'string') return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /**
     * Valida força mínima de senha
     */
    function isStrongPassword(password) {
        if (typeof password !== 'string') return false;
        return password.length >= 6;
    }

    /**
     * Limpa e normaliza input de texto
     * Remove espaços extras, trim, e limita tamanho
     */
    function cleanInput(str, maxLength = 500) {
        if (typeof str !== 'string') return '';
        return str.trim().replace(/\s+/g, ' ').slice(0, maxLength);
    }

    // ========== PUBLIC API ==========

    console.log('[Security] Module loaded');

    return {
        // Sanitização
        escapeHTML,
        stripHTML,
        sanitizeObject,

        // Rate limiting
        checkRateLimit,
        resetRateLimit,

        // Anti-bot
        injectHoneypot,
        isHoneypotFilled,
        markFormDisplayed,
        isSubmittedTooFast,

        // Validação
        isValidEmail,
        isStrongPassword,
        cleanInput
    };
})();

window.Security = Security;
