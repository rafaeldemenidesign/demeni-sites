/* ===========================
   DEMENI SITES - EDITOR JS
   Core functionality for site builder
   =========================== */

// ========== STATE ==========
const state = {
    projectName: 'Meu Site',
    profile: {
        name: 'Seu Nome',
        role: 'Sua Profissão',
        bio: 'Uma breve descrição sobre você e seu trabalho.',
        avatar: 'https://ui-avatars.com/api/?name=User&background=1B97C0&color=fff&size=200&bold=true',
        whatsapp: '',
        nameSize: 24,
        roleSize: 16,
        bioSize: 14
    },
    links: [
        { id: 1, label: 'Instagram', url: '', icon: 'instagram' },
        { id: 2, label: 'WhatsApp', url: '', icon: 'whatsapp' },
        { id: 3, label: 'E-mail', url: '', icon: 'envelope' },
        { id: 4, label: 'Site', url: '', icon: 'globe' }
    ],
    style: {
        accentColor: '#1B97C0',
        accentGradient: null,
        bgColor: '#000000',
        bgImage: null,
        buttonStyle: 'glass', // glass, solid, outline
        buttonCorners: 10, // 0-50 px border-radius
        buttonShadow: 'none', // none, subtle, strong, hard
        buttonColor: '#D4AF37',
        buttonTextColor: '#000000',
        fontFamily: 'Montserrat'
    },
    banner: {
        active: false,
        image: null,
        tag: '',
        title: '',
        description: '',
        cta: 'Saiba Mais',
        link: ''
    },
    footer: {
        logo: null,
        text: '',
        link: ''
    },
    banners: [
        { image: null, title: '', link: '', orientation: 'horizontal' },
        { image: null, title: '', link: '', orientation: 'horizontal' },
        { image: null, title: '', link: '', orientation: 'horizontal' }
    ],
    bannersActive: false,
    video: {
        active: false,
        url: '',
        embedUrl: '',
        title: '',
        ctaText: '',
        ctaLink: '',
        isVertical: false
    },
    blockOrder: ['banners', 'links', 'video'] // ordem dos blocos arrastáveis
};

let linkIdCounter = 5;
let cropper = null;
let cropTarget = null; // 'avatar' or 'bg'

// Helper: Update default avatar color when accent changes
function updateDefaultAvatar() {
    // Only update if using default ui-avatars.com avatar
    if (state.profile.avatar && state.profile.avatar.includes('ui-avatars.com')) {
        const name = encodeURIComponent(state.profile.name || 'User');
        const color = state.style.accentColor.replace('#', '');
        state.profile.avatar = `https://ui-avatars.com/api/?name=${name}&background=${color}&color=000&size=200&bold=true`;

        // Update avatar preview in sidebar
        const avatarImg = document.getElementById('avatar-img');
        if (avatarImg) avatarImg.src = state.profile.avatar;
    }
}

// ========== ICON MAP ==========
const iconMap = {
    instagram: '<i class="fab fa-instagram"></i>',
    whatsapp: '<i class="fab fa-whatsapp"></i>',
    youtube: '<i class="fab fa-youtube"></i>',
    linkedin: '<i class="fab fa-linkedin-in"></i>',
    tiktok: '<i class="fab fa-tiktok"></i>',
    email: '<i class="fas fa-envelope"></i>',
    envelope: '<i class="fas fa-envelope"></i>',
    website: '<i class="fas fa-globe"></i>',
    globe: '<i class="fas fa-globe"></i>',
    phone: '<i class="fas fa-phone"></i>',
    location: '<i class="fas fa-map-marker-alt"></i>',
    link: '<i class="fas fa-link"></i>'
};

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupBackButton();
    setupTabNavigation();
    setupProfileInputs();
    setupColorInputs();
    setupImageUploads();
    setupStylePresets();
    setupLinksPanel();
    setupBanner();
    setupFooter();
    setupModals();
    setupPublishButton();
    setupBannersCarousel();
    setupVideoPanel();
    setupBackgroundImage();
    setupBlockOrder();
    setupButtonCustomization();
    setupTextSizes();

    // Initial render
    renderLinksList();
    renderPreview();

    // Auto-save
    loadFromStorage();
}

// ========== BACK BUTTON ==========
function setupBackButton() {
    const backBtn = document.getElementById('btn-back');
    backBtn.addEventListener('click', () => {
        // Save before leaving
        saveToStorage();
        // Go back to dashboard
        window.location.href = 'app.html';
    });
}

// ========== TAB NAVIGATION ==========
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`tab-${targetId}`).classList.add('active');
        });
    });
}

// ========== PROFILE INPUTS ==========
function setupProfileInputs() {
    const nameInput = document.getElementById('input-name');
    const roleInput = document.getElementById('input-role');
    const bioInput = document.getElementById('input-bio');
    const whatsappInput = document.getElementById('input-whatsapp');
    const projectNameInput = document.getElementById('project-name');

    nameInput.addEventListener('input', (e) => {
        state.profile.name = e.target.value || 'Seu Nome';
        renderPreview();
        saveToStorage();
    });

    roleInput.addEventListener('input', (e) => {
        state.profile.role = e.target.value || 'Sua Profissão';
        renderPreview();
        saveToStorage();
    });

    bioInput.addEventListener('input', (e) => {
        state.profile.bio = e.target.value || '';
        renderPreview();
        saveToStorage();
    });

    whatsappInput.addEventListener('input', (e) => {
        state.profile.whatsapp = e.target.value.replace(/\D/g, '');
        renderPreview();
        saveToStorage();
    });

    projectNameInput.addEventListener('input', (e) => {
        state.projectName = e.target.value || 'Meu Site';
        saveToStorage();
    });
}

// ========== COLOR INPUTS ==========
function setupColorInputs() {
    const accentInput = document.getElementById('color-accent');
    const colorValue = document.querySelector('.color-value');

    // Accent color presets (solid colors)
    const accentPresets = document.querySelectorAll('.accent-colors .color-preset');
    accentPresets.forEach(preset => {
        preset.addEventListener('click', () => {
            // Remove active from all accent and gradient presets
            accentPresets.forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.gradient-preset').forEach(p => p.classList.remove('active'));
            preset.classList.add('active');

            state.style.accentColor = preset.dataset.accent;
            state.style.accentGradient = null; // Clear gradient
            accentInput.value = preset.dataset.accent;
            colorValue.textContent = preset.dataset.accent.toUpperCase();

            // Update default avatar if user hasn't uploaded custom photo
            updateDefaultAvatar();

            renderPreview();
            saveToStorage();
        });
    });

    // Gradient presets
    const gradientPresets = document.querySelectorAll('.gradient-preset');
    gradientPresets.forEach(preset => {
        preset.addEventListener('click', () => {
            // Remove active from all presets
            accentPresets.forEach(p => p.classList.remove('active'));
            gradientPresets.forEach(p => p.classList.remove('active'));
            preset.classList.add('active');

            state.style.accentGradient = preset.dataset.gradient;
            // Extract first color from gradient for avatar fallback
            const gradientMatch = preset.dataset.gradient.match(/#[A-Fa-f0-9]{6}/);
            if (gradientMatch) {
                state.style.accentColor = gradientMatch[0];
            }
            colorValue.textContent = 'GRADIENTE';
            updateDefaultAvatar();
            renderPreview();
            saveToStorage();
        });
    });

    // Advanced color picker toggle
    const advancedBtn = document.getElementById('btn-advanced-color');
    const advancedPicker = document.getElementById('advanced-color-picker');
    if (advancedBtn && advancedPicker) {
        advancedBtn.addEventListener('click', () => {
            advancedPicker.style.display = advancedPicker.style.display === 'none' ? 'block' : 'none';
        });
    }

    // Advanced color input
    accentInput.addEventListener('input', (e) => {
        state.style.accentColor = e.target.value;
        state.style.accentGradient = null;
        colorValue.textContent = e.target.value.toUpperCase();
        // Remove active from presets
        accentPresets.forEach(p => p.classList.remove('active'));
        gradientPresets.forEach(p => p.classList.remove('active'));
        updateDefaultAvatar();
        renderPreview();
        saveToStorage();
    });

    // Background presets
    const bgPresets = document.querySelectorAll('.color-preset[data-color]');
    bgPresets.forEach(preset => {
        preset.addEventListener('click', () => {
            bgPresets.forEach(p => p.classList.remove('active'));
            preset.classList.add('active');
            state.style.bgColor = preset.dataset.color;
            renderPreview();
            saveToStorage();
        });
    });
}

// ========== IMAGE UPLOADS ==========
function setupImageUploads() {
    const avatarPreview = document.getElementById('avatar-preview');
    const avatarInput = document.getElementById('avatar-input');
    const uploadBtn = document.getElementById('btn-upload-avatar');

    const bgInput = document.getElementById('bg-input');
    const bgUploadBtn = document.getElementById('btn-upload-bg');
    const bgRemoveBtn = document.getElementById('btn-remove-bg');

    // Avatar
    if (avatarPreview) avatarPreview.addEventListener('click', () => avatarInput.click());
    if (uploadBtn) uploadBtn.addEventListener('click', () => avatarInput.click());

    if (avatarInput) {
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                cropTarget = 'avatar';
                openCropModal(file);
            }
        });
    }

    // Background (elements may not exist if section was removed)
    if (bgUploadBtn && bgInput) {
        bgUploadBtn.addEventListener('click', () => bgInput.click());
    }

    if (bgInput) {
        bgInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                cropTarget = 'bg';
                openCropModal(file);
            }
            // Reset input to allow re-selecting same file
            e.target.value = '';
        });
    }

    if (bgRemoveBtn) {
        bgRemoveBtn.addEventListener('click', () => {
            state.style.bgImage = null;
            updateBgPreview();
            renderPreview();
            saveToStorage();
        });
    }

    // Edit existing background image
    const bgEditBtn = document.getElementById('btn-edit-bg');
    if (bgEditBtn) {
        bgEditBtn.addEventListener('click', () => {
            if (state.style.bgImage) {
                cropTarget = 'bg';
                openCropModalFromDataUrl(state.style.bgImage);
            }
        });
    }
}

