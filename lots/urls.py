from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'lots_client.views.home', name='home'),
    url(r'^status/$', 'lots_client.views.status', name='status'),
    url(r'^apply/$', 'lots_client.views.apply', name='apply'),
    url(r'^apply-confirm/(?P<tracking_id>\S+)/$', 'lots_client.views.apply_confirm', name='apply_confirm'),
    url(r'^faq/$', 'lots_client.views.faq', name='faq'),
    url(r'^about/$', 'lots_client.views.about', name='about'),
    url(r'^lots-admin/$', 'lots_admin.views.lots_admin', name='lots_admin'),
    url(r'^csv-dump/$', 'lots_admin.views.csv_dump', name='csv_dump'),
    url(r'^lots-login/$', 'lots_admin.views.lots_login', name='lots_login'),
    url(r'^logout/$', 'lots_admin.views.lots_logout', name='logout'),

    url(r'^django-admin/', include(admin.site.urls)),
)
