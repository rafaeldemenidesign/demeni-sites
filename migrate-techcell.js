// ============================================
// 🚀 MIGRAÇÃO TECHCELL STORE → PRODUÇÃO
// Cole no Console (F12) de sites.rafaeldemeni.com/app.html
// ============================================

(async function migrateTechCell() {
    console.log('🚀 Iniciando migração TechCell Store...\n');

    const PROJECT_ID = '0f564525-b640-4357-9a11-fbe0c92d61e4';

    // Dados completos do projeto (extraídos do IndexedDB local)
    const projectData = {"profile":{"logo":null,"name":"TechCell Store","role":"Loja de Celulares e Acessórios"},"d2Products":[{"id":1,"link":"","image":"img/produto-1.png","price":"R$ 7.499,00","title":"iPhone 15 Pro"},{"id":2,"link":"","image":"img/produto-2.png","price":"R$ 5.999,00","title":"Samsung Galaxy S24"},{"id":3,"link":"","image":"img/produto-3.png","price":"R$ 299,90","title":"Kit Acessórios"},{"id":4,"link":"","image":"img/produto-4.png","price":"R$ 1.299,00","title":"Smartwatch Pro"}],"d2Adjustments":{"cta":{"btn":{"link":"#","text":"QUERO SABER MAIS","bgType":"gradient","bgGradient":"linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)","borderRadius":30,"hoverAnimation":true},"title":{"size":52,"text":"","color":"#ffffff","weight":400},"bgMode":"image","height":250,"bgColor":"#1a365d","bgImage":null,"topLine":{"bgType":"gradient","height":3,"bgColor":"#5167E7","enabled":false,"bgGradient":"linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)"},"bgColor2":"#0d1b2a","subtitle":{"size":22,"text":"","color":"#ffffff","weight":400,"opacity":0.8},"bgOverlay":true,"bgGradient":false,"bgImageBlur":0,"bgImagePosX":50,"bgImagePosY":0,"bgImageZoom":100,"bgOverlayType":"solid","bgOverlayColor":"#000000","bgOverlayColor2":"#000000","bgOverlayInvert":false,"bgOverlaySpread":80,"bgGradientInvert":false,"bgOverlayOpacity":50,"bgOverlayPosition":50},"pwa":{"appName":"","favicon":{"mode":"auto","image":null,"shape":"circle","bgColor":"#1a365d","textColor":"#ffffff"},"themeColor":"#1a365d"},"hero":{"btn":{"link":"#","text":"QUERO SABER MAIS","bgType":"gradient","bgColor":"#5167E7","bgPreset":"blue","textStyle":{"font":"Montserrat","size":16,"color":"#ffffff","weight":600,"spacing":1},"bgGradient":"linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)","borderColor":"transparent","borderRadius":30,"paddingInner":{"vertical":12,"horizontal":40},"paddingOuter":{"top":0,"left":0,"right":0,"bottom":0},"hoverAnimation":true},"title":{"font":"Montserrat","size":56,"text":"","color":"#ffffff","weight":400,"padding":{"top":0,"left":0,"right":0,"bottom":0},"spacing":4,"textGradient":{"enabled":false,"gradient":"linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)"}},"bgColor":"#1a1a2e","bgImage":"img/hero-bg.webp","gradient":{"enabled":true,"colorEnd":"#0a0a0a","colorMid":"rgba(10,10,10,0.6)","position":50,"intensity":60,"colorStart":"transparent"},"subtitle":{"font":"Montserrat","size":22,"text":"","color":"#ffffff","weight":300,"padding":{"top":0,"left":0,"right":0,"bottom":0},"spacing":32},"textPosition":"bottom","sectionHeight":56,"contentPadding":60,"scrollIndicator":{"color":"#ffffff","enabled":true}},"footer":{"info":{"cnpj":"","size":13,"email":"","phone":"","opacity":0.8},"logo":{"size":28,"color":"white","opacity":0.8},"title":{"size":24,"text":"Invista no seu negócio!","color":"#ffffff"},"bgType":"solid","social":{"gap":12,"size":28,"facebook":"","whatsapp":"","instagram":""},"bgColor":"#1a365d","topLine":{"bgType":"gradient","height":3,"bgColor":"#5167E7","enabled":false,"bgGradient":"linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)"},"subtitle":{"size":14,"text":"","opacity":0.6},"bgGradient":"linear-gradient(135deg, #1a365d 0%, #2d3a81 50%, #0d1b36 100%)","sectionSpacing":40},"header":{"logo":{"size":28,"color":"white"},"bgType":"solid","height":80,"bgColor":"#2d2d2d","bgGlass":false,"bgImage":null,"sidebar":{"width":280,"bgColor":"#1a1a1a","fontSize":15,"iconSize":16,"textColor":"#ffffff","accentColor":"#e67e22","borderWidth":3,"itemPadding":14,"showSeparators":false},"autoHide":false,"textColor":"#ffffff","bgGradient":"linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)","bgGlassBlur":10,"bgImageZoom":100,"bgImageSizeH":100,"bgImageSizeV":100,"logoPosition":"left","bgGradientInvert":false,"bgGradientOrientation":"horizontal"},"produtos":{"btn":{"size":13,"color":"#ffffff","bgColor":"#25D366","paddingH":14,"paddingV":6,"marginTop":0,"borderRadius":20},"card":{"shadow":"0 2px 8px rgba(0,0,0,0.1)","bgColor":"#ffffff","padding":6,"borderColor":"#e0e0e0","borderWidth":1,"borderRadius":20,"borderEnabled":false},"preco":{"size":16,"color":"#333333","weight":800,"currencyStyle":"normal"},"title":{"size":15,"color":"#333333","weight":500},"bgMode":"color","bgColor":"#1a365d","bgImage":null,"gridGap":16,"topLine":{"bgType":"gradient","height":3,"bgColor":"#5167E7","enabled":false,"bgGradient":"linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)"},"bgColor2":"#0d1b36","bgOverlay":false,"bgGradient":false,"bgImageBlur":0,"bgImagePosX":50,"bgImagePosY":0,"bgImageZoom":100,"gridColumns":2,"sectionTitle":{"gap":6,"size":36,"text":"Produtos Demeni","color":"#ffffff","weight":400,"enabled":true,"paddingTop":0,"textGradient":{"enabled":false,"gradient":"linear-gradient(135deg, #5167E7 0%, #A3B1FE 50%, #2D3A81 100%)"},"paddingBottom":24},"bgOverlayType":"solid","bgOverlayColor":"#000000","sectionSpacing":30,"bgOverlayColor2":"#000000","bgOverlayInvert":false,"bgOverlaySpread":80,"sectionPaddingH":32,"sectionSubtitle":{"size":14,"text":"Confira nossos destaques","color":"rgba(255,255,255,0.7)","weight":400,"enabled":false},"bgGradientInvert":false,"bgOverlayOpacity":50,"bgOverlayPosition":50},"feedbacks":{"card":{"glass":false,"bgColor":"#f5f5f5","glassBlur":10,"borderColor":"#e0e0e0","borderWidth":1,"borderRadius":12,"borderEnabled":false},"name":{"size":16,"color":"#1a365d","weight":500},"text":{"size":13,"color":"#666666","weight":400},"avatar":{"size":60,"radius":8},"bgMode":"color","bgColor":"#e8e8e8","bgImage":null,"topLine":{"bgType":"gradient","height":3,"bgColor":"#5167E7","enabled":false,"bgGradient":"linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)"},"bgColor2":"#d0d0d0","bgOverlay":false,"bottomCta":{"size":16,"text":"Faça parte dos nossos clientes satisfeitos!","color":"#333333","weight":400,"enabled":false,"paddingTop":20,"paddingBottom":20},"bgGradient":false,"bgImageBlur":0,"bgImagePosX":50,"bgImagePosY":0,"bgImageZoom":100,"sectionTitle":{"gap":6,"size":28,"text":"O que estão dizendo?","color":"#333333","weight":400,"enabled":true,"paddingTop":0,"textGradient":{"enabled":false,"gradient":"linear-gradient(135deg, #5167E7 0%, #A3B1FE 50%, #2D3A81 100%)"},"paddingBottom":24},"bgOverlayType":"solid","cardAnimation":true,"bgOverlayColor":"#000000","sectionSpacing":30,"bgOverlayColor2":"#000000","bgOverlayInvert":false,"bgOverlaySpread":80,"sectionSubtitle":{"size":14,"text":"Depoimentos de nossos clientes","color":"#666666","weight":400,"enabled":false},"bgGradientInvert":false,"bgOverlayOpacity":50,"bgOverlayPosition":50},"categorias":{"icon":{"size":80,"color":"#333333","radius":18,"bgColor":"#f5f5f5"},"items":[{"id":1,"icon":"fa-box-open","label":"PRODUTOS","customIcon":null},{"id":2,"icon":"fa-concierge-bell","label":"SERVIÇOS","customIcon":null},{"id":3,"icon":"fa-graduation-cap","label":"EDUCAÇÃO","customIcon":null},{"id":4,"icon":"fa-info-circle","label":"SOBRE","customIcon":null}],"label":{"size":12,"color":"#222222","weight":500},"bgMode":"color","bgColor":"#ffffff","bgImage":null,"topLine":{"bgType":"gradient","height":3,"bgColor":"#5167E7","enabled":false,"bgGradient":"linear-gradient(135deg, #5167E7 0%, #A3B1FE 33%, #495FDB 66%, #2D3A81 100%)"},"bgColor2":"#d0d0d0","bgOverlay":false,"bgGradient":false,"bgImageBlur":0,"bgImagePosX":50,"bgImagePosY":0,"bgImageZoom":100,"sectionTitle":{"gap":6,"size":28,"text":"Categorias","color":"#333333","weight":400,"enabled":false,"paddingTop":0,"textGradient":{"enabled":false,"gradient":"linear-gradient(135deg, #5167E7 0%, #A3B1FE 50%, #2D3A81 100%)"},"paddingBottom":16},"bgOverlayType":"solid","bgOverlayColor":"#000000","sectionSpacing":40,"bgOverlayColor2":"#000000","bgOverlayInvert":false,"bgOverlaySpread":80,"sectionSubtitle":{"size":14,"text":"Encontre o que precisa","color":"#666666","weight":400,"enabled":false},"bgGradientInvert":false,"bgOverlayOpacity":50,"bgOverlayPosition":50}},"d2Feedbacks":[{"id":1,"link":"","name":"Carla Fernandes","text":"Comprei meu iPhone aqui e foi a melhor decisão! Atendimento excelente e preço justo.","avatar":"img/avatar-1.png"},{"id":2,"link":"","name":"Roberto Almeida","text":"Troca de tela super rápida e profissional. Recomendo demais!","avatar":"img/avatar-2.png"}],"projectName":"TechCell Store"};

    // 1. Gravar no IndexedDB
    const db = await new Promise((resolve) => {
        const req = indexedDB.open('demeni-sites-db', 1);
        req.onupgradeneeded = () => {
            if (!req.result.objectStoreNames.contains('project-data'))
                req.result.createObjectStore('project-data');
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
    });

    if (!db) { console.error('❌ Falha ao abrir IndexedDB'); return; }

    await new Promise((resolve) => {
        const tx = db.transaction('project-data', 'readwrite');
        tx.objectStore('project-data').put(projectData, 'proj-data-' + PROJECT_ID);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
    });
    console.log('✅ Dados gravados no IndexedDB');

    // 2. Adicionar à lista de projetos no localStorage
    let projectsKey = null;
    let projects = [];
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.startsWith('demeni-projects')) {
            try {
                const val = JSON.parse(localStorage.getItem(k));
                if (Array.isArray(val)) {
                    projectsKey = k;
                    projects = val;
                    break;
                }
            } catch (e) { }
        }
    }

    // Criar chave se não existir
    if (!projectsKey) {
        projectsKey = 'demeni-projects-' + crypto.randomUUID();
    }

    // Verificar se já existe
    const existing = projects.findIndex(p => p.id === PROJECT_ID);
    const projectMeta = {
        id: PROJECT_ID,
        name: 'TechCell Store',
        model: 'd2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (existing >= 0) {
        projects[existing] = { ...projects[existing], ...projectMeta };
        console.log('✅ Projeto atualizado na lista (posição ' + existing + ')');
    } else {
        projects.push(projectMeta);
        console.log('✅ Projeto adicionado à lista (' + projects.length + ' projetos total)');
    }

    localStorage.setItem(projectsKey, JSON.stringify(projects));

    // 3. Resumo
    console.log('\n' + '='.repeat(50));
    console.log('🎯 MIGRAÇÃO CONCLUÍDA!');
    console.log('='.repeat(50));
    console.log('📋 Projeto: TechCell Store');
    console.log('📦 Produtos: 4 (iPhone 15 Pro, Galaxy S24, Kit Acessórios, Smartwatch Pro)');
    console.log('💬 Feedbacks: 2');
    console.log('📍 ID: ' + PROJECT_ID);
    console.log('='.repeat(50));
    console.log('\n🔄 AGORA: Atualize a página (F5) para ver o TechCell na lista de projetos!');
})();
