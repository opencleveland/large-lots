from django import template

register = template.Library()

@register.filter(name='remove_str')
def remove_str(value, arg):
    return value.replace(arg, '')
