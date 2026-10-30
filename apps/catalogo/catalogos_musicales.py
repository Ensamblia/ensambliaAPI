# Catálogos base de instrumentos y géneros musicales.
# Los cargan las migraciones de datos para que cualquier BD nueva (o recreada
# con migrate) tenga con qué rellenar perfiles, filtros y matching.
INSTRUMENTOS = [
    'Voz', 'Guitarra eléctrica', 'Guitarra acústica', 'Guitarra española',
    'Bajo', 'Contrabajo', 'Batería', 'Percusión', 'Cajón', 'Piano',
    'Teclados', 'Sintetizador', 'Violín', 'Viola', 'Violonchelo',
    'Saxofón', 'Trompeta', 'Trombón', 'Clarinete', 'Flauta', 'Acordeón',
    'Ukelele', 'Armónica', 'Gralla', 'DJ / Producción',
]

GENEROS_MUSICALES = [
    'Rock', 'Pop', 'Indie', 'Punk', 'Metal', 'Hard rock', 'Jazz', 'Blues',
    'Soul / Funk', 'R&B', 'Hip hop', 'Reggae', 'Ska', 'Electrónica', 'Folk',
    'Flamenco', 'Rumba catalana', 'Cantautor', 'Clásica', 'Latina',
    'Country', 'Gospel', 'Experimental',
]


def cargar_por_nombre(Modelo, nombres):
    """Crea los que falten. No borra ni duplica (compara sin mayúsculas)."""
    existentes = {n.lower() for n in Modelo.objects.values_list('nombre', flat=True)}
    Modelo.objects.bulk_create(
        [Modelo(nombre=n) for n in nombres if n.lower() not in existentes]
    )
