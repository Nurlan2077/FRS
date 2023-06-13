FROM python:3.10-slim

WORKDIR /clothes_recsys
COPY requirements.txt .

RUN apt-get update && \
    apt-get install -y gcc g++ && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

CMD [ "python", "index.py" ]
