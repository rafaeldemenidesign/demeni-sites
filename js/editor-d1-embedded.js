/* ===========================
   DEMENI SITES - D-1 EMBEDDED EDITOR
   Wrapper for D-1 editor functionality within app.html
   
   This file connects editor.js functions to page-editor-d1 elements
   =========================== */

// ========== D-1 EMBEDDED STATE ==========
const D1Embedded = {
    initialized: false,
    currentProjectId: null,

    // State mirror (uses same structure as editor.js)
    state: {
        projectName: 'Meu Site',
        profile: {
            name: 'Seu Nome',
            role: 'Sua Profissão',
            bio: 'Sua bio aqui ♡',
            avatar: null
        },
        links: [
            { id: 1, icon: 'instagram', label: 'Instagram', url: '' },
            { id: 2, icon: 'whatsapp', label: 'WhatsApp', url: '' },
            { id: 3, icon: 'link', label: 'Meu Site', url: '' }
        ],
        style: {
            accentColor: '#D4AF37',
            bgColor: '#f0f4ff',
            textColor: '#1a1a2e',
            buttonStyle: 'rounded',
            buttonShadow: 'none',
            buttonColor: '#D4AF37',
            buttonTextColor: '#000000',
            buttonLayout: 'list',
            fontFamily: 'Montserrat'
        },
        banners: [],
        video: {
            enabled: false,
            url: '',
            embedUrl: ''
        },
        bgImage: null,
        blockOrder: ['banners', 'links', 'video']
    },

    linkIdCounter: 4,
    bannerIdCounter: 1
};

// ========== ICON MAP ==========
const iconMapD1 = {
    instagram: '<i class="fab fa-instagram"></i>',
    whatsapp: '<i class="fab fa-whatsapp"></i>',
    youtube: '<i class="fab fa-youtube"></i>',
    linkedin: '<i class="fab fa-linkedin-in"></i>',
    tiktok: '<i class="fab fa-tiktok"></i>',
    facebook: '<i class="fab fa-facebook-f"></i>',
    twitter: '<i class="fab fa-twitter"></i>',
    email: '<i class="fas fa-envelope"></i>',
    phone: '<i class="fas fa-phone"></i>',
    location: '<i class="fas fa-map-marker-alt"></i>',
    link: '<i class="fas fa-link"></i>'
};

// ========== INITIALIZATION ==========
function initD1Embedded() {
    if (D1Embedded.initialized) {
        console.log('[D1 Embedded] Already initialized, refreshing...');
        loadD1FromStorage();
        renderD1Preview();
        return;
    }

    console.log('[D1 Embedded] Initializing...');

    // Load project data
    loadD1FromStorage();

    // Setup all functionality
    setupD1TabNavigation();
    setupD1ProfileInputs();
    setupD1LinksPanel();
    setupD1BannersPanel();
    setupD1VideoPanel();
    setupD1StylePanel();
    setupD1OrderPanel();

    // Initial render
    renderD1Preview();
    updateD1UIFromState();

    D1Embedded.initialized = true;
    console.log('[D1 Embedded] Initialization complete');
}

