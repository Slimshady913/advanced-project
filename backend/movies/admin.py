from django.contrib import admin
from .models import Movie

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'release_date', 'display_average_rating')
    search_fields = ('title',)
    list_filter = ('release_date',)
    ordering = ('-average_rating_cache',)

    filter_horizontal = ('ott_services',)  # ★ 여기 추가! ★

    def display_average_rating(self, obj):
        return round(obj.calculate_average_rating(), 1)

    display_average_rating.short_description = "평균 평점"