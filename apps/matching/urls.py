from django.urls import path
from .views import BusquedaAnuncioView, CandidatosAnuncioView, MatchView


urlpatterns = [
    path('', MatchView.as_view(), name='match'),
    path('anuncios/<int:pk>/busqueda/', BusquedaAnuncioView.as_view(), name='match-anuncio-busqueda'),
    path('anuncios/<int:pk>/candidatos/', CandidatosAnuncioView.as_view(), name='match-anuncio-candidatos'),
]
