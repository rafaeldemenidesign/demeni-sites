const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'admin.html');
let content = fs.readFileSync(filepath, 'utf-8');

const regex = /(            <!-- Affiliates Page -->[\s\S]*?<\/section>)/;
const match = content.match(regex);

if (!match) {
    console.log('ERROR: Section not found!');
    process.exit(1);
}

console.log('Found section, length:', match[1].length);

const newSection = `            <!-- Affiliates Page (Pending Payouts) -->
            <section id="page-affiliates" class="page">
                <div class="page-header">
                    <h2>Indicações & Pendências</h2>
                    <button class="btn-secondary" onclick="loadAffiliates()">
                        <i class="fas fa-sync"></i> Atualizar
                    </button>
                </div>

                <!-- Affiliate Stats -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon users"><i class="fas fa-user-friends"></i></div>
                        <div class="stat-info">
                            <div class="stat-value" id="stat-affiliates">0</div>
                            <div class="stat-label">Indicações Totais</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon revenue"><i class="fas fa-exclamation-triangle"></i></div>
                        <div class="stat-info">
                            <div class="stat-value" id="stat-pending-amount">R$ 0</div>
                            <div class="stat-label">Pendência Acumulada</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon credits"><i class="fas fa-check-circle"></i></div>
                        <div class="stat-info">
                            <div class="stat-value" id="stat-paid-amount">R$ 0</div>
                            <div class="stat-label">Já Pago</div>
                        </div>
                    </div>
                </div>

                <!-- Commission Config -->
                <div class="settings-card">
                    <h3><i class="fas fa-sliders-h"></i> Comissão por Indicação</h3>
                    <div class="settings-row">
                        <label>Valor atual por indicação convertida</label>
                        <strong id="affiliate-commission-display">R$ 50</strong>
                    </div>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 8px;">
                        Escala: R$400→R$50 | R$800→R$100 | R$1.200→R$150 | R$1.600→R$200 | R$2.000→R$250
                    </p>
                </div>

                <!-- Pending Payouts Table -->
                <div class="settings-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h3 style="margin: 0;"><i class="fas fa-list"></i> Todas as Indicações</h3>
                        <button class="btn-primary" onclick="markAllPaid()" id="btn-mark-all-paid" style="display: none;">
                            <i class="fas fa-check-double"></i> Marcar Todos Pago
                        </button>
                    </div>
                    <div class="table-container" style="border: none;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Quem Indicou</th>
                                    <th>Indicado</th>
                                    <th>Data</th>
                                    <th>Comissão</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="affiliates-table">
                                <!-- Populated by JS -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>`;

content = content.replace(regex, newSection);
fs.writeFileSync(filepath, content, 'utf-8');
console.log('SUCCESS: admin.html updated!');
