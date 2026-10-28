import pytest
from rest_framework import status
from apps.anuncios.models import Anuncio
from apps.catalogo.models import Comarca, Instrumento
from apps.matching.models import BusquedaAnuncio
from apps.perfiles.models import Perfil, PerfilGeneroMusical, PerfilInstrumento
from apps.usuarios.models import Usuario


def busqueda_url(anuncio):
    return f'/api/match/anuncios/{anuncio.anuncio_id}/busqueda/'


def candidatos_url(anuncio):
    return f'/api/match/anuncios/{anuncio.anuncio_id}/candidatos/'


def crear_perfil(nickname, tipo='usuario', comarca=None, generos=(), instrumentos=(), disponibilidad=True):
    usuario = Usuario.objects.create_user(nickname=nickname, password='x12345')
    perfil = Perfil.objects.create(
        nombre=nickname.capitalize(), apellido='Ap' if tipo == 'usuario' else '',
        correo=f'{nickname}@test.com', descripcion='Desc', usuario=usuario,
        tipo=tipo, comarca=comarca, disponibilidad=disponibilidad,
    )
    for g in generos:
        PerfilGeneroMusical.objects.create(perfil=perfil, genero=g)
    for i in instrumentos:
        PerfilInstrumento.objects.create(perfil=perfil, instrumento=i)
    return perfil


def crear_anuncio(perfil, titulo, contenido='Texto del anuncio', tipo_anuncio=None):
    return Anuncio.objects.create(perfil=perfil, titulo=titulo, contenido=contenido, tipo_anuncio=tipo_anuncio)


@pytest.fixture
def bateria(db):
    return Instrumento.objects.create(nombre='Batería')


# ==============================================================
# "¿QUÉ BUSCAS?" DE UN ANUNCIO
# ==============================================================

