import pytest
from rest_framework import status

from apps.catalogo.models import Grupo
from apps.perfiles.models import PerfilGrupo, SolicitudGrupo


# ==============================================================
# CREAR SOLICITUD
# ==============================================================

@pytest.mark.django_db
def test_solicitar_unirse_ok(client_luis, perfil_ana, perfil_luis):
    """Luis solicita unirse a un grupo de Ana."""
    grupo = Grupo.objects.create(nombre='Banda de Ana', creador_perfil=perfil_ana)
    response = client_luis.post('/api/solicitudes-grupo/', {
        'grupo_id': grupo.grupo_id,
    })
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['estado'] == 'pendiente'
    assert response.data['perfil_id'] == perfil_luis.perfil_id
    assert response.data['grupo_id'] == grupo.grupo_id


@pytest.mark.django_db
def test_solicitar_sin_auth(api_client, perfil_ana):
    """Sin auth → 401."""
    grupo = Grupo.objects.create(nombre='Banda', creador_perfil=perfil_ana)
    response = api_client.post('/api/solicitudes-grupo/', {'grupo_id': grupo.grupo_id})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_solicitar_sin_perfil(client_ana):
    """Sin perfil → 403."""
    from apps.catalogo.models import Grupo
    from apps.perfiles.models import Perfil
    otro = Perfil.objects.create(
        nombre='X', apellido='Y', correo='x@test.com', descripcion='Test',
    )
    grupo = Grupo.objects.create(nombre='Banda', creador_perfil=otro)
    response = client_ana.post('/api/solicitudes-grupo/', {'grupo_id': grupo.grupo_id})
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_solicitar_sin_grupo_id(client_luis, perfil_luis):
    """Sin grupo_id → 400."""
    response = client_luis.post('/api/solicitudes-grupo/', {})
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_solicitar_grupo_inexistente(client_luis, perfil_luis):
    """Grupo inexistente → 404."""
    response = client_luis.post('/api/solicitudes-grupo/', {'grupo_id': 99999})
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_solicitar_duplicada(client_luis, perfil_ana, perfil_luis):
    """Solicitar dos veces → 400."""
    grupo = Grupo.objects.create(nombre='Banda', creador_perfil=perfil_ana)
    SolicitudGrupo.objects.create(perfil=perfil_luis, grupo=grupo)
    response = client_luis.post('/api/solicitudes-grupo/', {'grupo_id': grupo.grupo_id})
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'Ya has solicitado' in response.data['error']


@pytest.mark.django_db
def test_solicitar_si_ya_soy_miembro(client_luis, perfil_ana, perfil_luis):
    """Si ya soy miembro → 400."""
    grupo = Grupo.objects.create(nombre='Banda', creador_perfil=perfil_ana)
    PerfilGrupo.objects.create(perfil=perfil_luis, grupo=grupo)
    response = client_luis.post('/api/solicitudes-grupo/', {'grupo_id': grupo.grupo_id})
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'Ya eres miembro' in response.data['error']


@pytest.mark.django_db
def test_solicitar_tras_rechazo(client_luis, perfil_ana, perfil_luis):
    """Si la solicitud anterior fue rechazada, se reactiva."""
    grupo = Grupo.objects.create(nombre='Banda', creador_perfil=perfil_ana)
    solicitud = SolicitudGrupo.objects.create(
        perfil=perfil_luis, grupo=grupo,
        estado=SolicitudGrupo.Estado.RECHAZADA,
    )
    response = client_luis.post('/api/solicitudes-grupo/', {'grupo_id': grupo.grupo_id})
    assert response.status_code == status.HTTP_201_CREATED
    solicitud.refresh_from_db()
    assert solicitud.estado == SolicitudGrupo.Estado.PENDIENTE
    assert solicitud.fecha_resolucion is None


# ==============================================================
# APROBAR / RECHAZAR (dueño del grupo)
# ==============================================================

