/**
 * Normalizes country names to match database format (countries.js)
 * @param {string} countryName - Country name from sheet
 * @returns {string} Normalized country name matching countries.js format
 */
const normalizeCountryName = (countryName) => {
    if (!countryName) return '';
    
    const normalized = countryName.trim().toUpperCase();
    
    // Direct mapping PT -> countries.js format (all UPPERCASE)
    const nameMapping = {
        'PORTUGAL': 'PORTUGAL',
        'ESPANHA': 'ESPANHA',
        'FRANÇA': 'FRANÇA',
        'FRANCE': 'FRANÇA',
        'ALEMANHA': 'ALEMANHA',
        'ITÁLIA': 'ITÁLIA',
        'ITALIA': 'ITÁLIA',
        'CROÁCIA': 'CROÁCIA',
        'CROATIA': 'CROÁCIA',
        'REINO UNIDO': 'UK',
        'UK': 'UK',
        'EUA': 'USA',
        'USA': 'USA',
        'ESTADOS UNIDOS': 'USA',
        'UNITED STATES': 'USA',
        'BRASIL': 'BRASIL',
        'ARGENTINA': 'ARGENTINA',
        'AUSTRÁLIA': 'AUSTRÁLIA',
        'AUSTRALIA': 'AUSTRÁLIA',
        'ÁUSTRIA': 'Áustria',
        'AUSTRIA': 'Áustria',
        'BÉLGICA': 'BÉLGICA',
        'BELGIUM': 'BÉLGICA',
        'BULGÁRIA': 'BULGÁRIA',
        'BULGARIA': 'BULGÁRIA',
        'CHÉQUIA': 'CHÉQUIA',
        'CZECH REPUBLIC': 'CHÉQUIA',
        'CHILE': 'CHILE',
        'CHIPRE': 'CHIPRE',
        'CYPRUS': 'CHIPRE',
        'COLÔMBIA': 'COLÔMBIA',
        'COLOMBIA': 'COLÔMBIA',
        'DINAMARCA': 'DINAMARCA',
        'DENMARK': 'DINAMARCA',
        'ESLOVÁQUIA': 'ESLOVÁQUIA',
        'SLOVAKIA': 'ESLOVÁQUIA',
        'FILIPINAS': 'FILIPINAS',
        'PHILIPPINES': 'FILIPINAS',
        'FINLÂNDIA': 'FINLÂNDIA',
        'FINLAND': 'FINLÂNDIA',
        'GRÉCIA': 'GRÉCIA',
        'GREECE': 'GRÉCIA',
        'GUATEMALA': 'GUATEMALA',
        'HONDURAS': 'HONDURAS',
        'HUNGRIA': 'HUNGRIA',
        'HUNGARY': 'HUNGRIA',
        'ISRAEL': 'ISRAEL',
        'LITUÂNIA': 'LITUÂNIA',
        'LITHUANIA': 'LITUÂNIA',
        'MÉXICO': 'MÉXICO',
        'MEXICO': 'MÉXICO',
        'MONGÓLIA': 'MONGÓLIA',
        'MONGOLIA': 'MONGÓLIA',
        'NORUEGA': 'NORUEGA',
        'NORWAY': 'NORUEGA',
        'PAÍSES BAIXOS': 'PAISES BAIXOS',
        'PAISES BAIXOS': 'PAISES BAIXOS',
        'NETHERLANDS': 'PAISES BAIXOS',
        'POLÓNIA': 'POLÓNIA',
        'POLAND': 'POLÓNIA',
        'QATAR': 'QATAR',
        'REPÚBLICA DOMINICANA': 'REP. DOMINICANA',
        'REP. DOMINICANA': 'REP. DOMINICANA',
        'DOMINICAN REPUBLIC': 'REP. DOMINICANA',
        'ROMÉNIA': 'ROMÉNIA',
        'ROMANIA': 'ROMÉNIA',
        'RÚSSIA': 'RÚSSIA',
        'RUSSIA': 'RÚSSIA',
        'ARÁBIA SAUDITA': 'SAUDI ARABIA',
        'SAUDI ARABIA': 'SAUDI ARABIA',
        'SUÉCIA': 'SUÉCIA',
        'SWEDEN': 'SUÉCIA',
        'SUÍÇA': 'SUIÇA',
        'SWITZERLAND': 'SUIÇA',
        'TAILÂNDIA': 'TAILANDIA',
        'THAILAND': 'TAILANDIA',
        'TAIWAN': 'TAIWAN',
        'UZBEQUISTÃO': 'UZBEQUISTÃO',
        'UZBEKISTAN': 'UZBEQUISTÃO',
        'DUBAI': 'DUBAI',
        'EGITO': 'EGIPTO',
        'EGYPT': 'EGIPTO',
        'EL SALVADOR': 'EL SALVADOR',
        'BIELORRÚSSIA': 'BIEOLORUSSIA',
        'BELARUS': 'BIEOLORUSSIA'
    };
    
    return nameMapping[normalized] || countryName.trim().toUpperCase();
};

