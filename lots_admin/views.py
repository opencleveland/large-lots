from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from lots_admin.models import Application
from datetime import datetime
import csv

def lots_login(request):
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            if user is not None:
                login(request, user)
                return HttpResponseRedirect(reverse('lots_admin.views.lots_admin'))
        else:
            print form.errors
    else:
        form = AuthenticationForm()
    return render(request, 'lots_login.html', {'form': form})

def lots_logout(request):
    logout(request)
    return HttpResponseRedirect('/')

@login_required(login_url='/lots-login/')
def lots_admin(request):
    applications = Application.objects.all()
    return render(request, 'admin.html', {'applications': applications})

@login_required(login_url='/lots-login/')
def csv_dump(request):
    response = HttpResponse(content_type='text/csv')
    now = datetime.now().isoformat()
    response['Content-Disposition'] = 'attachment; filename=Large Lots Applications %s.csv' % now
    applications = Application.objects.all()
    header = [
        'ID', 
        'Name', 
        'Organization', 
        'Owned Address', 
        'Owned PIN', 
        'Contact Address',
        'Phone', 
        'Email', 
    ]
    rows = []
    for application in applications:
        owned_address = '%s %s %s %s' % \
            (getattr(application.owned_address, 'street', ''),
             getattr(application.owned_address, 'city', ''),
             getattr(application.owned_address, 'state', ''),
             getattr(application.owned_address, 'zip_code', ''))
        contact_address = '%s %s %s %s' % \
            (getattr(application.contact_address, 'street', ''),
             getattr(application.contact_address, 'city', ''),
             getattr(application.contact_address, 'state', ''),
             getattr(application.contact_address, 'zip_code', ''))
        rows.append([
            application.id,
            '%s %s' % (application.first_name, application.last_name),
            application.organization,
            owned_address, 
            application.owned_pin,
            contact_address, 
            application.phone,
            application.email
        ])
    writer = csv.writer(response)
    writer.writerow(header)
    writer.writerows(rows)
    return response
