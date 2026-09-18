"""
Utilidades para filtros comunes.
"""
from django_filters import rest_framework as filters


class AnuncioFilter(filters.FilterSet):
    # Los filtros se generan automáticamente a partir de Meta.fields
    # pero aquí podemos añadir filtros custom si hace falta.
    pass