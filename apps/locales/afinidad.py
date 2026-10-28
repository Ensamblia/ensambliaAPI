from django.db.models import BooleanField, Case, Count, Q, Value, When


def anotar_afinidad(qs, referencia):
    """
    Ordena perfiles por afinidad con un perfil de referencia:
    primero los de su misma comarca, luego los que comparten más géneros.
    Sin referencia, orden estable por perfil_id y sin anotaciones.
    """
    if referencia is None:
        return qs.order_by('perfil_id')

    generos_ref = list(referencia.perfil_generos.values_list('genero_id', flat=True))
    if referencia.comarca_id is None:
        misma_comarca = Value(False, output_field=BooleanField())
    else:
        misma_comarca = Case(
            When(comarca_id=referencia.comarca_id, then=Value(True)),
            default=Value(False),
            output_field=BooleanField(),
        )

    return qs.annotate(
        generos_comunes=Count(
            'perfil_generos',
            filter=Q(perfil_generos__genero_id__in=generos_ref),
            distinct=True,
        ),
        misma_comarca=misma_comarca,
    ).order_by('-misma_comarca', '-generos_comunes', 'perfil_id')
