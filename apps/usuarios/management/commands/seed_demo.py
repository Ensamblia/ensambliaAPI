from datetime import timedelta

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from apps.anuncios.models import Anuncio, TipoAnuncio
from apps.catalogo.models import Ciudad, GeneroMusical, Instrumento
from apps.eventos.models import Evento
from apps.locales.models import Local
from apps.matching.models import BusquedaAnuncio
from apps.perfiles.models import Perfil, PerfilGeneroMusical, PerfilInstrumento
from apps.usuarios.models import Usuario

# (nickname, tipo, nombre, apellido, descripción, ciudad, géneros, instrumentos)
PERFILES = [
    ('laia.bateria', 'usuario', 'Laia', 'Puig', 'Batería con 10 años de directo. Busco banda de rock o indie para tocar en salas.',
     'Sabadell', ['Rock', 'Indie', 'Punk'], ['Batería']),
    ('pau.guitarra', 'usuario', 'Pau', 'Serra', 'Guitarrista y compositor. Me muevo entre el blues y el soul.',
     'Barcelona', ['Blues', 'Soul / Funk', 'Rock'], ['Guitarra eléctrica', 'Guitarra acústica']),
    ('nuria.voz', 'usuario', 'Núria', 'Vidal', 'Cantante de jazz y bossa. Disponible para jams y bolos en bares.',
     'Girona', ['Jazz', 'Latina', 'Soul / Funk'], ['Voz', 'Piano']),
    ('marc.bajo', 'usuario', 'Marc', 'Ferrer', 'Bajista de funk y rumba. Toco con quien tenga ganas de groove.',
     'Badalona', ['Soul / Funk', 'Rumba catalana', 'Reggae'], ['Bajo', 'Contrabajo']),
    ('elsquatre', 'grupo', 'Els Quatre Vents', '', 'Grupo de folk-rock en catalán. Buscamos violín y fechas para presentar el disco.',
     'Vic', ['Folk', 'Rock'], []),
]

# (nickname, nombre, descripción, ciudad, dirección, aforo, tipos, géneros)
LOCALES = [
    ('salaraval', 'Sala Raval', 'Sala de conciertos con escenario y equipo propio. Programamos bandas emergentes.',
     'Barcelona', 'Carrer de la Riera Alta, 12', 250, ['sala', 'bar'], ['Rock', 'Indie', 'Punk']),
    ('assaigterrassa', 'Assaig Terrassa', 'Cuatro locales de ensayo insonorizados con backline. Por horas o mensual.',
     'Terrassa', 'Carrer de la Font Vella, 40', 15, ['ensayo'], ['Rock', 'Metal', 'Pop']),
    ('jazzgirona', 'Jazz Cava Girona', 'Bar de jazz con jam session los jueves y conciertos los sábados.',
     'Girona', 'Carrer de la Força, 8', 80, ['bar'], ['Jazz', 'Blues', 'Latina']),
]

# (autor, tipo de anuncio, título, contenido, busca tipo_perfil, instrumento, géneros)
ANUNCIOS = [
    ('elsquatre', 'Busco músico', 'Buscamos violinista para folk-rock en catalán',
     'Ensayamos en Vic los martes. Tenemos disco grabado y fechas en verano.', 'usuario', 'Violín', ['Folk', 'Rock']),
    ('pau.guitarra', 'Busco músico', 'Busco batería para trío de blues',
     'Repertorio propio y algunas versiones. Zona Barcelona y Vallès.', 'usuario', 'Batería', ['Blues', 'Rock']),
    ('nuria.voz', 'Busco grupo', 'Cantante busca combo de jazz',
     'Me gustaría formar un cuarteto estable para bolos en bares de Girona.', 'grupo', None, ['Jazz']),
    ('salaraval', 'Bolo / concierto', 'Fechas libres en noviembre para bandas emergentes',
     'Ofrecemos taquilla y equipo. Mandad enlace a vuestra música.', 'grupo', None, ['Rock', 'Indie']),
    ('assaigterrassa', 'Ofrezco local', 'Local de ensayo libre los miércoles por la tarde',
     'Local de 20 m² con batería, amplis y PA. Precio por hora o mes.', None, None, []),
]

# (organizador, local, título, días desde hoy, hora, precio, géneros)
EVENTOS = [
    ('salaraval', 'salaraval', 'Noche de bandas emergentes', 7, 21, '8 €', ['Rock', 'Indie']),
    ('jazzgirona', 'jazzgirona', 'Jam session de jazz', 6, 20, 'Gratis', ['Jazz']),
    ('elsquatre', None, 'Presentación del disco de Els Quatre Vents', 15, 19, '10 €', ['Folk']),
    ('jazzgirona', 'jazzgirona', 'Concierto: Núria Vidal Quartet', 22, 21, '12 €', ['Jazz', 'Latina']),
]


