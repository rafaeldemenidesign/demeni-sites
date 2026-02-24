/**
 * SEED FEED POSTS - Cole no Console do navegador (localhost:8080/app.html)
 * Insere todos os 13 posts no Supabase feed_posts
 * Requer: estar logado como admin + SupabaseClient inicializado
 */
(async function seedFeedPosts() {
    if (!window.SupabaseClient || !SupabaseClient.isConfigured()) {
        console.error('❌ SupabaseClient não disponível. Faça login primeiro.');
        return;
    }

    const posts = [
        {
            title: 'Novidades 2026',
            text: 'Bem-vindo à Demeni Sites! 2026 chegou com tudo — e a plataforma está mais completa do que nunca.\n\nNovas funcionalidades, editor avançado, sistema de créditos reformulado e muito mais. Tudo pensado para você criar sites profissionais com rapidez e qualidade.\n\nFique ligado nas próximas atualizações. O melhor ainda está por vir.\n\n*Demeni Sites — Plataforma SaaS de Tecnologia e Inovação.* 💜',
            image_url: 'img/feed-posts/feed_post_1_1770869777319.webp',
            status: 'published',
            created_at: '2026-02-01T10:00:00-03:00'
        },
        {
            title: 'Tutorial Web Design Profissional',
            text: 'Nova aula disponível! Aprenda a criar sites profissionais com o editor D-2.\n\nNeste tutorial completo, vamos cobrir todos os aspectos do design moderno — desde a escolha de cores até a otimização para dispositivos móveis. Seções, tipografia, imagens e CTA: tudo explicado passo a passo.\n\nAcesse a Central de Aulas para começar agora mesmo.\n\n*Demeni Sites — Master Professional Web Design.* 💜',
            image_url: 'img/feed-posts/feed_post_2_1770869794739.webp',
            status: 'published',
            created_at: '2026-02-03T14:00:00-03:00'
        },
        {
            title: 'Conquistas & Marcos',
            text: 'Parabéns a todos que estão alcançando novos marcos na plataforma! 🏆\n\nCada site criado, cada publicação feita e cada nível conquistado é motivo de celebração. A Demeni Sites reconhece o esforço de cada franqueado.\n\nContinue criando, continue crescendo. O próximo marco é seu!\n\n*Demeni Sites — Celebrating Success.* 💜',
            image_url: 'img/feed-posts/feed_post_3_1770869809450.webp',
            status: 'published',
            created_at: '2026-02-05T09:00:00-03:00'
        },
        {
            title: 'Seus Projetos Salvos na Nuvem',
            text: 'Acabamos de implementar uma das funcionalidades mais pedidas: **sincronização automática na nuvem**. Seus projetos agora são salvos automaticamente no servidor, em tempo real.\n\nIsso significa que você pode trocar de máquina, limpar o navegador — **seus projetos continuam lá**, seguros e prontos. Como tem que ser.\n\nNada de perder trabalho. Nada de depender do navegador. **Confiança total.**\n\n*Demeni Sites, a franquia que cresce enquanto você lucra.* 💜',
            image_url: 'img/feed-posts/feed_post_01_1771047114493.webp',
            status: 'published',
            created_at: '2026-02-07T10:00:00-03:00'
        },
        {
            title: 'Sistema de Notificações',
            text: 'Novo na plataforma: **sistema de notificações**. A partir de agora, você recebe alertas diretamente no painel sobre tudo que acontece na sua conta.\n\nCréditos adicionados? Novidade na plataforma? Ação importante? Você fica sabendo **na hora**, sem precisar procurar.\n\nUm detalhe pequeno que faz uma **diferença enorme** na experiência do dia a dia.\n\n*Demeni Sites, a franquia que cresce enquanto você lucra.* 💜',
            image_url: 'img/feed-posts/feed_post_02_1771047130122.webp',
            status: 'published',
            created_at: '2026-02-08T10:00:00-03:00'
        },
        {
            title: 'Controle Total de Créditos',
            text: 'Reformulamos completamente o **sistema de créditos** da plataforma. Agora cada operação — seja adição ou retirada — fica **registrada com motivo**, como um extrato bancário.\n\nTransparência total. Você sabe exatamente quanto recebeu, quando e por quê. **Sem surpresas, sem dúvidas.**\n\nÉ assim que funciona quando a gente leva seu negócio a sério.\n\n*Demeni Sites, a franquia que cresce enquanto você lucra.* 💜',
            image_url: 'img/feed-posts/feed_post_03_1771047147603.webp',
            status: 'published',
            created_at: '2026-02-09T10:00:00-03:00'
        },
        {
            title: 'Segurança de Verdade',
            text: 'Investimos pesado em **segurança**. A plataforma agora conta com proteção em múltiplas camadas: headers de segurança, políticas de acesso no banco de dados, e verificação no servidor.\n\nNão é marketing. É **infraestrutura real** protegendo seus dados e os dos seus clientes. Cada página, cada requisição, cada dado — **protegido.**\n\nSegurança não é opcional. É obrigação. E a gente leva isso ao pé da letra.\n\n*Demeni Sites, a franquia que cresce enquanto você lucra.* 💜',
            image_url: 'img/feed-posts/feed_post_04_1771047182753.webp',
            status: 'published',
            created_at: '2026-02-10T10:00:00-03:00'
        },
        {
            title: 'Seu Site com Domínio Próprio',
            text: 'Seus sites publicados agora têm **URL personalizada** com certificado SSL automático. Seu cliente vê um site profissional, com endereço limpo e seguro.\n\nNada de links estranhos ou genéricos. **Credibilidade desde o primeiro clique.** E configurar? Um botão. Sem complicação.\n\nO que você entrega ao seu cliente diz muito sobre você. A gente garante que diga **o melhor.**\n\n*Demeni Sites, a franquia que cresce enquanto você lucra.* 💜',
            image_url: 'img/feed-posts/feed_post_05_1771047200692.webp',
            status: 'published',
            created_at: '2026-02-11T10:00:00-03:00'
        },
        {
            title: 'Nova Identidade Visual',
            text: 'Hoje é um dia especial: a Demeni Sites ganha sua **identidade visual oficial**. Logo, cores, tipografia — tudo pensado para transmitir o que somos: **profissionalismo e inovação.**\n\nCada detalhe foi desenhado à mão, por um Designer. Porque se a gente cria sites para clientes, a nossa própria marca **tem que ser impecável.**\n\nNovo capítulo. Mesma missão.\n\n*Demeni Sites, a franquia que cresce enquanto você lucra.* 💜',
            image_url: 'img/feed-posts/feed_post_06_1771047213984.webp',
            status: 'published',
            created_at: '2026-02-12T10:00:00-03:00'
        },
        {
            title: 'Sistema de XP e Níveis',
            text: 'Implementamos algo que nenhuma franquia digital tem: um **sistema de XP e níveis**. Quanto mais você usa a plataforma, mais XP ganha. Quanto mais evolui, **mais benefícios desbloqueia.**\n\nCriou um site? XP. Publicou? Mais XP. Indicou alguém? **Muito mais XP.** Não é só gamificação — é **reconhecimento real** pelo seu esforço.\n\nA gente acredita que quem trabalha mais, merece mais.\n\n*Demeni Sites, a franquia que cresce enquanto você lucra.* 💜',
            image_url: 'img/feed-posts/feed_post_07_1771047249812.webp',
            status: 'published',
            created_at: '2026-02-13T10:00:00-03:00'
        },
        {
            title: 'Editor Avançado D-2',
            text: 'Apresentamos o **Editor D-2**: nosso editor avançado para quem quer controle total. Seções modulares, temas de estilo, fine-tuning visual — tudo que um profissional precisa.\n\nDiferente dos editores genéricos, o D-2 foi feito por um Designer, **pensando como um Designer**. Cada opção tem um propósito. Cada ajuste gera resultado.\n\nCriar sites bonitos nunca foi tão **rápido e preciso.**\n\n*Demeni Sites, a franquia que cresce enquanto você lucra.* 💜',
            image_url: 'img/feed-posts/feed_post_08_1771047264263.webp',
            status: 'published',
            created_at: '2026-02-14T10:00:00-03:00'
        },
        {
            title: 'Programa de Afiliados',
            text: 'Agora você pode **ganhar indicando**. O programa de afiliados do Demeni Sites permite que você compartilhe seu link e receba **comissão** por cada novo franqueado que entrar pela sua indicação.\n\nSem limite. Sem burocracia. Quanto mais você indica, **mais você ganha.** Tudo rastreado automaticamente pela plataforma.\n\nO sucesso de um é o crescimento de todos.\n\n*Demeni Sites, a franquia que cresce enquanto você lucra.* 💜',
            image_url: 'img/feed-posts/feed_post_09_1771047278702.webp',
            status: 'published',
            created_at: '2026-02-15T10:00:00-03:00'
        },
        {
            title: 'Central de Aulas',
            text: 'Lançamos a **Central de Aulas**: um espaço dentro da plataforma dedicado ao seu aprendizado. Vídeos, tutoriais e dicas para você **dominar** a criação de sites.\n\nNão importa seu nível. Começou agora? A gente te guia. Já é experiente? Tem conteúdo avançado. **Conhecimento acessível, na hora que você precisar.**\n\nInvestir em você é investir no seu negócio.\n\n*Demeni Sites, a franquia que cresce enquanto você lucra.* 💜',
            image_url: 'img/feed-posts/feed_post_10_1771047293833.webp',
            status: 'published',
            created_at: '2026-02-16T10:00:00-03:00'
        }
    ];

    const client = SupabaseClient.getClient();
    let success = 0;
    let failed = 0;

    for (const post of posts) {
        try {
            const { data, error } = await client
                .from('feed_posts')
                .insert({
                    title: post.title,
                    text: post.text,
                    image_url: post.image_url,
                    author_name: 'Demeni Sites',
                    author_avatar: 'img/feed-avatar.webp',
                    status: post.status,
                    likes_count: 0,
                    created_at: post.created_at
                });

            if (error) {
                console.error(`❌ Erro no post "${post.title}":`, error.message);
                failed++;
            } else {
                console.log(`✅ Publicado: "${post.title}"`);
                success++;
            }
        } catch (e) {
            console.error(`❌ Exceção no post "${post.title}":`, e);
            failed++;
        }
    }

    console.log(`\n🎯 Resultado: ${success} publicados, ${failed} com erro.`);
    console.log('🔄 Recarregue a página para ver os posts no feed.');
})();
