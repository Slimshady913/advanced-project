from django.urls import path
from .views import MovieListCreateView, MovieDetailView

urlpatterns = [
    path('', MovieListCreateView.as_view(), name='movie-list'),
    path('<int:pk>/', MovieDetailView.as_view(), name='movie-detail'),
]