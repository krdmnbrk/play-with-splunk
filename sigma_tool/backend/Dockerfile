FROM python:alpine3.16

WORKDIR /app
COPY . .

RUN pip install --upgrade pip && \
    pip install -r requirements.txt

CMD ["python", "app.py"]