/**
 * Dynamically loads connections from PSMulti sheet (columns W, X, Y)
 * Creates connections from Portugal to all countries found in active slots
 */
const loadConnectionsFromPSMulti = async () => {
    try {
        const spreadsheetId = '1GQUB52a2gKR429bjqJrNkbP5rjR7Z_4v85z9M7_Cr8Y';
        const sheetName = 'PSMulti';
        const SHEET_URL = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}`;

        const response = await fetch(SHEET_URL);
        const text = await response.text();
        
        // Remove Google prefix
        const jsonString = text.substring(47, text.length - 2);
        const json = JSON.parse(jsonString);
        
        const rows = json.table.rows;
        const destinationCountries = [];
        
        // Look for rows with "Slot_X_Em Curso" pattern
        rows.forEach((row, index) => {
            const chaveCell = row.c[0]; // Column A (Chave de Procura - index 0)
            const chaveValue = chaveCell ? chaveCell.v : null;
            
            // Match pattern Slot_X_Em Curso to extract slot number
            const slotMatch = chaveValue && typeof chaveValue === 'string' ? 
                chaveValue.match(/Slot_(\d+)_Em Curso/i) : null;
            
            if (slotMatch) {
                const slotNumber = parseInt(slotMatch[1], 10);
                
                // Get countries from columns W, X, Y (indices 22, 23, 24)
                const country1Cell = row.c[22]; // Column W (País 1)
                const country2Cell = row.c[23]; // Column X (País 2)
                const country3Cell = row.c[24]; // Column Y (País 3)
                
                const country1 = country1Cell ? country1Cell.v : null;
                const country2 = country2Cell ? country2Cell.v : null;
                const country3 = country3Cell ? country3Cell.v : null;
                
                // Add non-empty countries with slot info
                if (country1 && country1.trim() !== '') {
                    const normalized = normalizeCountryName(country1);
                    destinationCountries.push({ country: normalized, slot: slotNumber });
                    console.log(`🗺️ País 1: "${country1}" → "${normalized}" (Slot ${slotNumber})`);
                }
                if (country2 && country2.trim() !== '') {
                    const normalized = normalizeCountryName(country2);
                    destinationCountries.push({ country: normalized, slot: slotNumber });
                    console.log(`🗺️ País 2: "${country2}" → "${normalized}" (Slot ${slotNumber})`);
                }
                if (country3 && country3.trim() !== '') {
                    const normalized = normalizeCountryName(country3);
                    destinationCountries.push({ country: normalized, slot: slotNumber });
                    console.log(`🗺️ País 3: "${country3}" → "${normalized}" (Slot ${slotNumber})`);
                }
            }
        });
        
        // Create connections object with Portugal as origin (keep all including duplicates)
        const connections = {
            'Portugal': destinationCountries // Array of {country, slot} objects
        };
        
        console.log('🔗 Connections loaded from PSMulti:', connections);
        console.log(`📊 Total connections: ${destinationCountries.length}`);
        
        return connections;
        
    } catch (error) {
        console.error('❌ Error loading connections from PSMulti:', error);
        // Fallback to default
        return { 'Portugal': ['Nigeria'] };
    }
};

