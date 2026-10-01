import pytest
from rest_framework import status
from apps.perfiles.models import (
    PerfilChat, PerfilGeneroMusical, PerfilGrupo, PerfilInstrumento,
)


# ==============================================================
# PERFIL - INSTRUMENTO (N:M)
# ==============================================================

@pytest.mark.django_db
def test_perfil_puede_tener_varios_instrumentos(
    client_ana, perfil_ana, instrumento_guitarra, instrumento_piano,
):
    """Un perfil puede tener N instrumentos."""
    r1 = client_ana.post('/api/perfil-instrumentos/', {
        'perfil_id': perfil_ana.perfil_id,
        'instrumento_id': instrumento_guitarra.instrumento_id,
    })
    assert r1.status_code == status.HTTP_201_CREATED

    r2 = client_ana.post('/api/perfil-instrumentos/', {
        'perfil_id': perfil_ana.perfil_id,
        'instrumento_id': instrumento_piano.instrumento_id,
    })
    assert r2.status_code == status.HTTP_201_CREATED

    # Verificar
    assert PerfilInstrumento.objects.filter(perfil=perfil_ana).count() == 2


@pytest.mark.django_db
def test_perfil_instrumento_duplicado_falla(
    client_ana, perfil_ana, instrumento_guitarra,
):
    """No se puede añadir el mismo instrumento 2 veces."""
    PerfilInstrumento.objects.create(perfil=perfil_ana, instrumento=instrumento_guitarra)

    # get_or_create no debería fallar (idempotente)
    r = client_ana.post('/api/perfil-instrumentos/', {
        'perfil_id': perfil_ana.perfil_id,
        'instrumento_id': instrumento_guitarra.instrumento_id,
    })
    assert r.status_code == status.HTTP_201_CREATED
    assert PerfilInstrumento.objects.filter(perfil=perfil_ana).count() == 1


@pytest.mark.django_db
def test_no_puedo_añadir_instrumento_a_perfil_ajeno(
    client_ana, perfil_luis, instrumento_guitarra,
):
    """No puedo añadir instrumento al perfil de otro."""
    r = client_ana.post('/api/perfil-instrumentos/', {
        'perfil_id': perfil_luis.perfil_id,
        'instrumento_id': instrumento_guitarra.instrumento_id,
    })
    assert r.status_code == status.HTTP_403_FORBIDDEN


# ==============================================================
# PERFIL - GÉNERO (N:M)
# ==============================================================

@pytest.mark.django_db
def test_perfil_puede_tener_varios_generos(
    client_ana, perfil_ana, genero_rock, genero_jazz,
):
    """Un perfil puede tener N géneros."""
    r1 = client_ana.post('/api/perfil-genero-musicales/', {
        'perfil_id': perfil_ana.perfil_id,
        'genero_id': genero_rock.genero_musical_id,
    })
    assert r1.status_code == status.HTTP_201_CREATED

    r2 = client_ana.post('/api/perfil-genero-musicales/', {
        'perfil_id': perfil_ana.perfil_id,
        'genero_id': genero_jazz.genero_musical_id,
    })
    assert r2.status_code == status.HTTP_201_CREATED

    assert PerfilGeneroMusical.objects.filter(perfil=perfil_ana).count() == 2


@pytest.mark.django_db
def test_no_puedo_añadir_genero_a_perfil_ajeno(
    client_ana, perfil_luis, genero_rock,
):
    r = client_ana.post('/api/perfil-genero-musicales/', {
        'perfil_id': perfil_luis.perfil_id,
        'genero_id': genero_rock.genero_musical_id,
    })
    assert r.status_code == status.HTTP_403_FORBIDDEN


# ==============================================================
# PERFIL - GRUPO (N:M)
# ==============================================================

@pytest.mark.django_db
def test_perfil_puede_pertenecer_a_varios_grupos(
    client_ana, perfil_ana, db,
):
    """Un perfil puede estar en N grupos."""
    from apps.catalogo.models import Grupo
    g1 = Grupo.objects.create(nombre='Rockers')
    g2 = Grupo.objects.create(nombre='Jazzys')

    r1 = client_ana.post('/api/perfil-grupos/', {
        'perfil_id': perfil_ana.perfil_id,
        'grupo_id': g1.grupo_id,
    })
    assert r1.status_code == status.HTTP_201_CREATED

    r2 = client_ana.post('/api/perfil-grupos/', {
        'perfil_id': perfil_ana.perfil_id,
        'grupo_id': g2.grupo_id,
    })
    assert r2.status_code == status.HTTP_201_CREATED

    assert PerfilGrupo.objects.filter(perfil=perfil_ana).count() == 2


