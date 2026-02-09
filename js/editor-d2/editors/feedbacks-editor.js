/* ============================================
   EDITOR D2 - FEEDBACKS EDITOR
   Painel de edição da seção Feedbacks
   ============================================ */

/**
 * D2 Feedbacks Editor Component
 * Gera os controles para editar a seção Feedbacks
 */
class D2FeedbacksEditor {
    constructor() {
        this.basePath = 'd2Adjustments.feedbacks';
    }

    /**
     * Renderiza todos os controles do Feedbacks
     * @returns {DocumentFragment}
     */
    render() {
        const fragment = document.createDocumentFragment();
        const C = window.D2Controls;

        // ===== FUNDO DA SEÇÃO =====
        const bgGroup = C.createGroupExpander(
            { title: 'Fundo da Seção', icon: 'fa-fill-drip', expanded: true },
            () => {
                const container = document.createElement('div');
                const dividerStyle = 'font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; margin: 16px 0 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);';

                const bgMode = window.d2State.get(`${this.basePath}.bgMode`, 'color');

                // Mode toggle buttons
                const modeDiv = document.createElement('div');
                modeDiv.style.cssText = 'display: flex; gap: 4px; margin-bottom: 12px;';
                modeDiv.innerHTML = `
                    <button class="mode-btn ${bgMode === 'color' ? 'active' : ''}" data-mode="color" style="flex:1;padding:8px;border:1px solid rgba(255,255,255,0.2);border-radius:6px;background:${bgMode === 'color' ? 'rgba(255,255,255,0.15)' : 'transparent'};color:inherit;cursor:pointer;font-size:12px;">
                        <i class="fas fa-palette"></i> Cor
                    </button>
                    <button class="mode-btn ${bgMode === 'image' ? 'active' : ''}" data-mode="image" style="flex:1;padding:8px;border:1px solid rgba(255,255,255,0.2);border-radius:6px;background:${bgMode === 'image' ? 'rgba(255,255,255,0.15)' : 'transparent'};color:inherit;cursor:pointer;font-size:12px;">
                        <i class="fas fa-image"></i> Imagem
                    </button>
                `;
                modeDiv.querySelectorAll('.mode-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        window.d2State.set(`${this.basePath}.bgMode`, btn.dataset.mode);
                        document.dispatchEvent(new CustomEvent('d2:section-selected', {
                            detail: { sectionId: 'feedbacks' }
                        }));
                    });
                });
                container.appendChild(modeDiv);

