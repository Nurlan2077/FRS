from flask import Flask, request, render_template
from itertools import chain
import numpy as np
import sqlite3
import base64

app = Flask(__name__)

IMAGE_RESOURCES_PATH = "static/images/"

USER_ID = 0
USER_ID_FILEPATH = "last_user_id.txt"

IMAGE_IDS = []
IMAGE_IDS_PATH = IMAGE_RESOURCES_PATH + "list_category_img.txt"

DB_PATH = "user_ratings.db"

# Считывает все идентификаторы изображений
with open(IMAGE_IDS_PATH, "r") as f:
    temp = []
    for i, line in enumerate(f.readlines()):
        if i > 1:
            temp.append([word.strip() for word in line.split(' ') if len(word) > 3])

    IMAGE_IDS = np.array(list(chain(*temp)))

with open(USER_ID_FILEPATH, "r") as f:
    USER_ID = int(f.read())


@app.route("/")
def index():
    return render_template('index.html')


@app.route("/user_id")
def new_user_id():
    global USER_ID
    USER_ID += 1

    with open(USER_ID_FILEPATH, 'w') as f:
        f.write(str(USER_ID))

    return {"user_id": USER_ID}


@app.route("/image")
def get_image_id():
    random_image = np.random.choice(IMAGE_IDS)

    with open(IMAGE_RESOURCES_PATH + random_image, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read())

    return {"image_id":        random_image,
            "encoded_image":   str(encoded_string)}


@app.route("/insert_rating", methods=["POST"])
def insert_rating():
    user_id = request.json["user_id"]
    image_id = request.json["image_id"]
    rating = request.json["rating"]

    insert_data_into_db(user_id, image_id, rating)

    return {"status": 200}


def insert_data_into_db(user_id, image_id, rating):
    db_conn = sqlite3.connect(DB_PATH)

    cursor = db_conn.cursor()
    insert_query = "INSERT INTO ratings (user_id, image_id, rating) VALUES (?, ?, ?)"
    data = (user_id, image_id, rating)
    cursor.execute(insert_query, data)
    db_conn.commit()

    cursor.close()
    db_conn.close()


if __name__ == "__main__":
    app.run(debug=True)