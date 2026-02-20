/* ===========================
   DEMENI SITES - EDITOR D1 FULL
   Migrated from original editor.js
   All IDs suffixed with -d1
   Entry point: initD1Embedded()
   =========================== */

// ========== D1 STATE (namespaced) ==========
const D1State = {
    projectName: 'Meu Site',
    profile: {
        name: 'Seu Nome',
        role: 'Sua Profissão',
        bio: 'Uma breve descrição sobre você e seu trabalho.',
        avatar: 'https://ui-avatars.com/api/?name=User&background=1B97C0&color=fff&size=200&bold=true',
        whatsapp: ''
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
        buttonStyle: 'glass'
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
    blockOrder: ['banners', 'links', 'video']
};

let d1LinkIdCounter = 5;
let d1Cropper = null;
let d1CropTarget = null;
let d1CurrentProjectId = null;
let d1Initialized = false;

// ========== D1 ID HELPER ==========
function d1El(id) {
    return document.getElementById(id + '-d1');
}

// ========== ICON MAP ==========
const D1IconMap = {
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

// ========== BLOCK CONFIG ==========
const D1_BLOCK_CONFIG = {
    banners: { name: 'Banners', icon: 'fa-images', desc: 'Destaques' },
    links: { name: 'Links', icon: 'fa-link', desc: 'Botões' },
    video: { name: 'Vídeo', icon: 'fa-video', desc: 'YouTube' }
};

// ========== INIT (called by dashboard.js) ==========
function initD1Embedded() {
    if (d1Initialized) {
        // Already initialized, just reload data
        d1LoadFromStorage();
        return;
    }

    d1SetupTabNavigation();
    d1SetupProfileInputs();
    d1SetupColorInputs();
    d1SetupImageUploads();
    d1SetupStylePresets();
    d1SetupLinksPanel();
    d1SetupBanner();
    d1SetupFooter();
    d1SetupModals();
    d1SetupPublishButton();
    d1SetupBannersCarousel();
    d1SetupVideoPanel();
    d1SetupBackgroundImage();
    d1SetupBlockOrder();

    d1RenderLinksList();
    d1RenderPreview();
    d1LoadFromStorage();

    d1Initialized = true;
    console.log('[D1 Full] Editor initialized successfully');
}

// ========== HELPER: Update default avatar ==========
function d1UpdateDefaultAvatar() {
    if (D1State.profile.avatar && D1State.profile.avatar.includes('ui-avatars.com')) {
        const name = encodeURIComponent(D1State.profile.name || 'User');
        const color = D1State.style.accentColor.replace('#', '');
        D1State.profile.avatar = `https://ui-avatars.com/api/?name=${name}&background=${color}&color=000&size=200&bold=true`;
        const avatarImg = d1El('avatar-img');
        if (avatarImg) avatarImg.src = D1State.profile.avatar;
    }
}

// ========== TAB NAVIGATION ==========
function d1SetupTabNavigation() {
    const tabs = document.querySelectorAll('.tab-btn-d1');
    const contents = document.querySelectorAll('.tab-content-d1');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tabD1;
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const target = document.getElementById(`tab-d1-${targetId}`);
            if (target) target.classList.add('active');
        });
    });
}

// ========== PROFILE INPUTS ==========
function d1SetupProfileInputs() {
    const nameInput = d1El('input-name');
    const roleInput = d1El('input-role');
    const bioInput = d1El('input-bio');
    const whatsappInput = d1El('input-whatsapp');
    const projectNameInput = d1El('project-name');

    if (nameInput) nameInput.addEventListener('input', (e) => {
        D1State.profile.name = e.target.value || 'Seu Nome';
        d1RenderPreview();
        d1SaveToStorage();
    });

    if (roleInput) roleInput.addEventListener('input', (e) => {
        D1State.profile.role = e.target.value || 'Sua Profissão';
        d1RenderPreview();
        d1SaveToStorage();
    });

    if (bioInput) bioInput.addEventListener('input', (e) => {
        D1State.profile.bio = e.target.value || '';
        d1RenderPreview();
        d1SaveToStorage();
    });

    if (whatsappInput) whatsappInput.addEventListener('input', (e) => {
        D1State.profile.whatsapp = e.target.value.replace(/\D/g, '');
        d1RenderPreview();
        d1SaveToStorage();
    });

    if (projectNameInput) projectNameInput.addEventListener('input', (e) => {
        D1State.projectName = e.target.value || 'Meu Site';
        d1SaveToStorage();
    });
}

// ========== COLOR INPUTS ==========
function d1SetupColorInputs() {
    const accentInput = d1El('color-accent');
    const colorValue = document.querySelector('#page-editor-d1 .color-value-d1');

    // Accent color presets
    const accentPresets = document.querySelectorAll('#page-editor-d1 .accent-colors-d1 .color-preset-d1');
    accentPresets.forEach(preset => {
        preset.addEventListener('click', () => {
            accentPresets.forEach(p => p.classList.remove('active'));
            document.querySelectorAll('#page-editor-d1 .gradient-preset-d1').forEach(p => p.classList.remove('active'));
            preset.classList.add('active');
            D1State.style.accentColor = preset.dataset.accent;
            D1State.style.accentGradient = null;
            if (accentInput) accentInput.value = preset.dataset.accent;
            if (colorValue) colorValue.textContent = preset.dataset.accent.toUpperCase();
            d1UpdateDefaultAvatar();
            d1RenderPreview();
            d1SaveToStorage();
        });
    });

    // Gradient presets
    const gradientPresets = document.querySelectorAll('#page-editor-d1 .gradient-preset-d1');
    gradientPresets.forEach(preset => {
        preset.addEventListener('click', () => {
            accentPresets.forEach(p => p.classList.remove('active'));
            gradientPresets.forEach(p => p.classList.remove('active'));
            preset.classList.add('active');
            D1State.style.accentGradient = preset.dataset.gradient;
            const gradientMatch = preset.dataset.gradient.match(/#[A-Fa-f0-9]{6}/);
            if (gradientMatch) D1State.style.accentColor = gradientMatch[0];
            if (colorValue) colorValue.textContent = 'GRADIENTE';
            d1UpdateDefaultAvatar();
            d1RenderPreview();
            d1SaveToStorage();
        });
    });

    // Advanced color picker toggle
    const advancedBtn = d1El('btn-advanced-color');
    const advancedPicker = d1El('advanced-color-picker');
    if (advancedBtn && advancedPicker) {
        advancedBtn.addEventListener('click', () => {
            advancedPicker.style.display = advancedPicker.style.display === 'none' ? 'block' : 'none';
        });
    }

    // Advanced color input
    if (accentInput) {
        accentInput.addEventListener('input', (e) => {
            D1State.style.accentColor = e.target.value;
            D1State.style.accentGradient = null;
            if (colorValue) colorValue.textContent = e.target.value.toUpperCase();
            accentPresets.forEach(p => p.classList.remove('active'));
            gradientPresets.forEach(p => p.classList.remove('active'));
            d1UpdateDefaultAvatar();
            d1RenderPreview();
            d1SaveToStorage();
        });
    }

    // Background presets
    const bgPresets = document.querySelectorAll('#page-editor-d1 .color-preset-d1[data-color]');
    bgPresets.forEach(preset => {
        preset.addEventListener('click', () => {
            bgPresets.forEach(p => p.classList.remove('active'));
            preset.classList.add('active');
            D1State.style.bgColor = preset.dataset.color;
            d1RenderPreview();
            d1SaveToStorage();
        });
    });
}

// ========== IMAGE UPLOADS ==========
function d1SetupImageUploads() {
    const avatarPreview = d1El('avatar-preview');
    const avatarInput = d1El('avatar-input');
    const uploadBtn = d1El('btn-upload-avatar');

    if (avatarPreview) avatarPreview.addEventListener('click', () => avatarInput?.click());
    if (uploadBtn) uploadBtn.addEventListener('click', () => avatarInput?.click());

    if (avatarInput) {
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                d1CropTarget = 'avatar';
                d1OpenCropModal(file);
            }
        });
    }
}

