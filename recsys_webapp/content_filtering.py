import time
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torchvision.transforms as transforms
import torchvision
from annoy import AnnoyIndex
from PIL import Image

STATIC_PATH = "content_filtering/"
# STATIC_PATH = ""

image_embeddings = pd.read_csv(STATIC_PATH + "image_embeddings.csv")

device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

# Загрузка модели.
model_load = torchvision.models.resnet18(pretrained=True)

for param in model_load.parameters():
    param.requires_grad = False

num_ftrs = model_load.fc.in_features
model_load.fc = nn.Linear(num_ftrs, 46)

model_load = model_load.to(device)
model_load.load_state_dict(torch.load(STATIC_PATH + "content_filtering_model", map_location=device))
model = model_load

# Удаляет у модели последний слой, чтобы получать признаки перед ним.
model = torch.nn.Sequential(*list(model.children())[:-1])

model.eval()


# Использует Spotify Annoy для поиска похожих по id
def get_similar_images_annoy(annoy_tree, img_index, number_of_items=12):
    start = time.time()
    img_id, img_label = image_embeddings.iloc[img_index, [0, 1]]
    similar_img_ids = annoy_tree.get_nns_by_item(img_index, number_of_items+1)
    end = time.time()
    print(f'{(end - start) * 1000} ms')

    return img_id, img_label, image_embeddings.iloc[similar_img_ids[1:]]


# Получает похожие по вектору изображения
def get_similar_images_annoy_centroid(annoy_tree, vector_value, number_of_items=12):
    start = time.time()
    similar_img_ids = annoy_tree.get_nns_by_vector(vector_value, number_of_items+1)
    end = time.time()

    # Выводит время выполнения алгоритма.
    print(f'{(end - start) * 1000} ms')

    # Первый элемент пропускается, т. к. это само изображение
    return image_embeddings.iloc[similar_img_ids[1:]]


# Возвращает векторное представление изображения.
def get_content_embedding(image_path):
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    # Загружается изображение и трансформируется.
    image = Image.open(image_path)
    image = transform(image).float()

    image = image.unsqueeze(0)
    image = image.to(device)

    # Получение признаков изображения из модели.
    embedding = model(image)

    return embedding.flatten().cpu().numpy()


def centroid_embedding(outfit_embedding_list):
    number_of_outfits = outfit_embedding_list.shape[0]
    length_of_embedding = outfit_embedding_list.shape[1]
    centroid = []
    for i in range(length_of_embedding):
        centroid.append(np.sum(outfit_embedding_list[:, i])/number_of_outfits)
    return centroid


def init_annoy_tree():
    # Больше деревьев даст большее приближение.
    ntree = 100

    # Также доступны: "angular", "euclidean", "manhattan", "hamming", "dot"
    metric_choice = 'angular'

    annoy_tree = AnnoyIndex(512, metric=metric_choice)

    for i, vector in enumerate(image_embeddings['embedding']):
        vector = vector.strip('[]').split()
        vector = np.fromstring(' '.join(vector), dtype=np.float32, sep=' ')

        annoy_tree.add_item(i, vector)

    _ = annoy_tree.build(ntree)

    return annoy_tree


# Находит похожие изображения по дереву и по идетификатору исходного.
def get_similar_images(annoy_tree, vector):
    outfit_embedding_list = []
    outfit_embedding_list.append(vector)

    outfit_embedding_list = np.array(outfit_embedding_list)
    outfit_centroid_embedding = centroid_embedding(outfit_embedding_list)

    similar_images_df = get_similar_images_annoy_centroid(annoy_tree, outfit_centroid_embedding, 10)
    return list(similar_images_df["image_path"])


def get_image_id_by_name(name):
    return image_embeddings[image_embeddings["image_path"] == name].index.values[0]
