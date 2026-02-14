// ========== GLOBAL ERROR HANDLER ==========
// Catches unhandled errors and logs them for monitoring
(function() {
    const errors = [];

    window.onerror = function(msg, url, line, col, error) {
        const entry = {
            type: 'error',
            message: msg,
            source: url,
            line: line,
            col: col,
            stack: error?.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        errors.push(entry);
        console.error('[Demeni Error]', entry);

        // Optional: send to Supabase (uncomment when ready)
        // try {
        //     if (window.SupabaseClient?.isConfigured()) {
        //         SupabaseClient.getClient().from('error_logs').insert(entry);
        //     }
        // } catch(e) {}

        return false; // Don't suppress the error
    };

    window.onunhandledrejection = function(event) {
        const entry = {
            type: 'unhandled_promise',
            message: event.reason?.message || String(event.reason),
            stack: event.reason?.stack,
            timestamp: new Date().toISOString()
        };
        errors.push(entry);
        console.error('[Demeni Promise Error]', entry);
    };

    // Expose for debugging
    window.__demeniErrors = errors;
})();