// Open crop modal with existing image (data URL)
function openCropModalFromDataUrl(dataUrl) {
    const modal = document.getElementById('modal-crop');
    const cropImage = document.getElementById('crop-image');

    cropImage.src = dataUrl;
    modal.classList.add('active');

    cropImage.onload = () => {
        if (cropper) cropper.destroy();

        const aspectRatio = cropTarget === 'avatar' ? 1 : 9 / 16;
        cropper = new Cropper(cropImage, {
            aspectRatio: aspectRatio,
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 1,
            cropBoxResizable: true,
            background: false
        });
    };
}

function openCropModal(file) {
    const modal = document.getElementById('modal-crop');
    const cropImage = document.getElementById('crop-image');

    const reader = new FileReader();
    reader.onload = (e) => {
        cropImage.src = e.target.result;
        modal.classList.add('active');

        // Wait for image to load
        cropImage.onload = () => {
            if (cropper) cropper.destroy();

            const aspectRatio = cropTarget === 'avatar' ? 1 : 9 / 16; // 9:16 portrait for mobile background
            cropper = new Cropper(cropImage, {
                aspectRatio: aspectRatio,
                viewMode: 1,
                dragMode: 'move',
                autoCropArea: 1,
                cropBoxResizable: true,
                background: false
            });
        };
    };
    reader.readAsDataURL(file);
}

function closeCropModal() {
    const modal = document.getElementById('modal-crop');
    modal.classList.remove('active');
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
}

function applyCrop() {
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({
        width: cropTarget === 'avatar' ? 400 : 1200,
        height: cropTarget === 'avatar' ? 400 : 675,
        imageSmoothingQuality: 'high'
    });

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    if (cropTarget === 'avatar') {
        state.profile.avatar = dataUrl;
        document.getElementById('avatar-img').src = dataUrl;
    } else {
        state.style.bgImage = dataUrl;
        updateBgPreview();
    }

    closeCropModal();
    renderPreview();
    saveToStorage();
}

function updateBgPreview() {
    const bgPreview = document.getElementById('bg-preview');
    const bgRemoveBtn = document.getElementById('btn-remove-bg');
    const bgEditBtn = document.getElementById('btn-edit-bg');

    // Safety check - element may not exist
    if (!bgPreview) return;

    if (state.style.bgImage) {
        bgPreview.innerHTML = `<img src="${state.style.bgImage}" alt="Background">`;
        if (bgRemoveBtn) bgRemoveBtn.disabled = false;
        if (bgEditBtn) bgEditBtn.disabled = false;
    } else {
        bgPreview.innerHTML = '<span>Sem imagem</span>';
        if (bgRemoveBtn) bgRemoveBtn.disabled = true;
        if (bgEditBtn) bgEditBtn.disabled = true;
    }
}

// ========== BANNER DE DESTAQUE ==========
function setupBanner() {
    const bannerPreview = document.getElementById('banner-preview');
    const bannerInput = document.getElementById('banner-input');
    const bannerTag = document.getElementById('banner-tag');
    const bannerTitle = document.getElementById('banner-title');
    const bannerDesc = document.getElementById('banner-desc');
    const bannerCta = document.getElementById('banner-cta');
    const bannerLink = document.getElementById('banner-link');
    const bannerActive = document.getElementById('banner-active');

    if (!bannerPreview) return;

    // Banner image upload
    bannerPreview.addEventListener('click', () => bannerInput.click());
    bannerInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            compressImage(file, 200, 0.8, (dataUrl) => {
                state.banner.image = dataUrl;
                bannerPreview.innerHTML = `<img src="${dataUrl}" alt="Banner">`;
                renderPreview();
                saveToStorage();
            });
        }
    });

    // Banner text inputs
    bannerTag?.addEventListener('input', (e) => {
        state.banner.tag = e.target.value;
        renderPreview();
        saveToStorage();
    });

    bannerTitle?.addEventListener('input', (e) => {
        state.banner.title = e.target.value;
        renderPreview();
        saveToStorage();
    });

    bannerDesc?.addEventListener('input', (e) => {
        state.banner.description = e.target.value;
        renderPreview();
        saveToStorage();
    });

    bannerCta?.addEventListener('input', (e) => {
        state.banner.cta = e.target.value || 'Saiba Mais';
        renderPreview();
        saveToStorage();
    });

    bannerLink?.addEventListener('input', (e) => {
        state.banner.link = e.target.value;
        saveToStorage();
    });

    bannerActive?.addEventListener('change', (e) => {
        state.banner.active = e.target.checked;
        renderPreview();
        saveToStorage();
    });
}

// ========== FOOTER/ASSINATURA ==========
function setupFooter() {
    const footerLogoPreview = document.getElementById('footer-logo-preview');
    const footerLogoInput = document.getElementById('footer-logo-input');
    const footerLogoBtn = document.getElementById('btn-upload-footer-logo');
    const footerText = document.getElementById('footer-text');
    const footerLink = document.getElementById('footer-link');

    // Footer logo upload - button click triggers file input
    if (footerLogoBtn && footerLogoInput) {
        footerLogoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            footerLogoInput.click();
        });
    }

    // File selected handler
    if (footerLogoInput) {
        footerLogoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                compressImage(file, 50, 0.7, (dataUrl) => {
                    state.footer.logo = dataUrl;
                    if (footerLogoPreview) {
                        footerLogoPreview.innerHTML = `<img src="${dataUrl}" alt="Logo">`;
                    }
                    renderPreview();
                    saveToStorage();
                });
            }
        });
    }

    // Also allow clicking the preview box to upload
    if (footerLogoPreview && footerLogoInput) {
        footerLogoPreview.addEventListener('click', () => {
            footerLogoInput.click();
        });
    }

    // Footer text inputs
    if (footerText) {
        footerText.addEventListener('input', (e) => {
            state.footer.text = e.target.value;
            renderPreview();
            saveToStorage();
        });
    }

    if (footerLink) {
        footerLink.addEventListener('input', (e) => {
            state.footer.link = e.target.value;
            saveToStorage();
        });
    }
}

// Compress image utility
function compressImage(file, maxKB, quality, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxWidth = maxKB < 100 ? 200 : 800;
            const maxHeight = maxKB < 100 ? 200 : 450;

            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = height * (maxWidth / width);
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = width * (maxHeight / height);
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            callback(canvas.toDataURL('image/jpeg', quality));
        };
    };
}

// ========== STYLE PRESETS ==========
function setupStylePresets() {
    const stylePresets = document.querySelectorAll('.style-preset');

    stylePresets.forEach(preset => {
        preset.addEventListener('click', () => {
            stylePresets.forEach(p => p.classList.remove('active'));
            preset.classList.add('active');
            state.style.buttonStyle = preset.dataset.style;
            renderPreview();
            saveToStorage();
        });
    });
}

// ========== BUTTON CUSTOMIZATION (1.1-1.4) ==========
function setupButtonCustomization() {
    // 1.1 Corners Slider
    const cornersSlider = document.getElementById('btn-corners');
    const cornersValue = document.getElementById('corners-value');

    if (cornersSlider && cornersValue) {
        cornersSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            cornersValue.textContent = value + 'px';
            state.style.buttonCorners = parseInt(value);
            renderPreview();
            saveToStorage();
        });
    }

    // 1.2 Shadow Pills
    const shadowPills = document.querySelectorAll('.shadow-pill');
    shadowPills.forEach(pill => {
        pill.addEventListener('click', () => {
            shadowPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            state.style.buttonShadow = pill.dataset.shadow;
            renderPreview();
            saveToStorage();
        });
    });

    // 1.3 Button Color
    const btnColorInput = document.getElementById('btn-color');
    const btnColorHex = document.getElementById('btn-color-hex');

    if (btnColorInput && btnColorHex) {
        btnColorInput.addEventListener('input', (e) => {
            const color = e.target.value;
            btnColorHex.textContent = color.toUpperCase();
            state.style.buttonColor = color;
            renderPreview();
            saveToStorage();
        });
    }

    // 1.4 Button Text Color
    const btnTextColorInput = document.getElementById('btn-text-color');
    const btnTextColorHex = document.getElementById('btn-text-color-hex');

    if (btnTextColorInput && btnTextColorHex) {
        btnTextColorInput.addEventListener('input', (e) => {
            const color = e.target.value;
            btnTextColorHex.textContent = color.toUpperCase();
            state.style.buttonTextColor = color;
            renderPreview();
            saveToStorage();
        });
    }
}

// ========== TEXT SIZES (2.1-2.3) ==========
function setupTextSizes() {
    const STEP = 7;
    const MIN_SIZE = 10;
    const MAX_SIZE = 42;

    const sizeMap = {
        name: { default: 24, field: 'nameSize' },
        role: { default: 16, field: 'roleSize' },
        bio: { default: 14, field: 'bioSize' }
    };

    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target; // 'name', 'role', 'bio'
            const action = btn.dataset.action; // 'plus', 'minus'
            const config = sizeMap[target];

            if (!config) return;

            let current = state.profile[config.field] || config.default;

            if (action === 'plus' && current < MAX_SIZE) current += STEP;
            if (action === 'minus' && current > MIN_SIZE) current -= STEP;

            state.profile[config.field] = current;

            // Update display
            const display = document.getElementById(`${target}-size`);
            if (display) display.textContent = current;

            renderPreview();
            saveToStorage();
        });
    });

    // 2.4 Font Select
    const fontSelect = document.getElementById('font-select');
    if (fontSelect) {
        fontSelect.addEventListener('change', (e) => {
            state.style.fontFamily = e.target.value;
            renderPreview();
            saveToStorage();
        });
    }
}

