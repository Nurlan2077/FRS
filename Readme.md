# Рекомендательная система для подбора одежды

# Fashion Recommendation System

В папке [recsys_webapp](https://github.com/Nurlan2077/FRS/tree/main/recsys_webapp "recsys_webapp") представлено веб-приложение для генерации рекомендаций коллаборативной фильтрацией. Для рекомендованных изображений проводится поиск похожих изображений по нажатию на рекомендованную одежду. В папке содержится dockerfile для контейнеризации и для деплоя приложения на хостинге с поддержкой контейнеров. Все веб-приложения были развернуты на Yandex Cloud Serverless Containers.
Для корректной работы требуется загрузка папки static/images, которая должна содержать в себе DeepFashion Dataset. 
В папке img должны быть изображения [скачать здесь](https://drive.google.com/uc?id=1j5fCPgh0gnY6v7ChkWlgnnHH6unxuAbb')
А также описательные файлы: [list_category_cloth.txt](https://drive.google.com/uc?id=0B7EVK8r0v71pWnFiNlNGTVloLUk), [list_category_img.txt](https://drive.google.com/uc?id=0B7EVK8r0v71pTGNoWkhZeVpzbFk), [list_eval_partition.txt](https://drive.google.com/uc?id=0B7EVK8r0v71pdS1FMlNreEwtc1E).
Все ссылки с официального сайта [DeepFashion Dataset](https://mmlab.ie.cuhk.edu.hk/projects/DeepFashion.html).

На текущий момент веб-приложение развернуто по [этому адресу](https://bba57toohthp5vs3mb94.containers.yandexcloud.net).

В папке [user_ratings_service](https://github.com/Nurlan2077/FRS/tree/main/user_ratings_service "user_ratings_service") представлено веб-приложение для сбора оценок пользователей и dockerfile для контейнеризации.

В репозитории [MovieRecommender](https://github.com/Nurlan2077/MovieRecommender "MovieRecommender") представлен файл для обучения Factorization Machines для матричной факторизации данных оценок пользователей фильмов для генерации рекомендаций коллаборативной фильтрацией.
В файле [clothes_recsys_train.ipynb](https://github.com/Nurlan2077/FRS/blob/main/recsys_webapp/collab_filtering/clothes_recsys_train.ipynb) представлен тот же метод обучения, но на собранных данных --- оценках одежды студентами.

В папке [content-search](https://github.com/Nurlan2077/FRS/tree/main/content-search "content-search") представлен файл для fine-tune ResNet18 модели для получения векторного представления изображения.

# API Генерации Рекомендаций
Сервер написан на Flask, в [index.py](https://github.com/Nurlan2077/FRS/blob/main/recsys_webapp/index.py) содержатся все вызовы. Перед началом работы сервера автоматически загружаются все ресурсы: модель коллаборативной фильтрации, модель контентной фильтрации, а также строится дерево Annoy для поиска по векторам изображений.

## Random images

Вызов API для получения 10 случайных изображений из датасета для первоначальной оценки для коллаборативной фильтрации.

```http
GET /random_images
```

Параметры не требуются.

## Ответ вызова

Возвращается JSON объект со списком изображений и их base64 представления.

```javascript
{
  "images" : { 
	  "image_id_1": base64_string,
	  ...
	  "image_id_N": base64_string,
  }
}
```

## Коллаборативная фильтрация

Вызов API для получения 10 рекомендованных изображений коллаборативной фильтрацией.

```http
POST /collab_recommendations
```

| Параметр | Тип | Описание |
| :--- | :--- | :--- |
| `images` | `Map` | **Обязательный**. Представляет собой словарь вида: 
```javascript
{
"image_id_1": int,
...
"image_id_N": int
}
```


## Ответ вызова

Возвращается JSON объект со списком рекомендованных изображений и их base64 представления.

```javascript
{
  "images" : { 
	  "image_id_1": base64_string,
	  ...
	  "image_name_N": base64_string,
  }
}
```

Реализация методов коллаборативной фильтрации представлена в файле [collab_filtering](https://github.com/Nurlan2077/FRS/tree/main/recsys_webapp/collab_filtering)

## Контентная фильтрация

Вызов API для получения 10 похожих изображений контентной фильтрацией.

```http
POST /content_recommendations
```

| Параметр | Тип | Описание |
| :--- | :--- | :--- |
| `images` | `Map` | **Обязательный**. Представляет собой словарь вида: 
```javascript
{
"image": "image_id"
}
```

## Ответ вызова

Возвращается JSON объект со списком похожих изображений и их base64 представления.

```javascript
{
  "images" : { 
	  "image_id_1": base64_string,
	  ...
	  "image_name_N": base64_string,
  }
}
```

Все методы для работы с контентной фильтрацией представлены в файле [content_filtering.py](https://github.com/Nurlan2077/FRS/blob/main/recsys_webapp/content_filtering.py)
