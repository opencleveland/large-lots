from django.db import models
import time

class Address(models.Model):
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=20, default='Chicago')
    state = models.CharField(max_length=20, default='IL')
    zip_code = models.CharField(max_length=10, null=True)

    def __unicode__(self):
        return '%s %s, %s %s' % \
            (self.street, self.city, self.state, self.zip_code)

def upload_name(instance, filename):
    now = int(time.time())
    return 'deeds/%s-%s-%s_%s' % \
        (instance.first_name, instance.last_name, now, filename)

class Application(models.Model):
    first_name = models.CharField(max_length=255, null=True)
    last_name = models.CharField(max_length=255, null=True)
    organization = models.CharField(max_length=255, null=True)
    owned_pin = models.CharField(max_length=14)
    owned_address = models.ForeignKey(Address, related_name='owned_address')
    deed_image = models.FileField(upload_to=upload_name)
    contact_address = models.ForeignKey(Address, related_name='contact_address')
    phone = models.CharField(max_length=15)
    email = models.CharField(max_length=255, null=True)
    how_heard = models.CharField(max_length=255, null=True)
    tracking_id = models.CharField(max_length=40)
    status = models.CharField(max_length=50, null=True)

    def __unicode__(self):
        if self.first_name and self.last_name:
            return '%s %s' % (self.first_name, self.last_name)
        elif self.organization:
            return self.organization


class Lot(models.Model):
    pin = models.CharField(max_length=14, primary_key=True)
    address = models.ForeignKey(Address)
    application = models.ManyToManyField(Application)
    planned_use = models.CharField(max_length=20, default=None, null=True)

    def __unicode__(self):
        return self.pin
