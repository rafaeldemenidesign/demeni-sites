// ================================
// DEMENI CORE — Google Apps Script
// Cole este código no editor do Apps Script
// ================================
// Como configurar:
// 1. Abra a planilha no Google Sheets
// 2. Menu: Extensões → Apps Script
// 3. Cole este código
// 4. Implantar → Gerenciar implantações → Editar
// 5. Executar como: Eu → Quem tem acesso: Qualquer pessoa
// 6. Copie a URL gerada e cole nas configurações do Core

function doPost(e) {
    try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Base');
        if (!sheet) {
            sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Base');
            sheet.getRange(1, 1, 1, 16).setValues([[
                'Data/Hora', 'Ação', 'Nome', 'Telefone', 'Email', 'Instagram',
                'Cidade', 'Produto', 'Valor', 'Origem', 'Status',
                'Código Indicação', 'Link Site', 'Tracking', 'Notas', 'Motivo Perda'
            ]]);
            sheet.getRange(1, 1, 1, 16).setFontWeight('bold');
            sheet.setFrozenRows(1);
        }

        // Handle both JSON body and form submissions
        var data;
        if (e.postData && e.postData.contents) {
            data = JSON.parse(e.postData.contents);
        } else if (e.parameter && e.parameter.payload) {
            data = JSON.parse(e.parameter.payload);
        } else {
            data = e.parameter || {};
        }

        sheet.appendRow([
            new Date().toLocaleString('pt-BR'),
            data.action || 'update',
            data.client_name || '',
            data.client_phone || '',
            data.client_email || '',
            data.client_instagram || '',
            data.client_city || '',
            data.product_type || '',
            data.price || '',
            data.source || '',
            data.status || '',
            data.referral_code || '',
            data.site_url || '',
            data.tracking_token || '',
            data.notes || '',
            data.loss_reason || ''
        ]);

        return ContentService
            .createTextOutput(JSON.stringify({ success: true }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService
            .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function doGet(e) {
    return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok', message: 'Demeni Sheets API ativa' }))
        .setMimeType(ContentService.MimeType.JSON);
}
