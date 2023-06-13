from flask import Flask, request, render_template
import numpy as np
import base64
from itertools import chain
import sqlite3
import pandas as pd
import os

from collaborative_filtering import get_collab_recommendations
from content_filtering import init_annoy_tree, get_similar_images, get_content_embedding


app = Flask(__name__)

IMAGE_RESOURCES_PATH = "static/images/"

USER_ID = 0
USER_ID_FILEPATH = "last_user_id.txt"

IMAGE_IDS = []
IMAGE_IDS_PATH = IMAGE_RESOURCES_PATH + "list_category_img.txt"


COLLAB_PATH = "collab_filtering/"
clothes = pd.read_csv(COLLAB_PATH + "clothes.csv")


# Считывает все идентификаторы изображений

DB_PATH = "user_ratings.db"
db_conn = sqlite3.connect(DB_PATH)
cursor = db_conn.cursor()
cursor.execute("SELECT DISTINCT image_id FROM ratings")

results = cursor.fetchall()
IMAGE_IDS = np.array(list(chain(*results)))


db_conn.commit()
cursor.close()
db_conn.close()


@app.route("/")
def index():
    return render_template('index.html')


@app.route("/random_images")
def get_random_images():
    random_images = np.random.choice(IMAGE_IDS, 10)

    output = {}

    for random_image in random_images:
        with open(IMAGE_RESOURCES_PATH + random_image, "rb") as image_file:
            output[random_image] = str(base64.b64encode(image_file.read()))

    return {"images": output}


@app.route("/collab_recommendations", methods=["POST"])
def collab_recommendations():
    recommendations = get_collab_recommendations(request.json)
    output = {}

    for recommendation in recommendations:
        with open(IMAGE_RESOURCES_PATH + recommendation, "rb") as image_file:
            output[recommendation] = str(base64.b64encode(image_file.read()))

    return {"images": output}


@app.route("/content_recommendations", methods=["POST"])
def content_recommendations():
    output = {}

    image_embedding = get_content_embedding(IMAGE_RESOURCES_PATH + request.json["image"])
    similar_images = get_similar_images(annoy_tree, image_embedding)

    for image in similar_images:
        with open(IMAGE_RESOURCES_PATH + image, "rb") as image_file:
            output[image] = str(base64.b64encode(image_file.read()))

    return {"images": output}


if __name__ == "__main__":
    annoy_tree = init_annoy_tree()
    # app.run(host='0.0.0.0', port=os.environ['PORT'])
    app.run(host='0.0.0.0', port=80)


