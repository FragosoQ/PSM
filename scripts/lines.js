class Lines {
  constructor() {
    // Will be populated after creating the groups so we only cycle through
    // countries that actually have line groups added to `groups.lines`.
    this.countries = [];
    this.total = 0;

    this.group = groups.lines = new THREE.Group();
    this.group.name = 'Lines';

    this.create();
    // After create(), `groups.lines` contains only the groups we added.
    this.countries = groups.lines.children.map(child => child.name);
    this.total = this.countries.length;
    this.animate();
    this.createDots();
  }

  changeCountry() {
    // Don't change country - keep Portugal line always visible
    return;
  }

  createDots() {
    const lineDots = new Dots();
    groups.globe.add(groups.lineDots);
  }

  animate() {
    if(!countries.selected) {
      this.select();
    }

    this.interval = setInterval(
      () => this.changeCountry(), 
      countries.interval
    );
  }

  select() {
    // Always select Portugal
    const portugalGroup = groups.lines.getObjectByName('Portugal');

    if (portugalGroup) {
      countries.selected = portugalGroup;
      countries.selected.visible = true;
      countries.index = this.countries.indexOf('Portugal');
    } else {
      countries.selected = null;
    }
  }

  create() {
    const {connections, countries} = data;

    // Obtém as coordenadas de Portugal uma única vez
    const portugal = getCountry('Portugal', countries);
    
    if (!portugal) {
      console.error('❌ Portugal not found in countries data');
      return;
    }

    for(let origin in connections) {
      // Verifica se a origem é Portugal
      if (origin === 'Portugal') {
        const group = new THREE.Group();
        group.name = origin;

        console.log(`🔵 Creating lines from Portugal to ${connections[origin].length} destinations:`, connections[origin]);
        
        // Usa forEach com índice para garantir que cria todas as linhas, incluindo duplicadas
        connections[origin].forEach((connectionData, index) => {
          // Suporta formato antigo (string) e novo (objeto com country e slot)
          const endCountryName = typeof connectionData === 'string' ? connectionData : connectionData.country;
          const slotNumber = typeof connectionData === 'object' ? connectionData.slot : 1;
          
          console.log(`🔍 Line ${index + 1}: Portugal → ${endCountryName} (Slot ${slotNumber})`);
          const end = getCountry(endCountryName, countries); // coordenadas do país de destino
          
          if (!end) {
            console.error(`❌ Destination country not found: ${endCountryName}`);
            console.log('Available countries:', countries.map(c => c.name).join(', '));
            return; // Skip this line (continue no forEach)
          }
          
          console.log(`✅ Creating line: Portugal → ${end.name} (${end.latitude}, ${end.longitude}) - Slot ${slotNumber}`);
          const line = new Line(portugal, end, slotNumber);
          
          // Adiciona identificador único para cada linha (importante para linhas duplicadas)
          line.mesh.name = `line-${origin}-${endCountryName}-${index}`;
          
          elements.lines.push(line.mesh);
          group.add(line.mesh);
        });

        console.log(`✅ Total lines created in group: ${group.children.length}`);
        group.visible = true; // Portugal line always visible
        groups.lines.add(group);
      }
    }
  }
}

class Line {
  constructor(start, end, slotNumber = 1) {
    const {globe} = config.sizes;
    const {markers} = config.scale;

    // Usa as coordenadas de Portugal passadas como start
    this.start = start;
    this.end = end;
    this.slotNumber = slotNumber;

    this.radius = globe + globe * markers;

    this.curve = this.createCurve();

    this.geometry = new THREE.Geometry();
    this.geometry.vertices = this.curve.getPoints(200);
    this.material = this.createMaterial();

    this.line = new MeshLine();
    this.line.setGeometry(this.geometry);

    this.mesh = new THREE.Mesh(this.line.geometry, this.material);
    this.mesh._path = this.geometry.vertices;
  }

  createCurve() {
    const {start, end, mid1, mid2} = getSplineFromCoords(
      this.start.latitude,
      this.start.longitude,
      this.end.latitude,
      this.end.longitude,
      this.radius
    );

    return new THREE.CubicBezierCurve3(start, mid1, mid2, end);
  }

  createMaterial() {
    // Busca a cor do slot no chartConfig (se disponível)
    let lineColor = config.colors.globeLines; // Cor padrão
    
    if (typeof chartConfig !== 'undefined' && chartConfig.colors && chartConfig.colors.slotColors) {
      const slotColorIndex = this.slotNumber - 1; // Slot 1 = index 0
      if (chartConfig.colors.slotColors[slotColorIndex]) {
        lineColor = chartConfig.colors.slotColors[slotColorIndex];
        console.log(`🎨 Line color for Slot ${this.slotNumber}: ${lineColor}`);
      }
    }
    
    return new MeshLineMaterial({
      color: lineColor,
      transparent: true,
      opacity: 0.45
    });
  }
}

/*class Line {
	constructor(start, end) {
		const {globe} = config.sizes;
		const {markers} = config.scale;

		this.start = start;
		this.end = end;
		this.radius = globe + globe * markers;
		
		this.curve = this.createCurve();

		this.geometry = new THREE.Geometry();
		this.geometry.vertices = this.curve.getPoints(200);
		this.material = this.createMaterial();

		this.line = new MeshLine();
		this.line.setGeometry(this.geometry);
		
		this.mesh = new THREE.Mesh(this.line.geometry, this.material);
		this.mesh._path = this.geometry.vertices;
	}

	createCurve() {
		const {start, end, mid1, mid2} = getSplineFromCoords(
			this.start.latitude,
			this.start.longitude,
			this.end.latitude,
			this.end.longitude,
			this.radius
		);

		return new THREE.CubicBezierCurve3(start, mid1, mid2, end)
	}*/