// ========== CROP MODAL ==========
function d1OpenCropModal(file) {
    const modal = d1El('modal-crop');
    const cropImage = d1El('crop-image');
    if (!modal || !cropImage) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        cropImage.src = e.target.result;
        modal.classList.add('active');
        cropImage.onload = () => {
            if (d1Cropper) d1Cropper.destroy();
            const aspectRatio = d1CropTarget === 'avatar' ? 1 : 16 / 9;
            d1Cropper = new Cropper(cropImage, {
                aspectRatio,
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

function d1CloseCropModal() {
    const modal = d1El('modal-crop');
    if (modal) modal.classList.remove('active');
    if (d1Cropper) {
        d1Cropper.destroy();
        d1Cropper = null;
    }
}

function d1ApplyCrop() {
    if (!d1Cropper) return;
    const canvas = d1Cropper.getCroppedCanvas({
        width: d1CropTarget === 'avatar' ? 400 : 1200,
        height: d1CropTarget === 'avatar' ? 400 : 675,
        imageSmoothingQuality: 'high'
    });
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    if (d1CropTarget === 'avatar') {
        D1State.profile.avatar = dataUrl;
        const avatarImg = d1El('avatar-img');
        if (avatarImg) avatarImg.src = dataUrl;
    } else {
        D1State.style.bgImage = dataUrl;
        d1UpdateBgPreview();
    }
    d1CloseCropModal();
    d1RenderPreview();
    d1SaveToStorage();
}

function d1UpdateBgPreview() {
    const bgPreview = d1El('bg-preview');
    const bgRemoveBtn = d1El('btn-remove-bg');
    if (!bgPreview) return;
    if (D1State.style.bgImage) {
        bgPreview.innerHTML = `<img src="${D1State.style.bgImage}" alt="Background">`;
        if (bgRemoveBtn) bgRemoveBtn.disabled = false;
    } else {
        bgPreview.innerHTML = '<span>Sem imagem</span>';
        if (bgRemoveBtn) bgRemoveBtn.disabled = true;
    }
}

// ========== BANNER DE DESTAQUE ==========
function d1SetupBanner() {
    const bannerPreview = d1El('banner-preview');
    const bannerInput = d1El('banner-input');
    const bannerTag = d1El('banner-tag');
    const bannerTitle = d1El('banner-title');
    const bannerDesc = d1El('banner-desc');
    const bannerCta = d1El('banner-cta');
    const bannerLink = d1El('banner-link');
    const bannerActive = d1El('banner-active');

    if (bannerPreview && bannerInput) {
        bannerPreview.addEventListener('click', () => bannerInput.click());
        bannerInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                d1CompressImage(file, 200, (dataUrl) => {
                    D1State.banner.image = dataUrl;
                    bannerPreview.innerHTML = `<img src="${dataUrl}" alt="Banner">`;
                    d1RenderPreview();
                    d1SaveToStorage();
                });
            }
        });
    }

    bannerTag?.addEventListener('input', (e) => { D1State.banner.tag = e.target.value; d1RenderPreview(); d1SaveToStorage(); });
    bannerTitle?.addEventListener('input', (e) => { D1State.banner.title = e.target.value; d1RenderPreview(); d1SaveToStorage(); });
    bannerDesc?.addEventListener('input', (e) => { D1State.banner.description = e.target.value; d1RenderPreview(); d1SaveToStorage(); });
    bannerCta?.addEventListener('input', (e) => { D1State.banner.cta = e.target.value || 'Saiba Mais'; d1RenderPreview(); d1SaveToStorage(); });
    bannerLink?.addEventListener('input', (e) => { D1State.banner.link = e.target.value; d1SaveToStorage(); });
    bannerActive?.addEventListener('change', (e) => { D1State.banner.active = e.target.checked; d1RenderPreview(); d1SaveToStorage(); });
}

// ========== FOOTER/ASSINATURA ==========
function d1SetupFooter() {
    const footerLogoPreview = d1El('footer-logo-preview');
    const footerLogoInput = d1El('footer-logo-input');
    const footerLogoBtn = d1El('btn-upload-footer-logo');
    const footerText = d1El('footer-text');
    const footerLink = d1El('footer-link');

    if (footerLogoBtn && footerLogoInput) {
        footerLogoBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); footerLogoInput.click(); });
    }

    if (footerLogoInput) {
        footerLogoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                d1CompressImage(file, 50, (dataUrl) => {
                    D1State.footer.logo = dataUrl;
                    if (footerLogoPreview) footerLogoPreview.innerHTML = `<img src="${dataUrl}" alt="Logo">`;
                    d1RenderPreview();
                    d1SaveToStorage();
                });
            }
        });
    }

    if (footerLogoPreview && footerLogoInput) {
        footerLogoPreview.addEventListener('click', () => footerLogoInput.click());
    }

    if (footerText) footerText.addEventListener('input', (e) => { D1State.footer.text = e.target.value; d1RenderPreview(); d1SaveToStorage(); });
    if (footerLink) footerLink.addEventListener('input', (e) => { D1State.footer.link = e.target.value; d1SaveToStorage(); });
}

// ========== COMPRESS IMAGE ==========
function d1CompressImage(file, maxKB, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 1200;
            if (width > maxDim || height > maxDim) {
                if (width > height) { height = (height * maxDim) / width; width = maxDim; }
                else { width = (width * maxDim) / height; height = maxDim; }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
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

// ========== STYLE PRESETS ==========
function d1SetupStylePresets() {
    const stylePresets = document.querySelectorAll('#page-editor-d1 .style-preset-d1');
    stylePresets.forEach(preset => {
        preset.addEventListener('click', () => {
            stylePresets.forEach(p => p.classList.remove('active'));
            preset.classList.add('active');
            D1State.style.buttonStyle = preset.dataset.style;
            d1RenderPreview();
            d1SaveToStorage();
        });
    });
}

// ========== LINKS PANEL ==========
function d1SetupLinksPanel() {
    const addBtn = d1El('btn-add-link');
    const quickBtns = document.querySelectorAll('#page-editor-d1 .quick-link-btn-d1');

    if (addBtn) addBtn.addEventListener('click', () => d1AddLink('Novo Link', '', 'link'));

    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const labels = { instagram: 'Instagram', youtube: 'YouTube', linkedin: 'LinkedIn', tiktok: 'TikTok', email: 'E-mail', website: 'Site' };
            d1AddLink(labels[type] || type, '', type);
        });
    });
}

function d1AddLink(label, url, icon) {
    D1State.links.push({ id: d1LinkIdCounter++, label, url, icon });
    d1RenderLinksList();
    d1RenderPreview();
    d1SaveToStorage();
}

function d1RemoveLink(id) {
    D1State.links = D1State.links.filter(l => l.id !== id);
    d1RenderLinksList();
    d1RenderPreview();
    d1SaveToStorage();
}

function d1UpdateLinkLabel(id, value) {
    const link = D1State.links.find(l => l.id === id);
    if (link) {
        link.label = value;
        const lower = value.toLowerCase();
        if (lower.includes('instagram')) link.icon = 'instagram';
        else if (lower.includes('whatsapp')) link.icon = 'whatsapp';
        else if (lower.includes('youtube')) link.icon = 'youtube';
        else if (lower.includes('linkedin')) link.icon = 'linkedin';
        else if (lower.includes('tiktok')) link.icon = 'tiktok';
        else if (lower.includes('email') || lower.includes('e-mail')) link.icon = 'email';
        else if (lower.includes('site') || lower.includes('website')) link.icon = 'website';
    }
    d1RenderPreview();
    d1SaveToStorage();
}

