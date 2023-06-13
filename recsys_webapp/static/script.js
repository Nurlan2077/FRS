
url = "https://bba57toohthp5vs3mb94.containers.yandexcloud.net/";
//url = "http://127.0.0.1:80/";

let random_images = fetch(url + "random_images").then(response => response.json());

let gen_rec_button = null

window.onload = function(){
    gen_rec_button = document.getElementById('genrec');
    gen_rec_button.addEventListener("click", get_collab_recommendations)

    const openModalButtons = document.querySelectorAll('[data-modal-target]')
    const closeModalButtons = document.querySelectorAll('[data-close-button]')
    const overlay = document.getElementById('overlay')

    openModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = document.querySelector(button.dataset.modalTarget)
            openModal(modal)
        })
    })



    closeModalButtons.forEach(button => {
      button.addEventListener('click', () => {
        const modal = button.closest('.modal')
        closeModal(modal)
      })
    })

    overlay.addEventListener('click', () => {
      const modals = document.querySelectorAll('.modal.active')
      modals.forEach(modal => {
        closeModal(modal)
      })
    })
}

image_ids = []
rating_values = []

var xhr_random_images = new XMLHttpRequest();

xhr_random_images.open('GET', url + 'random_images');

xhr_random_images.responseType = 'json';

xhr_random_images.onload = function(){
    display_images(xhr_random_images)
}

xhr_random_images.send();


function display_images(xhr) {
    var imagesContainer = document.getElementById('images-container');
    gen_rec_button = document.getElementById('genrec');


    imagesContainer.innerHTML = ""
    if (xhr.status === 200) {
        var randomImages = xhr.response.images;

        // Проходит по каждому изображению.
        for (var imageName in randomImages) {
            if (randomImages.hasOwnProperty(imageName)) {
                var imgElement = document.createElement('img');
                image_ids.push(imageName)
                encoded_image = randomImages[imageName]
                imgElement.src = 'data:image/png;base64,' + encoded_image.substring(2, encoded_image.length - 1);

                // Добавляет поле для оценки.
                var ratingDiv = document.createElement('div');
                ratingDiv.className = 'rating';
                var ratingInput = document.createElement('input');
                ratingInput.type = 'number';
                ratingInput.min = 0;
                ratingInput.max = 5;
                ratingInput.value = 5;
                imagesContainer.appendChild(ratingDiv);
                ratingDiv.appendChild(ratingInput);

                imagesContainer.appendChild(imgElement);
            }
        }
    } else {
        console.error(xhr.statusText);
    }
};


function display_recommended_images(xhr) {
    var imagesContainer = document.getElementById('images-container');

    imagesContainer.innerHTML = ""
    if (xhr.status === 200) {
        var randomImages = xhr.response.images;

        // Проходит по каждому изображению.
        for (var imageName in randomImages) {

            if (randomImages.hasOwnProperty(imageName)) {
                var imgElement = document.createElement('img');
                imgElement.id = imageName
            }

            image_ids.push(imageName)
            encoded_image = randomImages[imageName]
            imgElement.src = 'data:image/png;base64,' + encoded_image.substring(2, encoded_image.length - 1);

            imagesContainer.appendChild(imgElement);


            imgElement.addEventListener('click', function(){
                get_content_recommendations(this.id)

                const modal = document.getElementById("modal")
                openModal(modal)
            })
        }
    }
    else {
        console.error(xhr.statusText);
    }
};


function get_collab_recommendations(){
    var ratingInputs = document.querySelectorAll('#images-container input[type="number"]');
    for(var i=0; i<ratingInputs.length; i++){
        rating_values.push(ratingInputs[i].value);
    }

    images_and_ratings = {}
    image_ids.forEach((key, i) => images_and_ratings[key] = rating_values[i])

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url + "collab_recommendations");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.responseType = 'json';

    xhr.onload = function() {
      if (xhr.status === 200) {
            display_recommended_images(xhr)
      }
    };
    console.log(JSON.stringify(images_and_ratings))
    xhr.send(JSON.stringify(images_and_ratings));
}

function get_content_recommendations(image_name){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url + "content_recommendations");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.responseType = 'json';

    xhr.onload = function() {
      if (xhr.status === 200) {
//            display_recommended_images(xhr)
        fill_modal(xhr)
      }
    };

    xhr.send(JSON.stringify({"image": image_name}));
}

function openModal(modal) {
  if (modal == null) return
  modal.classList.add('active')
  overlay.classList.add('active')
}

function closeModal(modal) {
  if (modal == null) return
  modal.classList.remove('active')
  overlay.classList.remove('active')
}

function fill_modal(xhr){
    var imagesContainer = document.getElementById('similar-images-container');

    imagesContainer.innerHTML = ""
    if (xhr.status === 200) {
        var randomImages = xhr.response.images;

        // Проходит по каждому изображению.
        for (var imageName in randomImages) {
            if (randomImages.hasOwnProperty(imageName)) {
                var imgElement = document.createElement('img');
                imgElement.id = imageName
            }

            image_ids.push(imageName)
            encoded_image = randomImages[imageName]
            imgElement.src = 'data:image/png;base64,' + encoded_image.substring(2, encoded_image.length - 1);

            imagesContainer.appendChild(imgElement);

            imgElement.addEventListener('click', function(){
                const modal = document.getElementById("modal")
                openModal(modal)
            })
        }
    }
    else {
        console.error(xhr.statusText);
    }
}




