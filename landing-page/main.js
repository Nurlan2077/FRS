import './style.css'
import * as THREE from 'three';
import { ClothesManager } from './clothes_loader.js'


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75,                                    // Угол обзора мира.
                                          window.innerWidth / window.innerHeight, // Соотношение сторон пользователя.
                                          0.1,                                    // Область видимости (ближайшая). 
                                          1000);                                  // Область видиости (дальнейшая).

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.render(scene, camera)

const pointLight = new THREE.PointLight(0xFFFFFF)
pointLight.position.set(5, 5, 5)

const ambientLight = new THREE.AmbientLight(0xFFFFFF);

scene.add(pointLight, ambientLight)

// Для ручного пермещения камеры.
// const cameraControls = new OrbitControls(camera, renderer.domElement);

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

scene.background = new THREE.Color( 0x4676db )

const myFaceTexture = new THREE.TextureLoader().load('images/nurlan.jpg')


const myFaceCube = new THREE.Mesh(
  new THREE.BoxGeometry(3, 3, 3),
  new THREE.MeshBasicMaterial({map: myFaceTexture})
)

scene.add(myFaceCube);

let clothesManager = new ClothesManager();

// Загрузка внешних 3D-моделей.
clothesManager.loadAllClothes(scene)


// Трусы.
let pants;

clothesManager.createClothesItem(
  '/3d_models/pants/clothes005.obj', 
  "/3d_models/pants/tex_shorts_striped_anime.png",    
  [0, 0, -43],                                         
  [6, 6, 6]                                   
  )
  .then(function(a){

    pants = a

    // Позволяет трусам вращаться вокруг своей оси.
    var box = new THREE.Box3().setFromObject( a );
    box.getCenter(a.position);
    a.position.multiplyScalar(-1);
    var pivot = new THREE.Group();
    scene.add(pivot);
    pivot.add(a);
    a.children[0].geometry.center();


    scene.add(a)
    // animateClothes()
    animatePants();
  })


function moveCamera(){
  const rangeFromTop = document.body.getBoundingClientRect().top;

  myFaceCube.rotation.y += 0.01;
  myFaceCube.rotation.z += 0.01;

  for (let i = 0; i < ClothesManager.clothes.length; i++){
    ClothesManager.clothes[i].rotation.y += 0.015;
  }

  
  if (rangeFromTop < 0){
    camera.position.z = rangeFromTop * -0.01;
    camera.position.x = rangeFromTop * -0.0002;
    camera.position.y = rangeFromTop * -0.0002;
  }
}


document.body.onscroll = moveCamera


function animatePants(){
  requestAnimationFrame(animatePants);

  pants.rotation.x += 0.01;
  pants.rotation.y += 0.015;
  pants.rotation.z += 0.01;

  // cameraControls.update();

  renderer.render(scene, camera);
}


// Вращает всю одежду вокруг своей оси.
function animateClothes(){
  requestAnimationFrame(animateClothes);

  for (let i = 0; i < clothesManager.clothes.length; i++){
    clothesManager.clothes[i].rotation.y += 0.015;
  }

  renderer.render(scene, camera);
}