// ========== LINKS PANEL ==========
function setupLinksPanel() {
    const addBtn = document.getElementById('btn-add-link');
    const quickBtns = document.querySelectorAll('.quick-link-btn');

    addBtn.addEventListener('click', () => {
        addLink('Novo Link', '', 'link');
    });

    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const labels = {
                instagram: 'Instagram',
                youtube: 'YouTube',
                linkedin: 'LinkedIn',
                tiktok: 'TikTok',
                email: 'E-mail',
                website: 'Site'
            };
            addLink(labels[type] || type, '', type);
        });
    });
}

function addLink(label, url, icon) {
    state.links.push({
        id: linkIdCounter++,
        label: label,
        url: url,
        icon: icon
    });
    renderLinksList();
    renderPreview();
    saveToStorage();
}

function removeLink(id) {
    state.links = state.links.filter(l => l.id !== id);
    renderLinksList();
    renderPreview();
    saveToStorage();
}

function updateLinkLabel(id, value) {
    const link = state.links.find(l => l.id === id);
    if (link) {
        link.label = value;
        // Auto-detect icon
        const lower = value.toLowerCase();
        if (lower.includes('instagram')) link.icon = 'instagram';
        else if (lower.includes('whatsapp')) link.icon = 'whatsapp';
        else if (lower.includes('youtube')) link.icon = 'youtube';
        else if (lower.includes('linkedin')) link.icon = 'linkedin';
        else if (lower.includes('tiktok')) link.icon = 'tiktok';
        else if (lower.includes('email') || lower.includes('e-mail')) link.icon = 'email';
        else if (lower.includes('site') || lower.includes('website')) link.icon = 'website';
    }
    renderPreview();
    saveToStorage();
}

function updateLinkUrl(id, value) {
    const link = state.links.find(l => l.id === id);
    if (link) {
        // Store raw value (username or number)
        link.rawValue = value;
        // Generate final URL based on link type
        link.url = generateSmartUrl(link.icon, value);
    }
    renderPreview();
    saveToStorage();
}

// Generate URL from username/number based on link type
function generateSmartUrl(type, value) {
    if (!value) return '';

    // Remove any existing prefixes
    value = value.trim();

    switch (type) {
        case 'instagram':
            // Remove @ if present
            value = value.replace(/^@/, '');
            // If already a URL, return as is
            if (value.includes('instagram.com')) return value;
            return `https://instagram.com/${value}`;

        case 'whatsapp':
            // Keep only numbers
            value = value.replace(/\D/g, '');
            return `https://wa.me/${value}`;

        case 'youtube':
            if (value.includes('youtube.com') || value.includes('youtu.be')) return value;
            value = value.replace(/^@/, '');
            return `https://youtube.com/@${value}`;

        case 'tiktok':
            if (value.includes('tiktok.com')) return value;
            value = value.replace(/^@/, '');
            return `https://tiktok.com/@${value}`;

        case 'linkedin':
            if (value.includes('linkedin.com')) return value;
            return `https://linkedin.com/in/${value}`;

        case 'email':
        case 'envelope':
            if (value.startsWith('mailto:')) return value;
            if (value.includes('@')) return `mailto:${value}`;
            return value;

        case 'phone':
            value = value.replace(/\D/g, '');
            return `tel:+${value}`;

        default:
            // If it's a URL, return as is
            if (value.startsWith('http://') || value.startsWith('https://')) return value;
            // Otherwise, add https://
            return `https://${value}`;
    }
}

// Get placeholder based on link type
function getPlaceholder(type) {
    switch (type) {
        case 'instagram': return '@seuusuario';
        case 'whatsapp': return '5511999999999';
        case 'youtube': return '@seucanal';
        case 'tiktok': return '@seuusuario';
        case 'linkedin': return 'seuperfil';
        case 'email':
        case 'envelope': return 'seu@email.com';
        case 'phone': return '5511999999999';
        default: return 'https://seusite.com';
    }
}

function renderLinksList() {
    const container = document.getElementById('links-list');

    container.innerHTML = state.links.map(link => `
        <div class="link-item" data-id="${link.id}">
            <div class="link-item-header">
                <div class="link-item-icon">
                    ${iconMap[link.icon] || iconMap.link}
                </div>
                <input type="text" 
                       value="${link.label}" 
                       placeholder="Título do link"
                       onchange="updateLinkLabel(${link.id}, this.value)"
                       oninput="updateLinkLabel(${link.id}, this.value)">
                <button class="link-item-delete" onclick="removeLink(${link.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <input type="text" 
                   class="link-item-url"
                   value="${link.rawValue || link.url || ''}" 
                   placeholder="${getPlaceholder(link.icon)}"
                   onchange="updateLinkUrl(${link.id}, this.value)"
                   oninput="updateLinkUrl(${link.id}, this.value)">
        </div>
    `).join('');
}

// ========== MODALS ==========
function setupModals() {
    // Crop modal
    document.getElementById('crop-cancel').addEventListener('click', closeCropModal);
    document.getElementById('crop-cancel-btn').addEventListener('click', closeCropModal);
    document.getElementById('crop-confirm').addEventListener('click', applyCrop);

    // Publish modal
    document.getElementById('publish-close').addEventListener('click', closePublishModal);

    // Close on overlay click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                if (cropper) {
                    cropper.destroy();
                    cropper = null;
                }
            }
        });
    });
}

// ========== BANNER SETUP ==========
function setupBanner() {
    const bannerInput = document.getElementById('banner-input');
    const bannerPreview = document.getElementById('banner-preview');
    const bannerTag = document.getElementById('banner-tag');
    const bannerTitle = document.getElementById('banner-title');
    const bannerDesc = document.getElementById('banner-desc');
    const bannerCta = document.getElementById('banner-cta');
    const bannerLink = document.getElementById('banner-link');
    const bannerActive = document.getElementById('banner-active');

    // Image upload
    if (bannerPreview && bannerInput) {
        bannerPreview.addEventListener('click', () => bannerInput.click());

        bannerInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Compress to max 200KB
                compressImage(file, 200, (dataUrl) => {
                    state.banner.image = dataUrl;
                    bannerPreview.innerHTML = `<img src="${dataUrl}" alt="Banner">`;
                    renderPreview();
                    saveToStorage();
                });
            }
        });
    }

    // Text inputs
    if (bannerTag) {
        bannerTag.addEventListener('input', (e) => {
            state.banner.tag = e.target.value;
            renderPreview();
            saveToStorage();
        });
    }
    if (bannerTitle) {
        bannerTitle.addEventListener('input', (e) => {
            state.banner.title = e.target.value;
            renderPreview();
            saveToStorage();
        });
    }
    if (bannerDesc) {
        bannerDesc.addEventListener('input', (e) => {
            state.banner.description = e.target.value;
            renderPreview();
            saveToStorage();
        });
    }
    if (bannerCta) {
        bannerCta.addEventListener('input', (e) => {
            state.banner.cta = e.target.value;
            renderPreview();
            saveToStorage();
        });
    }
    if (bannerLink) {
        bannerLink.addEventListener('input', (e) => {
            state.banner.link = e.target.value;
            renderPreview();
            saveToStorage();
        });
    }

    // Active toggle
    if (bannerActive) {
        bannerActive.addEventListener('change', (e) => {
            state.banner.active = e.target.checked;
            renderPreview();
            saveToStorage();
        });
    }
}

// ========== FOOTER SETUP ==========
function setupFooter() {
    const footerLogo = document.getElementById('footer-logo');
    const footerLogoPreview = document.getElementById('footer-logo-preview');
    const footerText = document.getElementById('footer-text');
    const footerLink = document.getElementById('footer-link');

    // Logo upload
    if (footerLogoPreview && footerLogo) {
        footerLogoPreview.addEventListener('click', () => footerLogo.click());

        footerLogo.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Compress to max 50KB
                compressImage(file, 50, (dataUrl) => {
                    state.footer.logo = dataUrl;
                    footerLogoPreview.innerHTML = `<img src="${dataUrl}" alt="Logo">`;
                    renderPreview();
                    saveToStorage();
                });
            }
        });
    }

    // Text input
    if (footerText) {
        footerText.addEventListener('input', (e) => {
            state.footer.text = e.target.value;
            renderPreview();
            saveToStorage();
        });
    }

    // Link input
    if (footerLink) {
        footerLink.addEventListener('input', (e) => {
            state.footer.link = e.target.value;
            renderPreview();
            saveToStorage();
        });
    }
}

// Helper: Compress image to max KB
function compressImage(file, maxKB, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Scale down if needed
            const maxDim = 1200;
            if (width > maxDim || height > maxDim) {
                if (width > height) {
                    height = (height * maxDim) / width;
                    width = maxDim;
                } else {
                    width = (width * maxDim) / height;
                    height = maxDim;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Start with high quality and reduce
            let quality = 0.9;
            let dataUrl = canvas.toDataURL('image/jpeg', quality);

            while (dataUrl.length > maxKB * 1024 && quality > 0.1) {
                quality -= 0.1;
                dataUrl = canvas.toDataURL('image/jpeg', quality);
            }

            callback(dataUrl);
        };
    };
}

function closePublishModal() {
    document.getElementById('modal-publish').classList.remove('active');
    // Reset to step 1
    hideAllPublishSteps();
    document.getElementById('publish-step-subdomain').style.display = 'block';
}

