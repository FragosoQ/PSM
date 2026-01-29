
class Dots {
	constructor() {
		this.total = config.dots.total;

		groups.lineDots = new THREE.Group();
		groups.lineDots.name = 'LineDots';

		this.create();
	}

	create() {
		for(let i = 0; i < config.dots.total; i++) {
			const dot = new Dot();
			groups.lineDots.add(dot.mesh);
			elements.lineDots.push(dot);
		}
	}
}

class Dot {
	constructor() {
		// Create sprite with image texture instead of sphere
		const textureLoader = new THREE.TextureLoader();
		const texture = textureLoader.load('https://static.wixstatic.com/media/a6967f_034c4bb41e814fc7b03969408024e9a1~mv2.png');
		
		const spriteMaterial = new THREE.SpriteMaterial({
			map: texture,
			transparent: true,
			opacity: 1.0,
			color: 0xffffff, // White color to prevent any tinting
			blending: THREE.NormalBlending
		});
		
		this.mesh = new THREE.Sprite(spriteMaterial);
		this.mesh.scale.set(10, 10, 1); // Square scale to maintain aspect ratio
		this.mesh.visible = false;

		this._path = null;
		this._pathIndex = 0;
		this._lastLineIndex = -1; // Track last used line to avoid repetition
		this._recentLines = []; // Track recently used lines
	}

	assignToLine() {
		if(countries.selected) {
			const lines = countries.selected.children;
			const numLines = lines.length;
			
			if (numLines === 0) return;
			
			// If only one line, use it
			if (numLines === 1) {
				this._path = lines[0]._path;
				this._lastLineIndex = 0;
				return;
			}
			
			// For multiple lines, avoid repeating recently used ones
			let index;
			let attempts = 0;
			const maxAttempts = 10;
			
			// Try to find a line that wasn't used recently
			do {
				index = Math.floor(Math.random() * numLines);
				attempts++;
			} while (
				attempts < maxAttempts && 
				this._recentLines.includes(index) && 
				numLines > this._recentLines.length
			);
			
			const line = lines[index];
			this._path = line._path;
			this._lastLineIndex = index;
			
			// Track recent lines (keep last 3 or half of total lines, whichever is smaller)
			const maxRecent = Math.min(3, Math.floor(numLines / 2));
			this._recentLines.push(index);
			if (this._recentLines.length > maxRecent) {
				this._recentLines.shift(); // Remove oldest
			}
			
			console.log(`🎯 Dot assigned to arc ${index + 1}/${numLines} (recent: [${this._recentLines.join(', ')}])`);
		}
	}

	animate() {
		if(!this._path) {
			if(Math.random() > 0.99) {
				this.assignToLine();
				this._pathIndex = 0;
			}
		} else if(this._path && this._pathIndex < this._path.length - 1) {
			if(!this.mesh.visible) {
				this.mesh.visible = true;
			}

			const {x, y, z} = this._path[this._pathIndex];
			this.mesh.position.set(x, y, z);
			this._pathIndex += 2; // Increased from 1 to 2 for double speed
		} else {
			this.mesh.visible = false;
			this._path = null;
		}
	}
}
