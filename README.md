# Large Lots

The City of Chicago is selling lots in Englewood for $1 until April 21, 2014. Here's how you get one.

## Configuring and running locally

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

## Data

Our map was built using open data from Chicago and Cook County:

* [Chicago - City Owned Land Inventory](https://data.cityofchicago.org/Community-Economic-Development/City-Owned-Land-Inventory/aksk-kvfp)
* [Chicago - Wards](https://data.cityofchicago.org/Facilities-Geographic-Boundaries/Boundaries-Wards/bhcv-wqkf)
* [Cook County - 2012 Parcels](https://datacatalog.cookcountyil.gov/GIS-Maps/ccgisdata-Parcel-2012/e62c-6rz8)

## Dependencies
We used the following open source tools:

* [QGIS](http://www.qgis.org/en/site/) - graphic information system (GIS) desktop application
* [PostGIS](http://postgis.net/) - geospatial database
* [Bootstrap](http://getbootstrap.com/) - Responsive HTML, CSS and Javascript framework
* [Leaflet](http://leafletjs.com/) - javascript library interactive maps
* [jQuery Address](https://github.com/asual/jquery-address) - javascript library creating RESTful URLs

## Team

* Demond Drummer - idea, content, outreach
* Derek Eder - developer, content
* Eric van Zanten - developer, GIS data merging
* Forest Gregg - process design, content

## Contributors

* Aya O'Connor - logo
* Juan-Pablo Velez - content


## Errors / Bugs

If something is not behaving intuitively, it is a bug, and should be reported.
Report it here: https://github.com/datamade/englewood-large-lots/issues

## Note on Patches/Pull Requests
 
* Fork the project.
* Make your feature addition or bug fix.
* Commit, do not mess with rakefile, version, or history.
* Send me a pull request. Bonus points for topic branches.

## Copyright

Copyright (c) 2014 DataMade and LISC Chicago. Released under the [MIT License](https://github.com/datamade/large-lots/blob/master/LICENSE).
