// Configuration for charts
const chartConfig = {
    colors: {
        chart1: '#80a5dc',
        chart2: '#4b8cf2',
        chart3: '#007bff',
        chart4: '#00a2e8',
        chart5: '#5bc0de',
        chart6: '#3a94ff'
    },
    spreadsheetId: '1GQUB52a2gKR429bjqJrNkbP5rjR7Z_4v85z9M7_Cr8Y',
    sheetName: 'PS1',
    posto: 1, // Posto number (line to read: posto 1 = line 2, posto 2 = line 3, etc.)
    columns: {
        chart1: 'AC', // CUBA
        chart2: 'AE', // INTERIOR
        chart3: null, // TESTES - não existe
        chart4: 'AF', // ENVOLVENTES
        chart5: 'AD', // ESTRUTURA
        chart6: null  // ÁREA TÉCNICA - não existe
    }
};

/**
 * Fetches percentage value from Google Sheets PS1
 */
const fetchPercentage = async (columnName) => {
    const row = chartConfig.posto + 1; // posto 1 = row 2, posto 2 = row 3, etc.
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/${chartConfig.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${chartConfig.sheetName}&range=${columnName}${row}`;

    try {
        const response = await d3.text(SHEET_URL);
        
        let rawValue = response.split('\n')[1]?.trim(); 

        if (!rawValue) {
            rawValue = response.split('\n')[0]?.trim(); 
        }

        if (!rawValue) {
            console.warn(`Empty data or unexpected format for column ${columnName}.`);
            return 0;
        }

        rawValue = rawValue.replace(/"/g, ''); 
        rawValue = rawValue.replace(',', '.'); 
        const numericMatch = rawValue.match(/^-?\d+(\.\d+)?/); 
        
        if (numericMatch) {
            const parsedValue = parseFloat(numericMatch[0]);
            
            if (!isNaN(parsedValue)) {
                return Math.min(100, Math.max(0, parsedValue));
            }
        }
        
        console.warn(`Non-numeric value found in column ${columnName}: "${rawValue}". Using 0% as fallback.`);
        return 0;

    } catch (error) {
        console.error(`Error fetching data from column ${columnName}:`, error);
        return 0; 
    }
};

/**
 * Fetches destination name from Google Sheets PM1 (Column L - PAÍS)
 */
const fetchDestination = async () => {
    const row = chartConfig.posto + 1; // posto 1 = row 2, posto 2 = row 3, etc.
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/${chartConfig.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${chartConfig.sheetName}&range=L${row}`;

    try {
        const response = await d3.text(SHEET_URL);
        console.log('PAÍS response:', response);
        
        // Split by newlines and get first line (which is L2 data)
        let destination = response.split('\n')[0]?.trim(); 

        if (!destination) {
            console.warn('Empty destination data.');
            return 'Nigeria';
        }

        // Remove quotes if present
        destination = destination.replace(/^"|"$/g, ''); 
        
        console.log('Fetched destination:', destination);
        return destination;

    } catch (error) {
        console.error('Error fetching destination:', error);
        return 'Nigeria'; 
    }
};

/**
 * Updates destination card with unique countries from connections
 */
const updateDestination = () => {
    const destinationTitle = document.getElementById('destination-title');
    
    if (!destinationTitle) return;
    
    // Get unique countries from Portugal connections
    if (data.connections && data.connections.Portugal) {
        const uniqueCountries = [...new Set(data.connections.Portugal)];
        
        // Create HTML with tags for each country
        if (uniqueCountries.length > 0) {
            destinationTitle.innerHTML = uniqueCountries
                .map(country => `<span class="country-tag">${country.toUpperCase()}</span>`)
                .join('');
        } else {
            destinationTitle.textContent = 'No destinations';
        }
        
        console.log('Destination card updated with countries:', uniqueCountries);
    } else {
        destinationTitle.textContent = 'Loading...';
    }
};

/**
 * Draws a Donut Chart inside a container
 */
const drawDonutChart = (containerId, percentage, fillColor) => {
    const container = d3.select(containerId).select('.card-chart');
    container.html('');

    const containerNode = container.node();
    if (!containerNode) return;

    const rect = containerNode.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const size = Math.min(width, height) - 20;
    
    if (size <= 0) {
        return; 
    }

    const radius = size / 2;
    const innerRadius = radius * 0.65;

    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(radius);

    const pie = d3.pie()
        .sort(null)
        .value(d => d.value)
        .startAngle(-Math.PI * 0.5) 
        .endAngle(Math.PI * 1.5); 

    const data = [
        { value: percentage, name: 'Filled' },
        { value: 100 - percentage, name: 'Empty' }
    ];

    // Generate unique ID for this chart
    const uniqueId = `chart-${Math.random().toString(36).substr(2, 9)}`;

    const svg = container.append('svg')
        .attr('width', size)
        .attr('height', size)
        .attr('viewBox', `0 0 ${size} ${size}`)
        .style('display', 'block')
        .style('margin', '0 auto')
        .append('g')
        .attr('transform', `translate(${size / 2}, ${size / 2})`);

    // Add gradient definitions
    const defs = svg.append('defs');
    
    // Radial gradient for filled portion
    const fillGradient = defs.append('radialGradient')
        .attr('id', `fill-gradient-${uniqueId}`)
        .attr('cx', '30%')
        .attr('cy', '30%');
    
    fillGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.rgb(fillColor).brighter(0.8))
        .attr('stop-opacity', 1);
    
    fillGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', fillColor)
        .attr('stop-opacity', 1);
    
    // Radial gradient for empty portion (lighter, more glassy)
    const emptyGradient = defs.append('radialGradient')
        .attr('id', `empty-gradient-${uniqueId}`)
        .attr('cx', '30%')
        .attr('cy', '30%');
    
    emptyGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', 'rgba(255, 255, 255, 0.3)')
        .attr('stop-opacity', 1);
    
    emptyGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', 'rgba(255, 255, 255, 0.08)')
        .attr('stop-opacity', 1);

    const arcs = svg.selectAll('.arc')
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class', 'arc');

    arcs.append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => i === 0 ? `url(#fill-gradient-${uniqueId})` : `url(#empty-gradient-${uniqueId})`)
        .attr('stroke', 'none');

    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em') 
        .style('font-size', '1.8rem')
        .style('font-weight', 'bold')
        .style('fill', 'white')
        .text(`${percentage.toFixed(0)}%`);
};

