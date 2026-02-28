// ================================
// DEMENI CORE — Google Apps Script
// Cole este código no editor do Apps Script
// ================================
// IMPORTANTE: Após colar, vá em:
// Implantar → Gerenciar implantações → Editar (lápis)
// Versão: Nova versão → Implantar

function doGet(e) {
    // Se tem parâmetro 'action', é um backup do Core
    if (e && e.parameter && e.parameter.action) {
        return gravar(e.parameter);
    }
    return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok', message: 'Demeni Sheets API ativa' }))
        .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    try {
        // Tenta ler JSON do body
        if (e.postData && e.postData.contents) {
            var data = JSON.parse(e.postData.contents);
            return gravar(data);
        }
        // Fallback: parâmetros do form/URL
        if (e.parameter && e.parameter.action) {
            return gravar(e.parameter);
        }
        return ContentService
            .createTextOutput(JSON.stringify({ success: false, error: 'Sem dados' }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
        return ContentService
            .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function gravar(d) {
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

        sheet.appendRow([
            new Date().toLocaleString('pt-BR'),
            d.action || '',
            d.client_name || '',
            d.client_phone || '',
            d.client_email || '',
            d.client_instagram || '',
            d.client_city || '',
            d.product_type || '',
            d.price || '',
            d.source || '',
            d.status || '',
            d.referral_code || '',
            d.site_url || '',
            d.tracking_token || '',
            d.notes || '',
            d.loss_reason || ''
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
