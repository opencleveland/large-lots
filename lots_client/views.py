# -*- coding: utf-8 -*

import re
from django.shortcuts import render
from django.conf import settings
from django import forms
from django.utils import timezone
from django.template import Context
from django.template.loader import get_template
from django.core.mail import EmailMultiAlternatives
from lots_admin.models import Lot, Application, Address
import requests
from django.core.cache import cache
from django.http import HttpResponse, HttpResponseRedirect
import json
from uuid import uuid4
from collections import OrderedDict
from datetime import datetime
from dateutil import parser

class ApplicationForm(forms.Form):

    # LOT INFORMATION
    lot_1_address = forms.CharField(
        error_messages={'required': 'Provide the lot’s address'},
        label="Lot address")
    lot_1_ppn = forms.CharField(
        error_messages={
            'required': 'Provide the lot’s Permanent Parcel Number'
        },label="Lot PPN")
    lot_1_use = forms.CharField(
        error_messages={'required': 'Verify whether or not you are currently using the lot'},
        label="Lot use"
    )
    lot_1_improvements = forms.CharField(
        error_messages={'required': 'Verify whether or not you have made improvements to the lot'},
        label="Lot improvements"
    )
    lot_1_descr = forms.CharField(required=False)

    # OWNER PROPERTY INFORMATION
    owned_address = forms.CharField(
        error_messages={
            'required': 'Provide the address of the building you own'
        }, label="Owned property address")

    owned_live = forms.CharField(
        error_messages={
            'required': 'Provide information on the current residents of the property'
        }, label="Owned property status")

    owned_properties = forms.CharField(
        error_messages={
            'required': 'Provide information on whether or not you own multiple properties in Cleveland'
        }, label="Owned properties")

    owned_properties_info = forms.CharField(required=False)

    # PLANS
    plan_image = forms.FileField(
        error_messages={'required': 'Provide an image of the proposed site plan'
        }, label="Proposed site plan")

    fencing_decsr = forms.CharField(required=False)
    fencing_cost = forms.CharField(required=False)

    landscappng_decsr = forms.CharField(required=False)
    landscappng_cost = forms.CharField(required=False)

    apron_descr = forms.CharField(required=False)
    apron_cost = forms.CharField(required=False)

    other_descr = forms.CharField(required=False)
    other_cost = forms.CharField(required=False)


    # CONTACT INFORMATION
    first_name = forms.CharField(
        error_messages={'required': 'Provide your first name'},
        label="Your first name")
    last_name = forms.CharField(
        error_messages={'required': 'Provide your last name'},
        label="Your last name")
    phone = forms.CharField(
        error_messages={'required': 'Provide a contact phone number'},
        label="Your phone number")
    email = forms.CharField(required=False)
    contact_street = forms.CharField(required=False)
    contact_city = forms.CharField(required=False)
    contact_state = forms.CharField(required=False)
    contact_zip_code = forms.CharField(required=False)
    how_heard = forms.CharField(required=False)

    # TERMS
    terms = forms.BooleanField(
        error_messages={'required': 'Verify that you have read and agree to the terms'},
        label="Application terms")

    def _check_ppn(self, ppn):
        carto = 'http://opencleveland.cartodb.com/api/v2/sql'
        params = {
            'api_key': settings.CARTODB_API_KEY,
            'q':  "SELECT ppn FROM joined WHERE ppn = '%s'" % ppn.replace('-', ''),
        }
        r = requests.get(carto, params=params)
        if r.status_code == 200:
            if r.json()['total_rows'] == 1:
                return ppn
            else:
                message = '%s is not available for purchase. \
                    Please select one from the map above' % ppn
                raise forms.ValidationError(message)
        else:
            return ppn

    def _clean_ppn(self, key):
        ppn = self.cleaned_data[key]
        pattern = re.compile('[0-9]{3}-?[0-9]{2}-?[0-9]{3}[a-zA-Z]?') #Props to Eamon for the new regex - ASKoiman #pattern = re.compile('[^0-9]')
		## Issue 8: Cleveland PPNs are 8 digits long, as opposed to Chicago's 14. - ASKoiman 12/6/2014
        ppnLength = len(pattern.sub('', ppn))
        if ppnLength != 8 & ppnLength != 9 :
            raise forms.ValidationError('Please provide a valid ppn')
        else:
            return self._check_ppn(ppn)

    def clean_lot_1_ppn(self):
        return self._clean_ppn('lot_1_ppn')


    def clean_plan_image(self):
        image = self.cleaned_data['plan_image']._get_name()
        ftype = image.split('.')[-1]
        #Added .lower() for string comparison - ASKoiman 12/26/2014
        if ftype.lower() not in ['pdf', 'png', 'jpg', 'jpeg']:

            raise forms.ValidationError('File type not supported. Please choose an image or PDF.')
        return self.cleaned_data['plan_image']