/**
 * Updates all charts with data from Google Sheets
 */
const updateAllCharts = async () => {
    const charts = [
        { id: '#grid-item-1', column: chartConfig.columns.chart1, color: chartConfig.colors.chart1 },
        { id: '#grid-item-2', column: chartConfig.columns.chart2, color: chartConfig.colors.chart2 },
        { id: '#grid-item-3', column: chartConfig.columns.chart3, color: chartConfig.colors.chart3 },
        { id: '#grid-item-4', column: chartConfig.columns.chart4, color: chartConfig.colors.chart4 },
        { id: '#grid-item-5', column: chartConfig.columns.chart5, color: chartConfig.colors.chart5 },
        { id: '#grid-item-6', column: chartConfig.columns.chart6, color: chartConfig.colors.chart6 }
    ];

    for (const chart of charts) {
        // Skip charts with null column (não existem)
        if (chart.column === null) {
            // Hide the chart container
            d3.select(chart.id).style('display', 'none');
            continue;
        }
        
        const percentage = await fetchPercentage(chart.column);
        drawDonutChart(chart.id, percentage, chart.color);
    }
};

/**
 * Initializes charts on page load and window resize
 */
const initCharts = () => {
    updateAllCharts();
    
    window.addEventListener('resize', () => {
        updateAllCharts();
    });
};

/**
 * Updates EVO progress bar (Column AB: GERAL from PS1 sheet)
 */
const updateEvoProgress = async () => {
    // Read from PS1 sheet, row 2 (first data row), column AB (GERAL)
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/1GQUB52a2gKR429bjqJrNkbP5rjR7Z_4v85z9M7_Cr8Y/gviz/tq?tqx=out:csv&sheet=PS1&range=AB2`;

    try {
        const response = await d3.text(SHEET_URL);
        
        let rawValue = response.split('\n')[0]?.trim().replace(/"/g, ''); 

        if (!rawValue) {
            console.warn('Empty data in PS1 column AB (GERAL).');
            return;
        }

        // Parse percentage (remove % if present and convert to number)
        rawValue = rawValue.replace('%', '').replace(',', '.').trim();
        const percentage = parseFloat(rawValue);
        
        if (!isNaN(percentage)) {
            const progressBar = document.getElementById('evo-progress');
            
            if (progressBar) {
                const clampedPercentage = Math.min(100, Math.max(0, percentage));
                progressBar.style.width = `${clampedPercentage}%`;
                console.log(`✅ Progress bar updated: ${clampedPercentage}%`);
            }
        } else {
            console.warn(`Non-numeric value in PS1 AB (GERAL): "${rawValue}"`);
        }
    } catch (error) {
        console.error('Error fetching progress from PS1 GERAL:', error);
    }
};

/**
 * Fetches planning data from Google Sheets PS1 (for second card)
 */
const fetchPlanningData = async () => {
    // Read from PS1, row 2 (first data row), all columns
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/1GQUB52a2gKR429bjqJrNkbP5rjR7Z_4v85z9M7_Cr8Y/gviz/tq?tqx=out:csv&sheet=PS1&range=A2:AO2`;

    try {
        const response = await d3.text(SHEET_URL);
        
        // Parse CSV response
        const values = response.split('\n')[0]?.split(',').map(v => v.replace(/^"|"$/g, '').trim()) || [];
        
        return {
            loteD: values[3] || '',   // Column D (LOTE) is index 3
            dataPretendida: values[5] || '',  // Column F (DATA PRETENDIDA) is index 5
            loteAM: values[43] || ''  // Column AM (Lote1) is index 43
        };

    } catch (error) {
        console.error('Error fetching planning data from PS1:', error);
        return { loteD: '', dataPretendida: '', loteAM: '' };
    }
};

