import * as THREE from 'three';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';


export class ClothesManager{
    clothes = [];

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
        
      }

}
