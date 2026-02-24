// ============================================
// 🔄 RESTAURAÇÃO v4 — DEFINITIVA
// Cole no Console (F12) da aba localhost:8080/app.html
// ============================================

(async function restoreV4() {
    console.log('🔄 RESTAURAÇÃO v4\n');

    // 1. CARREGAR JSON
    let recoveryData;
    try {
        const resp = await fetch('/demeni-recovery.json');
        recoveryData = await resp.json();
        console.log('✅ JSON carregado:', Object.keys(recoveryData).length, 'entradas\n');
    } catch (e) {
        console.error('❌ Erro:', e);
        return;
    }

    // 2. ABRIR INDEXEDDB
    const db = await new Promise((resolve) => {
        const req = indexedDB.open('demeni-sites-db', 1);
        req.onupgradeneeded = () => {
            if (!req.result.objectStoreNames.contains('project-data'))
                req.result.createObjectStore('project-data');
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
    });
    if (!db) { console.error('❌ IndexedDB falhou'); return; }

    // 3. AGRUPAR POR PROJETO (melhor dado entre data/backup)
    const projectMap = {};
    for (const [key, entry] of Object.entries(recoveryData)) {
        const id = entry.projectId;
        if (!projectMap[id]) projectMap[id] = { id, name: entry.profileName };
        if (entry.isBackup) projectMap[id].backup = entry.data;
        else projectMap[id].data = entry.data;
    }

    // 4. RESTAURAR NO INDEXEDDB (50MB+ de espaço)
    let restored = 0;
    for (const [id, proj] of Object.entries(projectMap)) {
        const dataKeys = proj.data ? Object.keys(proj.data).length : 0;
        const backupKeys = proj.backup ? Object.keys(proj.backup).length : 0;
        const bestData = dataKeys >= backupKeys ? proj.data : proj.backup;
        const bestKeys = bestData ? Object.keys(bestData).length : 0;
        if (!bestData || bestKeys < 5) continue;

        await new Promise((resolve) => {
            const tx = db.transaction('project-data', 'readwrite');
            tx.objectStore('project-data').put(bestData, 'proj-data-' + id);
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => resolve(false);
        });

        const heroT = bestData.d2Adjustments?.hero?.title?.text || '';
        console.log(`  ✅ ${proj.name} ${heroT ? '(' + heroT + ')' : ''} — ${bestKeys} chaves`);
        restored++;
    }
    console.log(`\n📦 ${restored} projetos gravados no IndexedDB\n`);

    // 5. LIMPAR project.data DA LISTA DO LOCALSTORAGE
    // Isso FORÇA o getProjectAsync a carregar do IndexedDB
    let projectsKey = null;
    let projects = [];
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.startsWith('demeni-projects')) {
            try {
                const val = JSON.parse(localStorage.getItem(k));
                if (Array.isArray(val) && val.length > 0) {
                    projectsKey = k;
                    projects = val;
                    break;
                }
            } catch (e) { }
        }
    }

    if (projectsKey) {
        let cleared = 0;
        const restoredIds = Object.keys(projectMap).filter(id => {
            const proj = projectMap[id];
            const dataKeys = proj.data ? Object.keys(proj.data).length : 0;
            const backupKeys = proj.backup ? Object.keys(proj.backup).length : 0;
            return Math.max(dataKeys, backupKeys) >= 5;
        });

        for (const proj of projects) {
            if (restoredIds.includes(proj.id)) {
                // LIMPAR o data embutido para forçar leitura do IndexedDB
                delete proj.data;
                cleared++;
            }
        }

        localStorage.setItem(projectsKey, JSON.stringify(projects));
        console.log(`📋 Limpei project.data de ${cleared} projetos no localStorage`);
        console.log('   → getProjectAsync() agora vai buscar do IndexedDB ✅\n');
    }

    // 6. RESUMO
    console.log('='.repeat(50));
    console.log('🎯 RESTAURAÇÃO v4 CONCLUÍDA');
    console.log('='.repeat(50));
    console.log('✅ Restaurados:', restored, 'projetos no IndexedDB');
    console.log('📋 project.data limpo no localStorage (força IndexedDB)');
    console.log('='.repeat(50));
    console.log('\n🔄 AGORA: Atualize a página (F5) e clique em um projeto!');
})();