function d1UpdateLinkUrl(id, value) {
    const link = D1State.links.find(l => l.id === id);
    if (link) {
        link.rawValue = value;
        link.url = d1GenerateSmartUrl(link.icon, value);
    }
    d1RenderPreview();
    d1SaveToStorage();
}

function d1GenerateSmartUrl(type, value) {
    if (!value) return '';
    value = value.trim();
    switch (type) {
        case 'instagram': value = value.replace(/^@/, ''); if (value.includes('instagram.com')) return value; return `https://instagram.com/${value}`;
        case 'whatsapp': value = value.replace(/\D/g, ''); return `https://wa.me/${value}`;
        case 'youtube': if (value.includes('youtube.com') || value.includes('youtu.be')) return value; value = value.replace(/^@/, ''); return `https://youtube.com/@${value}`;
        case 'tiktok': if (value.includes('tiktok.com')) return value; value = value.replace(/^@/, ''); return `https://tiktok.com/@${value}`;
        case 'linkedin': if (value.includes('linkedin.com')) return value; return `https://linkedin.com/in/${value}`;
        case 'email': case 'envelope': if (value.startsWith('mailto:')) return value; if (value.includes('@')) return `mailto:${value}`; return value;
        case 'phone': value = value.replace(/\D/g, ''); return `tel:+${value}`;
        default: if (value.startsWith('http://') || value.startsWith('https://')) return value; return `https://${value}`;
    }
}

function d1GetPlaceholder(type) {
    switch (type) {
        case 'instagram': return '@seuusuario';
        case 'whatsapp': return '5511999999999';
        case 'youtube': return '@seucanal';
        case 'tiktok': return '@seuusuario';
        case 'linkedin': return 'seuperfil';
        case 'email': case 'envelope': return 'seu@email.com';
        case 'phone': return '5511999999999';
        default: return 'https://seusite.com';
    }
}

function d1RenderLinksList() {
    const container = d1El('links-list');
    if (!container) return;
    container.innerHTML = D1State.links.map(link => `
        <div class="link-item" data-id="${link.id}">
            <div class="link-item-header">
                <div class="link-item-icon">${D1IconMap[link.icon] || D1IconMap.link}</div>
                <input type="text" value="${link.label}" placeholder="Título do link"
                       onchange="d1UpdateLinkLabel(${link.id}, this.value)"
                       oninput="d1UpdateLinkLabel(${link.id}, this.value)">
                <button class="link-item-delete" onclick="d1RemoveLink(${link.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <input type="text" class="link-item-url"
                   value="${link.rawValue || link.url || ''}"
                   placeholder="${d1GetPlaceholder(link.icon)}"
                   onchange="d1UpdateLinkUrl(${link.id}, this.value)"
                   oninput="d1UpdateLinkUrl(${link.id}, this.value)">
        </div>
    `).join('');
}

// ========== MODALS ==========
function d1SetupModals() {
    const cropCancel = d1El('crop-cancel');
    const cropCancelBtn = d1El('crop-cancel-btn');
    const cropConfirm = d1El('crop-confirm');
    const publishClose = d1El('publish-close');

    if (cropCancel) cropCancel.addEventListener('click', d1CloseCropModal);
    if (cropCancelBtn) cropCancelBtn.addEventListener('click', d1CloseCropModal);
    if (cropConfirm) cropConfirm.addEventListener('click', d1ApplyCrop);
    if (publishClose) publishClose.addEventListener('click', d1ClosePublishModal);

    // Close on overlay click (scoped to D1 modals only)
    document.querySelectorAll('#page-editor-d1 .modal, #modal-crop-d1, #modal-publish-d1').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                if (d1Cropper) { d1Cropper.destroy(); d1Cropper = null; }
            }
        });
    });
}

// Expose functions globally for inline onclick handlers
window.d1RemoveLink = d1RemoveLink;
window.d1UpdateLinkLabel = d1UpdateLinkLabel;
window.d1UpdateLinkUrl = d1UpdateLinkUrl;
window.d1ApplyCrop = d1ApplyCrop;
window.d1CloseCropModal = d1CloseCropModal;
/* ===========================
   DEMENI SITES - EDITOR D1 FULL
   Part 2: Publish, Preview, Video, Carousel, Storage, Block Order
   =========================== */

// ========== PUBLISH SYSTEM ==========
const D1_PUBLISH_COST = 40;

function d1SetupPublishButton() {
    const btn = d1El('btn-publish');
    if (btn) btn.addEventListener('click', d1OpenPublishModal);

    const previewBtn = d1El('btn-preview');
    if (previewBtn) previewBtn.addEventListener('click', d1OpenFullPreview);

    const subdomainInput = d1El('subdomain-input');
    if (subdomainInput) {
        let debounceTimer;
        subdomainInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(d1ValidateSubdomain, 500);
        });
    }

    d1El('btn-confirm-publish')?.addEventListener('click', d1ConfirmPublish);
    d1El('btn-update-site')?.addEventListener('click', d1UpdateExistingSite);
}

function d1OpenPublishModal() {
    const modal = d1El('modal-publish');
    if (!modal) return;
    const currentProject = window.UserData?.getCurrentProject?.() || {};

    if (currentProject.subdomain) {
        d1HideAllPublishSteps();
        const stepUpdate = d1El('publish-step-update');
        if (stepUpdate) stepUpdate.style.display = 'block';
        const url = `https://${currentProject.subdomain}.rafaeldemeni.com`;
        const pubUrl = d1El('published-url');
        if (pubUrl) { pubUrl.href = url; pubUrl.textContent = url; }
    } else {
        d1HideAllPublishSteps();
        const stepSub = d1El('publish-step-subdomain');
        if (stepSub) stepSub.style.display = 'block';

        const credits = window.Credits?.getCredits?.() || 0;
        if (credits < D1_PUBLISH_COST) {
            d1HideAllPublishSteps();
            const stepNo = d1El('publish-step-nocredits');
            if (stepNo) stepNo.style.display = 'block';
            const bal = d1El('nocredits-balance');
            if (bal) bal.textContent = credits;
        } else {
            const bal = d1El('publish-credits-balance');
            if (bal) bal.textContent = credits;
        }
    }
    modal.classList.add('active');
}

function d1HideAllPublishSteps() {
    ['publish-step-subdomain', 'publish-step-update', 'publish-step-success', 'publish-step-nocredits'].forEach(id => {
        const el = d1El(id);
        if (el) el.style.display = 'none';
    });
}

function d1ClosePublishModal() {
    const modal = d1El('modal-publish');
    if (modal) modal.classList.remove('active');
    d1HideAllPublishSteps();
    const stepSub = d1El('publish-step-subdomain');
    if (stepSub) stepSub.style.display = 'block';
}

async function d1ValidateSubdomain() {
    const input = d1El('subdomain-input');
    const errorEl = d1El('subdomain-error');
    const availableEl = d1El('subdomain-available');
    const confirmBtn = d1El('btn-confirm-publish');
    if (!input) return;

    const slug = input.value.trim().toLowerCase();
    if (errorEl) errorEl.style.display = 'none';
    if (availableEl) availableEl.style.display = 'none';
    if (confirmBtn) confirmBtn.disabled = true;

    if (!slug) return;
    if (slug.length < 3) { if (errorEl) { errorEl.textContent = 'Mínimo 3 caracteres'; errorEl.style.display = 'block'; } return; }
    if (!/^[a-z0-9-]+$/.test(slug)) { if (errorEl) { errorEl.textContent = 'Apenas letras minúsculas, números e hífens'; errorEl.style.display = 'block'; } return; }
    if (slug.startsWith('-') || slug.endsWith('-')) { if (errorEl) { errorEl.textContent = 'Não pode começar ou terminar com hífen'; errorEl.style.display = 'block'; } return; }
    const reserved = ['www', 'admin', 'api', 'app', 'mail', 'ftp', 'test', 'demo'];
    if (reserved.includes(slug)) { if (errorEl) { errorEl.textContent = 'Este nome está reservado'; errorEl.style.display = 'block'; } return; }

    if (availableEl) availableEl.style.display = 'block';
    if (confirmBtn) confirmBtn.disabled = false;
}

