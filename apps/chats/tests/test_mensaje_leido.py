import pytest
from rest_framework import status
from apps.chats.models import Mensaje, MensajeLeido


# ==============================================================
# CREAR (marcar como leído)
# ==============================================================

@pytest.mark.django_db
def test_marcar_leido_ok(client_ana, chat_ana_luis, perfil_ana, perfil_luis):
    """Ana marca como leído un mensaje de Luis."""
    m = Mensaje.objects.create(chat=chat_ana_luis, perfil=perfil_luis, contenido='Hola')
    response = client_ana.post('/api/mensaje-leidos/', {
        'mensaje_id': m.mensaje_id,
    })
    assert response.status_code == status.HTTP_201_CREATED
    assert MensajeLeido.objects.filter(mensaje=m, perfil=perfil_ana).exists()


@pytest.mark.django_db
def test_marcar_leido_sin_auth(api_client, chat_ana_luis, perfil_luis):
    """Sin token no se puede marcar como leído."""
    m = Mensaje.objects.create(chat=chat_ana_luis, perfil=perfil_luis, contenido='Hola')
    response = api_client.post('/api/mensaje-leidos/', {'mensaje_id': m.mensaje_id})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_marcar_leido_mensaje_ajeno(client_ana, chat_luis_marta, perfil_luis):
    """Ana no puede marcar como leído un mensaje de un chat ajeno."""
    m = Mensaje.objects.create(chat=chat_luis_marta, perfil=perfil_luis, contenido='Hola')
    response = client_ana.post('/api/mensaje-leidos/', {'mensaje_id': m.mensaje_id})
    assert response.status_code == status.HTTP_403_FORBIDDEN


# ==============================================================
# LISTAR (privacidad)
# ==============================================================

@pytest.mark.django_db
def test_listar_leidos_solo_de_mis_chats(
    client_ana, chat_ana_luis, chat_luis_marta,
    perfil_ana, perfil_luis, perfil_marta,
):
    """Ana solo ve los leídos de sus chats."""
    m1 = Mensaje.objects.create(chat=chat_ana_luis, perfil=perfil_luis, contenido='Hola')
    m2 = Mensaje.objects.create(chat=chat_luis_marta, perfil=perfil_luis, contenido='Hola M')
    MensajeLeido.objects.create(mensaje=m1, perfil=perfil_ana)
    MensajeLeido.objects.create(mensaje=m2, perfil=perfil_marta)

    response = client_ana.get('/api/mensaje-leidos/')
    assert response.status_code == status.HTTP_200_OK
    # Ana ve solo el suyo
    ids = [item['mensaje_id'] for item in response.data]
    assert m1.mensaje_id in ids
    assert m2.mensaje_id not in ids


# ==============================================================
# BORRAR (privacidad)
# ==============================================================

@pytest.mark.django_db
def test_borrar_mi_marca_leido(client_ana, chat_ana_luis, perfil_ana, perfil_luis):
    """Ana puede borrar su propia marca de leído."""
    m = Mensaje.objects.create(chat=chat_ana_luis, perfil=perfil_luis, contenido='Hola')
    MensajeLeido.objects.create(mensaje=m, perfil=perfil_ana)

    response = client_ana.delete(f'/api/mensaje-leidos/{m.mensaje_id}/{perfil_ana.perfil_id}/')
    assert response.status_code == status.HTTP_200_OK
    assert not MensajeLeido.objects.filter(mensaje=m, perfil=perfil_ana).exists()


@pytest.mark.django_db
def test_no_borrar_marca_leido_ajena(client_ana, chat_ana_luis, perfil_luis):
    """Ana no puede borrar la marca de leído de otro."""
    m = Mensaje.objects.create(chat=chat_ana_luis, perfil=perfil_luis, contenido='Hola')
    MensajeLeido.objects.create(mensaje=m, perfil=perfil_luis)

    response = client_ana.delete(f'/api/mensaje-leidos/{m.mensaje_id}/{perfil_luis.perfil_id}/')
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert MensajeLeido.objects.filter(mensaje=m, perfil=perfil_luis).exists()