def home(request):
    return render(request, 'index.html', {'application_active': application_active()})

# the application is active between July 1st 12:00am and August 4th 11:59pm
def application_active():
    chicago_time = timezone.localtime(timezone.now())
    start_date = timezone.make_aware(datetime(2014, 7, 1, 0, 0),
        timezone.get_current_timezone())
    end_date = timezone.make_aware(datetime(2015, 11, 4, 23, 59),
        timezone.get_current_timezone())

    # print settings.APPLICATION_DISPLAY


    # override with configuration setting
    if start_date < chicago_time < end_date:
        return True
    else:
        return False

def get_lot_address(address):
    add_info = {
        'street': address,
        'city': 'Cleveland',
        'state': 'OH',
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
                'ppn': form.cleaned_data['lot_1_ppn'],
                'address': l1_address,
                # 'planned_use': form.cleaned_data.get('lot_1_use')
            }
            try:
                lot1 = Lot.objects.get(ppn=lot1_info['ppn'])
            except Lot.DoesNotExist:
                lot1 = Lot(**lot1_info)
                lot1.save()

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
                'owned_address': owned_address,
                'plan_image': form.cleaned_data['plan_image'],
                'contact_address': c_address,
                'phone': form.cleaned_data['phone'],
                'email': form.cleaned_data.get('email'),
                'how_heard': form.cleaned_data.get('how_heard'),
                'tracking_id': unicode(uuid4()),
            }
            app = Application(**app_info)
            
            app.save()
            app.lot_set.add(lot1)            

            app.save()

            html_template = get_template('apply_html_email.html')
            text_template = get_template('apply_text_email.txt')
            lots = [l for l in app.lot_set.all()]
            context = Context({'app': app, 'lots': lots, 'host': request.get_host()})
            html_content = html_template.render(context)
            text_content = text_template.render(context)
            subject = 'Large Lots Application for %s %s' % (app.first_name, app.last_name)

            from_email = settings.EMAIL_HOST_USER
            to_email = [from_email]

            #TODO: Get mailserver configured and running - ASKoiman 2/10/2015
            ## if provided, send confirmation email to applicant
            #if app.email:
            #    to_email.append(app.email)

            ## send email confirmation to settings.EMAIL_HOST_USER
            #msg = EmailMultiAlternatives(subject, text_content, from_email, to_email)
            #msg.attach_alternative(html_content, 'text/html')
            #msg.send()

            return HttpResponseRedirect('/apply-confirm/%s/' % app.tracking_id)
        else:
            context['lot_1_address'] = form['lot_1_address'].value()
            context['lot_1_ppn'] = form['lot_1_ppn'].value()
            context['lot_1_use'] = form['lot_1_use'].value()
            context['owned_address'] = form['owned_address'].value()
            context['plan_image'] = form['plan_image'].value()
            context['first_name'] = form['first_name'].value()
            context['last_name'] = form['last_name'].value()
            # context['organization'] = form['organization'].value()
            context['phone'] = form['phone'].value()
            context['email'] = form['email'].value()
            context['contact_street'] = form['contact_street'].value()
            context['contact_city'] = form['contact_city'].value()
            context['contact_state'] = form['contact_state'].value()
            context['contact_zip_code'] = form['contact_zip_code'].value()
            context['how_heard'] = form['how_heard'].value()
            context['terms'] = form['terms'].value()
            context['form'] = form
            fields = [f for f in form.fields]
            context['error_messages'] = OrderedDict()
            for field in fields:
                label = form.fields[field].label
                error = form.errors.get(field)
                if label and error:
                    context['error_messages'][label] = form.errors[field][0]
            return render(request, 'apply.html', context)
    else:
        if application_active():
            form = ApplicationForm()
        else:
            form = None
    return render(request, 'apply.html', {'form': form})

def apply_confirm(request, tracking_id):
    app = Application.objects.get(tracking_id=tracking_id)
    lots = [l for l in app.lot_set.all()]
    return render(request, 'apply_confirm.html', {'app': app, 'lots': lots})

def status(request):
    return render(request, 'status.html')

def faq(request):
    return render(request, 'faq.html')

def about(request):
    return render(request, 'about.html')