async function d1ConfirmPublish() {
    const confirmBtn = d1El('btn-confirm-publish');
    const slugInput = d1El('subdomain-input');
    if (!slugInput) return;
    const slug = slugInput.value.trim().toLowerCase();
    if (!slug) return;

    if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...'; }

    try {
        if (window.Credits && typeof window.Credits.useCredits === 'function') {
            const result = window.Credits.useCredits(D1_PUBLISH_COST, 'Publicação de site');
            if (!result.success) {
                alert('Créditos insuficientes');
                if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.innerHTML = '<i class="fas fa-rocket"></i> Publicar Agora'; }
                return;
            }
        }

        const currentProjectId = window.UserData?.getCurrentProjectId?.();

        // THUMBNAIL: Capture before publish while preview is visible
        if (window.ThumbnailCapture && currentProjectId) {
            await ThumbnailCapture.capture(currentProjectId);
        }

        if (currentProjectId) {
            const project = window.UserData.getProject(currentProjectId);
            if (project) {
                project.subdomain = slug;
                project.published = true;
                project.publishedAt = new Date().toISOString();
                project.publishedUrl = `https://${slug}.rafaeldemeni.com`;
                window.UserData.saveProject(currentProjectId, project);
            }
        }

        d1HideAllPublishSteps();
        const stepSuccess = d1El('publish-step-success');
        if (stepSuccess) stepSuccess.style.display = 'block';
        const url = `https://${slug}.rafaeldemeni.com`;
        const successUrl = d1El('success-url');
        if (successUrl) { successUrl.href = url; successUrl.textContent = url; }
    } catch (error) {
        console.error('D1 Publish error:', error);
        alert('Erro ao publicar. Tente novamente.');
    } finally {
        if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.innerHTML = '<i class="fas fa-rocket"></i> Publicar Agora'; }
    }
}

async function d1UpdateExistingSite() {
    const updateBtn = d1El('btn-update-site');
    if (updateBtn) { updateBtn.disabled = true; updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atualizando...'; }

    try {
        const currentProjectId = window.UserData?.getCurrentProjectId?.();

        // THUMBNAIL: Capture before update while preview is visible
        if (window.ThumbnailCapture && currentProjectId) {
            await ThumbnailCapture.capture(currentProjectId);
        }

        if (currentProjectId) {
            const project = window.UserData.getProject(currentProjectId);
            if (project) { project.updatedAt = new Date().toISOString(); window.UserData.saveProject(currentProjectId, project); }
        }
        d1HideAllPublishSteps();
        const stepSuccess = d1El('publish-step-success');
        if (stepSuccess) stepSuccess.style.display = 'block';
        const currentProject = window.UserData?.getCurrentProject?.() || {};
        const url = `https://${currentProject.subdomain}.rafaeldemeni.com`;
        const successUrl = d1El('success-url');
        if (successUrl) { successUrl.href = url; successUrl.textContent = url; }
    } catch (error) {
        console.error('D1 Update error:', error);
        alert('Erro ao atualizar. Tente novamente.');
    } finally {
        if (updateBtn) { updateBtn.disabled = false; updateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar Conteúdo (Grátis)'; }
    }
}

// ========== FULL PREVIEW ==========
function d1OpenFullPreview() {
    const frame = d1El('preview-frame');
    if (!frame) return;

    const previewContent = frame.innerHTML;
    const accent = D1State.style.accentColor;
    const desktopBg = `background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);`;
    let phoneBgStyle = `background: ${D1State.style.bgColor};`;
    if (D1State.style.bgImage) {
        phoneBgStyle = `background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('${D1State.style.bgImage}'); background-size: cover; background-position: center;`;
    }

    const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${D1State.profile.name} | Site na Bio</title>
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

// ========== UTILITIES ==========
function d1IsLightColor(color) {
    if (!color) return false;
    let hex = color.replace('#', '');
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 150;
}

function d1AdjustColor(color, amount) {
    if (!color) return color;
    let hex = color.replace('#', '');
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// ========== BANNERS CAROUSEL ==========
function d1SetupBannersCarousel() {
    for (let i = 1; i <= 3; i++) {
        const preview = d1El(`banner-preview-${i}`);
        const input = d1El(`banner-input-${i}`);
        const titleInput = d1El(`banner-title-${i}`);
        const linkInput = d1El(`banner-link-${i}`);
        if (!preview || !input) continue;

        preview.addEventListener('click', () => input.click());
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                D1State.banners[i - 1].image = ev.target.result;
                preview.innerHTML = `<img src="${ev.target.result}" alt="Banner ${i}">`;
                preview.classList.add('has-image');
                d1RenderPreview();
                d1SaveToStorage();
            };
            reader.readAsDataURL(file);
        });

        if (titleInput) titleInput.addEventListener('input', (e) => { D1State.banners[i - 1].title = e.target.value; d1RenderPreview(); d1SaveToStorage(); });
        if (linkInput) linkInput.addEventListener('input', (e) => { D1State.banners[i - 1].link = e.target.value; d1SaveToStorage(); });

        const orientationRadios = document.querySelectorAll(`#page-editor-d1 input[name="orientation-${i}-d1"]`);
        orientationRadios.forEach(radio => {
            radio.addEventListener('change', (e) => { D1State.banners[i - 1].orientation = e.target.value; d1RenderPreview(); d1SaveToStorage(); });
        });
    }

    const carouselToggle = d1El('banners-carousel-active');
    if (carouselToggle) carouselToggle.addEventListener('change', (e) => { D1State.bannersActive = e.target.checked; d1RenderPreview(); d1SaveToStorage(); });
}

// ========== VIDEO PANEL ==========
function d1SetupVideoPanel() {
    const urlInput = d1El('video-url');
    const previewBox = d1El('video-preview-box');
    const titleInput = d1El('video-title');
    const ctaTextInput = d1El('video-cta-text');
    const ctaLinkInput = d1El('video-cta-link');
    const activeToggle = d1El('video-active');
    if (!urlInput) return;

    urlInput.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        D1State.video.url = url;
        const parsed = d1ParseVideoUrl(url);
        D1State.video.embedUrl = parsed.embedUrl;
        D1State.video.isVertical = parsed.isVertical;
        if (D1State.video.embedUrl && previewBox) {
            previewBox.innerHTML = `<iframe src="${D1State.video.embedUrl}" allowfullscreen></iframe>`;
            previewBox.classList.add('has-video');
            previewBox.classList.toggle('vertical', D1State.video.isVertical);
        } else if (previewBox) {
            previewBox.innerHTML = '<i class="fas fa-play-circle"></i><span>Preview do vídeo aparece aqui</span>';
            previewBox.classList.remove('has-video');
        }
        d1RenderPreview();
        d1SaveToStorage();
    });

    if (titleInput) titleInput.addEventListener('input', (e) => { D1State.video.title = e.target.value; d1RenderPreview(); d1SaveToStorage(); });
    if (ctaTextInput) ctaTextInput.addEventListener('input', (e) => { D1State.video.ctaText = e.target.value; d1RenderPreview(); d1SaveToStorage(); });
    if (ctaLinkInput) ctaLinkInput.addEventListener('input', (e) => { D1State.video.ctaLink = e.target.value; d1SaveToStorage(); });
    if (activeToggle) activeToggle.addEventListener('change', (e) => { D1State.video.active = e.target.checked; d1RenderPreview(); d1SaveToStorage(); });
}

