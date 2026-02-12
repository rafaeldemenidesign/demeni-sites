/**
 * Feed / Página Inicial
 * Loads posts from Supabase (feed_posts) with localStorage fallback
 * Interactions (like/favorite) sync with Supabase feed_interactions
 */

(function () {
    'use strict';

    const MOCK_POSTS = [
        {
            id: 'mock-1',
            author: 'Demeni Sites',
            authorAvatar: 'https://ui-avatars.com/api/?name=DS&background=7c3aed&color=fff&size=80',
            date: '2026-02-12T01:00:00',
            text: 'Bem-vindo à Página Inicial! Aqui você vai encontrar todas as atualizações, novidades e dicas da plataforma Demeni Sites. Fique ligado para não perder nenhuma novidade importante sobre novas funcionalidades e tutoriais.',
            image: 'assets/feed/post-1.png',
            title: 'Novidades 2026',
            likes: 24,
            isLiked: false,
            isFavorited: false
        },
        {
            id: 'mock-2',
            author: 'Demeni Sites',
            authorAvatar: 'https://ui-avatars.com/api/?name=DS&background=7c3aed&color=fff&size=80',
            date: '2026-02-11T14:30:00',
            text: 'Nova aula disponível! Aprenda a criar sites profissionais com o editor D2. Neste tutorial completo, vamos cobrir todos os aspectos do design moderno, desde a escolha de cores até a otimização para dispositivos móveis. Acesse a seção Aulas para começar.',
            image: 'assets/feed/post-2.png',
            title: 'Tutorial Web Design',
            likes: 18,
            isLiked: false,
            isFavorited: false
        },
        {
            id: 'mock-3',
            author: 'Demeni Sites',
            authorAvatar: 'https://ui-avatars.com/api/?name=DS&background=7c3aed&color=fff&size=80',
            date: '2026-02-10T09:00:00',
            text: 'Parabéns a todos que alcançaram o Nível 2! Continuem criando sites incríveis e ganhando XP. Lembrem-se: quanto mais sites vocês criam, mais experiência ganham e mais funcionalidades desbloqueiam. O próximo marco é o Nível 3 — Silver!',
            image: 'assets/feed/post-3.png',
            title: 'Conquistas & Níveis',
            likes: 42,
            isLiked: false,
            isFavorited: false
        }
    ];

    let posts = [];
    let currentFilter = 'all';

    async function init() {
        await loadPosts();
        renderPosts();
        renderPreviewNav();
        bindTabs();
    }

    async function loadPosts() {
        let supabasePosts = null;
        let userInteractions = {};

        // Try loading from Supabase
        if (typeof SupabaseClient !== 'undefined' && SupabaseClient?.isConfigured()) {
            try {
                // Fetch published posts
                const { data, error } = await SupabaseClient.getClient()
                    .from('feed_posts')
                    .select('*')
                    .eq('status', 'published')
                    .order('created_at', { ascending: false });

                if (!error && data && data.length > 0) {
                    supabasePosts = data;
                }

                // Fetch user's interactions
                const user = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : null;
                if (user && supabasePosts) {
                    const { data: interactions } = await SupabaseClient.getClient()
                        .from('feed_interactions')
                        .select('post_id, liked, favorited')
                        .eq('user_id', user.id);

                    if (interactions) {
                        interactions.forEach(i => {
                            userInteractions[i.post_id] = {
                                liked: i.liked || false,
                                favorited: i.favorited || false
                            };
                        });
                    }
                }
            } catch (e) {
                console.log('📰 Feed: Supabase unavailable, using mock data', e);
            }
        }

        if (supabasePosts) {
            // Map Supabase data to feed format
            posts = supabasePosts.map(p => ({
                id: p.id,
                author: p.author_name || 'Demeni Sites',
                authorAvatar: p.author_avatar || 'https://ui-avatars.com/api/?name=DS&background=7c3aed&color=fff&size=80',
                date: p.created_at,
                text: p.text,
                image: p.image_url,
                title: p.title,
                likes: p.likes_count || 0,
                isLiked: userInteractions[p.id]?.liked || false,
                isFavorited: userInteractions[p.id]?.favorited || false
            }));
        } else {
            // Fallback to mock data with localStorage interactions
            const saved = localStorage.getItem('demeni_feed_interactions');
            const localInteractions = saved ? JSON.parse(saved) : {};

            posts = MOCK_POSTS.map(p => ({
                ...p,
                isLiked: localInteractions[p.id]?.liked || false,
                isFavorited: localInteractions[p.id]?.favorited || false,
                likes: p.likes + (localInteractions[p.id]?.liked ? 1 : 0)
            }));
        }
    }

    function saveInteractions() {
        // Always save to localStorage as cache
        const interactions = {};
        posts.forEach(p => {
            interactions[p.id] = { liked: p.isLiked, favorited: p.isFavorited };
        });
        localStorage.setItem('demeni_feed_interactions', JSON.stringify(interactions));
    }

    async function syncInteractionToSupabase(postId, liked, favorited) {
        if (typeof SupabaseClient === 'undefined' || !SupabaseClient?.isConfigured()) return;

        const user = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : null;
        if (!user || String(postId).startsWith('mock-')) return;

        try {
            await SupabaseClient.getClient()
                .from('feed_interactions')
                .upsert({
                    user_id: user.id,
                    post_id: postId,
                    liked,
                    favorited
                }, { onConflict: 'user_id,post_id' });
        } catch (e) {
            console.log('📰 Feed: interaction sync failed', e);
        }
    }

    function timeAgo(dateStr) {
        const now = new Date();
        const date = new Date(dateStr);
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return 'agora mesmo';
        if (diff < 3600) return `${Math.floor(diff / 60)}min`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
        return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    }

    function formatText(text) {
        if (!text) return '';
        // Use global formatter if available (from admin.js), else inline
        if (window.formatFeedText) return window.formatFeedText(text);
        let html = text
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/\n/g, '<br>');
        return html;
    }

    function renderPosts() {
        const container = document.getElementById('feed-container');
        if (!container) return;

        const filtered = currentFilter === 'favorites'
            ? posts.filter(p => p.isFavorited)
            : posts;

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="feed-empty">
                    <i class="fas fa-star"></i>
                    <h3>Nenhum favorito ainda</h3>
                    <p>Favorite posts para encontrá-los aqui rapidamente</p>
                </div>`;
            return;
        }

        container.innerHTML = filtered.map(post => `
            <article class="feed-card" data-post-id="${post.id}" id="feed-post-${post.id}">
                <div class="feed-card-header">
                    <img class="feed-admin-avatar" src="${post.authorAvatar}" alt="${post.author}">
                    <div class="feed-admin-info">
                        <div class="feed-admin-name">${post.author}</div>
                        <div class="feed-post-date">${timeAgo(post.date)}</div>
                    </div>
                </div>
                <div class="feed-card-text">
                    <p>${formatText(post.text)}</p>
                    <button class="feed-read-more" onclick="window.feedToggleText(this)" style="display:none">ler mais</button>
                </div>
                ${post.image ? `<img class="feed-card-image" src="${post.image}" alt="${post.title}" loading="lazy">` : ''}
                <div class="feed-card-actions">
                    <button class="feed-action-btn ${post.isLiked ? 'liked' : ''}" onclick="window.feedToggleLike('${post.id}')">
                        <i class="${post.isLiked ? 'fas' : 'far'} fa-heart"></i>
                        <span class="feed-count">${post.likes}</span>
                        <span>Curtir</span>
                    </button>
                    <button class="feed-action-btn ${post.isFavorited ? 'favorited' : ''}" onclick="window.feedToggleFavorite('${post.id}')">
                        <i class="${post.isFavorited ? 'fas' : 'far'} fa-star"></i>
                        <span>Favoritar</span>
                    </button>
                </div>
            </article>
        `).join('');

        // Show "ler mais" only when text actually overflows 3 lines
        requestAnimationFrame(() => {
            container.querySelectorAll('.feed-card-text').forEach(block => {
                const p = block.querySelector('p');
                const btn = block.querySelector('.feed-read-more');
                if (p && btn && p.scrollHeight > p.clientHeight + 2) {
                    btn.style.display = '';
                }
            });
        });
    }

    // Right-side preview navigator
    function renderPreviewNav() {
        const list = document.getElementById('feed-preview-list');
        if (!list) return;

        list.innerHTML = posts.map((post, i) => `
            <div class="feed-preview-item ${i === 0 ? 'active' : ''}" data-target-post="${post.id}" onclick="window.feedScrollToPost('${post.id}')">
                ${post.image ? `<img class="feed-preview-thumb" src="${post.image}" alt="${post.title}">` : '<div class="feed-preview-thumb" style="background:var(--bg-panel);display:flex;align-items:center;justify-content:center;"><i class="fas fa-newspaper"></i></div>'}
                <div class="feed-preview-info">
                    <span>${post.title}</span>
                    <small>${timeAgo(post.date)}</small>
                </div>
            </div>
        `).join('');
    }

    function bindTabs() {
        document.querySelectorAll('.feed-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentFilter = tab.dataset.feedFilter;
                renderPosts();
            });
        });
    }

    // Scroll to a specific post and highlight in preview nav
    window.feedScrollToPost = function (postId) {
        const card = document.getElementById(`feed-post-${postId}`);
        if (!card) return;

        card.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Update active state in preview nav
        document.querySelectorAll('.feed-preview-item').forEach(item => {
            item.classList.toggle('active', item.dataset.targetPost === String(postId));
        });
    };

    window.feedToggleLike = function (postId) {
        const post = posts.find(p => String(p.id) === String(postId));
        if (!post) return;
        post.isLiked = !post.isLiked;
        post.likes += post.isLiked ? 1 : -1;
        saveInteractions();
        syncInteractionToSupabase(postId, post.isLiked, post.isFavorited);
        renderPosts();
    };

    window.feedToggleFavorite = function (postId) {
        const post = posts.find(p => String(p.id) === String(postId));
        if (!post) return;
        post.isFavorited = !post.isFavorited;
        saveInteractions();
        syncInteractionToSupabase(postId, post.isLiked, post.isFavorited);
        renderPosts();
    };

    window.feedToggleText = function (btn) {
        const p = btn.previousElementSibling;
        const isExpanded = p.classList.toggle('expanded');
        btn.textContent = isExpanded ? 'ler menos' : 'ler mais';
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
