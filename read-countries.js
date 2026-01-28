const https = require('https');

const SHEET_ID = '1GQUB52a2gKR429bjqJrNkbP5rjR7Z_4v85z9M7_Cr8Y';
const SHEET_NAME = 'PS1';
const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

console.log('📊 Lendo planilha PS1...\n');

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const jsonString = data.substring(47, data.length - 2);
      const json = JSON.parse(jsonString);
      
      const headers = json.table.cols.map(col => col.label);
      const country1Idx = headers.findIndex(h => /país\s*1/i.test(h));
      const country2Idx = headers.findIndex(h => /país\s*2/i.test(h));
      const country3Idx = headers.findIndex(h => /país\s*3/i.test(h));
      
      console.log('📋 Colunas encontradas:');
      console.log(`   País 1 (índice ${country1Idx}): ${headers[country1Idx]}`);
      console.log(`   País 2 (índice ${country2Idx}): ${headers[country2Idx]}`);
      console.log(`   País 3 (índice ${country3Idx}): ${headers[country3Idx]}`);
      console.log();
      
      const countries = new Set();
      const countriesArray = [];
      let lineNum = 0;
      
      json.table.rows.forEach((row, i) => {
        const c1 = row.c[country1Idx]?.v || '';
        const c2 = row.c[country2Idx]?.v || '';
        const c3 = row.c[country3Idx]?.v || '';
        
        if (c1 || c2 || c3) {
          lineNum++;
          console.log(`Linha ${lineNum}:`);
          if (c1) { 
            console.log(`  País 1: ${c1}`); 
            countries.add(c1);
            countriesArray.push(c1);
          }
          if (c2) { 
            console.log(`  País 2: ${c2}`); 
            countries.add(c2);
            countriesArray.push(c2);
          }
          if (c3) { 
            console.log(`  País 3: ${c3}`); 
            countries.add(c3);
            countriesArray.push(c3);
          }
        }
      });
      
      console.log();
      console.log('🌍 Países únicos encontrados:');
      console.log(`   Total: ${countries.size}`);
      console.log(`   Lista: ${Array.from(countries).join(', ')}`);
      console.log();
      console.log('🔗 Total de conexões Portugal →:', countriesArray.length);
      console.log('📊 Array completo:', JSON.stringify(countriesArray));
      
      // Frequência
      const freq = {};
      countriesArray.forEach(c => {
        freq[c] = (freq[c] || 0) + 1;
      });
      console.log('\n📈 Frequência:');
      Object.entries(freq).forEach(([country, count]) => {
        console.log(`   ${country}: ${count}x`);
      });
      
    } catch (error) {
      console.error('❌ Erro:', error.message);
    }
  });
}).on('error', (error) => {
  console.error('❌ Erro ao acessar planilha:', error.message);
});
