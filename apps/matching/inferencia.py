import re
import unicodedata

from apps.catalogo.models import GeneroMusical, Instrumento
from .models import BusquedaAnuncio


def normalizar(texto):
    """Minúsculas y sin tildes, para comparar 'Batería' con 'bateria'."""
    sin_tildes = unicodedata.normalize('NFKD', texto or '')
    return ''.join(c for c in sin_tildes if not unicodedata.combining(c)).lower()


def catalogo_normalizado():
    """Instrumentos y géneros del catálogo con su nombre normalizado (se carga una vez por petición)."""
    instrumentos = [(i.instrumento_id, normalizar(i.nombre)) for i in Instrumento.objects.all()]
    generos = [(g.genero_musical_id, normalizar(g.nombre)) for g in GeneroMusical.objects.all()]
    return instrumentos, generos


def _aparece(nombre, texto):
    match = re.search(rf'\b{re.escape(nombre)}\b', texto)
    return match.start() if match else None


def inferir_busqueda(anuncio, catalogo):
    """
    Para anuncios sin "¿Qué buscas?": busca nombres del catálogo en el título y el texto.
    Instrumento = el primero que aparece; géneros = todos los que aparecen.
    """
    instrumentos, generos = catalogo
    texto = normalizar(f'{anuncio.titulo} {anuncio.contenido}')
    encontrados = [(pos, iid) for iid, nombre in instrumentos if (pos := _aparece(nombre, texto)) is not None]
    return {
        'tipo_perfil': None,
        'instrumento_id': min(encontrados)[1] if encontrados else None,
        'generos': [gid for gid, nombre in generos if _aparece(nombre, texto) is not None],
        'inferida': True,
    }


def busqueda_de(anuncio, catalogo):
    """La búsqueda explícita del anuncio o, si no tiene, la inferida del texto."""
    try:
        b = anuncio.busqueda
    except BusquedaAnuncio.DoesNotExist:
        return inferir_busqueda(anuncio, catalogo)
    return {
        'tipo_perfil': b.tipo_perfil,
        'instrumento_id': b.instrumento_id,
        'generos': list(b.generos),
        'inferida': False,
    }
