// Configuration for charts
const chartConfig = {
    colors: {
        chart1: '#80a5dc',
        chart2: '#4b8cf2',
        chart3: '#007bff',
        chart4: '#00a2e8',
        chart5: '#5bc0de',
        chart6: '#3a94ff',
        // Cores para múltiplos slots
        slotColors: [
            '#4b8cf2', // Azul - Slot_1_Em Curso
            '#FFD700', // Amarelo - Slot_2_Em Curso
            '#FF8C00', // Laranja
            '#FF69B4', // Rosa
            '#00CED1', // Turquesa
            '#9370DB', // Roxo médio
            '#32CD32', // Verde lima
            '#FF6347', // Tomate
            '#4169E1'  // Azul royal
        ]
    },
    spreadsheetId: '1GQUB52a2gKR429bjqJrNkbP5rjR7Z_4v85z9M7_Cr8Y',
    sheetName: 'PSMulti',
    posto: 1, // Posto number (line to read: posto 1 = line 2, posto 2 = line 3, etc.)
    columns: {
        chart1: 'AA', // CUBA
        chart2: 'AC', // INTERIOR
        chart3: null, // TESTES - não existe
        chart4: 'AD', // ENVOLVENTES
        chart5: 'AB', // ESTRUTURA
        chart6: null  // ÁREA TÉCNICA - não existe
    }
};

/**
 * Fetches all rows from PSMulti sheet to detect slots
 */