@pytest.mark.django_db
def test_put_busqueda_dueno(client_ana, anuncio_ana, bateria, genero_rock):
    response = client_ana.put(busqueda_url(anuncio_ana), {
        'tipo_perfil': 'usuario', 'instrumento_id': bateria.instrumento_id,
        'generos': [genero_rock.genero_musical_id],
    }, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['tipo_perfil'] == 'usuario'
    assert response.data['instrumento'] == 'Batería'
    assert response.data['generos'] == [{'genero_musical_id': genero_rock.genero_musical_id, 'nombre': 'Rock'}]
    assert response.data['inferida'] is False


@pytest.mark.django_db
def test_put_busqueda_actualiza(client_ana, anuncio_ana, bateria):
    client_ana.put(busqueda_url(anuncio_ana), {'instrumento_id': bateria.instrumento_id}, format='json')
    response = client_ana.put(busqueda_url(anuncio_ana), {'tipo_perfil': 'grupo'}, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['tipo_perfil'] == 'grupo'
    assert response.data['instrumento_id'] is None
    assert BusquedaAnuncio.objects.count() == 1


@pytest.mark.django_db
def test_put_busqueda_ajena_403(client_luis, perfil_luis, anuncio_ana):
    response = client_luis.put(busqueda_url(anuncio_ana), {'tipo_perfil': 'grupo'}, format='json')
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_put_busqueda_sin_login_401(api_client, anuncio_ana):
    assert api_client.put(busqueda_url(anuncio_ana), {}, format='json').status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_put_busqueda_anuncio_inexistente_404(client_ana, perfil_ana):
    response = client_ana.put('/api/match/anuncios/999999/busqueda/', {}, format='json')
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
@pytest.mark.parametrize('datos, campo', [
    ({'tipo_perfil': 'novia'}, 'tipo_perfil'),
    ({'instrumento_id': 999999}, 'instrumento_id'),
    ({'generos': [999999]}, 'generos'),
    ({'generos': 'rock'}, 'generos'),
])
def test_put_busqueda_invalida_400(client_ana, anuncio_ana, datos, campo):
    response = client_ana.put(busqueda_url(anuncio_ana), datos, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert campo in response.data


@pytest.mark.django_db
def test_get_busqueda_publica_explicita(api_client, anuncio_ana, bateria):
    BusquedaAnuncio.objects.create(anuncio=anuncio_ana, instrumento=bateria)
    response = api_client.get(busqueda_url(anuncio_ana))
    assert response.status_code == status.HTTP_200_OK
    assert response.data['instrumento'] == 'Batería'
    assert response.data['inferida'] is False


@pytest.mark.django_db
def test_get_busqueda_inferida_del_texto(api_client, perfil_ana, bateria, genero_rock, genero_jazz):
    anuncio = crear_anuncio(perfil_ana, 'Busco BATERIA', 'Banda de rock busca baterista con ganas')
    response = api_client.get(busqueda_url(anuncio))
    assert response.status_code == status.HTTP_200_OK
    assert response.data['inferida'] is True
    assert response.data['instrumento'] == 'Batería'
    assert [g['nombre'] for g in response.data['generos']] == ['Rock']


@pytest.mark.django_db
def test_get_busqueda_sin_pistas(api_client, anuncio_luis):
    response = api_client.get(busqueda_url(anuncio_luis))
    assert response.data['instrumento_id'] is None
    assert response.data['generos'] == []


# ==============================================================
# ANUNCIOS PARA MÍ  (GET /api/match/?busco=anuncios)
# ==============================================================

@pytest.fixture
def ana_bateria_rock(perfil_ana, comarca, bateria, genero_rock):
    perfil_ana.comarca = comarca
    perfil_ana.save()
    PerfilInstrumento.objects.create(perfil=perfil_ana, instrumento=bateria)
    PerfilGeneroMusical.objects.create(perfil=perfil_ana, genero=genero_rock)
    return perfil_ana


def ids(response):
    return [r['anuncio_id'] for r in response.data['results']]


@pytest.mark.django_db
def test_anuncios_para_mi_orden_y_filtros(client_ana, ana_bateria_rock, comarca, bateria, genero_rock, genero_jazz, instrumento_guitarra):
    toledo = Comarca.objects.create(nombre='Toledo')
    sala_cerca = crear_perfil('salacerca', tipo='local', comarca=comarca)
    grupo_lejos = crear_perfil('grupolejos', tipo='grupo', comarca=toledo)
    otro = crear_perfil('otro', comarca=comarca)

    busca_mi_instrumento_cerca = crear_anuncio(sala_cerca, 'Necesitamos batería')
    BusquedaAnuncio.objects.create(anuncio=busca_mi_instrumento_cerca, tipo_perfil='usuario', instrumento=bateria)
    busca_mi_instrumento_lejos = crear_anuncio(grupo_lejos, 'Buscamos batería')
    BusquedaAnuncio.objects.create(anuncio=busca_mi_instrumento_lejos, instrumento=bateria, generos=[genero_rock.genero_musical_id])
    solo_estilo = crear_anuncio(otro, 'Jam de rock')
    BusquedaAnuncio.objects.create(anuncio=solo_estilo, generos=[genero_rock.genero_musical_id])
    otro_instrumento = crear_anuncio(otro, 'Busco guitarra')
    BusquedaAnuncio.objects.create(anuncio=otro_instrumento, instrumento=instrumento_guitarra, generos=[genero_rock.genero_musical_id])
    busca_grupo = crear_anuncio(otro, 'Busco grupo')
    BusquedaAnuncio.objects.create(anuncio=busca_grupo, tipo_perfil='grupo', generos=[genero_rock.genero_musical_id])
    sin_relacion = crear_anuncio(otro, 'Jazz y nada más')
    BusquedaAnuncio.objects.create(anuncio=sin_relacion, generos=[genero_jazz.genero_musical_id])
    mio = crear_anuncio(ana_bateria_rock, 'Mi anuncio de batería')
    BusquedaAnuncio.objects.create(anuncio=mio, instrumento=bateria)

    response = client_ana.get('/api/match/', {'busco': 'anuncios'})
    assert response.status_code == status.HTTP_200_OK
    assert ids(response) == [
        busca_mi_instrumento_cerca.anuncio_id,
        busca_mi_instrumento_lejos.anuncio_id,
        solo_estilo.anuncio_id,
    ]
    primero = response.data['results'][0]
    assert primero['busca_mi_instrumento'] is True
    assert primero['instrumento'] == 'Batería'
    assert primero['misma_comarca'] is True
    assert primero['autor']['perfil_id'] == sala_cerca.perfil_id
    assert primero['autor']['tipo'] == 'local'
    assert response.data['results'][1]['generos_comunes'] == ['Rock']


@pytest.mark.django_db
def test_anuncios_para_mi_incluye_anuncios_antiguos_por_texto(client_ana, ana_bateria_rock, comarca):
    otro = crear_perfil('otro', comarca=comarca)
    antiguo = crear_anuncio(otro, 'Grupo busca bateria', 'Somos una banda de Rock en Getafe')
    response = client_ana.get('/api/match/', {'busco': 'anuncios'})
    assert ids(response) == [antiguo.anuncio_id]
    assert response.data['results'][0]['inferida'] is True


@pytest.mark.django_db
def test_anuncios_para_mi_sin_perfil_400(client_sin_perfil):
    assert client_sin_perfil.get('/api/match/', {'busco': 'anuncios'}).status_code == status.HTTP_400_BAD_REQUEST


# ==============================================================
# CANDIDATOS PARA MI ANUNCIO
# ==============================================================

@pytest.mark.django_db
def test_candidatos_para_mi_anuncio(client_ana, perfil_ana, comarca, bateria, genero_rock, genero_jazz):
    perfil_ana.comarca = comarca
    perfil_ana.save()
    anuncio = crear_anuncio(perfil_ana, 'Busco batería de rock')
    BusquedaAnuncio.objects.create(anuncio=anuncio, tipo_perfil='usuario', instrumento=bateria, generos=[genero_rock.genero_musical_id])
    toledo = Comarca.objects.create(nombre='Toledo')
    cerca_rock = crear_perfil('cercarock', comarca=comarca, generos=[genero_rock], instrumentos=[bateria])
    lejos_jazz = crear_perfil('lejosjazz', comarca=toledo, generos=[genero_jazz], instrumentos=[bateria])
    crear_perfil('sinbateria', comarca=comarca, generos=[genero_rock])
    crear_perfil('ocupado', comarca=comarca, instrumentos=[bateria], disponibilidad=False)
    crear_perfil('ungrupo', tipo='grupo', comarca=comarca, generos=[genero_rock])

    response = client_ana.get(candidatos_url(anuncio))
    assert response.status_code == status.HTTP_200_OK
    assert [r['perfil_id'] for r in response.data['results']] == [cerca_rock.perfil_id, lejos_jazz.perfil_id]
    assert response.data['results'][0]['generos_comunes'] == ['Rock']
    assert response.data['results'][0]['misma_comarca'] is True


@pytest.mark.django_db
def test_candidatos_solo_el_dueno(client_luis, perfil_luis, anuncio_ana):
    assert client_luis.get(candidatos_url(anuncio_ana)).status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_candidatos_sin_login_401(api_client, anuncio_ana):
    assert api_client.get(candidatos_url(anuncio_ana)).status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_no_consulta_id_de_pivotes_en_anuncios(client_ana, ana_bateria_rock, comarca, bateria):
    from django.db import connection
    from django.test.utils import CaptureQueriesContext
    otro = crear_perfil('otro', comarca=comarca, instrumentos=[bateria])
    anuncio = crear_anuncio(ana_bateria_rock, 'Busco batería')
    BusquedaAnuncio.objects.create(anuncio=anuncio, instrumento=bateria)
    crear_anuncio(otro, 'Grupo busca batería')
    for url in ['/api/match/?busco=anuncios', candidatos_url(anuncio)]:
        with CaptureQueriesContext(connection) as ctx:
            assert client_ana.get(url).status_code == 200
        malas = [q['sql'] for q in ctx.captured_queries
                 if '"perfil_genero_musical"."id"' in q['sql'] or '"perfil_instrumento"."id"' in q['sql']]
        assert not malas, url
