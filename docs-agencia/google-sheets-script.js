// ================================
// DEMENI CORE — Google Apps Script
// Cole este código no editor do Apps Script
// ================================
// IMPORTANTE: Após colar, vá em:
// Implantar → Gerenciar implantações → Editar (lápis)
// Versão: Nova versão → Implantar

function doGet(e) {
    // Se tem parâmetro 'data', é um backup do Core
    if (e && e.parameter && e.parameter.data) {
        return processData(e.parameter.data);
    }
    return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok', message: 'Demeni Sheets API ativa' }))
        .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    try {
        if (e.postData && e.postData.contents) {
            return processData(e.postData.contents);
        } else if (e.parameter && e.parameter.payload) {
            return processData(e.parameter.payload);
        } else if (e.parameter && e.parameter.data) {
            return processData(e.parameter.data);
        }
        return ContentService
            .createTextOutput(JSON.stringify({ success: false, error: 'No data received' }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
        return ContentService
            .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function processData(jsonString) {
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

        var data = JSON.parse(jsonString);

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