// ========== PUBLISH SYSTEM ==========
const PUBLISH_COST = 40; // credits required for first publish

function setupPublishButton() {
    const btn = document.getElementById('btn-publish');
    btn.addEventListener('click', openPublishModal);

    // Preview button
    document.getElementById('btn-preview').addEventListener('click', openFullPreview);

    // Subdomain input validation
    const subdomainInput = document.getElementById('subdomain-input');
    if (subdomainInput) {
        let debounceTimer;
        subdomainInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(validateSubdomain, 500);
        });
    }

    // Confirm publish button
    document.getElementById('btn-confirm-publish')?.addEventListener('click', confirmPublish);

    // Update site button  
    document.getElementById('btn-update-site')?.addEventListener('click', updateExistingSite);
}

function openPublishModal() {
    const modal = document.getElementById('modal-publish');
    const currentProject = UserData?.getCurrentProject?.() || {};

    // Check if already published (has subdomain)
    if (currentProject.subdomain) {
        // Show update step
        hideAllPublishSteps();
        document.getElementById('publish-step-update').style.display = 'block';
        const url = `https://${currentProject.subdomain}.rafaeldemeni.com`;
        document.getElementById('published-url').href = url;
        document.getElementById('published-url').textContent = url;
    } else {
        // Show subdomain selection step
        hideAllPublishSteps();
        document.getElementById('publish-step-subdomain').style.display = 'block';

        // Check credits
        const credits = Credits?.getCredits?.() || 0;
        if (credits < PUBLISH_COST) {
            hideAllPublishSteps();
            document.getElementById('publish-step-nocredits').style.display = 'block';
            document.getElementById('nocredits-balance').textContent = credits;
        } else {
            document.getElementById('publish-credits-balance').textContent = credits;
        }
    }

    modal.classList.add('active');
}

function hideAllPublishSteps() {
    document.getElementById('publish-step-subdomain').style.display = 'none';
    document.getElementById('publish-step-update').style.display = 'none';
    document.getElementById('publish-step-success').style.display = 'none';
    document.getElementById('publish-step-nocredits').style.display = 'none';
}

async function validateSubdomain() {
    const input = document.getElementById('subdomain-input');
    const errorEl = document.getElementById('subdomain-error');
    const availableEl = document.getElementById('subdomain-available');
    const confirmBtn = document.getElementById('btn-confirm-publish');

    const slug = input.value.trim().toLowerCase();

    // Reset
    errorEl.style.display = 'none';
    availableEl.style.display = 'none';
    confirmBtn.disabled = true;

    if (!slug) return;

    // Basic validation
    if (slug.length < 3) {
        errorEl.textContent = 'Mínimo 3 caracteres';
        errorEl.style.display = 'block';
        return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
        errorEl.textContent = 'Apenas letras minúsculas, números e hífens';
        errorEl.style.display = 'block';
        return;
    }

    if (slug.startsWith('-') || slug.endsWith('-')) {
        errorEl.textContent = 'Não pode começar ou terminar com hífen';
        errorEl.style.display = 'block';
        return;
    }

    // Reserved slugs
    const reserved = ['www', 'admin', 'api', 'app', 'mail', 'ftp', 'test', 'demo'];
    if (reserved.includes(slug)) {
        errorEl.textContent = 'Este nome está reservado';
        errorEl.style.display = 'block';
        return;
    }

    // Check availability (TODO: implement database check)
    // For now, assume available if it passes validation
    availableEl.style.display = 'block';
    confirmBtn.disabled = false;
}

async function confirmPublish() {
    const confirmBtn = document.getElementById('btn-confirm-publish');
    const slug = document.getElementById('subdomain-input').value.trim().toLowerCase();

    if (!slug) return;

    // Show loading
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';

    try {
        // Deduct credits
        if (Credits && typeof Credits.deductCredits === 'function') {
            const result = Credits.deductCredits(PUBLISH_COST, 'Publicação de site');
            if (!result.success) {
                alert('Créditos insuficientes');
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = '<i class="fas fa-rocket"></i> Publicar Agora';
                return;
            }
        }

        // Save subdomain to project
        const currentProjectId = UserData?.getCurrentProjectId?.();
        if (currentProjectId) {
            const project = UserData.getProject(currentProjectId);
            if (project) {
                project.subdomain = slug;
                project.published = true;
                project.publishedAt = new Date().toISOString();
                project.publishedUrl = `https://${slug}.rafaeldemeni.com`;
                UserData.saveProject(currentProjectId, project);
            }
        }

        // Show success
        hideAllPublishSteps();
        document.getElementById('publish-step-success').style.display = 'block';
        const url = `https://${slug}.rafaeldemeni.com`;
        document.getElementById('success-url').href = url;
        document.getElementById('success-url').textContent = url;

    } catch (error) {
        console.error('Publish error:', error);
        alert('Erro ao publicar. Tente novamente.');
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="fas fa-rocket"></i> Publicar Agora';
    }
}

async function updateExistingSite() {
    const updateBtn = document.getElementById('btn-update-site');

    // Show loading
    updateBtn.disabled = true;
    updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atualizando...';

    try {
        // Update project timestamp
        const currentProjectId = UserData?.getCurrentProjectId?.();
        if (currentProjectId) {
            const project = UserData.getProject(currentProjectId);
            if (project) {
                project.updatedAt = new Date().toISOString();
                UserData.saveProject(currentProjectId, project);
            }
        }

        // Show success message
        hideAllPublishSteps();
        document.getElementById('publish-step-success').style.display = 'block';

        const currentProject = UserData?.getCurrentProject?.() || {};
        const url = `https://${currentProject.subdomain}.rafaeldemeni.com`;
        document.getElementById('success-url').href = url;
        document.getElementById('success-url').textContent = url;

    } catch (error) {
        console.error('Update error:', error);
        alert('Erro ao atualizar. Tente novamente.');
    } finally {
        updateBtn.disabled = false;
        updateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar Conteúdo (Grátis)';
    }
}

