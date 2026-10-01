import pytest
from rest_framework.test import APIClient


# ==============================================================
# CLIENTES (API client para distintos usuarios)
# ==============================================================

@pytest.fixture
def api_client():
    """Cliente API sin autenticar."""
    return APIClient()


@pytest.fixture
def client_ana(api_client, ana):
    """Cliente API autenticado como Ana."""
    api_client.force_authenticate(user=ana)
    return api_client


@pytest.fixture
def client_luis(api_client, luis):
    """Cliente API autenticado como Luis."""
    api_client.force_authenticate(user=luis)
    return api_client


@pytest.fixture
def client_marta(api_client, marta):
    """Cliente API autenticado como Marta."""
    api_client.force_authenticate(user=marta)
    return api_client


@pytest.fixture
def client_admin(api_client, admin):
    """Cliente API autenticado como admin."""
    api_client.force_authenticate(user=admin)
    return api_client


# ==============================================================
# USUARIOS
# ==============================================================

@pytest.fixture
def ana(db):
    """Usuario Ana."""
    from apps.usuarios.models import Usuario
    return Usuario.objects.create_user(nickname='ana', password='ana123')


@pytest.fixture
def luis(db):
    """Usuario Luis."""
    from apps.usuarios.models import Usuario
    return Usuario.objects.create_user(nickname='luis', password='luis123')


@pytest.fixture
def marta(db):
    """Usuario Marta."""
    from apps.usuarios.models import Usuario
    return Usuario.objects.create_user(nickname='marta', password='marta123')


@pytest.fixture
def admin(db):
    """Usuario admin (is_staff=True)."""
    from apps.usuarios.models import Usuario
    return Usuario.objects.create_user(
        nickname='admin', password='admin123', is_staff=True
    )


# ==============================================================
# PERFILES
# ==============================================================

@pytest.fixture
def perfil_ana(db, ana):
    """Perfil de Ana."""
    from apps.perfiles.models import Perfil
    return Perfil.objects.create(
        nombre='Ana', apellido='Garcia', correo='ana@test.com',
        descripcion='Cantante', usuario=ana, tipo='usuario',
    )


@pytest.fixture
def perfil_luis(db, luis):
    """Perfil de Luis."""
    from apps.perfiles.models import Perfil
    return Perfil.objects.create(
        nombre='Luis', apellido='Flotu', correo='luis@test.com',
        descripcion='Guitarrista', usuario=luis, tipo='usuario',
    )


@pytest.fixture
def perfil_marta(db, marta):
    """Perfil de Marta."""
    from apps.perfiles.models import Perfil
    return Perfil.objects.create(
        nombre='Marta', apellido='Ruiz', correo='marta@test.com',
        descripcion='Baterista', usuario=marta, tipo='usuario',
    )


# ==============================================================
# CATÁLOGOS
# ==============================================================

@pytest.fixture
def comarca(db):
    from apps.catalogo.models import Comarca
    return Comarca.objects.create(nombre='Madrid')


@pytest.fixture
def instrumento_guitarra(db):
    from apps.catalogo.models import Instrumento
    return Instrumento.objects.create(nombre='Guitarra')


@pytest.fixture
def instrumento_piano(db):
    from apps.catalogo.models import Instrumento
    return Instrumento.objects.create(nombre='Piano')


@pytest.fixture
def genero_rock(db):
    from apps.catalogo.models import GeneroMusical
    return GeneroMusical.objects.create(nombre='Rock')


@pytest.fixture
def genero_jazz(db):
    from apps.catalogo.models import GeneroMusical
    return GeneroMusical.objects.create(nombre='Jazz')


@pytest.fixture
def tipo_anuncio(db):
    from apps.anuncios.models import TipoAnuncio
    return TipoAnuncio.objects.create(nombre='Busco musico')


@pytest.fixture
def tipo_archivo(db):
    from apps.catalogo.models import TipoArchivo
    return TipoArchivo.objects.create(
        nombre='jpg', extension='.jpg', mime_type='image/jpeg'
    )


# ==============================================================
# ANUNCIOS
# ==============================================================

@pytest.fixture
def anuncio_ana(db, perfil_ana, tipo_anuncio):
    """Anuncio publicado por Ana."""
    from apps.anuncios.models import Anuncio
    return Anuncio.objects.create(
        titulo='Busco bateria',
        contenido='Grupo de rock busca bateria en Madrid.',
        perfil=perfil_ana,
        tipo_anuncio=tipo_anuncio,
    )


@pytest.fixture
def anuncio_luis(db, perfil_luis, tipo_anuncio):
    """Anuncio publicado por Luis."""
    from apps.anuncios.models import Anuncio
    return Anuncio.objects.create(
        titulo='Vendo guitarra',
        contenido='Fender Stratocaster en buen estado.',
        perfil=perfil_luis,
        tipo_anuncio=tipo_anuncio,
    )


# ==============================================================
# CHATS
# ==============================================================

@pytest.fixture
def chat_ana_luis(db, perfil_ana, perfil_luis):
    """Chat entre Ana y Luis."""
    from apps.chats.models import Chat
    from apps.perfiles.models import PerfilChat
    chat = Chat.objects.create()
    PerfilChat.objects.create(perfil=perfil_ana, chat=chat)
    PerfilChat.objects.create(perfil=perfil_luis, chat=chat)
    return chat


@pytest.fixture
def chat_luis_marta(db, perfil_luis, perfil_marta):
    """Chat entre Luis y Marta."""
    from apps.chats.models import Chat
    from apps.perfiles.models import PerfilChat
    chat = Chat.objects.create()
    PerfilChat.objects.create(perfil=perfil_luis, chat=chat)
    PerfilChat.objects.create(perfil=perfil_marta, chat=chat)
    return chat


@pytest.fixture
def mensaje_en_chat_al(db, chat_ana_luis, perfil_ana):
    """Mensaje en el chat Ana-Luis, escrito por Ana."""
    from apps.chats.models import Mensaje
    return Mensaje.objects.create(
        chat=chat_ana_luis,
        perfil=perfil_ana,
        contenido='Hola Luis',
    )

@pytest.fixture
def usuario_sin_perfil(db):
    """Usuario autenticado pero SIN perfil."""
    from apps.usuarios.models import Usuario
    return Usuario.objects.create_user(nickname='sin_perfil', password='sin123')

@pytest.fixture
def client_sin_perfil(api_client, usuario_sin_perfil):
    api_client.force_authenticate(user=usuario_sin_perfil)
    return api_client