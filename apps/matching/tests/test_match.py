import pytest
from rest_framework import status
from apps.catalogo.models import Ciudad, Comarca, Instrumento
from apps.locales.models import Local
from apps.perfiles.models import Perfil, PerfilGeneroMusical, PerfilInstrumento
from apps.usuarios.models import Usuario

URL = '/api/match/'


def crear(nickname, tipo='usuario', comarca=None, generos=(), instrumentos=(), disponibilidad=True, usuario=None):
    usuario = usuario or Usuario.objects.create_user(nickname=nickname, password='x12345')
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


def crear_local(nickname, ciudad, tipos, generos=()):
    perfil = crear(nickname, tipo='local', generos=generos)
    Local.objects.create(perfil=perfil, ciudad=ciudad, direccion='C/ X', aforo=100, tipos=tipos)
    return perfil


@pytest.fixture
def mundo(db, comarca, genero_rock, genero_jazz, instrumento_guitarra):
    """Ana (Madrid, Rock) busca. Hay músicos, grupos y locales cerca y lejos."""
    toledo = Comarca.objects.create(nombre='Toledo')
    bateria = Instrumento.objects.create(nombre='Batería')
    getafe = Ciudad.objects.create(nombre='Getafe', comarca=comarca)
    talavera = Ciudad.objects.create(nombre='Talavera', comarca=toledo)
    return {
        'bateria': bateria,
        'musico_cerca_rock': crear('cercarock', comarca=comarca, generos=[genero_rock], instrumentos=[bateria]),
        'musico_cerca_jazz': crear('cercajazz', comarca=comarca, generos=[genero_jazz], instrumentos=[instrumento_guitarra]),
        'musico_lejos_rock': crear('lejosrock', comarca=toledo, generos=[genero_rock], instrumentos=[bateria]),
        'musico_no_disponible': crear('ocupado', comarca=comarca, generos=[genero_rock], disponibilidad=False),
        'grupo_cerca': crear('grupocerca', tipo='grupo', comarca=comarca, generos=[genero_rock]),
        'grupo_lejos': crear('grupolejos', tipo='grupo', comarca=toledo),
        'ensayo_cerca': crear_local('ensayocerca', getafe, ['ensayo'], [genero_rock]),
        'sala_lejos': crear_local('salalejos', talavera, ['sala', 'bar']),
        'sala_cerca': crear_local('salacerca', getafe, ['sala']),
    }


@pytest.fixture
def ana_madrid_rock(perfil_ana, comarca, genero_rock):
    perfil_ana.comarca = comarca
    perfil_ana.save()
    PerfilGeneroMusical.objects.create(perfil=perfil_ana, genero=genero_rock)
    return perfil_ana


def ids(response):
    return [r['perfil_id'] for r in response.data['results']]


@pytest.mark.django_db
def test_requiere_login(api_client, mundo):
    assert api_client.get(URL, {'busco': 'musico'}).status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_cuenta_que_solo_es_un_local_tambien_tiene_match(api_client, mundo, comarca, genero_rock):
    """Una cuenta sin perfil personal usa su perfil de local como referencia."""
    sala = crear('miSala', tipo='local', comarca=comarca, generos=[genero_rock])
    api_client.force_authenticate(user=sala.usuario)
    response = api_client.get(URL, {'busco': 'musico'})
    assert response.status_code == status.HTTP_200_OK
    assert ids(response)[0] == mundo['musico_cerca_rock'].perfil_id
    assert sala.perfil_id not in ids(response)


@pytest.mark.django_db
def test_sin_perfil_personal_400(client_sin_perfil, mundo):
    response = client_sin_perfil.get(URL, {'busco': 'musico'})
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'perfil' in response.data['error'].lower()


@pytest.mark.django_db
@pytest.mark.parametrize('params', [{}, {'busco': 'novia'}, {'busco': 'musico', 'instrumento': 'x'}])
def test_parametros_invalidos_400(client_ana, ana_madrid_rock, params):
    response = client_ana.get(URL, params)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'error' in response.data