function openFullPreview() {
    // Capture the current preview content directly for perfect sync
    const frame = document.getElementById('preview-frame');
    if (!frame) return;

    const previewContent = frame.innerHTML;

    // Get background style from state
    const accent = state.style.accentColor;
    const desktopBg = `background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);`;
    let phoneBgStyle = `background: ${state.style.bgColor};`;
    if (state.style.bgImage) {
        phoneBgStyle = `background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('${state.style.bgImage}'); background-size: cover; background-position: center;`;
    }

    // Wrap in full HTML document with responsive container
    const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${state.profile.name} | Site na Bio</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        html, body { font-family: 'Montserrat', sans-serif; min-height: 100vh; ${phoneBgStyle} }
        .site-wrapper { min-height: 100vh; display: flex; justify-content: center; }
        .phone-mockup { display: none; }
        .site-content { width: 100%; max-width: 480px; min-height: 100vh; }
        .preview-container { background: transparent !important; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        
        @media (min-width: 768px) {
            html, body { ${desktopBg} }
            .site-wrapper { padding: 40px 20px; align-items: center; }
            .phone-mockup { display: block; position: relative; width: 375px; background: #1a1a1a; border-radius: 45px; padding: 12px; box-shadow: 0 0 0 2px #333, 0 25px 50px rgba(0,0,0,0.5), 0 0 80px ${accent}15; }
            .phone-notch { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 120px; height: 28px; background: #1a1a1a; border-radius: 0 0 18px 18px; z-index: 10; display: flex; align-items: center; justify-content: center; gap: 8px; }
            .phone-notch::before { content: ''; width: 8px; height: 8px; background: #333; border-radius: 50%; }
            .phone-notch::after { content: ''; width: 50px; height: 4px; background: #333; border-radius: 2px; }
            .phone-screen { width: 100%; height: 750px; max-height: calc(90vh - 70px); ${phoneBgStyle} border-radius: 35px; overflow: hidden; }
            .site-content { width: 100%; max-width: none; height: 100%; overflow-y: auto; min-height: auto; }
            .phone-home { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); width: 120px; height: 5px; background: #fff; border-radius: 3px; opacity: 0.3; }
            .mobile-only { display: none !important; }
            .site-content::-webkit-scrollbar { width: 4px; }
            .site-content::-webkit-scrollbar-thumb { background: ${accent}40; border-radius: 2px; }
        }
    </style>
</head>
<body>
    <div class="site-wrapper">
        <div class="phone-mockup">
            <div class="phone-notch"></div>
            <div class="phone-screen">
                <div class="site-content">${previewContent}</div>
            </div>
            <div class="phone-home"></div>
        </div>
        <div class="mobile-only site-content">${previewContent}</div>
    </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}

// ========== PREVIEW RENDER ==========
function renderPreview() {
    const frame = document.getElementById('preview-frame');
    if (!frame) {
        console.error('Preview frame not found!');
        return;
    }
    const accent = state.style.accentColor;
    // Support for gradients
    const accentStyle = state.style.accentGradient || accent;

    // Background style
    let bgStyle = `background: ${state.style.bgColor};`;
    if (state.style.bgImage) {
        bgStyle = `background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('${state.style.bgImage}'); background-size: cover; background-position: center top; background-attachment: scroll;`;
    }

    // Smart contrast: detect if background is light
    const isLightBg = isLightColor(state.style.bgColor) && !state.style.bgImage;
    const textColor = isLightBg ? '#1a1a1a' : '#fff';
    const textMuted = isLightBg ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)';
    const textFaded = isLightBg ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)';
    const glassOverlay = isLightBg ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)';
    const glassBorder = isLightBg ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

    // Button style
    let buttonClass = 'preview-btn';
    if (state.style.buttonStyle === 'solid') buttonClass += ' solid';
    else if (state.style.buttonStyle === 'outline') buttonClass += ' outline';

    // Links grid
    const linksHtml = state.links
        .filter(link => link.label.trim())
        .map(link => `
            <a href="${link.url || '#'}" class="${buttonClass}" target="_blank" style="--accent: ${accent}">
                ${iconMap[link.icon] || iconMap.link}
                <span>${link.label}</span>
            </a>
        `).join('');

    // WhatsApp float - REMOVED: was blocking editor view
    const whatsappFloat = '';

    frame.innerHTML = `
        <style>
            .preview-container {
                min-height: 100%;
                padding: 50px 20px 30px;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                font-family: 'Montserrat', sans-serif;
                ${bgStyle}
                color: ${textColor};
            }
            
            .preview-avatar {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                object-fit: cover;
                border: 3px solid ${accent};
                box-shadow: 0 0 30px ${accent}60, 0 4px 20px ${accent}40;
                margin-bottom: 16px;
                position: relative;
            }
            
            .preview-online-badge {
                position: absolute;
                bottom: 2px;
                right: 2px;
                width: 18px;
                height: 18px;
                background: #22C55E;
                border: 3px solid #0a0a1a;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            
            .preview-name {
                font-size: 1.5rem;
                font-weight: 700;
                margin-bottom: 4px;
                max-width: 280px;
                word-wrap: break-word;
                overflow-wrap: break-word;
                white-space: normal;
                line-height: 1.2;
            }
            
            .preview-role {
                font-size: 0.8rem;
                color: ${accent};
                text-transform: uppercase;
                letter-spacing: 2px;
                margin-bottom: 16px;
                max-width: 280px;
                word-wrap: break-word;
                overflow-wrap: break-word;
                white-space: normal;
                line-height: 1.3;
            }
            
            .preview-bio {
                font-size: 0.85rem;
                color: ${textMuted};
                width: 100%;
                min-width: 200px;
                max-width: 280px;
                line-height: 1.5;
                margin-bottom: 24px;
                word-wrap: break-word;
                overflow-wrap: break-word;
                text-align: center;
            }
            
            .preview-links {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                width: 100%;
                margin-bottom: 20px;
            }
            
            .preview-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 16px 12px;
                background: ${glassOverlay};
                backdrop-filter: blur(8px);
                border: 1px solid ${glassBorder};
                border-radius: 12px;
                color: ${textColor};
                text-decoration: none;
                font-size: 0.75rem;
                transition: all 0.2s;
            }
            
            .preview-btn:hover {
                background: rgba(255,255,255,0.15);
                border-color: ${accent}50;
                transform: translateY(-2px);
            }
            
            .preview-btn i {
                font-size: 1.3rem;
            }
            
            .preview-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 25px ${accent}40;
                border-color: ${accent};
            }
            
            .preview-btn.solid {
                background: ${accent};
                color: #000;
                border-color: transparent;
            }
            
            .preview-btn.outline {
                background: transparent;
                border: 2px solid ${accent};
            }
            
            .preview-cta {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                width: 100%;
                padding: 16px;
                background: linear-gradient(135deg, ${accent} 0%, ${adjustColor(accent, -30)} 100%);
                border-radius: 14px;
                color: #000;
                font-weight: 700;
                font-size: 0.85rem;
                text-transform: uppercase;
                letter-spacing: 1px;
                text-decoration: none;
                box-shadow: 0 4px 20px ${accent}40;
            }
            
            .preview-whatsapp {
                position: fixed;
                bottom: 15px;
                left: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
                background: rgba(0,0,0,0.8);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.1);
                border-left: 3px solid #25D366;
                padding: 10px 14px;
                border-radius: 12px;
                text-decoration: none;
                color: white;
            }
            
            .preview-whatsapp-dot {
                width: 8px;
                height: 8px;
                background: #22C55E;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .preview-whatsapp-text {
                font-size: 0.7rem;
            }
            
            .preview-whatsapp-text span {
                display: block;
                color: rgba(255,255,255,0.6);
                font-size: 0.6rem;
            }
            
            /* Banner Card - Reference Style */
            .preview-banner {
                width: 100%;
                border-radius: 16px;
                overflow: hidden;
                margin-bottom: 20px;
                position: relative;
                background: #1a1a1a;
                box-shadow: 0 10px 40px rgba(0,0,0,0.4);
            }
            
            .preview-banner img {
                width: 100%;
                height: 200px;
                object-fit: cover;
            }
            
            /* Gradient overlay on image */
            .preview-banner::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 70%;
                background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%);
                pointer-events: none;
            }
            
            .preview-banner-tag {
                position: absolute;
                top: 12px;
                right: 12px;
                background: ${accent};
                color: #000;
                font-size: 0.6rem;
                font-weight: 700;
                padding: 6px 12px;
                border-radius: 20px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                z-index: 2;
            }
            
            .preview-banner-content {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 16px 18px;
                z-index: 2;
            }
            
            .preview-banner-title {
                font-size: 1rem;
                font-weight: 700;
                margin-bottom: 8px;
                color: #fff;
                line-height: 1.3;
            }
            
            .preview-banner-desc {
                font-size: 0.7rem;
                color: rgba(255,255,255,0.8);
                margin-bottom: 12px;
                line-height: 1.5;
            }
            
            .preview-banner-cta {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: transparent;
                color: ${accent};
                font-size: 0.75rem;
                font-weight: 600;
                text-decoration: none;
                transition: gap 0.2s;
            }
            
            .preview-banner-cta:hover {
                gap: 10px;
            }
            
            /* Footer */
            .preview-footer {
                margin-top: auto;
                padding-top: 20px;
                font-size: 0.65rem;
                color: ${textFaded};
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            .preview-footer-logo {
                width: 20px;
                height: 20px;
                object-fit: contain;
            }
            
            .preview-footer a {
                color: ${accent};
                text-decoration: none;
            }
            
            /* Carousel */
            .preview-carousel {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-bottom: 16px;
            }
            
            .preview-carousel-slide {
                width: 100%;
                display: block;
                border-radius: 12px;
                overflow: hidden;
                position: relative;
                transition: all 0.3s ease;
            }
            
            .preview-carousel-slide:hover {
                transform: scale(1.02);
                box-shadow: 0 0 20px var(--accent, ${accent})60, 0 0 40px var(--accent, ${accent})30;
            }
            
            .preview-carousel-slide img {
                width: 100%;
                height: auto;
                display: block;
                object-fit: cover;
                transition: transform 0.3s ease;
            }
            
            .preview-carousel-slide:hover img {
                transform: scale(1.05);
            }
            
            /* Horizontal banners */
            .preview-carousel-slide.horizontal img {
                height: 100px;
                object-fit: cover;
            }
            
            /* Vertical banners */
            .preview-carousel-slide.vertical img {
                height: auto;
                max-height: 200px;
                object-fit: cover;
            }
            
            .preview-carousel-title {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 8px;
                background: linear-gradient(transparent, rgba(0,0,0,0.8));
                color: white;
                font-size: 0.7rem;
                font-weight: 600;
            }
            
            /* Section Divider */
            .preview-section-divider {
                width: 100%;
                display: flex;
                align-items: center;
                gap: 12px;
                margin: 16px 0 12px;
            }
            
            .preview-section-divider::before,
            .preview-section-divider::after {
                content: '';
                flex: 1;
                height: 1px;
                background: ${isLightBg ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'};
            }
            
            .preview-section-divider span {
                font-size: 0.65rem;
                font-weight: 600;
                letter-spacing: 2px;
                color: ${textMuted};
                text-transform: uppercase;
            }
            
            /* Video Section */
            .preview-video-section {
                width: 100%;
                margin-bottom: 16px;
            }
            
            .preview-video-title {
                font-size: 0.85rem;
                font-weight: 600;
                margin-bottom: 8px;
                color: ${textColor};
            }
            
            .preview-video-frame {
                width: 100%;
                aspect-ratio: 16/9;
                border-radius: 12px;
                overflow: hidden;
                background: #000;
            }
            
            .preview-video-frame iframe {
                width: 100%;
                height: 100%;
                border: none;
            }
            
            /* Vertical video (YouTube Shorts) */
            .preview-video-frame.vertical {
                aspect-ratio: 9/16;
                max-height: 300px;
                margin: 0 auto;
                width: 60%;
            }
            
            .preview-video-cta {
                display: block;
                margin-top: 10px;
                padding: 10px 16px;
                background: ${accent};
                color: #000;
                font-size: 0.75rem;
                font-weight: 600;
                border-radius: 8px;
                text-decoration: none;
                text-align: center;
            }
        </style>
        
        <div class="preview-container">
            <div style="position: relative; display: inline-block;">
                <img src="${state.profile.avatar}" alt="${state.profile.name}" class="preview-avatar">
                <div class="preview-online-badge"></div>
            </div>
            <h1 class="preview-name">${state.profile.name}</h1>
            <p class="preview-role">${state.profile.role}</p>
            <p class="preview-bio">${state.profile.bio}</p>
            
            ${state.banner.active && state.banner.title ? `
                <a href="${state.banner.link || '#'}" target="_blank" class="preview-banner">
                    ${state.banner.image ? `<img src="${state.banner.image}" alt="${state.banner.title}">` : ''}
                    ${state.banner.tag ? `<span class="preview-banner-tag">${state.banner.tag}</span>` : ''}
                    <div class="preview-banner-content">
                        <div class="preview-banner-title">${state.banner.title}</div>
                        ${state.banner.description ? `<div class="preview-banner-desc">${state.banner.description}</div>` : ''}
                        <span class="preview-banner-cta">${state.banner.cta || 'Saiba Mais'} →</span>
                    </div>
                </a>
            ` : ''}
            
            ${(() => {
            // Generate blocks in order defined by state.blockOrder
            const blockHtml = {
                banners: state.bannersActive && state.banners.some(b => b.image) ? `
                        <div class="preview-section-divider">
                            <span>CONHEÇA</span>
                        </div>
                        <div class="preview-carousel ${state.banners.some(b => b.orientation === 'vertical') ? 'has-vertical' : ''}">
                            ${state.banners.filter(b => b.image).map(b => `
                                <a href="${b.link || '#'}" class="preview-carousel-slide ${b.orientation || 'horizontal'}" target="_blank" style="--accent: ${accent}">
                                    <img src="${b.image}" alt="${b.title || 'Banner'}">
                                    ${b.title ? `<span class="preview-carousel-title">${b.title}</span>` : ''}
                                </a>
                            `).join('')}
                        </div>
                    ` : '',
                links: `
                        <div class="preview-section-divider">
                            <span>LINKS ÚTEIS</span>
                        </div>
                        <div class="preview-links">
                            ${linksHtml}
                        </div>
                        ${state.profile.whatsapp ? `
                            <a href="https://wa.me/${state.profile.whatsapp}" target="_blank" class="preview-cta">
                                <i class="fab fa-whatsapp"></i>
                                Fale Comigo
                            </a>
                        ` : ''}
                    `,
                video: state.video.active && state.video.embedUrl ? `
                        <div class="preview-section-divider">
                            <span>ASSISTA</span>
                        </div>
                        <div class="preview-video-section">
                            ${state.video.title ? `<h3 class="preview-video-title">${state.video.title}</h3>` : ''}
                            <div class="preview-video-frame ${state.video.isVertical ? 'vertical' : ''}">
                                <iframe src="${state.video.embedUrl}" allowfullscreen></iframe>
                            </div>
                            ${state.video.ctaText ? `
                                <a href="${state.video.ctaLink || '#'}" class="preview-video-cta" target="_blank">
                                    ${state.video.ctaText}
                                </a>
                            ` : ''}
                        </div>
                    ` : ''
            };

            return state.blockOrder.map(block => blockHtml[block]).join('');
        })()}
            
            <div class="preview-footer">
                ${state.footer.logo ? `<img src="${state.footer.logo}" class="preview-footer-logo" alt="">` : ''}
                ${state.footer.link ? `
                    <a href="${state.footer.link}" target="_blank">
                        ${state.footer.text || 'Feito com ♥ por DEMENI'}
                    </a>
                ` : `
                    <span>${state.footer.text || 'Feito com ♥ por DEMENI'}</span>
                `}
            </div>
            
            ${whatsappFloat}
        </div>
    `;
}

// ========== GENERATE FINAL HTML ==========
function generateFinalHTML() {
    const accent = state.style.accentColor;

    // Smart contrast detection
    const isLightBg = isLightColor(state.style.bgColor) && !state.style.bgImage;
    const textColor = isLightBg ? '#1a1a1a' : '#fff';
    const textMuted = isLightBg ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)';
    const glassOverlay = isLightBg ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)';
    const glassBorder = isLightBg ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

    let bgStyle = `background: ${state.style.bgColor};`;
    if (state.style.bgImage) {
        bgStyle = `background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('${state.style.bgImage}'); background-size: cover; background-position: center;`;
    }

    let buttonClass = 'link-btn';
    if (state.style.buttonStyle === 'solid') buttonClass += ' solid';
    else if (state.style.buttonStyle === 'outline') buttonClass += ' outline';

    const linksHtml = state.links
        .filter(link => link.label.trim())
        .map(link => `
            <a href="${link.url || '#'}" class="${buttonClass}" target="_blank">
                ${iconMap[link.icon] || iconMap.link}
                <span>${link.label}</span>
            </a>
        `).join('');

    // Generate ordered blocks HTML
    const blockHtml = {
        banners: state.bannersActive && state.banners.some(b => b.image) ? `
            <div class="section-label">CONHEÇA</div>
            <div class="carousel">
                ${state.banners.filter(b => b.image).map(b => `
                    <a href="${b.link || '#'}" class="carousel-slide ${b.orientation || 'horizontal'}" target="_blank">
                        <img src="${b.image}" alt="${b.title || 'Banner'}">
                        ${b.title ? `<span class="carousel-title">${b.title}</span>` : ''}
                    </a>
                `).join('')}
            </div>
        ` : '',
        links: `
            <div class="section-label">LINKS ÚTEIS</div>
            <div class="links">
                ${linksHtml}
            </div>
        `,
        video: state.video.active && state.video.embedUrl ? `
            <div class="section-label">ASSISTA</div>
            <div class="video-section">
                ${state.video.title ? `<h3 class="video-title">${state.video.title}</h3>` : ''}
                <div class="video-frame ${state.video.isVertical ? 'vertical' : ''}">
                    <iframe src="${state.video.embedUrl}" allowfullscreen></iframe>
                </div>
                ${state.video.ctaText ? `
                    <a href="${state.video.ctaLink || '#'}" class="video-cta" target="_blank">
                        ${state.video.ctaText}
                    </a>
                ` : ''}
            </div>
        ` : ''
    };

    const orderedBlocksHtml = state.blockOrder.map(block => blockHtml[block]).join('');

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${state.profile.name} | Site na Bio</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Montserrat', sans-serif;
            min-height: 100vh;
            ${bgStyle}
            color: ${textColor};
        }
        
        .container {
            max-width: 480px;
            margin: 0 auto;
            padding: 50px 20px 30px;
            text-align: center;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid ${accent};
            box-shadow: 0 4px 25px ${accent}40;
            margin-bottom: 20px;
        }
        
        h1 {
            font-size: 1.8rem;
            margin-bottom: 6px;
        }
        
        .role {
            color: ${accent};
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 16px;
        }
        
        .bio {
            color: rgba(255,255,255,0.7);
            max-width: 320px;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        
        .links {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            width: 100%;
            margin-bottom: 24px;
        }
        
        .link-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 20px 15px;
            background: rgba(255,255,255,0.08);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 14px;
            color: white;
            text-decoration: none;
            transition: all 0.3s;
        }
        
        .link-btn:hover {
            background: rgba(255,255,255,0.15);
            border-color: ${accent}50;
            transform: translateY(-3px);
        }
        
        .link-btn i { font-size: 1.5rem; }
        .link-btn span { font-size: 0.8rem; }
        
        .link-btn.solid {
            background: ${accent};
            color: #000;
            border-color: transparent;
        }
        
        .link-btn.outline {
            background: transparent;
            border: 2px solid ${accent};
        }
        
        .cta {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, ${accent} 0%, ${adjustColor(accent, -30)} 100%);
            border-radius: 14px;
            color: #000;
            font-weight: 700;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-decoration: none;
            box-shadow: 0 4px 25px ${accent}40;
            transition: all 0.3s;
        }
        
        .cta:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 35px ${accent}50;
        }
        
        .footer {
            margin-top: auto;
            padding-top: 30px;
            font-size: 0.7rem;
            color: rgba(255,255,255,0.3);
        }
        
        .whatsapp-float {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: #25D366;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.8rem;
            text-decoration: none;
            box-shadow: 0 4px 20px rgba(37,211,102,0.4);
            transition: all 0.3s;
        }
        
        .whatsapp-float:hover {
            transform: scale(1.1);
        }
        
        .section-label {
            width: 100%;
            text-align: center;
            font-size: 0.65rem;
            font-weight: 600;
            letter-spacing: 2px;
            color: ${textMuted};
            margin: 24px 0 12px;
        }
        
        .featured-banner {
            display: block;
            width: 100%;
            background: ${glassOverlay};
            border: 1px solid ${glassBorder};
            border-radius: 16px;
            overflow: hidden;
            text-decoration: none;
            color: ${textColor};
            margin-bottom: 20px;
        }
        
        .featured-banner img {
            width: 100%;
            height: 140px;
            object-fit: cover;
        }
        
        .banner-tag {
            display: inline-block;
            padding: 4px 10px;
            background: ${accent};
            color: #000;
            font-size: 0.65rem;
            font-weight: 600;
            text-transform: uppercase;
            border-radius: 4px;
            margin: 12px 0 0 12px;
        }
        
        .banner-content {
            padding: 12px 16px 16px;
        }
        
        .banner-title {
            font-weight: 700;
            font-size: 0.95rem;
            margin-bottom: 4px;
        }
        
        .banner-desc {
            font-size: 0.8rem;
            color: ${textMuted};
            margin-bottom: 8px;
        }
        
        .banner-cta {
            font-size: 0.75rem;
            color: ${accent};
            font-weight: 600;
        }
        
        .carousel {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            padding: 5px 0;
            width: 100%;
        }
        
        .carousel-slide {
            flex-shrink: 0;
            border-radius: 12px;
            overflow: hidden;
            text-decoration: none;
        }
        
        .carousel-slide.horizontal {
            width: 200px;
            height: 120px;
        }
        
        .carousel-slide.vertical {
            width: 100px;
            height: 180px;
        }
        
        .carousel-slide img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .carousel-title {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 8px;
            background: linear-gradient(transparent, rgba(0,0,0,0.8));
            color: white;
            font-size: 0.7rem;
            font-weight: 600;
        }
        
        .video-section {
            width: 100%;
            margin-bottom: 20px;
        }
        
        .video-title {
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 10px;
            text-align: center;
        }
        
        .video-frame {
            width: 100%;
            border-radius: 12px;
            overflow: hidden;
            aspect-ratio: 16/9;
        }
        
        .video-frame.vertical {
            aspect-ratio: 9/16;
            max-width: 240px;
            margin: 0 auto;
        }
        
        .video-frame iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        
        .video-cta {
            display: block;
            margin-top: 10px;
            padding: 10px 16px;
            background: ${accent};
            color: #000;
            font-size: 0.75rem;
            font-weight: 600;
            border-radius: 8px;
            text-decoration: none;
            text-align: center;
        }