# ==============================================================
# PERFIL - CHAT (N:M)
# ==============================================================

@pytest.mark.django_db
def test_perfil_puede_participar_en_varios_chats(
    client_ana, perfil_ana, perfil_luis, perfil_marta,
):
    """Un perfil puede estar en N chats."""
    from apps.chats.models import Chat
    c1 = Chat.objects.create()
    c2 = Chat.objects.create()

    r1 = client_ana.post('/api/perfil-chats/', {
        'perfil_id': perfil_ana.perfil_id,
        'chat_id': c1.chat_id,
    })
    assert r1.status_code == status.HTTP_201_CREATED

    r2 = client_ana.post('/api/perfil-chats/', {
        'perfil_id': perfil_ana.perfil_id,
        'chat_id': c2.chat_id,
    })
    assert r2.status_code == status.HTTP_201_CREATED

    assert PerfilChat.objects.filter(perfil=perfil_ana).count() == 2


@pytest.mark.django_db
def test_no_puedo_añadirme_2_veces_al_mismo_chat(
    client_ana, perfil_ana, chat_ana_luis,
):
    """No se duplica la relación perfil-chat."""
    # El chat ya tiene a Ana (por el fixture)
    r = client_ana.post('/api/perfil-chats/', {
        'perfil_id': perfil_ana.perfil_id,
        'chat_id': chat_ana_luis.chat_id,
    })
    assert r.status_code == status.HTTP_201_CREATED
    # Sigue habiendo solo 1 relación Ana-Chat
    assert PerfilChat.objects.filter(
        perfil=perfil_ana, chat=chat_ana_luis
    ).count() == 1


# ==============================================================
# GRUPO - GÉNERO (N:M)
# ==============================================================

@pytest.mark.django_db
def test_grupo_puede_tener_varios_generos(
    client_admin, db, genero_rock, genero_jazz,
):
    """Un grupo puede tener N géneros."""
    from apps.catalogo.models import Grupo, GrupoGenero
    g = Grupo.objects.create(nombre='Test')

    r1 = client_admin.post('/api/grupo-generos/', {
        'grupo_id': g.grupo_id,
        'genero_id': genero_rock.genero_musical_id,
    })
    assert r1.status_code == status.HTTP_201_CREATED

    r2 = client_admin.post('/api/grupo-generos/', {
        'grupo_id': g.grupo_id,
        'genero_id': genero_jazz.genero_musical_id,
    })
    assert r2.status_code == status.HTTP_201_CREATED

    assert GrupoGenero.objects.filter(grupo=g).count() == 2


# ==============================================================
# BORRAR RELACIONES
# ==============================================================

@pytest.mark.django_db
def test_borrar_mi_perfil_instrumento(
    client_ana, perfil_ana, instrumento_guitarra,
):
    """Puedo borrar una relación mía."""
    PerfilInstrumento.objects.create(perfil=perfil_ana, instrumento=instrumento_guitarra)

    r = client_ana.delete(
        f'/api/perfil-instrumentos/{perfil_ana.perfil_id}/{instrumento_guitarra.instrumento_id}/'
    )
    assert r.status_code == status.HTTP_200_OK
    assert PerfilInstrumento.objects.filter(perfil=perfil_ana).count() == 0


@pytest.mark.django_db
def test_no_borrar_perfil_instrumento_ajeno(
    client_ana, perfil_luis, instrumento_guitarra,
):
    """No puedo borrar relación de otro."""
    PerfilInstrumento.objects.create(perfil=perfil_luis, instrumento=instrumento_guitarra)

    r = client_ana.delete(
        f'/api/perfil-instrumentos/{perfil_luis.perfil_id}/{instrumento_guitarra.instrumento_id}/'
    )
    assert r.status_code == status.HTTP_403_FORBIDDEN
    assert PerfilInstrumento.objects.filter(perfil=perfil_luis).count() == 1