@pytest.mark.django_db
def test_busco_musico_ordena_por_cercania_y_estilo(client_ana, ana_madrid_rock, mundo):
    response = client_ana.get(URL, {'busco': 'musico'})
    assert response.status_code == status.HTTP_200_OK
    assert ids(response) == [
        mundo['musico_cerca_rock'].perfil_id,
        mundo['musico_cerca_jazz'].perfil_id,
        mundo['musico_lejos_rock'].perfil_id,
    ]


@pytest.mark.django_db
def test_busco_musico_devuelve_motivos(client_ana, ana_madrid_rock, mundo):
    primero = client_ana.get(URL, {'busco': 'musico'}).data['results'][0]
    assert primero['misma_comarca'] is True
    assert primero['zona'] == 'Madrid'
    assert primero['generos_comunes'] == ['Rock']
    assert primero['instrumentos'] == ['Batería']
    assert primero['tipo'] == 'usuario'


@pytest.mark.django_db
def test_busco_musico_filtra_por_instrumento(client_ana, ana_madrid_rock, mundo):
    response = client_ana.get(URL, {'busco': 'musico', 'instrumento': mundo['bateria'].instrumento_id})
    assert ids(response) == [mundo['musico_cerca_rock'].perfil_id, mundo['musico_lejos_rock'].perfil_id]


@pytest.mark.django_db
def test_busco_grupo(client_ana, ana_madrid_rock, mundo):
    response = client_ana.get(URL, {'busco': 'grupo'})
    assert ids(response) == [mundo['grupo_cerca'].perfil_id, mundo['grupo_lejos'].perfil_id]


@pytest.mark.django_db
def test_busco_ensayo_solo_locales_de_ensayo(client_ana, ana_madrid_rock, mundo):
    response = client_ana.get(URL, {'busco': 'ensayo'})
    assert ids(response) == [mundo['ensayo_cerca'].perfil_id]
    fila = response.data['results'][0]
    assert fila['zona'] == 'Getafe'
    assert fila['local']['tipos'] == ['ensayo']
    assert fila['generos_comunes'] == ['Rock']


@pytest.mark.django_db
def test_busco_tocar_locales_para_actuar_cerca_primero(client_ana, ana_madrid_rock, mundo):
    response = client_ana.get(URL, {'busco': 'tocar'})
    assert ids(response) == [mundo['sala_cerca'].perfil_id, mundo['sala_lejos'].perfil_id]


@pytest.mark.django_db
def test_nunca_sugiere_mis_propios_perfiles(client_ana, ana_madrid_rock, ana, comarca, mundo):
    mi_grupo = crear('migrupo', tipo='grupo', comarca=comarca, usuario=ana)
    response = client_ana.get(URL, {'busco': 'grupo'})
    assert mi_grupo.perfil_id not in ids(response)
    assert ana_madrid_rock.perfil_id not in ids(client_ana.get(URL, {'busco': 'musico'}))


@pytest.mark.django_db
def test_excluye_no_disponibles(client_ana, ana_madrid_rock, mundo):
    response = client_ana.get(URL, {'busco': 'musico'})
    assert mundo['musico_no_disponible'].perfil_id not in ids(response)


@pytest.mark.django_db
def test_no_consulta_id_de_pivotes(client_ana, ana_madrid_rock, mundo):
    """En la BD real las pivotes no tienen columna id."""
    from django.db import connection
    from django.test.utils import CaptureQueriesContext
    for busco in ('musico', 'grupo', 'ensayo', 'tocar'):
        with CaptureQueriesContext(connection) as ctx:
            assert client_ana.get(URL, {'busco': busco}).status_code == 200
        malas = [q['sql'] for q in ctx.captured_queries
                 if '"perfil_genero_musical"."id"' in q['sql'] or '"perfil_instrumento"."id"' in q['sql']]
        assert not malas, busco