</style>
</head>
<body>
    <div class="container">
        <img src="${state.profile.avatar}" alt="${state.profile.name}" class="avatar">
        <h1>${state.profile.name}</h1>
        <p class="role">${state.profile.role}</p>
        <p class="bio">${state.profile.bio}</p>
        
        ${state.banner.active && state.banner.title ? `
            <a href="${state.banner.link || '#'}" target="_blank" class="featured-banner">
                ${state.banner.image ? `<img src="${state.banner.image}" alt="${state.banner.title}">` : ''}
                ${state.banner.tag ? `<span class="banner-tag">${state.banner.tag}</span>` : ''}
                <div class="banner-content">
                    <div class="banner-title">${state.banner.title}</div>
                    ${state.banner.description ? `<div class="banner-desc">${state.banner.description}</div>` : ''}
                    <span class="banner-cta">${state.banner.cta || 'Saiba Mais'} →</span>
                </div>
            </a>
        ` : ''}
        
        ${orderedBlocksHtml}
        
        ${state.profile.whatsapp ? `
            <a href="https://wa.me/${state.profile.whatsapp}" target="_blank" class="cta">
                <i class="fab fa-whatsapp"></i>
                Fale Comigo no WhatsApp
            </a>
        ` : ''}
        
        <div class="footer">
            © ${new Date().getFullYear()} ${state.profile.name} • Feito com ♥ por DEMENI
        </div>
    </div>
    
    ${state.profile.whatsapp ? `
        <a href="https://wa.me/${state.profile.whatsapp}" target="_blank" class="whatsapp-float">
            <i class="fab fa-whatsapp"></i>
        </a>
    ` : ''}
