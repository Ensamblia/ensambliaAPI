from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework import status

from apps.catalogo.models import Ciudad, Comarca
from apps.eventos.models import Evento
from apps.locales.models import Local
from apps.perfiles.models import Perfil

URL = '/api/eventos/'


def en(dias, horas=0):
    return timezone.now() + timedelta(days=dias, hours=horas)


@pytest.fixture
def getafe(db, comarca):
    return Ciudad.objects.create(nombre='Getafe', comarca=comarca)


@pytest.fixture
def talavera(db):
    toledo = Comarca.objects.create(nombre='Toledo')
    return Ciudad.objects.create(nombre='Talavera', comarca=toledo)


@pytest.fixture
def sala_luis(db, luis, getafe):
    """Perfil local de Luis con datos de local en Getafe."""
    perfil = Perfil.objects.create(
        nombre='Sala Rock', apellido='', correo='sala@test.com', descripcion='Sala',
        usuario=luis, tipo='local',
    )
    Local.objects.create(perfil=perfil, ciudad=getafe, direccion='C/ Mayor 1', aforo=200, tipos=['sala'])
    return perfil


def crear_evento(perfil, titulo, cuando, ciudad, **extra):
    return Evento.objects.create(perfil=perfil, titulo=titulo, fecha_inicio=cuando, ciudad=ciudad, **extra)


def datos(ciudad, **extra):
    base = {
        'titulo': 'Concierto de otoño',
        'fecha_inicio': en(7).isoformat(),
        'ciudad_id': ciudad.ciudad_id,
        'descripcion': 'Tres grupos locales',
        'precio': '10 €',
    }
    base.update(extra)
    return base


# ==============================================================
# CREAR
# ==============================================================