// ========== TAB NAVIGATION ==========
function setupD1TabNavigation() {
    const tabs = document.querySelectorAll('#editor-d1-tabs .tab-btn');
    const contents = document.querySelectorAll('#controls-d1 .tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            // Remove active from all
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Add active to clicked
            tab.classList.add('active');
            const targetContent = document.getElementById(`tab-d1-${targetTab}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// ========== PROFILE INPUTS ==========
function setupD1ProfileInputs() {
    // Name
    const nameInput = document.getElementById('input-name-d1');
    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            D1Embedded.state.profile.name = e.target.value;
            renderD1Preview();
            saveD1ToStorage();
        });
    }

    // Role
    const roleInput = document.getElementById('input-role-d1');
    if (roleInput) {
        roleInput.addEventListener('input', (e) => {
            D1Embedded.state.profile.role = e.target.value;
            renderD1Preview();
            saveD1ToStorage();
        });
    }

    // Bio
    const bioInput = document.getElementById('input-bio-d1');
    if (bioInput) {
        bioInput.addEventListener('input', (e) => {
            D1Embedded.state.profile.bio = e.target.value;
            renderD1Preview();
            saveD1ToStorage();
        });
    }

    // Avatar Upload
    const avatarInput = document.getElementById('avatar-input-d1');
    const avatarBtn = document.getElementById('btn-upload-avatar-d1');
    const avatarPreview = document.getElementById('avatar-preview-d1');

    if (avatarBtn && avatarInput) {
        avatarBtn.addEventListener('click', () => avatarInput.click());
        avatarPreview?.addEventListener('click', () => avatarInput.click());

        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    D1Embedded.state.profile.avatar = ev.target.result;
                    const img = document.getElementById('avatar-img-d1');
                    if (img) img.src = ev.target.result;
                    renderD1Preview();
                    saveD1ToStorage();
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// ========== LINKS PANEL ==========
function setupD1LinksPanel() {
    const addBtn = document.getElementById('btn-add-link-d1');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            addD1Link('Novo Link', '', 'link');
        });
    }

    renderD1LinksList();
}

function addD1Link(label, url, icon) {
    D1Embedded.state.links.push({
        id: D1Embedded.linkIdCounter++,
        icon: icon || 'link',
        label: label || 'Novo Link',
        url: url || ''
    });
    renderD1LinksList();
    renderD1Preview();
    saveD1ToStorage();
}

function removeD1Link(id) {
    D1Embedded.state.links = D1Embedded.state.links.filter(l => l.id !== id);
    renderD1LinksList();
    renderD1Preview();
    saveD1ToStorage();
}

function updateD1Link(id, field, value) {
    const link = D1Embedded.state.links.find(l => l.id === id);
    if (link) {
        link[field] = value;
        renderD1Preview();
        saveD1ToStorage();
    }
}

function renderD1LinksList() {
    const container = document.getElementById('links-container-d1');
    if (!container) return;

    if (D1Embedded.state.links.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum link adicionado</p>';
        return;
    }

    container.innerHTML = D1Embedded.state.links.map(link => `
        <div class="link-item" data-id="${link.id}">
            <div class="link-item-header">
                <div class="link-item-icon">
                    ${iconMapD1[link.icon] || iconMapD1.link}
                </div>
                <input type="text" 
                       value="${link.label}" 
                       placeholder="Título do link"
                       onchange="updateD1Link(${link.id}, 'label', this.value)"
                       oninput="updateD1Link(${link.id}, 'label', this.value)">
                <button class="link-item-delete" onclick="removeD1Link(${link.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <input type="text" 
                   class="link-item-url"
                   value="${link.rawValue || link.url || ''}" 
                   placeholder="${getD1Placeholder(link.icon)}"
                   onchange="updateD1LinkUrl(${link.id}, this.value)"
                   oninput="updateD1LinkUrl(${link.id}, this.value)">
        </div>
    `).join('');
}

// Get placeholder based on link type
function getD1Placeholder(type) {
    switch (type) {
        case 'instagram': return '@seuusuario';
        case 'whatsapp': return '5511999999999';
        case 'youtube': return '@seucanal';
        case 'tiktok': return '@seuusuario';
        case 'linkedin': return 'seuperfil';
        case 'email': return 'seu@email.com';
        case 'phone': return '5511999999999';
        default: return 'https://seusite.com';
    }
}

// Generate smart URL from raw value
function updateD1LinkUrl(id, value) {
    const link = D1Embedded.state.links.find(l => l.id === id);
    if (link) {
        link.rawValue = value;
        link.url = generateD1SmartUrl(link.icon, value);
        renderD1Preview();
        saveD1ToStorage();
    }
}

function generateD1SmartUrl(type, value) {
    if (!value) return '';
    value = value.trim();

    switch (type) {
        case 'instagram':
            value = value.replace(/^@/, '');
            if (value.includes('instagram.com')) return value;
            return `https://instagram.com/${value}`;
        case 'whatsapp':
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
            if (value.startsWith('mailto:')) return value;
            if (value.includes('@')) return `mailto:${value}`;
            return value;
        case 'phone':
            value = value.replace(/\D/g, '');
            return `tel:+${value}`;
        default:
            if (value.startsWith('http://') || value.startsWith('https://')) return value;
            return `https://${value}`;
    }
}

// ========== BANNERS PANEL ==========
function setupD1BannersPanel() {
    const addBtn = document.getElementById('btn-add-banner-d1');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            // Create file input for banner
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        addD1Banner(ev.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        });
    }

    renderD1BannersList();
}

function addD1Banner(imageData) {
    D1Embedded.state.banners.push({
        id: D1Embedded.bannerIdCounter++,
        image: imageData,
        link: ''
    });
    renderD1BannersList();
    renderD1Preview();
    saveD1ToStorage();
}

function removeD1Banner(id) {
    D1Embedded.state.banners = D1Embedded.state.banners.filter(b => b.id !== id);
    renderD1BannersList();
    renderD1Preview();
    saveD1ToStorage();
}