@pytest.mark.django_db
def test_aprobar_solicitud_ok(client_ana, perfil_ana, perfil_luis):
    """Ana (dueña) aprueba la solicitud de Luis."""
    grupo = Grupo.objects.create(nombre='Banda', creador_perfil=perfil_ana)
    solicitud = SolicitudGrupo.objects.create(perfil=perfil_luis, grupo=grupo)
    response = client_ana.post(f'/api/solicitudes-grupo/{solicitud.solicitud_id}/aprobar/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['estado'] == 'aceptada'
    # Se ha creado el PerfilGrupo
    assert PerfilGrupo.objects.filter(perfil=perfil_luis, grupo=grupo).exists()


@pytest.mark.django_db
def test_aprobar_solicitud_ajena(client_luis, perfil_ana, perfil_luis):
    """Luis (no dueño) no puede aprobar."""
    grupo = Grupo.objects.create(nombre='Banda', creador_perfil=perfil_ana)
    solicitud = SolicitudGrupo.objects.create(perfil=perfil_luis, grupo=grupo)
    response = client_luis.post(f'/api/solicitudes-grupo/{solicitud.solicitud_id}/aprobar/')
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_aprobar_solicitud_ya_resuelta(client_ana, perfil_ana, perfil_luis):
    """Aprobar una solicitud ya resuelta → 400."""
    grupo = Grupo.objects.create(nombre='Banda', creador_perfil=perfil_ana)
    solicitud = SolicitudGrupo.objects.create(
        perfil=perfil_luis, grupo=grupo,
        estado=SolicitudGrupo.Estado.ACEPTADA,
    )
    response = client_ana.post(f'/api/solicitudes-grupo/{solicitud.solicitud_id}/aprobar/')
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_rechazar_solicitud_ok(client_ana, perfil_ana, perfil_luis):
    """Ana rechaza la solicitud de Luis."""
    grupo = Grupo.objects.create(nombre='Banda', creador_perfil=perfil_ana)
    solicitud = SolicitudGrupo.objects.create(perfil=perfil_luis, grupo=grupo)
    response = client_ana.post(f'/api/solicitudes-grupo/{solicitud.solicitud_id}/rechazar/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['estado'] == 'rechazada'
    # NO se ha creado el PerfilGrupo
    assert not PerfilGrupo.objects.filter(perfil=perfil_luis, grupo=grupo).exists()


# ==============================================================
# CANCELAR (el solicitante)
# ==============================================================

@pytest.mark.django_db
def test_cancelar_mi_solicitud(client_luis, perfil_ana, perfil_luis):
    """Luis cancela su solicitud pendiente."""
    grupo = Grupo.objects.create(nombre='Banda', creador_perfil=perfil_ana)
    solicitud = SolicitudGrupo.objects.create(perfil=perfil_luis, grupo=grupo)
    response = client_luis.delete(f'/api/solicitudes-grupo/{solicitud.solicitud_id}/')
    assert response.status_code == status.HTTP_200_OK
    assert not SolicitudGrupo.objects.filter(solicitud_id=solicitud.solicitud_id).exists()


@pytest.mark.django_db
def test_cancelar_solicitud_ajena(client_ana, perfil_ana, perfil_luis):
    """Ana no puede cancelar la solicitud de Luis."""
    grupo = Grupo.objects.create(nombre='Banda', creador_perfil=perfil_ana)
    solicitud = SolicitudGrupo.objects.create(perfil=perfil_luis, grupo=grupo)
    response = client_ana.delete(f'/api/solicitudes-grupo/{solicitud.solicitud_id}/')
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert SolicitudGrupo.objects.filter(solicitud_id=solicitud.solicitud_id).exists()


@pytest.mark.django_db
def test_cancelar_solicitud_ya_resuelta(client_luis, perfil_ana, perfil_luis):
    """Cancelar una solicitud ya aceptada → 400."""
    grupo = Grupo.objects.create(nombre='Banda', creador_perfil=perfil_ana)
    solicitud = SolicitudGrupo.objects.create(
        perfil=perfil_luis, grupo=grupo,
        estado=SolicitudGrupo.Estado.ACEPTADA,
    )
    response = client_luis.delete(f'/api/solicitudes-grupo/{solicitud.solicitud_id}/')
    assert response.status_code == status.HTTP_400_BAD_REQUEST