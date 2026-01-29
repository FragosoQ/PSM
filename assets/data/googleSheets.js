// Configuração do Google Sheets
const SHEET_ID = '1GQUB52a2gKR429bjqJrNkbP5rjR7Z_4v85z9M7_Cr8Y';
const SHEET_NAME = 'PSMulti';

/**
 * Carrega dados do Google Sheets
 * @returns {Promise<Array>} Array com os dados da planilha
 */
async function loadGoogleSheetData() {
  try {
    console.log('🌐 Carregando dados do Google Sheets (PSMulti)...');
    
    // URL para aceder ao Google Sheets como JSON
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    
    // Remove o prefixo do Google (google.visualization.Query.setResponse)
    const jsonString = text.substring(47, text.length - 2);
    const json = JSON.parse(jsonString);
    
    // Processa os dados
    const rows = json.table.rows;
    const cols = json.table.cols;
    
    // Extrai os nomes das colunas
    const headers = cols.map(col => col.label || col.id);
    console.log('📋 Cabeçalhos encontrados:', headers);
    
    // Converte as linhas em objetos
    const data = rows.map((row, index) => {
      const obj = {};
      row.c.forEach((cell, cellIndex) => {
        const header = headers[cellIndex];
        obj[header] = cell ? cell.v : null;
      });
      return obj;
    }).filter(row => {
      // Remove linhas vazias
      return Object.values(row).some(val => val !== null && val !== '');
    });
    
    console.log(`✅ ${data.length} linhas carregadas do Google Sheets`);
    console.log('Primeira linha:', data[0]);
    
    return data;
    
  } catch (error) {
    console.error('❌ Erro ao carregar dados do Google Sheets:', error);
    throw error;
  }
}

/**
 * Carrega banco de dados de países com coordenadas
 * @returns {Promise<Array>} Array com todos os países e suas coordenadas
 */
async function loadCountriesDatabase() {
  try {
    const response = await fetch('assets/data/countries.all.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao carregar banco de dados de países:', error);
    return [];
  }
}

/**
 * Busca coordenadas de um país no banco de dados
 * @param {string} countryName - Nome do país
 * @param {Array} database - Banco de dados de países
 * @returns {Object|null} Objeto com latitude e longitude, ou null
 */
function findCountryCoordinates(countryName, database) {
  if (!countryName) return null;
  
  const normalizedName = countryName.trim().toLowerCase();
  
  // Mapeamento de nomes alternativos
  const nameMapping = {
    'portugal': 'Portugal',
    'espanha': 'Spain',
    'frança': 'France',
    'france': 'France',
    'alemanha': 'Germany',
    'itália': 'Italy',
    'croácia': 'Croatia',
    'reino unido': 'United Kingdom',
    'eua': 'United States',
    'usa': 'United States',
    'united states': 'United States',
    'estados unidos': 'United States',
    'brasil': 'Brazil',
    'moçambique': 'Mozambique',
    'angola': 'Angola',
    'cabo verde': 'Cabo Verde',
    'são tomé e príncipe': 'Sao Tome and Principe',
    'guiné-bissau': 'Guinea-Bissau',
    'guiné equatorial': 'Equatorial Guinea',
    'timor-leste': 'Timor-Leste',
    'macau': 'Macao SAR, China',
    'china': 'China',
    'japão': 'Japan',
    'índia': 'India',
    'austrália': 'Australia',
    'canadá': 'Canada',
    'méxico': 'Mexico',
    'argentina': 'Argentina',
    'chile': 'Chile',
    'colômbia': 'Colombia',
    'peru': 'Peru',
    'marrocos': 'Morocco',
    'egito': 'Egypt, Arab Rep.',
    'nigéria': 'Nigeria',
    'quénia': 'Kenya',
    'áfrica do sul': 'South Africa'
  };
  
  // Tenta com mapeamento primeiro
  const mappedName = nameMapping[normalizedName];
  if (mappedName) {
    const country = database.find(c => c.name === mappedName);
    if (country && country.latitude && country.longitude) {
      return {
        name: country.name,
        latitude: country.latitude,
        longitude: country.longitude,
        capitalCity: country.capitalCity
      };
    }
  }
  
  // Busca direta (case-insensitive)
  const country = database.find(c => 
    c.name && c.name.toLowerCase() === normalizedName
  );
  
  if (country && country.latitude && country.longitude) {
    return {
      name: country.name,
      latitude: country.latitude,
      longitude: country.longitude,
      capitalCity: country.capitalCity
    };
  }
  
  // Busca parcial (contém o nome)
  const partialMatch = database.find(c => 
    c.name && (
      c.name.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(c.name.toLowerCase())
    )
  );
  
  if (partialMatch && partialMatch.latitude && partialMatch.longitude) {
    return {
      name: partialMatch.name,
      latitude: partialMatch.latitude,
      longitude: partialMatch.longitude,
      capitalCity: partialMatch.capitalCity
    };
  }
  
  return null;
}

