# Tipos de anuncio base. Sin compraventa: Ensamblia no tiene marketplace.
TIPOS_ANUNCIO = [
    'Busco músico', 'Busco grupo', 'Busco local', 'Ofrezco local',
    'Bolo / concierto', 'Clases', 'Otros',
]


def cargar_tipos_anuncio(TipoAnuncio):
    """Crea los que falten. No borra ni duplica (compara sin mayúsculas)."""
    existentes = {n.lower() for n in TipoAnuncio.objects.values_list('nombre', flat=True)}
    TipoAnuncio.objects.bulk_create(
        [TipoAnuncio(nombre=n) for n in TIPOS_ANUNCIO if n.lower() not in existentes]
    )