/**
 * Fetches buffer data from soldaduraEditável sheet (D2:D9)
 */
const fetchBufferData = async () => {
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/1GQUB52a2gKR429bjqJrNkbP5rjR7Z_4v85z9M7_Cr8Y/gviz/tq?tqx=out:csv&sheet=soldaduraEditável&range=D2:D4`;

    try {
        const response = await d3.text(SHEET_URL);
        
        // Parse CSV response - each line is a buffer item
        const lines = response.split('\n').filter(line => line.trim());
        const bufferItems = lines.map(line => line.replace(/"/g, '').trim()).filter(item => item);
        
        return bufferItems;

    } catch (error) {
        console.error('Error fetching buffer data from soldaduraEditável:', error);
        return [];
    }
};

/**
 * Fetches status from Google Sheets PS1
 */
const fetchStatusData = async () => {
    // Read from PS1, row 2, column AK (STATUS)
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/1GQUB52a2gKR429bjqJrNkbP5rjR7Z_4v85z9M7_Cr8Y/gviz/tq?tqx=out:csv&sheet=PS1&range=A2:AK2`;

    try {
        const response = await d3.text(SHEET_URL);
        
        // Parse CSV response
        const values = response.split('\n')[0]?.split(',').map(v => v.replace(/^"|"$/g, '').trim()) || [];
        
        return values[41] || 'OFF';  // Column AK (STATUS) is index 41

    } catch (error) {
        console.error('Error fetching status from PS1:', error);
        return 'OFF';
    }
};

/**
 * Fetches GOAL chart data from Google Sheets PS1
 */
const fetchGoalData = async () => {
    // Read from PS1, row 2, columns AN, AO, AP (Dias Prazo, Dias Usados, Folga)
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/1GQUB52a2gKR429bjqJrNkbP5rjR7Z_4v85z9M7_Cr8Y/gviz/tq?tqx=out:csv&sheet=PS1&range=A2:AP2`;

    try {
        const response = await d3.text(SHEET_URL);
        
        // Parse CSV response
        const values = response.split('\n')[0]?.split(',').map(v => v.replace(/^"|"$/g, '').trim()) || [];
        
        return {
            diasPrazo: parseFloat(values[44]) || 0,   // Column AN (Dias Prazo)
            diasUsados: parseFloat(values[45]) || 0,  // Column AO (Dias Usados)
            folga: parseFloat(values[46]) || 0        // Column AP (Folga)
        };

    } catch (error) {
        console.error('Error fetching GOAL data from PS1:', error);
        return { diasPrazo: 0, diasUsados: 0, folga: 0 };
    }
};

/**
 * Fetches info panel data from Google Sheets PM1
 */
const fetchInfoPanelData = async () => {
    const row = chartConfig.posto + 1; // posto 1 = row 2, posto 2 = row 3, etc.
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/${chartConfig.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${chartConfig.sheetName}&range=A${row}:AN${row}`;

    try {
        const response = await d3.text(SHEET_URL);
        console.log('PM1 info panel response:', response);
        
        // Parse CSV response
        const values = response.split('\n')[0]?.split(',').map(v => v.replace(/^"|"$/g, '').trim()) || [];
        
        return {
            lote: values[36] || '',  // Column AK is index 36 (Lote)
            e: values[4] || '',      // Column E is index 4
            i: values[8] || '',      // Column I is index 8
            x: values[23] || '',     // Column X is index 23
            o: values[14] || '',     // Column O is index 14
            status: values[34] || '', // Column AI is index 34 (STATUS)
            diasPrazo: parseFloat(values[37]) || 0,   // Column AL is index 37 (Dias Prazo)
            diasUsados: parseFloat(values[38]) || 0,  // Column AM is index 38 (Dias Usados)
            folga: parseFloat(values[39]) || 0        // Column AN is index 39 (Folga)
        };

    } catch (error) {
        console.error('Error fetching info panel data:', error);
        return { lote: '', e: '', i: '', x: '', o: '', status: '', diasPrazo: 0, diasUsados: 0, folga: 0 };
    }
};

/**
 * Updates GOAL chart with data from PM1
 */
