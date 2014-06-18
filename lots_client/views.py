from django.shortcuts import render
from django import forms
from lots_admin.models import Lot

class ApplicationForm(forms.Form):
    lot_1_address = forms.CharField()
    lot_1_pin = forms.CharField()
    lot_1_use = forms.ChoiceField(choices=Lot.USE_CHOICES, required=False)
    lot_2_address = forms.CharField()
    lot_2_pin = forms.CharField()
    lot_2_use = forms.ChoiceField(choices=Lot.USE_CHOICES)
    owned_address = forms.CharField()
    owned_pin = forms.CharField()
    deed_image = forms.FileField()
    first_name = forms.CharField()
    last_name = forms.CharField()
    organization = forms.CharField(required=False)
    phone = forms.CharField()
    email = forms.CharField(required=False)
    contact_street = forms.CharField()
    contact_city = forms.CharField()
    contact_state = forms.CharField()
    contact_zip_code = forms.CharField()
    how_heard = forms.CharField(required=False)

def home(request):
    return render(request, 'index.html')

def apply(request):
    if request.method == 'POST':
        print request.POST
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
