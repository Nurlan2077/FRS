import './style.css'

import * as THREE from 'three';

//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75,                                    // Видимость мира в градусах.
                                          window.innerWidth / window.innerHeight, // Соотношение сторон пользователя.
                                          0.1,                                    // Область видимости (ближайшая). 
                                          1000);                                  // Область видиости (дальнейшая).

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

camera.position.setZ(30);

renderer.render(scene, camera)

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshStandardMaterial({color: 0xFF3467});
const torus = new THREE.Mesh(geometry, material);

scene.add(torus)

const pointLight = new THREE.PointLight(0xFFFFFF)
pointLight.position.set(5, 5, 5)

const ambientLight = new THREE.AmbientLight(0xFFFFFF);

scene.add(pointLight, ambientLight)

const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(lightHelper, gridHelper);


//const controls = new OrbitControls(camera, renderer.domElement);

function addStar(){
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff})
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
  scene.add(star);

}

// Заполнение сцены звездами.
Array(200).fill().forEach(addStar);

const spaceTexture = new THREE.TextureLoader().load('images/space_texture.jpg');
scene.background = spaceTexture;


const myFaceTexture = new THREE.TextureLoader().load('images/nurlan.jpg')

const myFaceCube = new THREE.Mesh(
  new THREE.BoxGeometry(3, 3, 3),
  new THREE.MeshBasicMaterial({map: myFaceTexture})
)

scene.add(myFaceCube);

const marsTexture = new THREE.TextureLoader().load('images/mars.jpg')
const marsNormalTexture = new THREE.TextureLoader().load('images/normal.jpg')

const mars = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({
    map: marsTexture,
    normalMap: marsNormalTexture
  })
);

scene.add(mars)


mars.position.z = 30
mars.position.x = -10;

function moveCamera(){
  const rangeFromTop = document.body.getBoundingClientRect().top;

  mars.rotation.x += 0.05;
  mars.rotation.y += 0.075;
  mars.rotation.z += 0.05;

  myFaceCube.rotation.y += 0.01;
  myFaceCube.rotation.z += 0.01;

  camera.position.z = rangeFromTop * -0.01;
  camera.position.x = rangeFromTop * -0.0002;
  camera.position.y = rangeFromTop * -0.0002;

}

document.body.onscroll = moveCamera

function animate(){
  requestAnimationFrame(animate);

  torus.rotation.x += 0.01;
  torus.rotation.y += 0.015;
  torus.rotation.z += 0.01;

  //controls.update();

  renderer.render(scene, camera);
}

animate();