import * as THREE from "three";
import OrbitControls from "orbit-controls-es6";

export class Application {
  constructor() {
    this.init();
    this.pyramidScene();
    this.newScene();
    this.boxes();
    this.render();
  }

  init() {
    this.container = document.getElementsByClassName("canvas-container")[0];
    this.renderer = new THREE.WebGLRenderer();

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);

    this.initCamera();
    this.scene = new THREE.Scene();
  }

  initCamera() {
    const { clientWidth, clientHeight } = this.container;
    const aspect = clientWidth / clientHeight;
    const fov = 75;
    const near = 20;
    const far = 1000;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(90, 90, 120);
    this.camera.lookAt(90, 90, 30);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = true;
    this.controls.maxDistance = 200;
    this.controls.minDistance = 80;
    this.controls.autoRotate = true;
    this.controls.maxPolarAngle = Math.PI * .42;
  }

  boxes() {
    [
      [-100, 0],
      [100, 0],
      [0, 100],
      [0, -100]
    ].forEach((cords) => {
      const [x, z] = cords;
      var material = new THREE.MeshPhongMaterial( { color: 0x4080ff, dithering: true } );
      var geometry = new THREE.BoxBufferGeometry(5,5,5);
      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, 5, z);
      mesh.castShadow = true;
      this.scene.add( mesh );
    });
  }

  newScene() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.1);
    this.scene.add(ambient);

    this.spotLight = new THREE.SpotLight(0xffffff, 1);
    this.spotLight.position.set(0, 100, 0);
    this.spotLight.angle = Math.PI * .5;
    this.spotLight.penumbra = 0.35;
    this.spotLight.decay = 3;
    this.spotLight.distance = 1000;
    this.spotLight.castShadow = true;
//    spotLight.shadow.mapSize.width = 1024;
//    spotLight.shadow.mapSize.height = 1024;
//    spotLight.shadow.camera.near = 10;
//    spotLight.shadow.camera.far = 200;
    this.scene.add(this.spotLight);

    /*
    const lightHelper = new THREE.SpotLightHelper(spotLight);
    this.scene.add(lightHelper);
    const shadowCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
    this.scene.add(shadowCameraHelper);
     */
    this.scene.add(new THREE.AxesHelper(1));
    const material = new THREE.MeshPhongMaterial( { color: 0x111111, dithering: true } );
    const geometry = new THREE.PlaneBufferGeometry(2000, 2000);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, -1, 0);
    mesh.rotation.x = -Math.PI * 0.5;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  pyramidScene() {
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      lineWidth: 5,
    });

    // Solid Pyramid
    const blockHeight = 2;
    const height = 50;
    for (let i = 0; i < height; i++) {
      const hSize = (height - i) * 2;

      if (i % 2 === 0) {
        const pyramidLineGeo = new THREE.Geometry();
        const pyramidLineMaterial = new THREE.LineBasicMaterial({ color: 0x448aff, lineWidth: 3 });
        [
          i * blockHeight,
          //(i + 1) * blockHeight
        ].forEach(y => {
          pyramidLineGeo.vertices.push(new THREE.Vector3(-hSize, y, -hSize));
          pyramidLineGeo.vertices.push(new THREE.Vector3(-hSize, y, hSize));
          pyramidLineGeo.vertices.push(new THREE.Vector3(hSize, y, hSize));
          pyramidLineGeo.vertices.push(new THREE.Vector3(hSize, y, -hSize));
          pyramidLineGeo.vertices.push(new THREE.Vector3(-hSize, y, -hSize));
          const line = new THREE.Line(pyramidLineGeo, pyramidLineMaterial);
          line.castShadow = true;
          this.scene.add(line);
        });
      }

      const cubeGeo = new THREE.BoxGeometry(hSize, blockHeight, hSize);
      const cubeMat = new THREE.MeshStandardMaterial({
        color: 0x0f77a7,
        shadowSide: THREE.FrontSide,
      });
      const cube = new THREE.Mesh(cubeGeo, cubeMat);
      cube.castShadow = true;
      cube.position.y = i * blockHeight;
      this.scene.add(cube);
    }

    // Random sparkles
    const pointsGeometry = new THREE.Geometry();
    for (let i = i; i < 300; i++) {
      const dot = new THREE.Vector3();
      dot.set(
        THREE.Math.randFloatSpread(150),
        Math.abs(THREE.Math.randFloatSpread(175)),
        THREE.Math.randFloatSpread(120)
      );

      pointsGeometry.vertices.push(dot);
    }

    const dotMaterial = new THREE.PointsMaterial({ color: 0x0077ff });
    const dotPoints = new THREE.Points(pointsGeometry, dotMaterial);
    this.scene.add(dotPoints);

    const gridHelper = new THREE.GridHelper(2000, 30, 0x000000, 0x000000);
    gridHelper.position.y = 0;
    gridHelper.position.x = 0;
    this.scene.add(gridHelper);

    /*
    const polarGridHelper = new THREE.PolarGridHelper(400, 16, 8, 64, 0x0000ff, 0x808080);
    polarGridHelper.position.y = -5;
    polarGridHelper.position.x = 0;
    this.scene.add(polarGridHelper);
     */
  }

  render() {
    this.controls.update();

    if (!this.frame) {
      this.frame = 0;
    }
    this.frame++;
    if (this.frame % Math.round(Math.random() * 95) === 0) {
      this.spotLight.position.x = Math.round(Math.random() * 200) - 100;
      this.spotLight.position.z = Math.round(Math.random() * 200) - 100;
    }

    this.renderer.render(this.scene, this.camera);
    // when render is invoked via requestAnimationFrame(this.render) there is
    // no 'this', so either we bind it explicitly or use an es6 arrow function.
    // requestAnimationFrame(this.render.bind(this));
    requestAnimationFrame(() => this.render());
  }
}