class Command(BaseCommand):
    help = 'Añade datos de demo (perfiles, locales, anuncios y eventos). No borra nada y se puede repetir.'

    def add_arguments(self, parser):
        parser.add_argument('--password', default='demo1234', help='Contraseña de las cuentas de demo')

    @transaction.atomic
    def handle(self, *args, **options):
        if not GeneroMusical.objects.exists() or not TipoAnuncio.objects.exists():
            raise CommandError('Faltan catálogos: ejecuta antes `python manage.py migrate`.')
        self.password = options['password']
        perfiles = {}

        for nick, tipo, nombre, apellido, desc, ciudad, generos, instrumentos in PERFILES:
            perfiles[nick] = self.perfil(nick, tipo, nombre, apellido, desc, self.ciudad(ciudad).comarca, generos, instrumentos)

        for nick, nombre, desc, ciudad, direccion, aforo, tipos, generos in LOCALES:
            c = self.ciudad(ciudad)
            perfil = self.perfil(nick, 'local', nombre, '', desc, c.comarca, generos, [])
            Local.objects.get_or_create(
                perfil=perfil, defaults={'ciudad': c, 'direccion': direccion, 'aforo': aforo, 'tipos': tipos},
            )
            perfiles[nick] = perfil

        for autor, tipo, titulo, contenido, tipo_perfil, instrumento, generos in ANUNCIOS:
            anuncio, creado = Anuncio.objects.get_or_create(
                perfil=perfiles[autor], titulo=titulo,
                defaults={'contenido': contenido, 'tipo_anuncio': TipoAnuncio.objects.get(nombre=tipo)},
            )
            if creado:
                BusquedaAnuncio.objects.create(
                    anuncio=anuncio, tipo_perfil=tipo_perfil,
                    instrumento=Instrumento.objects.get(nombre=instrumento) if instrumento else None,
                    generos=self.ids_generos(generos),
                )

        hoy = timezone.localtime().replace(minute=0, second=0, microsecond=0)
        for org, local, titulo, dias, hora, precio, generos in EVENTOS:
            sede = perfiles[local] if local else None
            Evento.objects.get_or_create(
                perfil=perfiles[org], titulo=titulo,
                defaults={
                    'fecha_inicio': (hoy + timedelta(days=dias)).replace(hour=hora),
                    'ciudad': sede.local.ciudad if sede else perfiles[org].comarca.ciudades.first(),
                    'local': sede, 'precio': precio, 'generos': self.ids_generos(generos),
                    'descripcion': f'{titulo}. Organiza {perfiles[org].nombre}.',
                },
            )

        self.stdout.write(self.style.SUCCESS(
            f'Datos de demo listos: {len(perfiles)} perfiles, {len(ANUNCIOS)} anuncios, {len(EVENTOS)} eventos.'
        ))
        self.stdout.write(f'Cuentas: {", ".join(perfiles)} (contraseña: la indicada en --password)')

    def ciudad(self, nombre):
        try:
            return Ciudad.objects.select_related('comarca').get(nombre=nombre)
        except Ciudad.DoesNotExist:
            raise CommandError(f'No existe la ciudad {nombre}: ejecuta antes `python manage.py migrate`.')

    def ids_generos(self, nombres):
        return list(GeneroMusical.objects.filter(nombre__in=nombres).values_list('genero_musical_id', flat=True))

    def perfil(self, nick, tipo, nombre, apellido, desc, comarca, generos, instrumentos):
        usuario = Usuario.objects.filter(nickname=nick).first()
        if not usuario:
            usuario = Usuario.objects.create_user(nickname=nick, password=self.password)
        perfil, creado = Perfil.objects.get_or_create(
            usuario=usuario, tipo=tipo,
            defaults={
                'nombre': nombre, 'apellido': apellido, 'descripcion': desc, 'comarca': comarca,
                'correo': f'{nick}@demo.ensamblia.test',
            },
        )
        if creado:
            for g in GeneroMusical.objects.filter(nombre__in=generos):
                PerfilGeneroMusical.objects.create(perfil=perfil, genero=g)
            for i in Instrumento.objects.filter(nombre__in=instrumentos):
                PerfilInstrumento.objects.create(perfil=perfil, instrumento=i)
        return perfil
