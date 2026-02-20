/* ===========================
   DEMENI SITES - NICHE TEMPLATES
   Template library for D-2 editor
   =========================== */

/**
 * NICHE_TEMPLATES
 * Central registry of all available niche templates.
 * Each template contains: id, name, description, icon, palettes, typography, sections, navigation
 */
const NICHE_TEMPLATES = {
    // Templates will be added here as they are created
    // Example structure:
    // florista: { id: 'florista', name: 'Floricultura', ... }
};

/**
 * Get a template by its ID
 * @param {string} templateId - Template identifier (e.g., 'florista', 'pizzaria')
 * @returns {Object|null} Template object or null if not found
 */
function getTemplate(templateId) {
    return NICHE_TEMPLATES[templateId] || null;
}

/**
 * Get all available templates
 * @returns {Array} Array of template objects
 */
function getAllTemplates() {
    return Object.values(NICHE_TEMPLATES);
}

/**
 * Get a specific palette from a template
 * @param {string} templateId - Template identifier
 * @param {string} paletteId - Palette identifier (e.g., 'classico', 'moderno')
 * @returns {Object|null} Palette object or null if not found
 */
function getTemplatePalette(templateId, paletteId) {
    const template = getTemplate(templateId);
    if (!template || !template.palettes) return null;
    return template.palettes.find(p => p.id === paletteId) || template.palettes[0];
}

/**
 * Check if a template exists
 * @param {string} templateId - Template identifier
 * @returns {boolean} True if template exists
 */
function templateExists(templateId) {
    return templateId in NICHE_TEMPLATES;
}

/**
 * Register a new template (used by individual template files)
 * @param {string} templateId - Unique template identifier
 * @param {Object} templateData - Template configuration object
 */
function registerTemplate(templateId, templateData) {
    if (NICHE_TEMPLATES[templateId]) {
        console.warn(`[Templates] Template "${templateId}" already registered, overwriting.`);
    }
    NICHE_TEMPLATES[templateId] = templateData;
    console.log(`[Templates] Registered template: ${templateId}`);
}

// Export for use in other files (if using modules in the future)
// For now, these are global functions
window.NICHE_TEMPLATES = NICHE_TEMPLATES;
window.getTemplate = getTemplate;
window.getAllTemplates = getAllTemplates;
window.getTemplatePalette = getTemplatePalette;
window.templateExists = templateExists;
window.registerTemplate = registerTemplate;

console.log('[Templates] Template system initialized');
