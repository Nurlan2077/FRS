FROM python:3.10-slim

WORKDIR /user_ratings_service

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .


CMD [ "python", "user_ratings_server.py" ]