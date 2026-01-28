// Script para testar o carregamento da planilha Google Sheets
const https = require('https');

const SHEET_ID = '1GQUB52a2gKR429bjqJrNkbP5rjR7Z_4v85z9M7_Cr8Y';
const SHEET_NAME = 'PS1';

const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

console.log('📊 Testando acesso ao Google Sheets...');
console.log('URL:', url);
console.log('');

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      // Remove o prefixo do Google
      const jsonString = data.substring(47, data.length - 2);
      const json = JSON.parse(jsonString);
      
      console.log('✅ Planilha acessível!');
      console.log('');
      console.log('📋 Cabeçalhos encontrados:');
      json.table.cols.forEach((col, i) => {
        console.log(`  ${i + 1}. "${col.label}" (tipo: ${col.type})`);
      });
      
      console.log('');
      console.log(`📊 Total de linhas: ${json.table.rows.length}`);
      console.log('');
      
      if (json.table.rows.length > 0) {
        console.log('🔍 Primeira linha de dados:');
        const firstRow = json.table.rows[0];
        firstRow.c.forEach((cell, i) => {
          const header = json.table.cols[i].label;
          const value = cell ? cell.v : null;
          console.log(`  ${header}: ${value}`);
        });
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar dados:', error.message);
      console.log('');
      console.log('Resposta bruta (primeiros 500 caracteres):');
      console.log(data.substring(0, 500));
    }
  });

}).on('error', (error) => {
  console.error('❌ Erro ao acessar planilha:', error.message);
});
