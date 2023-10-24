FROM python:3

ENV PYTHONUNBUFFERED 1

WORKDIR /app

ADD ./web /app

COPY ./requirements.txt /app

RUN pip install -r requirements.txt

RUN python manage.py collectstatic --noinput