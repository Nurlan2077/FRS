
url = "http://127.0.0.1:5000/";
//url = "http://192.168.1.5:5000/";

// Новый пользователь на сайте
let user_id = fetch(url + "user_id").then(response => response.json());


function set_image(){
    let image_data = fetch(url + "image").then(response => response.json())

    image_data.then(data => {
        encoded_image = data["encoded_image"];
        encoded_image = encoded_image.substring(2, encoded_image.length - 1);

        image_view = document.getElementById("rate_image")
        image_view.src = "data:image/jpg;base64," + encoded_image
    })

    return image_data
}

let image = set_image()


document.addEventListener('DOMContentLoaded', function() {
  const buttons = document.querySelectorAll('.rate_button');

  // Должен отправлять запрос на добавление оценки и загружать новое изображение
  function handleClick(event) {
    console.log(event.target.textContent);

    Promise.all([user_id, image]).then(data => {
      const postData = {
        user_id: data[0]["user_id"],
        image_id: data[1]["image_id"],
        rating: parseInt(event.target.textContent)
      };


      fetch(url + "insert_rating", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(postData)
        }).then(response => {
            console.log(response)
        });
    });

    image = set_image()
  }

  buttons.forEach(button => {
    button.addEventListener('click', handleClick);
  });
});