                if (bgMode === 'color') {
                    // ── COLOR MODE ──
                    container.appendChild(C.createColorPicker({
                        label: 'Cor principal',
                        value: window.d2State.get(`${this.basePath}.bgColor`, '#e8e8e8'),
                        path: `${this.basePath}.bgColor`
                    }));

                    container.appendChild(C.createToggle({
                        label: 'Ativar degradê',
                        value: window.d2State.get(`${this.basePath}.bgGradient`, false),
                        path: `${this.basePath}.bgGradient`
                    }));

                    if (window.d2State.get(`${this.basePath}.bgGradient`, false)) {
                        container.appendChild(C.createColorPicker({
                            label: 'Cor 2',
                            value: window.d2State.get(`${this.basePath}.bgColor2`, '#d0d0d0'),
                            path: `${this.basePath}.bgColor2`
                        }));
                        container.appendChild(C.createToggle({
                            label: 'Inverter direção',
                            value: window.d2State.get(`${this.basePath}.bgGradientInvert`, false),
                            path: `${this.basePath}.bgGradientInvert`
                        }));
                    }
                } else {
                    // ── IMAGE MODE ──
                    container.appendChild(C.createImagePicker({
                        label: 'Imagem de fundo',
                        value: window.d2State.get(`${this.basePath}.bgImage`, null),
                        path: `${this.basePath}.bgImage`,
                        aspect: '16/9'
                    }));

                    container.appendChild(C.createSlider({
                        label: 'Desfoque',
                        value: window.d2State.get(`${this.basePath}.bgImageBlur`, 0),
                        min: 0, max: 20, step: 1, unit: 'px',
                        path: `${this.basePath}.bgImageBlur`
                    }));
                    container.appendChild(C.createSlider({
                        label: 'Zoom',
                        value: window.d2State.get(`${this.basePath}.bgImageZoom`, 100),
                        min: 100, max: 300, step: 5, unit: '%',
                        path: `${this.basePath}.bgImageZoom`
                    }));
                    container.appendChild(C.createSlider({
                        label: 'Horizontal',
                        value: window.d2State.get(`${this.basePath}.bgImagePosX`, 50),
                        min: 0, max: 100, step: 1, unit: '%',
                        path: `${this.basePath}.bgImagePosX`
                    }));
                    container.appendChild(C.createSlider({
                        label: 'Vertical',
                        value: window.d2State.get(`${this.basePath}.bgImagePosY`, 0),
                        min: 0, max: 100, step: 1, unit: '%',
                        path: `${this.basePath}.bgImagePosY`
                    }));

                    const overlayDiv = document.createElement('div');
                    overlayDiv.style.cssText = dividerStyle;
                    overlayDiv.textContent = 'Sobreposição';
                    container.appendChild(overlayDiv);

                    container.appendChild(C.createToggle({
                        label: 'Ativar overlay',
                        value: window.d2State.get(`${this.basePath}.bgOverlay`, false),
                        path: `${this.basePath}.bgOverlay`
                    }));

                    if (window.d2State.get(`${this.basePath}.bgOverlay`, false)) {
                        // Overlay type selector
                        container.appendChild(C.createSelect({
                            label: 'Tipo de overlay',
                            value: window.d2State.get(`${this.basePath}.bgOverlayType`, 'solid'),
                            path: `${this.basePath}.bgOverlayType`,
                            options: [
                                { value: 'solid', label: 'Cor chapada' },
                                { value: 'gradient', label: 'Degradê cor-cor' },
                                { value: 'gradientTransparent', label: 'Degradê → Transparente' }
                            ]
                        }));

                        container.appendChild(C.createColorPicker({
                            label: 'Cor do overlay',
                            value: window.d2State.get(`${this.basePath}.bgOverlayColor`, '#000000'),
                            path: `${this.basePath}.bgOverlayColor`
                        }));

                        const overlayType = window.d2State.get(`${this.basePath}.bgOverlayType`, 'solid');
                        if (overlayType === 'gradient') {
                            container.appendChild(C.createColorPicker({
                                label: 'Cor 2 do overlay',
                                value: window.d2State.get(`${this.basePath}.bgOverlayColor2`, '#000000'),
                                path: `${this.basePath}.bgOverlayColor2`
                            }));
                        }

                        container.appendChild(C.createSlider({
                            label: 'Opacidade',
                            value: window.d2State.get(`${this.basePath}.bgOverlayOpacity`, 50),
                            min: 0, max: 100, step: 5, unit: '%',
                            path: `${this.basePath}.bgOverlayOpacity`
                        }));

                        // Direction/position/spread controls for gradient types
                        if (overlayType !== 'solid') {
                            container.appendChild(C.createToggle({
                                label: 'Inverter direção',
                                value: window.d2State.get(`${this.basePath}.bgOverlayInvert`, false),
                                path: `${this.basePath}.bgOverlayInvert`
                            }));
                            container.appendChild(C.createSlider({
                                label: 'Posição',
                                value: window.d2State.get(`${this.basePath}.bgOverlayPosition`, 50),
                                min: 0, max: 100, step: 5, unit: '%',
                                path: `${this.basePath}.bgOverlayPosition`
                            }));
                            container.appendChild(C.createSlider({
                                label: 'Suavidade',
                                value: window.d2State.get(`${this.basePath}.bgOverlaySpread`, 80),
                                min: 10, max: 100, step: 5, unit: '%',
                                path: `${this.basePath}.bgOverlaySpread`
                            }));
                        }
                    }
                }

                // Spacing
                const spDiv = document.createElement('div');
                spDiv.style.cssText = dividerStyle;
                spDiv.textContent = 'Espaçamento';
                container.appendChild(spDiv);