</body>
</html>`;
}

// ========== UTILITIES ==========
function adjustColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// ========== PROJECT-BASED STORAGE ==========
let currentProjectId = null;
let thumbnailCaptureTimeout = null;

// Capture preview thumbnail using html2canvas
async function capturePreviewThumbnail() {
    const frame = document.getElementById('preview-frame');
    if (!frame || typeof html2canvas === 'undefined') return null;

    try {
        const canvas = await html2canvas(frame, {
            width: 280,
            height: 500,
            scale: 2, // Higher scale = better resolution
            useCORS: true,
            logging: false,
            backgroundColor: '#0a0a1a'
        });

        return canvas.toDataURL('image/jpeg', 0.85); // Higher quality
    } catch (error) {
        console.warn('Could not capture thumbnail:', error);
        return null;
    }
}

// Schedule thumbnail capture (debounced to avoid too many captures)
function scheduleThumbnailCapture() {
    if (thumbnailCaptureTimeout) {
        clearTimeout(thumbnailCaptureTimeout);
    }
    thumbnailCaptureTimeout = setTimeout(async () => {
        if (currentProjectId && window.UserData) {
            const thumbnail = await capturePreviewThumbnail();
            if (thumbnail) {
                UserData.updateProject(currentProjectId, { thumbnail });
            }
        }
    }, 2000); // Capture 2 seconds after last change
}

function saveToStorage() {
    // Save to project if we have a current project
    if (currentProjectId && window.UserData) {
        const projectData = {
            profile: state.profile,
            links: state.links,
            style: state.style,
            banner: state.banner,
            footer: state.footer,
            banners: state.banners,
            bannersActive: state.bannersActive,
            video: state.video,
            blockOrder: state.blockOrder
        };
        UserData.updateProject(currentProjectId, {
            name: state.projectName,
            data: projectData
        });

        // Schedule thumbnail capture
        scheduleThumbnailCapture();
    }
    // Also save to local backup
    localStorage.setItem('demeni-editor-state', JSON.stringify(state));
}

function loadFromStorage() {
    // Try to load from current project first
    if (window.UserData) {
        currentProjectId = UserData.getCurrentProjectId();

        if (currentProjectId) {
            const project = UserData.getProject(currentProjectId);
            if (project) {
                // Load project name
                state.projectName = project.name || 'Meu Site';

                // Load project data if exists
                if (project.data && project.data.profile) {
                    state.profile = { ...state.profile, ...project.data.profile };
                    state.links = project.data.links || state.links;
                    state.style = { ...state.style, ...project.data.style };
                    state.banner = { ...state.banner, ...project.data.banner };
                    state.footer = { ...state.footer, ...project.data.footer };
                    state.banners = project.data.banners || state.banners;
                    state.bannersActive = project.data.bannersActive || false;
                    state.video = { ...state.video, ...project.data.video };
                    state.blockOrder = project.data.blockOrder || state.blockOrder;

                    // Calculate max link ID
                    if (state.links.length > 0) {
                        linkIdCounter = Math.max(...state.links.map(l => l.id)) + 1;
                    }
                } else {
                    // New project without data - save initial state immediately
                    saveToStorage();
                }

                updateUIFromState();
                return;
            }
        }
    }

    // Fallback to localStorage
    const saved = localStorage.getItem('demeni-editor-state');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            Object.assign(state, data);
            updateUIFromState();
        } catch (e) {
            // Just use defaults
        }
    }
}

function updateUIFromState() {
    // Update inputs
    document.getElementById('project-name').value = state.projectName;
    document.getElementById('input-name').value = state.profile.name || '';
    document.getElementById('input-role').value = state.profile.role || '';
    document.getElementById('input-bio').value = state.profile.bio || '';
    document.getElementById('input-whatsapp').value = state.profile.whatsapp || '';
    document.getElementById('avatar-img').src = state.profile.avatar;
    document.getElementById('color-accent').value = state.style.accentColor;
    document.querySelector('.color-value').textContent = state.style.accentColor.toUpperCase();

    // Update banner fields
    const bannerTag = document.getElementById('banner-tag');
    const bannerTitle = document.getElementById('banner-title');
    const bannerDesc = document.getElementById('banner-desc');
    const bannerCta = document.getElementById('banner-cta');
    const bannerLink = document.getElementById('banner-link');
    const bannerActive = document.getElementById('banner-active');
    const bannerPreview = document.getElementById('banner-preview');

    if (bannerTag) bannerTag.value = state.banner.tag || '';
    if (bannerTitle) bannerTitle.value = state.banner.title || '';
    if (bannerDesc) bannerDesc.value = state.banner.description || '';
    if (bannerCta) bannerCta.value = state.banner.cta || '';
    if (bannerLink) bannerLink.value = state.banner.link || '';
    if (bannerActive) bannerActive.checked = state.banner.active || false;
    if (bannerPreview && state.banner.image) {
        bannerPreview.innerHTML = `<img src="${state.banner.image}" alt="Banner">`;
    }

    // Update footer fields
    const footerText = document.getElementById('footer-text');
    const footerLink = document.getElementById('footer-link');
    const footerLogoPreview = document.getElementById('footer-logo-preview');

    if (footerText) footerText.value = state.footer.text || '';
    if (footerLink) footerLink.value = state.footer.link || '';
    if (footerLogoPreview && state.footer.logo) {
        footerLogoPreview.innerHTML = `<img src="${state.footer.logo}" alt="Logo">`;
    }

    // Update bg preview
    updateBgPreview();

    // Update active presets
    document.querySelectorAll('.color-preset').forEach(p => {
        p.classList.toggle('active', p.dataset.color === state.style.bgColor);
    });

    document.querySelectorAll('.style-preset').forEach(p => {
        p.classList.toggle('active', p.dataset.style === state.style.buttonStyle);
    });

    // Update video fields
    const videoUrl = document.getElementById('video-url');
    const videoTitle = document.getElementById('video-title');
    const videoCtaText = document.getElementById('video-cta-text');
    const videoCtaLink = document.getElementById('video-cta-link');
    const videoActive = document.getElementById('video-active');

    if (videoUrl) videoUrl.value = state.video.url || '';
    if (videoTitle) videoTitle.value = state.video.title || '';
    if (videoCtaText) videoCtaText.value = state.video.ctaText || '';
    if (videoCtaLink) videoCtaLink.value = state.video.ctaLink || '';
    if (videoActive) videoActive.checked = state.video.active || false;

    // Update carousel banners
    for (let i = 1; i <= 3; i++) {
        const preview = document.getElementById(`banner-preview-${i}`);
        const title = document.getElementById(`banner-title-${i}`);
        const link = document.getElementById(`banner-link-${i}`);
        const banner = state.banners[i - 1];

        if (banner) {
            if (title) title.value = banner.title || '';
            if (link) link.value = banner.link || '';
            if (preview && banner.image) {
                preview.innerHTML = `<img src="${banner.image}" alt="Banner">`;
                preview.classList.add('has-image');
            }
        }
    }

    // Update carousel toggle
    const carouselToggle = document.getElementById('banners-carousel-active');
    if (carouselToggle) carouselToggle.checked = state.bannersActive || false;

    // Update block order UI
    renderBlockOrderUI();
    renderFloatingBlockOrder();

    renderLinksList();
    renderPreview();
}

function resetToDefaults() {
    state.projectName = 'Meu Site';
    state.profile = {
        name: 'Seu Nome',
        role: 'Sua Profissão',
        bio: 'Uma breve descrição sobre você.',
        avatar: 'https://ui-avatars.com/api/?name=User&background=D4AF37&color=000&size=200&bold=true',
        whatsapp: ''
    };
    state.links = [
        { id: 1, label: 'Instagram', url: '', icon: 'instagram' },
        { id: 2, label: 'WhatsApp', url: '', icon: 'whatsapp' },
        { id: 3, label: 'E-mail', url: '', icon: 'envelope' },
        { id: 4, label: 'Site', url: '', icon: 'globe' }
    ];
    state.style = {
        accentColor: '#D4AF37',
        bgColor: '#000000',
        bgImage: null,
        buttonStyle: 'glass'
    };
    linkIdCounter = 5;
    updateUIFromState();
}

// Expose functions globally
window.removeLink = removeLink;
window.updateLinkLabel = updateLinkLabel;
window.updateLinkUrl = updateLinkUrl;
window.generateSmartUrl = generateSmartUrl;
window.getPlaceholder = getPlaceholder;
window.resetToDefaults = resetToDefaults;

// ========== BANNERS CAROUSEL SETUP ==========
function setupBannersCarousel() {
    for (let i = 1; i <= 3; i++) {
        const preview = document.getElementById(`banner-preview-${i}`);
        const input = document.getElementById(`banner-input-${i}`);
        const titleInput = document.getElementById(`banner-title-${i}`);
        const linkInput = document.getElementById(`banner-link-${i}`);

        if (!preview || !input) continue;

        // Click to upload
        preview.addEventListener('click', () => input.click());

        // File change
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
                state.banners[i - 1].image = ev.target.result;
                preview.innerHTML = `<img src="${ev.target.result}" alt="Banner ${i}">`;
                preview.classList.add('has-image');
                renderPreview();
                saveToStorage();
            };
            reader.readAsDataURL(file);
        });

        // Title input
        if (titleInput) {
            titleInput.addEventListener('input', (e) => {
                state.banners[i - 1].title = e.target.value;
                renderPreview();
                saveToStorage();
            });
        }

        // Link input
        if (linkInput) {
            linkInput.addEventListener('input', (e) => {
                state.banners[i - 1].link = e.target.value;
                saveToStorage();
            });
        }

        // Orientation radio buttons
        const orientationRadios = document.querySelectorAll(`input[name="orientation-${i}"]`);
        orientationRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                state.banners[i - 1].orientation = e.target.value;
                renderPreview();
                saveToStorage();
            });
        });
    }

    // Carousel toggle
    const carouselToggle = document.getElementById('banners-carousel-active');
    if (carouselToggle) {
        carouselToggle.addEventListener('change', (e) => {
            state.bannersActive = e.target.checked;
            renderPreview();
            saveToStorage();
        });
    }
}

// ========== VIDEO PANEL SETUP ==========
function setupVideoPanel() {
    const urlInput = document.getElementById('video-url');
    const previewBox = document.getElementById('video-preview-box');
    const titleInput = document.getElementById('video-title');
    const ctaTextInput = document.getElementById('video-cta-text');
    const ctaLinkInput = document.getElementById('video-cta-link');
    const activeToggle = document.getElementById('video-active');

    if (!urlInput) return;

    urlInput.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        state.video.url = url;
        const parsed = parseVideoUrl(url);
        state.video.embedUrl = parsed.embedUrl;
        state.video.isVertical = parsed.isVertical;

        // Update preview box
        if (state.video.embedUrl && previewBox) {
            previewBox.innerHTML = `<iframe src="${state.video.embedUrl}" allowfullscreen></iframe>`;
            previewBox.classList.add('has-video');
            if (state.video.isVertical) {
                previewBox.classList.add('vertical');
            } else {
                previewBox.classList.remove('vertical');
            }
        } else if (previewBox) {
            previewBox.innerHTML = '<i class="fas fa-play-circle"></i><span>Preview do vídeo aparece aqui</span>';
            previewBox.classList.remove('has-video');
        }

        renderPreview();
        saveToStorage();
    });

    if (titleInput) {
        titleInput.addEventListener('input', (e) => {
            state.video.title = e.target.value;
            renderPreview();
            saveToStorage();
        });
    }

    if (ctaTextInput) {
        ctaTextInput.addEventListener('input', (e) => {
            state.video.ctaText = e.target.value;
            renderPreview();
            saveToStorage();
        });
    }

    if (ctaLinkInput) {
        ctaLinkInput.addEventListener('input', (e) => {
            state.video.ctaLink = e.target.value;
            saveToStorage();
        });
    }

    if (activeToggle) {
        activeToggle.addEventListener('change', (e) => {
            state.video.active = e.target.checked;
            renderPreview();
            saveToStorage();
        });
    }
}

// Parse YouTube/Vimeo URL to embed URL (returns object with embedUrl and isVertical)
function parseVideoUrl(url) {
    if (!url) return { embedUrl: '', isVertical: false };

    // YouTube Shorts (vertical)
    const shortsMatch = url.match(/(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/);
    if (shortsMatch) {
        return {
            embedUrl: `https://www.youtube.com/embed/${shortsMatch[1]}`,
            isVertical: true
        };
    }

    // YouTube (horizontal)
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) {
        return {
            embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
            isVertical: false
        };
    }

    // Vimeo
    const vimeoMatch = url.match(/(?:vimeo\.com\/)([0-9]+)/);
    if (vimeoMatch) {
        return {
            embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
            isVertical: false
        };
    }

    return { embedUrl: '', isVertical: false };
}

