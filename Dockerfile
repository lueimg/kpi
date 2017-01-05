FROM debian:jessie
# FROM ubuntu:16.04
#MAINTAINER Thomas Bisignani <contact@thomasbisignani.com>
# FROM wnameless/oracle-xe-11g
RUN apt-get update
RUN apt-get -y upgrade

# Install Apache2 / PHP 5.6 & Co.
RUN apt-get -y install vim git apache2 php5 libapache2-mod-php5 php5-dev php-pear php5-curl curl libaio1
# RUN apt-get -y install vim git apache2 php libapache2-mod-php php-mcrypt php-dev php-pear php-curl curl libaio1
# https://hub.docker.com/r/angeliski/docker-slim-custom/~/dockerfile/
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
# Install the Oracle Instant Client
ADD oracle/oracle-instantclient12.1-basic_12.1.0.2.0-2_amd64.deb /tmp
ADD oracle/oracle-instantclient12.1-devel_12.1.0.2.0-2_amd64.deb /tmp
ADD oracle/oracle-instantclient12.1-sqlplus_12.1.0.2.0-2_amd64.deb /tmp
RUN dpkg -i /tmp/oracle-instantclient12.1-basic_12.1.0.2.0-2_amd64.deb
RUN dpkg -i /tmp/oracle-instantclient12.1-devel_12.1.0.2.0-2_amd64.deb
RUN dpkg -i /tmp/oracle-instantclient12.1-sqlplus_12.1.0.2.0-2_amd64.deb
RUN rm -rf /tmp/oracle-instantclient12.1-*.deb

#Set up the Oracle environment variables
ENV LD_LIBRARY_PATH /usr/lib/oracle/12.1/client64/lib/
ENV ORACLE_HOME /usr/lib/oracle/12.1/client64/lib/

# Install the OCI8 PHP extension
RUN echo 'instantclient,/usr/lib/oracle/12.1/client64/lib' | pecl install -f oci8-2.0.8
RUN echo "extension=oci8.so" > /etc/php5/apache2/conf.d/30-oci8.ini

# Enable Apache2 modules
RUN a2enmod rewrite

# Set up the Apache2 environment variables
ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_LOG_DIR /var/log/apache2
ENV APACHE_LOCK_DIR /var/lock/apache2
ENV APACHE_PID_FILE /var/run/apache2.pid

EXPOSE 22
EXPOSE 80
EXPOSE 1521


# Set up the volumes and working directory
VOLUME ["/var/www/html"]

# Run Apache2 in Foreground
CMD /usr/sbin/apache2 -D FOREGROUND
WORKDIR /var/www/html

#https://hub.docker.com/r/thomasbisignani/docker-apache-php-oracle/

# docker run -p 5555:80 -p 49145:22 -p 49555:1521 --name oraclephpclient  -d -v `pwd`:/var/www/html  
# docker run -d -p 49170:22 -p 49171:1521 -p 49172:8080 -e ORACLE_ALLOW_REMOTE=true --name oracle11 wnameless/oracle-xe-11g


### oraclephpclient
# docker build . -t oraclephpclient
# docker run -p 5555:80 -p 49555:1521 --name oraclephpclient  -d -v `pwd`:/var/www/html  oraclephpclient
# docker run -p 5555:80 -p 49555:1521   -d -v `pwd`:/var/www/html  
# docker  exec -it oraclephp /bin/bash

### oracledb
# docker run -d -p 49166:8080 -p 49161:1521 --name oracledb  -e ORACLE_ALLOW_REMOTE=true wnameless/oracle-xe-11g
# docker run -d -p 49166:8080 -p 1521:1521 --name oracledb  -e ORACLE_ALLOW_REMOTE=true wnameless/oracle-xe-11g

# http://0.0.0.0:49166/apex/
# internal, admin, oracle


# https://hub.docker.com/r/wnameless/oracle-xe-11g/
# hostname: localhost
# port: 49161
# sid: xe
# username: system
# password: oracle
# Password for SYS & SYSTEM

# oracle
# Login by SSH

# ssh root@localhost -p 49160
# password: admin
# Support custom DB Initialization
