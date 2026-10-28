from django.db.models import BooleanField, Case, Count, Q, Value, When
from .models import Local


def comarca_de(perfil):
    """Comarca efectiva: la de la ciudad del local si es un local con datos, si no la del perfil."""
    if perfil.tipo == 'local':
        try:
            return perfil.local.ciudad.comarca_id
        except Local.DoesNotExist:
            pass
    return perfil.comarca_id


def anotar_afinidad(qs, referencia, campo_comarca='comarca_id'):
    """
    Ordena perfiles por afinidad con un perfil de referencia:
    primero los de su misma comarca, luego los que comparten más géneros.
    `campo_comarca` es el campo de comarca de los candidatos (para locales,
    'local__ciudad__comarca_id'). Sin referencia, orden por perfil_id sin anotaciones.
    """
    if referencia is None:
        return qs.order_by('perfil_id')

    generos_ref = list(referencia.perfil_generos.values_list('genero_id', flat=True))
    comarca_ref = comarca_de(referencia)
    if comarca_ref is None:
        misma_comarca = Value(False, output_field=BooleanField())
    else:
        misma_comarca = Case(
            When(**{campo_comarca: comarca_ref}, then=Value(True)),
            default=Value(False),
            output_field=BooleanField(),
        )

    return qs.annotate(
        generos_comunes=Count(
            'perfil_generos__genero_id',
            filter=Q(perfil_generos__genero_id__in=generos_ref),
            distinct=True,
        ),
        misma_comarca=misma_comarca,
    ).order_by('-misma_comarca', '-generos_comunes', 'perfil_id')