const fetchAllSlotsData = async () => {
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/${chartConfig.spreadsheetId}/gviz/tq?tqx=out:json&sheet=${chartConfig.sheetName}`;

    try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        
        // Remove o prefixo do Google
        const jsonString = text.substring(47, text.length - 2);
        const json = JSON.parse(jsonString);
        
        const rows = json.table.rows;
        const slotRows = [];
        
        // Procura por linhas com "Slot_1_Em Curso" ou "Slot_2_Em Curso" na coluna A (Chave de Procura - índice 0)
        rows.forEach((row, index) => {
            const chaveCell = row.c[0]; // Coluna A (Chave de Procura - índice 0)
            const chaveValue = chaveCell ? chaveCell.v : null;
            const loteCell = row.c[36]; // Coluna AK (Lote1 - índice 36)
            const loteValue = loteCell ? loteCell.v : null;
            
            if (chaveValue && typeof chaveValue === 'string') {
                if (chaveValue.includes('Slot_1_Em Curso')) {
                    slotRows.push({ slotNumber: 1, rowIndex: index + 2, loteId: loteValue, chave: chaveValue });
                } else if (chaveValue.includes('Slot_2_Em Curso')) {
                    slotRows.push({ slotNumber: 2, rowIndex: index + 2, loteId: loteValue, chave: chaveValue });
                }
            }
        });
        
        return slotRows;

    } catch (error) {
        console.error('Error fetching slots data:', error);
        return [];
    }
};

/**
 * Fetches percentage value from Google Sheets PSMulti for a specific row and column
 */
const fetchPercentage = async (columnName, rowNumber) => {
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/${chartConfig.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${chartConfig.sheetName}&range=${columnName}${rowNumber}`;

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
 * Fetches countries from Google Sheets PSMulti (Columns W, X, Y - País 1, País 2, País 3)
 */
const fetchDestinationCountries = async () => {
    try {
        // Fetch all active slots
        const slots = await fetchAllSlotsData();
        
        if (slots.length === 0) {
            console.warn('No active slots found for countries.');
            return [];
        }
        
        const countriesWithSlot = [];
        
        for (const slot of slots) {
            const SHEET_URL = `https://docs.google.com/spreadsheets/d/${chartConfig.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${chartConfig.sheetName}&range=W${slot.rowIndex}:Y${slot.rowIndex}`;
            
            try {
                const response = await d3.text(SHEET_URL);
                const values = response.split('\n')[0]?.split(',').map(v => v.replace(/^"|"$/g, '').trim()) || [];
                
                // Add non-empty countries with slot info
                values.forEach(country => {
                    if (country && country !== '') {
                        countriesWithSlot.push({
                            name: country,
                            slotNumber: slot.slotNumber
                        });
                    }
                });
            } catch (error) {
                console.error(`Error fetching countries for Slot ${slot.slotNumber}:`, error);
            }
        }
        
        console.log('Fetched countries from PSMulti:', countriesWithSlot);
        return countriesWithSlot;
        
    } catch (error) {
        console.error('Error fetching destination countries:', error);
        return [];
    }
};

/**
 * Updates destination card with countries from PSMulti
 */
const updateDestination = async () => {
    const destinationTitle = document.getElementById('destination-title');
    
    if (!destinationTitle) return;
    
    destinationTitle.textContent = 'Loading...';
    
    // Get countries from PSMulti columns W, X, Y
    const countriesWithSlot = await fetchDestinationCountries();
    
    if (countriesWithSlot.length > 0) {
        destinationTitle.innerHTML = countriesWithSlot
            .map(countryData => {
                const slotClass = countryData.slotNumber === 2 ? ' slot2' : '';
                return `<span class="country-tag${slotClass}">${countryData.name.toUpperCase()}</span>`;
            })
            .join('');
        console.log('Destination card updated with countries:', countriesWithSlot);
    } else {
        destinationTitle.textContent = 'No destinations';
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
 * Draws multiple donut charts side by side in a container
 */
const drawMultipleDonutCharts = (containerId, chartsData) => {
    const container = d3.select(containerId).select('.card-chart');
    container.html('');

    const containerNode = container.node();
    if (!containerNode) return;

    const rect = containerNode.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // For 2 charts, each gets half the width
    const chartWidth = (width / chartsData.length) - 10;
    const chartHeight = height - 20;
    const size = Math.min(chartWidth, chartHeight);
    
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

    // Create a container for all charts
    const mainContainer = container.append('div')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center')
        .style('gap', '10px')
        .style('width', '100%')
        .style('height', '100%');

    // Draw each chart
    chartsData.forEach((chartInfo, index) => {
        const chartContainer = mainContainer.append('div')
            .style('display', 'flex')
            .style('flex-direction', 'column')
            .style('align-items', 'center')
            .style('justify-content', 'center')
            .style('gap', '2px');

        const uniqueId = `chart-${Math.random().toString(36).substr(2, 9)}`;
        const fillColor = chartInfo.color;
        const percentage = chartInfo.percentage;

        const data = [
            { value: percentage, name: 'Filled' },
            { value: 100 - percentage, name: 'Empty' }
        ];

        const svg = chartContainer.append('svg')
            .attr('width', size)
            .attr('height', size)
            .attr('viewBox', `0 0 ${size} ${size}`)
            .style('display', 'block')
            .append('g')
            .attr('transform', `translate(${size / 2}, ${size / 2})`);

        // Add gradient definitions
        const defs = svg.append('defs');
        
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

        // Add lote ID if available
        if (chartInfo.loteId) {
            chartContainer.append('div')
                .style('color', 'white')
                .style('font-size', '12px')
                .style('margin-top', '5px')
                .text(chartInfo.loteId);
        }
    });
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

    // Fetch all slots (Slot_1_Em Curso, Slot_2_Em Curso)
    const slots = await fetchAllSlotsData();

    for (const chart of charts) {
        // Skip charts with null column (não existem)
        if (chart.column === null) {
            // Hide the chart container
            d3.select(chart.id).style('display', 'none');
            continue;
        }
        
        if (slots.length === 0) {
            // Se não existem slots, mostrar um gráfico default (usando a primeira linha como fallback)
            const percentage = await fetchPercentage(chart.column, 2);
            // Usa a primeira cor do array slotColors (amarelo)
            drawDonutChart(chart.id, percentage, chartConfig.colors.slotColors[0]);
        } else {
            // Para qualquer número de slots (1 ou mais), desenhar múltiplos gráficos
            const chartsData = [];
            for (let i = 0; i < slots.length; i++) {
                const slot = slots[i];
                const percentage = await fetchPercentage(chart.column, slot.rowIndex);
                // Usa slotNumber-1 como índice (Slot_1 = índice 0 = amarelo, Slot_2 = índice 1 = laranja)
                const colorIndex = (slot.slotNumber - 1) % chartConfig.colors.slotColors.length;
                const color = chartConfig.colors.slotColors[colorIndex];
                chartsData.push({
                    percentage: percentage,
                    color: color,
                    loteId: slot.loteId,
                    chave: slot.chave
                });
            }
            drawMultipleDonutCharts(chart.id, chartsData);
        }
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
 * Updates EVO progress bar (Column L: GERAL from PSMulti sheet for active slots)
 * Creates dynamic progress bars based on number of active slots
 */
const updateEvoProgress = async () => {
    try {
        // Fetch all slots (Slot_1_Em Curso, Slot_2_Em Curso, etc.)
        const slots = await fetchAllSlotsData();
        
        const progressContainer = document.querySelector('.progress-bar-container');
        
        if (!progressContainer) {
            console.error('Progress bar container not found');
            return;
        }
        
        if (slots.length === 0) {
            // No active slots, hide container
            progressContainer.style.display = 'none';
            console.log('⚠️ No active slots found');
            return;
        }
        
        // Show container
        progressContainer.style.display = 'block';
        
        // Clear existing progress bars
        progressContainer.innerHTML = '';
        
        // Create progress bar for each slot
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            const SHEET_URL = `https://docs.google.com/spreadsheets/d/${chartConfig.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${chartConfig.sheetName}&range=L${slot.rowIndex}`;
            
            try {
                const response = await d3.text(SHEET_URL);
                let rawValue = response.split('\n')[0]?.trim().replace(/"/g, '');
                
                if (rawValue) {
                    rawValue = rawValue.replace('%', '').replace(',', '.').trim();
                    const percentage = parseFloat(rawValue);
                    
                    if (!isNaN(percentage)) {
                        const clampedPercentage = Math.min(100, Math.max(0, percentage));
                        
                        // Usa slotNumber-1 como índice (Slot_1 = índice 0 = amarelo, Slot_2 = índice 1 = laranja)
                        const colorIndex = (slot.slotNumber - 1) % chartConfig.colors.slotColors.length;
                        const color = chartConfig.colors.slotColors[colorIndex];
                        
                        // Cria wrapper para esta progress bar
                        const wrapper = document.createElement('div');
                        wrapper.className = 'progress-bar-wrapper';
                        wrapper.style.marginBottom = i < slots.length - 1 ? '8px' : '0';
                        
                        // Cria barra de progresso
                        const fillDiv = document.createElement('div');
                        fillDiv.className = 'progress-bar-fill';
                        fillDiv.style.width = `${clampedPercentage}%`;
                        fillDiv.style.background = `linear-gradient(90deg, ${color} 0%, ${d3.rgb(color).darker(0.5)} 50%, ${d3.rgb(color).darker(1)} 100%)`;
                        
                        wrapper.style.position = 'relative';
                        wrapper.appendChild(fillDiv);
                        progressContainer.appendChild(wrapper);
                        
                        console.log(`✅ Progress bar ${i + 1} updated: ${clampedPercentage}% (Chave: ${slot.chave}, Lote: ${slot.loteId})`);
                    }
                }
            } catch (error) {
                console.error(`Error fetching progress for slot ${i + 1}:`, error);
            }
        }
        
    } catch (error) {
        console.error('Error fetching progress from PSMulti GERAL:', error);
    }
};

/**
 * Fetches planning data from Google Sheets PSMulti for active slots
 */
const fetchPlanningData = async () => {
    try {
        // Fetch all active slots
        const slots = await fetchAllSlotsData();
        
        if (slots.length === 0) {
            return { slots: [] };
        }
        
        const slotsData = [];
        
        for (const slot of slots) {
            const SHEET_URL = `https://docs.google.com/spreadsheets/d/${chartConfig.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${chartConfig.sheetName}&range=A${slot.rowIndex}:F${slot.rowIndex}`;
            
            try {
                const response = await d3.text(SHEET_URL);
                const values = response.split('\n')[0]?.split(',').map(v => v.replace(/^"|"$/g, '').trim()) || [];
                
                slotsData.push({
                    slotNumber: slot.slotNumber,
                    lote: values[1] || '',        // Column B (LOTE) is index 1
                    quantidade: values[2] || '',  // Column C (QUANTIDADE / LOTE) is index 2
                    dataPretendida: values[5] || '' // Column F (DATA PRETENDIDA) is index 5
                });
            } catch (error) {
                console.error(`Error fetching planning data for Slot ${slot.slotNumber}:`, error);
            }
        }
        
        return { slots: slotsData };
        
    } catch (error) {
        console.error('Error fetching planning data from PSMulti:', error);
        return { slots: [] };
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
 * Fetches status from Google Sheets PSMulti (Column AI: STATUS)
 * Verifica todos os slots ativos: se qualquer um for OFF, retorna OFF
 * Apenas se todos forem ON, retorna ON
 */
const fetchStatus = async () => {
    try {
        // Fetch all active slots
        const slots = await fetchAllSlotsData();
        
        if (slots.length === 0) {
            return 'OFF';
        }
        
        // Check status (column AI - index 34) for each slot
        const statusValues = [];
        
        for (const slot of slots) {
            const SHEET_URL = `https://docs.google.com/spreadsheets/d/${chartConfig.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${chartConfig.sheetName}&range=AI${slot.rowIndex}`;
            
            try {
                const response = await d3.text(SHEET_URL);
                const statusValue = response.split('\n')[0]?.trim().replace(/"/g, '').toUpperCase() || 'OFF';
                statusValues.push(statusValue);
            } catch (error) {
                console.error(`Error fetching status for slot ${slot.slotNumber}:`, error);
                statusValues.push('OFF'); // Default to OFF on error
            }
        }
        
        // Se qualquer um for OFF, retorna OFF
        // Apenas se todos forem ON, retorna ON
        const hasOff = statusValues.some(status => status === 'OFF');
        const result = hasOff ? 'OFF' : 'ON';
        
        console.log(`📊 Status check - Slots: ${statusValues.join(', ')} → Result: ${result}`);
        return result;

    } catch (error) {
        console.error('Error fetching status from PSMulti:', error);
        return 'OFF';
    }
};

/**
 * Fetches GOAL chart data from Google Sheets PSMulti
 */
const fetchGoalData = async () => {
    // Read from PSMulti, row 2, columns AN, AO, AP (Dias Prazo, Dias Usados, Folga)
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/1GQUB52a2gKR429bjqJrNkbP5rjR7Z_4v85z9M7_Cr8Y/gviz/tq?tqx=out:csv&sheet=PSMulti&range=A2:AP2`;

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
        console.error('Error fetching GOAL data from PSMulti:', error);
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
    const currentLote = planningData.slots && planningData.slots.length > 0 ? planningData.slots[0].lote : ''; // Current LOTE from first slot
    
    // Fetch slots to check for Slot_2_Em Curso
    const slots = await fetchAllSlotsData();
    let slot2Lote = null;
    
    // If Slot 2 exists, fetch its LOTE from column B
    if (slots.length >= 2) {
        const slot2 = slots[1];
        const SHEET_URL_SLOT2 = `https://docs.google.com/spreadsheets/d/${chartConfig.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${chartConfig.sheetName}&range=B${slot2.rowIndex}`;
        try {
            const response = await d3.text(SHEET_URL_SLOT2);
            slot2Lote = response.split('\n')[0]?.trim().replace(/"/g, '');
            console.log(`📦 Slot 2 LOTE: ${slot2Lote}`);
        } catch (error) {
            console.error('Error fetching Slot 2 LOTE:', error);
        }
    }
    
    const infoPanelCard1 = document.querySelector('.info-panel-content-1');
    if (infoPanelCard1) {
        if (bufferItems.length > 0) {
            infoPanelCard1.innerHTML = bufferItems
                .map(item => {
                    const isSlot1Active = item === currentLote;
                    const isSlot2Active = slot2Lote && item === slot2Lote;
                    
                    let className = 'buffer-item';
                    if (isSlot1Active) {
                        className += ' active';
                    } else if (isSlot2Active) {
                        className += ' active-slot2';
                    }
                    
                    return `<div class="${className}">${item}</div>`;
                })
                .join('');
        } else {
            infoPanelCard1.innerHTML = '<div class="info-line">No buffer</div>';
        }
    }
    
    // Update PLANEAMENTO card with planning data from PSMulti
    const infoPanelCard2 = document.querySelector('.info-panel-content-2');
    if (infoPanelCard2) {
        if (planningData.slots && planningData.slots.length > 0) {
            if (planningData.slots.length === 1) {
                // Single slot - display in single column
                const slotData = planningData.slots[0];
                infoPanelCard2.innerHTML = `
                    <div class="slot-column">
                        <div class="info-line">${slotData.dataPretendida}</div>
                        <div class="info-line">Qtd: ${slotData.quantidade}</div>
                        <div class="info-line">${slotData.lote}</div>
                    </div>
                `;
            } else {
                // Multiple slots - display side by side
                const slotsHtml = planningData.slots.map(slotData => {
                    return `
                        <div class="slot-column">
                            <div class="info-line">${slotData.dataPretendida}</div>
                            <div class="info-line">Qtd: ${slotData.quantidade}</div>
                            <div class="info-line">${slotData.lote}</div>
                        </div>
                    `;
                }).join('');
                
                infoPanelCard2.innerHTML = slotsHtml;
            }
        } else {
            infoPanelCard2.innerHTML = '<div class="info-line">No active slots</div>';
        }
    }
    
    // Update status indicator based on STATUS column from PSMulti
    const status = (await fetchStatus()).toUpperCase();
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
    
    // Update GOAL chart with data from PSMulti
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
