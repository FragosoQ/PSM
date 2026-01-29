class Marker {
  constructor(material, geometry, label, cords, {
    textColor = 'white',
    pointColor = config.colors.globeMarkerColor,
    glowColor = config.colors.globeMarkerGlow,
    countryName = ''
  } = {}) {
    this.material = material;
    this.geometry = geometry;
    this.labelText = label;
    this.cords = cords;
    this.countryName = countryName;

    this.isAnimating = false;

    this.textColor = textColor;
    this.pointColor = new THREE.Color(pointColor);
    this.glowColor = new THREE.Color(glowColor);

    this.group = new THREE.Group();
    this.group.name = 'Marker';

    this.createLabel();
    this.createPoint();
    this.createGlow();
    this.setPosition();

    groups.markers.add(this.group);
  }

  createLabel() {
    // Create label for Portugal and all destination countries
    const countryUpper = this.countryName.toUpperCase();
    
    // Check if this is Portugal (origin)
    const isPortugal = countryUpper === 'PORTUGAL';
    
    // Check if this is one of the destinations
    let isDestination = false;
    if (data.connections && data.connections.Portugal) {
      isDestination = data.connections.Portugal.some(dest => {
        // Suporta formato antigo (string) e novo (objeto com country e slot)
        const destCountry = typeof dest === 'string' ? dest : dest.country;
        return destCountry.toUpperCase() === countryUpper;
      });
    }
    
    // Only create label if Portugal or a destination
    if (!isPortugal && !isDestination) {
      this.label = null;
      return;
    }

    // Abreviaturas para países com nomes extensos
    const countryAbbreviations = {
      'UNITED STATES': 'USA',
      'UNITED KINGDOM': 'UK',
      'SOUTH AFRICA': 'SOUTH AFRICA',
      'SAUDI ARABIA': 'SAUDI ARABIA',
      'UNITED ARAB EMIRATES': 'UAE',
      'DOMINICAN REPUBLIC': 'DOM. REP.',
      'CZECH REPUBLIC': 'CZECHIA',
      'CENTRAL AFRICAN REPUBLIC': 'C.A.R.',
      'BOSNIA AND HERZEGOVINA': 'BOSNIA',
      'TRINIDAD AND TOBAGO': 'TRINIDAD',
      'ANTIGUA AND BARBUDA': 'ANTIGUA',
      'ST. VINCENT AND THE GRENADINES': 'ST. VINCENT',
      'SAO TOME AND PRINCIPE': 'SAO TOME',
      'EQUATORIAL GUINEA': 'EQ. GUINEA',
      'PAPUA NEW GUINEA': 'PAPUA N.G.',
      'NORTH MACEDONIA': 'MACEDONIA',
      'MACAO SAR, CHINA': 'MACAU',
      'HONG KONG SAR, CHINA': 'HONG KONG'
    };
    
    // Use abbreviation if available, otherwise use original name
    const displayName = countryAbbreviations[countryUpper] || this.labelText;

    const text = this.createText(displayName);
    const texture = new THREE.Texture(text);
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    textures.markerLabels.push(texture);

    const material = new THREE.SpriteMaterial()
    material.map = texture;
    material.depthTest = false;
    material.useScreenCoordinates = false;

    this.label = new THREE.Sprite(material);
    this.label.scale.set( 40, 20, 1 );
    this.label.center.x = 0.5;
    this.label.translateY(2);
    this.label.renderOrder = 999;

    this.group.add(this.label);
    elements.markerLabel.push(this.label);
  }

  createPoint() {
    this.point = new THREE.Mesh( this.geometry, this.material );
    this.point.material.color.set(this.pointColor);
    this.group.add(this.point);
    elements.markerPoint.push(this.point);
  }

  createGlow() {
    // Ripple effects disabled for all markers
    this.glow = null;
  }

  animateGlow() {
    // Glow animation (disabled for all markers)
    if(!this.glow) {
      return;
    }

    if(!this.isAnimating) {
      if(Math.random() > 0.99) {
        this.isAnimating = true;
      }
    } else if(this.isAnimating) {
      this.glow.scale.x += 0.025;
      this.glow.scale.y += 0.025;
      this.glow.scale.z += 0.025;
      this.glow.material.opacity -= 0.005;

      if(this.glow.scale.x >= 4) {
        this.glow.scale.x = 1;
        this.glow.scale.y = 1;
        this.glow.scale.z = 1;
        this.glow.material.opacity = 0.6;
        this.glow.isAnimating = false;
      }
    }
  }

  setPosition() {
    const {x, y, z} = this.cords
    this.group.position.set(-x, y, -z)
  }

  createText(labelText = this.labelText) {
    const element = document.createElement('canvas');
    const canvas = new fabric.Canvas(element);

    const text = new fabric.Text(labelText, {
      left: 10, 
      top: 5, 
      fill: 'black', 
      fontFamily: 'Open Sans',
      fontSize: 54
    });

    // Create a rounded rectangle background
    const padding = 8;
    const rect = new fabric.Rect({
      left: 0,
      top: 0,
      width: text.width + padding * 2,
      height: text.height + padding * 2,
      fill: 'rgba(255, 255, 255, 0.85)',
      rx: 8,
      ry: 8
    });

    // Position text with padding
    text.left = padding;
    text.top = padding;

    canvas.add(rect);
    canvas.add(text);
    return element;
  }
}