/* ===========================
   DEMENI SITES - XP SYSTEM MODULE
   Manages experience points and levels
   =========================== */

const XPSystem = (function () {
    // ========== LEVEL CONFIGURATION ==========
    const CONFIG = {
        // XP multiplier for purchases (credits * multiplier)
        XP_MULTIPLIER: 2.5,

        // Base XP for level 2
        BASE_XP: 200,

        // Level growth factor (each level = previous + previous/2)
        GROWTH_FACTOR: 1.5,

        // Border colors by level range - Sistema de Tiers
        BORDERS: [
            { minLevel: 1, maxLevel: 4, color: 'bronze', name: 'Bronze', hex: '#CD7F32' },
            { minLevel: 5, maxLevel: 9, color: 'silver', name: 'Prata', hex: '#C0C0C0' },
            { minLevel: 10, maxLevel: 14, color: 'gold', name: 'Ouro', hex: '#D4AF37' },
            { minLevel: 15, maxLevel: 19, color: 'turmaline', name: 'Turmalina', hex: '#40E0D0' },
            { minLevel: 20, maxLevel: 999, color: 'fire', name: 'Fire', hex: '#FF4500' }
        ],

        // Level benefits (discounts, features) - Corresponde aos tiers
        BENEFITS: {
            1: { discount: 0, feature: 'Bronze - Começo' },
            5: { discount: 5, feature: 'Prata - 5% desconto' },
            10: { discount: 10, feature: 'Ouro - 10% desconto' },
            15: { discount: 15, feature: 'Turmalina - 15% desconto' },
            20: { discount: 20, feature: 'Fire - 20% desconto + Suporte VIP' }
        }
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

    function calculateLevel(xp) {
        if (xp < CONFIG.BASE_XP) return 1;

        let level = 1;
        let threshold = CONFIG.BASE_XP;
        let increment = CONFIG.BASE_XP / 2;

        while (xp >= threshold) {
            level++;
            increment = threshold / 2;
            threshold += increment;
        }

        return level;
    }

    function getXPForLevel(level) {
        if (level <= 1) return 0;
        if (level === 2) return CONFIG.BASE_XP;

        let threshold = CONFIG.BASE_XP;
        for (let i = 2; i < level; i++) {
            threshold += threshold / 2;
        }
        return Math.floor(threshold);
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
            const borderInfo = getBorderForLevel(newLevel);
            UserData.updateUser({
                level: newLevel,
                borderColor: borderInfo.color
            });

            // Return level up info
            if (newLevel > currentLevel) {
                return {
                    leveledUp: true,
                    oldLevel: currentLevel,
                    newLevel: newLevel,
                    border: borderInfo,
                    benefits: CONFIG.BENEFITS[newLevel] || null
                };
            }
        }

        return { leveledUp: false };
    }

    // ========== BORDERS ==========
    function getBorderForLevel(level) {
        for (const border of CONFIG.BORDERS) {
            if (level >= border.minLevel && level <= border.maxLevel) {
                return border;
            }
        }
        return CONFIG.BORDERS[0]; // Default
    }

    function getCurrentBorder() {
        return getBorderForLevel(getLevel());
    }

    function getAllBorders() {
        return CONFIG.BORDERS;
    }

    // ========== BENEFITS ==========
    function getCurrentBenefits() {
        const level = getLevel();
        const benefits = [];

        for (const [lvl, benefit] of Object.entries(CONFIG.BENEFITS)) {
            if (level >= parseInt(lvl)) {
                benefits.push({
                    level: parseInt(lvl),
                    ...benefit
                });
            }
        }

        return benefits;
    }

    function getCurrentDiscount() {
        const benefits = getCurrentBenefits();
        if (benefits.length === 0) return 0;
        return benefits[benefits.length - 1].discount || 0;
    }

    function getNextBenefit() {
        const level = getLevel();
        const benefitLevels = Object.keys(CONFIG.BENEFITS).map(Number).sort((a, b) => a - b);

        for (const lvl of benefitLevels) {
            if (lvl > level) {
                return {
                    level: lvl,
                    ...CONFIG.BENEFITS[lvl]
                };
            }
        }

        return null; // Max level reached
    }

    // ========== STATS ==========
    function getStats() {
        const xp = getXP();
        const level = getLevel();
        const border = getCurrentBorder();
        const progress = getXPProgress();
        const benefits = getCurrentBenefits();
        const discount = getCurrentDiscount();

        return {
            xp: xp,
            level: level,
            border: border,
            progress: progress,
            benefits: benefits,
            discount: discount,
            nextBenefit: getNextBenefit()
        };
    }

    // ========== FORMAT HELPERS ==========
    function formatXP(xp) {
        if (xp >= 1000) {
            return `${(xp / 1000).toFixed(1)}K`;
        }
        return xp.toLocaleString('pt-BR');
    }

    // ========== LEVEL TABLE (for display) ==========
    function getLevelTable(maxLevel = 25) {
        const table = [];
        for (let i = 1; i <= maxLevel; i++) {
            table.push({
                level: i,
                xpRequired: getXPForLevel(i),
                border: getBorderForLevel(i),
                benefit: CONFIG.BENEFITS[i] || null
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

        // Borders
        getBorderForLevel,
        getCurrentBorder,
        getAllBorders,

        // Benefits
        getCurrentBenefits,
        getCurrentDiscount,
        getNextBenefit,

        // Stats
        getStats,

        // Formatting
        formatXP,
        getLevelTable,

        // Config access
        CONFIG
    };
})();

// Make available globally
window.XPSystem = XPSystem;