function d1ParseVideoUrl(url) {
    if (!url) return { embedUrl: '', isVertical: false };
    const shortsMatch = url.match(/(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/);
    if (shortsMatch) return { embedUrl: `https://www.youtube.com/embed/${shortsMatch[1]}`, isVertical: true };
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) return { embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`, isVertical: false };
    const vimeoMatch = url.match(/(?:vimeo\.com\/)([0-9]+)/);
    if (vimeoMatch) return { embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`, isVertical: false };
    return { embedUrl: '', isVertical: false };
}

// ========== BACKGROUND IMAGE ==========
function d1SetupBackgroundImage() {
    const bgUploadBtn = d1El('btn-upload-bg');
    const bgInput = d1El('bg-input');
    const bgRemoveBtn = d1El('btn-remove-bg');
    if (!bgUploadBtn || !bgInput) return;

    bgUploadBtn.addEventListener('click', () => bgInput.click());
    bgInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        d1CropTarget = 'bg';
        d1OpenCropModal(file);
    });

    if (bgRemoveBtn) {
        bgRemoveBtn.addEventListener('click', () => {
            D1State.style.bgImage = null;
            d1UpdateBgPreview();
            d1RenderPreview();
            d1SaveToStorage();
        });
    }
}

// ========== BLOCK ORDER ==========
function d1SetupBlockOrder() {
    d1RenderBlockOrderUI();

    const resetBtn = d1El('btn-reset-order');
    if (resetBtn) resetBtn.addEventListener('click', d1ResetBlockOrder);
}

function d1ResetBlockOrder() {
    D1State.blockOrder = ['banners', 'links', 'video'];
    d1RenderBlockOrderUI();
    d1RenderFloatingBlockOrder();
    d1RenderPreview();
    d1SaveToStorage();
}

// d1RenderFloatingBlockOrder removed — toolbar was deleted from HTML

function d1RenderBlockOrderUI() {
    const container = d1El('block-order-list');
    if (!container) return;
    container.innerHTML = D1State.blockOrder.map(blockId => {
        const config = D1_BLOCK_CONFIG[blockId];
        return `<div class="block-order-item" draggable="true" data-block="${blockId}">
            <i class="fas fa-grip-vertical drag-handle"></i>
            <div class="block-icon"><i class="fas ${config.icon}"></i></div>
            <div><div class="block-name">${config.name}</div><div class="block-desc">${config.desc}</div></div>
        </div>`;
    }).join('');
    d1SetupDragDropEvents(container, '.block-order-item');
}

function d1SetupDragDropEvents(container, itemSelector) {
    const items = container.querySelectorAll(itemSelector);
    let draggedItem = null;
    items.forEach(item => {
        item.addEventListener('dragstart', (e) => { draggedItem = item; item.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
        item.addEventListener('dragend', () => { item.classList.remove('dragging'); items.forEach(i => i.classList.remove('drag-over')); draggedItem = null; });
        item.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; item.classList.add('drag-over'); });
        item.addEventListener('dragleave', () => { item.classList.remove('drag-over'); });
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('drag-over');
            if (draggedItem && draggedItem !== item) {
                const draggedBlock = draggedItem.dataset.block;
                const targetBlock = item.dataset.block;
                const draggedIndex = D1State.blockOrder.indexOf(draggedBlock);
                const targetIndex = D1State.blockOrder.indexOf(targetBlock);
                D1State.blockOrder.splice(draggedIndex, 1);
                D1State.blockOrder.splice(targetIndex, 0, draggedBlock);
                d1RenderBlockOrderUI();
                d1RenderFloatingBlockOrder();
                d1RenderPreview();
                d1SaveToStorage();
            }
        });
    });
}

// ========== STATE RESET (isolation between projects) ==========
function d1ResetState() {
    D1State.projectName = 'Meu Site';
    D1State.profile = {
        name: 'Seu Nome',
        role: 'Sua Profissão',
        bio: 'Uma breve descrição sobre você e seu trabalho.',
        avatar: 'https://ui-avatars.com/api/?name=User&background=1B97C0&color=fff&size=200&bold=true',
        whatsapp: ''
    };
    D1State.links = [
        { id: 1, label: 'Instagram', url: '', icon: 'instagram' },
        { id: 2, label: 'WhatsApp', url: '', icon: 'whatsapp' },
        { id: 3, label: 'E-mail', url: '', icon: 'envelope' },
        { id: 4, label: 'Site', url: '', icon: 'globe' }
    ];
    D1State.style = {
        accentColor: '#1B97C0',
        accentGradient: null,
        bgColor: '#000000',
        bgImage: null,
        buttonStyle: 'glass'
    };
    D1State.banner = { active: false, image: null, tag: '', title: '', description: '', cta: 'Saiba Mais', link: '' };
    D1State.footer = { logo: null, text: '', link: '' };
    D1State.banners = [
        { image: null, title: '', link: '', orientation: 'horizontal' },
        { image: null, title: '', link: '', orientation: 'horizontal' },
        { image: null, title: '', link: '', orientation: 'horizontal' }
    ];
    D1State.bannersActive = false;
    D1State.video = { active: false, url: '', embedUrl: '', title: '', ctaText: '', ctaLink: '', isVertical: false };
    D1State.blockOrder = ['banners', 'links', 'video'];
    d1LinkIdCounter = 5;
}

// ========== STORAGE ==========
function d1SaveToStorage() {
    if (d1CurrentProjectId && window.UserData) {
        const projectData = {
            profile: D1State.profile,
            links: D1State.links,
            style: D1State.style,
            banner: D1State.banner,
            footer: D1State.footer,
            banners: D1State.banners,
            bannersActive: D1State.bannersActive,
            video: D1State.video,
            blockOrder: D1State.blockOrder
        };
        window.UserData.updateProject(d1CurrentProjectId, { name: D1State.projectName, data: projectData });
    }
}

function d1LoadFromStorage() {
    d1ResetState(); // Clean slate — prevents data bleed between projects
    if (window.UserData) {
        d1CurrentProjectId = window.UserData.getCurrentProjectId();
        if (d1CurrentProjectId) {
            const project = window.UserData.getProject(d1CurrentProjectId);
            if (project) {
                D1State.projectName = project.name || 'Meu Site';
                if (project.data && project.data.profile) {
                    D1State.profile = { ...D1State.profile, ...project.data.profile };
                    D1State.links = project.data.links || D1State.links;
                    D1State.style = { ...D1State.style, ...project.data.style };
                    D1State.banner = { ...D1State.banner, ...project.data.banner };
                    D1State.footer = { ...D1State.footer, ...project.data.footer };
                    D1State.banners = project.data.banners || D1State.banners;
                    D1State.bannersActive = project.data.bannersActive || false;
                    D1State.video = { ...D1State.video, ...project.data.video };
                    D1State.blockOrder = project.data.blockOrder || D1State.blockOrder;
                    if (D1State.links.length > 0) {
                        d1LinkIdCounter = Math.max(...D1State.links.map(l => l.id)) + 1;
                    }
                } else {
                    d1SaveToStorage();
                }
                d1UpdateUIFromState();
                return;
            }
        }
    }
}

