// Demeni Sites - Diagnostic Test Script
// Cole este código no console do navegador para testar

console.log('=== DEMENI SITES DIAGNOSTIC ===');

// Test 1: Check if state exists
console.log('1. STATE EXISTS:', typeof state !== 'undefined');
if (typeof state !== 'undefined') {
    console.log('   - Profile:', state.profile.name);
    console.log('   - Accent Color:', state.style.accentColor);
    console.log('   - BG Color:', state.style.bgColor);
    console.log('   - BG Image:', state.style.bgImage ? 'SET' : 'NOT SET');
    console.log('   - Banner Active:', state.banner?.active);
    console.log('   - Footer Text:', state.footer?.text);
}

// Test 2: Check color preset buttons
const accentPresets = document.querySelectorAll('.accent-colors .color-preset');
console.log('2. ACCENT PRESETS FOUND:', accentPresets.length);

// Test 3: Check gradient presets
const gradientPresets = document.querySelectorAll('.gradient-preset');
console.log('3. GRADIENT PRESETS FOUND:', gradientPresets.length);

// Test 4: Check background presets
const bgPresets = document.querySelectorAll('.color-preset[data-color]');
console.log('4. BG COLOR PRESETS FOUND:', bgPresets.length);

// Test 5: Check preview frame
const previewFrame = document.getElementById('preview-frame');
console.log('5. PREVIEW FRAME:', previewFrame ? 'EXISTS' : 'MISSING');

// Test 6: Check modals
const modals = document.querySelectorAll('.modal');
const activeModals = document.querySelectorAll('.modal.active');
console.log('6. MODALS:', modals.length, 'total,', activeModals.length, 'active');

// Test 7: Simulate color click
console.log('\n7. TESTING COLOR CLICK...');
if (accentPresets.length > 0) {
    const testColor = accentPresets[2]; // 3rd color (coral)
    const oldColor = state.style.accentColor;
    testColor.click();
    setTimeout(() => {
        console.log('   Before:', oldColor);
        console.log('   After:', state.style.accentColor);
        console.log('   Changed:', oldColor !== state.style.accentColor ? 'YES ✅' : 'NO ❌');
    }, 100);
}

// Test 8: Check for errors
console.log('\n8. Any errors above? Check the error log.');

console.log('\n=== END DIAGNOSTIC ===');
