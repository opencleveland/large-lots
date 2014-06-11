from django.db import models

class Address(models.Model):
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=20)
    state = models.CharField(max_length=20)
    zip_code = models.CharField(max_length=10)

    def __unicode__(self):
        return '%s %s, %s %s' % \
            (self.street, self.city, self.state, self.zip_code)

class Application(models.Model):
    first_name = models.CharField(max_length=255, null=True)
    last_name = models.CharField(max_length=255, null=True)
    organization = models.CharField(max_length=255, null=True)
    owned_pin = models.CharField(max_length=14)
    owned_address = models.ForeignKey(Address)
    deed_image = models.FileField(upload_to='deeds')
    contact_address = models.ForeignKey(Address)
    phone = models.CharField(max_length=15)
    email = models.CharField(max_length=255, null=True)
    how_heard = models.CharField(max_length=255, null=True)

    def __unicode__(self):
        if self.first_name and self.last_name:
            return '%s %s' % (self.first_name, self.last_name)
        elif self.organization:
            return self.organization


class Lot(models.Model):
    USE_CHOICES = (
        (None, '------',),
        ('side_yard', 'Side lot or yard',),
        ('garage':, 'Garage',)
        ('home_expansion', 'Home expansion',),
        ('community_garden', 'Community garden',),
        ('other', 'Other',),
    )
    pin = models.CharField(max_length=14)
    address = models.ForignKey(Address)
    application = models.ManyToManyField(Application)
    planned_use = models.CharField(max_length=20,
                  choices=USE_CHOICES, default=None, null=True)

    def __unicode__(self):
        return self.pin