const updateGoalChart = (diasPrazo, diasUsados, folga) => {
    // Determine color for middle ring (amarelo se Dias Usados > Dias Prazo)
    const middleColor = diasUsados > diasPrazo ? '#FFD700' : '#00a2e8';
    
    // Determine color for inner ring (vermelho se Folga = 0)
    const innerColor = folga === 0 ? '#FF0000' : '#80a5dc';
    
    // Maximum value for all rings is diasPrazo + 4
    const maxValue = diasPrazo + 4;
    
    // Calculate dash arrays for each circle (full circle = 2 * PI * r)
    // Outer ring: r=80, circumference = 502.65
    const outerCircumference = 2 * Math.PI * 80;
    const outerDashArray = maxValue > 0 ? `${(diasPrazo / maxValue) * outerCircumference} ${outerCircumference}` : '0 502.65';
    
    // Middle ring: r=60, circumference = 376.99
    const middleCircumference = 2 * Math.PI * 60;
    const middleDashArray = maxValue > 0 ? `${(diasUsados / maxValue) * middleCircumference} ${middleCircumference}` : '0 376.99';
    
    // Inner ring: r=42, circumference = 263.89
    const innerCircumference = 2 * Math.PI * 42;
    const innerDashArray = maxValue > 0 ? `${(folga / maxValue) * innerCircumference} ${innerCircumference}` : '0 263.89';
    
    // Update SVG circles
    const svg = document.querySelector('.goal-chart');
    if (svg) {
        const circles = svg.querySelectorAll('circle[stroke-dasharray]');
        if (circles.length >= 3) {
            // Outer circle (AL - Dias Prazo) - always full
            circles[0].setAttribute('stroke-dasharray', outerDashArray);
            circles[0].setAttribute('stroke', '#007bff');
            
            // Middle circle (AM - Dias Usados)
            circles[1].setAttribute('stroke-dasharray', middleDashArray);
            circles[1].setAttribute('stroke', middleColor);
            
            // Inner circle (AN - Folga)
            circles[2].setAttribute('stroke-dasharray', innerDashArray);
            circles[2].setAttribute('stroke', innerColor);
        }
    }
};

/**
 * Updates info panel card with data
 */
const updateInfoPanel = async () => {
    const data = await fetchInfoPanelData();
    
    // Fetch planning data once (used by multiple cards)
    const planningData = await fetchPlanningData();
    
    // Update second card (info-panel-card-1) with buffer from soldaduraEditável
    const bufferItems = await fetchBufferData();
    const currentLote = planningData.loteD; // Current LOTE from PS1
    
    const infoPanelCard1 = document.querySelector('.info-panel-content-1');
    if (infoPanelCard1) {
        if (bufferItems.length > 0) {
            infoPanelCard1.innerHTML = bufferItems
                .map(item => {
                    const isActive = item === currentLote;
                    return `<div class="buffer-item ${isActive ? 'active' : ''}">${item}</div>`;
                })
                .join('');
        } else {
            infoPanelCard1.innerHTML = '<div class="info-line">No buffer</div>';
        }
    }
    
    // Update PLANEAMENTO card with planning data from PS1
    const infoPanelCard2 = document.querySelector('.info-panel-content-2');
    if (infoPanelCard2) {
        infoPanelCard2.innerHTML = `
            <div class="info-line">${planningData.dataPretendida}</div>
            <div class="info-line">${planningData.loteAM}</div>
            <div class="info-line">${planningData.loteD}</div>
        `;
    }
    
    // Update status indicator based on STATUS column from PS1
    const status = (await fetchStatusData()).toUpperCase();
    const statusIndicator = document.getElementById('status-indicator');
    if (statusIndicator) {
        if (status === 'ON') {
            statusIndicator.src = 'https://static.wixstatic.com/media/a6967f_e69c4b86d193485596b9d3d2d49625c3~mv2.png';
            statusIndicator.alt = 'Status ON';
        } else if (status === 'OFF') {
            statusIndicator.src = 'https://static.wixstatic.com/media/a6967f_226d67906a30456d92ac9b34c151654a~mv2.png';
            statusIndicator.alt = 'Status OFF';
        }
    }
    
    // Update GOAL chart with data from PS1
    const goalData = await fetchGoalData();
    updateGoalChart(goalData.diasPrazo, goalData.diasUsados, goalData.folga);
    
    console.log('Info panel updated with:', data);
};

/**
 * Initializes progress bar
 */
const initProgressBar = () => {
    updateEvoProgress();
    // Update every 30 seconds
    setInterval(updateEvoProgress, 30000);
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initCharts();
        initProgressBar();
        updateDestination();
        updateInfoPanel();
    });
} else {
    initCharts();
    initProgressBar();
    updateDestination();
    updateInfoPanel();
}