function renderD1BannersList() {
    const container = document.getElementById('banners-container-d1');
    if (!container) return;

    if (D1Embedded.state.banners.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum banner adicionado</p>';
        return;
    }

    container.innerHTML = D1Embedded.state.banners.map(banner => `
        <div class="banner-item" data-id="${banner.id}">
            <img src="${banner.image}" alt="Banner" class="banner-thumb">
            <input type="text" placeholder="Link (opcional)" value="${banner.link || ''}"
                onchange="updateD1Banner(${banner.id}, 'link', this.value)">
            <button class="btn-delete" onclick="removeD1Banner(${banner.id})" title="Remover">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function updateD1Banner(id, field, value) {
    const banner = D1Embedded.state.banners.find(b => b.id === id);
    if (banner) {
        banner[field] = value;
        saveD1ToStorage();
    }
}

// ========== VIDEO PANEL ==========
function setupD1VideoPanel() {
    const videoInput = document.getElementById('input-video-d1');
    if (videoInput) {
        videoInput.addEventListener('input', (e) => {
            const url = e.target.value;
            D1Embedded.state.video.url = url;
            D1Embedded.state.video.embedUrl = parseD1VideoUrl(url);
            D1Embedded.state.video.enabled = !!url;
            renderD1Preview();
            saveD1ToStorage();
        });
    }
}

function parseD1VideoUrl(url) {
    if (!url) return '';

    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) {
        return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return url;
}

// ========== STYLE PANEL ==========
function setupD1StylePanel() {
    // 1. Accent Colors
    const accentColors = document.querySelectorAll('#accent-colors-d1 .color-preset');
    accentColors.forEach(btn => {
        btn.addEventListener('click', () => {
            accentColors.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const color = btn.dataset.accent;
            D1Embedded.state.style.accentColor = color;
            D1Embedded.state.style.buttonColor = color;
            updateD1ColorPickers();
            renderD1Preview();
            saveD1ToStorage();
        });
    });

    // 2. Background Colors (Light)
    const bgColorsLight = document.querySelectorAll('#bg-colors-light-d1 .color-preset');
    bgColorsLight.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all bg colors
            document.querySelectorAll('.bg-colors-d1 .color-preset').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            D1Embedded.state.style.bgColor = btn.dataset.bg;
            // Auto-adjust text color for light bg
            D1Embedded.state.style.textColor = '#1a1a2e';
            renderD1Preview();
            saveD1ToStorage();
        });
    });

    // 2b. Background Colors (Dark)
    const bgColorsDark = document.querySelectorAll('#bg-colors-dark-d1 .color-preset');
    bgColorsDark.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.bg-colors-d1 .color-preset').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            D1Embedded.state.style.bgColor = btn.dataset.bg;
            // Auto-adjust text color for dark bg
            D1Embedded.state.style.textColor = '#f0f4ff';
            renderD1Preview();
            saveD1ToStorage();
        });
    });

    // 3. Button Styles
    const buttonStyles = document.querySelectorAll('#button-styles-d1 .style-preset-d1');
    buttonStyles.forEach(btn => {
        btn.addEventListener('click', () => {
            buttonStyles.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            D1Embedded.state.style.buttonStyle = btn.dataset.style;
            renderD1Preview();
            saveD1ToStorage();
        });
    });

    // 4. Button Color Picker
    const btnColorInput = document.getElementById('btn-color-d1');
    const btnColorHex = document.getElementById('btn-color-hex-d1');
    if (btnColorInput) {
        btnColorInput.addEventListener('input', (e) => {
            const color = e.target.value;
            D1Embedded.state.style.buttonColor = color;
            if (btnColorHex) btnColorHex.textContent = color.toUpperCase();
            renderD1Preview();
            saveD1ToStorage();
        });
    }

    // 5. Button Text Color Picker
    const btnTextColorInput = document.getElementById('btn-text-color-d1');
    const btnTextColorHex = document.getElementById('btn-text-color-hex-d1');
    if (btnTextColorInput) {
        btnTextColorInput.addEventListener('input', (e) => {
            const color = e.target.value;
            D1Embedded.state.style.buttonTextColor = color;
            if (btnTextColorHex) btnTextColorHex.textContent = color.toUpperCase();
            renderD1Preview();
            saveD1ToStorage();
        });
    }
}

// Update color pickers to reflect current state
function updateD1ColorPickers() {
    const btnColorInput = document.getElementById('btn-color-d1');
    const btnColorHex = document.getElementById('btn-color-hex-d1');
    const btnTextColorInput = document.getElementById('btn-text-color-d1');
    const btnTextColorHex = document.getElementById('btn-text-color-hex-d1');

    if (btnColorInput) btnColorInput.value = D1Embedded.state.style.buttonColor || '#D4AF37';
    if (btnColorHex) btnColorHex.textContent = (D1Embedded.state.style.buttonColor || '#D4AF37').toUpperCase();
    if (btnTextColorInput) btnTextColorInput.value = D1Embedded.state.style.buttonTextColor || '#000000';
    if (btnTextColorHex) btnTextColorHex.textContent = (D1Embedded.state.style.buttonTextColor || '#000000').toUpperCase();
}

// ========== ORDER PANEL ==========
function setupD1OrderPanel() {
    renderD1OrderList();
}

function renderD1OrderList() {
    const container = document.getElementById('order-list-d1');
    if (!container) return;

    const blockConfig = {
        banners: { name: 'Banners', icon: 'fa-images' },
        links: { name: 'Links', icon: 'fa-link' },
        video: { name: 'Vídeo', icon: 'fa-video' }
    };

    container.innerHTML = D1Embedded.state.blockOrder.map(block => `
        <div class="order-item" data-block="${block}" draggable="true">
            <i class="fas ${blockConfig[block]?.icon || 'fa-cube'}"></i>
            <span>${blockConfig[block]?.name || block}</span>
            <i class="fas fa-grip-vertical drag-handle"></i>
        </div>
    `).join('');

    // Setup drag and drop
    setupD1DragDrop(container);
}

function setupD1DragDrop(container) {
    let draggedItem = null;

    container.querySelectorAll('.order-item').forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            draggedItem = null;

            // Update order in state
            const newOrder = Array.from(container.querySelectorAll('.order-item'))
                .map(el => el.dataset.block);
            D1Embedded.state.blockOrder = newOrder;
            renderD1Preview();
            saveD1ToStorage();
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(container, e.clientY);
            if (afterElement == null) {
                container.appendChild(draggedItem);
            } else {
                container.insertBefore(draggedItem, afterElement);
            }
        });
    });
}

function getDragAfterElement(container, y) {
    const items = [...container.querySelectorAll('.order-item:not(.dragging)')];
    return items.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        }
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ========== PREVIEW RENDER ==========
function renderD1Preview() {
    const frame = document.getElementById('preview-frame-d1');
    if (!frame) return;

    const { profile, links, banners, video, style, blockOrder } = D1Embedded.state;

    // Generate avatar
    const avatarSrc = profile.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=${style.accentColor.replace('#', '')}&color=fff&size=200`;

    // Generate blocks HTML based on order
    const blocksHtml = blockOrder.map(block => {
        switch (block) {
            case 'banners':
                return generateD1BannersHtml();
            case 'links':
                return generateD1LinksHtml();
            case 'video':
                return generateD1VideoHtml();
            default:
                return '';
        }
    }).join('');

    frame.innerHTML = `
        <div class="d1-preview" style="
            background: ${style.bgColor};
            color: ${style.textColor};
            font-family: ${style.fontFamily}, sans-serif;
            min-height: 100%;
            padding: 20px;
            box-sizing: border-box;
        ">
            <!-- Profile Section -->
            <div class="d1-profile" style="text-align: center; margin-bottom: 20px;">
                <img src="${avatarSrc}" alt="Avatar" style="
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    border: 3px solid ${style.accentColor};
                    object-fit: cover;
                ">
                <h2 style="margin: 12px 0 4px; font-size: 18px; font-weight: 600;">${profile.name}</h2>
                <p style="margin: 0 0 8px; font-size: 12px; opacity: 0.8;">${profile.role}</p>
                <p style="margin: 0; font-size: 11px; opacity: 0.7;">${profile.bio}</p>
            </div>
            
            ${blocksHtml}
        </div>
    `;
}

function generateD1BannersHtml() {
    const { banners } = D1Embedded.state;
    if (!banners || banners.length === 0) return '';

    return `
        <div class="d1-banners" style="margin-bottom: 16px;">
            ${banners.map(b => `
                <img src="${b.image}" alt="Banner" style="
                    width: 100%;
                    border-radius: 12px;
                    margin-bottom: 8px;
                ">
            `).join('')}
        </div>
    `;
}

function generateD1LinksHtml() {
    const { links, style } = D1Embedded.state;
    if (!links || links.length === 0) return '';

    // Generate button styles based on buttonStyle
    let buttonBg, buttonBorder, buttonBackdrop;

    switch (style.buttonStyle) {
        case 'glass':
            buttonBg = `rgba(${hexToRgb(style.buttonColor)}, 0.2)`;
            buttonBorder = `1px solid rgba(255,255,255,0.2)`;
            buttonBackdrop = 'backdrop-filter: blur(10px);';
            break;
        case 'outline':
            buttonBg = 'transparent';
            buttonBorder = `2px solid ${style.buttonColor}`;
            buttonBackdrop = '';
            break;
        case 'solid':
        default:
            buttonBg = style.buttonColor;
            buttonBorder = 'none';
            buttonBackdrop = '';
            break;
    }

    return `
        <div class="d1-links" style="display: flex; flex-direction: column; gap: 10px;">
            ${links.map(link => `
                <a href="${link.url || '#'}" style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px 16px;
                    background: ${buttonBg};
                    color: ${style.buttonStyle === 'outline' ? style.buttonColor : style.buttonTextColor};
                    border: ${buttonBorder};
                    border-radius: 10px;
                    text-decoration: none;
                    font-size: 13px;
                    font-weight: 500;
                    ${buttonBackdrop}
                    ${style.buttonShadow === 'subtle' ? 'box-shadow: 0 2px 8px rgba(0,0,0,0.1);' : ''}
                    ${style.buttonShadow === 'strong' ? 'box-shadow: 0 4px 16px rgba(0,0,0,0.2);' : ''}
                    transition: transform 0.2s, opacity 0.2s;
                ">
                    ${iconMapD1[link.icon] || ''} ${link.label}
                </a>
            `).join('')}
        </div>
    `;
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    if (!hex) return '212, 175, 55';
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ?
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
        '212, 175, 55';
}

function generateD1VideoHtml() {
    const { video } = D1Embedded.state;
    if (!video.enabled || !video.embedUrl) return '';

    return `
        <div class="d1-video" style="margin-top: 16px;">
            <iframe src="${video.embedUrl}" 
                style="width: 100%; aspect-ratio: 16/9; border-radius: 12px; border: none;"
                allowfullscreen></iframe>
        </div>
    `;
}

// ========== STORAGE ==========
function saveD1ToStorage() {
    const projectId = UserData?.getCurrentProject?.()?.id;
    if (!projectId) {
        console.warn('[D1 Embedded] No current project to save');
        return;
    }

    const projectData = {
        ...D1Embedded.state,
        linkIdCounter: D1Embedded.linkIdCounter,
        bannerIdCounter: D1Embedded.bannerIdCounter
    };

    UserData.updateProject(projectId, { data: projectData });
    console.log('[D1 Embedded] Saved to storage');
}

function loadD1FromStorage() {
    const project = UserData?.getCurrentProject?.();
    if (!project) {
        console.log('[D1 Embedded] No current project, using defaults');
        return;
    }

    D1Embedded.currentProjectId = project.id;

    if (project.data) {
        // Merge saved data with defaults
        D1Embedded.state = {
            ...D1Embedded.state,
            ...project.data,
            profile: { ...D1Embedded.state.profile, ...project.data.profile },
            style: { ...D1Embedded.state.style, ...project.data.style },
            video: { ...D1Embedded.state.video, ...project.data.video }
        };
        D1Embedded.linkIdCounter = project.data.linkIdCounter || 4;
        D1Embedded.bannerIdCounter = project.data.bannerIdCounter || 1;

        console.log('[D1 Embedded] Loaded from storage:', project.name);
    }
}

function updateD1UIFromState() {
    const { profile, video } = D1Embedded.state;

    // Profile inputs
    const nameInput = document.getElementById('input-name-d1');
    if (nameInput) nameInput.value = profile.name;

    const roleInput = document.getElementById('input-role-d1');
    if (roleInput) roleInput.value = profile.role;

    const bioInput = document.getElementById('input-bio-d1');
    if (bioInput) bioInput.value = profile.bio;

    // Avatar
    if (profile.avatar) {
        const avatarImg = document.getElementById('avatar-img-d1');
        if (avatarImg) avatarImg.src = profile.avatar;
    }

    // Video
    const videoInput = document.getElementById('input-video-d1');
    if (videoInput) videoInput.value = video.url || '';

    // Render lists
    renderD1LinksList();
    renderD1BannersList();
    renderD1OrderList();
}

// ========== EXPOSE GLOBALLY ==========
window.initD1Embedded = initD1Embedded;
window.addD1Link = addD1Link;
window.removeD1Link = removeD1Link;
window.updateD1Link = updateD1Link;
window.updateD1LinkUrl = updateD1LinkUrl;
window.removeD1Banner = removeD1Banner;
window.updateD1Banner = updateD1Banner;
window.applyD1Theme = applyD1Theme;
window.D1Embedded = D1Embedded;

console.log('[D1 Embedded] Module loaded');
