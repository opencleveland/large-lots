# Large Lots

The City of Cleveland Land Bank sells vacant lots to homeowners for a side yard expansion. 

Large Lots enables you to find if there is a vacant lot adjacent to your property that is eligible to be purchased for a side yard expansion and to complete the Land Bank's application. 


A public website is not currently available. 

This is based on a similar project in Chicago, called [Large Lots](http://www.largelots.org) made by Data Made. 

### Errors / Bugs

If something is not behaving as you expected, it could be a bug, and should be reported in our issue tracker at https://github.com/opencleveland/large-lots/issues


## Developer Instructions

### Configuring and running locally

Clone the repo and install the requirements:

``` bash
git clone git@github.com:datamade/large-lots.git
cd large-lots
pip install -r requirements.txt
```

Setup a few Environmental variables:

``DJANGO_SECRET_KEY`` Django’s [Secret
Key](https://docs.djangoproject.com/en/1.5/ref/settings/#std:setting-SECRET_KEY)
used by the project. Can be any relatively hard to guess string.

``AWS_ACCESS_KEY`` AWS key used by the file storage mechanism to store files in
S3.

``AWS_SECRET_KEY`` The secret that goes with the key above.

``LOTS_EMAIL_HOST, LOTS_EMAIL_PORT, LOTS_EMAIL_USE_TLS, LOTS_EMAIL_HOST_USER,
LOTS_EMAIL_HOST_PASSWORD`` These are used to configure the email settings for
Django. See [Django docs](https://docs.djangoproject.com/en/1.6/topics/email/) for more info.

``SENTRY_DSN`` This is a connection string for [Sentry](http://getsentry.com)

Run the app:

```bash 
python manage.py runserver
```

navigate to http://localhost:8000/

### Running in a production environment

We used nginx and uWSGI to run Cleveland Lots. The tutorial we used is here: http://uwsgi.readthedocs.org/en/latest/tutorials/Django_and_nginx.html, but the tutorial is a little out-of-date and doesn't include every step we needed to get a production-grade web server running for our app. Below is a details walkthrough of the steps needed to get this code running on a fresh Ubuntu install (we used the Ubuntu Server 14.04 LTS image provided by Amazon Web Services).

1. install the basics: nginx, git, PostgreSQL, Python utilities, Django, uWSGI, and assorted Python/Django modules.
 * `sudo apt-get install nginx`
    * The nginx daemon starts automatically
 * `sudo apt-get install git`
    * easiest way to get the Lots code off GitHub
 * `sudo apt-get install postgresql postgresql-contrib`
    * install the SQL database.
 * `sudo apt-get install libpq-dev`
    * needed to connect psycopg2 to PostgreSQL
 * `sudo apt-get install python-dev`
    * need this to install pip
 * `sudo apt-get install python-pip`
    * need this to install the latest version of uwsgi. Also the best way to install the latest version of Django.
 * `sudo pip install Django`
 * `sudo pip install uwsgi`
 * `sudo pip install raven`
    * Django module used in our app; uWSGI won't start without it.
 * `sudo pip install psycopg2`
    * Django module used in our app which connects Django to PostgreSQL; uWSGI won't start without it.
 * `sudo pip install python-dateutil`
    * Django module used in our app; uWSGI won't start without it.

2. Pull the Lots code from GitHub onto your server.
 * We hosted the code in `/usr/share/large-lots/`. You could put it somewhere else, but you'd have to change the nginx config file to match its new location.
 * `cd /usr/share/` - cd to the directory where you'll put large-lots
 * `sudo git clone https://github.com/opencleveland/large-lots.git`
 * In the /large-lots/ folder, copy local_settings_template.txt to create a file called local_settings.py. There are some sensitive settings in there (access keys) that we can't post on GitHub. See "Configuring and running locally" for a discussion of these settings.

3. Configure PostgreSQL
 * Details to be added later.

4. Configure nginx
 * cd to the directory where you put the Lots code. Above we used /usr/share/large-lots/, so `cd /usr/share/large-lots/`
 * in /usr/share/large-lots/ create large_lots_nginx.conf. Set it up per tutorial at http://uwsgi.readthedocs.org/en/latest/tutorials/Django_and_nginx.html. We have also included our default large_lots_nginx.conf in the GitHub repo as an example; if you follow this tutorial exactly that file will work with minimal changes.
    * At the very least, you wil need to change the "Server name" setting to the domain name your server is running on. nginx will only use this configuration file if the domain in the request matches the Server Name here. For example: if this server name is set to www.example.com, but someone accesses the server using another domain name or an IP address, nginx will skip this configuration (and therefore skip the Lots app) and instead will give them the default nginx page.
 * Some important details:
    * upstream block ("django"), then server block.
    * Has separate settings for static files and dynamic applications.
    * uwsgi_pass digano; - this redirects requests that don't match the static file URLs tot the dynamic application mentioned in "upstream django"
    * include <filepath>/uwsgi_params - this file is required for uwsgi. We didn't make any changes to it, just downloaded it and used it out of the box.
 * Point nginx to the new .conf file we created
    * put a symlink in /etc/nginx/sites-enabled/ pointing to /usr/share/large-lots/large_lots_nginx.conf: `sudo ln -s /usr/share/large-lots/large_lots_nginx.conf /etc/nginx/sites-enabled/`
    * Be sure to use `sudo`, not `su -`. For some reason if you `su -` then run the command it doesn't work.

5. Run uWSGI:
 * cd to the large-lots folder (in our example, `cd /usr/share/large-lots/`, then start uwsgi like this: `uwsgi --module lots.wsgi --socket :8001`
    * lots.wsgi in that command refers to wsgi.py in the lots folder. So in this case, it refers to /large-lots/lots/wsgi.py
 * Note that uwsgi uses FastCGI instead of HTTP by default. nginx uses FastCGI to talk to uwsgi so the default is fine.
 * Ideally, you won't run this from the command line except for testing. Instead you should make a script to run uWSGI, and run that script periodically with at cron job so if the uWSGI process dies it will come back up automatically.

6. restart nginx: `sudo service nginx restart`
 * Once uWSGI is running and nginx has restarted, nginx should load your configuration and be able to serve the app.

### Data

Our map was built using data from the City of Cleveland Land Bank. The data comes from NEO CANDO's NST site: http://neocando.case.edu/nst/

### Dependencies
We used the following open source tools:

* [QGIS](http://www.qgis.org/en/site/) - graphic information system (GIS) desktop application
* [PostGIS](http://postgis.net/) - geospatial database
* [Bootstrap](http://getbootstrap.com/) - Responsive HTML, CSS and Javascript framework
* [Leaflet](http://leafletjs.com/) - javascript library interactive maps
* [jQuery Address](https://github.com/asual/jquery-address) - javascript library creating RESTful URLs

### Note on Patches/Pull Requests
 
* Fork the project.
* Make your feature addition or bug fix.
* Commit, do not mess with rakefile, version, or history.
* Send me a pull request. Bonus points for topic branches.

### Open Cleveland Contributors 

* Ariel Koiman
* Carter Wang
* Paul Koepke
* Eamon Johnson
* Raul Montejo

### Data Made Contributors (to the Chicago project)

* Demond Drummer - idea, content, outreach
* Derek Eder - developer, content
* Eric van Zanten - developer, GIS data merging
* Forest Gregg - process design, content
* Aya O'Connor - logo
* Juan-Pablo Velez - content

### Copyright

Copyright (c) 2015 DataMade and LISC Chicago. Released under the [MIT License](https://github.com/datamade/large-lots/blob/master/LICENSE).


