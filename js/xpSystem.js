/* ===========================
   DEMENI SITES - XP SYSTEM MODULE
   Sistema de Níveis 1-100 com Patentes
   =========================== */

const XPSystem = (function () {
    // ========== LEVEL CONFIGURATION ==========
    const CONFIG = {
        // XP multiplier for purchases (credits * multiplier)
        XP_MULTIPLIER: 1,

        // XP gained per published site
        XP_PER_PUBLISH: 35,

        // XP required per level (linear progression)
        XP_PER_LEVEL: 50,

        // Max level
        MAX_LEVEL: 100,

        // Patente ranges and discounts
        PATENTES: [
            {
                minLevel: 1,
                maxLevel: 20,
                id: 'bronze',
                name: 'Bronze',
                hex: '#CD7F32',
                gradient: 'linear-gradient(135deg, #CD7F32 0%, #8B5A2B 50%, #CD7F32 100%)',
                discount: 0,
                sitePrice: 40  // mantém
            },
            {
                minLevel: 21,
                maxLevel: 40,
                id: 'prata',
                name: 'Prata',
                hex: '#C0C0C0',
                gradient: 'linear-gradient(135deg, #E8E8E8 0%, #A8A8A8 50%, #E8E8E8 100%)',
                discount: 12,
                sitePrice: 35
            },
            {
                minLevel: 41,
                maxLevel: 60,
                id: 'ouro',
                name: 'Ouro',
                hex: '#FFD700',
                gradient: 'linear-gradient(135deg, #FFD700 0%, #B8860B 50%, #FFD700 100%)',
                discount: 25,
                sitePrice: 30
            },
            {
                minLevel: 61,
                maxLevel: 80,
                id: 'turmalina',
                name: 'Turmalina',
                hex: '#40E0D0',
                gradient: 'linear-gradient(135deg, #40E0D0 0%, #00CED1 50%, #48D1CC 100%)',
                discount: 37,
                sitePrice: 25
            },
            {
                minLevel: 81,
                maxLevel: 100,
                id: 'fire',
                name: 'Fire',
                hex: '#FF4500',
                gradient: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 25%, #FF4500 50%, #FF0000 75%, #FF4500 100%)',
                discount: 50,
                sitePrice: 20,
                animated: true
            }
        ]
    };

    // ========== XP CALCULATIONS ==========
    function getXP() {
        const user = UserData.getUser();
        return user.xp || 0;
    }

    function setXP(amount) {
        UserData.updateUser({ xp: amount });
        updateLevel();
        return amount;
    }

    function addXP(amount) {
        const current = getXP();
        const newXP = current + amount;
        setXP(newXP);

        return {
            previous: current,
            gained: amount,
            total: newXP,
            level: getLevel()
        };
    }

    // Calculate XP from credits purchase
    function calculateXPFromCredits(credits) {
        return Math.floor(credits * CONFIG.XP_MULTIPLIER);
    }

    // ========== LEVEL CALCULATIONS ==========
    function getLevel() {
        const user = UserData.getUser();
        return user.level || 1;
    }

    // Linear progression: each level = 50 XP
    function calculateLevel(xp) {
        const level = Math.floor(xp / CONFIG.XP_PER_LEVEL) + 1;
        return Math.min(level, CONFIG.MAX_LEVEL);
    }

    function getXPForLevel(level) {
        if (level <= 1) return 0;
        return (level - 1) * CONFIG.XP_PER_LEVEL;
    }

    function getXPProgress() {
        const currentXP = getXP();
        const currentLevel = getLevel();
        const currentLevelXP = getXPForLevel(currentLevel);
        const nextLevelXP = getXPForLevel(currentLevel + 1);

        const progress = currentXP - currentLevelXP;
        const required = nextLevelXP - currentLevelXP;
        const percentage = Math.min(100, Math.floor((progress / required) * 100));

        return {
            current: progress,
            required: required,
            percentage: percentage,
            toNextLevel: required - progress
        };
    }

    function updateLevel() {
        const xp = getXP();
        const newLevel = calculateLevel(xp);
        const currentLevel = getLevel();

        if (newLevel !== currentLevel) {
            const patente = getPatenteForLevel(newLevel);
            UserData.updateUser({
                level: newLevel,
                borderColor: patente.id
            });

            // Return level up info
            if (newLevel > currentLevel) {
                return {
                    leveledUp: true,
                    oldLevel: currentLevel,
                    newLevel: newLevel,
                    patente: patente,
                    newPatente: getPatenteForLevel(currentLevel).id !== patente.id
                };
            }
        }

        return { leveledUp: false };
    }

    // ========== PATENTES ==========
    function getPatenteForLevel(level) {
        for (const patente of CONFIG.PATENTES) {
            if (level >= patente.minLevel && level <= patente.maxLevel) {
                return patente;
            }
        }
        return CONFIG.PATENTES[0]; // Default Bronze
    }

    function getCurrentPatente() {
        return getPatenteForLevel(getLevel());
    }

    function getAllPatentes() {
        return CONFIG.PATENTES;
    }

    // ========== DISCOUNTS & PRICING ==========
    function getCurrentDiscount() {
        return getCurrentPatente().discount;
    }

    function getCurrentSitePrice() {
        return getCurrentPatente().sitePrice;
    }

    function getNextPatente() {
        const currentPatente = getCurrentPatente();
        const currentIndex = CONFIG.PATENTES.findIndex(p => p.id === currentPatente.id);

        if (currentIndex < CONFIG.PATENTES.length - 1) {
            return CONFIG.PATENTES[currentIndex + 1];
        }
        return null; // Already at Fire
    }

    // ========== STATS ==========
    function getStats() {
        const xp = getXP();
        const level = getLevel();
        const patente = getCurrentPatente();
        const progress = getXPProgress();
        const discount = getCurrentDiscount();
        const sitePrice = getCurrentSitePrice();

        return {
            xp: xp,
            level: level,
            patente: patente,
            progress: progress,
            discount: discount,
            sitePrice: sitePrice,
            nextPatente: getNextPatente()
        };
    }

    // ========== SPENDING CALCULATOR ==========
    // How much BRL spent to reach a level
    function getSpendingForLevel(level) {
        const xpNeeded = getXPForLevel(level);
        // XP = credits * 3, credits = BRL (1:1)
        return Math.ceil(xpNeeded / CONFIG.XP_MULTIPLIER);
    }

    // Table showing spending milestones
    function getSpendingTable() {
        return CONFIG.PATENTES.map(p => ({
            patente: p.name,
            levelRange: `${p.minLevel}-${p.maxLevel}`,
            minSpending: getSpendingForLevel(p.minLevel),
            discount: `${p.discount}%`,
            sitePrice: `R$ ${p.sitePrice}`
        }));
    }

    // ========== FORMAT HELPERS ==========
    function formatXP(xp) {
        if (xp >= 1000) {
            return `${(xp / 1000).toFixed(1)}K`;
        }
        return xp.toLocaleString('pt-BR');
    }

    // ========== LEVEL TABLE (for display) ==========
    function getLevelTable(maxLevel = 100) {
        const table = [];
        for (let i = 1; i <= maxLevel; i++) {
            table.push({
                level: i,
                xpRequired: getXPForLevel(i),
                patente: getPatenteForLevel(i),
                spending: getSpendingForLevel(i)
            });
        }
        return table;
    }

    // ========== PUBLIC API ==========
    return {
        // XP
        getXP,
        addXP,
        calculateXPFromCredits,

        // Level
        getLevel,
        calculateLevel,
        getXPForLevel,
        getXPProgress,

        // Patentes (replacing Borders)
        getPatenteForLevel,
        getCurrentPatente,
        getAllPatentes,

        // Backwards compatibility
        getBorderForLevel: getPatenteForLevel,
        getCurrentBorder: getCurrentPatente,
        getAllBorders: getAllPatentes,

        // Discounts & Pricing
        getCurrentDiscount,
        getCurrentSitePrice,
        getNextPatente,

        // Stats
        getStats,
        getSpendingForLevel,
        getSpendingTable,

        // Formatting
        formatXP,
        getLevelTable,

        // Config access
        CONFIG
    };
})();

// Make available globally
window.XPSystem = XPSystem;
