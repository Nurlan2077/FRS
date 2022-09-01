import * as THREE from 'three';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { randInt } from 'three/src/math/MathUtils';


export class ClothesManager{
    static clothes = [];



    createClothesItem(modelPath, texturePath, position, scale = (1, 1, 1)){
        return new Promise(function(resolve, reject){
          var loader = new OBJLoader();  
          
          loader.load( modelPath,
              // Запускается по завершении загрузки модели.
              function( obj ){
                  obj.traverse( function( child ) {
                      if ( child instanceof THREE.Mesh ) {
                          child.material = new THREE.MeshStandardMaterial({
                            map: new THREE.TextureLoader().load(texturePath),
                          });
                      
                      }
                  } );
                
                  obj.scale.set(scale[0], scale[1], scale[2])
                
                  obj.position.x = position[0]
                  obj.position.z = position[1]
                  obj.position.y = position[2]
      
                  resolve(obj)
              },
              function( xhr ){
                  console.log( (xhr.loaded / xhr.total * 100) + "% loaded")
              },
              function( err ){
                  console.error( err)
                  reject(err)
              }
          );
        })
      
      }


      loadAllClothes(scene){

        (async () => {
            let DB = await(await fetch('clothes_data.json')).json();

            for (let i in DB){
                console.log(DB[i]["model_path"])
                this.createClothesItem(DB[i]["model_path"],
                                       DB[i]["texture_path"],
                                       DB[i]["position"],
                                       DB[i]["scale"])
                                       .then(
                                        function(a){
                                            scene.add(a)
                                            a.rotation.y = randInt(-120, 120)
                                            ClothesManager.clothes.push(a)
                                        }
                                       )

            }

        })();
      }

}
