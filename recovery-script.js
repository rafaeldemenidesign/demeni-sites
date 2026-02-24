// ============================================
// 🔍 SCRIPT DE DIAGNÓSTICO E RECUPERAÇÃO
// Cole no DevTools (F12 → Console) da aba que tem os 8 projetos
// ============================================

(async function recoverData() {
    console.log('🔍 Iniciando diagnóstico...\n');

    // 1. ABRIR INDEXEDDB
    const db = await new Promise((resolve, reject) => {
        const req = indexedDB.open('demeni-sites-db', 1);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject('Erro ao abrir IndexedDB');
    });

    // 2. LISTAR TODAS AS CHAVES
    const store = db.transaction('project-data', 'readonly').objectStore('project-data');
    const allKeys = await new Promise(resolve => {
        const req = store.getAllKeys();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve([]);
    });

    console.log(`📦 Total de chaves no IndexedDB: ${allKeys.length}`);
    console.log('Chaves encontradas:', allKeys);

    // 3. CLASSIFICAR AS CHAVES
    const projDataKeys = allKeys.filter(k => k.startsWith('proj-data-'));
    const projBackupKeys = allKeys.filter(k => k.startsWith('proj-backup-'));
    const otherKeys = allKeys.filter(k => !k.startsWith('proj-data-') && !k.startsWith('proj-backup-'));

    console.log(`\n📊 Resumo:`);
    console.log(`  ✅ Dados de projetos: ${projDataKeys.length}`);
    console.log(`  💾 Backups automáticos: ${projBackupKeys.length}`);
    console.log(`  📎 Outras chaves: ${otherKeys.length}`);

    // 4. ANALISAR CADA PROJETO
    const projectReport = [];
    for (const key of [...projDataKeys, ...projBackupKeys]) {
        const data = await new Promise(resolve => {
            const tx = db.transaction('project-data', 'readonly');
            const req = tx.objectStore('project-data').get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        });

        const isBackup = key.startsWith('proj-backup-');
        const projectId = key.replace('proj-data-', '').replace('proj-backup-', '');
        const hasData = data && typeof data === 'object';
        const keyCount = hasData ? Object.keys(data).length : 0;
        const hasProfile = hasData && data.profile && data.profile.name;
        const profileName = hasProfile ? data.profile.name : 'sem nome';
        const hasProducts = hasData && data.d2Products && data.d2Products.length > 0;
        const hasFeedbacks = hasData && data.d2Feedbacks && data.d2Feedbacks.length > 0;
        const hasAdjustments = hasData && data.d2Adjustments;
        const heroTitle = hasData && data.d2Adjustments?.hero?.title?.text;
        const isReal = keyCount > 5; // Projetos reais têm muitas chaves

        projectReport.push({
            key, projectId, isBackup, isReal,
            profileName: profileName || heroTitle || '???',
            keys: keyCount,
            products: hasProducts ? data.d2Products.length : 0,
            feedbacks: hasFeedbacks ? data.d2Feedbacks.length : 0,
            hasAdjustments: !!hasAdjustments,
            data: isReal ? data : null // Só guarda dados reais
        });

        const icon = isReal ? '✅' : '⚠️';
        const type = isBackup ? '(BACKUP)' : '(DADOS)';
        console.log(`  ${icon} ${type} ${profileName || heroTitle || '???'} — ${keyCount} chaves, ${hasProducts ? data.d2Products.length : 0} produtos`);
    }

    // 5. VERIFICAR LOCALSTORAGE
    console.log('\n📋 LocalStorage:');
    const lsKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.includes('demeni')) lsKeys.push(k);
    }
    console.log('  Chaves demeni:', lsKeys);

    // 6. EXPORTAR DADOS RECUPERÁVEIS
    const recoverableData = projectReport.filter(p => p.isReal && p.data);
    console.log(`\n🎯 Projetos RECUPERÁVEIS: ${recoverableData.length}`);

    if (recoverableData.length > 0) {
        // Cria um objeto com todos os dados recuperáveis
        const exportObj = {};
        recoverableData.forEach(p => {
            exportObj[p.key] = {
                profileName: p.profileName,
                projectId: p.projectId,
                isBackup: p.isBackup,
                data: p.data
            };
        });

        // Salva no clipboard
        const jsonStr = JSON.stringify(exportObj, null, 2);

        // Download automático como arquivo JSON
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `demeni-recovery-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('💾 Arquivo JSON baixado automaticamente!');
        console.log('📋 Dados também disponíveis em: window.__RECOVERY_DATA');
        window.__RECOVERY_DATA = exportObj;
    }

    // 7. RESUMO FINAL
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO FINAL');
    console.log('='.repeat(50));
    console.log(`Total no IndexedDB: ${allKeys.length} chaves`);
    console.log(`Projetos com dados: ${recoverableData.filter(p => !p.isBackup).length}`);
    console.log(`Backups com dados: ${recoverableData.filter(p => p.isBackup).length}`);
    console.log(`Projetos vazios/perdidos: ${projectReport.filter(p => !p.isReal).length}`);
    console.log('='.repeat(50));

    return recoverableData;
})();
