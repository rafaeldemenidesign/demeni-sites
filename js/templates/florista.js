/* ===========================
   TEMPLATE: FLORISTA
   Floricultura / Boutique de Flores
   =========================== */

const TEMPLATE_FLORISTA = {
    id: 'florista',
    name: 'Floricultura',
    description: 'Elegante e delicado, perfeito para floriculturas e boutiques de flores',
    icon: 'fa-leaf',

    // 3 paletas de cores
    palettes: [
        {
            id: 'classico',
            name: 'Clássico',
            preview: ['#F5F0E8', '#1B4D3E', '#D4AF37'],
            style: {
                accentColor: '#1B4D3E',
                bgColor: '#F5F0E8',
                buttonColor: '#D4AF37',
                buttonTextColor: '#1B4D3E'
            }
        },
        {
            id: 'romantico',
            name: 'Romântico',
            preview: ['#FFF0F5', '#8B4557', '#FFD700'],
            style: {
                accentColor: '#8B4557',
                bgColor: '#FFF0F5',
                buttonColor: '#FFD700',
                buttonTextColor: '#8B4557'
            }
        },
        {
            id: 'moderno',
            name: 'Moderno',
            preview: ['#0A0A0A', '#2E8B57', '#FFFFFF'],
            style: {
                accentColor: '#2E8B57',
                bgColor: '#0A0A0A',
                buttonColor: '#FFFFFF',
                buttonTextColor: '#0A0A0A'
            }
        }
    ],

    // Tipografia elegante
    typography: {
        fontFamily: 'Playfair Display',
        headerStyle: { fontFamily: 'serif' }
    },

    // Seções do template (todas obrigatórias para floricultura)
    sections: [
        {
            type: 'hero',
            required: true,
            data: {
                title: 'Flores que Encantam',
                subtitle: 'Arranjos exclusivos para todos os momentos especiais',
                ctaText: 'Ver Catálogo',
                ctaLink: '#produtos',
                variant: 'split-left',
                fontStyle: 'serif',
                image: null
            }
        },
        {
            type: 'categories',
            required: true,
            data: {
                title: 'Nossas Categorias',
                items: [
                    { name: 'Buquês', icon: 'fa-heart', description: 'Para presentear com amor' },
                    { name: 'Arranjos', icon: 'fa-seedling', description: 'Decoração de ambientes' },
                    { name: 'Plantas', icon: 'fa-leaf', description: 'Para cultivar em casa' },
                    { name: 'Cestas', icon: 'fa-gift', description: 'Com chocolates e vinhos' }
                ]
            }
        },
        {
            type: 'products',
            required: true,
            data: {
                title: 'Produtos em Destaque',
                items: [
                    {
                        name: 'Buquê Romântico',
                        price: 'R$ 189,00',
                        description: '12 rosas vermelhas colombianas',
                        image: null
                    },
                    {
                        name: 'Arranjo Primavera',
                        price: 'R$ 159,00',
                        description: 'Mix de flores coloridas da estação',
                        image: null
                    },
                    {
                        name: 'Orquídea Phalaenopsis',
                        price: 'R$ 129,00',
                        description: 'Em vaso decorativo de cerâmica',
                        image: null
                    }
                ]
            }
        },
        {
            type: 'contact',
            required: true,
            data: {
                title: 'Fale Conosco',
                phone: '(11) 99999-9999',
                email: 'contato@suafloricultura.com.br',
                address: 'Rua das Flores, 123 - Centro',
                hours: 'Seg-Sáb: 8h às 19h | Dom: 9h às 14h'
            }
        }
    ],

    // Configurações de navegação
    navigation: {
        brandName: 'Sua Floricultura',
        subtitle: 'Flores & Presentes'
    }
};

// Registrar template no sistema
if (typeof registerTemplate === 'function') {
    registerTemplate('florista', TEMPLATE_FLORISTA);
} else {
    console.warn('[Template Florista] registerTemplate not available. Template will be registered when system loads.');
    // Fallback: add to global when ready
    window.addEventListener('load', function () {
        if (typeof registerTemplate === 'function') {
            registerTemplate('florista', TEMPLATE_FLORISTA);
        }
    });
}
