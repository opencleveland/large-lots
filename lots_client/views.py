from django.shortcuts import render

def home(request):
    return render(request, 'index.html')

def apply(request):
    return render(request, 'apply.html')

def status(request):
    return render(request, 'status.html')

def faq(request):
    return render(request, 'faq.html')

def about(request):
    return render(request, 'about.html')
