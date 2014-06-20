# Large Lots data preparation scripts

There are a few pieces of work that need to me done in advance of running the
normal Django setup process. The first part has to do with preparing the data
from the City of Chicago’s data portal so that it is useable by this
application. The other part has to do with preparing data that can be used by
CartoDB (since the map on the client is driven by that).

* Need to prepare a shapefile containing all of the parcels that are city owned
and in the program area

* Need to prepare a file containing all of the PINs and their addresses within
the program area. This does not need to have any geospatial component but will
merely serve as a way to validate user input.


