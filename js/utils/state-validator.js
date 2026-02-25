/* ============================================
   STATE VALIDATOR — Demeni Sites
   Validação e reparo automático de estado D2
   ============================================ */

/**
 * Validador de estado do editor D2.
 * Garante integridade estrutural e repara campos corrompidos.
 */
const StateValidator = {

    /**
     * Valida e repara estado D2 completo.
     * @param {Object} state - Estado a validar
     * @param {Object} defaults - Estado padrão para referência
     * @returns {{ state: Object, repairs: string[], isValid: boolean }}
     */
    validate(state, defaults) {
        const repairs = [];

        if (!state || typeof state !== 'object') {
            console.error('[State Validator] Estado completamente inválido — usando defaults');
            return { state: defaults, repairs: ['Estado nulo — restaurado do zero'], isValid: false };
        }

        // 1. Validar arrays essenciais (não podem ser null/string/number)
        this._ensureArray(state, 'd2Sections', defaults.d2Sections, repairs);
        this._ensureArray(state, 'd2Products', defaults.d2Products, repairs);
        this._ensureArray(state, 'd2Feedbacks', defaults.d2Feedbacks, repairs);

        // 2. Validar objetos essenciais
        this._ensureObject(state, 'd2Adjustments', defaults.d2Adjustments, repairs);
        this._ensureObject(state, 'profile', defaults.profile, repairs);
        this._ensureObject(state, 'd2Banners', {}, repairs);

        // 3. Validar sub-objetos de d2Adjustments
        if (state.d2Adjustments) {
            const adj = state.d2Adjustments;
            const defAdj = defaults.d2Adjustments;

            ['header', 'hero', 'categorias', 'produtos', 'feedbacks', 'cta', 'footer', 'pwa'].forEach(section => {
                this._ensureObject(adj, section, defAdj[section], repairs, `d2Adjustments.${section}`);
            });

            // Hero sub-objetos críticos
            if (adj.hero) {
                ['title', 'subtitle', 'btn', 'gradient', 'scrollIndicator'].forEach(key => {
                    this._ensureObject(adj.hero, key, defAdj.hero[key], repairs, `d2Adjustments.hero.${key}`);
                });
            }

            // PWA sub-objetos
            if (adj.pwa) {
                this._ensureObject(adj.pwa, 'favicon', defAdj.pwa.favicon, repairs, 'd2Adjustments.pwa.favicon');
            }
        }

        // 4. Validar cada produto tem campos obrigatórios
        if (Array.isArray(state.d2Products)) {
            state.d2Products = state.d2Products.filter((p, i) => {
                if (!p || typeof p !== 'object') {
                    repairs.push(`d2Products[${i}] era inválido — removido`);
                    return false;
                }
                if (p.id === undefined || p.id === null) {
                    p.id = Date.now() + i;
                    repairs.push(`d2Products[${i}] sem ID — gerado`);
                }
                if (!p.title) p.title = 'Produto';
                if (!p.price) p.price = 'R$ 0,00';
                return true;
            });
        }

        // 5. Validar cada feedback tem campos obrigatórios
        if (Array.isArray(state.d2Feedbacks)) {
            state.d2Feedbacks = state.d2Feedbacks.filter((f, i) => {
                if (!f || typeof f !== 'object') {
                    repairs.push(`d2Feedbacks[${i}] era inválido — removido`);
                    return false;
                }
                if (f.id === undefined || f.id === null) {
                    f.id = Date.now() + i;
                    repairs.push(`d2Feedbacks[${i}] sem ID — gerado`);
                }
                if (!f.name) f.name = 'Cliente';
                if (!f.text) f.text = 'Depoimento';
                return true;
            });
        }

        // 6. Validar seções têm campos obrigatórios
        if (Array.isArray(state.d2Sections)) {
            state.d2Sections = state.d2Sections.filter((s, i) => {
                if (!s || typeof s !== 'object' || !s.id) {
                    repairs.push(`d2Sections[${i}] era inválido — removido`);
                    return false;
                }
                if (s.enabled === undefined) s.enabled = true;
                if (s.locked === undefined) s.locked = false;
                return true;
            });

            // Garante que Hero e Footer existem (são locked)
            if (!state.d2Sections.some(s => s.id === 'hero')) {
                state.d2Sections.unshift(defaults.d2Sections.find(s => s.id === 'hero'));
                repairs.push('Seção Hero estava faltando — restaurada');
            }
            if (!state.d2Sections.some(s => s.id === 'footer')) {
                state.d2Sections.push(defaults.d2Sections.find(s => s.id === 'footer'));
                repairs.push('Seção Footer estava faltando — restaurada');
            }
        }

        // 7. Validar campos de string essenciais
        if (typeof state.projectName !== 'string') {
            state.projectName = defaults.projectName || 'Novo Projeto D2';
            repairs.push('projectName era inválido — restaurado');
        }

        const isValid = repairs.length === 0;

        if (repairs.length > 0) {
            console.warn(`[State Validator] ${repairs.length} reparo(s) aplicado(s):`, repairs);
        } else {
            console.log('[State Validator] ✅ Estado válido');
        }

        return { state, repairs, isValid };
    },

    /**
     * Garante que um campo é um Array; se não, usa o default
     */
    _ensureArray(obj, key, defaultVal, repairs, prefix = '') {
        const path = prefix ? `${prefix}.${key}` : key;
        if (!Array.isArray(obj[key])) {
            obj[key] = defaultVal ? [...defaultVal] : [];
            repairs.push(`${path} não era array — restaurado`);
        }
    },

    /**
     * Garante que um campo é um Object; se não, usa o default
     */
    _ensureObject(obj, key, defaultVal, repairs, prefix = '') {
        const path = prefix ? `${prefix}.${key}` : key;
        if (!obj[key] || typeof obj[key] !== 'object' || Array.isArray(obj[key])) {
            obj[key] = defaultVal ? { ...defaultVal } : {};
            repairs.push(`${path} não era objeto — restaurado`);
        }
    },

    /**
     * Estima o tamanho do estado em bytes (útil para monitorar localStorage)
     */
    estimateSize(state) {
        try {
            const json = JSON.stringify(state);
            const bytes = new Blob([json]).size;
            return {
                bytes,
                kb: (bytes / 1024).toFixed(1),
                mb: (bytes / (1024 * 1024)).toFixed(2),
                imageCount: (json.match(/data:image\//g) || []).length
            };
        } catch {
            return { bytes: 0, kb: '0', mb: '0', imageCount: 0 };
        }
    }
};

// Exporta globalmente
window.StateValidator = StateValidator;

console.log('[State Validator] Module loaded');