@pytest.mark.django_db
def test_crear_evento_con_mi_perfil_personal(client_ana, perfil_ana, getafe, genero_rock):
    response = client_ana.post(URL, datos(getafe, generos=[genero_rock.genero_musical_id]), format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['autor']['perfil_id'] == perfil_ana.perfil_id
    assert response.data['ciudad'] == 'Getafe'
    assert response.data['generos'] == [{'genero_musical_id': genero_rock.genero_musical_id, 'nombre': 'Rock'}]
    assert response.data['precio'] == '10 €'


@pytest.mark.django_db
def test_crear_evento_como_mi_local(client_luis, perfil_luis, sala_luis, getafe):
    response = client_luis.post(URL, datos(getafe, perfil_id=sala_luis.perfil_id), format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['autor']['tipo'] == 'local'


@pytest.mark.django_db
def test_crear_evento_en_un_local_toma_su_ciudad(client_ana, perfil_ana, sala_luis):
    body = datos(sala_luis.local.ciudad, local_id=sala_luis.perfil_id)
    body.pop('ciudad_id')
    response = client_ana.post(URL, body, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['local'] == {'perfil_id': sala_luis.perfil_id, 'nombre': 'Sala Rock'}
    assert response.data['ciudad'] == 'Getafe'


@pytest.mark.django_db
def test_no_puedo_publicar_con_perfil_ajeno(client_ana, perfil_ana, sala_luis, getafe):
    response = client_ana.post(URL, datos(getafe, perfil_id=sala_luis.perfil_id), format='json')
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_crear_sin_perfil_400(client_sin_perfil, getafe):
    response = client_sin_perfil.post(URL, datos(getafe), format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'perfil' in response.data['error'].lower()


@pytest.mark.django_db
def test_crear_sin_login_401(api_client, getafe):
    assert api_client.post(URL, datos(getafe), format='json').status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
@pytest.mark.parametrize('cambio, campo', [
    ({'titulo': '  '}, 'titulo'),
    ({'fecha_inicio': 'mañana'}, 'fecha_inicio'),
    ({'ciudad_id': 999999}, 'ciudad_id'),
    ({'generos': [999999]}, 'generos'),
    ({'local_id': 999999}, 'local_id'),
])
def test_crear_datos_invalidos_400(client_ana, perfil_ana, getafe, cambio, campo):
    response = client_ana.post(URL, datos(getafe, **cambio), format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert campo in response.data


@pytest.mark.django_db
def test_crear_en_el_pasado_400(client_ana, perfil_ana, getafe):
    response = client_ana.post(URL, datos(getafe, fecha_inicio=en(-1).isoformat()), format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'fecha_inicio' in response.data


@pytest.mark.django_db
def test_local_id_que_no_es_un_local_400(client_ana, perfil_ana, perfil_luis, getafe):
    response = client_ana.post(URL, datos(getafe, local_id=perfil_luis.perfil_id), format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'local_id' in response.data


@pytest.mark.django_db
def test_sin_ciudad_ni_local_400(client_ana, perfil_ana, getafe):
    body = datos(getafe)
    body.pop('ciudad_id')
    response = client_ana.post(URL, body, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'ciudad_id' in response.data


# ==============================================================
# LISTAR
# ==============================================================

@pytest.mark.django_db
def test_lista_publica_proximos_por_fecha(api_client, perfil_ana, getafe):
    tarde = crear_evento(perfil_ana, 'Tarde', en(5), getafe)
    pronto = crear_evento(perfil_ana, 'Pronto', en(1), getafe)
    crear_evento(perfil_ana, 'Pasado', en(-2), getafe)
    response = api_client.get(URL)
    assert response.status_code == status.HTTP_200_OK
    assert [r['evento_id'] for r in response.data['results']] == [pronto.evento_id, tarde.evento_id]


@pytest.mark.django_db
def test_lista_rango_desde_hasta(api_client, perfil_ana, getafe):
    crear_evento(perfil_ana, 'Dentro', en(3), getafe)
    crear_evento(perfil_ana, 'Fuera', en(40), getafe)
    response = api_client.get(URL, {'desde': en(2).isoformat(), 'hasta': en(10).isoformat()})
    assert [r['titulo'] for r in response.data['results']] == ['Dentro']


@pytest.mark.django_db
def test_lista_filtros(api_client, perfil_ana, sala_luis, getafe, talavera, comarca, genero_rock, genero_jazz):
    rock_getafe = crear_evento(perfil_ana, 'Rock Getafe', en(1), getafe, generos=[genero_rock.genero_musical_id])
    jazz_talavera = crear_evento(perfil_ana, 'Jazz Talavera', en(2), talavera, generos=[genero_jazz.genero_musical_id])
    en_sala = crear_evento(perfil_ana, 'En la sala', en(3), getafe, local=sala_luis)
    def ids(params):
        return [r['evento_id'] for r in api_client.get(URL, params).data['results']]
    assert ids({'ciudad': talavera.ciudad_id}) == [jazz_talavera.evento_id]
    assert ids({'comarca': comarca.comarca_id}) == [rock_getafe.evento_id, en_sala.evento_id]
    assert ids({'genero': genero_rock.genero_musical_id}) == [rock_getafe.evento_id]
    assert ids({'perfil': sala_luis.perfil_id}) == [en_sala.evento_id]


@pytest.mark.django_db
@pytest.mark.parametrize('params', [{'desde': 'ayer'}, {'ciudad': 'x'}, {'genero': 'x'}, {'perfil': 'x'}])
def test_lista_parametros_invalidos_400(api_client, params):
    response = api_client.get(URL, params)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'error' in response.data


# ==============================================================
# DETALLE, EDITAR, BORRAR, MIS PERFILES
# ==============================================================

@pytest.mark.django_db
def test_detalle_publico(api_client, perfil_ana, getafe):
    evento = crear_evento(perfil_ana, 'Jam', en(1), getafe, lugar='Parque del Sur')
    response = api_client.get(f'{URL}{evento.evento_id}/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['lugar'] == 'Parque del Sur'
    assert response.data['autor']['nombre'] == 'Ana'


@pytest.mark.django_db
def test_detalle_inexistente_404(api_client):
    assert api_client.get(f'{URL}999999/').status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_editar_dueno(client_ana, perfil_ana, getafe):
    evento = crear_evento(perfil_ana, 'Jam', en(1), getafe)
    response = client_ana.put(f'{URL}{evento.evento_id}/', {'titulo': 'Jam de rock', 'precio': 'Gratis'}, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['titulo'] == 'Jam de rock'
    assert response.data['precio'] == 'Gratis'


@pytest.mark.django_db
def test_editar_ajeno_403(client_luis, perfil_luis, perfil_ana, getafe):
    evento = crear_evento(perfil_ana, 'Jam', en(1), getafe)
    assert client_luis.put(f'{URL}{evento.evento_id}/', {'titulo': 'X'}, format='json').status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_borrar_dueno_y_ajeno(client_ana, perfil_ana, getafe):
    evento = crear_evento(perfil_ana, 'Jam', en(1), getafe)
    assert client_ana.delete(f'{URL}{evento.evento_id}/').status_code == status.HTTP_204_NO_CONTENT
    assert not Evento.objects.exists()


@pytest.mark.django_db
def test_borrar_ajeno_403(client_luis, perfil_luis, perfil_ana, getafe):
    evento = crear_evento(perfil_ana, 'Jam', en(1), getafe)
    assert client_luis.delete(f'{URL}{evento.evento_id}/').status_code == status.HTTP_403_FORBIDDEN
    assert Evento.objects.exists()


@pytest.mark.django_db
def test_mis_perfiles(client_luis, perfil_luis, sala_luis):
    response = client_luis.get(f'{URL}mis-perfiles/')
    assert response.status_code == status.HTTP_200_OK
    assert [(p['perfil_id'], p['tipo']) for p in response.data] == [
        (perfil_luis.perfil_id, 'usuario'), (sala_luis.perfil_id, 'local'),
    ]
