/* ============================================
   EDITOR D2 - WHATSAPP LINK GENERATOR
   Ferramenta utilitária para gerar links de WhatsApp
   ============================================ */

/**
 * D2 WhatsApp Editor Component
 * Gera links de WhatsApp com número e mensagem personalizados
 */
class D2WhatsAppEditor {
    constructor() {
        this.basePath = 'd2Adjustments.whatsapp';
    }

    render() {
        const fragment = document.createDocumentFragment();
        const C = window.D2Controls;

        // ===== GERADOR DE LINK =====
        const generatorGroup = C.createGroupExpander(
            { title: 'Gerador de Link', icon: 'fa-link', expanded: true },
            () => {
                const container = document.createElement('div');

                // Número
                const numberInput = C.createTextInput({
                    label: 'Número (com DDD e código do país)',
                    value: window.d2State.get(`${this.basePath}.number`, ''),
                    placeholder: '5511999999999',
                    path: `${this.basePath}.number`
                });
                container.appendChild(numberInput);

                // Dica
                const tip = document.createElement('div');
                tip.style.cssText = 'font-size: 11px; opacity: 0.5; margin: -4px 0 12px; padding: 0 2px;';
                tip.textContent = 'Ex: 55 (Brasil) + 11 (DDD) + 999999999';
                container.appendChild(tip);

                // Mensagem
                const textArea = C.createTextArea({
                    label: 'Mensagem pré-definida',
                    value: window.d2State.get(`${this.basePath}.message`, ''),
                    placeholder: 'Olá! Gostaria de saber mais sobre...',
                    path: `${this.basePath}.message`,
                    rows: 3
                });
                container.appendChild(textArea);

                // Resultado
                const resultDiv = document.createElement('div');
                resultDiv.style.cssText = 'margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);';

                const resultLabel = document.createElement('div');
                resultLabel.style.cssText = 'font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; margin-bottom: 8px;';
                resultLabel.textContent = 'Link Gerado';
                resultDiv.appendChild(resultLabel);

                const linkDisplay = document.createElement('div');
                linkDisplay.style.cssText = 'background: rgba(0,0,0,0.3); border-radius: 8px; padding: 10px 12px; font-size: 12px; font-family: monospace; word-break: break-all; color: #4ade80; min-height: 36px; line-height: 1.5;';
                resultDiv.appendChild(linkDisplay);

                // Botões
                const btnsDiv = document.createElement('div');
                btnsDiv.style.cssText = 'display: flex; gap: 8px; margin-top: 10px;';

                const generateBtn = document.createElement('button');
                generateBtn.style.cssText = 'flex: 1; padding: 10px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; background: #25D366; color: #fff; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px;';
                generateBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Gerar Link';
                generateBtn.addEventListener('mouseenter', () => generateBtn.style.opacity = '0.85');
                generateBtn.addEventListener('mouseleave', () => generateBtn.style.opacity = '1');

                const copyBtn = document.createElement('button');
                copyBtn.style.cssText = 'flex: 1; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; font-size: 13px; font-weight: 600; background: transparent; color: #fff; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px;';
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
                copyBtn.addEventListener('mouseenter', () => copyBtn.style.background = 'rgba(255,255,255,0.08)');
                copyBtn.addEventListener('mouseleave', () => copyBtn.style.background = 'transparent');

                const testBtn = document.createElement('button');
                testBtn.style.cssText = 'width: 100%; margin-top: 6px; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; font-size: 12px; font-weight: 500; background: transparent; color: rgba(255,255,255,0.6); transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px;';
                testBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> Testar Link';
                testBtn.addEventListener('mouseenter', () => { testBtn.style.background = 'rgba(255,255,255,0.05)'; testBtn.style.color = '#fff'; });
                testBtn.addEventListener('mouseleave', () => { testBtn.style.background = 'transparent'; testBtn.style.color = 'rgba(255,255,255,0.6)'; });

                let currentLink = '';

                const generateLink = () => {
                    const number = window.d2State.get(`${this.basePath}.number`, '').replace(/\D/g, '');
                    const message = window.d2State.get(`${this.basePath}.message`, '');

                    if (!number) {
                        linkDisplay.textContent = '⚠️ Preencha o número';
                        linkDisplay.style.color = '#fbbf24';
                        currentLink = '';
                        return;
                    }

                    let url = `https://wa.me/${number}`;
                    if (message.trim()) {
                        url += `?text=${encodeURIComponent(message.trim())}`;
                    }

                    currentLink = url;
                    linkDisplay.textContent = url;
                    linkDisplay.style.color = '#4ade80';
                };

                generateBtn.addEventListener('click', generateLink);

                copyBtn.addEventListener('click', () => {
                    if (!currentLink) {
                        generateLink();
                    }
                    if (currentLink) {
                        navigator.clipboard.writeText(currentLink).then(() => {
                            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                            copyBtn.style.borderColor = '#4ade80';
                            copyBtn.style.color = '#4ade80';
                            setTimeout(() => {
                                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
                                copyBtn.style.borderColor = 'rgba(255,255,255,0.2)';
                                copyBtn.style.color = '#fff';
                            }, 2000);
                        });
                    }
                });

                testBtn.addEventListener('click', () => {
                    if (!currentLink) generateLink();
                    if (currentLink) window.open(currentLink, '_blank');
                });

                btnsDiv.appendChild(generateBtn);
                btnsDiv.appendChild(copyBtn);
                resultDiv.appendChild(btnsDiv);
                resultDiv.appendChild(testBtn);
                container.appendChild(resultDiv);

                // Auto-generate on load if number exists
                setTimeout(generateLink, 100);

                return container;
            }
        );
        fragment.appendChild(generatorGroup);

        return fragment;
    }
}

// Exporta globalmente
window.D2WhatsAppEditor = D2WhatsAppEditor;

console.log('[D2 WhatsApp Editor] Module loaded');
