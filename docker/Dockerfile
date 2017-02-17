FROM fedora:24

# FROM centos:7 
# RUN  yum -y update
# RUN  yum -y install httpd httpd-devel

# RUN \
#     yum -y install \
#     sudo \
# 	php \
# 	less \
# 	which &&\
# 	yum clean all

# RUN yum install -y vim wget libaio php-pear gcc curl-devel php-devel zlib-devel  pcre-devel

# RUN \
#         sed -i "s/short_open_tag = Off/short_open_tag = On/g" /etc/php.ini &&\
#         sed -i "s/upload_max_filesize = 2M/upload_max_filesize = 150M/g" /etc/php.ini &&\
# 	    sed -i "s/post_max_size = 8M/post_max_size = 150M/g" /etc/php.ini &&\
#         sed -i "s/#ServerName www.example.com:80/ServerName localhost:80/g" /etc/httpd/conf/httpd.conf &&\
# 	    sed -i "s/AllowOverride None/AllowOverride All/g" /etc/httpd/conf/httpd.conf


# # RUN pecl install oci8-2.0.12

# ADD oracle-basic.z /tmp
# ADD oracle-devel.z /tmp

# RUN rpm -Uvh  /tmp/oracle-basic.z
# RUN rpm -Uvh  /tmp/oracle-devel.z


# # /usr/include/oracle/12.1/client64/

# #Set up the Oracle environment variables
# ENV LD_LIBRARY_PATH /usr/lib/oracle/12.1/client64/lib/
# ENV ORACLE_HOME /usr/lib/oracle/12.1/client64/lib/

# RUN echo 'instantclient,/usr/lib/oracle/12.1/client64/lib' | pecl install -f oci8-2.0.12

# RUN pecl install oci8-2.0.12

# ADD index.php /var/www/html


# EXPOSE 80
# # EXPOSE 8080
# EXPOSE 1521

# CMD  /usr/sbin/apachectl -D FOREGROUND

# VOLUME ["/var/www/html"]

# WORKDIR /var/www/html

