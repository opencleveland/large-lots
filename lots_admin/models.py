from django.db import models

class Application(models.Model):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    organization = models.CharField(max_length=255)


class Lot(models.Model):
    pin = models.CharField(max_length=14)
    address = models.CharField(max_length=255)
    application = models.ForeignKey(Application)


