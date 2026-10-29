# Comarcas oficiales de Catalunya (43, incluido el Lluçanès desde 2023).
# La app está acotada a Catalunya; las usa el catálogo de comarcas.
COMARCAS_CATALUNYA = [
    'Alt Camp', 'Alt Empordà', 'Alt Penedès', 'Alt Urgell', 'Alta Ribagorça',
    'Anoia', 'Bages', 'Baix Camp', 'Baix Ebre', 'Baix Empordà',
    'Baix Llobregat', 'Baix Penedès', 'Barcelonès', 'Berguedà', 'Cerdanya',
    'Conca de Barberà', 'Garraf', 'Garrigues', 'Garrotxa', 'Gironès',
    'Lluçanès', 'Maresme', 'Moianès', 'Montsià', 'Noguera',
    'Osona', 'Pallars Jussà', 'Pallars Sobirà', "Pla d'Urgell", "Pla de l'Estany",
    'Priorat', "Ribera d'Ebre", 'Ripollès', 'Segarra', 'Segrià',
    'Selva', 'Solsonès', 'Tarragonès', 'Terra Alta', 'Urgell',
    "Val d'Aran", 'Vallès Occidental', 'Vallès Oriental',
]


def cargar_comarcas(Comarca):
    """Crea las comarcas que falten. No borra ni duplica (compara sin mayúsculas)."""
    existentes = {n.lower() for n in Comarca.objects.values_list('nombre', flat=True)}
    nuevas = [Comarca(nombre=n) for n in COMARCAS_CATALUNYA if n.lower() not in existentes]
    Comarca.objects.bulk_create(nuevas)
