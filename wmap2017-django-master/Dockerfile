FROM python:3.4

MAINTAINER Donncha Cassidy-Hand

RUN apt-get -y update
RUN apt-get -y upgrade

RUN apt-get -y install libgdal-dev

RUN mkdir -p /usr/src/app

COPY requirements.txt /usr/src/app/
COPY . /usr/src/app

WORKDIR /usr/src/app

RUN pip install --upgrade pip
RUN pip install django
RUN pip install django_extensions django-leaflet psycopg2
RUN pip install djangorestframework djangorestframework-gis

#RUN ./manage.py migrate

RUN pip install --no-cache-dir -r requirements.txt

RUN chmod +x run.sh

EXPOSE 8000

CMD ["./run.sh"]

#CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
#CMD ["bash", "-c", "python ./manage.py migrate && python manage.py runserver 0.0.0.0:8000"]