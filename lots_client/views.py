# -*- coding: utf-8 -*

from django.shortcuts import render
from django import forms
from lots_admin.models import Lot

class ApplicationForm(forms.Form):
    lot_1_address = forms.CharField(
        error_messages={'required': 'Provide the lot’s address'})
    lot_1_pin = forms.CharField(
        error_messages={
            'required': 'Provide the lot’s Parcel Identification Number'
        })
    lot_1_use = forms.ChoiceField(
        choices=Lot.USE_CHOICES, 
        required=False)
    lot_2_address = forms.CharField(
        error_messages={'required': 'Provide the lot’s address'})
    lot_2_pin = forms.CharField(
        error_messages={
            'required': 'Provide the lot’s Parcel Identification Number'
        })
    lot_2_use = forms.ChoiceField(
        choices=Lot.USE_CHOICES,
        required=False)
    owned_address = forms.CharField(
        error_messages={
            'required': 'Provide the address of the building you own'
        })
    owned_pin = forms.CharField(
        error_messages={
          'required': 'Provide the Parcel Identification Number of the building you own'
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

def home(request):
    return render(request, 'index.html')

def apply(request):
    if request.method == 'POST':
        form = ApplicationForm(request.POST)
        if form.is_valid():
            print 'yay'
    else:
        form = ApplicationForm()
    return render(request, 'apply.html', {'form': form})

def status(request):
    return render(request, 'status.html')

def faq(request):
    return render(request, 'faq.html')

def about(request):
    return render(request, 'about.html')
