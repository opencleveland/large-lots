# -*- coding: utf-8 -*

from django.shortcuts import render
from django import forms
from lots_admin.models import Lot, Application, Address
import requests
from django.core.cache import cache
from django.http import HttpResponse, HttpResponseRedirect
import json

CARTODB = 'http://datamade.cartodb.com/api/v2/sql'

class ApplicationForm(forms.Form):
    lot_1_address = forms.CharField(
        error_messages={'required': 'Provide the lot’s address'})
    lot_1_pin = forms.CharField(
        error_messages={
            'required': 'Provide the lot’s Parcel Identification Number'
        })
    lot_1_use = forms.CharField(required=False)
    lot_2_address = forms.CharField(required=False)
    lot_2_pin = forms.CharField(required=False)
    lot_2_use = forms.CharField(required=False)
    owned_address = forms.CharField(
        error_messages={
            'required': 'Provide the address of the building you own'
        })
    deed_image = forms.FileField(
        error_messages={'required': 'Provide an image of the deed of the building you own'
        })
    first_name = forms.CharField(error_messages={'required': 'Provide your first name'})
    last_name = forms.CharField(error_messages={'required': 'Provide your last name'})
    organization = forms.CharField(required=False)
    phone = forms.CharField(error_messages={'required': 'Provide a contact phone number'})
    email = forms.CharField(required=False)
    contact_street = forms.CharField(error_messages={'required': 'Provide a complete address'})
    contact_city = forms.CharField()
    contact_state = forms.CharField()
    contact_zip_code = forms.CharField()
    how_heard = forms.CharField(required=False)
    terms = forms.BooleanField(error_messages={'required': 'Verify that you have read and agree to the terms'})

def home(request):
    return render(request, 'index.html')

def get_lot_address(address):
    add_info = {
        'street': address,
        'city': 'Chicago',
        'state': 'IL',
        'zip_code': '',
    }
    add_obj, created = Address.objects.get_or_create(**add_info)
    return add_obj

def apply(request):
    if request.method == 'POST':
        form = ApplicationForm(request.POST, request.FILES)
        context = {}
        if form.is_valid():
            l1_address = get_lot_address(form.cleaned_data['lot_1_address'])
            lot1_info = {
                'pin': form.cleaned_data['lot_1_pin'],
                'address': l1_address,
                'planned_use': form.cleaned_data.get('lot_1_use')
            }
            lot1, created = Lot.objects.get_or_create(**lot1_info)
            lot2 = None
            if form.cleaned_data.get('lot_2_pin'):
                l2_address = get_lot_address(form.cleaned_data['lot_2_address'])
                lot2_info = {
                    'pin': form.cleaned_data['lot_2_pin'],
                    'address': l2_address,
                    'planned_use': form.cleaned_data.get('lot_2_use')
                }
                lot2, created = Lot.objects.get_or_create(**lot2_info)
            c_address_info = {
                'street': form.cleaned_data['contact_street'],
                'city': form.cleaned_data['contact_city'],
                'state': form.cleaned_data['contact_state'],
                'zip_code': form.cleaned_data['contact_zip_code']
            }
            c_address, created = Address.objects.get_or_create(**c_address_info)
            owned_address = get_lot_address(form.cleaned_data['owned_address'])
            app_info = {
                'first_name': form.cleaned_data['first_name'],
                'last_name': form.cleaned_data['last_name'],
                'organization': form.cleaned_data.get('organization'),
                'owned_address': owned_address,
                'deed_image': form.cleaned_data['deed_image'],
                'contact_address': c_address,
                'phone': form.cleaned_data['phone'],
                'email': form.cleaned_data.get('email'),
                'how_heard': form.cleaned_data.get('how_heard')
            }
            app = Application(**app_info)
            app.save()
            app.lot_set.add(lot1)
            if lot2:
                app.lot_set.add(lot2)
            app.save()
            request.session['app_id'] = app.id
            return HttpResponseRedirect('/apply-confirm/')
        else:
            context['lot_1_address'] = form['lot_1_address'].value()
            context['lot_1_pin'] = form['lot_1_pin'].value()
            context['lot_1_use'] = form['lot_1_use'].value()
            context['lot_2_address'] = form['lot_2_address'].value()
            context['lot_2_pin'] = form['lot_2_pin'].value()
            context['lot_2_use'] = form['lot_2_use'].value()
            context['owned_address'] = form['owned_address'].value()
            context['deed_image'] = form['deed_image'].value()
            context['first_name'] = form['first_name'].value()
            context['last_name'] = form['last_name'].value()
            context['organization'] = form['organization'].value()
            context['phone'] = form['phone'].value()
            context['email'] = form['email'].value()
            context['contact_street'] = form['contact_street'].value()
            context['contact_city'] = form['contact_city'].value()
            context['contact_state'] = form['contact_state'].value()
            context['contact_zip_code'] = form['contact_zip_code'].value()
            context['how_heard'] = form['how_heard'].value()
            context['terms'] = form['terms'].value()
            context['form'] = form
            return render(request, 'apply.html', context)
    else:
        form = ApplicationForm()
    return render(request, 'apply.html', {'form': form})

def apply_confirm(request):
    app_id = request.session.get('app_id')
    if app_id:
        app = Application.objects.get(id=app_id)
        lots = [l.address.street for l in app.lot_set.all()]
        return render(request, 'apply_confirm.html', {'app': app, 'lots': lots})
    else:
        return HttpResponseRedirect('/apply/')

def status(request):
    return render(request, 'status.html')

def faq(request):
    return render(request, 'faq.html')

def about(request):
    return render(request, 'about.html')
