from django.shortcuts import render
from django.contrib.auth import authenticate, login
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required

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

@login_required(login_url='/lots-login/')
def lots_admin(request):
    applications = Application.objects.all()
    return render(request, 'admin.html', {'applications': applications})