function d1UpdateUIFromState() {
    const pn = d1El('project-name'); if (pn) pn.value = D1State.projectName;
    const nm = d1El('input-name'); if (nm) nm.value = D1State.profile.name || '';
    const rl = d1El('input-role'); if (rl) rl.value = D1State.profile.role || '';
    const bi = d1El('input-bio'); if (bi) bi.value = D1State.profile.bio || '';
    const wp = d1El('input-whatsapp'); if (wp) wp.value = D1State.profile.whatsapp || '';
    const ai = d1El('avatar-img'); if (ai) ai.src = D1State.profile.avatar;
    const ca = d1El('color-accent'); if (ca) ca.value = D1State.style.accentColor;
    const cv = document.querySelector('#page-editor-d1 .color-value-d1');
    if (cv) cv.textContent = D1State.style.accentColor.toUpperCase();

    const bt = d1El('banner-tag'); if (bt) bt.value = D1State.banner.tag || '';
    const bti = d1El('banner-title'); if (bti) bti.value = D1State.banner.title || '';
    const bd = d1El('banner-desc'); if (bd) bd.value = D1State.banner.description || '';
    const bc = d1El('banner-cta'); if (bc) bc.value = D1State.banner.cta || '';
    const bl = d1El('banner-link'); if (bl) bl.value = D1State.banner.link || '';
    const ba = d1El('banner-active'); if (ba) ba.checked = D1State.banner.active || false;
    const bp = d1El('banner-preview'); if (bp && D1State.banner.image) bp.innerHTML = `<img src="${D1State.banner.image}" alt="Banner">`;

    const ft = d1El('footer-text'); if (ft) ft.value = D1State.footer.text || '';
    const fl = d1El('footer-link'); if (fl) fl.value = D1State.footer.link || '';
    const flp = d1El('footer-logo-preview'); if (flp && D1State.footer.logo) flp.innerHTML = `<img src="${D1State.footer.logo}" alt="Logo">`;

    d1UpdateBgPreview();

    document.querySelectorAll('#page-editor-d1 .color-preset-d1[data-color]').forEach(p => {
        p.classList.toggle('active', p.dataset.color === D1State.style.bgColor);
    });
    document.querySelectorAll('#page-editor-d1 .style-preset-d1').forEach(p => {
        p.classList.toggle('active', p.dataset.style === D1State.style.buttonStyle);
    });

    const vu = d1El('video-url'); if (vu) vu.value = D1State.video.url || '';
    const vt = d1El('video-title'); if (vt) vt.value = D1State.video.title || '';
    const vct = d1El('video-cta-text'); if (vct) vct.value = D1State.video.ctaText || '';
    const vcl = d1El('video-cta-link'); if (vcl) vcl.value = D1State.video.ctaLink || '';
    const va = d1El('video-active'); if (va) va.checked = D1State.video.active || false;

    for (let i = 1; i <= 3; i++) {
        const preview = d1El(`banner-preview-${i}`);
        const title = d1El(`banner-title-${i}`);
        const link = d1El(`banner-link-${i}`);
        const banner = D1State.banners[i - 1];
        if (banner) {
            if (title) title.value = banner.title || '';
            if (link) link.value = banner.link || '';
            if (preview && banner.image) { preview.innerHTML = `<img src="${banner.image}" alt="Banner">`; preview.classList.add('has-image'); }
        }
    }

    const ct = d1El('banners-carousel-active');
    if (ct) ct.checked = D1State.bannersActive || false;

    d1RenderBlockOrderUI();
    d1RenderFloatingBlockOrder();
    d1RenderLinksList();
    d1RenderPreview();
}

function d1ResetToDefaults() {
    D1State.projectName = 'Meu Site';
    D1State.profile = { name: 'Seu Nome', role: 'Sua Profissão', bio: 'Uma breve descrição sobre você.', avatar: 'https://ui-avatars.com/api/?name=User&background=1B97C0&color=fff&size=200&bold=true', whatsapp: '' };
    D1State.links = [
        { id: 1, label: 'Instagram', url: '', icon: 'instagram' },
        { id: 2, label: 'WhatsApp', url: '', icon: 'whatsapp' },
        { id: 3, label: 'E-mail', url: '', icon: 'envelope' },
        { id: 4, label: 'Site', url: '', icon: 'globe' }
    ];
    D1State.style = { accentColor: '#1B97C0', accentGradient: null, bgColor: '#000000', bgImage: null, buttonStyle: 'glass' };
    d1LinkIdCounter = 5;
    d1UpdateUIFromState();
}

window.d1ResetToDefaults = d1ResetToDefaults;
window.initD1Embedded = initD1Embedded;

