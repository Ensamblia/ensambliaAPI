from django.core.management.base import BaseCommand
from apps.usuarios.models import Usuario
from apps.perfiles.models import Perfil, PerfilChat
from apps.chats.models import Chat, Mensaje, MensajeLeido
from apps.anuncios.models import Anuncio, TipoAnuncio
from apps.catalogo.models import Comarca, Instrumento, GeneroMusical


class Command(BaseCommand):
    help = 'Crea datos de prueba para desarrollo'

    def handle(self, *args, **options):
        self.stdout.write("🧹 Limpiando datos previos...")
        MensajeLeido.objects.all().delete()
        Mensaje.objects.all().delete()
        PerfilChat.objects.all().delete()
        Chat.objects.all().delete()
        Anuncio.objects.all().delete()
        TipoAnuncio.objects.all().delete()
        Perfil.objects.all().delete()
        Usuario.objects.all().delete()
        Instrumento.objects.all().delete()
        GeneroMusical.objects.all().delete()
        Comarca.objects.all().delete()

        self.stdout.write("👤 Creando usuarios...")
        ana = Usuario.objects.create_user(nickname='ana', password='ana123')
        luis = Usuario.objects.create_user(nickname='luis', password='luis123')
        marta = Usuario.objects.create_user(nickname='marta', password='marta123')

        self.stdout.write("👥 Creando perfiles...")
        p_ana = Perfil.objects.create(
            nombre='Ana', apellido='García', correo='ana@test.com',
            descripcion='Cantante y compositora', usuario=ana, tipo='usuario',
        )
        p_luis = Perfil.objects.create(
            nombre='Luis', apellido='Flotu', correo='luis@test.com',
            descripcion='Guitarrista', usuario=luis, tipo='usuario',
        )
        p_marta = Perfil.objects.create(
            nombre='Marta', apellido='Ruiz', correo='marta@test.com',
            descripcion='Baterista', usuario=marta, tipo='usuario',
        )

        self.stdout.write("🎸 Creando catálogos...")
        Instrumento.objects.bulk_create([
            Instrumento(nombre='Guitarra'),
            Instrumento(nombre='Piano'),
            Instrumento(nombre='Batería'),
        ])
        GeneroMusical.objects.bulk_create([
            GeneroMusical(nombre='Rock'),
            GeneroMusical(nombre='Jazz'),
            GeneroMusical(nombre='Flamenco'),
        ])
        Comarca.objects.bulk_create([
            Comarca(nombre='Madrid'),
            Comarca(nombre='Barcelona'),
        ])

        self.stdout.write("📢 Creando tipos de anuncio...")
        tipo_busca = TipoAnuncio.objects.create(nombre='Busco músico')
        tipo_vende = TipoAnuncio.objects.create(nombre='Vendo instrumento')

        self.stdout.write("📝 Creando anuncios...")
        Anuncio.objects.create(
            titulo='Busco batería para grupo de rock',
            contenido='Grupo de rock alternativo en Madrid busca batería.',
            perfil=p_ana, tipo_anuncio=tipo_busca,
        )
        Anuncio.objects.create(
            titulo='Vendo guitarra eléctrica',
            contenido='Fender Stratocaster en perfecto estado. Madrid.',
            perfil=p_luis, tipo_anuncio=tipo_vende,
        )

        self.stdout.write("💬 Creando chats...")
        chat_al = Chat.objects.create()
        PerfilChat.objects.create(perfil=p_ana, chat=chat_al)
        PerfilChat.objects.create(perfil=p_luis, chat=chat_al)

        chat_lm = Chat.objects.create()
        PerfilChat.objects.create(perfil=p_luis, chat=chat_lm)
        PerfilChat.objects.create(perfil=p_marta, chat=chat_lm)

        self.stdout.write("✉️ Creando mensajes...")
        m1 = Mensaje.objects.create(chat=chat_al, perfil=p_ana, contenido='Hola Luis, ¿tocas la batería?')
        m2 = Mensaje.objects.create(chat=chat_al, perfil=p_luis, contenido='Hola Ana, no, la guitarra')
        m3 = Mensaje.objects.create(chat=chat_al, perfil=p_ana, contenido='Ah, ¿tocas en algún grupo?')
        m4 = Mensaje.objects.create(chat=chat_al, perfil=p_luis, contenido='Sí, en uno de rock alternativo')

        m5 = Mensaje.objects.create(chat=chat_lm, perfil=p_luis, contenido='Marta, ¿sigues con la batería?')
        m6 = Mensaje.objects.create(chat=chat_lm, perfil=p_marta, contenido='¡Sí! ¿Buscas batería?')

        self.stdout.write("👁️ Creando marcas de leído...")
        MensajeLeido.objects.create(mensaje=m2, perfil=p_ana)
        MensajeLeido.objects.create(mensaje=m4, perfil=p_ana)
        MensajeLeido.objects.create(mensaje=m1, perfil=p_luis)
        MensajeLeido.objects.create(mensaje=m3, perfil=p_luis)
        MensajeLeido.objects.create(mensaje=m6, perfil=p_luis)

        self.stdout.write(self.style.SUCCESS("\n✅ DATOS DE PRUEBA CREADOS:"))
        self.stdout.write(f"   - 3 usuarios: ana, luis, marta")
        self.stdout.write(f"   - 3 perfiles: {p_ana.perfil_id}, {p_luis.perfil_id}, {p_marta.perfil_id}")
        self.stdout.write(f"   - 2 chats: {chat_al.chat_id} (Ana↔Luis), {chat_lm.chat_id} (Luis↔Marta)")
        self.stdout.write(f"   - 6 mensajes")
        self.stdout.write(f"   - 5 marcas de leído")
        self.stdout.write("")
        self.stdout.write("🔑 CREDENCIALES:")
        self.stdout.write(f"   - ana / ana123     (perfil_id={p_ana.perfil_id})")
        self.stdout.write(f"   - luis / luis123   (perfil_id={p_luis.perfil_id})")
        self.stdout.write(f"   - marta / marta123 (perfil_id={p_marta.perfil_id})")
        self.stdout.write("")
        self.stdout.write("🆔 IDs importantes:")
        self.stdout.write(f"   - Chat A (Ana↔Luis): chat_id={chat_al.chat_id}")
        self.stdout.write(f"   - Chat B (Luis↔Marta): chat_id={chat_lm.chat_id}")
        self.stdout.write(f"   - perfil Ana: {p_ana.perfil_id}")
        self.stdout.write(f"   - perfil Luis: {p_luis.perfil_id}")
        self.stdout.write(f"   - perfil Marta: {p_marta.perfil_id}")