/**
 * Converte dados do Google Sheets para o formato esperado pela aplicação
 * Extrai países das colunas "País 1", "País 2", "País 3" e busca coordenadas
 * @param {Array} sheetData - Dados brutos do Google Sheets
 * @returns {Promise<Object>} Dados formatados com countries e connections
 */
async function convertSheetDataToAppFormat(sheetData) {
  console.log('🔄 Convertendo dados do Google Sheets para formato da aplicação...');
  
  // Carrega banco de dados de países
  const countriesDB = await loadCountriesDatabase();
  console.log(`📚 Banco de dados carregado: ${countriesDB.length} países`);
  
  const sampleRow = sheetData[0] || {};
  const columnNames = Object.keys(sampleRow);
  
  console.log('📋 Total de colunas:', columnNames.length);
  console.log('📋 Primeiras colunas:', columnNames.slice(0, 5).join(', '));
  console.log('📋 Últimas colunas:', columnNames.slice(-5).join(', '));
  
  // Encontra a coluna "Chave de Procura" (coluna A)
  const chaveCol = columnNames.find(col => /^chave\s*de\s*procura$/i.test(col.trim()));
  
  // Encontra as colunas de países (procura pelos nomes exatos dos cabeçalhos)
  const country1Col = columnNames.find(col => /^país\s*1$/i.test(col.trim()));
  const country2Col = columnNames.find(col => /^país\s*2$/i.test(col.trim()));
  const country3Col = columnNames.find(col => /^país\s*3$/i.test(col.trim()));
  
  console.log('🗺️ Colunas de países identificadas:');
  console.log(`   - Chave de Procura: "${chaveCol}" (índice: ${columnNames.indexOf(chaveCol)})`);
  console.log(`   - País 1: "${country1Col}" (índice: ${columnNames.indexOf(country1Col)})`);
  console.log(`   - País 2: "${country2Col}" (índice: ${columnNames.indexOf(country2Col)})`);
  console.log(`   - País 3: "${country3Col}" (índice: ${columnNames.indexOf(country3Col)})`);
  
  if (!country1Col && !country2Col && !country3Col) {
    console.error('❌ Nenhuma coluna de país encontrada!');
    console.error('Colunas disponíveis:', columnNames);
    throw new Error('Estrutura da planilha inválida - não foram encontradas colunas "País 1", "País 2", "País 3"');
  }
  
  // Coleta todos os países únicos mencionados
  const uniqueCountries = new Set();
  const portugalConnections = []; // Array para armazenar todas as conexões de Portugal com slot info
  
  // Sempre adiciona Portugal
  uniqueCountries.add('Portugal');
  
  console.log('📝 Processando linhas da planilha (apenas slots "Em Curso"):');
  
  sheetData.forEach((row, index) => {
    // Verifica se a linha tem "Slot_X_Em Curso" na coluna Chave de Procura
    const chaveValue = row[chaveCol];
    const slotMatch = chaveValue && String(chaveValue).trim().match(/Slot_(\d+)_Em Curso/i);
    
    if (!slotMatch) {
      return; // Pula esta linha se não for um slot ativo
    }
    
    const slotNumber = parseInt(slotMatch[1], 10);
    
    const countries = [
      row[country1Col],
      row[country2Col],
      row[country3Col]
    ].filter(c => c && String(c).trim() !== '');
    
    if (countries.length > 0) {
      console.log(`   Linha ${index + 1} (${chaveValue}): ${countries.join(' | ')}`);
    }
    
    // Para cada linha, cria conexões de Portugal para cada país mencionado
    countries.forEach(country => {
      const countryName = String(country).trim();
      if (countryName) {
        uniqueCountries.add(countryName);
        // Adiciona conexão Portugal → País com informação do slot
        portugalConnections.push({
          country: countryName,
          slot: slotNumber
        });
      }
    });
  });
  
  console.log();
  
  console.log(`🌍 ${uniqueCountries.size} países únicos encontrados:`, Array.from(uniqueCountries).join(', '));
  
  // Busca coordenadas para cada país
  const countries = [];
  const notFound = [];
  
  uniqueCountries.forEach(countryName => {
    const coords = findCountryCoordinates(countryName, countriesDB);
    
    if (coords) {
      countries.push({
        name: coords.name, // Usa nome normalizado do banco de dados
        latitude: coords.latitude,
        longitude: coords.longitude
      });
    } else {
      notFound.push(countryName);
    }
  });
  
  if (notFound.length > 0) {
    console.warn(`⚠️ ${notFound.length} países não encontrados no banco de dados:`, notFound.join(', '));
  }
  
  // Cria conexões: Portugal para cada país mencionado (múltiplas linhas)
  const connections = {};
  
  // Normaliza as conexões de Portugal mantendo informação do slot
  const normalizedPortugalConnections = portugalConnections
    .map(conn => {
      const c = findCountryCoordinates(conn.country, countriesDB);
      return c ? { country: c.name, slot: conn.slot } : { country: conn.country, slot: conn.slot };
    })
    .filter(conn => countries.some(c => c.name === conn.country)); // Só inclui se existir nas coordenadas
  
  if (normalizedPortugalConnections.length > 0) {
    connections['Portugal'] = normalizedPortugalConnections;
    console.log(`🔗 Portugal → ${normalizedPortugalConnections.length} conexões (incluindo duplicadas por linha)`);
    console.log(`📊 Array de conexões com slots:`, normalizedPortugalConnections);
    
    // Mostra estatísticas
    const uniqueCountries = [...new Set(normalizedPortugalConnections.map(c => c.country))];
    console.log(`📍 Países únicos: ${uniqueCountries.length} -`, uniqueCountries.join(', '));
    
    // Mostra quantas vezes cada país aparece e de que slots
    const countMap = {};
    normalizedPortugalConnections.forEach(conn => {
      if (!countMap[conn.country]) {
        countMap[conn.country] = { total: 0, slots: [] };
      }
      countMap[conn.country].total++;
      countMap[conn.country].slots.push(conn.slot);
    });
    console.log(`📈 Frequência por país:`, countMap);
  }
  
  console.log(`✅ Conversão completa: ${countries.length} países mapeados, Portugal conectado a ${normalizedPortugalConnections.length} destinos`);
  
  // Garante que Portugal está na lista (origem)
  const hasPortugal = countries.some(c => c.name === 'Portugal');
  if (!hasPortugal) {
    const portugalCoords = findCountryCoordinates('Portugal', countriesDB);
    if (portugalCoords) {
      countries.push({
        name: portugalCoords.name,
        latitude: portugalCoords.latitude,
        longitude: portugalCoords.longitude
      });
      console.log('✅ Portugal adicionado automaticamente como origem');
    }
  }
  
  return { countries, connections };
}