// ========== D1 PREVIEW RENDER ==========
function d1RenderPreview() {
    const frame = d1El('preview-frame');
    if (!frame) { console.error('[D1] Preview frame not found!'); return; }

    const accent = D1State.style.accentColor;
    const accentStyle = D1State.style.accentGradient || accent;
    let bgStyle = `background: ${D1State.style.bgColor};`;
    if (D1State.style.bgImage) {
        bgStyle = `background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('${D1State.style.bgImage}'); background-size: cover; background-position: center; background-attachment: fixed;`;
    }

    const isLightBg = d1IsLightColor(D1State.style.bgColor) && !D1State.style.bgImage;
    const textColor = isLightBg ? '#1a1a1a' : '#fff';
    const textMuted = isLightBg ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)';
    const textFaded = isLightBg ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)';
    const glassOverlay = isLightBg ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)';
    const glassBorder = isLightBg ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

    let buttonClass = 'preview-btn';
    if (D1State.style.buttonStyle === 'solid') buttonClass += ' solid';
    else if (D1State.style.buttonStyle === 'outline') buttonClass += ' outline';

    const linksHtml = D1State.links
        .filter(link => link.label.trim())
        .map(link => `
            <a href="${link.url || '#'}" class="${buttonClass}" target="_blank" style="--accent: ${accent}">
                ${D1IconMap[link.icon] || D1IconMap.link}
                <span>${link.label}</span>
            </a>
        `).join('');

    // Generate blocks in order
    const blockHtml = {
        banners: D1State.bannersActive && D1State.banners.some(b => b.image) ? `
                <div class="preview-section-divider"><span>CONHEÇA</span></div>
                <div class="preview-carousel">
                    ${D1State.banners.filter(b => b.image).map(b => `
                        <a href="${b.link || '#'}" class="preview-carousel-slide ${b.orientation || 'horizontal'}" target="_blank" style="--accent: ${accent}">
                            <img src="${b.image}" alt="${b.title || 'Banner'}">
                            ${b.title ? `<span class="preview-carousel-title">${b.title}</span>` : ''}
                        </a>
                    `).join('')}
                </div>
            ` : '',
        links: `
                <div class="preview-section-divider"><span>LINKS ÚTEIS</span></div>
                <div class="preview-links">${linksHtml}</div>
                ${D1State.profile.whatsapp ? `
                    <a href="https://wa.me/${D1State.profile.whatsapp}" target="_blank" class="preview-cta">
                        <i class="fab fa-whatsapp"></i> Fale Comigo
                    </a>
                ` : ''}
            `,
        video: D1State.video.active && D1State.video.embedUrl ? `
                <div class="preview-section-divider"><span>ASSISTA</span></div>
                <div class="preview-video-section">
                    ${D1State.video.title ? `<h3 class="preview-video-title">${D1State.video.title}</h3>` : ''}
                    <div class="preview-video-frame ${D1State.video.isVertical ? 'vertical' : ''}">
                        <iframe src="${D1State.video.embedUrl}" allowfullscreen></iframe>
                    </div>
                    ${D1State.video.ctaText ? `<a href="${D1State.video.ctaLink || '#'}" class="preview-video-cta" target="_blank">${D1State.video.ctaText}</a>` : ''}
                </div>
            ` : ''
    };

    frame.innerHTML = `
        <style>
            .preview-container { min-height: 100%; padding: 50px 20px 30px; display: flex; flex-direction: column; align-items: center; text-align: center; font-family: 'Montserrat', sans-serif; ${bgStyle} color: ${textColor}; }
            .preview-avatar { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid ${accent}; box-shadow: 0 0 30px ${accent}60, 0 4px 20px ${accent}40; margin-bottom: 16px; position: relative; }
            .preview-online-badge { position: absolute; bottom: 5px; right: 5px; width: 16px; height: 16px; background: #22C55E; border: 3px solid #000; border-radius: 50%; animation: pulse 2s infinite; }
            .preview-name { font-size: 1.5rem; font-weight: 700; margin-bottom: 4px; max-width: 280px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; line-height: 1.2; }
            .preview-role { font-size: 0.8rem; color: ${accent}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; max-width: 280px; word-wrap: break-word; line-height: 1.3; }
            .preview-bio { font-size: 0.85rem; color: ${textMuted}; width: 100%; min-width: 200px; max-width: 280px; line-height: 1.5; margin-bottom: 24px; word-wrap: break-word; text-align: center; }
            .preview-links { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; margin-bottom: 20px; }
            .preview-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 16px 12px; background: ${glassOverlay}; backdrop-filter: blur(8px); border: 1px solid ${glassBorder}; border-radius: 12px; color: ${textColor}; text-decoration: none; font-size: 0.75rem; transition: all 0.2s; }
            .preview-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 25px ${accent}40; border-color: ${accent}; }
            .preview-btn i { font-size: 1.3rem; }
            .preview-btn.solid { background: ${accent}; color: #000; border-color: transparent; }
            .preview-btn.outline { background: transparent; border: 2px solid ${accent}; }
            .preview-cta { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 16px; background: linear-gradient(135deg, ${accent} 0%, ${d1AdjustColor(accent, -30)} 100%); border-radius: 14px; color: #000; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; box-shadow: 0 4px 20px ${accent}40; }
            .preview-banner { width: 100%; border-radius: 16px; overflow: hidden; margin-bottom: 20px; position: relative; background: #1a1a1a; box-shadow: 0 10px 40px rgba(0,0,0,0.4); }
            .preview-banner img { width: 100%; height: 200px; object-fit: cover; }
            .preview-banner::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 70%; background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%); pointer-events: none; }
            .preview-banner-tag { position: absolute; top: 12px; right: 12px; background: ${accent}; color: #000; font-size: 0.6rem; font-weight: 700; padding: 6px 12px; border-radius: 20px; text-transform: uppercase; z-index: 2; }
            .preview-banner-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 16px 18px; z-index: 2; }
            .preview-banner-title { font-size: 1rem; font-weight: 700; margin-bottom: 8px; color: #fff; line-height: 1.3; }
            .preview-banner-desc { font-size: 0.7rem; color: rgba(255,255,255,0.8); margin-bottom: 12px; line-height: 1.5; }
            .preview-banner-cta { display: inline-flex; align-items: center; gap: 6px; background: transparent; color: ${accent}; font-size: 0.75rem; font-weight: 600; text-decoration: none; }
            .preview-footer { margin-top: auto; padding-top: 20px; font-size: 0.65rem; color: ${textFaded}; display: flex; align-items: center; justify-content: center; gap: 8px; }
            .preview-footer-logo { width: 20px; height: 20px; object-fit: contain; }
            .preview-footer a { color: ${accent}; text-decoration: none; }
            .preview-carousel { width: 100%; display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
            .preview-carousel-slide { width: 100%; display: block; border-radius: 12px; overflow: hidden; position: relative; transition: all 0.3s ease; }
            .preview-carousel-slide:hover { transform: scale(1.02); }
            .preview-carousel-slide img { width: 100%; height: auto; display: block; object-fit: cover; transition: transform 0.3s ease; }
            .preview-carousel-slide:hover img { transform: scale(1.05); }
            .preview-carousel-slide.horizontal img { height: 100px; object-fit: cover; }
            .preview-carousel-slide.vertical img { height: auto; max-height: 200px; object-fit: cover; }
            .preview-carousel-title { position: absolute; bottom: 0; left: 0; right: 0; padding: 8px; background: linear-gradient(transparent, rgba(0,0,0,0.8)); color: white; font-size: 0.7rem; font-weight: 600; }
            .preview-section-divider { width: 100%; display: flex; align-items: center; gap: 12px; margin: 16px 0 12px; }
            .preview-section-divider::before, .preview-section-divider::after { content: ''; flex: 1; height: 1px; background: ${isLightBg ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'}; }
            .preview-section-divider span { font-size: 0.65rem; font-weight: 600; letter-spacing: 2px; color: ${textMuted}; text-transform: uppercase; }
            .preview-video-section { width: 100%; margin-bottom: 16px; }
            .preview-video-title { font-size: 0.85rem; font-weight: 600; margin-bottom: 8px; color: ${textColor}; }
            .preview-video-frame { width: 100%; aspect-ratio: 16/9; border-radius: 12px; overflow: hidden; background: #000; }
            .preview-video-frame iframe { width: 100%; height: 100%; border: none; }
            .preview-video-frame.vertical { aspect-ratio: 9/16; max-height: 300px; margin: 0 auto; width: 60%; }
            .preview-video-cta { display: block; margin-top: 10px; padding: 10px 16px; background: ${accent}; color: #000; font-size: 0.75rem; font-weight: 600; border-radius: 8px; text-decoration: none; text-align: center; }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        </style>

        <div class="preview-container">
            <div style="position: relative; display: inline-block;">
                <img src="${D1State.profile.avatar}" alt="${D1State.profile.name}" class="preview-avatar">
                <div class="preview-online-badge"></div>
            </div>
            <h1 class="preview-name">${D1State.profile.name}</h1>
            <p class="preview-role">${D1State.profile.role}</p>
            <p class="preview-bio">${D1State.profile.bio}</p>

            ${D1State.banner.active && D1State.banner.title ? `
                <a href="${D1State.banner.link || '#'}" target="_blank" class="preview-banner">
                    ${D1State.banner.image ? `<img src="${D1State.banner.image}" alt="${D1State.banner.title}">` : ''}
                    ${D1State.banner.tag ? `<span class="preview-banner-tag">${D1State.banner.tag}</span>` : ''}
                    <div class="preview-banner-content">
                        <div class="preview-banner-title">${D1State.banner.title}</div>
                        ${D1State.banner.description ? `<div class="preview-banner-desc">${D1State.banner.description}</div>` : ''}
                        <span class="preview-banner-cta">${D1State.banner.cta || 'Saiba Mais'} →</span>
                    </div>
                </a>
            ` : ''}

            ${D1State.blockOrder.map(block => blockHtml[block]).join('')}

            <div class="preview-footer">
                ${D1State.footer.logo ? `<img src="${D1State.footer.logo}" class="preview-footer-logo" alt="">` : ''}
                ${D1State.footer.link ? `<a href="${D1State.footer.link}" target="_blank">${D1State.footer.text || 'Feito com ♥ por DEMENI'}</a>` : `<span>${D1State.footer.text || 'Feito com ♥ por DEMENI'}</span>`}
            </div>
        </div>
    `;
}

