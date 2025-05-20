import django_filters
from .models import Movie
from ott.models import OTT

class NumberInFilter(django_filters.BaseInFilter, django_filters.NumberFilter):
    pass

class MovieFilter(django_filters.FilterSet):
    ott_services = NumberInFilter(
        field_name="ott_services__id", 
        lookup_expr='in'
    )
    title = django_filters.CharFilter(field_name='title', lookup_expr='icontains')

    class Meta:
        model = Movie
        fields = ['ott_services', 'title']