                container.appendChild(C.createSlider({
                    label: 'Espaçamento da seção',
                    value: window.d2State.get(`${this.basePath}.sectionSpacing`, 30),
                    min: 20, max: 80, step: 5, unit: 'px',
                    path: `${this.basePath}.sectionSpacing`
                }));

                return container;
            }
        );
        fragment.appendChild(bgGroup);

        // ===== TÍTULO DA SEÇÃO =====
        const titleGroup = C.createGroupExpander(
            { title: 'Título da Seção', icon: 'fa-heading', expanded: false },
            () => {
                const container = document.createElement('div');
                const dividerStyle = 'font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; margin: 16px 0 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);';

                // ── TÍTULO ──
                container.appendChild(C.createToggle({
                    label: 'Mostrar título',
                    value: window.d2State.get(`${this.basePath}.sectionTitle.enabled`, true),
                    path: `${this.basePath}.sectionTitle.enabled`
                }));
                container.appendChild(C.createTextInput({
                    label: 'Texto',
                    value: window.d2State.get(`${this.basePath}.sectionTitle.text`, 'O que estão dizendo?'),
                    placeholder: 'Ex: Depoimentos',
                    path: `${this.basePath}.sectionTitle.text`
                }));
                container.appendChild(C.createSlider({
                    label: 'Tamanho',
                    value: window.d2State.get(`${this.basePath}.sectionTitle.size`, 28),
                    min: 16, max: 60, step: 1, unit: 'px',
                    path: `${this.basePath}.sectionTitle.size`
                }));
                container.appendChild(C.createWeightSelector({
                    label: 'Peso',
                    value: window.d2State.get(`${this.basePath}.sectionTitle.weight`, 400),
                    path: `${this.basePath}.sectionTitle.weight`
                }));
                container.appendChild(C.createColorPicker({
                    label: 'Cor',
                    value: window.d2State.get(`${this.basePath}.sectionTitle.color`, '#333333'),
                    path: `${this.basePath}.sectionTitle.color`
                }));

                // ── SUBTÍTULO ──
                const subDiv = document.createElement('div');
                subDiv.style.cssText = dividerStyle;
                subDiv.textContent = 'Subtítulo';
                container.appendChild(subDiv);

                container.appendChild(C.createToggle({
                    label: 'Mostrar subtítulo',
                    value: window.d2State.get(`${this.basePath}.sectionSubtitle.enabled`, false),
                    path: `${this.basePath}.sectionSubtitle.enabled`
                }));
                container.appendChild(C.createTextInput({
                    label: 'Texto',
                    value: window.d2State.get(`${this.basePath}.sectionSubtitle.text`, 'Depoimentos de nossos clientes'),
                    placeholder: 'Ex: Veja o que dizem',
                    path: `${this.basePath}.sectionSubtitle.text`
                }));
                container.appendChild(C.createSlider({
                    label: 'Tamanho',
                    value: window.d2State.get(`${this.basePath}.sectionSubtitle.size`, 14),
                    min: 10, max: 24, step: 1, unit: 'px',
                    path: `${this.basePath}.sectionSubtitle.size`
                }));
                container.appendChild(C.createWeightSelector({
                    label: 'Peso',
                    value: window.d2State.get(`${this.basePath}.sectionSubtitle.weight`, 400),
                    path: `${this.basePath}.sectionSubtitle.weight`
                }));
                container.appendChild(C.createColorPicker({
                    label: 'Cor',
                    value: window.d2State.get(`${this.basePath}.sectionSubtitle.color`, '#666666'),
                    path: `${this.basePath}.sectionSubtitle.color`
                }));

                // ── ESPAÇAMENTO ──
                const spDiv = document.createElement('div');
                spDiv.style.cssText = dividerStyle;
                spDiv.textContent = 'Espaçamento';
                container.appendChild(spDiv);

                container.appendChild(C.createSlider({
                    label: 'Acima do título',
                    value: window.d2State.get(`${this.basePath}.sectionTitle.paddingTop`, 0),
                    min: 0, max: 40, step: 2, unit: 'px',
                    path: `${this.basePath}.sectionTitle.paddingTop`
                }));
                container.appendChild(C.createSlider({
                    label: 'Entre título e subtítulo',
                    value: window.d2State.get(`${this.basePath}.sectionTitle.gap`, 6),
                    min: 0, max: 30, step: 2, unit: 'px',
                    path: `${this.basePath}.sectionTitle.gap`
                }));
                container.appendChild(C.createSlider({
                    label: 'Abaixo do subtítulo',
                    value: window.d2State.get(`${this.basePath}.sectionTitle.paddingBottom`, 24),
                    min: 0, max: 40, step: 2, unit: 'px',
                    path: `${this.basePath}.sectionTitle.paddingBottom`
                }));

                return container;
            }
        );
        fragment.appendChild(titleGroup);

        // ===== TEXTO DOS CARDS =====
        const textGroup = C.createGroupExpander(
            { title: 'Texto dos Cards', icon: 'fa-font', expanded: false },
            () => {
                const container = document.createElement('div');
                const dividerStyle = 'font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; margin: 16px 0 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);';

                // ── NOME ──
                const nameDiv = document.createElement('div');
                nameDiv.style.cssText = 'font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; margin: 0 0 8px;';
                nameDiv.textContent = 'Nome do Cliente';
                container.appendChild(nameDiv);

                container.appendChild(C.createSlider({
                    label: 'Tamanho',
                    value: window.d2State.get(`${this.basePath}.name.size`, 16),
                    min: 12, max: 24, step: 1, unit: 'px',
                    path: `${this.basePath}.name.size`
                }));
                container.appendChild(C.createWeightSelector({
                    label: 'Peso',
                    value: window.d2State.get(`${this.basePath}.name.weight`, 500),
                    path: `${this.basePath}.name.weight`
                }));
                container.appendChild(C.createColorPicker({
                    label: 'Cor',
                    value: window.d2State.get(`${this.basePath}.name.color`, '#1a365d'),
                    path: `${this.basePath}.name.color`
                }));

                // ── DEPOIMENTO ──
                const textDiv = document.createElement('div');
                textDiv.style.cssText = dividerStyle;
                textDiv.textContent = 'Texto do Depoimento';
                container.appendChild(textDiv);

                container.appendChild(C.createSlider({
                    label: 'Tamanho',
                    value: window.d2State.get(`${this.basePath}.text.size`, 13),
                    min: 10, max: 18, step: 1, unit: 'px',
                    path: `${this.basePath}.text.size`
                }));
                container.appendChild(C.createWeightSelector({
                    label: 'Peso',
                    value: window.d2State.get(`${this.basePath}.text.weight`, 400),
                    path: `${this.basePath}.text.weight`
                }));
                container.appendChild(C.createColorPicker({
                    label: 'Cor',
                    value: window.d2State.get(`${this.basePath}.text.color`, '#666666'),
                    path: `${this.basePath}.text.color`
                }));

                return container;
            }
        );
        fragment.appendChild(textGroup);

        // ===== AVATAR =====
        const avatarGroup = C.createGroupExpander(
            { title: 'Avatar', icon: 'fa-user-circle', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createSlider({
                    label: 'Tamanho',
                    value: window.d2State.get(`${this.basePath}.avatar.size`, 60),
                    min: 40, max: 100, step: 5, unit: 'px',
                    path: `${this.basePath}.avatar.size`
                }));

                container.appendChild(C.createSlider({
                    label: 'Arredondamento',
                    value: window.d2State.get(`${this.basePath}.avatar.radius`, 8),
                    min: 0, max: 50, step: 2, unit: 'px',
                    path: `${this.basePath}.avatar.radius`
                }));

                return container;
            }
        );
        fragment.appendChild(avatarGroup);

        // ===== ESTILO DO CARD =====
        const cardGroup = C.createGroupExpander(
            { title: 'Estilo do Card', icon: 'fa-square', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createColorPicker({
                    label: 'Cor de fundo',
                    value: window.d2State.get(`${this.basePath}.card.bgColor`, '#ffffff'),
                    path: `${this.basePath}.card.bgColor`
                }));

                container.appendChild(C.createSlider({
                    label: 'Arredondamento',
                    value: window.d2State.get(`${this.basePath}.card.borderRadius`, 12),
                    min: 0, max: 30, step: 2, unit: 'px',
                    path: `${this.basePath}.card.borderRadius`
                }));

                return container;
            }
        );
        fragment.appendChild(cardGroup);

        // ===== TEXTO FINAL / CTA =====
        const ctaGroup = C.createGroupExpander(
            { title: 'Texto Final', icon: 'fa-comment-dots', expanded: false },
            () => {
                const container = document.createElement('div');

                container.appendChild(C.createToggle({
                    label: 'Mostrar texto final',
                    value: window.d2State.get(`${this.basePath}.bottomCta.enabled`, false),
                    path: `${this.basePath}.bottomCta.enabled`
                }));

                if (window.d2State.get(`${this.basePath}.bottomCta.enabled`, false)) {
                    container.appendChild(C.createTextInput({
                        label: 'Texto',
                        value: window.d2State.get(`${this.basePath}.bottomCta.text`, 'Faça parte dos nossos clientes satisfeitos!'),
                        placeholder: 'Texto de chamada...',
                        path: `${this.basePath}.bottomCta.text`
                    }));
                    container.appendChild(C.createSlider({
                        label: 'Tamanho',
                        value: window.d2State.get(`${this.basePath}.bottomCta.size`, 16),
                        min: 10, max: 30, step: 1, unit: 'px',
                        path: `${this.basePath}.bottomCta.size`
                    }));
                    container.appendChild(C.createWeightSelector({
                        label: 'Peso',
                        value: window.d2State.get(`${this.basePath}.bottomCta.weight`, 400),
                        path: `${this.basePath}.bottomCta.weight`
                    }));
                    container.appendChild(C.createColorPicker({
                        label: 'Cor',
                        value: window.d2State.get(`${this.basePath}.bottomCta.color`, '#333333'),
                        path: `${this.basePath}.bottomCta.color`
                    }));
                    container.appendChild(C.createSlider({
                        label: 'Espaço acima',
                        value: window.d2State.get(`${this.basePath}.bottomCta.paddingTop`, 20),
                        min: 0, max: 60, step: 2, unit: 'px',
                        path: `${this.basePath}.bottomCta.paddingTop`
                    }));
                    container.appendChild(C.createSlider({
                        label: 'Espaço abaixo',
                        value: window.d2State.get(`${this.basePath}.bottomCta.paddingBottom`, 20),
                        min: 0, max: 60, step: 2, unit: 'px',
                        path: `${this.basePath}.bottomCta.paddingBottom`
                    }));
                }

                return container;
            }
        );
        fragment.appendChild(ctaGroup);

        // ===== GERENCIAR DEPOIMENTOS =====
        const feedbacksGroup = C.createGroupExpander(
            { title: 'Gerenciar Depoimentos', icon: 'fa-list', expanded: false },
            () => {
                const container = document.createElement('div');
                const feedbacks = window.d2State.get('d2Feedbacks', []);

                if (feedbacks.length === 0) {
                    container.innerHTML = `
                        <div class="empty-items">
                            <i class="fas fa-comments"></i>
                            <span>Nenhum depoimento cadastrado</span>
                        </div>
                    `;
                } else {
                    feedbacks.forEach((feedback, index) => {
                        const itemGroup = C.createGroupExpander(
                            { title: `${index + 1}. ${feedback.name || 'Cliente'}`, expanded: false, nested: true },
                            () => {
                                const itemContainer = document.createElement('div');

                                itemContainer.appendChild(
                                    C.createTextInput({
                                        label: 'Nome do cliente',
                                        value: feedback.name || '',
                                        placeholder: 'Ex: Maria Silva',
                                        path: `d2Feedbacks.${index}.name`
                                    })
                                );

                                itemContainer.appendChild(
                                    C.createTextArea({
                                        label: 'Texto do depoimento',
                                        value: feedback.text || '',
                                        placeholder: 'Escreva o depoimento aqui...',
                                        path: `d2Feedbacks.${index}.text`,
                                        rows: 3
                                    })
                                );

                                itemContainer.appendChild(
                                    C.createTextInput({
                                        label: 'Link (opcional)',
                                        value: feedback.link || '',
                                        placeholder: 'https://instagram.com/...',
                                        path: `d2Feedbacks.${index}.link`
                                    })
                                );

                                itemContainer.appendChild(
                                    C.createImagePicker({
                                        label: 'Avatar',
                                        value: feedback.avatar || '',
                                        path: `d2Feedbacks.${index}.avatar`,
                                        aspect: '1/1',
                                        compact: true
                                    })
                                );

                                // Avatar position controls (only if avatar exists)
                                if (feedback.avatar) {
                                    const posDiv = document.createElement('div');
                                    posDiv.style.cssText = 'font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; margin: 12px 0 8px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);';
                                    posDiv.textContent = 'Ajuste da Foto';
                                    itemContainer.appendChild(posDiv);

                                    itemContainer.appendChild(
                                        C.createSlider({
                                            label: 'Zoom',
                                            value: feedback.avatarZoom || 100,
                                            min: 100, max: 200, step: 5, unit: '%',
                                            path: `d2Feedbacks.${index}.avatarZoom`
                                        })
                                    );
                                    itemContainer.appendChild(
                                        C.createSlider({
                                            label: 'Horizontal',
                                            value: feedback.avatarPosX ?? 50,
                                            min: 0, max: 100, step: 1, unit: '%',
                                            path: `d2Feedbacks.${index}.avatarPosX`
                                        })
                                    );
                                    itemContainer.appendChild(
                                        C.createSlider({
                                            label: 'Vertical',
                                            value: feedback.avatarPosY ?? 50,
                                            min: 0, max: 100, step: 1, unit: '%',
                                            path: `d2Feedbacks.${index}.avatarPosY`
                                        })
                                    );
                                }

                                // Botão de remover
                                const deleteBtn = document.createElement('button');
                                deleteBtn.className = 'btn-delete-item';
                                deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Remover Depoimento';
                                deleteBtn.addEventListener('click', () => {
                                    if (confirm(`Remover depoimento de "${feedback.name}"?`)) {
                                        window.d2State.removeFeedback(feedback.id);
                                        document.dispatchEvent(new CustomEvent('d2:section-selected', {
                                            detail: { sectionId: 'feedbacks' }
                                        }));
                                    }
                                });
                                itemContainer.appendChild(deleteBtn);

                                return itemContainer;
                            }
                        );
                        container.appendChild(itemGroup);
                    });
                }

                // Botão adicionar feedback
                const addBtn = document.createElement('button');
                addBtn.className = 'btn-add-item';
                addBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Depoimento';
                addBtn.onclick = () => {
                    const feedbacks = window.d2State.get('d2Feedbacks', []);
                    feedbacks.push({
                        id: Date.now(),
                        name: 'Novo Cliente',
                        text: 'Depoimento aqui...',
                        avatar: '',
                        link: '',
                        avatarZoom: 100,
                        avatarPosX: 50,
                        avatarPosY: 50
                    });
                    window.d2State.set('d2Feedbacks', feedbacks);
                    document.dispatchEvent(new CustomEvent('d2:section-selected', {
                        detail: { sectionId: 'feedbacks' }
                    }));
                    // Scroll to bottom of editor after re-render
                    setTimeout(() => {
                        const panel = document.querySelector('.edit-panel-content') || document.getElementById('edit-panel-content');
                        if (panel) {
                            panel.scrollTo({ top: panel.scrollHeight, behavior: 'smooth' });
                        }
                    }, 150);
                };
                container.appendChild(addBtn);

                return container;
            }
        );
        fragment.appendChild(feedbacksGroup);

        return fragment;
    }
}

// Exporta globalmente
window.D2FeedbacksEditor = D2FeedbacksEditor;

console.log('[D2 Feedbacks Editor] Module loaded');
