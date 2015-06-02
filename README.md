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

### Data

Our map was built using data from the City of Cleveland Land Bank.


### Dependencies
We used the following open source tools:

* [QGIS](http://www.qgis.org/en/site/) - graphic information system (GIS) desktop application
* [PostGIS](http://postgis.net/) - geospatial database
* [Bootstrap](http://getbootstrap.com/) - Responsive HTML, CSS and Javascript framework
* [Leaflet](http://leafletjs.com/) - javascript library interactive maps
* [jQuery Address](https://github.com/asual/jquery-address) - javascript library creating RESTful URLs

### Data Made Contributors

* Demond Drummer - idea, content, outreach
* Derek Eder - developer, content
* Eric van Zanten - developer, GIS data merging
* Forest Gregg - process design, content
* Aya O'Connor - logo
* Juan-Pablo Velez - content

### Open Cleveland Contributors 

### Note on Patches/Pull Requests
 
* Fork the project.
* Make your feature addition or bug fix.
* Commit, do not mess with rakefile, version, or history.
* Send me a pull request. Bonus points for topic branches.

### Copyright

Copyright (c) 2015 DataMade and LISC Chicago. Released under the [MIT License](https://github.com/datamade/large-lots/blob/master/LICENSE).
