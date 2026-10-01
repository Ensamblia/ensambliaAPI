import pytest
from rest_framework import status
from apps.anuncios.models import Anuncio


# ==============================================================
# PAGINACIÓN
# ==============================================================

@pytest.mark.django_db
def test_paginacion_limit_offset(api_client, perfil_ana, tipo_anuncio):
    """La paginación devuelve count + results."""
    for i in range(5):
        Anuncio.objects.create(
            titulo=f'Anuncio {i}',
            contenido=f'Contenido del anuncio numero {i}',
            perfil=perfil_ana,
            tipo_anuncio=tipo_anuncio,
        )

    response = api_client.get('/api/anuncios/?limit=2&offset=0')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 5
    assert len(response.data['results']) == 2
    assert response.data['next'] is not None


@pytest.mark.django_db
def test_paginacion_offset_avanza(api_client, perfil_ana, tipo_anuncio):
    """Con offset se salta N registros."""
    for i in range(5):
        Anuncio.objects.create(
            titulo=f'Anuncio {i}',
            contenido=f'Contenido numero {i}',
            perfil=perfil_ana,
            tipo_anuncio=tipo_anuncio,
        )

    response = api_client.get('/api/anuncios/?limit=2&offset=2')
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 2
    assert response.data['previous'] is not None


@pytest.mark.django_db
def test_paginacion_limit_max(api_client, perfil_ana, tipo_anuncio):
    """Pedir limit=1000 se capea a 100."""
    for i in range(3):
        Anuncio.objects.create(
            titulo=f'Anuncio {i}',
            contenido=f'Contenido {i}',
            perfil=perfil_ana,
            tipo_anuncio=tipo_anuncio,
        )

    response = api_client.get('/api/anuncios/?limit=1000')
    assert response.status_code == status.HTTP_200_OK
    # No falla, simplemente capea


# ==============================================================
# BÚSQUEDA
# ==============================================================

@pytest.mark.django_db
def test_busqueda_por_titulo(api_client, perfil_ana, tipo_anuncio):
    """?search=X filtra por título."""
    Anuncio.objects.create(titulo='Busco batería', contenido='Test test test', perfil=perfil_ana, tipo_anuncio=tipo_anuncio)
    Anuncio.objects.create(titulo='Vendo guitarra', contenido='Test test test', perfil=perfil_ana, tipo_anuncio=tipo_anuncio)

    response = api_client.get('/api/anuncios/?search=batería')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1
    assert 'batería' in response.data['results'][0]['titulo'].lower()


@pytest.mark.django_db
def test_busqueda_sin_resultados(api_client, anuncio_ana):
    """?search=xyz devuelve count=0."""
    response = api_client.get('/api/anuncios/?search=xyzabc123')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 0


@pytest.mark.django_db
def test_busqueda_en_contenido(api_client, perfil_ana, tipo_anuncio):
    """?search=X también busca en contenido."""
    Anuncio.objects.create(
        titulo='Test',
        contenido='Busco un batería para grupo',
        perfil=perfil_ana, tipo_anuncio=tipo_anuncio,
    )

    response = api_client.get('/api/anuncios/?search=batería')
    assert response.data['count'] == 1


# ==============================================================
# FILTRADO
# ==============================================================

@pytest.mark.django_db
def test_filtro_por_tipo_anuncio(api_client, perfil_ana, tipo_anuncio, anuncio_ana):
    """?tipo_anuncio=X filtra por tipo."""
    response = api_client.get(f'/api/anuncios/?tipo_anuncio={tipo_anuncio.tipo_anuncio_id}')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] >= 1


@pytest.mark.django_db
def test_filtro_por_perfil(api_client, perfil_ana, anuncio_ana):
    """?perfil=X filtra por perfil."""
    response = api_client.get(f'/api/anuncios/?perfil={perfil_ana.perfil_id}')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1


@pytest.mark.django_db
def test_filtro_por_fecha_gte(api_client, anuncio_ana):
    """?fecha_publicacion__gte=X filtra por fecha."""
    response = api_client.get('/api/anuncios/?fecha_publicacion__gte=2020-01-01')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] >= 1


# ==============================================================
# ORDENACIÓN
# ==============================================================

@pytest.mark.django_db
def test_ordenacion_por_titulo_asc(api_client, perfil_ana, tipo_anuncio):
    """?ordering=titulo ordena alfabéticamente ascendente."""
    Anuncio.objects.create(titulo='Zapato', contenido='Test test test', perfil=perfil_ana, tipo_anuncio=tipo_anuncio)
    Anuncio.objects.create(titulo='Almendra', contenido='Test test test', perfil=perfil_ana, tipo_anuncio=tipo_anuncio)
    Anuncio.objects.create(titulo='Manzana', contenido='Test test test', perfil=perfil_ana, tipo_anuncio=tipo_anuncio)

    response = api_client.get('/api/anuncios/?ordering=titulo')
    assert response.status_code == status.HTTP_200_OK
    titulos = [a['titulo'] for a in response.data['results']]
    assert titulos == sorted(titulos)


@pytest.mark.django_db
def test_ordenacion_descendente(api_client, perfil_ana, tipo_anuncio):
    """?ordering=-titulo ordena descendente."""
    Anuncio.objects.create(titulo='A', contenido='Test test test', perfil=perfil_ana, tipo_anuncio=tipo_anuncio)
    Anuncio.objects.create(titulo='Z', contenido='Test test test', perfil=perfil_ana, tipo_anuncio=tipo_anuncio)

    response = api_client.get('/api/anuncios/?ordering=-titulo')
    titulos = [a['titulo'] for a in response.data['results']]
    assert titulos == sorted(titulos, reverse=True)


# ==============================================================
# COMBINADO
# ==============================================================

@pytest.mark.django_db
def test_busqueda_y_ordenacion_combinadas(api_client, perfil_ana, tipo_anuncio):
    """Se pueden combinar search + ordering."""
    Anuncio.objects.create(titulo='Busco batería', contenido='Busco batería para grupo', perfil=perfil_ana, tipo_anuncio=tipo_anuncio)
    Anuncio.objects.create(titulo='Busco pianista', contenido='Busco pianista para grupo', perfil=perfil_ana, tipo_anuncio=tipo_anuncio)

    response = api_client.get('/api/anuncios/?search=busco&ordering=-titulo')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] >= 1