// ========== BACKGROUND IMAGE SETUP ==========
function setupBackgroundImage() {
    const bgUploadBtn = document.getElementById('btn-upload-bg');
    const bgInput = document.getElementById('bg-input');
    const bgRemoveBtn = document.getElementById('btn-remove-bg');
    const bgPreview = document.getElementById('bg-preview');

    if (!bgUploadBtn || !bgInput) return;

    bgUploadBtn.addEventListener('click', () => bgInput.click());

    bgInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            // Open crop modal for background
            openCropModal(ev.target.result, 'bg');
        };
        reader.readAsDataURL(file);
    });

    if (bgRemoveBtn) {
        bgRemoveBtn.addEventListener('click', () => {
            state.style.bgImage = null;
            updateBgPreview();
            renderPreview();
            saveToStorage();
        });
    }
}

// ========== HELPER FUNCTIONS ==========

// Detect if a color is light (for contrast detection)
function isLightColor(color) {
    if (!color) return false;

    // Convert hex to RGB
    let hex = color.replace('#', '');
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate luminance (YIQ formula)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    return yiq >= 150; // Light if luminance is high
}

// Adjust color brightness
function adjustColor(color, amount) {
    if (!color) return color;

    let hex = color.replace('#', '');
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);

    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));

    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// ========== BLOCK ORDER SETUP ==========
const BLOCK_CONFIG = {
    banners: { name: 'Banners', icon: 'fa-images', desc: 'Destaques' },
    links: { name: 'Links', icon: 'fa-link', desc: 'Botões' },
    video: { name: 'Vídeo', icon: 'fa-video', desc: 'YouTube' }
};

function setupBlockOrder() {
    renderBlockOrderUI();
    renderFloatingBlockOrder();

    // Reset button (sidebar)
    const resetBtn = document.getElementById('btn-reset-order');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetBlockOrder);
    }

    // Reset button (secondary toolbar)
    const resetBtnMini = document.getElementById('btn-reset-order-mini');
    if (resetBtnMini) {
        resetBtnMini.addEventListener('click', resetBlockOrder);
    }
}

function resetBlockOrder() {
    state.blockOrder = ['banners', 'links', 'video'];
    renderBlockOrderUI();
    renderFloatingBlockOrder();
    renderPreview();
    saveToStorage();
}

// Render floating blocks in secondary toolbar
function renderFloatingBlockOrder() {
    const container = document.getElementById('floating-block-order');
    if (!container) return;

    container.innerHTML = state.blockOrder.map(blockId => {
        const config = BLOCK_CONFIG[blockId];
        return `
            <div class="floating-block" draggable="true" data-block="${blockId}">
                <i class="fas ${config.icon}"></i>
                <span>${config.name}</span>
            </div>
        `;
    }).join('');

    // Add drag-and-drop events
    setupDragDropEvents(container, '.floating-block');
}

// Render blocks in sidebar (original)
function renderBlockOrderUI() {
    const container = document.getElementById('block-order-list');
    if (!container) return;

    container.innerHTML = state.blockOrder.map(blockId => {
        const config = BLOCK_CONFIG[blockId];
        return `
            <div class="block-order-item" draggable="true" data-block="${blockId}">
                <i class="fas fa-grip-vertical drag-handle"></i>
                <div class="block-icon">
                    <i class="fas ${config.icon}"></i>
                </div>
                <div>
                    <div class="block-name">${config.name}</div>
                    <div class="block-desc">${config.desc}</div>
                </div>
            </div>
        `;
    }).join('');

    // Add drag-and-drop events
    setupDragDropEvents(container, '.block-order-item');
}

// Shared drag-and-drop logic
function setupDragDropEvents(container, itemSelector) {
    const items = container.querySelectorAll(itemSelector);
    let draggedItem = null;

    items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            items.forEach(i => i.classList.remove('drag-over'));
            draggedItem = null;
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            item.classList.add('drag-over');
        });

        item.addEventListener('dragleave', () => {
            item.classList.remove('drag-over');
        });

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('drag-over');

            if (draggedItem && draggedItem !== item) {
                const draggedBlock = draggedItem.dataset.block;
                const targetBlock = item.dataset.block;

                const draggedIndex = state.blockOrder.indexOf(draggedBlock);
                const targetIndex = state.blockOrder.indexOf(targetBlock);

                // Swap positions
                state.blockOrder.splice(draggedIndex, 1);
                state.blockOrder.splice(targetIndex, 0, draggedBlock);

                renderBlockOrderUI();
                renderFloatingBlockOrder();
                renderPreview();
                saveToStorage();
            }
        });
    });
}
