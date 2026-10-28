import pytest


@pytest.fixture
def ciudad_getafe(db, comarca):
    from apps.catalogo.models import Ciudad
    return Ciudad.objects.create(nombre='Getafe', comarca=comarca)


@pytest.fixture
def ciudad_sin_comarca(db):
    from apps.catalogo.models import Ciudad
    return Ciudad.objects.create(nombre='Villanueva')


@pytest.fixture
def perfil_local_luis(db, luis):
    """Perfil de tipo local de Luis, todavía sin datos de local."""
    from apps.perfiles.models import Perfil
    return Perfil.objects.create(
        nombre='Sala Rock', apellido='', correo='sala@test.com',
        descripcion='Sala de conciertos', usuario=luis, tipo='local',
    )


@pytest.fixture
def local_luis(db, perfil_local_luis, ciudad_getafe):
    from apps.locales.models import Local
    return Local.objects.create(
        perfil=perfil_local_luis, ciudad=ciudad_getafe,
        direccion='C/ Mayor 1', aforo=200, tipos=['sala', 'bar'],
    )
