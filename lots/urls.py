from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'lots_client.views.home', name='home'),
    url(r'^status/$', 'lots_client.views.status', name='status'),
    url(r'^apply/$', 'lots_client.views.apply', name='apply'),
    url(r'^faq/$', 'lots_client.views.faq', name='faq'),
    url(r'^about/$', 'lots_client.views.about', name='about'),
    url(r'^lots-admin/$', 'lots_admin.views.lots_admin', name='lots_admin'),

    url(r'^django-admin/', include(admin.site.urls)),
)
