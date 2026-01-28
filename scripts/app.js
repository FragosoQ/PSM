class App {
  constructor({animate, setup, preload}) {
    this.preload = preload;
    this.animate = animate;
    this.setup = setup;
    window.app = this;
  }

  init = async () => {
    this.initScene();
    this.initRenderer();
    this.initCamera();
    this.initControls();
    this.initStats();

    if(this.preload) {
      await this.preload();
    }

    this.render();
    this.update();
    
    // --- ALTERAÇÃO 1: Forçar ajuste inicial ---
    // Isto garante que o globo começa logo na posição certa sem precisares de mexer na janela
    this.handleResize();
  }

  initScene = () => {
    this.scene = new THREE.Scene();
  }

  // --- ALTERAÇÃO 2: Limpeza do CSS ---
  initRenderer = () => {
    this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    this.renderer.setClearColor(0x000000, 0.0);
    
    // REMOVIDO: left='500px' e transform. Isso estragava o mobile.
    // AGORA: Ocupa o ecrã todo. A posição do globo é controlada pela câmara.
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    
    // Ajuste de performance para mobile (evita aquecimento)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    this.renderer.shadowMap.enabled = true;
  }

  initCamera = () => {
    this.ratio = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, this.ratio, 0.1, 10000);
    this.camera.lookAt(0, 0, 0);
    this.camera.position.set(0, 15, 30);
  }

  initControls = () => {
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // Movimento mais suave
    this.controls.dampingFactor = 0.05;
    
    this.controls.autoRotate = typeof animations !== 'undefined' ? animations.rotateGlobe : false;
    this.controls.autoRotateSpeed = 0.4;
    
    const syncAutoRotate = () => {
      if(typeof animations !== 'undefined') {
        this.controls.autoRotate = animations.rotateGlobe;
      }
    };
    this.controls.addEventListener('end', syncAutoRotate);
    this.controls.addEventListener('start', syncAutoRotate);
  }

  initStats = () => {
    this.stats = new Stats();
    this.stats.setMode(0);
    try {
      const statsEl = this.stats.domElement;
      const comment = document.createComment(statsEl && statsEl.outerHTML ? statsEl.outerHTML : 'stats-canvas');
      document.body.appendChild(comment);
    } catch (e) {}
  }

  render = () => {
    this.setup(this);
    document.body.appendChild(this.renderer.domElement);
  }

  update = () => {
    this.animate(this);
    if(this.stats) this.stats.update();
    
    if (this.controls) {
      if (typeof animations !== 'undefined' && animations.rotateGlobe) {
        this.controls.autoRotate = true;
        if (typeof this.controls._state !== 'undefined') this.controls._state = -1;
      }
      this.controls.update();
    }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.update);
  }

  addControlGui = callback => {
    if (typeof dat === 'undefined') return;
    var gui = new dat.GUI();
    callback(gui);
  }

  // --- ALTERAÇÃO 3: O Segredo do Posicionamento ---
  handleResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.renderer.setSize(width, height);

    // LÓGICA:
    // Se for Desktop (>900px), empurramos o globo para a esquerda.
    // Se for Mobile, deixamos no centro.
    if (width > 900) {
        // width * 0.25 move o centro cerca de 25% para a esquerda.
        // Podes aumentar para 0.3 ou diminuir para 0.15 para ajustar a margem.
        const offset = width * 0.25; 
        this.camera.setViewOffset(width, height, offset, 0, width, height);
    } else {
        // Mobile: Reset total para o centro
        this.camera.clearViewOffset();
    }

    this.camera.updateProjectionMatrix();
  }
}