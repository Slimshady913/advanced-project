from django.contrib import admin
from .models import OTT

@admin.register(OTT)
class OTTAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'logo_url', 'link_url')
    search_fields = ('name', )