# Géneros musicales del catálogo (perfiles, grupos, eventos y match).
# Incluye los que ya existían (Rock, Jazz) para que una base de datos vacía quede completa.
GENEROS_MUSICALES = [
    'Rock', 'Hard rock', 'Rock alternativo', 'Punk', 'Metal', 'Grunge',
    'Pop', 'Indie', 'Electrónica', 'Techno', 'House', 'Ambient',
    'Hip hop', 'Rap', 'R&B', 'Soul', 'Funk', 'Gospel',
    'Jazz', 'Blues', 'Swing', 'Bossa nova',
    'Reggae', 'Ska', 'Latina', 'Salsa', 'Cumbia', 'Reguetón',
    'Flamenco', 'Rumba catalana', 'Folk', 'Música tradicional', 'Cantautor', 'Country',
    'Clásica', 'Ópera', 'Bandas sonoras', 'Experimental', 'Versiones',
]


def cargar_generos(GeneroMusical):
    """Crea los géneros que falten. No borra ni duplica (compara sin mayúsculas)."""
    existentes = {n.lower() for n in GeneroMusical.objects.values_list('nombre', flat=True)}
    nuevos = [GeneroMusical(nombre=n) for n in GENEROS_MUSICALES if n.lower() not in existentes]
    GeneroMusical.objects.bulk_create(nuevos)