/**
 * Função principal que carrega os dados do Google Sheets e atualiza o objeto global 'data'
 * @returns {Promise<Object>} Objeto com countries e connections
 */
async function loadAndApplyGoogleSheetData() {
  try {
    console.log('📊 Iniciando carregamento de dados do Google Sheets...');
    
    // Carrega os dados brutos
    const rawData = await loadGoogleSheetData();
    
    // Converte para o formato da aplicação (agora é async)
    const { countries, connections } = await convertSheetDataToAppFormat(rawData);
    
    // Atualiza o objeto global 'data'
    if (typeof data !== 'undefined') {
      data.countries = countries;
      data.connections = connections;
      console.log('✅ Dados globais atualizados:', {
        countries: data.countries.length,
        connections: Object.keys(data.connections).length
      });
      
      // Update destination card with new connection data
      if (typeof updateDestination === 'function') {
        updateDestination();
      }
    } else {
      console.warn('⚠ Objeto global "data" não encontrado');
    }
    
    return { countries, connections };
    
  } catch (error) {
    console.error('❌ Erro ao carregar e aplicar dados:', error);
    console.error('🔄 Mantendo dados estáticos originais');
    throw error;
  }
}

// Exporta as funções
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    loadGoogleSheetData, 
    convertSheetDataToAppFormat,
    loadAndApplyGoogleSheetData 
  };
}
