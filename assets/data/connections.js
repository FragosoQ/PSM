/**
 * Normalizes country names to match database format
 * @param {string} countryName - Country name from sheet
 * @returns {string} Normalized country name
 */
const normalizeCountryName = (countryName) => {
    if (!countryName) return '';
    
    const normalized = countryName.trim().toLowerCase();
    
    // Mapeamento de nomes alternativos (mesmo que googleSheets.js)
    const nameMapping = {
        'portugal': 'Portugal',
        'espanha': 'Spain',
        'frança': 'France',
        'alemanha': 'Germany',
        'itália': 'Italy',
        'croácia': 'Croatia',
        'reino unido': 'United Kingdom',
        'eua': 'United States',
        'usa': 'United States',
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
    
    return nameMapping[normalized] || countryName.trim();
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
        
        // Look for rows with "Slot_1_Em Curso" or "Slot_2_Em Curso" in STATUS column (AI - index 34)
        rows.forEach((row, index) => {
            const statusCell = row.c[34]; // Column AI (STATUS - index 34)
            const statusValue = statusCell ? statusCell.v : null;
            
            if (statusValue && typeof statusValue === 'string' && 
                (statusValue.includes('Slot_1_Em Curso') || statusValue.includes('Slot_2_Em Curso'))) {
                
                // Get countries from columns W, X, Y (indices 22, 23, 24)
                const country1Cell = row.c[22]; // Column W (País 1)
                const country2Cell = row.c[23]; // Column X (País 2)
                const country3Cell = row.c[24]; // Column Y (País 3)
                
                const country1 = country1Cell ? country1Cell.v : null;
                const country2 = country2Cell ? country2Cell.v : null;
                const country3 = country3Cell ? country3Cell.v : null;
                
                // Add non-empty countries with normalization (including duplicates)
                if (country1 && country1.trim() !== '') {
                    const normalized = normalizeCountryName(country1);
                    destinationCountries.push(normalized);
                    console.log(`🗺️ País 1: "${country1}" → "${normalized}"`);
                }
                if (country2 && country2.trim() !== '') {
                    const normalized = normalizeCountryName(country2);
                    destinationCountries.push(normalized);
                    console.log(`🗺️ País 2: "${country2}" → "${normalized}"`);
                }
                if (country3 && country3.trim() !== '') {
                    const normalized = normalizeCountryName(country3);
                    destinationCountries.push(normalized);
                    console.log(`🗺️ País 3: "${country3}" → "${normalized}"`);
                }
            }
        });
        
        // Remove duplicates - keep only unique countries
        const uniqueCountries = [...new Set(destinationCountries)];
        
        // Create connections object with Portugal as origin
        const connections = {
            'Portugal': uniqueCountries
        };
        
        console.log('🔗 Connections loaded from PSMulti:', connections);
        console.log(`📊 Total countries before dedup: ${destinationCountries.length}`);
        console.log(`📊 Unique destination countries: ${uniqueCountries.length}`, uniqueCountries);
        
        return connections;
        
    } catch (error) {
        console.error('❌ Error loading connections from PSMulti:', error);
        // Fallback to default
        return { 'Portugal': ['Nigeria'] };
    }
};

