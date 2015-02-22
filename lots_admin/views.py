from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from lots_admin.models import Application, Lot
from datetime import datetime
import csv
import json

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
def lots_admin_map(request):
    applied_ppns = set()
    for lot in Lot.objects.all():
        applied_ppns.add(lot.ppn)

    ppns_str = ",".join(["'%s'" % a.replace('-','').replace(' ','') for a in applied_ppns])
    return render(request, 'admin-map.html', {'applied_ppns': ppns_str})

@login_required(login_url='/lots-login/')
def lots_admin(request):
    applications = Application.objects.all()
    return render(request, 'admin.html', {'applications': applications})

@login_required(login_url='/lots-login/')
def csv_dump(request):
    response = HttpResponse(content_type='text/csv')
    now = datetime.now().isoformat()
    response['Content-Disposition'] = 'attachment; filename=Large_Lots_Applications_%s.csv' % now
    applications = Application.objects.all()
    header = [
        'ID',
        'Date received',
        'Name',
        # 'Organization',
        'Owned Address',
	'Owned Live',
	'Owned Properties',
	'Owned Properties Info',
	'Lot 1 Use',
	'Lot 1 Improvements',
	'Lot 1 Description',
	'Fencing Description',
	'Fencing Cost',
	'Landscaping Description',
	'Landscaping Cost',
	'Apron Description',
	'Apron Cost',
	'Other Description',
	'Other Cost',
        # 'Owned PPN',
        'Plan Image URL',
        'Contact Address',
        'Phone',
        'Email',
        'Received assistance',
        'Lot 1 PPN',
        'Lot 1 Address',
	'Tracking ID',
        # 'Lot 1 Plan URL',
        # 'Lot 2 PIN',
        # 'Lot 2 Address',
        # 'Lot 2 Image URL',
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
        lots = []
        for lot in application.lot_set.all():
            addr = '%s %s %s %s' % \
                (getattr(lot.address, 'street', ''),
                 getattr(lot.address, 'city', ''),
                 getattr(lot.address, 'state', ''),
                 getattr(lot.address, 'zip_code', ''))
            ppn = lot.ppn
       	    ## TODO: Replace this - Issue 18 - ASKoiman
            # image_url = 'http://cookviewer1.cookcountyil.gov/Jsviewer/image_viewer/requestImg.aspx?%s=' % pin.replace('-', '')
            # lots.extend([pin, addr, image_url])
	    lots.extend([ppn, addr])
# Issue 18--replace this - ASKoiman
#        if len(lots) < 4:
 #           lots.extend(['', '', ''])
	## TODO: Get lot_1_image working - Issue 18 - ASKoiman
        #lot_1_ppn, lot_1_addr, lot_1_image = lots
	lot_1_ppn, lot_1_addr = lots
        rows.append([
            application.id,
            application.received_date.strftime('%Y-%m-%d %H:%m %p'),
            '%s %s' % (application.first_name, application.last_name),
            # application.organization,
            owned_address,
            # application.owned_ppn, --Commented out for now
	application.owned_live,
	application.owned_properties,
	application.owned_properties_info,
	application.lot_1_use,
			application.lot_1_improvements,
			application.lot_1_descr,
			application.fencing_descr,
			application.fencing_cost,
			application.landscaping_descr,
			application.landscaping_cost,
			application.apron_descr,
			application.apron_cost,
			application.other_descr,
			application.other_cost,
		
            application.plan_image.url,
            contact_address,
            application.phone,
            application.email,
            application.how_heard,
            lot_1_ppn,
            lot_1_addr,
## TODO: Replace this - Issue 18 - ASKoiman
#            lot_1_image,
			application.tracking_id,
            # lot_2_pin,
            # lot_2_addr,
            # lot_2_image,
        ])
    writer = csv.writer(response)
    writer.writerow(header)
    writer.writerows(rows)
    return response