// ========== GENERATE FINAL HTML ==========
function d1GenerateFinalHTML() {
    const accent = D1State.style.accentColor;
    const isLightBg = d1IsLightColor(D1State.style.bgColor) && !D1State.style.bgImage;
    const textColor = isLightBg ? '#1a1a1a' : '#fff';
    const textMuted = isLightBg ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)';
    const glassOverlay = isLightBg ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)';
    const glassBorder = isLightBg ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

    let bgStyle = `background: ${D1State.style.bgColor};`;
    if (D1State.style.bgImage) {
        bgStyle = `background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('${D1State.style.bgImage}'); background-size: cover; background-position: center;`;
    }

    let buttonClass = 'link-btn';
    if (D1State.style.buttonStyle === 'solid') buttonClass += ' solid';
    else if (D1State.style.buttonStyle === 'outline') buttonClass += ' outline';

    const linksHtml = D1State.links.filter(link => link.label.trim()).map(link => `
        <a href="${link.url || '#'}" class="${buttonClass}" target="_blank">
            ${D1IconMap[link.icon] || D1IconMap.link}
            <span>${link.label}</span>
        </a>
    `).join('');

    const blockHtml = {
        banners: D1State.bannersActive && D1State.banners.some(b => b.image) ? `
            <div class="section-label">CONHEÇA</div>
            <div class="carousel">${D1State.banners.filter(b => b.image).map(b => `
                <a href="${b.link || '#'}" class="carousel-slide ${b.orientation || 'horizontal'}" target="_blank">
                    <img src="${b.image}" alt="${b.title || 'Banner'}">
                    ${b.title ? `<span class="carousel-title">${b.title}</span>` : ''}
                </a>
            `).join('')}</div>
        ` : '',
        links: `<div class="section-label">LINKS ÚTEIS</div><div class="links">${linksHtml}</div>`,
        video: D1State.video.active && D1State.video.embedUrl ? `
            <div class="section-label">ASSISTA</div>
            <div class="video-section">
                ${D1State.video.title ? `<h3 class="video-title">${D1State.video.title}</h3>` : ''}
                <div class="video-frame ${D1State.video.isVertical ? 'vertical' : ''}"><iframe src="${D1State.video.embedUrl}" allowfullscreen></iframe></div>
                ${D1State.video.ctaText ? `<a href="${D1State.video.ctaLink || '#'}" class="video-cta" target="_blank">${D1State.video.ctaText}</a>` : ''}
            </div>
        ` : ''
    };
    const orderedBlocksHtml = D1State.blockOrder.map(block => blockHtml[block]).join('');

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${D1State.profile.name} | Site na Bio</title>
    <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Montserrat', sans-serif; min-height: 100vh; ${bgStyle} color: ${textColor}; }
        .container { max-width: 480px; margin: 0 auto; padding: 50px 20px 30px; text-align: center; min-height: 100vh; display: flex; flex-direction: column; align-items: center; }
        .avatar { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid ${accent}; box-shadow: 0 4px 25px ${accent}40; margin-bottom: 20px; }
        h1 { font-size: 1.8rem; margin-bottom: 6px; }
        .role { color: ${accent}; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; }
        .bio { color: ${textMuted}; max-width: 320px; line-height: 1.6; margin-bottom: 30px; }
        .links { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; margin-bottom: 24px; }
        .link-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 20px 15px; background: ${glassOverlay}; backdrop-filter: blur(8px); border: 1px solid ${glassBorder}; border-radius: 14px; color: ${textColor}; text-decoration: none; transition: all 0.3s; }
        .link-btn:hover { background: rgba(255,255,255,0.15); border-color: ${accent}50; transform: translateY(-3px); }
        .link-btn i { font-size: 1.5rem; } .link-btn span { font-size: 0.8rem; }
        .link-btn.solid { background: ${accent}; color: #000; border-color: transparent; }
        .link-btn.outline { background: transparent; border: 2px solid ${accent}; }
        .cta { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 18px; background: linear-gradient(135deg, ${accent} 0%, ${d1AdjustColor(accent, -30)} 100%); border-radius: 14px; color: #000; font-weight: 700; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; box-shadow: 0 4px 25px ${accent}40; transition: all 0.3s; }
        .footer { margin-top: auto; padding-top: 30px; font-size: 0.7rem; color: rgba(255,255,255,0.3); }
        .whatsapp-float { position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; background: #25D366; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.8rem; text-decoration: none; box-shadow: 0 4px 20px rgba(37,211,102,0.4); }
        .section-label { width: 100%; text-align: center; font-size: 0.65rem; font-weight: 600; letter-spacing: 2px; color: ${textMuted}; margin: 24px 0 12px; }
        .featured-banner { display: block; width: 100%; background: ${glassOverlay}; border: 1px solid ${glassBorder}; border-radius: 16px; overflow: hidden; text-decoration: none; color: ${textColor}; margin-bottom: 20px; }
        .featured-banner img { width: 100%; height: 140px; object-fit: cover; }
        .banner-tag { display: inline-block; padding: 4px 10px; background: ${accent}; color: #000; font-size: 0.65rem; font-weight: 600; text-transform: uppercase; border-radius: 4px; margin: 12px 0 0 12px; }
        .banner-content { padding: 12px 16px 16px; }
        .banner-title { font-weight: 700; font-size: 0.95rem; margin-bottom: 4px; }
        .banner-desc { font-size: 0.8rem; color: ${textMuted}; margin-bottom: 8px; }
        .banner-cta { font-size: 0.75rem; color: ${accent}; font-weight: 600; }
        .carousel { display: flex; gap: 10px; overflow-x: auto; padding: 5px 0; width: 100%; }
        .carousel-slide { flex-shrink: 0; border-radius: 12px; overflow: hidden; text-decoration: none; }
        .carousel-slide.horizontal { width: 200px; height: 120px; } .carousel-slide.vertical { width: 100px; height: 180px; }
        .carousel-slide img { width: 100%; height: 100%; object-fit: cover; }
        .video-section { width: 100%; margin-bottom: 20px; }
        .video-title { font-size: 0.9rem; font-weight: 600; margin-bottom: 10px; text-align: center; }
        .video-frame { width: 100%; border-radius: 12px; overflow: hidden; aspect-ratio: 16/9; }
        .video-frame.vertical { aspect-ratio: 9/16; max-width: 240px; margin: 0 auto; }
        .video-frame iframe { width: 100%; height: 100%; border: none; }
        .video-cta { display: block; margin-top: 10px; padding: 10px 16px; background: ${accent}; color: #000; font-size: 0.75rem; font-weight: 600; border-radius: 8px; text-decoration: none; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <img src="${D1State.profile.avatar}" alt="${D1State.profile.name}" class="avatar">
        <h1>${D1State.profile.name}</h1>
        <p class="role">${D1State.profile.role}</p>
        <p class="bio">${D1State.profile.bio}</p>
        ${D1State.banner.active && D1State.banner.title ? `
            <a href="${D1State.banner.link || '#'}" target="_blank" class="featured-banner">
                ${D1State.banner.image ? `<img src="${D1State.banner.image}" alt="${D1State.banner.title}">` : ''}
                ${D1State.banner.tag ? `<span class="banner-tag">${D1State.banner.tag}</span>` : ''}
                <div class="banner-content">
                    <div class="banner-title">${D1State.banner.title}</div>
                    ${D1State.banner.description ? `<div class="banner-desc">${D1State.banner.description}</div>` : ''}
                    <span class="banner-cta">${D1State.banner.cta || 'Saiba Mais'} →</span>
                </div>
            </a>
        ` : ''}
        ${orderedBlocksHtml}
        ${D1State.profile.whatsapp ? `<a href="https://wa.me/${D1State.profile.whatsapp}" target="_blank" class="cta"><i class="fab fa-whatsapp"></i> Fale Comigo no WhatsApp</a>` : ''}
        <div class="footer">© ${new Date().getFullYear()} ${D1State.profile.name} • Feito com ♥ por DEMENI</div>
    </div>
    ${D1State.profile.whatsapp ? `<a href="https://wa.me/${D1State.profile.whatsapp}" target="_blank" class="whatsapp-float"><i class="fab fa-whatsapp"></i></a>` : ''}
</body>
</html>`;
}

window.d1GenerateFinalHTML = d1GenerateFinalHTML;
