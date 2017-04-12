FROM python:3.4

MAINTAINER Donncha Cassidy-Hand

RUN apt-get -y update
RUN apt-get -y upgrade

RUN apt-get -y install libgdal-dev

RUN mkdir -p /usr/src/app

COPY requirements.txt /usr/src/app/
COPY . /usr/src/app

WORKDIR /usr/src/app

#RUN manage.py migrate

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
RUN ls

EXPOSE 8000
#CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
CMD ["bash", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]